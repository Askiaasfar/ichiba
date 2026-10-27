import React, { useState } from 'react';
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
  ArrowRight,
  Shield,
  KeyRound,
  Store
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
  const { users, loginAsUser, registerUser } = useMarketplace();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Registration Category: 'shop_owner' | 'advertiser'
  const [accountCategory, setAccountCategory] = useState<'shop_owner' | 'advertiser'>('shop_owner');
  const [regStep, setRegStep] = useState<'pick_category' | 'fill_form'>('pick_category');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Registration fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Shop Owner specific fields
  const [shopName, setShopName] = useState('');
  const [cacNumber, setCacNumber] = useState('');
  const [idType, setIdType] = useState<'National ID (NIN)' | 'International Passport' | "Voter's Card">('National ID (NIN)');
  const [idNumber, setIdNumber] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopCity, setShopCity] = useState('Ikeja');
  const [shopState, setShopState] = useState('Lagos');
  const [shopDesc, setShopDesc] = useState('');

  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const user = users.find(
      (u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase()
    );

    if (user) {
      loginAsUser(user.id);
      onClose();
    } else {
      setLoginError('No registered account found with this email. Select a quick demo profile below or register.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;

    if (accountCategory === 'shop_owner' && (!shopName || !cacNumber)) {
      alert('Please fill in your Shop Name and CAC Registration number for verification.');
      return;
    }

    const newUser = registerUser({
      name,
      email,
      phone,
      accountCategory,
      shopDetails:
        accountCategory === 'shop_owner'
          ? {
              shopName,
              cacNumber,
              idType,
              idNumber: idNumber || 'NIN-109284910',
              address: shopAddress || 'Commercial District, Lagos',
              city: shopCity,
              state: shopState,
              description: shopDesc || `${shopName} retail merchant storefront.`
            }
          : undefined
    });

    setRegSuccess(
      accountCategory === 'shop_owner'
        ? `Shop Owner account created! Your verification request for "${shopName}" has been submitted to the Admin Dashboard for badge approval.`
        : `Classified Ads account created! You can now post ads with subscription credits.`
    );

    setTimeout(() => {
      setRegSuccess(null);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              N
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {mode === 'login' ? 'Account Sign In' : 'Create an Account'}
              </h3>
              <p className="text-[11px] text-slate-500">Nkem Marketplace Commerce & Classifieds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch: Sign In vs Register */}
        <div className="flex border-b border-slate-200 bg-slate-50/30 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLoginError(null);
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              mode === 'login'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setRegStep('pick_category');
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              mode === 'register'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Register (Choose Category)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-xs max-h-[80vh] overflow-y-auto space-y-5">
          {regSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Account Ready!</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                {regSuccess}
              </p>
            </div>
          ) : mode === 'login' ? (
            /* Login Form */
            <div className="space-y-4">
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                {loginError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                    {loginError}
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. admin@nkemmarket.ng or merchant@auratech.ng"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors shadow-sm text-xs"
                >
                  Sign In to Dashboard
                </button>
              </form>

              {/* Quick Preset Accounts Selector for instant review */}
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Quick Access Demo Profiles (Click to log in instantly)
                </span>

                <div className="space-y-1.5">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        loginAsUser(u.id);
                        onClose();
                      }}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-emerald-50/60 hover:border-emerald-300 transition-all text-left flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-md text-white font-bold text-xs ${
                          u.accountType === 'admin'
                            ? 'bg-indigo-600'
                            : u.accountType === 'shop_owner'
                            ? 'bg-emerald-600'
                            : 'bg-amber-500'
                        }`}>
                          {u.accountType === 'admin' ? (
                            <Shield className="w-3.5 h-3.5" />
                          ) : u.accountType === 'shop_owner' ? (
                            <ShieldCheck className="w-3.5 h-3.5" />
                          ) : (
                            <Megaphone className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-xs">
                            {u.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono-numbers">
                            {u.email}
                          </div>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.accountType === 'admin'
                          ? 'bg-indigo-100 text-indigo-900'
                          : u.accountType === 'shop_owner'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {u.accountType === 'admin'
                          ? u.adminRole?.replace('_', ' ')
                          : u.accountType === 'shop_owner'
                          ? 'Shop Owner'
                          : 'Advertiser'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Registration Flow: Two Categories Required */
            <div className="space-y-4">
              {regStep === 'pick_category' ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Select Your Account Category
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Choose how you intend to operate on NkemMarket:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {/* Category 1: Shop Owner */}
                    <button
                      type="button"
                      onClick={() => {
                        setAccountCategory('shop_owner');
                        setRegStep('fill_form');
                      }}
                      className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 ${
                        accountCategory === 'shop_owner'
                          ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0">
                        <Store className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            1. Shop Owner Account
                          </span>
                          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                            Verified Badge
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          For registered retail businesses and vendors. You create a storefront, submit business/CAC details for official verification, and sell products online with integrated payment gateway checkout and commission billing.
                        </p>
                        <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 pt-1">
                          <span>Includes staff sub-roles & online checkout</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </button>

                    {/* Category 2: Classified Ads */}
                    <button
                      type="button"
                      onClick={() => {
                        setAccountCategory('advertiser');
                        setRegStep('fill_form');
                      }}
                      className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 ${
                        accountCategory === 'advertiser'
                          ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl shrink-0">
                        <Megaphone className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            2. Classified Ads Account (Advertiser)
                          </span>
                          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[10px] font-bold rounded">
                            ₦1,000 / 5 Ads
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          For individuals and casual sellers. You only post classified advertisements. Buyers see your postings and contact you directly via your phone, WhatsApp, or address. All ads carry our buyer non-liability caution banner.
                        </p>
                        <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1 pt-1">
                          <span>Direct buyer contact · Subscription bundles</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                /* Registration Details Form */
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-900 text-xs">
                      Category: {accountCategory === 'shop_owner' ? '🏬 Shop Owner Account' : '📢 Classified Ads Account'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setRegStep('pick_category')}
                      className="text-xs text-emerald-700 hover:underline font-semibold"
                    >
                      Change Category
                    </button>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Babatunde Lawal"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 800 000 0000"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-numbers focus:outline-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Additional fields for Shop Owner */}
                  {accountCategory === 'shop_owner' && (
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide block">
                        Shop & Business Verification Details
                      </span>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Shop / Business Name</label>
                        <input
                          type="text"
                          required
                          value={shopName}
                          onChange={(e) => setShopName(e.target.value)}
                          placeholder="e.g. Ikeja Gadget World"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">CAC Registration No.</label>
                          <input
                            type="text"
                            required
                            value={cacNumber}
                            onChange={(e) => setCacNumber(e.target.value)}
                            placeholder="RC-881290"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-numbers focus:outline-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">ID Type</label>
                          <select
                            value={idType}
                            onChange={(e) => setIdType(e.target.value as any)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500"
                          >
                            <option value="National ID (NIN)">National ID (NIN)</option>
                            <option value="International Passport">International Passport</option>
                            <option value="Voter's Card">Voter's Card</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Physical Store Address</label>
                        <input
                          type="text"
                          required
                          value={shopAddress}
                          onChange={(e) => setShopAddress(e.target.value)}
                          placeholder="Shop 12, Commercial Ave, Lagos"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-sm text-xs mt-2"
                  >
                    Complete Registration & Open Dashboard
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
