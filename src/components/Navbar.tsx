import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  ShoppingBag,
  Plus,
  ShieldCheck,
  Megaphone,
  User,
  LogOut,
  Sparkles,
  Tag,
  Shield,
  Menu,
  X,
  Store,
  ChevronDown,
  Layers
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'marketplace' | 'shops' | 'classifieds' | 'rules';
  setActiveTab: (tab: 'marketplace' | 'shops' | 'classifieds' | 'rules') => void;
  onOpenCart: () => void;
  onOpenCreateModal: () => void;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onOpenCustomerPortal?: () => void;
  onFilterDeals?: () => void;
  onSelectCategorySection?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCart,
  onOpenCreateModal,
  onOpenAuthModal,
  onOpenCustomerPortal,
  onFilterDeals,
  onSelectCategorySection
}) => {
  const { cartCount, currentRole, currentUser, isSuperAdmin, logout, setCurrentRole } = useMarketplace();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if current user is logged in as an authenticated non-guest user
  const isLoggedIn = Boolean(
    currentUser &&
    currentUser.id &&
    currentUser.id !== 'usr-buyer-guest' &&
    currentUser.email !== 'buyer@lagos.ng'
  );

  const getRoleBadge = () => {
    if (!currentUser) return null;
    if (isSuperAdmin || currentUser.accountType === 'admin') {
      return (
        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
          Super Admin
        </span>
      );
    }
    if (currentUser.accountType === 'staff') {
      return (
        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40">
          Staff
        </span>
      );
    }
    if (currentUser.accountType === 'shop_owner') {
      return (
        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          Merchant
        </span>
      );
    }
    if (currentUser.accountType === 'advertiser') {
      return (
        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
          Advertiser
        </span>
      );
    }
    return (
      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
        Buyer
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A] text-white border-b border-[#262626] shadow-md w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Official ASKIA MARKET Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setActiveTab('marketplace');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
            title="ASKIA MARKET — Your World. Your Market."
          >
            <div className="w-9 h-9 rounded-lg bg-black border border-[#D4AF37]/70 text-[#D4AF37] flex items-center justify-center font-bold text-lg shadow-sm group-hover:border-[#D4AF37] group-hover:scale-105 transition-all">
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

        {/* Zone 2: Public Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#D4AF37] pb-1 ${
              activeTab === 'marketplace'
                ? 'text-[#D4AF37] font-semibold border-b-2 border-[#D4AF37]'
                : 'text-slate-300'
            }`}
          >
            Marketplace
          </button>

          <button
            onClick={() => setActiveTab('shops')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-[#D4AF37] pb-1 ${
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
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-[#D4AF37] pb-1 ${
              activeTab === 'classifieds'
                ? 'text-[#D4AF37] font-semibold border-b-2 border-[#D4AF37]'
                : 'text-slate-300'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Classified Ads</span>
          </button>

          <button
            onClick={() => {
              if (onSelectCategorySection) {
                onSelectCategorySection();
              } else {
                setActiveTab('marketplace');
              }
            }}
            className="flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-[#D4AF37] text-slate-300 pb-1"
          >
            <Layers className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#D4AF37]" />
            <span>Categories</span>
          </button>

          <button
            onClick={() => {
              if (onFilterDeals) {
                onFilterDeals();
              } else {
                setActiveTab('marketplace');
              }
            }}
            className="flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-[#D4AF37] text-amber-400 pb-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Deals</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#D4AF37] pb-1 ${
              activeTab === 'rules'
                ? 'text-[#D4AF37] font-semibold border-b-2 border-[#D4AF37]'
                : 'text-slate-300'
            }`}
          >
            Safety & Policy
          </button>
        </nav>

        {/* Zone 3: Actions, Cart & Universal Auth */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Cart button */}
          <button
            onClick={onOpenCart}
            className="relative p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-slate-800"
            title="Shopping Cart (Verified Store Purchases)"
          >
            <ShoppingBag className="w-4 h-4 text-slate-200" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-mono-numbers shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* Conditional: If NOT logged in, show clean Sign In & Start Selling buttons */}
          {!isLoggedIn ? (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => onOpenAuthModal('login')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 rounded-lg border border-slate-700 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuthModal('register')}
                className="px-3.5 py-1.5 text-xs font-semibold text-black bg-[#D4AF37] hover:bg-[#c29f2f] rounded-lg transition-colors shadow-sm"
              >
                Start Selling
              </button>
            </div>
          ) : (
            /* Logged-In User Menu Dropdown */
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-700 hover:border-[#D4AF37]/50 bg-black/60 hover:bg-black text-slate-200 rounded-lg text-xs font-medium transition-colors shrink-0"
                title="Account Menu"
              >
                <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="hidden md:inline max-w-[110px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
                {getRoleBadge()}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-[#0A0A0A] border border-[#262626] rounded-xl shadow-2xl p-2 z-50 text-xs text-white animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <div className="px-2.5 py-2 border-b border-[#262626]">
                    <div className="font-bold text-white truncate">{currentUser.name}</div>
                    <div className="text-[11px] text-[#D4AF37] font-mono truncate">{currentUser.email}</div>
                    <div className="mt-1 flex items-center gap-1">
                      {getRoleBadge()}
                      {currentUser.kycStatus === 'verified' && (
                        <span className="text-[9px] px-1 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-semibold">
                          KYC Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="py-1 space-y-0.5">
                    {/* Buyer Dashboard */}
                    {currentUser.accountType === 'buyer' && onOpenCustomerPortal && (
                      <button
                        onClick={() => {
                          onOpenCustomerPortal();
                          setShowUserMenu(false);
                        }}
                        className="w-full px-2.5 py-1.5 text-left hover:bg-white/10 rounded-lg transition-colors flex items-center justify-between text-slate-200"
                      >
                        <span>My Orders & Wishlist</span>
                        <span className="text-[10px] text-[#D4AF37] font-bold">Buyer</span>
                      </button>
                    )}

                    {/* Merchant Dashboard */}
                    {currentUser.accountType === 'shop_owner' && (
                      <button
                        onClick={() => {
                          setCurrentRole('shop_owner');
                          setActiveTab('marketplace');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-2.5 py-1.5 text-left hover:bg-emerald-950/60 text-emerald-400 rounded-lg transition-colors flex items-center justify-between"
                      >
                        <span>Merchant Storefront & Inventory</span>
                        <Store className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Classified Ads Dashboard */}
                    {currentUser.accountType === 'advertiser' && (
                      <button
                        onClick={() => {
                          setCurrentRole('advertiser');
                          setActiveTab('marketplace');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-2.5 py-1.5 text-left hover:bg-amber-950/60 text-amber-400 rounded-lg transition-colors flex items-center justify-between"
                      >
                        <span>Classified Ads Workspace</span>
                        <Megaphone className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Staff Operations Portal */}
                    {currentUser.accountType === 'staff' && (
                      <button
                        onClick={() => {
                          setCurrentRole('admin');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-2.5 py-1.5 text-left hover:bg-blue-950/60 text-blue-300 font-semibold rounded-lg transition-colors flex items-center justify-between"
                      >
                        <span>Staff Operations Console</span>
                        <Shield className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Super Admin Console — Only for authorized Super Admin */}
                    {isSuperAdmin && (
                      <button
                        onClick={() => {
                          setCurrentRole('admin');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-2.5 py-1.5 text-left hover:bg-[#D4AF37]/20 text-[#D4AF37] font-bold rounded-lg transition-colors flex items-center justify-between"
                      >
                        <span>Founder Command Center</span>
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onOpenAuthModal('login');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-2.5 py-1.5 text-left hover:bg-white/10 rounded-lg transition-colors text-slate-300"
                    >
                      Switch Account / Register
                    </button>
                  </div>

                  <div className="pt-1 border-t border-[#262626]">
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-2.5 py-1.5 text-left hover:bg-red-950/60 text-red-400 rounded-lg transition-colors flex items-center justify-between"
                    >
                      <span>Sign Out</span>
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action button tailored to active role */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-black bg-[#D4AF37] hover:bg-[#c29f2f] rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>
              {currentRole === 'shop_owner'
                ? 'Add Product'
                : currentRole === 'advertiser'
                ? 'Post Ad'
                : isSuperAdmin
                ? 'Admin'
                : 'Start Selling'}
            </span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0A0A0A] border-b border-[#262626] px-4 py-3 space-y-2 text-xs">
          <button
            onClick={() => {
              setActiveTab('marketplace');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 px-3 rounded-lg ${
              activeTab === 'marketplace' ? 'bg-[#D4AF37]/20 text-[#D4AF37] font-bold' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            Marketplace
          </button>
          <button
            onClick={() => {
              setActiveTab('shops');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 px-3 rounded-lg flex items-center gap-2 ${
              activeTab === 'shops' ? 'bg-[#D4AF37]/20 text-[#D4AF37] font-bold' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Verified Stores</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('classifieds');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 px-3 rounded-lg flex items-center gap-2 ${
              activeTab === 'classifieds' ? 'bg-[#D4AF37]/20 text-[#D4AF37] font-bold' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Classified Ads</span>
          </button>
          <button
            onClick={() => {
              if (onSelectCategorySection) onSelectCategorySection();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-slate-300 hover:bg-white/5 flex items-center gap-2"
          >
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Categories</span>
          </button>
          <button
            onClick={() => {
              if (onFilterDeals) onFilterDeals();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-amber-400 hover:bg-white/5 flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Deals & Featured</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('rules');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 px-3 rounded-lg ${
              activeTab === 'rules' ? 'bg-[#D4AF37]/20 text-[#D4AF37] font-bold' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            Safety & Policy
          </button>

          {!isLoggedIn && (
            <div className="pt-2 border-t border-[#262626] flex gap-2">
              <button
                onClick={() => {
                  onOpenAuthModal('login');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-center rounded-lg border border-slate-700 text-white font-semibold"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  onOpenAuthModal('register');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-center rounded-lg bg-[#D4AF37] text-black font-semibold"
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
