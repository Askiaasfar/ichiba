import React from 'react';
import { ShieldCheck, Megaphone, Sparkles, Award, ArrowUpRight } from 'lucide-react';
import { handleImageError } from '../utils/imageUtils';

interface MarketplaceHeroProps {
  onSelectFilter: (type: 'all' | 'verified' | 'advertisement' | 'featured') => void;
  activeFilter: string;
}

export const MarketplaceHero: React.FC<MarketplaceHeroProps> = ({
  onSelectFilter,
  activeFilter
}) => {
  return (
    <section className="bg-[#0A0A0A] text-white border-b border-[#262626] relative overflow-hidden">
      {/* Subtle luxury gold gradient glow in background */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-10 w-72 h-72 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Value Proposition & Dual System */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/60 border border-[#D4AF37]/40 rounded-full text-xs font-medium text-[#D4AF37]">
              <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="tracking-wide uppercase text-[11px] font-semibold">ASKIA MARKET · Your World. Your Market.</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-serif-brand font-bold tracking-tight text-white leading-[1.15] text-balance">
              Verified Corporate Merchants & Direct Classified Ads
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-light">
              <strong>ASKIA MARKET</strong> sets the benchmark for trust, speed, and integrity. 
              <span className="text-[#D4AF37] font-medium block mt-1 text-sm tracking-wide">Your World. Your Market.</span>
              Trade confidently with <strong className="text-white">CAC-Verified Storefronts</strong> backed by integrated escrow protection, or discover targeted <strong className="text-white">Classified Advertisements</strong> with clear consumer safety notices and structured ₦1,000 subscription bundles.
            </p>

            {/* Quick Action Filter Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onSelectFilter('verified')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shadow-xs ${
                  activeFilter === 'verified'
                    ? 'bg-[#D4AF37] text-black shadow-md font-bold'
                    : 'bg-white/5 text-slate-200 hover:text-white hover:bg-white/10 border border-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>Shop Verified Stores (Escrow Protected)</span>
              </button>

              <button
                onClick={() => onSelectFilter('advertisement')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shadow-xs ${
                  activeFilter === 'advertisement'
                    ? 'bg-[#D4AF37] text-black shadow-md font-bold'
                    : 'bg-white/5 text-slate-200 hover:text-white hover:bg-white/10 border border-slate-800'
                }`}
              >
                <Megaphone className="w-4 h-4 text-[#D4AF37]" />
                <span>Classified Ads (Direct Contact)</span>
              </button>

              <button
                onClick={() => onSelectFilter('featured')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeFilter === 'featured'
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'bg-white/5 text-slate-200 hover:text-white hover:bg-white/10 border border-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Featured Spotlight</span>
              </button>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl bg-black aspect-16/10 sm:aspect-16/10 group">
              <img
                src="/assets/images/hero_marketplace_nigeria_1793094442016.jpg"
                alt="ASKIA MARKET verified physical and digital marketplace"
                className="w-full h-full object-cover opacity-85 group-hover:scale-103 transition-transform duration-500"
                onError={handleImageError}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex items-end p-5">
                <div className="text-white space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#D4AF37] text-black text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase font-mono-numbers">
                      ASKIA VERIFIED
                    </span>
                    <span className="text-xs text-slate-300 font-mono-numbers">Lagos · Abuja · Port Harcourt · Kano</span>
                  </div>
                  <p className="text-xs font-light text-slate-200">
                    Enterprise merchant verification & structured classifieds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 mt-10 border-t border-slate-800/80 text-xs">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-black/40 border border-slate-800/80">
            <div className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-white">CAC-Verified Merchants</h4>
              <p className="text-slate-400 mt-0.5 leading-relaxed font-light">
                Registered shops undergo strict identification, receive an official Askia badge, and pay 5% commission per sale.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-black/40 border border-slate-800/80">
            <div className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 shrink-0">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-white">₦1,000 / 5 Ads Subscription</h4>
              <p className="text-slate-400 mt-0.5 leading-relaxed font-light">
                Individual sellers publish classified listings via transparent bundles. Mandatory non-liability caution notices protect all parties.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-black/40 border border-slate-800/80">
            <div className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Promotional Placements</h4>
              <p className="text-slate-400 mt-0.5 leading-relaxed font-light">
                Elevate visibility with 7-day spotlights for verified products (₦1,500) and classified listings (₦800).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

