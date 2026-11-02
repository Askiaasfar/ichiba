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
  ShoppingBag,
  Flag,
  MessageCircle,
  Heart,
  Star,
  Truck,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Shield
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

  useEffect(() => {
    if (isProduct && product?.id) {
      trackProductView(product.id);
    }
    setActiveImageIndex(0);
  }, [product?.id, isProduct]);

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

  const isWishlisted = Boolean(isProduct && product && currentUser?.wishlist?.includes(product.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-[#0A0A0A] text-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-[#D4AF37]/40 max-h-[94vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-neutral-800 bg-[#000000] shrink-0">
          <div className="flex items-center gap-2">
            {isProduct ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 rounded-lg text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified ASKIA Merchant</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/80 text-amber-300 border border-amber-600/40 rounded-lg text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Classified Advertisement</span>
              </div>
            )}

            {((isProduct && product?.isFeatured) || (!isProduct && ad?.isFeatured)) && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-[#D4AF37] text-black text-[10px] font-black rounded uppercase tracking-wider font-mono-numbers">
                <Sparkles className="w-3 h-3 fill-black" />
                Featured
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isProduct && product && (
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isWishlisted
                    ? 'border-rose-500 bg-rose-950/60 text-rose-400'
                    : 'border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white'
                }`}
                title={isWishlisted ? 'Saved in Wishlist' : 'Save to Wishlist'}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1 text-sm pb-20 md:pb-6">
          {/* Main 2-Column Split: Gallery Left, Buy Box Right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Gallery Column */}
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 aspect-square flex items-center justify-center">
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
                <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/85 backdrop-blur-xs text-white text-xs font-semibold rounded-lg border border-neutral-700">
                  {isProduct ? product?.condition : ad?.condition}
                </div>

                {/* Gallery Navigation Buttons */}
                {imageGallery.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : imageGallery.length - 1))}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-black text-white border border-neutral-700 cursor-pointer shadow-md"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev < imageGallery.length - 1 ? prev + 1 : 0))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-black text-white border border-neutral-700 cursor-pointer shadow-md"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails strip */}
              {imageGallery.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
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

              {/* Promote action for seller */}
              {((isProduct && !product?.isFeatured && currentRole === 'shop_owner') ||
                (!isProduct && !ad?.isFeatured && currentRole === 'advertiser')) && (
                <div className="p-3 bg-neutral-900 border border-[#D4AF37]/30 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">Promote This Listing</span>
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
                    className="px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#C59F28] text-black font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Feature Now
                  </button>
                </div>
              )}
            </div>

            {/* Contiguous Buy Box & Item Info */}
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  {isProduct ? product?.category : ad?.category}
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-white mt-1 leading-snug">
                  {isProduct ? product?.title : ad?.title}
                </h1>
                {isProduct && product && typeof product.rating === 'number' && product.rating > 0 && (
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{product.rating.toFixed(1)}</span>
                    </div>
                    {typeof product.salesCount === 'number' && product.salesCount > 0 && (
                      <>
                        <span className="text-neutral-500">•</span>
                        <span className="text-neutral-400 font-mono-numbers">{product.salesCount} sold</span>
                      </>
                    )}
                    {typeof product.reviewsCount === 'number' && product.reviewsCount > 0 && (
                      <>
                        <span className="text-neutral-500">•</span>
                        <span className="text-neutral-400">{product.reviewsCount} reviews</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Price Box */}
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-1">
                <span className="text-[11px] text-neutral-400 uppercase tracking-wide block">
                  {isProduct ? 'ASKIA MARKET Verified Price' : ad?.isNegotiable ? 'Asking Price (Negotiable)' : 'Asking Price'}
                </span>
                {isProduct && originalPrice > currentPrice ? (
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <div className="text-2xl sm:text-3xl font-bold text-[#D4AF37] font-mono-numbers">
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
                  <div className="text-2xl sm:text-3xl font-bold text-[#D4AF37] font-mono-numbers">
                    ₦{(isProduct ? product?.price : ad?.price)?.toLocaleString()}
                  </div>
                )}
                {isProduct && (
                  <div className="text-xs text-emerald-400 font-semibold pt-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Protected by ASKIA Escrow Guarantee</span>
                  </div>
                )}
              </div>

              {/* Seller / Store Identity */}
              {isProduct && shop ? (
                <div className="p-3.5 bg-neutral-900 border border-[#D4AF37]/30 rounded-xl space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                        <h4 className="text-sm font-bold text-white">{shop.name}</h4>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5 font-mono-numbers">
                        Badge: <strong className="text-[#D4AF37]">{shop.verificationBadgeNumber}</strong>
                      </p>
                    </div>
                    {onOpenShop && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenShop(shop.id);
                        }}
                        className="text-xs text-[#D4AF37] hover:underline font-bold cursor-pointer"
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
                    <span className="font-bold text-neutral-300">Advertiser</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                      {ad?.city}, {ad?.state}
                    </span>
                  </div>
                  <div className="font-bold text-white text-sm">
                    {ad?.advertiserName}
                  </div>
                  <div className="pt-2 border-t border-neutral-800 flex flex-wrap gap-2 text-xs">
                    <button
                      onClick={() => handleCopyPhone(ad?.advertiserPhone || '')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-black border border-neutral-700 rounded-xl hover:border-neutral-500 font-medium text-neutral-200 transition-colors cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{copiedPhone ? 'Copied Phone!' : ad?.advertiserPhone}</span>
                    </button>
                    <a
                      href={`tel:${ad?.advertiserPhone}`}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Now</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Desktop Direct Purchase Actions */}
              <div className="space-y-2.5 hidden md:block">
                {isProduct && product && (
                  <button
                    onClick={() => {
                      addToCart(product, 1);
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#D4AF37] hover:bg-[#C59F28] text-black font-bold rounded-xl transition-all shadow-md cursor-pointer text-sm"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Shopping Cart</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    openChat(item);
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 hover:border-[#D4AF37] font-bold rounded-xl transition-colors cursor-pointer text-xs"
                >
                  <MessageCircle className="w-4 h-4 text-[#D4AF37]" />
                  <span>Chat with Seller</span>
                </button>
              </div>

              {/* Service Guarantees */}
              <div className="grid grid-cols-2 gap-2 text-xs">
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

          {/* Classified Caution Banner */}
          {!isProduct && (
            <div className="space-y-3">
              <CautionNoticeBanner variant="full" />
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Classified advertisement under ASKIA subscription</span>
                <button
                  onClick={handleReport}
                  disabled={reported}
                  className="flex items-center gap-1 text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{reported ? 'Listing Reported' : 'Report Fraud / Suspicious'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Description Section */}
          <div className="space-y-2 pt-4 border-t border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Product Overview</h3>
            <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
              {isProduct ? product?.description : ad?.description}
            </p>
          </div>

          {/* Technical Specifications */}
          {isProduct && product?.specs && Object.keys(product.specs).length > 0 && (
            <div className="space-y-3 pt-4 border-t border-neutral-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Technical Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(product.specs).map(([k, v]) => (
                  <div key={k} className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs flex justify-between">
                    <span className="text-neutral-400">{k}</span>
                    <strong className="text-white font-medium">{v}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Sticky Bottom Purchase Bar */}
        <div className="md:hidden sticky bottom-0 left-0 right-0 bg-[#000000] border-t border-neutral-800 p-3 flex items-center gap-2 z-20 shadow-2xl">
          <button
            onClick={() => {
              openChat(item);
              onClose();
            }}
            className="p-3 bg-neutral-900 text-white border border-neutral-700 rounded-xl shrink-0 cursor-pointer"
            title="Chat"
          >
            <MessageCircle className="w-5 h-5 text-[#D4AF37]" />
          </button>

          {isProduct && product ? (
            <button
              onClick={() => {
                addToCart(product, 1);
                onClose();
              }}
              className="flex-1 py-3 bg-[#D4AF37] text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart (₦{currentPrice.toLocaleString()})</span>
            </button>
          ) : (
            <a
              href={`tel:${ad?.advertiserPhone}`}
              className="flex-1 py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md"
            >
              <Phone className="w-4 h-4" />
              <span>Call Advertiser (₦{ad?.price.toLocaleString()})</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
