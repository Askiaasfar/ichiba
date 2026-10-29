import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Product, ShopStaffRole } from '../types/marketplace';
import {
  ShieldCheck,
  Plus,
  Sparkles,
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  CheckCircle,
  Clock,
  Users,
  UserPlus,
  Trash2,
  ShoppingBag,
  Truck,
  CreditCard
} from 'lucide-react';
import { MediaUpload } from './MediaUpload';
import { normalizeImageUrl, handleImageError, FALLBACK_PRODUCT_IMAGE } from '../utils/imageUtils';

interface ShopOwnerPortalProps {
  onOpenPaymentModal: (item: { type: 'feature_product'; id: string; title: string; price: number }) => void;
}

export const ShopOwnerPortal: React.FC<ShopOwnerPortalProps> = ({ onOpenPaymentModal }) => {
  const {
    currentShop,
    products,
    postProduct,
    platformSettings,
    shopStaff,
    addShopStaff,
    removeShopStaff,
    orders
  } = useMarketplace();

  // Sub-tabs
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'staff'>('inventory');

  // Add Product modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Electronics & Computers');
  const [newCondition, setNewCondition] = useState<'Brand New' | 'Open Box' | 'Refurbished'>('Brand New');
  const [newStock, setNewStock] = useState('5');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('/assets/images/product_tech_laptop_1793094444722.jpg');
  const [specCpu, setSpecCpu] = useState('Flagship Tier Processor');
  const [specWarranty, setSpecWarranty] = useState('12 Months Replacement Warranty');

  // Add Staff modal
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState<ShopStaffRole>('store_manager');

  if (!currentShop) {
    return <div className="p-8 text-center text-slate-500">No shop profile found.</div>;
  }

  const shopProducts = products.filter((p) => p.shopId === currentShop.id);
  const currentShopStaff = shopStaff.filter((s) => s.shopId === currentShop.id);
  const shopOrders = orders.filter((o) => o.items.some((i) => i.shopId === currentShop.id));

  const commissionRate = currentShop.commissionType === 'percentage' ? currentShop.commissionValue : 5.0;
  const totalCommissionPaid = (currentShop.totalSalesAmount * commissionRate) / 100;
  const netEarnings = currentShop.totalSalesAmount - totalCommissionPaid;

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;

    postProduct({
      shopId: currentShop.id,
      shopName: currentShop.name,
      title: newTitle,
      price: parseFloat(newPrice) || 50000,
      category: newCategory,
      condition: newCondition,
      stock: parseInt(newStock) || 1,
      description: newDescription || `${newTitle} backed by ${currentShop.name} verified warranty and quick delivery.`,
      imageUrl: newImageUrl,
      isFeatured: false,
      specs: {
        'Key Feature': specCpu,
        'Warranty': specWarranty
      }
    });

    setNewTitle('');
    setNewPrice('');
    setShowAddModal(false);
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail) return;

    addShopStaff(currentShop.id, {
      name: staffName,
      email: staffEmail,
      phone: staffPhone || '+234 800 000 0000',
      role: staffRole,
      status: 'active'
    });

    setStaffName('');
    setStaffEmail('');
    setStaffPhone('');
    setShowAddStaffModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Shop Verification & Brand Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-sm">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">{currentShop.name}</h2>
                {currentShop.isVerified ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Merchant Badge
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-900 text-xs font-bold rounded-md">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Pending Admin Verification
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Badge Number: <strong className="font-mono-numbers text-slate-700">{currentShop.verificationBadgeNumber}</strong> · 
                Location: {currentShop.city}, {currentShop.state} · Address: {currentShop.address}
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                Integrated Checkout: Buyers pay directly on the platform via automated gateway. Platform fee: <strong>{currentShop.commissionType === 'percentage' ? `${currentShop.commissionValue}%` : `₦${currentShop.commissionValue} flat`}</strong> on confirmed sales.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Financial KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span>Gross Online Sales</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 font-mono-numbers">
              ₦{currentShop.totalSalesAmount.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">{currentShop.totalSalesCount} online orders</span>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
            <div className="flex items-center justify-between text-amber-900 mb-1">
              <span>Platform Commission ({currentShop.commissionValue}%)</span>
              <DollarSign className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-bold text-amber-950 font-mono-numbers">
              ₦{Math.round(totalCommissionPaid).toLocaleString()}
            </div>
            <span className="text-[11px] text-amber-800 mt-0.5 block">Automated fee per sale</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
            <div className="flex items-center justify-between text-emerald-900 mb-1">
              <span>Disbursed Merchant Payout</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-emerald-950 font-mono-numbers">
              ₦{Math.round(netEarnings).toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-700 mt-0.5 block">Escrow released directly to shop</span>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar for Shop Owner */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
            activeTab === 'inventory' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Catalog ({shopProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
            activeTab === 'orders' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Online Customer Orders ({shopOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
            activeTab === 'staff' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Shop Team & Staff Sub-Roles ({currentShopStaff.length})</span>
        </button>
      </div>

      {/* Tab 1: Product Inventory */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Store Products Inventory</h3>
            <span className="text-xs text-slate-500">Products are fulfilled with verified badge warranty</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="pb-3 font-semibold">Product</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Price</th>
                  <th className="pb-3 font-semibold">Stock</th>
                  <th className="pb-3 font-semibold">Promotional Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shopProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={normalizeImageUrl(p.imageUrl, FALLBACK_PRODUCT_IMAGE)}
                          alt={p.title}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                          onError={(e) => handleImageError(e, FALLBACK_PRODUCT_IMAGE)}
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 line-clamp-1 max-w-xs sm:max-w-md">
                            {p.title}
                          </div>
                          <span className="text-[11px] text-slate-400">{p.condition}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-600">{p.category}</td>
                    <td className="py-3.5 font-bold font-mono-numbers text-slate-900">
                      ₦{p.price.toLocaleString()}
                    </td>
                    <td className="py-3.5">
                      <span className="font-mono-numbers font-medium text-slate-700">
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3.5">
                      {p.isFeatured ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded text-[11px]">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          Featured Product
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Standard Listing</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      {!p.isFeatured && (
                        <button
                          onClick={() =>
                            onOpenPaymentModal({
                              type: 'feature_product',
                              id: p.id,
                              title: p.title,
                              price: platformSettings.featureProductPriceNgn
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold border border-amber-200 rounded-md transition-colors"
                        >
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>Feature (₦{platformSettings.featureProductPriceNgn.toLocaleString()})</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Online Customer Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Customer Orders Paid on Website</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Payments made through the online gateway. Escrow is released to your merchant balance upon delivery.
              </p>
            </div>
          </div>

          {shopOrders.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
              No orders placed for this store yet. Customers can checkout directly using the shopping cart.
            </div>
          ) : (
            <div className="space-y-3">
              {shopOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono-numbers text-slate-900">{ord.id}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                        {ord.paymentStatus === 'payout_released' ? 'Payout Released' : 'Paid & In Escrow'}
                      </span>
                    </div>
                    <p className="text-slate-700">
                      Customer: <strong>{ord.buyerName}</strong> ({ord.buyerPhone}) · Deliver to: {ord.deliveryAddress}, {ord.city}
                    </p>
                    <div className="flex gap-4 text-[11px] text-slate-500 pt-1">
                      <span>Order Value: <strong className="font-mono-numbers text-slate-900">₦{ord.totalAmount.toLocaleString()}</strong></span>
                      <span>Platform Commission ({currentShop.commissionValue}%): <strong className="font-mono-numbers">₦{ord.platformCommission.toLocaleString()}</strong></span>
                      <span className="text-emerald-700 font-bold">Your Net Payout: <strong className="font-mono-numbers">₦{ord.merchantPayout.toLocaleString()}</strong></span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-semibold text-xs">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Ready for Dispatch</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Shop Staff Sub-Roles */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>Shop Team & Staff Sub-Roles</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Shop owners can appoint team members with specific sub-roles (Store Manager, Inventory Officer, Sales Cashier).
              </p>
            </div>

            <button
              onClick={() => setShowAddStaffModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Staff Sub-Role</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {currentShopStaff.map((staff) => (
              <div
                key={staff.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{staff.name}</h4>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-bold rounded capitalize">
                      {staff.role.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono-numbers">{staff.email}</p>
                  <p className="text-[11px] text-slate-500 font-mono-numbers">{staff.phone}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Joined: {staff.joinedAt}</span>
                  <button
                    onClick={() => removeShopStaff(staff.id)}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Add Product to Verified Store</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. AuraBook Pro 16 Ultrabook"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price in Naira (₦)</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="e.g. 1850000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500 font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500 font-mono-numbers"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500"
                  >
                    <option value="Electronics & Computers">Electronics & Computers</option>
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Solar & Renewable Power">Solar & Renewable Power</option>
                    <option value="Phones & Tablets">Phones & Tablets</option>
                    <option value="Home & Industrial Machinery">Home & Industrial Machinery</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Condition</label>
                  <select
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500"
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Open Box">Open Box</option>
                    <option value="Refurbished">Refurbished</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <MediaUpload
                  label="Product Photographs"
                  hint="Upload high-res product photo (auto-compressed on device, max 1200px)"
                  value={newImageUrl}
                  onChange={(val) => setNewImageUrl(typeof val === 'string' ? val : val[0] || '')}
                  aspectRatio="1:1"
                />
                <div>
                  <span className="text-[11px] font-medium text-slate-500 block mb-1">Or select a luxury catalog preset:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Laptop Studio', url: '/assets/images/product_tech_laptop_1793094444722.jpg' },
                      { label: 'African Couture', url: '/assets/images/product_couture_fashion_1793094443759.jpg' },
                      { label: 'Store Retail', url: '/assets/images/hero_marketplace_nigeria_1793094442016.jpg' }
                    ].map((img) => (
                      <button
                        type="button"
                        key={img.url}
                        onClick={() => setNewImageUrl(img.url)}
                        className={`p-1 rounded-lg border text-left overflow-hidden transition-all ${
                          newImageUrl === img.url ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/30' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img src={img.url} alt={img.label} className="w-full h-12 object-cover rounded" referrerPolicy="no-referrer" />
                        <span className="block text-[10px] text-slate-600 mt-1 truncate">{img.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe your product specs, warranty, and authentic features..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Publish Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Staff Member to Store</h3>
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Staff Member Name</label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="e.g. Femi Store Associate"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="e.g. femi@auratech.ng"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-numbers focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sub-Role Assignment</label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value as ShopStaffRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500"
                >
                  <option value="store_manager">Store Manager (Catalog & Operations)</option>
                  <option value="inventory_officer">Inventory Officer (Stock Tracking)</option>
                  <option value="sales_cashier">Sales Cashier / Order Dispatch</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Appoint Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
