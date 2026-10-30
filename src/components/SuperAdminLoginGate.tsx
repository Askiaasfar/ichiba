import React, { useState, useEffect, useRef } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  ShieldAlert,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface SuperAdminLoginGateProps {
  onCancel?: () => void;
}

export const SuperAdminLoginGate: React.FC<SuperAdminLoginGateProps> = ({ onCancel }) => {
  const { loginSuperAdmin, loginSuperAdminWithGoogle, setCurrentRole, checkServerAdminSession } = useMarketplace();

  const [email, setEmail] = useState('askiasventures@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [unauthorizedEmail, setUnauthorizedEmail] = useState<string | null>(null);

  // Google OAuth configuration from backend
  const [oauthConfig, setOauthConfig] = useState<{
    configured: boolean;
    clientId: string | null;
    primarySuperAdmin: string;
    callbackUrl: string;
  } | null>(null);

  const [showEmergencyPassword, setShowEmergencyPassword] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Check backend Google OAuth config & URL parameters on mount
  useEffect(() => {
    fetch('/api/auth/google/config')
      .then((r) => r.json())
      .then((data) => {
        setOauthConfig(data);
      })
      .catch((err) => {
        console.error('Failed to load Google OAuth config:', err);
      });

    // Parse URL search params for OAuth redirect results
    const params = new URLSearchParams(window.location.search);
    const authState = params.get('auth');
    const deniedEmail = params.get('email');
    const errorDesc = params.get('desc');

    if (authState === 'success') {
      setIsAuthenticating(true);
      checkServerAdminSession().then((authenticated) => {
        setIsAuthenticating(false);
        if (authenticated) {
          setAuthSuccess(true);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      });
    } else if (authState === 'denied') {
      const emailParsed = deniedEmail || 'an unauthorized account';
      setUnauthorizedEmail(emailParsed);
      setError(`This Google account (${emailParsed}) is not authorized for Super Admin access on ASKIA MARKET. Only the authorized platform founder (askiasventures@gmail.com) may access the executive command console.`);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (authState === 'setup_required') {
      setError('Google OAuth Client ID and Secret must be configured in your server environment (.env).');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (authState === 'error') {
      setError(`Google OAuth authentication failed: ${errorDesc || 'Unknown error'}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [checkServerAdminSession]);

  // Initialize Google Identity Services (GIS) if client_id is present
  useEffect(() => {
    if (oauthConfig?.clientId && (window as any).google?.accounts?.id && googleBtnRef.current) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: oauthConfig.clientId,
          callback: async (response: { credential?: string }) => {
            if (response.credential) {
              setIsAuthenticating(true);
              setError(null);
              setUnauthorizedEmail(null);
              const res = await loginSuperAdminWithGoogle(response.credential);
              setIsAuthenticating(false);
              if (res.success) {
                setAuthSuccess(true);
              } else {
                if (res.unauthorizedEmail) {
                  setUnauthorizedEmail(res.unauthorizedEmail);
                }
                setError(res.error || 'Access Denied: Unauthorized Google account.');
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Render official GIS button inside container
        (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: 360
        });
      } catch (err) {
        console.error('GIS initialization error:', err);
      }
    }
  }, [oauthConfig?.clientId, loginSuperAdminWithGoogle]);

  // Handle Google Sign-In button click
  const handleGoogleSignInClick = () => {
    setError(null);
    setUnauthorizedEmail(null);

    if (oauthConfig?.configured && oauthConfig.clientId) {
      // Trigger genuine Google OAuth 2.0 redirect flow to accounts.google.com
      setIsAuthenticating(true);
      window.location.href = '/api/auth/google/login';
      return;
    }

    // When GOOGLE_CLIENT_ID is not yet configured in .env
    setError(
      'Google Cloud OAuth is not yet configured in the server environment. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env. As Super Admin, you can unlock using your emergency credentials below.'
    );
    setShowEmergencyPassword(true);
  };

  // Administrator credentials login form
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUnauthorizedEmail(null);
    setIsAuthenticating(true);

    try {
      const result = await loginSuperAdmin(email, password);
      setIsAuthenticating(false);

      if (result.success) {
        setAuthSuccess(true);
      } else {
        setError(result.error || 'Access Denied: Invalid Super Admin credentials.');
      }
    } catch (err: any) {
      setIsAuthenticating(false);
      setError(`Authentication server error: ${err.message}`);
    }
  };

  const handleExit = () => {
    if (onCancel) {
      onCancel();
    } else {
      setCurrentRole('buyer');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Accent Strip */}
        <div className="bg-[#0A0A0A] p-7 text-white text-center relative border-b border-[#262626]">
          <div className="w-14 h-14 rounded-2xl bg-black border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="font-serif-brand text-2xl font-bold">A</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-bold tracking-widest uppercase mb-2 border border-[#D4AF37]/30">
            <Lock className="w-3 h-3" />
            <span>Executive Private Access</span>
          </div>

          <h2 className="text-xl font-serif-brand font-bold tracking-wide text-white">
            ASKIA MARKET
          </h2>
          <p className="text-[11px] text-[#D4AF37] tracking-wider uppercase font-medium mt-0.5 font-sans">
            Your World. Your Market.
          </p>
          <p className="text-xs text-stone-300 mt-1 max-w-sm mx-auto font-light">
            Super Administrator Command Console. Restricted strictly to authorized governance identity.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-7 space-y-5 text-xs">
          {authSuccess ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-stone-900 text-base font-serif-brand">Google Identity Verified</h4>
              <p className="text-xs text-stone-600 font-light">
                Welcome back, Askia Market Executive (<strong className="font-mono text-stone-900">askiasventures@gmail.com</strong>). Launching Super Admin Dashboard...
              </p>
            </div>
          ) : (
            <>
              {/* Security Alerts / Error Message */}
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl space-y-1.5 animate-in fade-in">
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="font-semibold text-xs leading-snug">{error}</div>
                  </div>
                  {unauthorizedEmail && (
                    <div className="pl-6 text-[11px] text-red-700">
                      <span>Authenticated account: </span>
                      <strong className="font-mono text-red-900">{unauthorizedEmail}</strong>
                      <p className="mt-1 text-[10px] text-stone-600">
                        Only the verified founder account (<span className="font-mono text-stone-800 font-bold">askiasventures@gmail.com</span>) is granted access.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* PRIMARY AUTHENTICATION: OFFICIAL GOOGLE SIGN-IN */}
              <div className="space-y-3">
                <div className="text-center space-y-1">
                  <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                    Administrator Authentication
                  </span>
                  <p className="text-[11px] text-stone-500">
                    Sign in with your authorized Google account to access platform governance.
                  </p>
                </div>

                {/* Google Official Button Container (Used when GIS is active) */}
                <div ref={googleBtnRef} className="w-full flex justify-center empty:hidden"></div>

                {/* Custom Google Sign-In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignInClick}
                  disabled={isAuthenticating}
                  className="w-full py-3 px-4 bg-white hover:bg-stone-50 text-stone-800 font-semibold rounded-xl border border-stone-300 shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                >
                  {isAuthenticating ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span className="text-xs font-semibold tracking-wide">
                    {isAuthenticating ? 'Connecting to Google Identity...' : 'Continue with Google'}
                  </span>
                </button>

                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/80 text-[11px] text-stone-600 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Authorized Account:</span>
                  </div>
                  <span className="font-mono font-bold text-stone-900">askiasventures@gmail.com</span>
                </div>
              </div>

              {/* Divider for Emergency / Fallback Credentials */}
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white px-2 text-stone-400 font-medium tracking-wider">
                    Emergency Backup
                  </span>
                </div>
              </div>

              {/* Toggle Fallback Password Form */}
              {!showEmergencyPassword ? (
                <button
                  type="button"
                  onClick={() => setShowEmergencyPassword(true)}
                  className="w-full py-1.5 text-[11px] text-stone-500 hover:text-stone-800 font-medium text-center transition-colors cursor-pointer"
                >
                  Unlock using Super Admin Password
                </button>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-3 pt-1">
                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block font-semibold text-stone-700 text-[11px]">
                      Administrator Email
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="askiasventures@gmail.com"
                        className="w-full pl-8 pr-3 py-2 border border-stone-300 rounded-xl text-xs font-mono-numbers focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="block font-semibold text-stone-700 text-[11px]">
                      Administrator Password
                    </label>
                    <div className="relative">
                      <KeyRound className="w-3.5 h-3.5 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter super admin password"
                        className="w-full pl-8 pr-9 py-2 border border-stone-300 rounded-xl text-xs font-mono focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full py-2.5 bg-[#0A0A0A] hover:bg-[#D4AF37] text-white hover:text-black font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer border border-stone-800 hover:border-[#D4AF37]"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37] group-hover:text-black" />
                    <span>Unlock Command Console</span>
                  </button>
                </form>
              )}

              {/* Exit Button */}
              <button
                type="button"
                onClick={handleExit}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Public Marketplace</span>
              </button>
            </>
          )}
        </div>

        {/* Security Footer Notice */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Cryptographic OAuth &amp; Server-Side Session Guard</span>
          </div>
          <span className="font-mono text-[10px] text-stone-400">SESSION: SECURE</span>
        </div>
      </div>
    </div>
  );
};
