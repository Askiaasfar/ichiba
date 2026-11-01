import React from 'react';
import { Product, Advertisement } from '../types/marketplace';
import {
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  MapPin,
  ShoppingBag,
  MessageCircle,
  Heart,
  Star,
  CheckCircle2
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { normalizeImageUrl, handleImageError, FALLBACK_PRODUCT_IMAGE, FALLBACK_VEHICLE_IMAGE } from '../utils/imageUtils';

type ListingItem = 
  | { type: 'product'; data: Product }
  | { type: 'ad'; data: Advertisement };

interface ListingCardProps {
  item: ListingItem;
  onSelect: (item: ListingItem) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ item, onSelect }) => {
  const { addToCart, openChat, currentUser, toggleWishlist } = useMarketplace();

  if (item.type === 'product') {
    const product = item.data;

    // Calculate discount percent
    const originalPrice = product.originalPrice || (product.salePrice ? product.price : 0);
    const currentPrice = product.salePrice ? product.salePrice : product.price;
    const discountPercent = product.discountPercent || (originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0);

    const isWishlisted = Boolean(currentUser?.wishlist?.includes(product.id));

    return (
      <div 
        onClick={() => onSelect(item)}
        className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden flex flex-col hover:border-[#D4AF37] hover:shadow-xl transition-all duration-200 cursor-pointer relative"
      >
        {/* Top Badges on Image */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start pointer-events-none">
          {product.isFeatured && (
            <span className="flex items-center gap-1 bg-[#D4AF37] text-black font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow-sm font-mono-numbers">
              <Sparkles className="w-2.5 h-2.5 fill-black" />
              <span>Featured</span>
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-red-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded shadow-sm font-mono-numbers">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2 right-2 z-10 p-2 rounded-full transition-all shadow-sm ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-black/50 text-white hover:bg-black hover:text-rose-400'
          }`}
          title={isWishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
          aria-label="Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Product Image */}
        <div className="relative aspect-square bg-[#F1F3F5] overflow-hidden">
          <img
            src={normalizeImageUrl(product.imageUrl, FALLBACK_PRODUCT_IMAGE)}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => handleImageError(e, FALLBACK_PRODUCT_IMAGE)}
            referrerPolicy="no-referrer"
            loading="lazy"
          />

          {/* Condition Tag */}
          {product.condition && (
            <span className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-xs text-white text-[9px] font-medium px-2 py-0.5 rounded pointer-events-none">
              {product.condition}
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between space-y-2">
          <div className="space-y-1">
            {/* Category & Rating */}
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-neutral-400 uppercase tracking-wider truncate max-w-[65%]">
                {product.category}
              </span>
              <div className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{product.rating ? product.rating.toFixed(1) : '4.9'}</span>
              </div>
            </div>

            {/* Title (2 lines max) */}
            <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 line-clamp-2 leading-tight group-hover:text-[#9A7D0A] transition-colors">
              {product.title}
            </h3>

            {/* Verified Merchant Trust Tag */}
            <div className="flex items-center gap-1 text-[10px] text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
              <ShieldCheck className="w-3 h-3 text-[#D4AF37] shrink-0" />
              <span className="font-semibold text-neutral-800 truncate">{product.shopName}</span>
              <span className="text-[9px] text-emerald-700 font-bold shrink-0 ml-auto flex items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5" /> Verified
              </span>
            </div>
          </div>

          {/* Price & Action Row */}
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-1">
            <div className="min-w-0 flex-1">
              {originalPrice > currentPrice ? (
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold text-neutral-950 font-mono-numbers truncate">
                    ₦{currentPrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-neutral-400 line-through font-mono-numbers">
                    ₦{originalPrice.toLocaleString()}
                  </span>
                </div>
              ) : (
                <div className="text-xs sm:text-sm font-bold text-neutral-950 font-mono-numbers truncate">
                  ₦{currentPrice.toLocaleString()}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Chat Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openChat(item);
                }}
                className="p-1.5 sm:px-2 sm:py-1.5 bg-neutral-100 hover:bg-[#D4AF37]/20 text-neutral-700 hover:text-black rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                title="Chat with Seller"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="hidden sm:inline text-[10px]">Chat</span>
              </button>

              {/* Add to Cart */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product, 1);
                }}
                className="p-1.5 sm:p-2 bg-black hover:bg-[#D4AF37] text-white hover:text-black rounded-lg transition-colors shadow-sm cursor-pointer"
                title="Add to Shopping Cart"
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
      className="group bg-white rounded-2xl border border-amber-200 overflow-hidden flex flex-col hover:border-amber-400 hover:shadow-xl transition-all duration-200 cursor-pointer relative"
    >
      {/* Featured Tag */}
      {ad.isFeatured && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-[#D4AF37] text-black font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow-sm font-mono-numbers">
          <Sparkles className="w-2.5 h-2.5 fill-black" />
          <span>Featured Ad</span>
        </div>
      )}

      {/* Classified Image */}
      <div className="relative aspect-square bg-[#F1F3F5] overflow-hidden">
        <img
          src={normalizeImageUrl(ad.imageUrl, FALLBACK_VEHICLE_IMAGE)}
          alt={ad.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => handleImageError(e, FALLBACK_VEHICLE_IMAGE)}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        <div className="absolute bottom-2 right-2 bg-amber-950/80 backdrop-blur-xs text-amber-200 text-[9px] font-semibold px-2 py-0.5 rounded">
          Classified Ad
        </div>
      </div>

      {/* Ad Info */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1">
          {/* Category & Location */}
          <div className="flex items-center justify-between text-[10px] text-neutral-400">
            <span className="uppercase tracking-wider font-bold truncate max-w-[55%]">{ad.category}</span>
            <span className="flex items-center gap-0.5 text-neutral-600 font-medium truncate max-w-[45%]">
              <MapPin className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
              {ad.city}, {ad.state}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 line-clamp-2 leading-tight group-hover:text-amber-800 transition-colors">
            {ad.title}
          </h3>

          {/* Advertiser attribution */}
          <div className="text-[10px] text-neutral-500 truncate">
            By <strong className="text-neutral-800 font-medium">{ad.advertiserName}</strong>
          </div>

          {/* Caution tag */}
          <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded text-[9px] text-amber-900 font-medium truncate">
            <AlertTriangle className="w-2.5 h-2.5 text-amber-600 shrink-0" />
            <span className="truncate">Caution: Direct deal · Inspect first</span>
          </div>
        </div>

        {/* Pricing & Chat Action */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-1">
          <div className="min-w-0 flex-1">
            <span className="text-[9px] text-neutral-400 block uppercase tracking-wide">
              {ad.isNegotiable ? 'Negotiable' : 'Asking'}
            </span>
            <div className="text-xs sm:text-sm font-bold text-neutral-950 font-mono-numbers truncate">
              ₦{ad.price.toLocaleString()}
            </div>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openChat(item);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#0A0A0A] hover:bg-[#D4AF37] text-white hover:text-black font-bold text-[10px] rounded-lg transition-colors shadow-sm cursor-pointer"
              title="Chat directly with Advertiser"
            >
              <MessageCircle className="w-3 h-3 text-[#D4AF37]" />
              <span>Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
