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
  Eye,
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

    // Calculate discount percent if not explicitly provided
    const originalPrice = product.originalPrice || (product.salePrice ? product.price : 0);
    const currentPrice = product.salePrice ? product.salePrice : product.price;
    const discountPercent = product.discountPercent || (originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0);

    const formatViewCount = (views?: number) => {
      if (!views) return null;
      if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
      return `${views}`;
    };

    return (
      <div 
        onClick={() => onSelect(item)}
        className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden flex flex-col hover:border-[#D4AF37]/80 hover:shadow-lg transition-all duration-300 cursor-pointer relative"
      >
        {/* Badges on Image */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
          {product.isFeatured && (
            <span className="flex items-center gap-1 bg-[#D4AF37] text-black font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow-xs font-mono-numbers">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Featured</span>
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-red-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded shadow-xs font-mono-numbers">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-full backdrop-blur-md transition-colors ${
            currentUser?.wishlist?.includes(product.id)
              ? 'bg-rose-50 text-rose-600 shadow-xs'
              : 'bg-black/40 text-white hover:bg-black/70 hover:text-rose-400'
          }`}
          title={currentUser?.wishlist?.includes(product.id) ? 'Saved' : 'Save to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${currentUser?.wishlist?.includes(product.id) ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Product Image */}
        <div className="relative aspect-square sm:aspect-4/3 bg-neutral-100 overflow-hidden">
          <img
            src={normalizeImageUrl(product.imageUrl, FALLBACK_PRODUCT_IMAGE)}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
            onError={(e) => handleImageError(e, FALLBACK_PRODUCT_IMAGE)}
            referrerPolicy="no-referrer"
            loading="lazy"
          />

          {/* Bottom pills on image */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
            {product.condition && (
              <span className="bg-black/75 backdrop-blur-xs text-white text-[9px] font-medium px-1.5 py-0.5 rounded tracking-wide">
                {product.condition}
              </span>
            )}
            {product.viewCount && product.viewCount > 0 ? (
              <span className="ml-auto bg-black/75 backdrop-blur-xs text-neutral-300 text-[9px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 font-mono-numbers">
                <Eye className="w-2.5 h-2.5 text-[#D4AF37]" />
                {formatViewCount(product.viewCount)}
              </span>
            ) : null}
          </div>
        </div>

        {/* Product Details */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
          <div className="space-y-1.5">
            {/* Category & Rating */}
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold text-neutral-400 uppercase tracking-widest truncate">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-amber-500 font-bold shrink-0">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{product.rating ? product.rating.toFixed(1) : '4.9'}</span>
                {product.reviewsCount && (
                  <span className="text-neutral-400 font-normal">({product.reviewsCount})</span>
                )}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 line-clamp-2 leading-snug group-hover:text-[#9A7D0A] transition-colors">
              {product.title}
            </h3>

            {/* Verified Merchant Badge */}
            <div className="flex items-center gap-1 text-[11px] text-neutral-700 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="font-medium text-neutral-800 truncate">{product.shopName}</span>
              <span className="text-[9px] text-[#9A7D0A] font-bold shrink-0 ml-auto flex items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5" /> Verified
              </span>
            </div>
          </div>

          {/* Pricing & Actions */}
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-1.5">
            <div className="min-w-0">
              <span className="text-[9px] text-neutral-400 block tracking-wide uppercase">ASKIA Price</span>
              {originalPrice > currentPrice ? (
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className="text-sm sm:text-base font-bold text-neutral-950 font-mono-numbers">
                    ₦{currentPrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-neutral-400 line-through font-mono-numbers">
                    ₦{originalPrice.toLocaleString()}
                  </span>
                </div>
              ) : (
                <div className="text-sm sm:text-base font-bold text-neutral-950 font-mono-numbers truncate">
                  ₦{currentPrice.toLocaleString()}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Chat with Seller */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openChat(item);
                }}
                className="p-1.5 sm:px-2.5 sm:py-1.5 bg-neutral-100 hover:bg-[#D4AF37]/10 text-neutral-700 hover:text-black rounded-lg text-xs font-medium transition-colors border border-transparent hover:border-[#D4AF37]/30 flex items-center gap-1 cursor-pointer"
                title="Chat with Seller"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="hidden sm:inline text-[11px]">Chat</span>
              </button>

              {/* Add to Cart */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product, 1);
                }}
                className="p-1.5 sm:p-2 bg-black text-white hover:bg-[#D4AF37] hover:text-black rounded-lg transition-colors shadow-xs cursor-pointer"
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
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-[#D4AF37] text-black font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow-xs font-mono-numbers">
          <Sparkles className="w-2.5 h-2.5 text-black" />
          <span>Featured Ad</span>
        </div>
      )}

      {/* Classified Image */}
      <div className="relative aspect-square sm:aspect-4/3 bg-neutral-100 overflow-hidden">
        <img
          src={normalizeImageUrl(ad.imageUrl, FALLBACK_VEHICLE_IMAGE)}
          alt={ad.title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
          onError={(e) => handleImageError(e, FALLBACK_VEHICLE_IMAGE)}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        <div className="absolute bottom-2 right-2 bg-amber-950/80 backdrop-blur-xs text-amber-200 text-[9px] font-medium px-1.5 py-0.5 rounded tracking-wide">
          Classified Ad
        </div>
      </div>

      {/* Ad Details */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <div className="space-y-1.5">
          {/* Category & Location */}
          <div className="flex items-center justify-between text-[10px] text-neutral-400">
            <span className="uppercase tracking-widest font-semibold">{ad.category}</span>
            <span className="flex items-center gap-0.5 text-neutral-500 font-medium">
              <MapPin className="w-2.5 h-2.5 text-neutral-400" />
              {ad.city}, {ad.state}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 line-clamp-2 leading-snug group-hover:text-amber-800 transition-colors">
            {ad.title}
          </h3>

          {/* Advertiser attribution */}
          <div className="text-[11px] text-neutral-500">
            By <span className="text-neutral-800 font-medium">{ad.advertiserName}</span>
          </div>

          {/* Prominent Caution Notice */}
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-300/80 rounded-lg text-[10px] text-amber-950 font-medium leading-tight">
            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
            <span className="truncate">
              <strong>Caution:</strong> Direct transaction · Inspect first
            </span>
          </div>
        </div>

        {/* Pricing & Chat with Seller Actions */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-1.5">
          <div className="min-w-0">
            <span className="text-[9px] text-neutral-400 block tracking-wide uppercase">
              {ad.isNegotiable ? 'Asking (Negotiable)' : 'Asking Price'}
            </span>
            <div className="text-sm sm:text-base font-bold text-neutral-950 font-mono-numbers truncate">
              ₦{ad.price.toLocaleString()}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openChat(item);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#0A0A0A] hover:bg-[#D4AF37] text-white hover:text-black font-semibold text-[11px] rounded-lg transition-colors shadow-xs cursor-pointer"
              title="Chat directly with Advertiser"
            >
              <MessageCircle className="w-3 h-3 text-[#D4AF37] group-hover:text-black" />
              <span>Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
