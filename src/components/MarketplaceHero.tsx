import React from 'react';
import {
  ShieldCheck,
  Megaphone,
  Sparkles,
  Zap,
  Laptop,
  Car,
  Shirt,
  Sun,
  Home,
  Wrench,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { handleImageError } from '../utils/imageUtils';

interface MarketplaceHeroProps {
  onSelectFilter: (type: 'all' | 'verified' | 'advertisement' | 'featured') => void;
  activeFilter: string;
  onSelectCategory?: (category: string) => void;
}

export const MarketplaceHero: React.FC<MarketplaceHeroProps> = ({
  onSelectFilter,
  activeFilter,
  onSelectCategory
}) => {
  const categoryShortcuts = [
    { name: 'Electronics & Computers', label: 'Electronics', icon: Laptop },
    { name: 'Vehicles & Automotive', label: 'Vehicles', icon: Car },
    { name: 'Fashion & Apparel', label: 'Fashion', icon: Shirt },
    { name: 'Solar & Renewable Power', label: 'Solar Power', icon: Sun },
    { name: 'Real Estate & Rentals', label: 'Real Estate', icon: Home },
    { name: 'Home & Industrial Machinery', label: 'Machinery', icon: Wrench }
  ];

  return (
    <section className="bg-[#0A0A0A] text-white border-b border-[#262626] relative overflow-hidden">
      {/* Background ambient gold glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

      {/* MOBILE HEADER STRIP (< md) */}
      <div className="md:hidden px-3 pt-3 pb-2 space-y-2.5">
        {/* Compact Banner */}
        <div className="p-3 bg-gradient-to-r from-neutral-900 via-black to-neutral-900 border border-[#D4AF37]/40 rounded-xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37] text-black flex items-center justify-center font-black shrink-0">
              <Zap className="w-4 h-4 fill-black" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                Verified Stores &amp; Classifieds
              </div>
              <p className="text-[10px] text-[#D4AF37] font-medium">Escrow Protected • Direct Deals</p>
            </div>
          </div>
          <button
            onClick={() => onSelectFilter('featured')}
            className="px-2.5 py-1 bg-[#D4AF37] text-black text-[10px] font-bold rounded-lg flex items-center gap-0.5 cursor-pointer shadow-xs"
          >
            Deals <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Category Shortcut Horizontal Scroll on Mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categoryShortcuts.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => onSelectCategory && onSelectCategory(cat.name)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] hover:bg-[#1F1F1F] text-neutral-300 hover:text-white rounded-xl border border-neutral-800 text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              >
                <Icon className="w-3 h-3 text-[#D4AF37]" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DESKTOP SHOPPING SHOWCASE HERO (>= md) */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Direct Retail Focus */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black border border-[#D4AF37]/50 rounded-full text-xs font-bold text-[#D4AF37]">
              <span>ASKIA MARKET</span>
              <span className="text-neutral-500">•</span>
              <span className="tracking-wider uppercase text-[10px]">Your World. Your Market.</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif-brand font-bold tracking-tight text-white leading-tight">
              Verified Corporate Merchants & Direct Classified Ads
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 max-w-xl font-light leading-relaxed">
              Shop nationwide with <strong className="text-white">CAC-Verified Storefronts</strong> backed by integrated escrow protection, or explore direct <strong className="text-white">Classified Advertisements</strong> with clear safety notices.
            </p>

            {/* Quick Action Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                onClick={() => onSelectFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-xs cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-[#D4AF37] text-black shadow-md'
                    : 'bg-[#161616] text-neutral-200 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                All Marketplace ({activeFilter === 'all' ? 'Active' : 'Browse'})
              </button>

              <button
                onClick={() => onSelectFilter('verified')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-xs cursor-pointer ${
                  activeFilter === 'verified'
                    ? 'bg-[#D4AF37] text-black shadow-md'
                    : 'bg-[#161616] text-neutral-200 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>Verified Stores (Escrow)</span>
              </button>

              <button
                onClick={() => onSelectFilter('advertisement')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-xs cursor-pointer ${
                  activeFilter === 'advertisement'
                    ? 'bg-[#D4AF37] text-black shadow-md'
                    : 'bg-[#161616] text-neutral-200 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                <Megaphone className="w-4 h-4 text-[#D4AF37]" />
                <span>Classified Ads (Direct)</span>
              </button>

              <button
                onClick={() => onSelectFilter('featured')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeFilter === 'featured'
                    ? 'bg-[#D4AF37] text-black'
                    : 'bg-[#161616] text-neutral-200 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Top Deals</span>
              </button>
            </div>
          </div>

          {/* Right Column: Visual Campaign Banner */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/40 shadow-2xl bg-black aspect-16/9 group">
              <img
                src="/assets/images/hero_marketplace_nigeria_1793094442016.jpg"
                alt="ASKIA MARKET verified physical and digital marketplace"
                className="w-full h-full object-cover opacity-90 group-hover:scale-103 transition-transform duration-500"
                onError={handleImageError}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex items-end p-4">
                <div className="text-white space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#D4AF37] text-black text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase font-mono-numbers">
                      100% Escrow Protection
                    </span>
                    <span className="text-xs text-neutral-300 font-mono-numbers">Nationwide Fast Delivery</span>
                  </div>
                  <p className="text-xs text-neutral-200">
                    Buy with full confidence from registered Nigerian merchants.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Category Icons Grid */}
        <div className="grid grid-cols-6 gap-3 pt-5 mt-5 border-t border-neutral-800/80">
          {categoryShortcuts.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => onSelectCategory && onSelectCategory(cat.name)}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#121212] hover:bg-[#1A1A1A] border border-neutral-800 hover:border-[#D4AF37]/50 transition-all text-xs text-neutral-300 hover:text-white cursor-pointer group"
              >
                <Icon className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                <span className="font-medium truncate">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
