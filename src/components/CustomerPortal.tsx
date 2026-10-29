import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  Package,
  Heart,
  MessageSquare,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShoppingBag,
  MapPin,
  Mail,
  Phone,
  User,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { Product } from '../types/marketplace';
import { normalizeImageUrl, handleImageError } from '../utils/imageUtils';

interface CustomerPortalProps {
  onOpenProductModal?: (product: Product) => void;
  onOpenCart?: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  onOpenProductModal,
  onOpenCart
}) => {
  const {
    currentUser,
    orders,
    products,
    chatThreads,
    openChat,
    addToCart,
    toggleWishlist
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'chats'>('orders');

  // Filter orders associated with the buyer
  const buyerOrders = orders.filter(
    (o) =>
      o.buyerEmail.toLowerCase() === currentUser.email.toLowerCase() ||
      currentUser.accountType === 'buyer'
  );

  // Buyer wishlist items
  const wishlistIds = currentUser.wishlist || [];
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  // Buyer chat threads
  const buyerThreads = Object.values(chatThreads);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Customer Profile Banner */}
      <div className="bg-gradient-to-r from-black via-[#0A0A0A] to-slate-900 border border-[#262626] rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-black border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] text-2xl font-bold font-serif-brand shadow-md">
            {currentUser.name ? currentUser.name[0] : 'C'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-white tracking-wide font-serif-brand">
                {currentUser.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 uppercase tracking-wider">
                Customer Account
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                {currentUser.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                {currentUser.phone || '+234 800 000 0000'}
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Escrow Protected Buyer
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3.5">
          <div className="text-center px-3 border-r border-white/10">
            <div className="text-lg font-bold text-[#D4AF37] font-mono-numbers">
              {buyerOrders.length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Orders</div>
          </div>
          <div className="text-center px-3 border-r border-white/10">
            <div className="text-lg font-bold text-[#D4AF37] font-mono-numbers">
              {wishlistProducts.length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Saved</div>
          </div>
          <div className="text-center px-3">
            <div className="text-lg font-bold text-[#D4AF37] font-mono-numbers">
              {buyerThreads.length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Chats</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-[#D4AF37] text-black font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4 text-[#D4AF37]" />
          <span>My Orders & Escrow Tracking</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700">
            {buyerOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'wishlist'
              ? 'border-[#D4AF37] text-black font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500" />
          <span>Saved Items (Wishlist)</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700">
            {wishlistProducts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('chats')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'chats'
              ? 'border-[#D4AF37] text-black font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span>Seller Conversations</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700">
            {buyerThreads.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {buyerOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Orders Placed Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore thousands of verified products from accredited merchant stores with full Askia Market escrow buyer protection.
              </p>
            </div>
          ) : (
            buyerOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden hover:border-[#D4AF37]/50 transition-all"
              >
                {/* Order Top Bar */}
                <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 font-mono-numbers">
                      #{order.id}
                    </span>
                    <span className="text-slate-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
                        order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'dispatched'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status === 'delivered' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : order.status === 'dispatched' ? (
                        <Truck className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      <span className="capitalize">{order.status}</span>
                    </span>

                    {/* Escrow badge */}
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#D4AF37]/15 text-[#917112] border border-[#D4AF37]/30 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>
                        {order.paymentStatus === 'paid_escrow'
                          ? 'Escrow Secured'
                          : order.paymentStatus === 'payout_released'
                          ? 'Settled'
                          : 'Processing'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="p-5 space-y-3">
                  <div className="divide-y divide-slate-100">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-slate-900">{item.title}</div>
                          <div className="text-[11px] text-slate-500">
                            Merchant: <span className="font-medium text-slate-700">{item.shopName}</span> · Qty: {item.quantity}
                          </div>
                        </div>
                        <div className="text-right font-bold text-slate-900 font-mono-numbers">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary & Destination */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50/70 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span>
                        Delivery to: <span className="font-semibold text-slate-900">{order.deliveryAddress}, {order.city}, {order.state}</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 mr-2">Total Amount:</span>
                      <span className="text-sm font-bold text-slate-900 font-mono-numbers">
                        ₦{order.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Wishlist */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlistProducts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
              <Heart className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Your Wishlist is Empty</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Save your favorite products while browsing to compare prices, verify store badges, and purchase later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlistProducts.map((prod) => {
                const currentPrice =
                  prod.salePrice !== undefined && prod.salePrice !== null && prod.salePrice > 0
                    ? prod.salePrice
                    : prod.price;

                return (
                  <div
                    key={prod.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between shadow-xs hover:border-[#D4AF37] transition-all group"
                  >
                    <div>
                      <div className="relative rounded-lg overflow-hidden h-40 bg-slate-100 mb-3">
                        <img
                          src={normalizeImageUrl(prod.imageUrl || (prod.images && prod.images[0]))}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={handleImageError}
                        />
                        <button
                          onClick={() => toggleWishlist(prod.id)}
                          className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-rose-50 rounded-full text-rose-500 shadow-sm"
                          title="Remove from saved"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider mb-1">
                        {prod.shopName}
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs line-clamp-2 mb-2">
                        {prod.title}
                      </h4>
                      <div className="text-sm font-bold text-slate-900 font-mono-numbers">
                        ₦{currentPrice.toLocaleString()}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 mt-3 flex items-center gap-2">
                      <button
                        onClick={() => {
                          addToCart(prod, 1);
                          onOpenCart?.();
                        }}
                        className="flex-1 py-2 bg-[#D4AF37] hover:bg-[#c29f2f] text-black font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>

                      <button
                        onClick={() => openChat({ type: 'product', data: prod })}
                        className="p-2 border border-slate-200 hover:border-slate-400 text-slate-700 rounded-lg text-xs"
                        title="Chat with Seller"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Chat Inquiries */}
      {activeTab === 'chats' && (
        <div className="space-y-3">
          {buyerThreads.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Inquiries Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When you initiate a chat inquiry with a merchant or advertiser, your conversations will appear here.
              </p>
            </div>
          ) : (
            buyerThreads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => {
                  const item = products.find((p) => p.id === thread.listingId);
                  if (item) {
                    openChat({ type: 'product', data: item });
                  }
                }}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:border-[#D4AF37] cursor-pointer shadow-xs transition-all flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    <img
                      src={thread.listingImageUrl}
                      alt={thread.listingTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-xs">
                      {thread.listingTitle}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Seller: <span className="font-medium text-slate-800">{thread.sellerName}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 line-clamp-1 italic">
                      "{thread.messages[thread.messages.length - 1]?.text || 'No messages'}"
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-slate-900 font-mono-numbers">
                    ₦{thread.listingPrice.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold inline-block mt-1">
                    Open Thread
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
