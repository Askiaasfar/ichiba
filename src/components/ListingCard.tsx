import React from 'react';
import { Product, Advertisement } from '../types/marketplace';
import { ShieldCheck, AlertTriangle, Sparkles, MapPin, ShoppingBag, MessageCircle } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

type ListingItem = 
  | { type: 'product'; data: Product }
  | { type: 'ad'; data: Advertisement };

interface ListingCardProps {
  item: ListingItem;
  onSelect: (item: ListingItem) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ item, onSelect }) => {
  const { addToCart, openChat } = useMarketplace();

  if (item.type === 'product') {
    const product = item.data;
    return (
      <div 
        onClick={() => onSelect(item)}
        className="group bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col hover:border-[#D4AF37]/80 hover:shadow-lg transition-all duration-300 cursor-pointer relative"
      >
        {/* Featured Tag */}
        {product.isFeatured && (
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 bg-[#D4AF37] text-black font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded shadow-sm font-mono-numbers">
            <Sparkles className="w-3 h-3 text-black" />
            <span>Featured Product</span>
          </div>
        )}

        {/* Product Image */}
        <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded tracking-wide">
            {product.condition}
          </div>
        </div>

        {/* Product Details */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            {/* Category */}
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              {product.category}
            </div>

            {/* Title */}
            <h3 className="text-sm font-medium text-slate-900 line-clamp-2 leading-snug group-hover:text-[#9A7D0A] transition-colors">
              {product.title}
            </h3>

            {/* Verified Merchant Badge */}
            <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="font-semibold text-slate-800 truncate">{product.shopName}</span>
              <span className="text-[10px] text-[#9A7D0A] font-mono-numbers shrink-0 font-bold">✓ Verified</span>
            </div>
          </div>

          {/* Pricing & Actions */}
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-slate-400 block tracking-wide uppercase">Verified Price</span>
              <div className="text-base font-bold text-slate-900 font-mono-numbers">
                ₦{product.price.toLocaleString()}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Chat with Seller UI Component */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openChat(item);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-[#D4AF37]/10 text-slate-700 hover:text-black rounded-lg text-xs font-medium transition-colors border border-transparent hover:border-[#D4AF37]/30"
                title="Chat with Verified Seller"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="hidden sm:inline">Chat</span>
              </button>

              {/* Add to Cart */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product, 1);
                }}
                className="p-2 bg-black text-white hover:bg-[#D4AF37] hover:text-black rounded-lg transition-colors shadow-xs"
                title="Add to cart"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Individual Advertisement Card
  const ad = item.data;
  return (
    <div 
      onClick={() => onSelect(item)}
      className="group bg-white rounded-2xl border border-amber-200/90 overflow-hidden flex flex-col hover:border-amber-400 hover:shadow-lg transition-all duration-300 cursor-pointer relative"
    >
      {/* Featured Tag */}
      {ad.isFeatured && (
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 bg-[#D4AF37] text-black font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded shadow-sm font-mono-numbers">
          <Sparkles className="w-3 h-3 text-black" />
          <span>Featured Ad</span>
        </div>
      )}

      {/* Classified Image */}
      <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-2 right-2 bg-amber-950/80 backdrop-blur-xs text-amber-200 text-[10px] font-medium px-2 py-0.5 rounded tracking-wide">
          Classified Ad
        </div>
      </div>

      {/* Ad Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Category & Location */}
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="uppercase tracking-widest font-semibold">{ad.category}</span>
            <span className="flex items-center gap-0.5 text-slate-500 font-medium">
              <MapPin className="w-3 h-3 text-slate-400" />
              {ad.city}, {ad.state}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-medium text-slate-900 line-clamp-2 leading-snug group-hover:text-amber-800 transition-colors">
            {ad.title}
          </h3>

          {/* Advertiser attribution */}
          <div className="text-xs text-slate-500 font-normal">
            By <span className="text-slate-800 font-medium">{ad.advertiserName}</span>
          </div>

          {/* MANDATORY PROMINENT CAUTION PILL ON CARD */}
          <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-300/80 rounded-lg text-[11px] text-amber-950 font-medium leading-tight">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">
              <strong>Caution:</strong> Unverified Ad · No upfront payments
            </span>
          </div>
        </div>

        {/* Pricing & Chat with Seller Actions */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block tracking-wide uppercase">
              {ad.isNegotiable ? 'Asking (Negotiable)' : 'Asking Price'}
            </span>
            <div className="text-base font-bold text-slate-900 font-mono-numbers">
              ₦{ad.price.toLocaleString()}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Chat with Seller UI Component */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openChat(item);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#0A0A0A] hover:bg-[#D4AF37] text-white hover:text-black font-semibold text-xs rounded-lg transition-colors shadow-xs"
              title="Chat directly with Advertiser"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#D4AF37] group-hover:text-black" />
              <span>Chat with Seller</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item);
              }}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              title="View details"
            >
              Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
