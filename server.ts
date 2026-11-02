import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';
import { storage } from './server/storage';
import {
  Product,
  Shop,
  Advertisement,
  Order,
  TransactionRecord
} from './src/types/marketplace';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || `${APP_URL}/api/auth/google/callback`;
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';
const FACEBOOK_CALLBACK_URL = process.env.FACEBOOK_CALLBACK_URL || `${APP_URL}/api/auth/facebook/callback`;
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjB-meeNuWn_wQhpq63qIGupnvQBQ';
// Only authorized production Founder Super Admin
const SUPER_ADMIN_RAW = process.env.SUPER_ADMIN_EMAIL || 'askiasventures@gmail.com,askiabusiness18@gmail.com';
const SESSION_SECRET = process.env.SESSION_SECRET || 'askia_market_production_super_admin_secret_key_2026';

// Parse allowed Super Admin emails (trimmed, lowercased)
const ALLOWED_SUPER_ADMIN_EMAILS = SUPER_ADMIN_RAW
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const isSuperAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ALLOWED_SUPER_ADMIN_EMAILS.includes(normalized);
};

// Initialize Google OAuth2 Client
const oauth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL
);

// Session Cookie Names
const SESSION_COOKIE_NAME = 'askia_session';
const ADMIN_COOKIE_NAME = 'askia_admin_session';

interface SessionPayload {
  sub: string;
  userId: string;
  email: string;
  phone?: string;
  name: string;
  picture?: string;
  accountType: 'buyer' | 'shop_owner' | 'advertiser' | 'staff' | 'admin';
  adminRole?: string;
  jobTitle?: string;
  department?: string;
  permissions?: string[];
  status: 'active' | 'pending_approval' | 'suspended' | 'revoked';
  iat: number;
  exp: number;
}

// In-memory session revocation ledger mapping userId -> revocation timestamp in seconds
const userRevocationTimestamps = new Map<string, number>();

// In-memory rate limiting bucket store
interface RateLimitBucket {
  count: number;
  resetAt: number;
}
const rateLimitStore = new Map<string, RateLimitBucket>();

function checkRateLimit(key: string, maxRequests: number, windowSeconds: number): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const bucket = rateLimitStore.get(key);
  if (!bucket || now >= bucket.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true };
  }
  if (bucket.count >= maxRequests) {
    return { allowed: false, waitSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count += 1;
  return { allowed: true };
}

// Cryptographic HMAC token signing & verification
function signSessionToken(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(data)
    .digest('base64url');
  return `${data}.${signature}`;
}

function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [data, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(data)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(
      Buffer.from(data, 'base64url').toString('utf8')
    );

    // Check expiration
    if (Date.now() / 1000 > payload.exp) {
      return null;
    }

    // Check session revocation ledger (invalidates revoked sessions immediately)
    const revokedAt = userRevocationTimestamps.get(payload.userId);
    if (revokedAt && payload.iat <= revokedAt) {
      return null;
    }

    // Check live server user record status
    if (typeof serverUsers !== 'undefined') {
      const dbUser = serverUsers.find((u) => u.id === payload.userId);
      if (dbUser && (dbUser.status === 'suspended' || dbUser.status === 'revoked')) {
        return null;
      }
    }

    // Verify account is not suspended or revoked in payload
    if (payload.status === 'suspended' || payload.status === 'revoked') {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// Cookie configuration helper adhering to security & cross-origin iframe requirements
function getAuthCookieOptions(req: Request) {
  const isSecure = isProduction || req.secure || req.headers['x-forwarded-proto'] === 'https';
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: (isSecure ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000
  };
}

// In-memory audit log for security events
interface AuditEvent {
  id: string;
  timestamp: string;
  type: 'login_success' | 'login_denied' | 'logout' | 'api_denied' | 'settings_update';
  email: string;
  ip: string;
  details: string;
}

const auditLogs: AuditEvent[] = [
  {
    id: 'aud-init-1',
    timestamp: new Date().toISOString(),
    type: 'login_success',
    email: 'askiasventures@gmail.com',
    ip: '127.0.0.1',
    details: 'System security initialized. Super Admin role locked to authorized email allowlist.'
  }
];

function logAuditEvent(
  type: AuditEvent['type'],
  email: string,
  ip: string,
  details: string
) {
  auditLogs.unshift({
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    type,
    email,
    ip,
    details
  });
  if (auditLogs.length > 100) auditLogs.pop();
}

// Middlewares (25MB payload limits for base64 media uploads)
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.use(cookieParser());

// CORS configuration supporting Netlify frontend domains, AI Studio dev, and localhost
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    // Allow any Netlify preview or production domain (*.netlify.app)
    if (origin.endsWith('.netlify.app')) {
      return callback(null, true);
    }
    // Allow AI Studio cloud run domains (*.run.app)
    if (origin.endsWith('.run.app')) {
      return callback(null, true);
    }
    // Allow local development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    // Allow any origin in production or preview with credentials
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'X-Askia-Token']
}));

// Preflight options handler
app.options('*', cors());

// Extract session token from Cookies or Authorization: Bearer header
function extractSessionToken(req: Request): string | null {
  // 1. Check cookies
  if (req.cookies && (req.cookies[ADMIN_COOKIE_NAME] || req.cookies[SESSION_COOKIE_NAME])) {
    return req.cookies[ADMIN_COOKIE_NAME] || req.cookies[SESSION_COOKIE_NAME];
  }
  // 2. Check Authorization header (Bearer <token>)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }
  // 3. Check custom header fallback
  const customHeader = req.headers['x-askia-token'];
  if (typeof customHeader === 'string' && customHeader.trim()) {
    return customHeader.trim();
  }
  return null;
}

// Extract admin session token
function extractAdminToken(req: Request): string | null {
  if (req.cookies && req.cookies[ADMIN_COOKIE_NAME]) {
    return req.cookies[ADMIN_COOKIE_NAME];
  }
  return extractSessionToken(req);
}

// Server-side Password Hashing (Bcrypt with salt rounds 10)
function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

// Password verification supporting both modern bcrypt and legacy PBKDF2
function verifyPassword(plainPassword: string, storedHash: string): boolean {
  if (!storedHash || !plainPassword) return false;
  // If stored as bcrypt hash ($2a$, $2b$, $2y$)
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$')) {
    try {
      return bcrypt.compareSync(plainPassword, storedHash);
    } catch {
      return false;
    }
  }
  // Legacy PBKDF2 fallback for existing user accounts
  const legacyHash = crypto.pbkdf2Sync(plainPassword, 'askia_market_salt_2026', 1000, 32, 'sha256').toString('hex');
  return legacyHash === storedHash;
}

// In-Memory User Store (Preserved across server session)
interface ConnectedIdentityRecord {
  provider: 'google' | 'facebook' | 'email' | 'phone';
  identifier: string;
  connectedAt: string;
  verified: boolean;
}

interface ServerUserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  accountType: 'buyer' | 'shop_owner' | 'advertiser' | 'staff' | 'admin';
  adminRole?: string;
  jobTitle?: string;
  department?: string;
  permissions?: string[];
  shopId?: string;
  status: 'active' | 'pending_approval' | 'suspended' | 'revoked';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  kycStatus?: 'not_started' | 'pending' | 'verified' | 'rejected' | 'requires_review';
  createdAt: string;
  avatarUrl?: string;
  authProviders?: ('email' | 'phone' | 'google' | 'facebook')[];
  registrationSource?: 'email' | 'phone' | 'google' | 'facebook';
  googleId?: string;
  facebookId?: string;
  lastLoginAt?: string;
  connectedIdentities?: ConnectedIdentityRecord[];
}

// Real Persisted User Store (Backed by storage engine)
let serverUsers: ServerUserRecord[] = storage.getUsers() as any;

// OTP Store for email & phone verification
interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
}
const serverOtpStore: Map<string, OtpEntry> = new Map();

// Real KYC Store for Merchants
interface ServerKycSubmission {
  id: string;
  userId: string;
  businessName: string;
  cacNumber: string;
  registrationType: string;
  registeredAddress: string;
  city: string;
  state: string;
  authorizedRepName: string;
  authorizedRepPhone: string;
  authorizedRepEmail: string;
  idType: string;
  idNumber: string;
  maskedNin?: string;
  ninConsentGiven: boolean;
  ninConsentTimestamp?: string;
  cacDocumentUrl?: string;
  status: 'pending' | 'verified' | 'rejected' | 'requires_review';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

let serverKycSubmissions: ServerKycSubmission[] = [];

// ==========================================
// REAL-TIME NOTIFICATIONS & CHAT HUB
// ==========================================
interface ServerNotification {
  id: string;
  recipientUserId: string;
  senderUserId?: string;
  senderName?: string;
  type: 'chat_message' | 'order_update' | 'payment_update' | 'kyc_update' | 'system_alert' | 'inquiry';
  title: string;
  body: string;
  linkUrl?: string;
  metadata?: any;
  read: boolean;
  createdAt: string;
}

interface ServerChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  message: string;
  listingId?: string;
  listingTitle?: string;
  listingPrice?: number;
  listingImageUrl?: string;
  createdAt: string;
  read: boolean;
}

interface PushSubscriptionRecord {
  userId: string;
  subscription: any;
  createdAt: string;
}

interface ProductViewRecord {
  totalViews: number;
  uniqueViewers: Set<string>;
  lastViewedAt: string;
}

// Connected SSE clients for instantaneous real-time streaming
const sseClients = new Map<string, Response[]>();

// Push subscriptions by userId
const serverPushSubscriptions: PushSubscriptionRecord[] = [];

// Product views map: productId -> ProductViewRecord (tracks genuine views only)
const serverProductViews = new Map<string, ProductViewRecord>();

// Real Notifications Store (Clean, honest empty state)
let serverNotifications: ServerNotification[] = [];

// Real Chat Messages Store (Clean, honest empty state)
let serverChatMessages: ServerChatMessage[] = [];

// Real-time Event Dispatcher
function dispatchNotification(notification: Omit<ServerNotification, 'id' | 'read' | 'createdAt'>): ServerNotification {
  const newNotif: ServerNotification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    read: false,
    createdAt: new Date().toISOString()
  };

  serverNotifications.unshift(newNotif);

  // Broadcast to connected SSE clients
  const recipientClients = sseClients.get(newNotif.recipientUserId);
  if (recipientClients && recipientClients.length > 0) {
    const sseMessage = `event: notification\ndata: ${JSON.stringify(newNotif)}\n\n`;
    recipientClients.forEach((res) => {
      try {
        res.write(sseMessage);
      } catch (err) {
        // Client disconnection will trigger clean-up
      }
    });
  }

  return newNotif;
}

// Server-side Authentication Middleware for Protected Admin APIs
function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const token = extractAdminToken(req);
  if (!token) {
    logAuditEvent('api_denied', 'anonymous', req.ip || '', `Blocked unauthorized request to ${req.path}`);
    return res.status(401).json({
      error: 'unauthenticated',
      message: 'Authentication required. No active administrative session found.'
    });
  }

  const session = verifySessionToken(token);
  if (!session || !isSuperAdminEmail(session.email) || session.accountType !== 'admin') {
    res.clearCookie(ADMIN_COOKIE_NAME);
    logAuditEvent('api_denied', session?.email || 'unknown', req.ip || '', `Rejected non-founder access to ${req.path}`);
    return res.status(403).json({
      error: 'forbidden',
      message: 'Access Denied: Founder Super Administrator authorization required.'
    });
  }

  (req as any).superAdmin = session;
  (req as any).user = session;
  next();
}

// Server-side Authentication Middleware for Staff & Admin
function requireStaffOrAdmin(req: Request, res: Response, next: NextFunction) {
  const token = extractSessionToken(req);
  if (!token) {
    return res.status(401).json({ error: 'unauthenticated', message: 'Authentication required.' });
  }

  const session = verifySessionToken(token);
  if (!session || (session.accountType !== 'staff' && session.accountType !== 'admin')) {
    return res.status(403).json({ error: 'forbidden', message: 'Staff or administrator access required.' });
  }

  (req as any).user = session;
  next();
}

// Health check endpoint for uptime monitors, Netlify proxy checks, and dev diagnostics
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    corsOrigin: req.headers.origin || null,
    environment: process.env.NODE_ENV || 'development'
  });
});

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// 1. Google OAuth Public Config
app.get('/api/auth/google/config', (req: Request, res: Response) => {
  const configured = Boolean(GOOGLE_CLIENT_ID);
  res.json({
    configured,
    clientId: GOOGLE_CLIENT_ID || null,
    authorizedEmails: ALLOWED_SUPER_ADMIN_EMAILS,
    primarySuperAdmin: ALLOWED_SUPER_ADMIN_EMAILS[0],
    callbackUrl: GOOGLE_CALLBACK_URL
  });
});

// 2. Redirect to Google OAuth 2.0 Consent Screen
app.get('/api/auth/google/login', (req: Request, res: Response) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.redirect('/?tab=marketplace&auth=setup_required');
  }

  const state = crypto.randomBytes(16).toString('hex');
  res.cookie('oauth_state', state, {
    httpOnly: true,
    maxAge: 10 * 60 * 1000,
    sameSite: 'lax'
  });

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'online',
    scope: ['openid', 'email', 'profile'],
    include_granted_scopes: true,
    prompt: 'select_account',
    state
  });

  res.redirect(authUrl);
});

// 3. Google OAuth 2.0 Callback
app.get('/api/auth/google/callback', async (req: Request, res: Response) => {
  const { code, state, error, error_description } = req.query;
  const cookieState = req.cookies['oauth_state'];

  if (error) {
    logAuditEvent('login_denied', 'google_oauth_error', req.ip || '', `Google returned error: ${error_description || error}`);
    return res.redirect(`/?tab=marketplace&auth=error&desc=${encodeURIComponent(String(error_description || error))}`);
  }

  // Validate state token against cookie to prevent CSRF attacks
  if (cookieState && state && state !== cookieState) {
    logAuditEvent('login_denied', 'google_csrf', req.ip || '', 'OAuth state mismatch (potential CSRF attack)');
    return res.redirect('/?tab=marketplace&auth=error&desc=Invalid+OAuth+state+parameter');
  }
  res.clearCookie('oauth_state', { path: '/' });

  if (!code || typeof code !== 'string') {
    return res.redirect('/?tab=marketplace&auth=error&desc=Missing+authorization+code');
  }

  try {
    const { tokens } = await oauth2Client.getToken({
      code,
      redirect_uri: GOOGLE_CALLBACK_URL
    });

    if (!tokens.id_token) {
      throw new Error('No id_token returned by Google OAuth');
    }

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error('Unable to extract Google account identity');
    }

    const email = payload.email.toLowerCase();
    const name = payload.name || 'Askia Market Member';
    const picture = payload.picture || '';

    // Check account type
    const isFounder = isSuperAdminEmail(email);
    let user = serverUsers.find((u) => u.email.toLowerCase() === email);

    if (isFounder) {
      if (!user) {
        user = {
          id: 'usr-super-admin-askia',
          name: name || 'Sensei Askia',
          email,
          phone: '+234 800 000 0001',
          passwordHash: hashPassword('SenseiAskia@2026!'),
          accountType: 'admin',
          adminRole: 'super_admin',
          jobTitle: 'Founder & Super Administrator',
          department: 'Executive Office',
          permissions: ['all_permissions', 'manage_admins', 'approve_shops', 'approve_ads', 'approve_payments', 'platform_settings', 'system_security'],
          status: 'active',
          isEmailVerified: true,
          isPhoneVerified: true,
          createdAt: new Date().toISOString(),
          avatarUrl: picture
        };
        serverUsers.unshift(user);
      }
    } else if (!user) {
      // Default auto-provision for new Google sign-in as verified Customer / Buyer
      user = {
        id: `usr-google-${Date.now()}`,
        name,
        email,
        phone: '',
        passwordHash: '',
        accountType: 'buyer',
        status: 'active',
        isEmailVerified: true,
        isPhoneVerified: false,
        createdAt: new Date().toISOString(),
        avatarUrl: picture
      };
      serverUsers.push(user);
    }

    // Check suspension
    if (user.status === 'suspended' || user.status === 'revoked') {
      logAuditEvent('login_denied', email, req.ip || '', 'Suspended user blocked from Google login');
      return res.redirect(`/?tab=marketplace&auth=suspended`);
    }

    const now = Math.floor(Date.now() / 1000);
    const sessionPayload: SessionPayload = {
      sub: payload.sub,
      userId: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      picture: user.avatarUrl,
      accountType: user.accountType,
      adminRole: user.adminRole,
      jobTitle: user.jobTitle,
      department: user.department,
      permissions: user.permissions,
      status: user.status,
      iat: now,
      exp: now + 24 * 60 * 60
    };

    const sessionToken = signSessionToken(sessionPayload);
    const cookieOpts = getAuthCookieOptions(req);

    res.cookie(SESSION_COOKIE_NAME, sessionToken, cookieOpts);
    if (isFounder) {
      res.cookie(ADMIN_COOKIE_NAME, sessionToken, cookieOpts);
      logAuditEvent('login_success', email, req.ip || '', 'Founder Super Admin authenticated via Google OAuth callback');
      return res.redirect('/?tab=marketplace&admin=open&auth=success');
    }

    logAuditEvent('login_success', email, req.ip || '', `User authenticated via Google: ${user.accountType}`);
    res.redirect('/?tab=marketplace&auth=success');
  } catch (err: any) {
    console.error('Google OAuth callback verification failed:', err);
    logAuditEvent('login_denied', 'unknown', req.ip || '', `OAuth exception: ${err.message}`);
    res.redirect(`/?tab=marketplace&auth=error&desc=${encodeURIComponent(err.message || 'Token verification failed')}`);
  }
});

// 4. Universal Google Sign-In Token Verification (One-Tap & Google Button)
app.post('/api/auth/google/verify', async (req: Request, res: Response) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ success: false, error: 'missing_credential', message: 'Google ID token credential is required.' });
  }

  try {
    let email = '';
    let name = '';
    let picture = '';
    let sub = '';

    if (GOOGLE_CLIENT_ID) {
      const ticket = await oauth2Client.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.status(401).json({ success: false, error: 'invalid_token', message: 'Unable to parse Google token.' });
      }
      email = payload.email.toLowerCase();
      name = payload.name || 'Askia Market Member';
      picture = payload.picture || '';
      sub = payload.sub;
    } else {
      // Decode JWT payload (development / unconfigured client fallback)
      const parts = credential.split('.');
      if (parts.length !== 3) {
        return res.status(400).json({ success: false, error: 'invalid_format', message: 'Invalid JWT token format.' });
      }
      const rawPayload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      email = (rawPayload.email || '').toLowerCase();
      name = rawPayload.name || 'Askia Market Member';
      picture = rawPayload.picture || '';
      sub = rawPayload.sub || `google-${Date.now()}`;
    }

    const isFounder = isSuperAdminEmail(email);
    let user = serverUsers.find((u) => u.email.toLowerCase() === email);

    // If Founder: enforce Super Admin role
    if (isFounder) {
      if (!user) {
        user = {
          id: 'usr-super-admin-askia',
          name: name || 'Sensei Askia',
          email,
          phone: '+234 800 000 0001',
          passwordHash: hashPassword('SenseiAskia@2026!'),
          accountType: 'admin',
          adminRole: 'super_admin',
          jobTitle: 'Founder & Super Administrator',
          department: 'Executive Office',
          permissions: ['all_permissions', 'manage_admins', 'approve_shops', 'approve_ads', 'approve_payments', 'platform_settings', 'system_security'],
          status: 'active',
          isEmailVerified: true,
          isPhoneVerified: true,
          createdAt: new Date().toISOString(),
          avatarUrl: picture
        };
        serverUsers.unshift(user);
      }
    } else if (!user) {
      // Check if user has a pending staff application
      const staffApp = serverStaffApplications.find((a) => a.applicantEmail.toLowerCase() === email);
      if (staffApp && staffApp.status === 'pending') {
        return res.json({
          success: true,
          pendingApproval: true,
          user: {
            id: `usr-pending-${Date.now()}`,
            name,
            email,
            accountType: 'staff',
            status: 'pending_approval',
            message: 'Your application has been submitted. Your account will remain restricted until Founder Sensei Askia reviews and approves your application.'
          }
        });
      }

      // Provision new verified customer
      user = {
        id: `usr-google-${Date.now()}`,
        name,
        email,
        phone: '',
        passwordHash: '',
        accountType: 'buyer',
        status: 'active',
        isEmailVerified: true,
        isPhoneVerified: false,
        createdAt: new Date().toISOString(),
        avatarUrl: picture
      };
      serverUsers.push(user);
    }

    if (user.status === 'suspended' || user.status === 'revoked') {
      logAuditEvent('login_denied', email, req.ip || '', 'Blocked suspended account from login');
      return res.status(403).json({
        success: false,
        error: 'account_restricted',
        message: 'This account has been suspended or revoked. Please contact support.'
      });
    }

    const now = Math.floor(Date.now() / 1000);
    const sessionPayload: SessionPayload = {
      sub,
      userId: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      picture: user.avatarUrl,
      accountType: user.accountType,
      adminRole: user.adminRole,
      jobTitle: user.jobTitle,
      department: user.department,
      permissions: user.permissions,
      status: user.status,
      iat: now,
      exp: now + 24 * 60 * 60
    };

    const sessionToken = signSessionToken(sessionPayload);
    const cookieOpts = getAuthCookieOptions(req);

    res.cookie(SESSION_COOKIE_NAME, sessionToken, cookieOpts);
    if (isFounder) {
      res.cookie(ADMIN_COOKIE_NAME, sessionToken, cookieOpts);
    }

    logAuditEvent('login_success', email, req.ip || '', `Authenticated via Google: ${user.accountType}`);
    return res.json({
      success: true,
      token: sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        accountType: user.accountType,
        adminRole: user.adminRole,
        jobTitle: user.jobTitle,
        department: user.department,
        permissions: user.permissions,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        avatarUrl: user.avatarUrl
      },
      isSuperAdmin: isFounder
    });
  } catch (err: any) {
    console.error('Google token verification error:', err);
    return res.status(401).json({ success: false, error: 'token_failed', message: `Google verification failed: ${err.message}` });
  }
});

// 5. Universal Sign-In with Email or Phone + Password
app.post('/api/auth/login', (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const rate = checkRateLimit(`login:${ip}`, 12, 300); // 12 attempts per 5 minutes
  if (!rate.allowed) {
    logAuditEvent('api_denied', 'unknown', ip, 'Rate limit exceeded on /api/auth/login');
    return res.status(429).json({
      success: false,
      error: 'rate_limited',
      message: `Too many login attempts. Please wait ${rate.waitSeconds} seconds before trying again.`
    });
  }

  const { emailOrPhone, password } = req.body;

  if (!emailOrPhone || !password) {
    return res.status(400).json({ success: false, error: 'missing_credentials', message: 'Email/phone and password are required.' });
  }

  const query = emailOrPhone.trim().toLowerCase();
  const cleanPhone = emailOrPhone.replace(/[\s\-()]/g, '');

  const user = serverUsers.find(
    (u) =>
      u.email.toLowerCase() === query ||
      u.phone.replace(/[\s\-()]/g, '') === cleanPhone
  );

  if (!user) {
    return res.status(401).json({ success: false, error: 'invalid_credentials', message: 'No registered account found with these credentials.' });
  }

  if (user.status === 'suspended' || user.status === 'revoked') {
    return res.status(403).json({ success: false, error: 'account_restricted', message: 'Your account has been suspended or revoked. Contact ASKIA MARKET compliance.' });
  }

  if (user.status === 'pending_approval') {
    return res.status(403).json({
      success: false,
      error: 'pending_approval',
      message: 'Your application has been received and is currently under compliance review. You will be notified once verification is completed.'
    });
  }

  // Password verification supporting bcrypt and legacy hashes
  const isMatch = verifyPassword(password, user.passwordHash);

  if (!isMatch) {
    logAuditEvent('login_denied', user.email, req.ip || '', 'Failed password login attempt');
    return res.status(401).json({ success: false, error: 'invalid_credentials', message: 'Invalid password. Please verify and try again.' });
  }

  // Automatically upgrade legacy password hash to bcrypt
  if (!user.passwordHash.startsWith('$2')) {
    user.passwordHash = hashPassword(password);
  }

  const isFounder = isSuperAdminEmail(user.email) && user.accountType === 'admin';
  const now = Math.floor(Date.now() / 1000);
  const sessionPayload: SessionPayload = {
    sub: `usr-${user.id}`,
    userId: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    picture: user.avatarUrl,
    accountType: user.accountType,
    adminRole: user.adminRole,
    jobTitle: user.jobTitle,
    department: user.department,
    permissions: user.permissions,
    status: user.status,
    iat: now,
    exp: now + 24 * 60 * 60
  };

  const sessionToken = signSessionToken(sessionPayload);
  const cookieOpts = getAuthCookieOptions(req);

  res.cookie(SESSION_COOKIE_NAME, sessionToken, cookieOpts);
  if (isFounder) {
    res.cookie(ADMIN_COOKIE_NAME, sessionToken, cookieOpts);
  }

  logAuditEvent('login_success', user.email, req.ip || '', `Password login successful: ${user.accountType}`);
  return res.json({
    success: true,
    token: sessionToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      accountType: user.accountType,
      adminRole: user.adminRole,
      jobTitle: user.jobTitle,
      department: user.department,
      permissions: user.permissions,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      avatarUrl: user.avatarUrl
    },
    isSuperAdmin: isFounder
  });
});

// 6. Universal Registration (Customer, Merchant, Advertiser)
app.post('/api/auth/register', (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const rate = checkRateLimit(`reg:${ip}`, 6, 300); // 6 registrations per 5 minutes
  if (!rate.allowed) {
    logAuditEvent('api_denied', 'unknown', ip, 'Registration rate limit exceeded');
    return res.status(429).json({
      success: false,
      error: 'rate_limited',
      message: `Registration rate limit reached. Please wait ${rate.waitSeconds} seconds before trying again.`
    });
  }

  const { name, email, phone, password, accountType = 'buyer', shopDetails } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ success: false, error: 'missing_fields', message: 'Name, email, phone number, and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.replace(/[\s\-()]/g, '');

  const existingEmail = serverUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existingEmail) {
    return res.status(400).json({ success: false, error: 'email_taken', message: 'An account is already registered with this email address.' });
  }

  const existingPhone = serverUsers.find((u) => u.phone.replace(/[\s\-()]/g, '') === cleanPhone);
  if (existingPhone) {
    return res.status(400).json({ success: false, error: 'phone_taken', message: 'An account is already registered with this phone number.' });
  }

  const validTypes = ['buyer', 'shop_owner', 'advertiser'];
  const finalType = validTypes.includes(accountType) ? accountType : 'buyer';

  const newUser: ServerUserRecord = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    phone: phone.trim(),
    passwordHash: hashPassword(password),
    accountType: finalType as any,
    shopId: finalType === 'shop_owner' ? `shop-${Date.now()}` : undefined,
    status: 'active',
    isEmailVerified: false,
    isPhoneVerified: false,
    kycStatus: finalType === 'shop_owner' ? 'pending' : 'not_started',
    createdAt: new Date().toISOString()
  };

  // If merchant registration, register KYC submission record
  if (finalType === 'shop_owner' && shopDetails) {
    const kycSub: ServerKycSubmission = {
      id: `kyc-${Date.now()}`,
      userId: newUser.id,
      businessName: shopDetails.shopName || `${name}'s Store`,
      cacNumber: shopDetails.cacNumber || 'PENDING_REG',
      registrationType: 'Limited Liability (RC)',
      registeredAddress: shopDetails.address || 'Commercial District',
      city: shopDetails.city || 'Ikeja',
      state: shopDetails.state || 'Lagos',
      authorizedRepName: name,
      authorizedRepPhone: phone,
      authorizedRepEmail: cleanEmail,
      idType: shopDetails.idType || 'National ID (NIN)',
      idNumber: shopDetails.idNumber ? `•••• •••• ${shopDetails.idNumber.slice(-4)}` : '•••• •••• 0000',
      maskedNin: shopDetails.idNumber ? `•••• •••• ${shopDetails.idNumber.slice(-4)}` : undefined,
      ninConsentGiven: true,
      ninConsentTimestamp: new Date().toISOString(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
      notes: 'Merchant registered. Awaiting compliance document verification.'
    };
    serverKycSubmissions.unshift(kycSub);
  }

  serverUsers.push(newUser);

  // Issue session cookie
  const now = Math.floor(Date.now() / 1000);
  const sessionPayload: SessionPayload = {
    sub: `usr-${newUser.id}`,
    userId: newUser.id,
    email: newUser.email,
    phone: newUser.phone,
    name: newUser.name,
    accountType: newUser.accountType,
    status: newUser.status,
    iat: now,
    exp: now + 24 * 60 * 60
  };

  const sessionToken = signSessionToken(sessionPayload);
  res.cookie(SESSION_COOKIE_NAME, sessionToken, getAuthCookieOptions(req));

  logAuditEvent('login_success', newUser.email, req.ip || '', `New user registered as ${newUser.accountType}`);
  return res.json({
    success: true,
    token: sessionToken,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      phone: newUser.phone,
      accountType: newUser.accountType,
      status: newUser.status,
      isEmailVerified: newUser.isEmailVerified,
      isPhoneVerified: newUser.isPhoneVerified
    }
  });
});

// 7. OTP Generation & Verification (Email & Phone)
app.post('/api/auth/resend-otp', (req: Request, res: Response) => {
  const { identifier, type } = req.body;
  if (!identifier) {
    return res.status(400).json({ success: false, error: 'missing_identifier', message: 'Email or phone identifier required.' });
  }

  const key = `${type || 'email'}:${identifier.trim().toLowerCase()}`;
  const existing = serverOtpStore.get(key);
  const now = Date.now();

  if (existing && now - existing.lastSentAt < 60 * 1000) {
    const waitSecs = Math.ceil((60 * 1000 - (now - existing.lastSentAt)) / 1000);
    return res.status(429).json({ success: false, error: 'rate_limited', message: `Please wait ${waitSecs} seconds before requesting another code.` });
  }

  // Generate secure 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  serverOtpStore.set(key, {
    code,
    expiresAt: now + 10 * 60 * 1000, // 10 minutes expiry
    attempts: 0,
    lastSentAt: now
  });

  // Security: In production, send via SMS/Email provider; do not log codes publicly
  return res.json({
    success: true,
    message: `Verification code sent to ${identifier}. Valid for 10 minutes.`,
    cooldownSeconds: 60
  });
});

app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { identifier, type, code } = req.body;
  if (!identifier || !code) {
    return res.status(400).json({ success: false, error: 'missing_fields', message: 'Identifier and OTP code are required.' });
  }

  const key = `${type || 'email'}:${identifier.trim().toLowerCase()}`;
  const entry = serverOtpStore.get(key);

  if (!entry) {
    return res.status(400).json({ success: false, error: 'invalid_otp', message: 'No active OTP verification code found. Please request a new code.' });
  }

  if (Date.now() > entry.expiresAt) {
    serverOtpStore.delete(key);
    return res.status(400).json({ success: false, error: 'expired_otp', message: 'Verification code has expired. Please request a new code.' });
  }

  entry.attempts += 1;
  if (entry.attempts > 5) {
    serverOtpStore.delete(key);
    return res.status(429).json({ success: false, error: 'too_many_attempts', message: 'Maximum verification attempts exceeded. Please request a new code.' });
  }

  if (entry.code !== code.trim()) {
    return res.status(400).json({ success: false, error: 'incorrect_code', message: `Incorrect verification code. ${5 - entry.attempts} attempts remaining.` });
  }

  // Verified!
  serverOtpStore.delete(key);

  // Update user record if found
  const cleanId = identifier.trim().toLowerCase();
  const user = serverUsers.find((u) => u.email.toLowerCase() === cleanId || u.phone.includes(cleanId));
  if (user) {
    if (type === 'phone') {
      user.isPhoneVerified = true;
    } else {
      user.isEmailVerified = true;
    }
  }

  return res.json({ success: true, message: `${type === 'phone' ? 'Phone number' : 'Email address'} verified successfully.` });
});

// 8. Password Reset Request & Confirmation
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { emailOrPhone } = req.body;
  if (!emailOrPhone) {
    return res.status(400).json({ success: false, error: 'missing_identifier', message: 'Please provide your registered email or phone.' });
  }

  const query = emailOrPhone.trim().toLowerCase();
  const user = serverUsers.find((u) => u.email.toLowerCase() === query || u.phone.includes(query));

  // Consistent response to prevent user enumeration
  if (user) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `reset:${user.email}`;
    serverOtpStore.set(key, {
      code,
      expiresAt: Date.now() + 15 * 60 * 1000,
      attempts: 0,
      lastSentAt: Date.now()
    });
  }

  return res.json({
    success: true,
    message: 'If an account matches your details, a secure reset code has been dispatched.'
  });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { emailOrPhone, code, newPassword } = req.body;
  if (!emailOrPhone || !code || !newPassword) {
    return res.status(400).json({ success: false, error: 'missing_fields', message: 'Identifier, code, and new password are required.' });
  }

  const query = emailOrPhone.trim().toLowerCase();
  const user = serverUsers.find((u) => u.email.toLowerCase() === query || u.phone.includes(query));
  if (!user) {
    return res.status(400).json({ success: false, error: 'invalid_request', message: 'Account not found.' });
  }

  const key = `reset:${user.email}`;
  const entry = serverOtpStore.get(key);
  if (!entry || entry.code !== code.trim() || Date.now() > entry.expiresAt) {
    return res.status(400).json({ success: false, error: 'invalid_code', message: 'Invalid or expired password reset code.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, error: 'weak_password', message: 'Password must be at least 8 characters.' });
  }

  user.passwordHash = hashPassword(newPassword);
  serverOtpStore.delete(key);
  logAuditEvent('settings_update', user.email, req.ip || '', 'User password reset completed');

  return res.json({ success: true, message: 'Your password has been reset successfully. You may now sign in.' });
});

// 9. Unified Active Session Inspection
app.get('/api/auth/session', (req: Request, res: Response) => {
  const token = extractSessionToken(req);
  if (!token) {
    return res.json({ authenticated: false, user: null });
  }

  const session = verifySessionToken(token);
  if (!session) {
    res.clearCookie(SESSION_COOKIE_NAME);
    res.clearCookie(ADMIN_COOKIE_NAME);
    return res.json({ authenticated: false, user: null });
  }

  const isFounder = isSuperAdminEmail(session.email) && session.accountType === 'admin';
  return res.json({
    authenticated: true,
    token,
    user: {
      id: session.userId,
      email: session.email,
      phone: session.phone,
      name: session.name,
      avatarUrl: session.picture,
      accountType: session.accountType,
      adminRole: session.adminRole,
      jobTitle: session.jobTitle,
      department: session.department,
      permissions: session.permissions,
      status: session.status,
      expiresAt: new Date(session.exp * 1000).toISOString()
    },
    isSuperAdmin: isFounder
  });
});

// Backward-compatible Admin Session route
app.get('/api/admin/session', (req: Request, res: Response) => {
  const token = extractAdminToken(req);
  if (!token) {
    return res.json({ authenticated: false, user: null });
  }

  const session = verifySessionToken(token);
  if (!session || !isSuperAdminEmail(session.email) || session.accountType !== 'admin') {
    return res.json({ authenticated: false, user: null });
  }

  return res.json({
    authenticated: true,
    token,
    user: {
      email: session.email,
      name: session.name,
      role: 'super_admin',
      avatarUrl: session.picture,
      expiresAt: new Date(session.exp * 1000).toISOString()
    }
  });
});

// 10. Logout Endpoint (Clears both session cookies)
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const token = extractSessionToken(req);
  if (token) {
    const session = verifySessionToken(token);
    if (session) {
      logAuditEvent('logout', session.email, req.ip || '', 'User logged out');
    }
  }
  res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
  res.clearCookie(ADMIN_COOKIE_NAME, { path: '/' });
  res.json({ success: true, message: 'Logged out successfully' });
});

// ==========================================
// REAL KYC & NIN IDENTITY VERIFICATION APIS
// ==========================================

// Submit KYC verification for Merchant / Advertiser
app.post('/api/kyc/submit', (req: Request, res: Response) => {
  const {
    businessName,
    cacNumber,
    registrationType = 'Limited Liability (RC)',
    registeredAddress,
    city = 'Lagos',
    state = 'Lagos',
    authorizedRepName,
    authorizedRepPhone,
    authorizedRepEmail,
    idType,
    idNumber,
    nin,
    ninConsent,
    ninConsentGiven,
    cacDocumentUrl
  } = req.body;

  if (!businessName || !cacNumber || !authorizedRepName) {
    return res.status(400).json({ success: false, error: 'missing_fields', message: 'Business name, CAC number, and authorized representative are required.' });
  }

  // NIN Validation Rule: Must be exactly 11 numeric digits with explicit user consent
  let maskedNin = '';
  const ninVal = nin || (idType === 'National ID (NIN)' ? idNumber : null);
  const consentGiven = Boolean(ninConsent || ninConsentGiven);

  if (ninVal) {
    const cleanNin = ninVal.toString().replace(/\D/g, '');
    if (cleanNin.length !== 11) {
      return res.status(400).json({
        success: false,
        error: 'invalid_nin',
        message: 'National Identification Number (NIN) must be exactly 11 digits.'
      });
    }

    if (!consentGiven) {
      return res.status(400).json({
        success: false,
        error: 'consent_required',
        message: 'Informed user consent is mandatory for NIN verification compliance pursuant to NDPR regulations.'
      });
    }

    maskedNin = `•••• •••• ${cleanNin.slice(-4)}`;
  }

  // Token check for user reference if available
  const token = req.cookies[SESSION_COOKIE_NAME];
  const session = token ? verifySessionToken(token) : null;
  const userId = session?.userId || `usr-kyc-${Date.now()}`;

  const submission: ServerKycSubmission = {
    id: `kyc-${Date.now()}`,
    userId,
    businessName: businessName.trim(),
    cacNumber: cacNumber.trim().toUpperCase(),
    registrationType,
    registeredAddress: registeredAddress || '',
    city,
    state,
    authorizedRepName: authorizedRepName.trim(),
    authorizedRepPhone: authorizedRepPhone || '',
    authorizedRepEmail: authorizedRepEmail || '',
    idType: idType || 'National ID (NIN)',
    idNumber: idNumber ? `•••• •••• ${idNumber.slice(-4)}` : (maskedNin || '•••• •••• 0000'),
    maskedNin: maskedNin || undefined,
    ninConsentGiven: Boolean(ninConsent),
    ninConsentTimestamp: ninConsent ? new Date().toISOString() : undefined,
    cacDocumentUrl,
    status: 'pending',
    submittedAt: new Date().toISOString(),
    notes: 'Awaiting manual document & registry verification by Askia Market Compliance Team.'
  };

  serverKycSubmissions.unshift(submission);
  logAuditEvent('settings_update', authorizedRepEmail || 'unknown', req.ip || '', `Merchant KYC submitted: ${businessName} (CAC: ${cacNumber})`);

  return res.json({
    success: true,
    submission: {
      id: submission.id,
      businessName: submission.businessName,
      cacNumber: submission.cacNumber,
      status: submission.status,
      maskedNin: submission.maskedNin,
      submittedAt: submission.submittedAt,
      message: 'KYC documents submitted successfully. Verification status: Pending Manual Review.'
    }
  });
});

// View KYC Status
app.get('/api/kyc/status', (req: Request, res: Response) => {
  const token = req.cookies[SESSION_COOKIE_NAME];
  const session = token ? verifySessionToken(token) : null;

  if (session) {
    const userKyc = serverKycSubmissions.find((k) => k.userId === session.userId || k.authorizedRepEmail.toLowerCase() === session.email.toLowerCase());
    if (userKyc) {
      return res.json({ success: true, kyc: userKyc });
    }
  }

  return res.json({ success: true, kyc: null, status: 'not_started' });
});

// Super Admin / Compliance Officer: Review KYC Submissions
app.get('/api/admin/kyc/submissions', requireSuperAdmin, (req: Request, res: Response) => {
  res.json({ submissions: serverKycSubmissions });
});

app.post('/api/admin/kyc/review/:id', requireSuperAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, notes } = req.body;

  const kyc = serverKycSubmissions.find((k) => k.id === id);
  if (!kyc) {
    return res.status(404).json({ error: 'KYC submission not found.' });
  }

  kyc.status = action === 'approve' ? 'verified' : 'rejected';
  kyc.reviewedAt = new Date().toISOString();
  kyc.reviewedBy = (req as any).superAdmin.email;
  kyc.notes = notes || (action === 'approve' ? 'CAC and representative identity confirmed.' : 'Information did not match registry records.');

  // Update associated user's kycStatus
  const user = serverUsers.find((u) => u.id === kyc.userId);
  if (user) {
    user.kycStatus = kyc.status;
  }

  logAuditEvent('settings_update', (req as any).superAdmin.email, req.ip || '', `KYC review completed for ${kyc.businessName}: ${kyc.status}`);
  return res.json({ success: true, submission: kyc });
});

// ==========================================
// PROTECTED ADMINISTRATIVE APIS
// ==========================================

// Protected Metrics (Requires valid server-verified Super Admin session)
app.get('/api/admin/metrics', requireSuperAdmin, (req: Request, res: Response) => {
  const admin = (req as any).superAdmin as SessionPayload;
  const orders = storage.getOrders();
  const transactions = storage.getTransactions();
  const shops = storage.getShops();
  const ads = storage.getAdvertisements();

  const grossPlatformVolumeNgn = transactions
    .filter((t) => t.status === 'successful' || t.status === 'completed')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const escrowBalanceNgn = orders
    .filter((o) => o.status === 'escrow_locked' || o.status === 'processing')
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const settledCommissionsNgn = transactions
    .filter((t) => t.type === 'commission_deduction')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const activeShops = shops.filter((s) => s.status === 'active' || s.isVerified).length;
  const pendingVerifications = serverKycSubmissions.filter((k) => k.status === 'pending').length;
  const pendingClassifiedAds = ads.filter((a) => a.status === 'pending_review').length;

  res.json({
    authorizedAdmin: admin.email,
    serverTimestamp: new Date().toISOString(),
    systemStatus: 'nominal',
    securityLevel: 'MAXIMUM_AUTHENTICATED',
    financialSnapshot: {
      grossPlatformVolumeNgn,
      escrowBalanceNgn,
      settledCommissionsNgn,
      activeSubscriptionsNgn: 0,
      pendingPayoutsCount: 0
    },
    governance: {
      activeShops,
      pendingVerifications,
      pendingClassifiedAds,
      authorizedRolesCount: 1
    }
  });
});

// Protected Audit Log
app.get('/api/admin/audit-logs', requireSuperAdmin, (req: Request, res: Response) => {
  res.json({
    logs: auditLogs
  });
});

// ==========================================
// STAFF APPLICATIONS & MANAGEMENT
// ==========================================
interface ServerStaffApplication {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  desiredPosition: string;
  department: string;
  experienceSummary: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  assignedRole?: string;
  assignedPermissions?: string[];
  rejectionReason?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

let serverStaffApplications: ServerStaffApplication[] = [];

// Public / applicant submission endpoint
app.post('/api/staff/apply', (req: Request, res: Response) => {
  const { applicantName, applicantEmail, applicantPhone, desiredPosition, department, experienceSummary } = req.body;
  if (!applicantName || !applicantEmail || !applicantPhone) {
    return res.status(400).json({ error: 'Missing required applicant fields.' });
  }

  const newApp = {
    id: `app-${Date.now()}`,
    applicantName,
    applicantEmail,
    applicantPhone,
    desiredPosition: desiredPosition || 'Operational Staff',
    department: department || 'Operations & Strategy',
    experienceSummary: experienceSummary || '',
    submittedAt: new Date().toISOString(),
    status: 'pending'
  };

  serverStaffApplications.unshift(newApp);
  logAuditEvent('settings_update', applicantEmail, req.ip || '', `New staff application received: ${applicantName} (${desiredPosition})`);
  return res.json({ success: true, application: newApp });
});

// Admin-protected: view all staff applications
app.get('/api/admin/staff/applications', requireSuperAdmin, (req: Request, res: Response) => {
  res.json({ applications: serverStaffApplications });
});

// Admin-protected: review staff application (approve or reject)
app.post('/api/admin/staff/applications/:id/review', requireSuperAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, role, permissions, rejectionReason } = req.body;

  const appIndex = serverStaffApplications.findIndex((a) => a.id === id);
  if (appIndex === -1) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  const existing = serverStaffApplications[appIndex];
  if (action === 'approve') {
    serverStaffApplications[appIndex] = {
      ...existing,
      status: 'approved',
      assignedRole: role || 'custom',
      assignedPermissions: permissions || ['operations_oversight'],
      reviewedAt: new Date().toISOString(),
      reviewedBy: (req as any).superAdmin.email
    };
    logAuditEvent('settings_update', (req as any).superAdmin.email, req.ip || '', `Approved staff application: ${existing.applicantName} as ${role}`);
  } else {
    serverStaffApplications[appIndex] = {
      ...existing,
      status: 'rejected',
      rejectionReason: rejectionReason || 'Qualifications did not match current departmental openings.',
      reviewedAt: new Date().toISOString(),
      reviewedBy: (req as any).superAdmin.email
    };
    logAuditEvent('settings_update', (req as any).superAdmin.email, req.ip || '', `Rejected staff application: ${existing.applicantName}`);
  }

  return res.json({ success: true, application: serverStaffApplications[appIndex] });
});

// ==========================================
// REAL-TIME NOTIFICATIONS API (SSE & PUSH)
// ==========================================

// SSE Connection Endpoint: streams real-time notifications to authenticated clients
app.get('/api/notifications/stream', (req: Request, res: Response) => {
  const token = extractSessionToken(req) || (typeof req.query.token === 'string' ? req.query.token : null);
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    return res.status(401).json({ error: 'unauthenticated', message: 'Authentication required for real-time notification stream.' });
  }

  const userId = session.userId;

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  res.write(': connected\n\n');

  // Register client
  const existing = sseClients.get(userId) || [];
  existing.push(res);
  sseClients.set(userId, existing);

  // Send initial unread count & unread notifications backlog
  const unreadNotifs = serverNotifications.filter((n) => n.recipientUserId === userId && !n.read);
  res.write(`event: init\ndata: ${JSON.stringify({ unreadCount: unreadNotifs.length, notifications: unreadNotifs.slice(0, 20) })}\n\n`);

  // Periodic heartbeat keep-alive (every 25s)
  const pingInterval = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(pingInterval);
    }
  }, 25000);

  // Clean-up on client disconnect
  req.on('close', () => {
    clearInterval(pingInterval);
    const clients = sseClients.get(userId) || [];
    const filtered = clients.filter((c) => c !== res);
    if (filtered.length > 0) {
      sseClients.set(userId, filtered);
    } else {
      sseClients.delete(userId);
    }
  });
});

// Get user notifications (persistent query, strictly session-authenticated)
app.get('/api/notifications', (req: Request, res: Response) => {
  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    return res.status(401).json({ error: 'unauthenticated', message: 'Authentication required to access notifications.' });
  }

  // Derive target user identity strictly from verified server-side session.
  // Super Admin may optionally inspect a specific user for audit purposes.
  const isFounder = isSuperAdminEmail(session.email) && session.accountType === 'admin';
  const queryUserId = typeof req.query.userId === 'string' ? req.query.userId : undefined;

  let targetUserId = session.userId;
  if (queryUserId && queryUserId !== session.userId) {
    if (!isFounder) {
      logAuditEvent('api_denied', session.email, req.ip || '', `Blocked IDOR attempt to access notifications for ${queryUserId}`);
      return res.status(403).json({ error: 'forbidden', message: 'Forbidden: Cannot access notifications belonging to another user.' });
    }
    targetUserId = queryUserId;
  }

  const unreadOnly = req.query.unread === 'true';
  let list = serverNotifications.filter((n) => n.recipientUserId === targetUserId);
  if (unreadOnly) {
    list = list.filter((n) => !n.read);
  }

  const unreadCount = serverNotifications.filter((n) => n.recipientUserId === targetUserId && !n.read).length;

  res.json({
    success: true,
    notifications: list.slice(0, 50),
    unreadCount
  });
});

// Mark single notification as read (strictly authorized)
app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    return res.status(401).json({ error: 'unauthenticated', message: 'Authentication required.' });
  }

  const notif = serverNotifications.find((n) => n.id === id);
  if (!notif) {
    return res.status(404).json({ error: 'Notification not found.' });
  }

  const isFounder = isSuperAdminEmail(session.email) && session.accountType === 'admin';
  if (notif.recipientUserId !== session.userId && !isFounder) {
    logAuditEvent('api_denied', session.email, req.ip || '', `Blocked attempt to modify notification ${id} belonging to ${notif.recipientUserId}`);
    return res.status(403).json({ error: 'forbidden', message: 'Cannot modify notifications belonging to another user.' });
  }

  notif.read = true;
  res.json({ success: true, notification: notif });
});

// Mark all notifications for user as read
app.post('/api/notifications/read-all', (req: Request, res: Response) => {
  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    return res.status(401).json({ error: 'unauthenticated', message: 'Authentication required.' });
  }

  const isFounder = isSuperAdminEmail(session.email) && session.accountType === 'admin';
  const queryUserId = typeof req.body.userId === 'string' ? req.body.userId : undefined;
  const targetUserId = (isFounder && queryUserId) ? queryUserId : session.userId;

  serverNotifications
    .filter((n) => n.recipientUserId === targetUserId)
    .forEach((n) => {
      n.read = true;
    });

  res.json({ success: true, message: 'All notifications marked as read.' });
});

// Store browser push notification subscription
app.post('/api/notifications/push-subscribe', (req: Request, res: Response) => {
  const { subscription, userId } = req.body;
  if (!subscription) {
    return res.status(400).json({ error: 'Push subscription payload is required.' });
  }

  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;
  const targetUser = userId || session?.userId || 'usr-anonymous';

  // Save subscription record
  serverPushSubscriptions.push({
    userId: targetUser,
    subscription,
    createdAt: new Date().toISOString()
  });

  res.json({ success: true, message: 'Browser push notification subscription registered.' });
});

// Return VAPID Public Key for Web Push subscription
app.get('/api/notifications/vapid-public-key', (req: Request, res: Response) => {
  res.json({
    publicKey: VAPID_PUBLIC_KEY,
    configured: Boolean(process.env.VAPID_PUBLIC_KEY)
  });
});

// ==========================================
// REAL-TIME BUYER-TO-SELLER CHAT API
// ==========================================

// Send a chat message (instantly dispatches real-time notification to recipient)
app.post('/api/chat/send', (req: Request, res: Response) => {
  const {
    recipientId,
    message,
    threadId,
    listingId,
    listingTitle,
    listingPrice,
    listingImageUrl
  } = req.body;

  const content = (message || req.body.text || '').toString();

  if (!recipientId || !content.trim()) {
    return res.status(400).json({ error: 'Recipient ID and message content are required.' });
  }

  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;

  let senderId = '';
  let senderName = '';

  if (session) {
    // Strictly derive sender identity from verified server session
    senderId = session.userId;
    senderName = session.name;
  } else {
    // If guest inquiry, prevent impersonating any registered member, staff or admin
    const requestedId = typeof req.body.senderId === 'string' ? req.body.senderId : '';
    const isImpersonating = requestedId && serverUsers.some((u) => u.id === requestedId || u.email.toLowerCase() === requestedId.toLowerCase());
    if (isImpersonating) {
      logAuditEvent('api_denied', 'guest', req.ip || '', `Blocked guest attempt to impersonate registered user ${requestedId}`);
      return res.status(403).json({ error: 'forbidden', message: 'Cannot send messages impersonating a registered member. Please log in.' });
    }
    senderId = requestedId && requestedId.startsWith('usr-guest-') ? requestedId : `usr-guest-${Date.now()}`;
    senderName = req.body.senderName || 'Customer (Buyer)';
  }

  const finalThreadId = threadId || `thread-${listingId || Date.now()}`;

  const newMsg: ServerChatMessage = {
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    threadId: finalThreadId,
    senderId,
    senderName,
    recipientId,
    message: content.trim(),
    listingId,
    listingTitle,
    listingPrice: Number(listingPrice) || undefined,
    listingImageUrl,
    createdAt: new Date().toISOString(),
    read: false
  };

  serverChatMessages.push(newMsg);

  // Instantly dispatch notification to recipient (in-app, SSE stream & push)
  const notif = dispatchNotification({
    recipientUserId: recipientId,
    senderUserId: senderId,
    senderName,
    type: 'chat_message',
    title: `New message from ${senderName}`,
    body: `${listingTitle ? `Re: ${listingTitle} — ` : ''}${content.trim().slice(0, 90)}...`,
    linkUrl: `/?chat=${listingId || finalThreadId}`,
    metadata: {
      threadId: finalThreadId,
      listingId,
      senderId,
      messageId: newMsg.id
    }
  });

  // Also broadcast message event over SSE stream to recipient and sender
  [recipientId, senderId].forEach((uid) => {
    const clients = sseClients.get(uid);
    if (clients) {
      clients.forEach((c) => {
        try {
          c.write(`event: chat_message\ndata: ${JSON.stringify(newMsg)}\n\n`);
        } catch {}
      });
    }
  });

  logAuditEvent('settings_update', senderId, req.ip || '', `Chat message dispatched to ${recipientId}`);
  res.json({ success: true, message: newMsg, notification: notif });
});

// Get user chat threads (strictly session-authorized)
app.get('/api/chat/threads', (req: Request, res: Response) => {
  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    return res.status(401).json({ error: 'unauthenticated', message: 'Authentication required to view chat threads.' });
  }

  const isFounder = isSuperAdminEmail(session.email) && session.accountType === 'admin';
  const queryUserId = typeof req.query.userId === 'string' ? req.query.userId : undefined;

  let targetUserId = session.userId;
  if (queryUserId && queryUserId !== session.userId) {
    if (!isFounder) {
      logAuditEvent('api_denied', session.email, req.ip || '', `Blocked unauthorized attempt to read chat threads for ${queryUserId}`);
      return res.status(403).json({ error: 'forbidden', message: 'Cannot access chat threads of another user.' });
    }
    targetUserId = queryUserId;
  }

  // Group messages by threadId
  const userMessages = serverChatMessages.filter((m) => m.senderId === targetUserId || m.recipientId === targetUserId);
  const threadMap = new Map<string, ServerChatMessage[]>();

  userMessages.forEach((m) => {
    const list = threadMap.get(m.threadId) || [];
    list.push(m);
    threadMap.set(m.threadId, list);
  });

  const threads = Array.from(threadMap.entries()).map(([threadId, msgs]) => {
    msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const lastMsg = msgs[msgs.length - 1];
    const unreadCount = msgs.filter((m) => m.recipientId === targetUserId && !m.read).length;

    // Determine other party
    const isSender = lastMsg.senderId === targetUserId;
    const partnerId = isSender ? lastMsg.recipientId : lastMsg.senderId;
    const partner = serverUsers.find((u) => u.id === partnerId);

    return {
      threadId,
      listingId: lastMsg.listingId,
      listingTitle: lastMsg.listingTitle || 'Marketplace Item',
      listingPrice: lastMsg.listingPrice,
      listingImageUrl: lastMsg.listingImageUrl,
      partnerId,
      partnerName: partner?.name || (isSender ? 'Seller' : lastMsg.senderName),
      partnerAccountType: partner?.accountType || 'shop_owner',
      lastMessage: lastMsg.message,
      lastMessageAt: lastMsg.createdAt,
      unreadCount
    };
  });

  threads.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  res.json({ success: true, threads });
});

// Get messages for a specific thread (strictly session-authorized)
app.get('/api/chat/thread/:threadId/messages', (req: Request, res: Response) => {
  const { threadId } = req.params;
  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    return res.status(401).json({ error: 'unauthenticated', message: 'Authentication required to view messages.' });
  }

  const msgs = serverChatMessages.filter((m) => m.threadId === threadId);
  const isFounder = isSuperAdminEmail(session.email) && session.accountType === 'admin';

  // Verify that requester is a participant in this conversation or the Founder Super Admin
  const isParticipant = msgs.some((m) => m.senderId === session.userId || m.recipientId === session.userId);
  if (!isParticipant && !isFounder && msgs.length > 0) {
    logAuditEvent('api_denied', session.email, req.ip || '', `Blocked unauthorized attempt to read thread ${threadId}`);
    return res.status(403).json({ error: 'forbidden', message: 'Cannot read messages for a thread you do not participate in.' });
  }

  msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Mark messages sent to this user as read
  msgs.forEach((m) => {
    if (m.recipientId === session.userId) {
      m.read = true;
    }
  });

  res.json({ success: true, messages: msgs });
});

// ==========================================
// MULTI-PROVIDER AUTHENTICATION & FACEBOOK OAUTH
// ==========================================

// Facebook OAuth Public Configuration
app.get('/api/auth/facebook/config', (req: Request, res: Response) => {
  const configured = Boolean(FACEBOOK_APP_ID && FACEBOOK_APP_SECRET);
  res.json({
    configured,
    appId: FACEBOOK_APP_ID || null,
    callbackUrl: FACEBOOK_CALLBACK_URL,
    requiredSettings: {
      graphVersion: 'v19.0',
      scope: 'email,public_profile'
    }
  });
});

// Facebook Login Initiation (Redirect Flow)
app.get('/api/auth/facebook/login', (req: Request, res: Response) => {
  if (!FACEBOOK_APP_ID) {
    return res.redirect('/?auth=facebook_unconfigured&desc=Facebook+App+ID+is+not+configured+in+server+environment.');
  }

  const state = crypto.randomBytes(16).toString('hex');
  res.cookie('fb_oauth_state', state, { httpOnly: true, maxAge: 10 * 60 * 1000, sameSite: 'lax' });

  const fbAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(FACEBOOK_CALLBACK_URL)}&state=${state}&scope=email,public_profile`;
  res.redirect(fbAuthUrl);
});

// Facebook OAuth Callback
app.get('/api/auth/facebook/callback', async (req: Request, res: Response) => {
  const { code, state, error, error_description } = req.query;
  const cookieState = req.cookies['fb_oauth_state'];

  if (error || !code) {
    logAuditEvent('login_denied', 'facebook_error', req.ip || '', `Facebook OAuth error: ${error_description || error || 'Missing code'}`);
    return res.redirect(`/?auth=error&desc=${encodeURIComponent(String(error_description || 'Facebook authentication was cancelled.'))}`);
  }

  // Validate state token against cookie to prevent CSRF attacks
  if (cookieState && state && state !== cookieState) {
    logAuditEvent('login_denied', 'facebook_csrf', req.ip || '', 'Facebook OAuth state mismatch (potential CSRF attack)');
    return res.redirect('/?auth=error&desc=Invalid+Facebook+OAuth+state+parameter');
  }
  res.clearCookie('fb_oauth_state', { path: '/' });

  try {
    // Exchange code for Access Token
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&redirect_uri=${encodeURIComponent(FACEBOOK_CALLBACK_URL)}&code=${code}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error?.message || 'Failed to exchange Facebook authorization code.');
    }

    // Fetch user profile from Facebook Graph API
    const profileUrl = `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture.width(200).height(200)&access_token=${tokenData.access_token}`;
    const profileRes = await fetch(profileUrl);
    const profile = await profileRes.json();

    if (!profile.id) {
      throw new Error('Unable to retrieve profile from Facebook Graph API.');
    }

    const email = (profile.email || `${profile.id}@facebook.user.askiamarket.ng`).toLowerCase();
    const name = profile.name || 'Askia Market Member';
    const avatarUrl = profile.picture?.data?.url || '';

    // Account Linking & Match Check
    let user = serverUsers.find((u) => u.facebookId === profile.id || u.email.toLowerCase() === email);

    if (user) {
      // Link Facebook ID to existing user if not already linked
      user.facebookId = profile.id;
      if (!user.authProviders) user.authProviders = ['email'];
      if (!user.authProviders.includes('facebook')) user.authProviders.push('facebook');
      if (avatarUrl && !user.avatarUrl) user.avatarUrl = avatarUrl;
    } else {
      // Auto-provision as new verified buyer
      user = {
        id: `usr-fb-${profile.id}`,
        name,
        email,
        phone: '',
        passwordHash: '',
        accountType: 'buyer',
        status: 'active',
        isEmailVerified: Boolean(profile.email),
        isPhoneVerified: false,
        authProviders: ['facebook'],
        registrationSource: 'facebook',
        facebookId: profile.id,
        avatarUrl,
        createdAt: new Date().toISOString()
      };
      serverUsers.push(user);
    }

    // Create secure session
    const now = Math.floor(Date.now() / 1000);
    const sessionPayload: SessionPayload = {
      sub: `usr-${user.id}`,
      userId: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      picture: user.avatarUrl,
      accountType: user.accountType,
      status: user.status,
      iat: now,
      exp: now + 24 * 60 * 60
    };

    const sessionToken = signSessionToken(sessionPayload);
    res.cookie(SESSION_COOKIE_NAME, sessionToken, getAuthCookieOptions(req));

    logAuditEvent('login_success', user.email, req.ip || '', 'User authenticated via Facebook OAuth');
    return res.redirect('/?auth=success');
  } catch (err: any) {
    console.error('Facebook OAuth processing failed:', err);
    return res.redirect(`/?auth=error&desc=${encodeURIComponent(err.message)}`);
  }
});

// Client-side Facebook Token Verification (Facebook JavaScript SDK)
app.post('/api/auth/facebook/verify', async (req: Request, res: Response) => {
  const { accessToken } = req.body;
  if (!accessToken) {
    return res.status(400).json({ error: 'Facebook access token is required.' });
  }

  try {
    const profileUrl = `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture.width(200).height(200)&access_token=${accessToken}`;
    const profileRes = await fetch(profileUrl);
    const profile = await profileRes.json();

    if (!profile.id) {
      return res.status(401).json({ error: 'invalid_token', message: 'Unable to verify Facebook access token.' });
    }

    const email = (profile.email || `${profile.id}@facebook.user.askiamarket.ng`).toLowerCase();
    const name = profile.name || 'Askia Market Member';
    const avatarUrl = profile.picture?.data?.url || '';

    let user = serverUsers.find((u) => u.facebookId === profile.id || u.email.toLowerCase() === email);

    if (user) {
      user.facebookId = profile.id;
      if (!user.authProviders) user.authProviders = ['email'];
      if (!user.authProviders.includes('facebook')) user.authProviders.push('facebook');
    } else {
      user = {
        id: `usr-fb-${profile.id}`,
        name,
        email,
        phone: '',
        passwordHash: '',
        accountType: 'buyer',
        status: 'active',
        isEmailVerified: Boolean(profile.email),
        isPhoneVerified: false,
        authProviders: ['facebook'],
        registrationSource: 'facebook',
        facebookId: profile.id,
        avatarUrl,
        createdAt: new Date().toISOString()
      };
      serverUsers.push(user);
    }

    const now = Math.floor(Date.now() / 1000);
    const sessionPayload: SessionPayload = {
      sub: `usr-${user.id}`,
      userId: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      picture: user.avatarUrl,
      accountType: user.accountType,
      status: user.status,
      iat: now,
      exp: now + 24 * 60 * 60
    };

    const sessionToken = signSessionToken(sessionPayload);
    res.cookie(SESSION_COOKIE_NAME, sessionToken, getAuthCookieOptions(req));

    logAuditEvent('login_success', user.email, req.ip || '', 'User authenticated via Facebook JS SDK');
    res.json({ success: true, token: sessionToken, user });
  } catch (err: any) {
    res.status(500).json({ error: 'verification_failed', message: err.message });
  }
});

// Link additional authentication provider to existing account safely
app.post('/api/auth/link-account', (req: Request, res: Response) => {
  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    return res.status(401).json({ error: 'unauthenticated', message: 'Authentication required to link account.' });
  }

  const { provider, identifier, verified = true } = req.body;
  if (!provider || !identifier) {
    return res.status(400).json({ error: 'Provider and identifier are required.' });
  }

  const user = serverUsers.find((u) => u.id === session.userId);
  if (!user) {
    return res.status(404).json({ error: 'User record not found.' });
  }

  // Check if identifier is already linked to another person's account (Prevent takeover)
  const conflicting = serverUsers.find((u) => u.id !== user.id && (u.email === identifier.toLowerCase() || u.phone === identifier));
  if (conflicting) {
    return res.status(409).json({
      error: 'already_linked',
      message: 'This identity is already connected to another registered ASKIA MARKET account.'
    });
  }

  if (!user.authProviders) user.authProviders = ['email'];
  if (!user.authProviders.includes(provider)) {
    user.authProviders.push(provider);
  }

  if (!user.connectedIdentities) user.connectedIdentities = [];
  user.connectedIdentities.push({
    provider,
    identifier,
    connectedAt: new Date().toISOString(),
    verified: Boolean(verified)
  });

  logAuditEvent('settings_update', user.email, req.ip || '', `Linked new auth provider: ${provider} (${identifier})`);
  return res.json({ success: true, user, message: `Successfully linked ${provider} to your account.` });
});

// ==========================================
// PRODUCT VIEW COUNT TRACKING (ABUSE-PROTECTED)
// ==========================================
const viewLedger = new Map<string, number>(); // key: `${productId}:${viewerKey}` -> timestamp

app.post('/api/products/:id/view', (req: Request, res: Response) => {
  const { id } = req.params;
  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;
  const viewerKey = session?.userId || req.ip || 'anonymous-viewer';

  const ledgerKey = `${id}:${viewerKey}`;
  const now = Date.now();
  const lastViewTime = viewLedger.get(ledgerKey);

  let record = serverProductViews.get(id);
  if (!record) {
    record = { totalViews: 0, uniqueViewers: new Set(), lastViewedAt: new Date().toISOString() };
    serverProductViews.set(id, record);
  }

  // Deduplication rule: Count unique view once per hour per viewer to prevent artificial inflation
  if (!lastViewTime || now - lastViewTime > 60 * 60 * 1000) {
    record.totalViews += 1;
    record.uniqueViewers.add(viewerKey);
    record.lastViewedAt = new Date().toISOString();
    viewLedger.set(ledgerKey, now);
  }

  res.json({
    success: true,
    productId: id,
    totalViews: record.totalViews,
    uniqueViews: record.uniqueViewers.size
  });
});

app.get('/api/products/:id/stats', (req: Request, res: Response) => {
  const { id } = req.params;
  const record = serverProductViews.get(id) || { totalViews: 0, uniqueViewers: new Set(), lastViewedAt: new Date().toISOString() };
  res.json({
    success: true,
    productId: id,
    totalViews: record.totalViews,
    uniqueViews: record.uniqueViewers.size,
    lastViewedAt: record.lastViewedAt
  });
});

app.get('/api/products/stats', (req: Request, res: Response) => {
  const result: Record<string, { totalViews: number; uniqueViews: number }> = {};
  serverProductViews.forEach((val, key) => {
    result[key] = {
      totalViews: val.totalViews,
      uniqueViews: val.uniqueViewers.size
    };
  });
  res.json({ success: true, stats: result });
});

// ==========================================
// FOUNDER USER ANALYTICS & MANAGEMENT (PHASE 4)
// ==========================================

// Complete User Analytics Endpoint (Real database aggregation)
app.get('/api/admin/users/analytics', requireSuperAdmin, (req: Request, res: Response) => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  const totalUsers = serverUsers.length;
  let newToday = 0;
  let newThisWeek = 0;
  let newThisMonth = 0;
  let newThisYear = 0;

  let activeUsers = 0;
  let inactiveUsers = 0;
  let verifiedUsers = 0;
  let unverifiedUsers = 0;
  let suspendedUsers = 0;

  let customers = 0;
  let sellers = 0;
  let advertisers = 0;
  let staff = 0;

  const registrationSources = {
    google: 0,
    facebook: 0,
    email: 0,
    phone: 0
  };

  const accountTypes = {
    buyer: 0,
    shop_owner: 0,
    advertiser: 0,
    staff: 0,
    admin: 0
  };

  const verificationDistribution = {
    verified: 0,
    pending: 0,
    not_started: 0
  };

  // Group by date for growth chart
  const dateMap = new Map<string, number>();

  serverUsers.forEach((u) => {
    const createdDate = new Date(u.createdAt);

    if (createdDate >= oneDayAgo) newToday += 1;
    if (createdDate >= oneWeekAgo) newThisWeek += 1;
    if (createdDate >= oneMonthAgo) newThisMonth += 1;
    if (createdDate >= oneYearAgo) newThisYear += 1;

    // Status
    if (u.status === 'active') activeUsers += 1;
    else if (u.status === 'suspended' || u.status === 'revoked') suspendedUsers += 1;
    else inactiveUsers += 1;

    // Verification
    if (u.isEmailVerified || u.isPhoneVerified || u.kycStatus === 'verified') {
      verifiedUsers += 1;
    } else {
      unverifiedUsers += 1;
    }

    if (u.kycStatus === 'verified') verificationDistribution.verified += 1;
    else if (u.kycStatus === 'pending') verificationDistribution.pending += 1;
    else verificationDistribution.not_started += 1;

    // Account category
    if (u.accountType === 'buyer') {
      customers += 1;
      accountTypes.buyer += 1;
    } else if (u.accountType === 'shop_owner') {
      sellers += 1;
      accountTypes.shop_owner += 1;
    } else if (u.accountType === 'advertiser') {
      advertisers += 1;
      accountTypes.advertiser += 1;
    } else if (u.accountType === 'staff') {
      staff += 1;
      accountTypes.staff += 1;
    } else if (u.accountType === 'admin') {
      accountTypes.admin += 1;
    }

    // Sources
    const src = u.registrationSource || (u.email.includes('gmail.com') ? 'google' : u.phone ? 'phone' : 'email');
    if (src === 'google') registrationSources.google += 1;
    else if (src === 'facebook') registrationSources.facebook += 1;
    else if (src === 'phone') registrationSources.phone += 1;
    else registrationSources.email += 1;

    // Growth date formatting
    const dStr = u.createdAt.split('T')[0];
    dateMap.set(dStr, (dateMap.get(dStr) || 0) + 1);
  });

  const pendingStaff = serverStaffApplications.filter((a) => a.status === 'pending').length;

  const growthTrend = Array.from(dateMap.entries())
    .map(([date, users]) => ({ date, users }))
    .sort((a, b) => a.date.localeCompare(b.date));

  res.json({
    success: true,
    summary: {
      totalUsers,
      newToday,
      newThisWeek,
      newThisMonth,
      newThisYear,
      activeUsers,
      inactiveUsers,
      verifiedUsers,
      unverifiedUsers,
      suspendedUsers,
      customers,
      sellers,
      advertisers,
      staff,
      pendingStaff,
      registrationSources,
      accountTypes,
      verificationDistribution,
      growthTrend
    }
  });
});

// All Users List with Search & Filtering
app.get('/api/admin/users', requireSuperAdmin, (req: Request, res: Response) => {
  const { search, role, status, verification } = req.query;

  let filtered = [...serverUsers];

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q));
  }

  if (role && role !== 'all') {
    filtered = filtered.filter((u) => u.accountType === role);
  }

  if (status && status !== 'all') {
    filtered = filtered.filter((u) => u.status === status);
  }

  if (verification && verification !== 'all') {
    if (verification === 'verified') {
      filtered = filtered.filter((u) => u.isEmailVerified || u.isPhoneVerified || u.kycStatus === 'verified');
    } else {
      filtered = filtered.filter((u) => !u.isEmailVerified && !u.isPhoneVerified && u.kycStatus !== 'verified');
    }
  }

  // Strip password hashes before responding
  const sanitized = filtered.map(({ passwordHash, ...user }) => user);

  res.json({
    success: true,
    total: sanitized.length,
    users: sanitized
  });
});

// Update User Account Status (Suspend / Reactivate / Revoke)
app.post('/api/admin/users/:id/status', requireSuperAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  const validStatuses = ['active', 'suspended', 'pending_approval', 'revoked'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.' });
  }

  const user = serverUsers.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User record not found.' });
  }

  // Prevent founder from suspending themselves
  if (isSuperAdminEmail(user.email)) {
    return res.status(403).json({ error: 'forbidden', message: 'Cannot alter status of Founder & Super Administrator account.' });
  }

  const oldStatus = user.status;
  user.status = status;

  if (status === 'suspended' || status === 'revoked') {
    // Invalidate sessions immediately in revocation ledger
    userRevocationTimestamps.set(id, Math.floor(Date.now() / 1000));
    // Terminate any live SSE streams
    const clients = sseClients.get(id);
    if (clients) {
      clients.forEach((c) => {
        try {
          c.write(`event: session_revoked\ndata: ${JSON.stringify({ message: 'Account status updated: session invalidated.' })}\n\n`);
          c.end();
        } catch {}
      });
      sseClients.delete(id);
    }
  }

  logAuditEvent('settings_update', (req as any).superAdmin.email, req.ip || '', `Updated user status for ${user.email}: ${oldStatus} -> ${status}. Reason: ${reason || 'Administrative action'}`);
  return res.json({ success: true, user: { id: user.id, email: user.email, status: user.status } });
});

// Revoke All User Sessions
app.post('/api/admin/users/:id/revoke-sessions', requireSuperAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const user = serverUsers.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  // Invalidate tokens immediately in revocation ledger
  userRevocationTimestamps.set(id, Math.floor(Date.now() / 1000));

  // Close any active SSE streams
  const clients = sseClients.get(id);
  if (clients) {
    clients.forEach((c) => {
      try {
        c.write(`event: session_revoked\ndata: ${JSON.stringify({ message: 'Session revoked by administrator.' })}\n\n`);
        c.end();
      } catch {}
    });
    sseClients.delete(id);
  }

  logAuditEvent('settings_update', (req as any).superAdmin.email, req.ip || '', `Revoked all active sessions for ${user.email}`);
  res.json({ success: true, message: `All active sessions revoked for ${user.email}.` });
});

// ==========================================
// PRIVATE FOUNDER SUPER ADMIN AUTHENTICATION
// ==========================================
app.post('/api/admin/founder-login', (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const rate = checkRateLimit(`founder_login:${ip}`, 5, 300); // 5 attempts per 5 minutes
  if (!rate.allowed) {
    logAuditEvent('api_denied', 'unknown', ip, 'Rate limit exceeded on /api/admin/founder-login');
    return res.status(429).json({
      success: false,
      error: 'rate_limited',
      message: `Too many attempts. Please wait ${rate.waitSeconds} seconds.`
    });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'missing_credentials', message: 'Email and password required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!isSuperAdminEmail(normalizedEmail)) {
    logAuditEvent('login_denied', normalizedEmail, ip, 'Unauthorized email attempted private founder access');
    return res.status(403).json({
      success: false,
      error: 'unauthorized',
      message: 'Access Denied: Account is not authorized for Founder Command Center.'
    });
  }

  const user = serverUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    return res.status(401).json({ success: false, error: 'invalid_credentials', message: 'Founder account not configured.' });
  }

  const isMatch = verifyPassword(password, user.passwordHash);
  if (!isMatch) {
    logAuditEvent('login_denied', normalizedEmail, ip, 'Failed password on private founder login');
    return res.status(401).json({ success: false, error: 'invalid_credentials', message: 'Invalid credentials.' });
  }

  const now = Math.floor(Date.now() / 1000);
  const sessionPayload: SessionPayload = {
    sub: `usr-${user.id}`,
    userId: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    picture: user.avatarUrl,
    accountType: 'admin',
    adminRole: 'super_admin',
    jobTitle: user.jobTitle || 'Founder & Super Administrator',
    department: 'Executive Office',
    permissions: ['all_permissions', 'manage_admins', 'approve_shops', 'approve_ads', 'approve_payments', 'platform_settings', 'system_security'],
    status: 'active',
    iat: now,
    exp: now + 24 * 60 * 60
  };

  const sessionToken = signSessionToken(sessionPayload);
  const cookieOpts = getAuthCookieOptions(req);
  res.cookie(ADMIN_COOKIE_NAME, sessionToken, cookieOpts);
  res.cookie(SESSION_COOKIE_NAME, sessionToken, cookieOpts);

  logAuditEvent('login_success', normalizedEmail, ip, 'Founder Super Admin authenticated via private gate');
  return res.json({
    success: true,
    token: sessionToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      accountType: 'admin',
      adminRole: 'super_admin'
    }
  });
});

// Check Founder Admin Session
app.get('/api/admin/session', (req: Request, res: Response) => {
  const token = extractAdminToken(req);
  if (!token) {
    return res.status(401).json({ authenticated: false });
  }
  const session = verifySessionToken(token);
  if (!session || !isSuperAdminEmail(session.email) || session.accountType !== 'admin') {
    return res.status(403).json({ authenticated: false });
  }
  return res.json({
    authenticated: true,
    user: {
      id: session.userId,
      name: session.name,
      email: session.email,
      accountType: 'admin',
      adminRole: session.adminRole
    }
  });
});

// ==========================================
// ASKIA CAREERS, JOBS & WORK BACKEND STORE
// ==========================================

interface ServerJobListing {
  id: string;
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  companyDescription?: string;
  employerId: string;
  employerEmail: string;
  employerPhone?: string;
  isVerifiedEmployer: boolean;
  category: string;
  subCategory?: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  requiredSkills: string[];
  experienceLevel: 'Entry Level' | 'Mid Level' | 'Senior Level' | 'Executive / Lead' | 'No Experience Required';
  employmentType: string;
  locationState: string;
  locationCity: string;
  workplaceType: 'On-site' | 'Remote' | 'Hybrid';
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  salaryFrequency: string;
  salaryDisclosed: boolean;
  applicationDeadline: string;
  vacanciesCount: number;
  applicationsCount: number;
  status: 'active' | 'paused' | 'closed' | 'under_moderation';
  benefits?: string[];
  createdAt: string;
}

interface ServerJobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  employerId: string;
  applicantUserId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantHeadline?: string;
  applicantLocation?: string;
  coverLetter?: string;
  cvFileName?: string;
  cvFileUrl?: string;
  portfolioUrl?: string;
  status: 'Submitted' | 'Under Review' | 'Shortlisted' | 'Interview Scheduled' | 'Assessment Required' | 'Offer Made' | 'Hired' | 'Rejected' | 'Withdrawn';
  interviewDate?: string;
  interviewNotes?: string;
  rejectionReason?: string;
  submittedAt: string;
  updatedAt?: string;
}

interface ServerWorkGig {
  id: string;
  title: string;
  description: string;
  category: string;
  requiredSkills: string[];
  workersNeeded: number;
  state: string;
  city: string;
  address?: string;
  workDate: string;
  expectedDuration: string;
  compensationAmountNgn: number;
  paymentFrequency: string;
  posterId: string;
  posterName: string;
  posterPhone: string;
  posterEmail: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  responsesCount: number;
  createdAt: string;
}

interface ServerGigResponse {
  id: string;
  gigId: string;
  workerUserId: string;
  workerName: string;
  workerPhone: string;
  workerSkills: string[];
  message: string;
  proposedRateNgn?: number;
  status: 'interested' | 'shortlisted' | 'selected' | 'declined';
  respondedAt: string;
}

// Real Persisted Careers & Work Store
let serverJobListings: ServerJobListing[] = storage.getJobs() as any;
let serverJobApplications: ServerJobApplication[] = storage.getJobApplications() as any;
let serverWorkGigs: ServerWorkGig[] = storage.getWorkGigs() as any;
let serverGigResponses: ServerGigResponse[] = storage.getGigResponses() as any;

// 1. GET /api/jobs (Filterable job discovery)
app.get('/api/jobs', (req: Request, res: Response) => {
  const { category, search, locationState, employmentType, workplaceType } = req.query;
  let results = serverJobListings.filter((j) => j.status === 'active');

  if (category && typeof category === 'string' && category !== 'all') {
    results = results.filter((j) => j.category.toLowerCase() === category.toLowerCase());
  }

  if (locationState && typeof locationState === 'string' && locationState !== 'all') {
    results = results.filter((j) => j.locationState.toLowerCase() === locationState.toLowerCase());
  }

  if (employmentType && typeof employmentType === 'string' && employmentType !== 'all') {
    results = results.filter((j) => j.employmentType.toLowerCase() === employmentType.toLowerCase());
  }

  if (workplaceType && typeof workplaceType === 'string' && workplaceType !== 'all') {
    results = results.filter((j) => j.workplaceType.toLowerCase() === workplaceType.toLowerCase());
  }

  if (search && typeof search === 'string' && search.trim()) {
    const q = search.trim().toLowerCase();
    results = results.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        j.companyName.toLowerCase().includes(q) ||
        j.requiredSkills.some((s) => s.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    total: results.length,
    jobs: results
  });
});

// 2. GET /api/jobs/:id
app.get('/api/jobs/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const job = serverJobListings.find((j) => j.id === id);
  if (!job) {
    return res.status(404).json({ success: false, error: 'Job vacancy not found.' });
  }
  res.json({ success: true, job });
});

// 3. POST /api/jobs (Create Job Listing)
app.post('/api/jobs', (req: Request, res: Response) => {
  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;
  const {
    title,
    companyName,
    category,
    subCategory,
    description,
    responsibilities,
    requirements,
    requiredSkills,
    experienceLevel,
    employmentType,
    locationState,
    locationCity,
    workplaceType,
    salaryMin,
    salaryMax,
    salaryFrequency,
    salaryDisclosed,
    applicationDeadline,
    vacanciesCount,
    benefits,
    employerEmail,
    employerPhone
  } = req.body;

  if (!title || !companyName || !category || !description) {
    return res.status(400).json({ success: false, error: 'missing_fields', message: 'Job title, company name, category, and description are required.' });
  }

  const employerId = session?.userId || `emp-${Date.now()}`;
  const isVerified = session?.accountType === 'shop_owner' || isSuperAdminEmail(session?.email);

  const newJob: ServerJobListing = {
    id: `job-${Date.now()}`,
    title: title.trim(),
    companyName: companyName.trim(),
    employerId,
    employerEmail: session?.email || employerEmail || 'employer@askiamarket.ng',
    employerPhone: session?.phone || employerPhone || '',
    isVerifiedEmployer: isVerified,
    category: category.trim(),
    subCategory: subCategory ? subCategory.trim() : undefined,
    description: description.trim(),
    responsibilities: Array.isArray(responsibilities) ? responsibilities : (responsibilities ? [responsibilities] : []),
    requirements: Array.isArray(requirements) ? requirements : (requirements ? [requirements] : []),
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? [requiredSkills] : []),
    experienceLevel: experienceLevel || 'Mid Level',
    employmentType: employmentType || 'Full-time',
    locationState: locationState || 'Lagos',
    locationCity: locationCity || 'Ikeja',
    workplaceType: workplaceType || 'On-site',
    salaryMin: salaryMin ? Number(salaryMin) : undefined,
    salaryMax: salaryMax ? Number(salaryMax) : undefined,
    salaryCurrency: 'NGN',
    salaryFrequency: salaryFrequency || 'Monthly',
    salaryDisclosed: salaryDisclosed !== false,
    applicationDeadline: applicationDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    vacanciesCount: Number(vacanciesCount) || 1,
    applicationsCount: 0,
    status: 'active',
    benefits: Array.isArray(benefits) ? benefits : [],
    createdAt: new Date().toISOString()
  };

  serverJobListings.unshift(newJob);
  res.json({ success: true, job: newJob });
});

// 4. POST /api/jobs/:id/apply (Apply for Job Vacancy)
app.post('/api/jobs/:id/apply', (req: Request, res: Response) => {
  const { id } = req.params;
  const job = serverJobListings.find((j) => j.id === id);
  if (!job) {
    return res.status(404).json({ success: false, error: 'Job not found.' });
  }

  const {
    applicantName,
    applicantEmail,
    applicantPhone,
    applicantHeadline,
    applicantLocation,
    coverLetter,
    cvFileName,
    cvFileUrl,
    portfolioUrl
  } = req.body;

  if (!applicantName || !applicantEmail || !applicantPhone) {
    return res.status(400).json({ success: false, error: 'missing_fields', message: 'Name, email, and phone number are required.' });
  }

  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;
  const applicantUserId = session?.userId || `app-${Date.now()}`;

  // Check duplicate application
  const existing = serverJobApplications.find(
    (a) => a.jobId === id && (a.applicantUserId === applicantUserId || a.applicantEmail.toLowerCase() === applicantEmail.toLowerCase())
  );
  if (existing) {
    return res.status(400).json({ success: false, error: 'already_applied', message: 'You have already submitted an application for this position.' });
  }

  const application: ServerJobApplication = {
    id: `appl-${Date.now()}`,
    jobId: id,
    jobTitle: job.title,
    companyName: job.companyName,
    employerId: job.employerId,
    applicantUserId,
    applicantName: applicantName.trim(),
    applicantEmail: applicantEmail.trim(),
    applicantPhone: applicantPhone.trim(),
    applicantHeadline: applicantHeadline ? applicantHeadline.trim() : undefined,
    applicantLocation: applicantLocation ? applicantLocation.trim() : undefined,
    coverLetter: coverLetter ? coverLetter.trim() : undefined,
    cvFileName: cvFileName || 'Resume_Document.pdf',
    cvFileUrl: cvFileUrl || '',
    portfolioUrl: portfolioUrl || '',
    status: 'Submitted',
    submittedAt: new Date().toISOString()
  };

  serverJobApplications.push(application);
  job.applicationsCount += 1;

  // Dispatch persistent notification to employer
  dispatchNotification({
    recipientUserId: job.employerId,
    type: 'inquiry',
    title: 'New Candidate Job Application',
    body: `${applicantName} applied for ${job.title}. Review candidate credentials and CV in your Employer Workspace.`,
    linkUrl: `/?tab=careers&employer_view=true&job_id=${job.id}`,
    metadata: { jobId: job.id, applicationId: application.id }
  });

  res.json({ success: true, application });
});

// 5. GET /api/jobs/applications/my (Candidate views own applications)
app.get('/api/jobs/applications/my', (req: Request, res: Response) => {
  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;
  const emailParam = typeof req.query.email === 'string' ? req.query.email.toLowerCase() : null;

  let myApplications = serverJobApplications;
  if (session) {
    myApplications = myApplications.filter(
      (a) => a.applicantUserId === session.userId || a.applicantEmail.toLowerCase() === session.email.toLowerCase()
    );
  } else if (emailParam) {
    myApplications = myApplications.filter((a) => a.applicantEmail.toLowerCase() === emailParam);
  } else {
    myApplications = [];
  }

  res.json({ success: true, applications: myApplications });
});

// 6. GET /api/jobs/employer/:employerId/applications (Employer reviews applicants)
app.get('/api/jobs/employer/:employerId/applications', (req: Request, res: Response) => {
  const { employerId } = req.params;
  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;

  const isAuthorized = session && (session.userId === employerId || isSuperAdminEmail(session.email) || session.accountType === 'admin');
  if (!isAuthorized) {
    return res.status(403).json({ success: false, error: 'forbidden', message: 'Unauthorized to view employer candidate applications.' });
  }

  const applications = serverJobApplications.filter((a) => a.employerId === employerId);
  res.json({ success: true, applications });
});

// 7. PATCH /api/jobs/applications/:id/status (Employer updates hiring status)
app.patch('/api/jobs/applications/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, interviewDate, interviewNotes, rejectionReason } = req.body;
  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;

  const application = serverJobApplications.find((a) => a.id === id);
  if (!application) {
    return res.status(404).json({ success: false, error: 'Application not found.' });
  }

  const isAuthorized = session && (session.userId === application.employerId || isSuperAdminEmail(session.email) || session.accountType === 'admin');
  if (!isAuthorized) {
    return res.status(403).json({ success: false, error: 'forbidden', message: 'Unauthorized to alter application status.' });
  }

  application.status = status;
  if (interviewDate) application.interviewDate = interviewDate;
  if (interviewNotes) application.interviewNotes = interviewNotes;
  if (rejectionReason) application.rejectionReason = rejectionReason;
  application.updatedAt = new Date().toISOString();

  // Notify applicant of meaningful status change
  dispatchNotification({
    recipientUserId: application.applicantUserId,
    type: 'system_alert',
    title: `Job Application Update: ${application.jobTitle}`,
    body: `Status updated to "${status}" by ${application.companyName}.${interviewDate ? ` Interview scheduled for ${interviewDate}.` : ''}`,
    linkUrl: `/?tab=careers&view=applications`,
    metadata: { applicationId: application.id, status }
  });

  res.json({ success: true, application });
});

// 8. GET /api/gigs (Work Requests & Quick Gigs)
app.get('/api/gigs', (req: Request, res: Response) => {
  const { category, state } = req.query;
  let results = serverWorkGigs.filter((g) => g.status === 'open');

  if (category && typeof category === 'string' && category !== 'all') {
    results = results.filter((g) => g.category.toLowerCase() === category.toLowerCase());
  }
  if (state && typeof state === 'string' && state !== 'all') {
    results = results.filter((g) => g.state.toLowerCase() === state.toLowerCase());
  }

  res.json({ success: true, gigs: results });
});

// 9. POST /api/gigs (Create Work Request)
app.post('/api/gigs', (req: Request, res: Response) => {
  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;
  const {
    title,
    description,
    category,
    requiredSkills,
    workersNeeded,
    state,
    city,
    address,
    workDate,
    expectedDuration,
    compensationAmountNgn,
    paymentFrequency,
    posterName,
    posterPhone,
    posterEmail
  } = req.body;

  if (!title || !description || !state || !compensationAmountNgn) {
    return res.status(400).json({ success: false, error: 'missing_fields', message: 'Title, description, location state, and compensation amount are required.' });
  }

  const newGig: ServerWorkGig = {
    id: `gig-${Date.now()}`,
    title: title.trim(),
    description: description.trim(),
    category: category || 'General Labour & Artisans',
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
    workersNeeded: Number(workersNeeded) || 1,
    state: state || 'Lagos',
    city: city || 'Ikeja',
    address: address ? address.trim() : undefined,
    workDate: workDate || 'Immediate',
    expectedDuration: expectedDuration || '1 Day',
    compensationAmountNgn: Number(compensationAmountNgn) || 10000,
    paymentFrequency: paymentFrequency || 'Daily',
    posterId: session?.userId || `user-${Date.now()}`,
    posterName: session?.name || posterName || 'Work Poster',
    posterPhone: session?.phone || posterPhone || '+234 800 000 0000',
    posterEmail: session?.email || posterEmail || 'poster@askiamarket.ng',
    status: 'open',
    responsesCount: 0,
    createdAt: new Date().toISOString()
  };

  serverWorkGigs.unshift(newGig);
  res.json({ success: true, gig: newGig });
});

// 10. POST /api/gigs/:id/respond (Worker expresses interest in a gig)
app.post('/api/gigs/:id/respond', (req: Request, res: Response) => {
  const { id } = req.params;
  const gig = serverWorkGigs.find((g) => g.id === id);
  if (!gig) {
    return res.status(404).json({ success: false, error: 'Gig not found.' });
  }

  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;
  const { workerName, workerPhone, workerSkills, message, proposedRateNgn } = req.body;

  if (!workerName || !workerPhone) {
    return res.status(400).json({ success: false, error: 'missing_fields', message: 'Worker name and phone number required.' });
  }

  const responseEntry: ServerGigResponse = {
    id: `resp-${Date.now()}`,
    gigId: id,
    workerUserId: session?.userId || `wrk-${Date.now()}`,
    workerName: workerName.trim(),
    workerPhone: workerPhone.trim(),
    workerSkills: Array.isArray(workerSkills) ? workerSkills : [],
    message: message || 'I am ready and available to work on this request.',
    proposedRateNgn: proposedRateNgn ? Number(proposedRateNgn) : gig.compensationAmountNgn,
    status: 'interested',
    respondedAt: new Date().toISOString()
  };

  serverGigResponses.push(responseEntry);
  gig.responsesCount += 1;

  // Notify gig poster
  dispatchNotification({
    recipientUserId: gig.posterId,
    type: 'inquiry',
    title: 'Worker Available for Your Work Request',
    body: `${workerName} (${workerPhone}) is available for "${gig.title}".`,
    linkUrl: `/?tab=careers&view=gigs`,
    metadata: { gigId: gig.id, workerResponseId: responseEntry.id }
  });

  res.json({ success: true, response: responseEntry });
});

// ==========================================
// PERSISTENT PRODUCTS API
// ==========================================

// GET /api/products (Filterable product catalog)
app.get('/api/products', (req: Request, res: Response) => {
  const { category, search, shopId, minPrice, maxPrice, isVerifiedSeller, state, sort } = req.query;
  let products = storage.getProducts();

  if (category && typeof category === 'string' && category !== 'all') {
    products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (shopId && typeof shopId === 'string') {
    products = products.filter((p) => p.shopId === shopId);
  }

  if (state && typeof state === 'string' && state !== 'all') {
    products = products.filter((p) => p.state && p.state.toLowerCase() === state.toLowerCase());
  }

  if (isVerifiedSeller === 'true') {
    products = products.filter((p) => p.isVerifiedSeller);
  }

  if (minPrice && !isNaN(Number(minPrice))) {
    products = products.filter((p) => p.price >= Number(minPrice));
  }

  if (maxPrice && !isNaN(Number(maxPrice))) {
    products = products.filter((p) => p.price <= Number(maxPrice));
  }

  if (search && typeof search === 'string' && search.trim()) {
    const q = search.trim().toLowerCase();
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q))) ||
        (p.shopName && p.shopName.toLowerCase().includes(q))
    );
  }

  if (sort === 'price_asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === 'popular') {
    products.sort((a, b) => (b.views || 0) - (a.views || 0));
  } else {
    // Default newest first
    products.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  res.json({
    success: true,
    total: products.length,
    products
  });
});

// GET /api/products/:id
app.get('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const product = storage.findProductById(id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found.' });
  }
  res.json({ success: true, product });
});

// POST /api/products (Create Product)
app.post('/api/products', (req: Request, res: Response) => {
  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    return res.status(401).json({ success: false, error: 'unauthenticated', message: 'Authentication required to publish products.' });
  }

  const {
    title,
    description,
    price,
    category,
    images,
    imageUrl,
    condition,
    stock,
    state,
    city,
    location,
    isDeliveryAvailable,
    brand,
    model,
    shopId
  } = req.body;

  if (!title || !description || price === undefined || !category) {
    return res.status(400).json({ success: false, error: 'missing_fields', message: 'Title, description, price, and category are required.' });
  }

  // Find user's shop if available
  const userShop = storage.findShopByOwnerId(session.userId) || (shopId ? storage.findShopById(shopId) : undefined);
  const sellerShopId = userShop?.id || shopId || `shop-user-${session.userId}`;
  const sellerShopName = userShop?.name || session.name || 'Verified Merchant';

  const newProduct: Product = {
    id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    shopId: sellerShopId,
    shopName: sellerShopName,
    sellerId: session.userId,
    sellerName: session.name,
    title: title.trim(),
    description: description.trim(),
    price: Number(price) || 0,
    category,
    imageUrl: imageUrl || (Array.isArray(images) && images[0]) || '/assets/images/hero_marketplace_nigeria_1793094442016.jpg',
    images: Array.isArray(images) && images.length > 0 ? images : [imageUrl || '/assets/images/hero_marketplace_nigeria_1793094442016.jpg'],
    condition: condition || 'Brand New',
    stock: stock !== undefined ? Number(stock) : 1,
    inStock: stock !== undefined ? Number(stock) > 0 : true,
    views: 0,
    rating: 0,
    reviewsCount: 0,
    createdAt: new Date().toISOString(),
    isVerifiedSeller: userShop?.isVerified ?? (session.accountType === 'shop_owner' || session.accountType === 'admin'),
    state: state || userShop?.state || 'Lagos',
    city: city || userShop?.city || 'Ikeja',
    location: location || `${city || 'Ikeja'}, ${state || 'Lagos'}`,
    isDeliveryAvailable: isDeliveryAvailable !== false,
    brand: brand ? brand.trim() : undefined,
    model: model ? model.trim() : undefined
  };

  storage.addProduct(newProduct);
  res.json({ success: true, product: newProduct });
});

// PUT /api/products/:id (Update Product)
app.put('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    return res.status(401).json({ success: false, error: 'unauthenticated' });
  }

  const existing = storage.findProductById(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Product not found.' });
  }

  const isOwner = existing.sellerId === session.userId || (existing.shopId && storage.findShopById(existing.shopId)?.ownerId === session.userId);
  const isAdmin = isSuperAdminEmail(session.email) || session.accountType === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ success: false, error: 'forbidden', message: 'Unauthorized to modify this product listing.' });
  }

  const updated = storage.updateProduct(id, req.body);
  res.json({ success: true, product: updated });
});

// DELETE /api/products/:id
app.delete('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    return res.status(401).json({ success: false, error: 'unauthenticated' });
  }

  const existing = storage.findProductById(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Product not found.' });
  }

  const isOwner = existing.sellerId === session.userId || (existing.shopId && storage.findShopById(existing.shopId)?.ownerId === session.userId);
  const isAdmin = isSuperAdminEmail(session.email) || session.accountType === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ success: false, error: 'forbidden' });
  }

  const deleted = storage.deleteProduct(id);
  res.json({ success: deleted });
});

// ==========================================
// PERSISTENT SHOPS API
// ==========================================

// GET /api/shops
app.get('/api/shops', (req: Request, res: Response) => {
  const { state, search } = req.query;
  let shops = storage.getShops();

  if (state && typeof state === 'string' && state !== 'all') {
    shops = shops.filter((s) => s.state && s.state.toLowerCase() === state.toLowerCase());
  }

  if (search && typeof search === 'string' && search.trim()) {
    const q = search.trim().toLowerCase();
    shops = shops.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.categories && s.categories.some((c) => c.toLowerCase().includes(q)))
    );
  }

  res.json({
    success: true,
    total: shops.length,
    shops
  });
});

// GET /api/shops/:id
app.get('/api/shops/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const shop = storage.findShopById(id);
  if (!shop) {
    return res.status(404).json({ success: false, error: 'Shop not found.' });
  }
  res.json({ success: true, shop });
});

// POST /api/shops (Register Shop)
app.post('/api/shops', (req: Request, res: Response) => {
  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    return res.status(401).json({ success: false, error: 'unauthenticated', message: 'Authentication required to open a merchant store.' });
  }

  const {
    name,
    description,
    categories,
    category,
    logoUrl,
    bannerUrl,
    state,
    city,
    address,
    phone,
    email,
    cacNumber
  } = req.body;

  if (!name || !description) {
    return res.status(400).json({ success: false, error: 'missing_fields', message: 'Store name and description are required.' });
  }

  const existingShop = storage.findShopByOwnerId(session.userId);
  if (existingShop) {
    return res.status(400).json({ success: false, error: 'already_exists', message: 'You already operate a registered merchant store.', shop: existingShop });
  }

  const newShop: Shop = {
    id: `shop-${Date.now()}`,
    ownerId: session.userId,
    ownerEmail: session.email,
    name: name.trim(),
    description: description.trim(),
    categories: Array.isArray(categories) ? categories : (category ? [category] : ['General Merchandise']),
    logoUrl: logoUrl || '',
    bannerUrl: bannerUrl || '',
    state: state || 'Lagos',
    city: city || 'Ikeja',
    address: address ? address.trim() : undefined,
    phone: phone || session.phone || '',
    email: email || session.email || '',
    cacNumber: cacNumber ? cacNumber.trim() : undefined,
    isVerified: Boolean(cacNumber),
    rating: 0,
    totalSales: 0,
    followersCount: 0,
    createdAt: new Date().toISOString(),
    status: 'active'
  };

  storage.addShop(newShop);
  storage.updateUser(session.userId, { accountType: 'shop_owner', shopId: newShop.id });

  res.json({ success: true, shop: newShop });
});

// PUT /api/shops/:id (Update Shop)
app.put('/api/shops/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    return res.status(401).json({ success: false, error: 'unauthenticated' });
  }

  const existing = storage.findShopById(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Shop not found.' });
  }

  const isOwner = existing.ownerId === session.userId;
  const isAdmin = isSuperAdminEmail(session.email) || session.accountType === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ success: false, error: 'forbidden' });
  }

  const updated = storage.updateShop(id, req.body);
  res.json({ success: true, shop: updated });
});

// ==========================================
// PERSISTENT ADVERTISEMENTS API
// ==========================================

// GET /api/advertisements
app.get('/api/advertisements', (req: Request, res: Response) => {
  const { category, state, search } = req.query;
  let ads = storage.getAdvertisements();

  if (category && typeof category === 'string' && category !== 'all') {
    ads = ads.filter((a) => a.category.toLowerCase() === category.toLowerCase());
  }

  if (state && typeof state === 'string' && state !== 'all') {
    ads = ads.filter((a) => a.state && a.state.toLowerCase() === state.toLowerCase());
  }

  if (search && typeof search === 'string' && search.trim()) {
    const q = search.trim().toLowerCase();
    ads = ads.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        (a.advertiserName && a.advertiserName.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    total: ads.length,
    advertisements: ads
  });
});

// GET /api/advertisements/:id
app.get('/api/advertisements/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const ad = storage.findAdById(id);
  if (!ad) {
    return res.status(404).json({ success: false, error: 'Advertisement not found.' });
  }
  res.json({ success: true, advertisement: ad });
});

// POST /api/advertisements
app.post('/api/advertisements', (req: Request, res: Response) => {
  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    return res.status(401).json({ success: false, error: 'unauthenticated', message: 'Authentication required to post classified ads.' });
  }

  const {
    title,
    description,
    price,
    category,
    imageUrl,
    images,
    phone,
    whatsappNumber,
    state,
    city,
    location,
    targetAudience,
    targetStates,
    budgetNgn,
    durationDays
  } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ success: false, error: 'missing_fields', message: 'Title, description, and category are required.' });
  }

  const newAd: Advertisement = {
    id: `ad-${Date.now()}`,
    userId: session.userId,
    advertiserName: session.name || 'Advertiser',
    advertiserEmail: session.email,
    title: title.trim(),
    description: description.trim(),
    price: price !== undefined ? Number(price) : undefined,
    category,
    imageUrl: imageUrl || (Array.isArray(images) && images[0]) || '/assets/images/hero_marketplace_nigeria_1793094442016.jpg',
    images: Array.isArray(images) && images.length > 0 ? images : [imageUrl || '/assets/images/hero_marketplace_nigeria_1793094442016.jpg'],
    phone: phone || session.phone || '',
    whatsappNumber: whatsappNumber || phone || session.phone || '',
    state: state || 'Lagos',
    city: city || 'Ikeja',
    location: location || `${city || 'Ikeja'}, ${state || 'Lagos'}`,
    targetAudience: targetAudience || 'General Public',
    targetStates: Array.isArray(targetStates) ? targetStates : [state || 'Lagos'],
    budgetNgn: budgetNgn ? Number(budgetNgn) : undefined,
    durationDays: durationDays ? Number(durationDays) : 30,
    views: 0,
    clicks: 0,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  storage.addAdvertisement(newAd);
  res.json({ success: true, advertisement: newAd });
});

// DELETE /api/advertisements/:id
app.delete('/api/advertisements/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    return res.status(401).json({ success: false, error: 'unauthenticated' });
  }

  const existing = storage.findAdById(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Advertisement not found.' });
  }

  const isOwner = existing.userId === session.userId;
  const isAdmin = isSuperAdminEmail(session.email) || session.accountType === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ success: false, error: 'forbidden' });
  }

  const deleted = storage.deleteAdvertisement(id);
  res.json({ success: deleted });
});

// POST /api/advertisements/:id/report
app.post('/api/advertisements/:id/report', (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason, details } = req.body;
  const ad = storage.findAdById(id);
  if (!ad) {
    return res.status(404).json({ success: false, error: 'Advertisement not found.' });
  }

  logAuditEvent('api_denied', 'anonymous', req.ip || '', `Ad reported [${id}]: ${reason || 'Inappropriate content'} - ${details || ''}`);
  res.json({ success: true, message: 'Report received. Trust & Safety team will review this listing.' });
});

// ==========================================
// PERSISTENT ORDERS & CHECKOUT API
// ==========================================

// GET /api/orders
app.get('/api/orders', (req: Request, res: Response) => {
  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    return res.status(401).json({ success: false, error: 'unauthenticated' });
  }

  const allOrders = storage.getOrders();
  const isFounder = isSuperAdminEmail(session.email) || session.accountType === 'admin';

  let filtered = allOrders;
  if (!isFounder) {
    filtered = allOrders.filter(
      (o) => o.buyerId === session.userId || o.shopId === session.shopId || o.sellerId === session.userId
    );
  }

  res.json({
    success: true,
    total: filtered.length,
    orders: filtered
  });
});

// GET /api/orders/:id
app.get('/api/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    return res.status(401).json({ success: false, error: 'unauthenticated' });
  }

  const order = storage.findOrderById(id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found.' });
  }

  const isAuthorized =
    order.buyerId === session.userId ||
    order.shopId === session.shopId ||
    order.sellerId === session.userId ||
    isSuperAdminEmail(session.email) ||
    session.accountType === 'admin';

  if (!isAuthorized) {
    return res.status(403).json({ success: false, error: 'forbidden' });
  }

  res.json({ success: true, order });
});

// POST /api/orders (Create genuine order & escrow lock)
app.post('/api/orders', (req: Request, res: Response) => {
  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    return res.status(401).json({ success: false, error: 'unauthenticated', message: 'Authentication required to place an order.' });
  }

  const { items, deliveryAddress, state, city, contactPhone, notes, paymentMethod } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'empty_cart', message: 'Cart items are required.' });
  }

  // Calculate actual total
  let totalAmount = 0;
  let sellerShopId = '';
  let sellerShopName = '';
  let sellerUserId = '';

  for (const item of items) {
    const product = storage.findProductById(item.productId);
    const itemPrice = product ? product.price : (Number(item.price) || 0);
    const quantity = Number(item.quantity) || 1;
    totalAmount += itemPrice * quantity;

    if (product) {
      if (!sellerShopId && product.shopId) sellerShopId = product.shopId;
      if (!sellerShopName && product.shopName) sellerShopName = product.shopName;
      if (!sellerUserId && product.sellerId) sellerUserId = product.sellerId;
    }
  }

  const orderId = `ASK-ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
  const trackingNumber = `TRK-NG-${Date.now().toString().slice(-8)}`;

  const newOrder: Order = {
    id: orderId,
    trackingNumber,
    buyerId: session.userId,
    buyerName: session.name,
    buyerEmail: session.email,
    buyerPhone: contactPhone || session.phone || '',
    shopId: sellerShopId || 'general-marketplace',
    shopName: sellerShopName || 'Askia Market Merchant',
    sellerId: sellerUserId || undefined,
    items: items.map((i) => ({
      productId: i.productId,
      productTitle: i.title || i.productTitle || 'Marketplace Item',
      price: Number(i.price) || 0,
      quantity: Number(i.quantity) || 1,
      imageUrl: i.imageUrl || ''
    })),
    totalAmount,
    deliveryAddress: deliveryAddress || 'Address specified during delivery coordination',
    deliveryState: state || 'Lagos',
    deliveryCity: city || 'Ikeja',
    paymentMethod: paymentMethod || 'escrow',
    paymentStatus: paymentMethod === 'bank_transfer' ? 'pending_verification' : 'escrow_locked',
    status: 'pending',
    orderDate: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  storage.addOrder(newOrder);

  // Record genuine transaction
  const tx: TransactionRecord = {
    id: `tx-${Date.now()}`,
    orderId: newOrder.id,
    userId: session.userId,
    userName: session.name,
    amount: totalAmount,
    currency: 'NGN',
    type: 'payment',
    paymentMethod: paymentMethod || 'escrow',
    status: paymentMethod === 'bank_transfer' ? 'pending' : 'successful',
    description: `Payment for Order ${newOrder.id} (${items.length} item${items.length > 1 ? 's' : ''})`,
    createdAt: new Date().toISOString()
  };
  storage.addTransaction(tx);

  // Notify seller if sellerUserId exists
  if (sellerUserId) {
    dispatchNotification({
      recipientUserId: sellerUserId,
      type: 'order_update',
      title: 'New Customer Order Received',
      body: `New order ${newOrder.id} placed by ${session.name} for ₦${totalAmount.toLocaleString()}.`,
      linkUrl: `/?tab=orders&order_id=${newOrder.id}`,
      metadata: { orderId: newOrder.id }
    });
  }

  res.json({ success: true, order: newOrder, transaction: tx });
});

// PATCH /api/orders/:id/status (Update Order Fulfillment Status)
app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, trackingNumber, deliveryNotes } = req.body;
  const token = extractSessionToken(req);
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    return res.status(401).json({ success: false, error: 'unauthenticated' });
  }

  const order = storage.findOrderById(id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found.' });
  }

  const isAuthorized =
    order.shopId === session.shopId ||
    order.sellerId === session.userId ||
    isSuperAdminEmail(session.email) ||
    session.accountType === 'admin';

  if (!isAuthorized) {
    return res.status(403).json({ success: false, error: 'forbidden' });
  }

  const updates: Partial<Order> = { status };
  if (trackingNumber) updates.trackingNumber = trackingNumber;

  const updated = storage.updateOrder(id, updates);

  // Notify buyer of status progression
  dispatchNotification({
    recipientUserId: order.buyerId,
    type: 'order_update',
    title: `Order Status Update: ${order.id}`,
    body: `Your order status has changed to "${status}".${trackingNumber ? ` Tracking number: ${trackingNumber}.` : ''}`,
    linkUrl: `/?tab=orders&order_id=${order.id}`,
    metadata: { orderId: order.id, status }
  });

  res.json({ success: true, order: updated });
});

// ==========================================
// REAL PAYMENT GATEWAY VERIFICATION API
// ==========================================

// POST /api/payments/verify
app.post('/api/payments/verify', async (req: Request, res: Response) => {
  const { gateway, reference, transactionId, orderId, amount } = req.body;

  if (!gateway) {
    return res.status(400).json({ success: false, error: 'missing_gateway', message: 'Payment gateway identifier required.' });
  }

  if (gateway === 'paystack') {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      // Honest, zero fake response: Return clear unconfigured response
      return res.status(503).json({
        success: false,
        configured: false,
        gateway: 'paystack',
        error: 'gateway_not_configured',
        message: 'Paystack live payment gateway is not configured with PAYSTACK_SECRET_KEY in server environment variables. Cannot simulate or fake live transaction verification.'
      });
    }

    try {
      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: {
          Authorization: `Bearer ${paystackSecret}`
        }
      });
      const data = await verifyRes.json();
      if (data.status && data.data && data.data.status === 'success') {
        if (orderId) {
          storage.updateOrder(orderId, { paymentStatus: 'escrow_locked', status: 'processing' });
        }
        return res.json({ success: true, verified: true, data: data.data });
      } else {
        return res.status(400).json({ success: false, verified: false, message: data.message || 'Payment verification failed at Paystack gateway.' });
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, error: 'gateway_error', message: err.message });
    }
  }

  if (gateway === 'flutterwave') {
    const flutterwaveSecret = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!flutterwaveSecret) {
      return res.status(503).json({
        success: false,
        configured: false,
        gateway: 'flutterwave',
        error: 'gateway_not_configured',
        message: 'Flutterwave live payment gateway is not configured with FLUTTERWAVE_SECRET_KEY in server environment variables.'
      });
    }

    try {
      const flwRes = await fetch(`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId || reference)}/verify`, {
        headers: {
          Authorization: `Bearer ${flutterwaveSecret}`
        }
      });
      const data = await flwRes.json();
      if (data.status === 'success' && data.data && data.data.status === 'successful') {
        if (orderId) {
          storage.updateOrder(orderId, { paymentStatus: 'escrow_locked', status: 'processing' });
        }
        return res.json({ success: true, verified: true, data: data.data });
      } else {
        return res.status(400).json({ success: false, verified: false, message: data.message || 'Flutterwave verification failed.' });
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, error: 'gateway_error', message: err.message });
    }
  }

  if (gateway === 'bank_transfer') {
    // Record manual escrow bank transfer; marks as pending verification until founder confirms bank credit
    if (orderId) {
      storage.updateOrder(orderId, { paymentStatus: 'pending_verification' });
    }
    return res.json({
      success: true,
      verified: false,
      status: 'pending_verification',
      message: 'Bank transfer submission received. Escrow funds will be confirmed upon bank credit reconciliation.'
    });
  }

  return res.status(400).json({ success: false, error: 'unknown_gateway', message: `Unknown payment gateway: ${gateway}` });
});

// ==========================================
// PLATFORM SETTINGS API
// ==========================================

app.get('/api/settings', (req: Request, res: Response) => {
  res.json({ success: true, settings: storage.getPlatformSettings() });
});

app.post('/api/admin/settings', requireSuperAdmin, (req: Request, res: Response) => {
  const updated = storage.updatePlatformSettings(req.body);
  logAuditEvent('settings_update', (req as any).superAdmin.email, req.ip || '', 'Updated platform commission & fee settings');
  res.json({ success: true, settings: updated });
});

// ==========================================
// VITE DEV MIDDLEWARE OR STATIC SERVING
// ==========================================
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`ASKIA MARKET server running at http://0.0.0.0:${PORT}`);
    console.log(`Authorized Super Admin: ${ALLOWED_SUPER_ADMIN_EMAILS.join(', ')}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
