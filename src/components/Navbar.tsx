import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  ShoppingBag,
  Bell,
  Plus,
  ShieldCheck,
  Megaphone,
  User,
  LogOut,
  Sparkles,
  Layers,
  Search,
  X,
  Menu,
  ChevronDown,
  Home,
  MessageCircle,
  Store,
  Shield
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
  onOpenNotifications?: () => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  selectedCategory?: string;
  setSelectedCategory?: (c: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCart,
  onOpenCreateModal,
  onOpenAuthModal,
  onOpenCustomerPortal,
  onFilterDeals,
  onSelectCategorySection,
  onOpenNotifications,
  searchQuery = '',
  setSearchQuery,
  selectedCategory = 'all',
  setSelectedCategory
}) => {
  const {
    cartCount,
    currentRole,
    currentUser,
    isSuperAdmin,
    logout,
    setCurrentRole,
    unreadNotificationCount,
    chatThreads
  } = useMarketplace();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if current user is logged in
  const isLoggedIn = Boolean(
    currentUser &&
    currentUser.id &&
    currentUser.id !== 'usr-buyer-guest' &&
    currentUser.email !== 'buyer@lagos.ng'
  );

  const totalChatCount = Object.keys(chatThreads || {}).length;

  const getRoleBadge = () => {
    if (!currentUser) return null;
    if (isSuperAdmin || currentUser.accountType === 'admin') {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-[#D4AF37] text-black">
          Super Admin
        </span>
      );
    }
    if (currentUser.accountType === 'staff') {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-blue-600 text-white">
          Staff
        </span>
      );
    }
    if (currentUser.accountType === 'shop_owner') {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-emerald-600 text-white">
          Merchant
        </span>
      );
    }
    if (currentUser.accountType === 'advertiser') {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-amber-600 text-white">
          Advertiser
        </span>
      );
    }
    return (
      <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-neutral-800 text-neutral-200 border border-neutral-700">
        Buyer
      </span>
    );
  };

  return (
    <>
      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-40 bg-[#000000] text-white border-b border-[#262626] shadow-lg w-full">
        {/* Main Desktop & Mobile Header Row */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setActiveTab('marketplace');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-left group focus:outline-none cursor-pointer"
              title="ASKIA MARKET — Your World. Your Market."
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1A1A1A] to-black border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
                <span className="font-serif-brand text-lg font-bold">A</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif-brand text-lg sm:text-xl font-bold tracking-wider text-white whitespace-nowrap leading-tight">
                  ASKIA <span className="text-[#D4AF37] font-semibold text-base font-sans">MARKET</span>
                </span>
                <span className="text-[9px] text-[#D4AF37] tracking-widest uppercase font-light hidden sm:block font-sans -mt-0.5">
                  Your World. Your Market.
                </span>
              </div>
            </button>
          </div>

          {/* Integrated Desktop Search Bar (Amazon / Jiji standard) */}
          {setSearchQuery && (
            <div className="hidden md:flex flex-1 max-w-xl items-center bg-[#121212] border border-[#333333] hover:border-[#D4AF37] focus-within:border-[#D4AF37] focus-within:ring-2 focus-within:ring-[#D4AF37]/20 rounded-xl overflow-hidden transition-all h-10">
              {setSelectedCategory && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-[#1A1A1A] text-neutral-300 text-xs px-2.5 h-full border-r border-[#333333] focus:outline-none cursor-pointer max-w-[130px] truncate"
                  title="Filter by category"
                >
                  <option value="all">All Items</option>
                  <option value="Electronics & Computers">Electronics</option>
                  <option value="Vehicles & Automotive">Vehicles</option>
                  <option value="Fashion & Apparel">Fashion</option>
                  <option value="Solar & Renewable Power">Solar</option>
                  <option value="Real Estate & Rentals">Real Estate</option>
                  <option value="Home & Industrial Machinery">Industrial</option>
                </select>
              )}

              <div className="relative flex-1 flex items-center h-full">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, phones, cars, solar..."
                  className="w-full h-full pl-9 pr-8 bg-transparent text-xs text-white placeholder-neutral-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 text-neutral-400 hover:text-white p-0.5 rounded cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  setActiveTab('marketplace');
                  window.scrollTo({ top: 350, behavior: 'smooth' });
                }}
                className="bg-[#D4AF37] hover:bg-[#C59F28] text-black font-bold px-4 h-full text-xs flex items-center justify-center transition-colors cursor-pointer"
                title="Execute Search"
              >
                Search
              </button>
            </div>
          )}

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-5 text-xs font-semibold text-neutral-300">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`transition-colors whitespace-nowrap hover:text-[#D4AF37] pb-1 cursor-pointer ${
                activeTab === 'marketplace'
                  ? 'text-[#D4AF37] font-bold border-b-2 border-[#D4AF37]'
                  : 'text-neutral-300'
              }`}
            >
              Marketplace
            </button>

            <button
              onClick={() => setActiveTab('shops')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap hover:text-[#D4AF37] pb-1 cursor-pointer ${
                activeTab === 'shops'
                  ? 'text-[#D4AF37] font-bold border-b-2 border-[#D4AF37]'
                  : 'text-neutral-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>Verified Stores</span>
            </button>

            <button
              onClick={() => setActiveTab('classifieds')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap hover:text-[#D4AF37] pb-1 cursor-pointer ${
                activeTab === 'classifieds'
                  ? 'text-[#D4AF37] font-bold border-b-2 border-[#D4AF37]'
                  : 'text-neutral-300'
              }`}
            >
              <Megaphone className="w-4 h-4 text-[#D4AF37]" />
              <span>Classifieds</span>
            </button>

            <button
              onClick={() => {
                if (onFilterDeals) {
                  onFilterDeals();
                } else {
                  setActiveTab('marketplace');
                }
              }}
              className="flex items-center gap-1.5 transition-colors whitespace-nowrap hover:text-[#D4AF37] text-amber-400 pb-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Deals</span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`transition-colors whitespace-nowrap hover:text-[#D4AF37] pb-1 cursor-pointer ${
                activeTab === 'rules'
                  ? 'text-[#D4AF37] font-bold border-b-2 border-[#D4AF37]'
                  : 'text-neutral-300'
              }`}
            >
              Safety & Policy
            </button>
          </nav>

          {/* Right Action Icons (Notifications, Cart, Auth & Post CTA) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Real-time Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-xl transition-colors border border-transparent hover:border-neutral-800 cursor-pointer touch-target flex items-center justify-center"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-neutral-200" />
              {unreadNotificationCount > 0 && (
                <span className="absolute 1 top-1 right-1 bg-[#D4AF37] text-black text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-mono-numbers shadow-sm animate-pulse">
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-xl transition-colors border border-transparent hover:border-neutral-800 cursor-pointer touch-target flex items-center justify-center"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-neutral-200" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#D4AF37] text-black text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-mono-numbers shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth Buttons: Sign In / Account Menu */}
            {!isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="px-3.5 py-2 text-xs font-semibold text-neutral-200 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl border border-neutral-700 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-neutral-700 hover:border-[#D4AF37] bg-neutral-900 text-neutral-200 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                  title="Account Menu"
                >
                  <User className="w-4 h-4 text-[#D4AF37]" />
                  <span className="hidden md:inline max-w-[100px] truncate font-medium">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  {getRoleBadge()}
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {showUserMenu && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-[#0A0A0A] border border-[#262626] rounded-2xl shadow-2xl p-2 z-50 text-xs text-white animate-in fade-in zoom-in-95"
                    onMouseLeave={() => setShowUserMenu(false)}
                  >
                    <div className="px-3 py-2.5 border-b border-[#262626]">
                      <div className="font-bold text-white truncate text-sm">{currentUser.name}</div>
                      <div className="text-[11px] text-[#D4AF37] font-mono truncate">{currentUser.email}</div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        {getRoleBadge()}
                        {currentUser.kycStatus === 'verified' && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-semibold border border-emerald-500/40">
                            KYC Verified
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1.5 space-y-1">
                      {currentUser.accountType === 'buyer' && onOpenCustomerPortal && (
                        <button
                          onClick={() => {
                            onOpenCustomerPortal();
                            setShowUserMenu(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-neutral-800 rounded-xl transition-colors flex items-center justify-between text-neutral-200 font-medium cursor-pointer"
                        >
                          <span>My Orders & Wishlist</span>
                          <span className="text-[10px] text-[#D4AF37] font-bold">Buyer</span>
                        </button>
                      )}

                      {currentUser.accountType === 'shop_owner' && (
                        <button
                          onClick={() => {
                            setCurrentRole('shop_owner');
                            setActiveTab('marketplace');
                            setShowUserMenu(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-emerald-950/60 text-emerald-400 rounded-xl transition-colors flex items-center justify-between font-medium cursor-pointer"
                        >
                          <span>Merchant Storefront & Inventory</span>
                          <Store className="w-4 h-4" />
                        </button>
                      )}

                      {currentUser.accountType === 'advertiser' && (
                        <button
                          onClick={() => {
                            setCurrentRole('advertiser');
                            setActiveTab('marketplace');
                            setShowUserMenu(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-amber-950/60 text-amber-400 rounded-xl transition-colors flex items-center justify-between font-medium cursor-pointer"
                        >
                          <span>Classified Ads Workspace</span>
                          <Megaphone className="w-4 h-4" />
                        </button>
                      )}

                      {currentUser.accountType === 'staff' && (
                        <button
                          onClick={() => {
                            setCurrentRole('admin');
                            setShowUserMenu(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-blue-950/60 text-blue-300 font-semibold rounded-xl transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span>Staff Operations Console</span>
                          <Shield className="w-4 h-4" />
                        </button>
                      )}

                      {isSuperAdmin && (
                        <button
                          onClick={() => {
                            setCurrentRole('admin');
                            setShowUserMenu(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-[#D4AF37]/20 text-[#D4AF37] font-bold rounded-xl transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span>Founder Command Center</span>
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onOpenAuthModal('login');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-neutral-800 rounded-xl transition-colors text-neutral-300 cursor-pointer"
                      >
                        Switch Account / Register
                      </button>
                    </div>

                    <div className="pt-1.5 border-t border-[#262626]">
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-red-950/60 text-red-400 rounded-xl transition-colors flex items-center justify-between font-medium cursor-pointer"
                      >
                        <span>Sign Out</span>
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Primary Action Button (Start Selling / Post Ad) */}
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-bold text-black bg-[#D4AF37] hover:bg-[#C59F28] rounded-xl transition-all whitespace-nowrap shadow-md hover:shadow-[#D4AF37]/20 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
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

            {/* Mobile Hamburger Toggle for expanded options */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-neutral-300 hover:text-white rounded-xl touch-target flex items-center justify-center"
              title="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dedicated Search Row (Sub-header) */}
        {setSearchQuery && (
          <div className="md:hidden px-3 pb-3 pt-1 border-t border-[#1C1C1C] bg-[#0A0A0A]">
            <div className="flex items-center gap-2 bg-[#161616] border border-[#333333] focus-within:border-[#D4AF37] rounded-xl px-3 h-10">
              <Search className="w-4 h-4 text-neutral-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, phones, cars..."
                className="w-full bg-transparent text-xs text-white placeholder-neutral-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-neutral-400 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              {setSelectedCategory && (
                <button
                  onClick={() => {
                    if (onSelectCategorySection) onSelectCategorySection();
                  }}
                  className="text-[11px] font-semibold text-[#D4AF37] whitespace-nowrap pl-1"
                >
                  Categories
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-[#0A0A0A] border-b border-[#262626] px-4 py-3 space-y-1.5 text-xs animate-in slide-in-from-top duration-150">
            <button
              onClick={() => {
                setActiveTab('marketplace');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2.5 px-3 rounded-xl font-medium ${
                activeTab === 'marketplace'
                  ? 'bg-[#D4AF37] text-black font-bold'
                  : 'text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              Marketplace
            </button>
            <button
              onClick={() => {
                setActiveTab('shops');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2.5 px-3 rounded-xl flex items-center gap-2 font-medium ${
                activeTab === 'shops'
                  ? 'bg-[#D4AF37] text-black font-bold'
                  : 'text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>Verified Merchant Stores</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('classifieds');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2.5 px-3 rounded-xl flex items-center gap-2 font-medium ${
                activeTab === 'classifieds'
                  ? 'bg-[#D4AF37] text-black font-bold'
                  : 'text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <Megaphone className="w-4 h-4 text-[#D4AF37]" />
              <span>Classified Ads (Direct Deals)</span>
            </button>
            <button
              onClick={() => {
                if (onFilterDeals) onFilterDeals();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2.5 px-3 rounded-xl text-amber-400 hover:bg-neutral-900 flex items-center gap-2 font-medium"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Spotlight Deals</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('rules');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2.5 px-3 rounded-xl font-medium ${
                activeTab === 'rules'
                  ? 'bg-[#D4AF37] text-black font-bold'
                  : 'text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              Safety, Policy &amp; Rules
            </button>

            {!isLoggedIn && (
              <div className="pt-2 border-t border-neutral-800 flex gap-2">
                <button
                  onClick={() => {
                    onOpenAuthModal('login');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2.5 text-center rounded-xl border border-neutral-700 text-white font-bold"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onOpenAuthModal('register');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2.5 text-center rounded-xl bg-[#D4AF37] text-black font-bold"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Persistent Mobile Bottom Navigation Bar (Amazon / Temu / Jiji style) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-[#262626] flex items-center justify-around px-2 py-1.5 shadow-2xl"
        style={{ paddingBottom: 'calc(0.4rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* Tab 1: Home */}
        <button
          onClick={() => {
            setActiveTab('marketplace');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-colors ${
            activeTab === 'marketplace' ? 'text-[#D4AF37]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Home</span>
        </button>

        {/* Tab 2: Verified Stores */}
        <button
          onClick={() => {
            setActiveTab('shops');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-colors ${
            activeTab === 'shops' ? 'text-[#D4AF37]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Stores</span>
        </button>

        {/* Tab 3: Sell / Post (Center Elevated Gold Button) */}
        <button
          onClick={onOpenCreateModal}
          className="flex flex-col items-center justify-center -mt-4 bg-[#D4AF37] hover:bg-[#C59F28] text-black w-12 h-12 rounded-full shadow-lg border-2 border-black transition-transform active:scale-95 shrink-0"
          title="Post Ad / Sell"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Tab 4: Classifieds */}
        <button
          onClick={() => {
            setActiveTab('classifieds');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-colors ${
            activeTab === 'classifieds' ? 'text-[#D4AF37]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Megaphone className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Ads</span>
        </button>

        {/* Tab 5: Account / Portal */}
        <button
          onClick={() => {
            if (isLoggedIn) {
              if (onOpenCustomerPortal && currentUser.accountType === 'buyer') {
                onOpenCustomerPortal();
              } else if (currentUser.accountType === 'shop_owner') {
                setCurrentRole('shop_owner');
              } else if (currentUser.accountType === 'advertiser') {
                setCurrentRole('advertiser');
              } else if (isSuperAdmin) {
                setCurrentRole('admin');
              } else {
                setShowUserMenu(true);
              }
            } else {
              onOpenAuthModal('login');
            }
          }}
          className="flex flex-col items-center justify-center flex-1 py-1 text-neutral-400 hover:text-white transition-colors"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">
            {isLoggedIn ? 'Account' : 'Sign In'}
          </span>
        </button>
      </nav>
    </>
  );
};
