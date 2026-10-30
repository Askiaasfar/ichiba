import React, { useState, useEffect, useRef } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  X,
  ShieldCheck,
  Megaphone,
  User,
  Lock,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Store,
  Sparkles,
  ArrowRight,
  Shield,
  KeyRound,
  FileText,
  Clock,
  Loader2
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const {
    loginWithEmailOrPhone,
    loginWithGoogleToken,
    registerUniversal,
    requestOtp,
    verifyOtp,
    resetPasswordWithOtp
  } = useMarketplace();

  // Tab mode: 'login' | 'register' | 'forgot_password'
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot_password'>(initialMode);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);

  // Registration state
  const [accountType, setAccountType] = useState<'buyer' | 'shop_owner' | 'advertiser'>('buyer');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Merchant KYC fields
  const [shopName, setShopName] = useState('');
  const [cacNumber, setCacNumber] = useState('');
  const [registeredAddress, setRegisteredAddress] = useState('');
  const [shopCity, setShopCity] = useState('Ikeja');
  const [shopState, setShopState] = useState('Lagos');
  const [idType, setIdType] = useState('National ID (NIN)');
  const [ninNumber, setNinNumber] = useState('');
  const [ninConsent, setNinConsent] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Forgot password / OTP state
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otpMsg, setOtpMsg] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Google OAuth configuration & GIS button container
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab(initialMode);
    setLoginError(null);
    setRegError(null);
    setPendingNotice(null);

    // Fetch Google OAuth Client ID
    fetch('/api/auth/google/config')
      .then((r) => r.json())
      .then((data) => {
        if (data.clientId) {
          setGoogleClientId(data.clientId);
        }
      })
      .catch(() => {});
  }, [isOpen, initialMode]);

  // Initialize Google Identity Services (GIS) button if container is visible
  useEffect(() => {
    if (activeTab === 'login' && googleClientId && (window as any).google?.accounts?.id && googleBtnRef.current) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: { credential?: string }) => {
            if (response.credential) {
              setIsSubmitting(true);
              setLoginError(null);
              setPendingNotice(null);
              const result = await loginWithGoogleToken(response.credential);
              setIsSubmitting(false);

              if (result.success) {
                if (result.pendingApproval) {
                  setPendingNotice(
                    result.user?.message ||
                    'Your application has been submitted. Your account will remain restricted until Founder Sensei Askia reviews and approves your application.'
                  );
                } else {
                  onClose();
                }
              } else {
                setLoginError(result.error || 'Google authentication failed.');
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });

        (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_black',
          size: 'large',
          type: 'standard',
          text: 'continue_with',
          shape: 'rectangular',
          width: 380,
          logo_alignment: 'left'
        });
      } catch (err) {
        console.warn('GIS button render error:', err);
      }
    }
  }, [activeTab, googleClientId, loginWithGoogleToken, onClose]);

  if (!isOpen) return null;

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      setLoginError('Please enter your email/phone and password.');
      return;
    }

    setIsSubmitting(true);
    setLoginError(null);
    setPendingNotice(null);

    const res = await loginWithEmailOrPhone(loginIdentifier, loginPassword);
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      if (res.pendingApproval) {
        setPendingNotice(
          'Your application has been submitted. Your account will remain restricted until Founder Sensei Askia reviews and approves your application.'
        );
      } else {
        setLoginError(res.error || 'Invalid credentials. Please verify and try again.');
      }
    }
  };

  // Handle Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword) {
      setRegError('Please fill in all required personal credentials.');
      return;
    }

    if (regPassword.length < 8) {
      setRegError('Password must be at least 8 characters for security.');
      return;
    }

    // Merchant CAC and 11-digit NIN validation
    if (accountType === 'shop_owner') {
      if (!shopName.trim() || !cacNumber.trim()) {
        setRegError('Store Name and CAC Registration Number are required for verified merchant accounts.');
        return;
      }

      // Check 11-digit NIN
      const cleanNin = ninNumber.replace(/\D/g, '');
      if (cleanNin.length !== 11) {
        setRegError('National Identification Number (NIN) must contain exactly 11 numeric digits.');
        return;
      }

      if (!ninConsent) {
        setRegError('You must provide explicit consent for NIN verification under NDPR guidelines.');
        return;
      }
    }

    setIsSubmitting(true);
    const res = await registerUniversal({
      name: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      password: regPassword,
      accountType,
      shopDetails:
        accountType === 'shop_owner'
          ? {
              shopName: shopName.trim(),
              cacNumber: cacNumber.trim(),
              idType: 'National ID (NIN)',
              idNumber: ninNumber.trim(),
              address: registeredAddress || 'Commercial District',
              city: shopCity,
              state: shopState,
              description: `${shopName.trim()} verified commercial store.`
            }
          : undefined
    });

    setIsSubmitting(false);

    if (res.success) {
      setRegSuccess(
        accountType === 'shop_owner'
          ? `Verified Store registered! Your business CAC (${cacNumber}) and director NIN (${ninNumber.slice(-4)}) have been submitted for manual compliance review.`
          : `Account created successfully! Welcome to ASKIA MARKET.`
      );
      setTimeout(() => {
        setRegSuccess(null);
        onClose();
      }, 2000);
    } else {
      setRegError(res.error || 'Failed to complete registration.');
    }
  };

  // Handle Forgot Password OTP request
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetIdentifier) {
      setOtpError('Please provide your registered email or phone.');
      return;
    }
    setIsSubmitting(true);
    setOtpError(null);
    setOtpMsg(null);

    const res = await requestOtp(resetIdentifier, resetIdentifier.includes('@') ? 'email' : 'phone');
    setIsSubmitting(false);

    if (res.success) {
      setOtpMsg('A secure 6-digit verification code has been dispatched. Valid for 10 minutes.');
      setOtpStep('verify');
    } else {
      setOtpError(res.error || 'Failed to send verification code.');
    }
  };

  // Handle Reset Password with OTP
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode || !newPassword) {
      setOtpError('Please enter the 6-digit code and your new password.');
      return;
    }
    if (newPassword.length < 8) {
      setOtpError('New password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    setOtpError(null);

    const res = await resetPasswordWithOtp(resetIdentifier, resetCode, newPassword);
    setIsSubmitting(false);

    if (res.success) {
      setOtpMsg('Password updated successfully! You may now sign in.');
      setTimeout(() => {
        setActiveTab('login');
        setOtpStep('request');
        setOtpMsg(null);
      }, 1500);
    } else {
      setOtpError(res.error || 'Password reset failed.');
    }
  };

  // Masked NIN preview helper
  const cleanDigits = ninNumber.replace(/\D/g, '');
  const maskedNinPreview =
    cleanDigits.length >= 4
      ? `•••• •••• ${cleanDigits.slice(-4)}`
      : '•••• •••• ••••';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-[#0A0A0A] text-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#262626] animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#262626] bg-black">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-black border border-[#D4AF37]/80 text-[#D4AF37] flex items-center justify-center font-bold text-base shadow-sm font-serif-brand">
              A
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-serif-brand tracking-wide flex items-center gap-1.5">
                <span>ASKIA</span>
                <span className="text-[#D4AF37]">MARKET</span>
              </h3>
              <p className="text-[10px] text-[#D4AF37]/90 uppercase tracking-widest font-light">
                Your World. Your Market.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors hover:bg-white/10"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Universal Mode Tabs */}
        <div className="flex border-b border-[#262626] bg-[#0A0A0A] text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setLoginError(null);
              setPendingNotice(null);
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              activeTab === 'login'
                ? 'border-[#D4AF37] text-[#D4AF37] bg-white/5 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Universal Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setRegError(null);
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              activeTab === 'register'
                ? 'border-[#D4AF37] text-[#D4AF37] bg-white/5 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Register Account
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('forgot_password');
              setOtpError(null);
            }}
            className={`py-3 px-4 text-center transition-colors border-b-2 ${
              activeTab === 'forgot_password'
                ? 'border-[#D4AF37] text-[#D4AF37] bg-white/5 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Recover
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 text-xs max-h-[80vh] overflow-y-auto space-y-4">
          {/* Pending Staff Applicant Notice */}
          {pendingNotice && (
            <div className="p-4 bg-amber-950/40 border border-amber-500/50 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Clock className="w-4 h-4" />
                <span>Restricted Account Status</span>
              </div>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                {pendingNotice}
              </p>
            </div>
          )}

          {/* TAB 1: UNIVERSAL SIGN IN */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-950/40 border border-red-500/50 text-red-300 rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* 1. Official Google Sign-In */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Option 1: Genuine Google Authentication
                </div>
                
                {/* Google Identity Services Render Target */}
                <div ref={googleBtnRef} className="w-full flex justify-center py-1 min-h-[44px]">
                  {/* Fallback standard Google button if GIS client id not loaded */}
                  <a
                    href="/api/auth/google/login"
                    className="w-full py-2.5 px-4 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-semibold flex items-center justify-center gap-3 transition-colors shadow-sm border border-slate-300"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </a>
                </div>
                <p className="text-[10px] text-slate-400 text-center">
                  Founder (askiasventures@gmail.com) is automatically authorized with executive permissions.
                </p>
              </div>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-[#262626] w-full" />
                <span className="bg-[#0A0A0A] px-3 text-[11px] text-slate-400 uppercase font-mono tracking-widest shrink-0">
                  Or Email / Phone
                </span>
                <div className="border-t border-[#262626] w-full" />
              </div>

              {/* 2. Email or Phone + Password Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Email Address or Phone Number
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. askiasventures@gmail.com or +234 803 412 8899"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('forgot_password')}
                      className="text-[11px] text-[#D4AF37] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-[#D4AF37] hover:bg-[#c29f2f] text-black font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <span>Sign In to Dashboard</span>
                  )}
                </button>
              </form>

              {/* Demo Quick Logins for Instant Testing */}
              <div className="pt-3 border-t border-[#262626] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Quick Access Testing Accounts (Click to Fill &amp; Test)
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginIdentifier('askiasventures@gmail.com');
                      setLoginPassword('SenseiAskia@2026!');
                    }}
                    className="p-2 rounded-lg bg-black/60 border border-[#D4AF37]/40 text-left hover:border-[#D4AF37] transition-all"
                  >
                    <div className="font-bold text-[#D4AF37]">Sensei Askia</div>
                    <div className="text-[10px] text-slate-400">Founder &amp; Super Admin</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginIdentifier('adeola@auratechglobal.ng');
                      setLoginPassword('Merchant@2026!');
                    }}
                    className="p-2 rounded-lg bg-black/60 border border-emerald-500/40 text-left hover:border-emerald-400 transition-all"
                  >
                    <div className="font-bold text-emerald-400">Babajide Adeleke</div>
                    <div className="text-[10px] text-slate-400">Verified Merchant</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginIdentifier('chinedu.okafor.trading@gmail.com');
                      setLoginPassword('Advertiser@2026!');
                    }}
                    className="p-2 rounded-lg bg-black/60 border border-amber-500/40 text-left hover:border-amber-400 transition-all"
                  >
                    <div className="font-bold text-amber-400">Chinedu Okafor</div>
                    <div className="text-[10px] text-slate-400">Classified Advertiser</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginIdentifier('buyer@lagos.ng');
                      setLoginPassword('Customer@2026!');
                    }}
                    className="p-2 rounded-lg bg-black/60 border border-slate-700 text-left hover:border-slate-500 transition-all"
                  >
                    <div className="font-bold text-slate-200">Customer Buyer</div>
                    <div className="text-[10px] text-slate-400">Individual Shopper</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UNIVERSAL REGISTRATION */}
          {activeTab === 'register' && (
            <div className="space-y-4">
              {regSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{regSuccess}</span>
                </div>
              )}

              {regError && (
                <div className="p-3 bg-red-950/40 border border-red-500/50 text-red-300 rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Step 1: Select Account Category */}
              <div className="space-y-2">
                <label className="block font-semibold text-slate-300">
                  Select Your Account Category:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountType('buyer')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      accountType === 'buyer'
                        ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-white'
                        : 'border-[#262626] bg-[#141414] text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>1. Buyer</span>
                      <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                      Individual shopper with order tracking and saved items.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountType('shop_owner')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      accountType === 'shop_owner'
                        ? 'border-emerald-500 bg-emerald-500/15 text-white'
                        : 'border-[#262626] bg-[#141414] text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>2. Store Owner</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                      Verified merchant with CAC registration &amp; escrow payouts.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountType('advertiser')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      accountType === 'advertiser'
                        ? 'border-amber-500 bg-amber-500/15 text-white'
                        : 'border-[#262626] bg-[#141414] text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>3. Advertiser</span>
                      <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                      Classified ads subscription (₦1,000 for 5 ads) with direct contacts.
                    </p>
                  </button>
                </div>
              </div>

              {/* Step 2: Form */}
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Babajide Adeleke"
                      className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. merchant@auratech.ng"
                      className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+234 803 412 8899"
                      className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Create Password</label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        className="w-full pl-3 pr-9 py-2 bg-[#141414] border border-[#262626] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Conditional Fields for Merchant Store Owner */}
                {accountType === 'shop_owner' && (
                  <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-3 mt-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Corporate Merchant CAC &amp; Real Identity Verification</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Official Business / Store Name</label>
                        <input
                          type="text"
                          required
                          value={shopName}
                          onChange={(e) => setShopName(e.target.value)}
                          placeholder="e.g. Aura Tech Global Systems Ltd"
                          className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">CAC Registration No. (RC / BN)</label>
                        <input
                          type="text"
                          required
                          value={cacNumber}
                          onChange={(e) => setCacNumber(e.target.value)}
                          placeholder="RC-1489021 or BN-928192"
                          className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Registered Business Address</label>
                      <input
                        type="text"
                        value={registeredAddress}
                        onChange={(e) => setRegisteredAddress(e.target.value)}
                        placeholder="Suite 14, Digital Plaza, Computer Village, Ikeja"
                        className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* 11-Digit NIN with Mandatory Informed Consent */}
                    <div className="space-y-2 pt-2 border-t border-emerald-500/20">
                      <div className="flex items-center justify-between">
                        <label className="block font-semibold text-slate-300">
                          Director National Identification Number (NIN)
                        </label>
                        <span className="font-mono text-[10px] text-emerald-400">
                          Masked Preview: {maskedNinPreview}
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={11}
                        value={ninNumber}
                        onChange={(e) => setNinNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 11-digit numeric NIN"
                        className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                      <div className="flex items-start gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="ninConsentCheckbox"
                          checked={ninConsent}
                          onChange={(e) => setNinConsent(e.target.checked)}
                          className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                        />
                        <label htmlFor="ninConsentCheckbox" className="text-[11px] text-slate-400 leading-snug cursor-pointer">
                          I hereby give explicit, informed consent to ASKIA MARKET to verify my National Identification Number (NIN) for merchant verification pursuant to Nigeria Data Protection Regulation (NDPR) guidelines.
                        </label>
                      </div>

                      <div className="p-2.5 bg-black/60 border border-slate-800 rounded-lg text-[10px] text-slate-400 flex items-start gap-2 mt-1">
                        <FileText className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                        <span>
                          <strong>Real Verification Standard:</strong> When external third-party verification keys are not configured, merchant submissions are placed into <em>Pending Manual Compliance Review</em> for direct officer audit. Fake simulated KYC approvals are never produced.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-[#D4AF37] hover:bg-[#c29f2f] text-black font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Complete Registration</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: FORGOT PASSWORD / OTP RECOVERY */}
          {activeTab === 'forgot_password' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">Account Password Recovery</h4>
                <p className="text-[11px] text-slate-400">
                  Receive a secure 6-digit OTP code to verify identity and reset password.
                </p>
              </div>

              {otpMsg && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs">
                  {otpMsg}
                </div>
              )}

              {otpError && (
                <div className="p-3 bg-red-950/40 border border-red-500/50 text-red-300 rounded-xl text-xs">
                  {otpError}
                </div>
              )}

              {otpStep === 'request' ? (
                <form onSubmit={handleRequestOtp} className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Registered Email Address or Phone
                    </label>
                    <input
                      type="text"
                      required
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      placeholder="e.g. adeola@auratechglobal.ng or +234 803 412 8899"
                      className="w-full px-3 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-[#D4AF37] hover:bg-[#c29f2f] text-black font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    <span>Send 6-Digit OTP Code</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Enter 6-Digit OTP Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.trim())}
                      placeholder="e.g. 849201"
                      className="w-full px-3 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs font-mono text-center tracking-widest text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Set New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full px-3 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpStep('request')}
                      className="flex-1 py-2.5 bg-[#141414] border border-[#262626] text-slate-300 hover:text-white rounded-xl font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 bg-[#D4AF37] hover:bg-[#c29f2f] text-black font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      <span>Confirm &amp; Reset</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
