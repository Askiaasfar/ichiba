import React from 'react';
import { ShieldCheck, Megaphone, Sparkles, ArrowRight } from 'lucide-react';

interface MarketplaceHeroProps {
  onSelectFilter: (type: 'all' | 'verified' | 'advertisement' | 'featured') => void;
  activeFilter: string;
}

export const MarketplaceHero: React.FC<MarketplaceHeroProps> = ({
  onSelectFilter,
  activeFilter
}) => {
  return (
    <section className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Value Proposition & Dual System */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-xs font-semibold text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Two Distinct Trading Models in One Marketplace</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-slate-900 leading-[1.15] text-balance">
              Shop from Verified Stores or Browse Direct Classified Ads
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
              NkemMarket separates verified merchants from casual classified posters. 
              Enjoy buyer protection with <strong>Verified Badge Storefronts</strong>, or explore <strong>Classified Advertisements</strong> with clear safety disclaimers and ₦1,000 ad bundle subscriptions.
            </p>

            {/* Quick Action Filter Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onSelectFilter('verified')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shadow-xs ${
                  activeFilter === 'verified'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Shop Verified Stores (Zero Fraud Risk)</span>
              </button>

              <button
                onClick={() => onSelectFilter('advertisement')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shadow-xs ${
                  activeFilter === 'advertisement'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Megaphone className="w-4 h-4 text-amber-600" />
                <span>Browse Classified Ads (Caution Applied)</span>
              </button>

              <button
                onClick={() => onSelectFilter('featured')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeFilter === 'featured'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Featured Spotlight</span>
              </button>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 aspect-16/10 sm:aspect-16/10">
              <img
                src="/src/assets/images/hero_marketplace_nigeria_1793094442016.jpg"
                alt="Nkem Commerce verified physical and digital marketplace"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5">
                <div className="text-white space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                      Verified Ecosystem
                    </span>
                    <span className="text-xs text-slate-200 font-mono-numbers">Lagos · Abuja · Port Harcourt</span>
                  </div>
                  <p className="text-sm font-medium text-slate-100">
                    Direct merchant verification & safe classifieds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 mt-8 border-t border-slate-200/80 text-xs">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/70 border border-slate-200/60">
            <div className="p-2 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Verified Merchant Badges</h4>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Shops undergo CAC business verification and pay a modest commission (5% or flat ₦250) per fulfilled sale.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/70 border border-slate-200/60">
            <div className="p-2 rounded-md bg-amber-100 text-amber-800 shrink-0">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">₦1,000 / 5 Ads Subscription</h4>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Individuals post classifieds via bundle subscriptions. All ads carry mandatory buyer non-liability caution notices.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/70 border border-slate-200/60">
            <div className="p-2 rounded-md bg-indigo-100 text-indigo-800 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Paid Featured Placement</h4>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Boost reach for products (₦1,500) and advertisements (₦800) with top placement and gold featured badges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
