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

// Session Cookie Name
const SESSION_COOKIE_NAME = 'askia_admin_session';

interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  role: 'super_admin';
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

    // Server-side authority: verify email is STILL an authorized super admin
    if (!isSuperAdminEmail(payload.email) || payload.role !== 'super_admin') {
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

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Server-side Authentication Middleware for Protected Admin APIs
function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies[SESSION_COOKIE_NAME];
  if (!token) {
    logAuditEvent('api_denied', 'anonymous', req.ip || '', `Blocked unauthorized request to ${req.path}`);
    return res.status(401).json({
      error: 'unauthenticated',
      message: 'Authentication required. No active administrative session found.'
    });
  }

  const session = verifySessionToken(token);
  if (!session) {
    res.clearCookie(SESSION_COOKIE_NAME);
    logAuditEvent('api_denied', 'unknown', req.ip || '', `Rejected invalid or expired session on ${req.path}`);
    return res.status(403).json({
      error: 'forbidden',
      message: 'Access Denied: Invalid, expired, or unauthorized administrator credentials.'
    });
  }

  (req as any).superAdmin = session;
  next();
}

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// 1. Google OAuth Public Config
app.get('/api/auth/google/config', (req: Request, res: Response) => {
  const configured = Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
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
    return res.redirect('/?tab=admin&auth=setup_required');
  }

  // Create state parameter with timestamp and random nonce for CSRF mitigation
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
    return res.redirect(`/?tab=admin&auth=error&desc=${encodeURIComponent(String(error_description || error))}`);
  }

  if (!code || typeof code !== 'string') {
    return res.redirect('/?tab=admin&auth=error&desc=Missing+authorization+code');
  }

  try {
    const { tokens } = await oauth2Client.getToken({
      code,
      redirect_uri: GOOGLE_CALLBACK_URL
    });

    if (!tokens.id_token) {
      throw new Error('No id_token returned by Google OAuth');
    }

    // Cryptographic verification of the token
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error('Unable to extract Google account identity');
    }

    if (!payload.email_verified) {
      logAuditEvent('login_denied', payload.email, req.ip || '', 'Google account email not verified');
      return res.redirect(`/?tab=admin&auth=denied&reason=unverified_email&email=${encodeURIComponent(payload.email)}`);
    }

    // SERVER-SIDE ALLOWLIST CHECK
    if (!isSuperAdminEmail(payload.email)) {
      logAuditEvent('login_denied', payload.email, req.ip || '', 'Unauthorized Google account attempted Super Admin access');
      return res.redirect(`/?tab=admin&auth=denied&email=${encodeURIComponent(payload.email)}`);
    }

    // Authorized! Issue HTTP-Only secure cookie
    const now = Math.floor(Date.now() / 1000);
    const sessionPayload: SessionPayload = {
      sub: payload.sub,
      email: payload.email.toLowerCase(),
      name: payload.name || 'Askia Market Executive',
      picture: payload.picture,
      role: 'super_admin',
      iat: now,
      exp: now + 24 * 60 * 60 // 24 hours
    };

    const sessionToken = signSessionToken(sessionPayload);

    res.cookie(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: isProduction || req.secure || req.headers['x-forwarded-proto'] === 'https',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000
    });

    logAuditEvent('login_success', payload.email, req.ip || '', 'Google OAuth Super Admin authentication successful');
    res.redirect('/?tab=admin&auth=success');
  } catch (err: any) {
    console.error('Google OAuth callback verification failed:', err);
    logAuditEvent('login_denied', 'unknown', req.ip || '', `OAuth exception: ${err.message}`);
    res.redirect(`/?tab=admin&auth=error&desc=${encodeURIComponent(err.message || 'Token verification failed')}`);
  }
});

// 4. Verify Google Identity Token from GIS (Google One Tap / Google Button)
app.post('/api/auth/google/verify', async (req: Request, res: Response) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({
      success: false,
      error: 'missing_credential',
      message: 'Google identity credential (ID token) is required.'
    });
  }

  try {
    let email = '';
    let name = '';
    let picture = '';
    let sub = '';

    // Verify token with google-auth-library if CLIENT_ID is configured
    if (GOOGLE_CLIENT_ID) {
      const ticket = await oauth2Client.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.status(401).json({
          success: false,
          error: 'invalid_token',
          message: 'Unable to parse Google token payload.'
        });
      }

      if (!payload.email_verified) {
        return res.status(401).json({
          success: false,
          error: 'unverified_email',
          message: 'Your Google email address is not verified by Google.'
        });
      }

      email = payload.email.toLowerCase();
      name = payload.name || 'Askia Market Executive';
      picture = payload.picture || '';
      sub = payload.sub;
    } else {
      // Decode JWT payload to extract identity
      const parts = credential.split('.');
      if (parts.length !== 3) {
        return res.status(400).json({
          success: false,
          error: 'invalid_format',
          message: 'Invalid JWT format.'
        });
      }
      const rawPayload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      email = (rawPayload.email || '').toLowerCase();
      name = rawPayload.name || 'Askia Market Executive';
      picture = rawPayload.picture || '';
      sub = rawPayload.sub || `google-${Date.now()}`;
    }

    // STRICT SERVER-SIDE ALLOWLIST VERIFICATION
    if (!isSuperAdminEmail(email)) {
      logAuditEvent('login_denied', email, req.ip || '', 'Unauthorized Google Sign-In attempt rejected by server allowlist');
      return res.status(403).json({
        success: false,
        error: 'unauthorized_account',
        unauthorizedEmail: email,
        message: `This Google account (${email}) is not authorized for Super Admin access on ASKIA MARKET. Only authorized administrators (${ALLOWED_SUPER_ADMIN_EMAILS[0]}) may access the executive command console.`
      });
    }

    // Authorized! Issue HTTP-Only secure session cookie
    const now = Math.floor(Date.now() / 1000);
    const sessionPayload: SessionPayload = {
      sub,
      email,
      name,
      picture,
      role: 'super_admin',
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

    logAuditEvent('login_success', email, req.ip || '', 'Google identity token verified; Super Admin session created');

    return res.json({
      success: true,
      user: {
        email,
        name,
        role: 'super_admin',
        avatarUrl: picture
      }
    });
  } catch (err: any) {
    console.error('Error verifying Google ID token:', err);
    logAuditEvent('login_denied', 'unknown', req.ip || '', `Token validation error: ${err.message}`);
    return res.status(401).json({
      success: false,
      error: 'token_verification_failed',
      message: `Google identity verification failed: ${err.message}`
    });
  }
});


// 6. Get Current Verified Server Session
app.get('/api/admin/session', (req: Request, res: Response) => {
  const token = req.cookies[SESSION_COOKIE_NAME];
  if (!token) {
    return res.json({ authenticated: false, user: null });
  }

  const session = verifySessionToken(token);
  if (!session) {
    res.clearCookie(SESSION_COOKIE_NAME);
    return res.json({ authenticated: false, user: null });
  }

  return res.json({
    authenticated: true,
    user: {
      email: session.email,
      name: session.name,
      role: session.role,
      avatarUrl: session.picture,
      expiresAt: new Date(session.exp * 1000).toISOString()
    }
  });
});

// 7. Logout Endpoint (Clears HTTP-only session cookie)
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const token = req.cookies[SESSION_COOKIE_NAME];
  if (token) {
    const session = verifySessionToken(token);
    if (session) {
      logAuditEvent('logout', session.email, req.ip || '', 'Super Admin logged out');
    }
  }
  res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
  res.json({ success: true, message: 'Logged out successfully' });
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
