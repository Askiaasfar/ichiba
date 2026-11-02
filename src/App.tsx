import React, { useState, useMemo } from 'react';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { CustomerPortal } from './components/CustomerPortal';
import { StaffApplicationModal } from './components/StaffApplicationModal';
import { CareersSection } from './components/CareersSection';

import { Navbar } from './components/Navbar';
import { MarketplaceHero } from './components/MarketplaceHero';
import { ListingCard } from './components/ListingCard';
import { ItemDetailModal } from './components/ItemDetailModal';
import { ShopDetailModal } from './components/ShopDetailModal';
import { ShopOwnerPortal } from './components/ShopOwnerPortal';
import { AdvertiserPortal } from './components/AdvertiserPortal';
import { AdminPortal } from './components/AdminPortal';
import { PaymentModal } from './components/PaymentModal';
import { CartDrawer } from './components/CartDrawer';
import { RulesAndSafetyTab } from './components/RulesAndSafetyTab';
import { CautionNoticeBanner } from './components/CautionNoticeBanner';
import { AuthModal } from './components/AuthModal';
import { ChatModal } from './components/ChatModal';
import { SuperAdminLoginGate } from './components/SuperAdminLoginGate';
import { NotificationDrawer } from './components/NotificationDrawer';
import { NotificationToast } from './components/NotificationToast';
import { Product, Advertisement, Shop } from './types/marketplace';
import { MARKETPLACE_CATEGORIES } from './data/categoriesData';
import { NIGERIAN_STATES } from './data/initialData';
import {
  Search,
  Filter,
  ShieldCheck,
  Megaphone,
  Sparkles,
  MapPin,
  Store,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  User,
  Shield,
  ArrowRight
} from 'lucide-react';

type ListingItem = 
  | { type: 'product'; data: Product }
  | { type: 'ad'; data: Advertisement };

const MainMarketplaceApp: React.FC = () => {
  const {
    products,
    advertisements,
    shops,
    currentRole,
    setCurrentRole,
    currentUser,
    isSuperAdmin,
    platformSettings
  } = useMarketplace();

  // Navigation tabs
  const [activeNavTab, setActiveNavTab] = useState<'marketplace' | 'shops' | 'classifieds' | 'rules' | 'careers'>('marketplace');
  
  // Feed filters
  const [feedTypeFilter, setFeedTypeFilter] = useState<'all' | 'verified' | 'advertisement' | 'featured'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price_low' | 'price_high' | 'popular' | 'newest'>('recommended');

  // Modals state
  const [selectedItem, setSelectedItem] = useState<ListingItem | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [paymentItem, setPaymentItem] = useState<{
    type: 'ad_subscription' | 'feature_product' | 'feature_ad';
    id: string;
    title: string;
    price: number;
  } | null>(null);
  const [showPostChooser, setShowPostChooser] = useState(false);
  const [isStaffAppOpen, setIsStaffAppOpen] = useState(false);
  const [showCustomerPortal, setShowCustomerPortal] = useState(false);


  // Private founder entry route & tab param sync
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('founder_portal') === 'active' || window.location.hash === '#founder-entry') {
      setCurrentRole('admin');
    }
    if (params.get('tab') === 'careers') {
      setActiveNavTab('careers');
    }
  }, [setCurrentRole]);

  // Combine products and approved active advertisements into unified feed
  const combinedListings: ListingItem[] = useMemo(() => {
    const list: ListingItem[] = [];

    // Add verified products
    products.forEach((p) => {
      list.push({ type: 'product', data: p });
    });

    // Add only approved active classified advertisements to public feed
    advertisements
      .filter((a) => a.status === 'active')
      .forEach((a) => {
        list.push({ type: 'ad', data: a });
      });

    // Sort: Featured items first, then newer items
    return list.sort((a, b) => {
      const aFeat = a.data.isFeatured ? 1 : 0;
      const bFeat = b.data.isFeatured ? 1 : 0;
      if (aFeat !== bFeat) return bFeat - aFeat;
      return new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime();
    });
  }, [products, advertisements]);

  // Filter listings
  const filteredListings = useMemo(() => {
    return combinedListings.filter((item) => {
      // Feed Type filter
      if (feedTypeFilter === 'verified' && item.type !== 'product') return false;
      if (feedTypeFilter === 'advertisement' && item.type !== 'ad') return false;
      if (feedTypeFilter === 'featured' && !item.data.isFeatured) return false;

      // Nav Tab sync
      if (activeNavTab === 'classifieds' && item.type !== 'ad') return false;

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = item.data.title.toLowerCase().includes(query);
        const descMatch = item.data.description.toLowerCase().includes(query);
        const categoryMatch = item.data.category.toLowerCase().includes(query);
        const locationMatch =
          item.type === 'ad'
            ? `${item.data.city} ${item.data.state}`.toLowerCase().includes(query)
            : false;
        if (!titleMatch && !descMatch && !categoryMatch && !locationMatch) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && item.data.category !== selectedCategory) {
        return false;
      }

      // State filter
      if (selectedState !== 'all') {
        if (item.type === 'ad' && item.data.state !== selectedState) return false;
      }

      return true;
    }).sort((a, b) => {
      const getPrice = (it: ListingItem) => {
        if (it.type === 'product') {
          return it.data.salePrice && it.data.salePrice > 0 ? it.data.salePrice : it.data.price;
        }
        return it.data.price;
      };

      if (sortBy === 'price_low') {
        return getPrice(a) - getPrice(b);
      }
      if (sortBy === 'price_high') {
        return getPrice(b) - getPrice(a);
      }
      if (sortBy === 'popular') {
        const aViews = a.type === 'product' ? (a.data.viewCount || 0) : 0;
        const bViews = b.type === 'product' ? (b.data.viewCount || 0) : 0;
        return bViews - aViews;
      }
      if (sortBy === 'newest') {
        return new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime();
      }
      // Recommended / Default: Featured first, then newest
      if (a.data.isFeatured && !b.data.isFeatured) return -1;
      if (!a.data.isFeatured && b.data.isFeatured) return 1;
      return new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime();
    });
  }, [combinedListings, feedTypeFilter, activeNavTab, searchQuery, selectedCategory, selectedState, sortBy]);

  // Handle "Post Listing" button click
  const handleOpenCreateModal = () => {
    if (currentRole === 'shop_owner') {
      setActiveNavTab('marketplace');
      setCurrentRole('shop_owner');
    } else if (currentRole === 'advertiser') {
      setActiveNavTab('marketplace');
      setCurrentRole('advertiser');
    } else {
      setShowPostChooser(true);
    }
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-[#F8F9FA] text-[#1E293B]">
      {/* Top Bar Navigation adhering strictly to the Official ASKIA MARKET Brand */}
      <Navbar
        activeTab={activeNavTab}
        setActiveTab={(tab) => {
          setActiveNavTab(tab);
          setShowCustomerPortal(false);
        }}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCreateModal={handleOpenCreateModal}
        onOpenAuthModal={(mode) => handleOpenAuth(mode || 'login')}
        onOpenCustomerPortal={() => {
          setShowCustomerPortal(true);
          setActiveNavTab('marketplace');
        }}
        onFilterDeals={() => {
          setActiveNavTab('marketplace');
          setFeedTypeFilter('featured');
          setShowCustomerPortal(false);
        }}
        onSelectCategorySection={() => {
          setActiveNavTab('marketplace');
          setShowCustomerPortal(false);
          const el = document.getElementById('marketplace-toolbar');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Main Content Area (with safe-area bottom padding for mobile bottom bar) */}
      <main className="flex-1 pb-28 md:pb-16">
        {/* Customer Portal view for buyer role */}
        {showCustomerPortal && currentRole === 'buyer' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wide">
                  Account Dashboard
                </span>
                <h1 className="text-2xl font-bold text-slate-900 font-serif-brand">
                  My Orders & Saved Items
                </h1>
              </div>
              <button
                onClick={() => setShowCustomerPortal(false)}
                className="text-xs text-slate-600 hover:text-black font-semibold underline cursor-pointer"
              >
                ← Back to Marketplace Feed
              </button>
            </div>
            <CustomerPortal
              onOpenCart={() => setIsCartOpen(true)}
              onOpenProductModal={(prod) => setSelectedItem({ type: 'product', data: prod })}
            />
          </div>
        )}

        {/* If in Shop Owner Role mode, display the Shop Owner Dashboard */}
        {currentRole === 'shop_owner' && activeNavTab === 'marketplace' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                  Merchant Account Workspace
                </span>
                <h1 className="text-2xl font-bold text-slate-900">
                  Shop Owner Dashboard & Staff Management
                </h1>
              </div>
              <button
                onClick={() => setCurrentRole('buyer')}
                className="text-xs text-slate-500 hover:text-slate-800 underline self-start sm:self-auto"
              >
                Switch to Public Buyer View
              </button>
            </div>
            <ShopOwnerPortal
              onOpenPaymentModal={(it) => setPaymentItem(it)}
            />
          </div>
        )}

        {/* If in Advertiser Role mode, display the Advertiser Dashboard */}
        {currentRole === 'advertiser' && activeNavTab === 'marketplace' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                  Classifieds Account Workspace
                </span>
                <h1 className="text-2xl font-bold text-slate-900">
                  Advertiser Subscription (₦1,000 / 5 Ads) & Postings
                </h1>
              </div>
              <button
                onClick={() => setCurrentRole('buyer')}
                className="text-xs text-slate-500 hover:text-slate-800 underline self-start sm:self-auto"
              >
                Switch to Public Buyer View
              </button>
            </div>
            <AdvertiserPortal
              onOpenPaymentModal={(it) => setPaymentItem(it)}
            />
          </div>
        )}

        {/* If in Admin Role mode, display the Private Super Admin Console or the Secure Login Gate */}
        {currentRole === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            {!isSuperAdmin ? (
              <SuperAdminLoginGate onCancel={() => setCurrentRole('buyer')} />
            ) : (
              <>
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#000000] border border-[#D4AF37]/40 uppercase tracking-wide">
                        Private Super Admin Dashboard
                      </span>
                      <span className="text-xs text-stone-600">
                        Authorized: <strong className="text-stone-900 font-mono">askiasventures@gmail.com</strong>
                      </span>
                    </div>
                    <h1 className="text-2xl font-serif-brand font-bold text-stone-900 mt-1">
                      Platform Governance &amp; Moderation Console
                    </h1>
                  </div>
                  <button
                    onClick={() => setCurrentRole('buyer')}
                    className="text-xs text-stone-500 hover:text-stone-800 underline self-start sm:self-auto cursor-pointer"
                  >
                    Switch to Public Buyer View
                  </button>
                </div>
                <AdminPortal />
              </>
            )}
          </div>
        )}

        {/* Standard Buyer / Public Marketplace Views */}
        {currentRole === 'buyer' && (
          <>
            {/* View 1: Main Marketplace Feed */}
            {activeNavTab === 'marketplace' && (
              <div className="space-y-6">
                {/* Hero Showcase with Value Proposition & Instant Category Shortcuts */}
                <MarketplaceHero
                  onSelectFilter={(f) => setFeedTypeFilter(f)}
                  activeFilter={feedTypeFilter}
                  onSelectCategory={(cat) => setSelectedCategory(cat)}
                />

                {/* Practical Marketplace Toolbar (Amazon / Jiji / Temu style) */}
                <div id="marketplace-toolbar" className="max-w-7xl mx-auto px-3 sm:px-6 scroll-mt-20">
                  <div className="bg-white rounded-2xl border border-neutral-300 p-3 sm:p-4 shadow-sm space-y-3">
                    {/* Top Row: Category, Location & Sort Filters */}
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
                      {/* Secondary Quick Search (Desktop fallback / local filter) */}
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search verified products, laptops, cars, real estate..."
                          className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                        />
                      </div>

                      <div className="flex flex-wrap sm:flex-nowrap gap-2">
                        {/* Category Dropdown */}
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="flex-1 sm:flex-none px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-800 font-medium focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                        >
                          <option value="all">All Categories ({MARKETPLACE_CATEGORIES.length})</option>
                          {MARKETPLACE_CATEGORIES.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        </select>

                        {/* Location Dropdown */}
                        <select
                          value={selectedState}
                          onChange={(e) => setSelectedState(e.target.value)}
                          className="flex-1 sm:flex-none px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-800 font-medium focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                        >
                          <option value="all">All Nigerian States</option>
                          {NIGERIAN_STATES.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>

                        {/* Sort Selector */}
                        <select
                          value={sortBy}
                          onChange={(e: any) => setSortBy(e.target.value)}
                          className="w-full sm:w-auto px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-800 font-bold focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                          title="Sort listings"
                        >
                          <option value="recommended">Featured &amp; Recommended</option>
                          <option value="popular">Most Viewed / Popular</option>
                          <option value="price_low">Price: Low to High</option>
                          <option value="price_high">Price: High to Low</option>
                          <option value="newest">Newest Arrivals</option>
                        </select>
                      </div>
                    </div>

                    {/* Segmented Filter Pills */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-neutral-200">
                      <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl overflow-x-auto max-w-full no-scrollbar">
                        <button
                          onClick={() => setFeedTypeFilter('all')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                            feedTypeFilter === 'all'
                              ? 'bg-black text-white shadow-sm'
                              : 'text-neutral-700 hover:text-black hover:bg-neutral-200'
                          }`}
                        >
                          All ({combinedListings.length})
                        </button>
                        <button
                          onClick={() => setFeedTypeFilter('verified')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                            feedTypeFilter === 'verified'
                              ? 'bg-black text-[#D4AF37] border border-[#D4AF37]/50 shadow-sm'
                              : 'text-neutral-700 hover:text-black hover:bg-neutral-200'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Verified Store Products ({products.length})</span>
                        </button>
                        <button
                          onClick={() => setFeedTypeFilter('advertisement')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                            feedTypeFilter === 'advertisement'
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'text-neutral-700 hover:text-black hover:bg-neutral-200'
                          }`}
                        >
                          <Megaphone className="w-3.5 h-3.5" />
                          <span>Classified Ads ({advertisements.filter((a) => a.status === 'active').length})</span>
                        </button>
                        <button
                          onClick={() => setFeedTypeFilter('featured')}
                          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                            feedTypeFilter === 'featured'
                              ? 'bg-[#D4AF37] text-black shadow-sm'
                              : 'text-neutral-700 hover:text-black hover:bg-neutral-200'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-black" />
                          <span>Spotlight Deals</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-neutral-600 font-mono-numbers">
                        {(searchQuery || selectedCategory !== 'all' || selectedState !== 'all' || feedTypeFilter !== 'all') && (
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setSelectedCategory('all');
                              setSelectedState('all');
                              setFeedTypeFilter('all');
                              setSortBy('recommended');
                            }}
                            className="text-red-600 hover:underline font-bold text-[11px] cursor-pointer"
                          >
                            Reset Filters
                          </button>
                        )}
                        <span>
                          Showing <strong>{filteredListings.length}</strong> items
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Listings Grid: 2-Column Mobile (320px-430px), 3-Column Tablet, 4/5-Column Desktop */}
                <div className="max-w-7xl mx-auto px-3 sm:px-6">
                  {filteredListings.length === 0 ? (
                    <div className="p-10 text-center bg-white rounded-2xl border border-neutral-300 text-neutral-600 space-y-3">
                      <Filter className="w-8 h-8 mx-auto text-neutral-400" />
                      <p className="font-bold text-neutral-900 text-sm">No items found matching your filters.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                          setSelectedState('all');
                          setFeedTypeFilter('all');
                          setSortBy('recommended');
                        }}
                        className="px-4 py-2 bg-black hover:bg-[#D4AF37] text-white hover:text-black text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
                      {filteredListings.map((item) => (
                        <ListingCard
                          key={`${item.type}-${item.data.id}`}
                          item={item}
                          onSelect={(it) => setSelectedItem(it)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* View 2: Verified Shops Directory */}
            {activeNavTab === 'shops' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                    <h2 className="text-2xl font-bold text-slate-900">Verified Merchant Directory</h2>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Every merchant listed below is officially CAC registered and verified. Purchases made here carry return guarantees and integrated payment protection.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {shops.map((shop) => {
                    const shopProds = products.filter((p) => p.shopId === shop.id);
                    return (
                      <div
                        key={shop.id}
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-all"
                      >
                        <div className="relative h-28 bg-slate-900">
                          <img
                            src={shop.bannerUrl}
                            alt={shop.name}
                            className="w-full h-full object-cover opacity-70"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-bold rounded-md flex items-center gap-1 shadow-xs">
                            <ShieldCheck className="w-3 h-3" />
                            <span>{shop.isVerified ? shop.verificationBadgeNumber : 'Pending'}</span>
                          </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <h3 className="text-base font-bold text-slate-900 leading-snug">
                              {shop.name}
                            </h3>
                            <p className="text-xs text-slate-600 line-clamp-2">
                              {shop.description}
                            </p>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{shop.address}</span>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-mono-numbers">
                              {shopProds.length} products
                            </span>
                            <button
                              onClick={() => setSelectedShopId(shop.id)}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1"
                            >
                              <span>Enter Store</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* View 3: Classified Ads Only (with Caution Notice) */}
            {activeNavTab === 'classifieds' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-6 h-6 text-amber-500" />
                    <h2 className="text-2xl font-bold text-slate-900">Individual Classified Advertisements</h2>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Classified listings posted by individual advertisers under our ₦1,000 for 5 ads subscription package.
                  </p>
                </div>

                {/* Mandatory Caution Header */}
                <CautionNoticeBanner variant="full" />

                {/* Advertisements Grid (2-Column Mobile) */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 pt-2">
                  {advertisements
                    .filter((a) => a.status === 'active')
                    .map((ad) => (
                      <ListingCard
                        key={`classified-${ad.id}`}
                        item={{ type: 'ad', data: ad }}
                        onSelect={(it) => setSelectedItem(it)}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* View 4: Rules & Safety Tab */}
            {activeNavTab === 'rules' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <RulesAndSafetyTab />
              </div>
            )}

            {/* View 5: Askia Careers & Work Opportunities */}
            {activeNavTab === 'careers' && (
              <CareersSection />
            )}
          </>
        )}
      </main>

      {/* Clean Public Footer */}
      <footer className="bg-[#0A0A0A] border-t border-[#262626] mt-auto text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <span className="font-serif-brand font-bold text-white text-base tracking-wide">
              ASKIA <span className="text-[#D4AF37] font-semibold">MARKET</span>
            </span>
            <span className="text-[#D4AF37]/90 text-[11px] font-sans tracking-widest uppercase">
              · Your World. Your Market.
            </span>
            <span className="text-slate-600 hidden md:inline">·</span>
            <span className="text-slate-400">Verified Business Stores & Moderated Classifieds</span>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-5 text-xs text-slate-400">
            <button
              onClick={() => {
                setActiveNavTab('rules');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#D4AF37] transition-colors"
            >
              About ASKIA MARKET
            </button>
            <a
              href="mailto:support@askiamarket.ng"
              className="hover:text-[#D4AF37] transition-colors"
            >
              Contact
            </a>
            <button
              onClick={() => {
                setActiveNavTab('rules');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#D4AF37] transition-colors"
            >
              Safety & Policy
            </button>
            <button
              onClick={() => {
                setActiveNavTab('rules');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#D4AF37] transition-colors"
            >
              Terms & Conditions
            </button>
            <button
              onClick={() => {
                setActiveNavTab('rules');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#D4AF37] transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => handleOpenAuth('register')}
              className="hover:text-emerald-400 text-slate-300 transition-colors font-medium"
            >
              Become a Seller
            </button>
            <button
              onClick={() => {
                setActiveNavTab('careers');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-[#D4AF37] hover:text-[#E5C158] font-semibold transition-colors"
            >
              Careers &amp; Work
            </button>
            <button
              onClick={() => handleOpenAuth('login')}
              className="hover:text-white text-[#D4AF37] transition-colors font-semibold"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <StaffApplicationModal
        isOpen={isStaffAppOpen}
        onClose={() => setIsStaffAppOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />

      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onOpenShop={(id) => setSelectedShopId(id)}
        onOpenPaymentModal={(it) => setPaymentItem(it)}
      />

      <ShopDetailModal
        shopId={selectedShopId}
        onClose={() => setSelectedShopId(null)}
        onSelectProduct={(it) => setSelectedItem(it)}
      />

      <PaymentModal
        item={paymentItem}
        onClose={() => setPaymentItem(null)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      <ChatModal />

      {/* Real-time Notification Drawer & In-App Toast Alert */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <NotificationToast
        onOpenDrawer={() => setIsNotificationsOpen(true)}
      />

      {/* Post Chooser Modal (Directs user to register in appropriate category) */}
      {showPostChooser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Choose Your Account Category</h3>
              <button
                onClick={() => setShowPostChooser(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Select which category of account you are publishing under:
            </p>

            <div className="grid grid-cols-1 gap-3">
              {/* Option 1: Shop Owner */}
              <button
                onClick={() => {
                  setShowPostChooser(false);
                  handleOpenAuth('register');
                }}
                className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-all text-left flex items-start gap-3 group"
              >
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                    <span>1. Shop Owner Account</span>
                    <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-mono-numbers">
                      Verified Store
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Operate a verified commercial storefront with staff sub-roles. Customers make payments directly through the online payment gateway. Admin verifies your CAC certificate.
                  </p>
                </div>
              </button>

              {/* Option 2: Casual Advertiser */}
              <button
                onClick={() => {
                  setShowPostChooser(false);
                  handleOpenAuth('register');
                }}
                className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-all text-left flex items-start gap-3 group"
              >
                <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                  <Megaphone className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                    <span>2. Classified Ads Account (Advertiser)</span>
                    <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-mono-numbers font-bold">
                      ₦1,000 / 5 Ads
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Post classified listings via subscription (₦1,000 for 5 ads). Buyers see your contact details and reach you directly via phone/WhatsApp/address. Displays mandatory buyer caution disclaimer.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <MarketplaceProvider>
      <MainMarketplaceApp />
    </MarketplaceProvider>
  );
}
