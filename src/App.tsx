import React, { useState, useMemo } from 'react';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { RoleSwitcherBar } from './components/RoleSwitcherBar';
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
import { Product, Advertisement, Shop } from './types/marketplace';
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
    platformSettings
  } = useMarketplace();

  // Navigation tabs
  const [activeNavTab, setActiveNavTab] = useState<'marketplace' | 'shops' | 'classifieds' | 'rules'>('marketplace');
  
  // Feed filters
  const [feedTypeFilter, setFeedTypeFilter] = useState<'all' | 'verified' | 'advertisement' | 'featured'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedState, setSelectedState] = useState('all');

  // Modals state
  const [selectedItem, setSelectedItem] = useState<ListingItem | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [paymentItem, setPaymentItem] = useState<{
    type: 'ad_subscription' | 'feature_product' | 'feature_ad';
    id: string;
    title: string;
    price: number;
  } | null>(null);
  const [showPostChooser, setShowPostChooser] = useState(false);

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
    });
  }, [combinedListings, feedTypeFilter, activeNavTab, searchQuery, selectedCategory, selectedState]);

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
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1E293B]">
      {/* 1. Top interactive role switcher for testing all user flows */}
      <RoleSwitcherBar onOpenAuthModal={() => handleOpenAuth('login')} />

      {/* 2. Top Bar Navigation adhering strictly to the Top Bar Contract */}
      <Navbar
        activeTab={activeNavTab}
        setActiveTab={setActiveNavTab}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCreateModal={handleOpenCreateModal}
        onOpenAuthModal={() => handleOpenAuth('login')}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
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

        {/* If in Admin Role mode, display the Comprehensive Central Admin Console */}
        {currentRole === 'admin' && activeNavTab === 'marketplace' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wide">
                  Central Authority
                </span>
                <h1 className="text-2xl font-bold text-slate-900">
                  Central Admin Management Dashboard
                </h1>
              </div>
              <button
                onClick={() => setCurrentRole('buyer')}
                className="text-xs text-slate-500 hover:text-slate-800 underline self-start sm:self-auto"
              >
                Switch to Public Buyer View
              </button>
            </div>
            <AdminPortal />
          </div>
        )}

        {/* Standard Buyer / Public Marketplace Views */}
        {(currentRole === 'buyer' || activeNavTab !== 'marketplace') && (
          <>
            {/* View 1: Main Marketplace Feed */}
            {activeNavTab === 'marketplace' && (
              <div className="space-y-8">
                {/* Hero Showcase with Value Proposition */}
                <MarketplaceHero
                  onSelectFilter={(f) => setFeedTypeFilter(f)}
                  activeFilter={feedTypeFilter}
                />

                {/* Filter and Search Bar */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
                    {/* Top Row: Search & Category / Location Selects */}
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search verified products, laptops, cars, real estate, generators, phones..."
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-500"
                        />
                      </div>

                      <div className="flex gap-2">
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-emerald-500"
                        >
                          <option value="all">All Categories</option>
                          <option value="Electronics & Computers">Electronics & Computers</option>
                          <option value="Fashion & Apparel">Fashion & Apparel</option>
                          <option value="Vehicles & Automotive">Vehicles & Automotive</option>
                          <option value="Solar & Renewable Power">Solar & Renewable Power</option>
                          <option value="Real Estate & Rentals">Real Estate & Rentals</option>
                          <option value="Home & Industrial Machinery">Home & Industrial Machinery</option>
                        </select>

                        <select
                          value={selectedState}
                          onChange={(e) => setSelectedState(e.target.value)}
                          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-emerald-500"
                        >
                          <option value="all">All Locations</option>
                          <option value="Lagos">Lagos State</option>
                          <option value="Abuja (FCT)">Abuja (FCT)</option>
                          <option value="Rivers">Rivers (Port Harcourt)</option>
                          <option value="Oyo">Oyo (Ibadan)</option>
                          <option value="Kano">Kano</option>
                        </select>
                      </div>
                    </div>

                    {/* Segmented Filter Controls */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto">
                        <button
                          onClick={() => setFeedTypeFilter('all')}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                            feedTypeFilter === 'all'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          All ({combinedListings.length})
                        </button>
                        <button
                          onClick={() => setFeedTypeFilter('verified')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                            feedTypeFilter === 'verified'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-emerald-800 hover:text-emerald-950'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verified Store Products ({products.length})</span>
                        </button>
                        <button
                          onClick={() => setFeedTypeFilter('advertisement')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                            feedTypeFilter === 'advertisement'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'text-amber-800 hover:text-amber-950'
                          }`}
                        >
                          <Megaphone className="w-3.5 h-3.5" />
                          <span>Classified Ads ({advertisements.filter((a) => a.status === 'active').length})</span>
                        </button>
                        <button
                          onClick={() => setFeedTypeFilter('featured')}
                          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                            feedTypeFilter === 'featured'
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Featured Spotlight</span>
                        </button>
                      </div>

                      <span className="text-xs text-slate-500 font-mono-numbers">
                        Showing <strong>{filteredListings.length}</strong> items
                      </span>
                    </div>
                  </div>
                </div>

                {/* Listings Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  {filteredListings.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-3">
                      <Filter className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="font-semibold text-slate-800 text-sm">No items found matching your filters.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                          setSelectedState('all');
                          setFeedTypeFilter('all');
                        }}
                        className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

                {/* Advertisements Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
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
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 text-sm">NkemMarket</span>
            <span>·</span>
            <span>Verified Merchant Storefronts & Classified Ads</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button onClick={() => setActiveNavTab('rules')} className="hover:text-slate-900 transition-colors">
              Monetization & Safety Policy
            </button>
            <button onClick={() => setActiveNavTab('shops')} className="hover:text-slate-900 transition-colors">
              Verified Directory
            </button>
            <button onClick={() => setActiveNavTab('classifieds')} className="hover:text-slate-900 transition-colors">
              Classified Ads
            </button>
            <button onClick={() => handleOpenAuth('login')} className="hover:text-slate-900 transition-colors font-semibold">
              Admin & Merchant Sign In
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
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
