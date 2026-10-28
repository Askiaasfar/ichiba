import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { UserRole } from '../types/marketplace';
import { ShieldCheck, ShoppingBag, Megaphone, Settings, RefreshCw, User, Shield, Lock, LogOut } from 'lucide-react';

interface RoleSwitcherBarProps {
  onOpenAuthModal?: () => void;
}

export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({ onOpenAuthModal }) => {
  const {
    currentRole,
    setCurrentRole,
    currentUser,
    isSuperAdmin,
    users,
    loginAsUser,
    logout,
    currentAdvertiserSubscription,
    currentShop,
    resetDemoData
  } = useMarketplace();

  const handleRoleSelect = (roleId: UserRole) => {
    setCurrentRole(roleId);
    if (roleId === 'admin') {
      // Admin dashboard is private; requires Super Admin authentication
      return;
    }
    // Find matching user for role to align currentUser
    const matchingUser = users.find((u) => u.accountType === roleId);
    if (matchingUser) {
      loginAsUser(matchingUser.id);
    }
  };

  const roles: { id: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'buyer',
      label: 'Buyer View',
      icon: <ShoppingBag className="w-3.5 h-3.5" />,
      desc: 'Browse, buy from verified shops & view classifieds with safety caution'
    },
    {
      id: 'shop_owner',
      label: 'Shop Owner Account',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />,
      desc: 'Store catalog, staff roles, verification badge, online orders'
    },
    {
      id: 'advertiser',
      label: 'Classified Ads Account',
      icon: <Megaphone className="w-3.5 h-3.5 text-amber-600" />,
      desc: '₦1,000 / 5 Ads bundle, direct buyer contacts, caution notice'
    },
    {
      id: 'admin',
      label: isSuperAdmin ? "Super Admin Portal" : "Admin (🔒 Super Admin Only)",
      icon: isSuperAdmin ? <Shield className="w-3.5 h-3.5 text-indigo-400" /> : <Lock className="w-3.5 h-3.5 text-indigo-400" />,
      desc: 'Private platform management dashboard for Askia Market Super Admin'
    }
  ];

  return (
    <div className="bg-slate-900 text-slate-200 text-xs border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Role Segmented Controller */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-slate-400 font-medium shrink-0 mr-1 hidden md:inline">
            Active Workspace:
          </span>
          {roles.map((r) => {
            const isActive = currentRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => handleRoleSelect(r.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#D4AF37] text-black font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title={r.desc}
              >
                {r.icon}
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Context Pill & Demo Reset */}
        <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-400">
          {isSuperAdmin ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-950 border border-indigo-700/80 text-indigo-200 shadow-xs">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                <strong>{currentUser.name}</strong> ({currentUser.email})
              </span>
              <button
                onClick={() => logout()}
                className="ml-1.5 px-1.5 py-0.5 rounded bg-red-900/60 hover:bg-red-800 text-red-200 text-[10px] font-bold transition-colors"
                title="Log out of Super Admin session"
              >
                Log Out Admin
              </button>
            </div>
          ) : currentUser ? (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Click to switch account or sign in"
            >
              <User className="w-3 h-3 text-slate-400" />
              <span>{currentUser.name}</span>
            </button>
          ) : null}

          {currentRole === 'shop_owner' && currentShop && (
            <div className="hidden lg:flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {currentShop.name} · <strong className="font-mono-numbers">{currentShop.isVerified ? currentShop.verificationBadgeNumber : 'Pending Review'}</strong>
              </span>
            </div>
          )}

          {currentRole === 'advertiser' && (
            <div className="hidden lg:flex items-center gap-1.5 text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
              <Megaphone className="w-3.5 h-3.5" />
              <span>
                {currentAdvertiserSubscription?.remainingAds ?? 0} of{' '}
                {currentAdvertiserSubscription?.totalAdsAllowed ?? 5} Ads remaining
              </span>
            </div>
          )}

          <button
            onClick={() => {
              if (confirm('Reset demo data back to initial Nigerian sample stores and classifieds?')) {
                resetDemoData();
              }
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors ml-2"
            title="Reset demo data"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
