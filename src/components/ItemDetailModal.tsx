import React, { useState } from 'react';
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
  Share2
} from 'lucide-react';
import { CautionNoticeBanner } from './CautionNoticeBanner';

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
  const { addToCart, shops, currentRole, platformSettings, reportAdvertisement } = useMarketplace();
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [reported, setReported] = useState(false);
  const [showSafetyChecklist, setShowSafetyChecklist] = useState(false);

  if (!item) return null;

  const isProduct = item.type === 'product';
  const product = isProduct ? item.data : null;
  const ad = !isProduct ? item.data : null;

  const shop = isProduct ? shops.find((s) => s.id === product?.shopId) : null;

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            {isProduct ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Merchant Store Product</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-md text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Individual Classified Advertisement</span>
              </div>
            )}

            {((isProduct && product?.isFeatured) || (!isProduct && ad?.isFeatured)) && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-slate-950 text-[11px] font-bold rounded">
                <Sparkles className="w-3 h-3" />
                Featured
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Main Visual & Key Data Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Image Box */}
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-4/3">
                <img
                  src={isProduct ? product?.imageUrl : ad?.imageUrl}
                  alt={isProduct ? product?.title : ad?.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-medium rounded-md">
                  {isProduct ? product?.condition : ad?.condition}
                </div>
              </div>

              {/* Boost / Feature Action for Owner */}
              {((isProduct && !product?.isFeatured && currentRole === 'shop_owner') ||
                (!isProduct && !ad?.isFeatured && currentRole === 'advertiser')) && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-indigo-950 block">Boost this listing</span>
                    <span className="text-indigo-700 text-[11px]">
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
                    className="px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Pay & Feature
                  </button>
                </div>
              )}
            </div>

            {/* Item Information */}
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {isProduct ? product?.category : ad?.category}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1 leading-snug">
                  {isProduct ? product?.title : ad?.title}
                </h2>
              </div>

              {/* Price */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="text-xs text-slate-500 block">
                  {isProduct ? 'Verified Store Official Price' : ad?.isNegotiable ? 'Asking Price (Negotiable)' : 'Asking Price'}
                </span>
                {isProduct && product?.salePrice !== undefined && product?.salePrice !== null && product.salePrice > 0 ? (
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <div className="text-2xl font-bold text-amber-700 font-mono-numbers">
                      ₦{product.salePrice.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-400 line-through font-mono-numbers">
                      ₦{product.price.toLocaleString()}
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded">
                      Promo Sale
                    </span>
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-slate-950 font-mono-numbers mt-0.5">
                    ₦{(isProduct ? product?.price : ad?.price)?.toLocaleString()}
                  </div>
                )}
                {isProduct && (
                  <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
                    ✓ Verified Store Buyer Protection & Escrow Payout Included
                  </span>
                )}
              </div>

              {/* Seller / Store Identity Card */}
              {isProduct && shop ? (
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-sm font-bold text-slate-900">{shop.name}</h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 font-mono-numbers">
                        Verified Badge: <strong className="text-emerald-700">{shop.verificationBadgeNumber}</strong>
                      </p>
                    </div>
                    {onOpenShop && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenShop(shop.id);
                        }}
                        className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline"
                      >
                        Visit Storefront
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{shop.address}</span>
                  </div>
                </div>
              ) : (
                /* Individual Advertiser Contact Card */
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Individual Advertiser</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {ad?.city}, {ad?.state}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-900 text-sm">
                    {ad?.advertiserName}
                  </div>
                  <div className="pt-2 border-t border-slate-200/80 flex flex-wrap gap-2 text-xs">
                    <button
                      onClick={() => handleCopyPhone(ad?.advertiserPhone || '')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium text-slate-800 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
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

              {/* Primary Buying / Interacting Action */}
              {isProduct && product && (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      addToCart(product, 1);
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Shopping Cart</span>
                  </button>
                  <p className="text-[11px] text-center text-slate-500">
                    In Stock: {product.stock} units available · Fulfilled by verified shop
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* CRITICAL: Caution Notice Banner for Advertisements */}
          {!isProduct && (
            <div className="space-y-3">
              <CautionNoticeBanner variant="full" />

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Posted via Advertiser Subscription (5 Ads / ₦1,000 plan)</span>
                <button
                  onClick={handleReport}
                  disabled={reported}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{reported ? 'Listing Reported' : 'Report Fraud / Scam'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</h4>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {isProduct ? product?.description : ad?.description}
            </p>
          </div>

          {/* Technical Specifications (For verified products) */}
          {isProduct && product?.specs && Object.keys(product.specs).length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Technical Specifications</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 flex justify-between">
                    <span className="text-slate-500">{key}:</span>
                    <span className="font-semibold text-slate-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
