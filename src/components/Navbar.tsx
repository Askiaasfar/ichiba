import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ShoppingBag, Plus, ShieldCheck, Megaphone, User, LogOut, Shield } from 'lucide-react';

interface NavbarProps {
  activeTab: 'marketplace' | 'shops' | 'classifieds' | 'rules';
  setActiveTab: (tab: 'marketplace' | 'shops' | 'classifieds' | 'rules') => void;
  onOpenCart: () => void;
  onOpenCreateModal: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCart,
  onOpenCreateModal,
  onOpenAuthModal
}) => {
  const { cartCount, currentRole, currentUser, logout } = useMarketplace();

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A] text-white border-b border-[#262626] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark in display face */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('marketplace')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
            title="ASKIA MARKET — Your World. Your Market."
          >
            <div className="w-9 h-9 rounded-lg bg-black border border-[#D4AF37]/60 text-[#D4AF37] flex items-center justify-center font-bold text-lg shadow-sm group-hover:border-[#D4AF37] group-hover:scale-105 transition-all">
              <span className="font-serif-brand text-lg font-bold">A</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif-brand text-lg font-bold tracking-wider text-white whitespace-nowrap">
                ASKIA <span className="text-[#D4AF37] font-semibold tracking-normal text-sm font-sans">MARKET</span>
              </span>
              <span className="text-[9px] text-[#D4AF37]/80 tracking-widest uppercase font-light hidden sm:block -mt-1 font-sans">
                Your World. Your Market.
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4 single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#D4AF37] pb-0.5 ${
              activeTab === 'marketplace'
                ? 'text-[#D4AF37] font-semibold border-b-2 border-[#D4AF37]'
                : 'text-slate-300'
            }`}
          >
            Marketplace
          </button>
          <button
            onClick={() => setActiveTab('shops')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-[#D4AF37] pb-0.5 ${
              activeTab === 'shops'
                ? 'text-[#D4AF37] font-semibold border-b-2 border-[#D4AF37]'
                : 'text-slate-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Verified Stores</span>
          </button>
          <button
            onClick={() => setActiveTab('classifieds')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-[#D4AF37] pb-0.5 ${
              activeTab === 'classifieds'
                ? 'text-[#D4AF37] font-semibold border-b-2 border-[#D4AF37]'
                : 'text-slate-300'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Classified Ads</span>
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#D4AF37] pb-0.5 ${
              activeTab === 'rules'
                ? 'text-[#D4AF37] font-semibold border-b-2 border-[#D4AF37]'
                : 'text-slate-300'
            }`}
          >
            Safety & Policy
          </button>
        </nav>

        {/* Zone 3: Primary Action, Cart & Account Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Cart button */}
          <button
            onClick={onOpenCart}
            className="relative p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-slate-800"
            title="Shopping Cart (Verified Shop Purchases)"
          >
            <ShoppingBag className="w-4 h-4 text-slate-200" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-mono-numbers shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Account Button */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-700 hover:border-[#D4AF37]/50 bg-black/40 hover:bg-black text-slate-200 rounded-lg text-xs font-medium transition-colors shrink-0"
            title="Switch account or register"
          >
            <User className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline max-w-[110px] truncate">
              {currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}
            </span>
            {currentUser && (
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                currentUser.accountType === 'admin'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                  : currentUser.accountType === 'shop_owner'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-700 text-slate-300'
              }`}>
                {currentUser.accountType === 'admin' ? 'Super Admin' : currentUser.accountType === 'shop_owner' ? 'Merchant' : 'Ads'}
              </span>
            )}
          </button>

          {/* Action button tailored to active role */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-black bg-[#D4AF37] hover:bg-[#c29f2f] rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>
              {currentRole === 'shop_owner'
                ? 'Add Product'
                : currentRole === 'advertiser'
                ? 'Post Classified Ad'
                : 'Post Listing'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
