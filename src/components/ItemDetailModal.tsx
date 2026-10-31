import React, { useState, useEffect } from 'react';
import { Product, Advertisement } from '../types/marketplace';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  CheckCircle,
  Flag,
  Share2,
  MessageCircle,
  Heart,
  Star,
  Truck,
  RotateCcw,
  Shield,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { CautionNoticeBanner } from './CautionNoticeBanner';
import { normalizeImageUrl, handleImageError, FALLBACK_PRODUCT_IMAGE, FALLBACK_VEHICLE_IMAGE } from '../utils/imageUtils';

type ListingItem = 
  | { type: 'product'; data: Product }
  | { type: 'ad'; data: Advertisement };

interface ItemDetailModalProps {
  item: ListingItem | null;
  onClose: () => void;
  onOpenShop?: (shopId: string) => void;
  onOpenPaymentModal?: (item: { type: 'feature_product' | 'feature_ad'; id: string; title: string; price: number }) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onOpenShop,
  onOpenPaymentModal
}) => {
  const { 
    addToCart, 
    shops, 
    currentRole, 
    currentUser, 
    platformSettings, 
    reportAdvertisement, 
    openChat,
    toggleWishlist,
    trackProductView 
  } = useMarketplace();

  const [copiedPhone, setCopiedPhone] = useState(false);
  const [reported, setReported] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!item) return null;

  const isProduct = item.type === 'product';
  const product = isProduct ? item.data : null;
  const ad = !isProduct ? item.data : null;
  const shop = isProduct ? shops.find((s) => s.id === product?.shopId) : null;

  // Track product view on open
  useEffect(() => {
    if (isProduct && product?.id) {
      trackProductView(product.id);
    }
    setActiveImageIndex(0);
  }, [product?.id, isProduct]);

  // Image list for gallery
  const imageGallery: string[] = isProduct
    ? (product?.images && product.images.length > 0
        ? product.images
        : [product?.imageUrl || ''])
    : [ad?.imageUrl || ''];

  const currentImage = imageGallery[activeImageIndex] || imageGallery[0];

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleReport = () => {
    if (ad) {
      reportAdvertisement(ad.id, 'Potential fraud or suspicious listing');
      setReported(true);
    }
  };

  const originalPrice = product?.originalPrice || (product?.salePrice ? product.price : 0);
  const currentPrice = product?.salePrice ? product.salePrice : (product?.price || 0);
  const discountPercent = product?.discountPercent || (originalPrice > currentPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-[#0A0A0A] text-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-[#D4AF37]/30 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-black/90 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {isProduct ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/60 text-emerald-300 border border-emerald-600/40 rounded-lg text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified ASKIA Merchant Store</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/60 text-amber-300 border border-amber-600/40 rounded-lg text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Individual Classified Advertisement</span>
              </div>
            )}

            {((isProduct && product?.isFeatured) || (!isProduct && ad?.isFeatured)) && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-[#D4AF37] text-black text-[10px] font-black rounded uppercase tracking-wider font-mono-numbers">
                <Sparkles className="w-3 h-3" />
                Featured
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isProduct && product && (
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  currentUser?.wishlist?.includes(product.id)
                    ? 'border-rose-500/50 bg-rose-950/40 text-rose-400'
                    : 'border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-4 h-4 ${currentUser?.wishlist?.includes(product.id) ? 'fill-rose-500' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1 text-sm">
          {/* Main Visual & Key Data Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Gallery Image Box */}
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 aspect-square sm:aspect-4/3 flex items-center justify-center">
                <img
                  src={normalizeImageUrl(
                    currentImage,
                    isProduct ? FALLBACK_PRODUCT_IMAGE : FALLBACK_VEHICLE_IMAGE
                  )}
                  alt={isProduct ? product?.title : ad?.title}
                  className="w-full h-full object-cover"
                  onError={(e) =>
                    handleImageError(e, isProduct ? FALLBACK_PRODUCT_IMAGE : FALLBACK_VEHICLE_IMAGE)
                  }
                  referrerPolicy="no-referrer"
                />

                {/* Condition Tag */}
                <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 bg-black/80 backdrop-blur-md text-white text-xs font-semibold rounded-lg border border-neutral-700">
                  {isProduct ? product?.condition : ad?.condition}
                </div>

                {/* View Counter */}
                {isProduct && product?.viewCount && product.viewCount > 0 && (
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-1 bg-black/80 backdrop-blur-md text-neutral-300 text-xs font-mono-numbers rounded-lg flex items-center gap-1 border border-neutral-700">
                    <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{product.viewCount.toLocaleString()} views</span>
                  </div>
                )}

                {/* Prev / Next controls for gallery */}
                {imageGallery.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : imageGallery.length - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black text-white border border-neutral-700 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev < imageGallery.length - 1 ? prev + 1 : 0))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black text-white border border-neutral-700 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails strip */}
              {imageGallery.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {imageGallery.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        activeImageIndex === idx ? 'border-[#D4AF37]' : 'border-neutral-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={normalizeImageUrl(imgUrl, FALLBACK_PRODUCT_IMAGE)}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Boost / Feature Action for Owner */}
              {((isProduct && !product?.isFeatured && currentRole === 'shop_owner') ||
                (!isProduct && !ad?.isFeatured && currentRole === 'advertiser')) && (
                <div className="p-3 bg-neutral-900 border border-[#D4AF37]/30 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">Promote Listing</span>
                    <span className="text-[#D4AF37] text-[11px]">
                      {isProduct
                        ? `Feature for ₦${platformSettings.featureProductPriceNgn.toLocaleString()} / 7 days`
                        : `Feature for ₦${platformSettings.featureAdPriceNgn.toLocaleString()} / 7 days`}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (onOpenPaymentModal) {
                        onOpenPaymentModal({
                          type: isProduct ? 'feature_product' : 'feature_ad',
                          id: isProduct ? product!.id : ad!.id,
                          title: isProduct ? product!.title : ad!.title,
                          price: isProduct ? platformSettings.featureProductPriceNgn : platformSettings.featureAdPriceNgn
                        });
                      }
                    }}
                    className="px-3 py-1.5 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#c29f2f] transition-colors cursor-pointer"
                  >
                    Feature Now
                  </button>
                </div>
              )}
            </div>

            {/* Item Information */}
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                  {isProduct ? product?.category : ad?.category}
                </span>
                <h2 className="text-xl font-bold text-white mt-1 leading-snug">
                  {isProduct ? product?.title : ad?.title}
                </h2>
                {isProduct && product?.rating && (
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{product.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-neutral-500">•</span>
                    <span className="text-neutral-400 font-mono-numbers">{product.salesCount || 12} sold</span>
                    <span className="text-neutral-500">•</span>
                    <span className="text-neutral-400">{product.reviewsCount || 8} reviews</span>
                  </div>
                )}
              </div>

              {/* Price Display */}
              <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl">
                <span className="text-xs text-neutral-400 block">
                  {isProduct ? 'ASKIA MARKET Verified Official Price' : ad?.isNegotiable ? 'Asking Price (Negotiable)' : 'Asking Price'}
                </span>
                {isProduct && originalPrice > currentPrice ? (
                  <div className="flex items-baseline gap-2.5 mt-1 flex-wrap">
                    <div className="text-2xl font-bold text-[#D4AF37] font-mono-numbers">
                      ₦{currentPrice.toLocaleString()}
                    </div>
                    <div className="text-sm text-neutral-500 line-through font-mono-numbers">
                      ₦{originalPrice.toLocaleString()}
                    </div>
                    {discountPercent > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-red-950 text-red-300 border border-red-800 rounded">
                        -{discountPercent}% Promo
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-[#D4AF37] font-mono-numbers mt-1">
                    ₦{(isProduct ? product?.price : ad?.price)?.toLocaleString()}
                  </div>
                )}
                {isProduct && (
                  <span className="text-[11px] text-emerald-400 font-medium mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Store Escrow & Buyer Guarantee Protected
                  </span>
                )}
              </div>

              {/* Seller / Store Identity Card */}
              {isProduct && shop ? (
                <div className="p-3.5 bg-neutral-900 border border-[#D4AF37]/30 rounded-xl space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                        <h4 className="text-sm font-bold text-white">{shop.name}</h4>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5 font-mono-numbers">
                        Verification Badge: <strong className="text-[#D4AF37]">{shop.verificationBadgeNumber}</strong>
                      </p>
                    </div>
                    {onOpenShop && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenShop(shop.id);
                        }}
                        className="text-xs text-[#D4AF37] hover:underline font-semibold cursor-pointer"
                      >
                        Visit Storefront →
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-neutral-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{shop.address}</span>
                  </div>
                </div>
              ) : (
                /* Individual Advertiser Contact Card */
                <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span className="font-semibold text-neutral-300">Individual Advertiser</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                      {ad?.city}, {ad?.state}
                    </span>
                  </div>
                  <div className="font-semibold text-white text-sm">
                    {ad?.advertiserName}
                  </div>
                  <div className="pt-2 border-t border-neutral-800 flex flex-wrap gap-2 text-xs">
                    <button
                      onClick={() => handleCopyPhone(ad?.advertiserPhone || '')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-black border border-neutral-700 rounded-lg hover:border-neutral-600 font-medium text-neutral-200 transition-colors cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{copiedPhone ? 'Copied Phone!' : ad?.advertiserPhone}</span>
                    </button>
                    <a
                      href={`tel:${ad?.advertiserPhone}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Advertiser</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Action Buttons: Add to Cart & Chat with Seller */}
              <div className="space-y-2.5 pt-1">
                {isProduct && product && (
                  <button
                    onClick={() => {
                      addToCart(product, 1);
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#D4AF37] hover:bg-[#c29f2f] text-black font-bold rounded-xl transition-colors shadow-lg shadow-[#D4AF37]/20 cursor-pointer text-sm"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Shopping Cart</span>
                  </button>
                )}

                {/* Instant Chat with Seller Button */}
                <button
                  onClick={() => {
                    openChat(item);
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-[#D4AF37]/40 hover:border-[#D4AF37] font-semibold rounded-xl transition-colors cursor-pointer text-xs"
                >
                  <MessageCircle className="w-4 h-4 text-[#D4AF37]" />
                  <span>Chat directly with Seller / Merchant</span>
                </button>

                {isProduct && product && (
                  <p className="text-[11px] text-center text-neutral-400">
                    Stock status: {product.stock > 0 ? `${product.stock} units in stock` : 'Available on order'}
                  </p>
                )}
              </div>

              {/* Delivery & Warranty Guarantees */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-black border border-neutral-800 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span className="text-[11px] text-neutral-300">Fast Nationwide Delivery</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black border border-neutral-800 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span className="text-[11px] text-neutral-300">7-Day Return Policy</span>
                </div>
              </div>
            </div>
          </div>

          {/* CRITICAL: Caution Notice Banner for Advertisements */}
          {!isProduct && (
            <div className="space-y-3">
              <CautionNoticeBanner variant="full" />

              <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                <span>Posted via ASKIA MARKET Advertiser Subscription</span>
                <button
                  onClick={handleReport}
                  disabled={reported}
                  className="flex items-center gap-1 text-red-400 hover:text-red-300 font-medium cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{reported ? 'Listing Reported' : 'Report Fraud / Suspicious Listing'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2 pt-3 border-t border-neutral-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Description</h4>
            <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
              {isProduct ? product?.description : ad?.description}
            </p>
          </div>

          {/* Technical Specifications */}
          {isProduct && product?.specs && Object.keys(product.specs).length > 0 && (
            <div className="space-y-2 pt-3 border-t border-neutral-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Technical Specifications</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex justify-between">
                    <span className="text-neutral-400">{key}:</span>
                    <span className="font-semibold text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Reviews Section */}
          {isProduct && (
            <div className="space-y-3 pt-3 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Customer Reviews & Ratings
                </h4>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>4.9 out of 5</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Chuka E. (Lagos)</span>
                    <div className="flex text-amber-400">
                      {'★'.repeat(5)}
                    </div>
                  </div>
                  <p className="text-neutral-300">
                    "Delivered in less than 24 hours. The item was brand new in original box and fully verified."
                  </p>
                  <span className="text-[10px] text-emerald-400 font-medium">✓ Verified ASKIA Order</span>
                </div>

                <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Amina B. (Abuja)</span>
                    <div className="flex text-amber-400">
                      {'★'.repeat(5)}
                    </div>
                  </div>
                  <p className="text-neutral-300">
                    "Authentic product and responsive merchant support. Smooth payment through the gateway."
                  </p>
                  <span className="text-[10px] text-emerald-400 font-medium">✓ Verified ASKIA Order</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
