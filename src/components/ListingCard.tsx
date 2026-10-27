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
        className="group bg-white rounded-xl border border-slate-200/90 overflow-hidden flex flex-col hover:border-slate-300 hover:shadow-md transition-all cursor-pointer relative"
      >
        {/* Featured Tag */}
        {product.isFeatured && (
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 bg-amber-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
            <Sparkles className="w-3 h-3" />
            <span>Featured Product</span>
          </div>
        )}

        {/* Product Image */}
        <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded">
            {product.condition}
          </div>
        </div>

        {/* Product Details */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            {/* Category */}
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
              {product.category}
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
              {product.title}
            </h3>

            {/* Verified Merchant Badge */}
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50/80 px-2 py-1 rounded-md border border-emerald-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold truncate">{product.shopName}</span>
              <span className="text-[10px] text-emerald-800 font-mono-numbers shrink-0">✓ Verified</span>
            </div>
          </div>

          {/* Pricing & Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <div>
              <span className="text-[11px] text-slate-400 block">Verified Store Price</span>
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
                className="flex items-center gap-1 px-2.5 py-2 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg text-xs font-semibold transition-colors"
                title="Chat with Verified Seller"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Chat</span>
              </button>

              {/* Add to Cart */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product, 1);
                }}
                className="p-2 bg-slate-900 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-xs"
                title="Add to cart"
              >
                <ShoppingBag className="w-4 h-4" />
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
      className="group bg-white rounded-xl border border-amber-200/90 overflow-hidden flex flex-col hover:border-amber-300 hover:shadow-md transition-all cursor-pointer relative"
    >
      {/* Featured Tag */}
      {ad.isFeatured && (
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 bg-amber-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
          <Sparkles className="w-3 h-3" />
          <span>Featured Ad</span>
        </div>
      )}

      {/* Classified Image */}
      <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-2 right-2 bg-amber-950/80 backdrop-blur-xs text-amber-200 text-[11px] font-medium px-2 py-0.5 rounded">
          Classified Ad
        </div>
      </div>

      {/* Ad Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Category & Location */}
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="uppercase tracking-wide font-medium">{ad.category}</span>
            <span className="flex items-center gap-0.5 text-slate-500 font-medium">
              <MapPin className="w-3 h-3 text-slate-400" />
              {ad.city}, {ad.state}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-amber-700 transition-colors">
            {ad.title}
          </h3>

          {/* Advertiser attribution */}
          <div className="text-xs text-slate-600 font-medium">
            Posted by <span className="text-slate-800">{ad.advertiserName}</span>
          </div>

          {/* MANDATORY PROMINENT CAUTION PILL ON CARD */}
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 font-medium leading-tight">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">
              <strong>Caution:</strong> Unverified Ad · No upfront payments
            </span>
          </div>
        </div>

        {/* Pricing & Chat with Seller Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[11px] text-slate-400 block">
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
              className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-xs"
              title="Chat directly with Advertiser"
            >
              <MessageCircle className="w-3.5 h-3.5" />
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
