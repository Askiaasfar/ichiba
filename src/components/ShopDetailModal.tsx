import React from 'react';
import { Shop, Product } from '../types/marketplace';
import { useMarketplace } from '../context/MarketplaceContext';
import { X, ShieldCheck, MapPin, Phone, Mail, Star, PackageCheck } from 'lucide-react';
import { ListingCard } from './ListingCard';

interface ShopDetailModalProps {
  shopId: string | null;
  onClose: () => void;
  onSelectProduct: (item: { type: 'product'; data: Product }) => void;
}

export const ShopDetailModal: React.FC<ShopDetailModalProps> = ({
  shopId,
  onClose,
  onSelectProduct
}) => {
  const { shops, products } = useMarketplace();

  if (!shopId) return null;
  const shop = shops.find((s) => s.id === shopId);
  if (!shop) return null;

  const shopProducts = products.filter((p) => p.shopId === shop.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Store Banner */}
        <div className="relative h-44 sm:h-52 bg-slate-900 overflow-hidden shrink-0">
          <img
            src={shop.bannerUrl}
            alt={shop.name}
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          {/* Header Info Overlay */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div className="text-white space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500 text-slate-950 text-xs font-bold rounded-md shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Merchant</span>
                </span>
                <span className="text-xs text-slate-300 font-mono-numbers">
                  Badge: <strong>{shop.verificationBadgeNumber}</strong>
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">{shop.name}</h2>
              <p className="text-xs text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{shop.address}</span>
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-white bg-slate-900/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-bold">{shop.rating}</span>
              <span className="text-slate-400 font-mono-numbers">({shop.reviewCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Store Overview Strip */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Verification Status</span>
              <span className="font-semibold text-emerald-800 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified & CAC Registered
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Platform Commission Model</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {shop.commissionType === 'percentage' ? `${shop.commissionValue}% per sale` : `₦${shop.commissionValue} flat fee per sale`}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Store Contact</span>
              <span className="font-semibold text-slate-800 font-mono-numbers mt-0.5 block">
                {shop.phone}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">About the Store</h4>
            <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
              {shop.description}
            </p>
          </div>

          {/* Product Catalog */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-emerald-600" />
                <span>Store Catalog ({shopProducts.length} Items)</span>
              </h3>
              <span className="text-xs text-slate-500">All covered by return guarantee</span>
            </div>

            {shopProducts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No products currently listed for this store.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {shopProducts.map((p) => (
                  <ListingCard
                    key={p.id}
                    item={{ type: 'product', data: p }}
                    onSelect={(it) => {
                      if (it.type === 'product') {
                        onSelectProduct(it);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
