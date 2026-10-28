import React, { useState } from 'react';
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
  Award
} from 'lucide-react';

interface SuperAdminLoginGateProps {
  onCancel?: () => void;
}

export const SuperAdminLoginGate: React.FC<SuperAdminLoginGateProps> = ({ onCancel }) => {
  const { loginSuperAdmin, setCurrentRole } = useMarketplace();
  const [email, setEmail] = useState('askiasventures@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsAuthenticating(true);

    setTimeout(() => {
      const result = loginSuperAdmin(email, password);
      setIsAuthenticating(false);

      if (result.success) {
        setAuthSuccess(true);
      } else {
        setError(result.error || 'Access Denied: Invalid Super Admin credentials.');
      }
    }, 400);
  };

  const handleExit = () => {
    if (onCancel) {
      onCancel();
    } else {
      setCurrentRole('buyer');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto font-light">
            Super Administrator Command Console. Restricted to authorized governance credentials.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-7">
          {authSuccess ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base font-serif-brand">Identity Verified</h4>
              <p className="text-xs text-slate-600 font-light">
                Welcome back, Askia Market Administrator. Initializing platform console...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2 animate-in fade-in">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="leading-snug">{error}</div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  Super Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="askiasventures@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs font-mono-numbers focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Authorized email: <strong className="text-slate-800 font-mono">askiasventures@gmail.com</strong>
                </span>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  Super Admin Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter super admin password"
                    className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-xl text-xs font-mono focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-2.5 bg-[#0A0A0A] hover:bg-[#D4AF37] text-white hover:text-black font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 border border-slate-800 hover:border-[#D4AF37]"
              >
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] group-hover:text-black" />
                <span>{isAuthenticating ? 'Authenticating...' : 'Unlock Executive Console'}</span>
              </button>

              {/* Exit Button */}
              <button
                type="button"
                onClick={handleExit}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Public Marketplace</span>
              </button>
            </form>
          )}
        </div>

        {/* Security Footer Notice */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>ASKIA Cryptographic Role Protection</span>
          <span className="font-mono text-[10px] text-slate-400">SESSION: PRIVATE</span>
        </div>
      </div>
    </div>
  );
};
