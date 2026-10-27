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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark in display face */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('marketplace')}
            className="flex items-center gap-2 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-emerald-700 transition-colors">
              N
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                NkemMarket
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4 single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 pb-0.5 ${
              activeTab === 'marketplace'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'text-slate-600'
            }`}
          >
            Explore All
          </button>
          <button
            onClick={() => setActiveTab('shops')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 pb-0.5 ${
              activeTab === 'shops'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'text-slate-600'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Shops</span>
          </button>
          <button
            onClick={() => setActiveTab('classifieds')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 pb-0.5 ${
              activeTab === 'classifieds'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'text-slate-600'
            }`}
          >
            <Megaphone className="w-4 h-4 text-amber-500" />
            <span>Classified Ads</span>
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 pb-0.5 ${
              activeTab === 'rules'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'text-slate-600'
            }`}
          >
            Platform Policy & Safety
          </button>
        </nav>

        {/* Zone 3: Primary Action, Cart & Account Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Cart button */}
          <button
            onClick={onOpenCart}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Shopping Cart (Verified Shop Purchases)"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center font-mono-numbers shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Account Button */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold transition-colors shrink-0"
            title="Switch account or register"
          >
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline max-w-[110px] truncate">
              {currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}
            </span>
            {currentUser && (
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                currentUser.accountType === 'admin'
                  ? 'bg-indigo-100 text-indigo-900'
                  : currentUser.accountType === 'shop_owner'
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-amber-100 text-amber-900'
              }`}>
                {currentUser.accountType === 'admin' ? 'Admin' : currentUser.accountType === 'shop_owner' ? 'Shop' : 'Ads'}
              </span>
            )}
          </button>

          {/* Action button tailored to active role */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
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
