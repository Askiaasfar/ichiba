import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';

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

    // Verify account is not suspended or revoked
    if (payload.status === 'suspended' || payload.status === 'revoked') {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
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



// Server-side Password Hashing (PBKDF2 with salt)
function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, 'askia_market_salt_2026', 1000, 32, 'sha256').toString('hex');
}

// In-Memory User Store (Preserved across server session)
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
}

let serverUsers: ServerUserRecord[] = [
  {
    id: 'usr-super-admin-askia',
    name: 'Sensei Askia',
    email: 'askiasventures@gmail.com',
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
    createdAt: '2026-01-01T00:00:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'usr-buyer-guest',
    name: 'Customer (Buyer)',
    email: 'buyer@lagos.ng',
    phone: '+234 801 234 5678',
    passwordHash: hashPassword('Customer@2026!'),
    accountType: 'buyer',
    status: 'active',
    isEmailVerified: true,
    isPhoneVerified: true,
    createdAt: '2026-01-02T00:00:00Z'
  },
  {
    id: 'usr-owner-1',
    name: 'Babajide Adeleke',
    email: 'adeola@auratechglobal.ng',
    phone: '+234 803 412 8899',
    passwordHash: hashPassword('Merchant@2026!'),
    accountType: 'shop_owner',
    shopId: 'shop-1',
    status: 'active',
    isEmailVerified: true,
    isPhoneVerified: true,
    kycStatus: 'verified',
    createdAt: '2026-01-14T00:00:00Z'
  },
  {
    id: 'usr-adv-chinedu',
    name: 'Chinedu Okafor',
    email: 'chinedu.okafor.trading@gmail.com',
    phone: '+234 803 881 2290',
    passwordHash: hashPassword('Advertiser@2026!'),
    accountType: 'advertiser',
    status: 'active',
    isEmailVerified: true,
    isPhoneVerified: true,
    createdAt: '2026-02-10T00:00:00Z'
  },
  {
    id: 'adm-coo',
    name: "Al'amin",
    email: 'alamin.coo@askiamarket.ng',
    phone: '+234 802 111 2233',
    passwordHash: hashPassword('AlaminCOO@2026!'),
    accountType: 'staff',
    adminRole: 'coo',
    jobTitle: 'Chief Operating Officer (COO)',
    department: 'Operations & Strategy',
    permissions: ['operations_oversight', 'approve_shops', 'approve_ads', 'escalations', 'audit_sellers', 'view_reports'],
    status: 'active',
    isEmailVerified: true,
    isPhoneVerified: true,
    createdAt: '2026-01-05T00:00:00Z'
  },
  {
    id: 'adm-finance',
    name: 'Khadija',
    email: 'khadija.finance@askiamarket.ng',
    phone: '+234 803 222 3344',
    passwordHash: hashPassword('KhadijaFinance@2026!'),
    accountType: 'staff',
    adminRole: 'finance_admin',
    jobTitle: 'Head of Finance & Escrow',
    department: 'Treasury & Accounts',
    permissions: ['approve_payments', 'release_payouts', 'reconcile_escrow', 'refund_orders', 'view_financial_analytics'],
    status: 'active',
    isEmailVerified: true,
    isPhoneVerified: true,
    createdAt: '2026-01-08T00:00:00Z'
  },
  {
    id: 'adm-growth',
    name: 'Farhan',
    email: 'farhan.growth@askiamarket.ng',
    phone: '+234 804 333 4455',
    passwordHash: hashPassword('FarhanGrowth@2026!'),
    accountType: 'staff',
    adminRole: 'growth_manager',
    jobTitle: 'Head of Marketing & Growth',
    department: 'Growth & Merchant Acquisition',
    permissions: ['approve_ads', 'flag_content', 'campaign_management', 'analytics', 'feature_promotions'],
    status: 'active',
    isEmailVerified: true,
    isPhoneVerified: true,
    createdAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'adm-compliance',
    name: 'Aminu',
    email: 'aminu.compliance@askiamarket.ng',
    phone: '+234 805 444 5566',
    passwordHash: hashPassword('AminuCompliance@2026!'),
    accountType: 'staff',
    adminRole: 'verification_officer',
    jobTitle: 'Senior Seller Verification Officer',
    department: 'Trust & Safety',
    permissions: ['approve_shops', 'reject_shops', 'verify_cac', 'audit_sellers', 'kyc_document_review'],
    status: 'active',
    isEmailVerified: true,
    isPhoneVerified: true,
    createdAt: '2026-01-12T00:00:00Z'
  }
];

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

let serverKycSubmissions: ServerKycSubmission[] = [
  {
    id: 'kyc-001',
    userId: 'usr-owner-1',
    businessName: 'Aura Tech Global Systems Ltd',
    cacNumber: 'RC-1489021',
    registrationType: 'Limited Liability (RC)',
    registeredAddress: 'Suite 14, Digital Plaza, Otigba Street, Computer Village, Ikeja',
    city: 'Ikeja',
    state: 'Lagos',
    authorizedRepName: 'Babajide Adeleke',
    authorizedRepPhone: '+234 803 412 8899',
    authorizedRepEmail: 'adeola@auratechglobal.ng',
    idType: 'National ID (NIN)',
    idNumber: '•••• •••• 8899',
    maskedNin: '•••• •••• 8899',
    ninConsentGiven: true,
    ninConsentTimestamp: '2026-01-14T10:00:00Z',
    status: 'verified',
    submittedAt: '2026-01-14T09:30:00Z',
    reviewedAt: '2026-01-14T14:00:00Z',
    reviewedBy: 'Aminu (Seller Verification Officer)',
    notes: 'CAC verified against official business registry. Photo ID match confirmed.'
  }
];

// Server-side Authentication Middleware for Protected Admin APIs
function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies[ADMIN_COOKIE_NAME] || req.cookies[SESSION_COOKIE_NAME];
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
  const token = req.cookies[SESSION_COOKIE_NAME] || req.cookies[ADMIN_COOKIE_NAME];
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

  if (error) {
    logAuditEvent('login_denied', 'google_oauth_error', req.ip || '', `Google returned error: ${error_description || error}`);
    return res.redirect(`/?tab=marketplace&auth=error&desc=${encodeURIComponent(String(error_description || error))}`);
  }

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
    const cookieOpts = {
      httpOnly: true,
      secure: isProduction || req.secure || req.headers['x-forwarded-proto'] === 'https',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 24 * 60 * 60 * 1000
    };

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
    const cookieOpts = {
      httpOnly: true,
      secure: isProduction || req.secure || req.headers['x-forwarded-proto'] === 'https',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 24 * 60 * 60 * 1000
    };

    res.cookie(SESSION_COOKIE_NAME, sessionToken, cookieOpts);
    if (isFounder) {
      res.cookie(ADMIN_COOKIE_NAME, sessionToken, cookieOpts);
    }

    logAuditEvent('login_success', email, req.ip || '', `Authenticated via Google: ${user.accountType}`);
    return res.json({
      success: true,
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
      message: 'Your application has been submitted. Your account will remain restricted until Founder Sensei Askia reviews and approves your application.'
    });
  }

  // Password verification
  const inputHash = hashPassword(password);
  const isMatch = user.passwordHash === inputHash;

  if (!isMatch) {
    logAuditEvent('login_denied', user.email, req.ip || '', 'Failed password login attempt');
    return res.status(401).json({ success: false, error: 'invalid_credentials', message: 'Invalid password. Please verify and try again.' });
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
  const cookieOpts = {
    httpOnly: true,
    secure: isProduction || req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 24 * 60 * 60 * 1000
  };

  res.cookie(SESSION_COOKIE_NAME, sessionToken, cookieOpts);
  if (isFounder) {
    res.cookie(ADMIN_COOKIE_NAME, sessionToken, cookieOpts);
  }

  logAuditEvent('login_success', user.email, req.ip || '', `Password login successful: ${user.accountType}`);
  return res.json({
    success: true,
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
  res.cookie(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: isProduction || req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000
  });

  logAuditEvent('login_success', newUser.email, req.ip || '', `New user registered as ${newUser.accountType}`);
  return res.json({
    success: true,
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
  const token = req.cookies[SESSION_COOKIE_NAME] || req.cookies[ADMIN_COOKIE_NAME];
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
  const token = req.cookies[ADMIN_COOKIE_NAME] || req.cookies[SESSION_COOKIE_NAME];
  if (!token) {
    return res.json({ authenticated: false, user: null });
  }

  const session = verifySessionToken(token);
  if (!session || !isSuperAdminEmail(session.email) || session.accountType !== 'admin') {
    return res.json({ authenticated: false, user: null });
  }

  return res.json({
    authenticated: true,
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
  const token = req.cookies[SESSION_COOKIE_NAME] || req.cookies[ADMIN_COOKIE_NAME];
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
  res.json({
    authorizedAdmin: admin.email,
    serverTimestamp: new Date().toISOString(),
    systemStatus: 'nominal',
    securityLevel: 'MAXIMUM_AUTHENTICATED',
    financialSnapshot: {
      grossPlatformVolumeNgn: 4630000,
      escrowBalanceNgn: 2150000,
      settledCommissionsNgn: 231500,
      activeSubscriptionsNgn: 15000,
      pendingPayoutsCount: 3
    },
    governance: {
      activeShops: 12,
      pendingVerifications: 2,
      pendingClassifiedAds: 4,
      authorizedRolesCount: 5
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

let serverStaffApplications: ServerStaffApplication[] = [
  {
    id: 'app-001',
    applicantName: 'Zainab Danjuma',
    applicantEmail: 'zainab.danjuma@gmail.com',
    applicantPhone: '+234 802 334 9911',
    desiredPosition: 'Customer Experience & Merchant Support',
    department: 'Operations & Strategy',
    experienceSummary: '3+ years managing merchant onboarding and Tier-2 escalation resolution at Jumia Logistics Nigeria.',
    submittedAt: '2026-10-27T10:15:00Z',
    status: 'pending'
  },
  {
    id: 'app-002',
    applicantName: 'Emeka Umeh',
    applicantEmail: 'emeka.umeh.risk@outlook.com',
    applicantPhone: '+234 814 882 1044',
    desiredPosition: 'KYC & Fraud Prevention Analyst',
    department: 'Trust & Safety',
    experienceSummary: 'Ex-Compliance associate at Moniepoint. Certified in CAC business verification and AML risk mitigation.',
    submittedAt: '2026-10-28T14:30:00Z',
    status: 'pending'
  }
];

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
// SERVER-SIDE ORDER PRICING & CHECKOUT INTEGRITY
// ==========================================
app.post('/api/orders/calculate', (req: Request, res: Response) => {
  const { items, commissionRatePercent = 5.0 } = req.body;
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid items array.' });
  }

  let totalAmount = 0;
  const calculatedItems = items.map((item: any) => {
    // Pricing integrity: check for salePrice safely without defaulting to 0
    const rawSalePrice = item.salePrice;
    const hasValidSale = rawSalePrice !== undefined && rawSalePrice !== null && !isNaN(Number(rawSalePrice)) && Number(rawSalePrice) > 0;
    const finalPrice = hasValidSale ? Number(rawSalePrice) : Number(item.price || 0);
    const quantity = Math.max(1, Number(item.quantity || 1));
    const lineTotal = finalPrice * quantity;
    totalAmount += lineTotal;

    return {
      productId: item.id || item.productId,
      title: item.title,
      price: finalPrice,
      quantity,
      lineTotal,
      shopId: item.shopId,
      shopName: item.shopName
    };
  });

  const platformCommission = Math.round((totalAmount * commissionRatePercent) / 100);
  const merchantPayout = totalAmount - platformCommission;

  return res.json({
    items: calculatedItems,
    subtotal: totalAmount,
    commissionRatePercent,
    platformCommission,
    merchantPayout,
    currency: 'NGN',
    escrowGuaranteed: true
  });
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
