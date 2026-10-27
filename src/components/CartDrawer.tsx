import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { X, ShoppingBag, Trash2, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Order } from '../types/marketplace';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, cartTotal, checkoutCart, platformSettings } = useMarketplace();
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  // Form
  const [name, setName] = useState('Chisom Eze');
  const [phone, setPhone] = useState('+234 810 555 7890');
  const [email, setEmail] = useState('chisom.eze@gmail.com');
  const [address, setAddress] = useState('14 Awolowo Way, Ikeja');
  const [city, setCity] = useState('Ikeja');
  const [state, setState] = useState('Lagos');

  if (!isOpen) return null;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const order = checkoutCart({
      name,
      phone,
      email,
      address,
      city,
      state
    });
    setLastOrder(order);
    setStep('success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              {step === 'cart' ? 'Shopping Cart' : step === 'checkout' ? 'Direct Merchant Checkout' : 'Order Confirmation'}
            </h3>
          </div>
          <button
            onClick={() => {
              setStep('cart');
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {step === 'success' && lastOrder ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Order Placed Successfully!</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Order ID: <strong className="font-mono-numbers">{lastOrder.id}</strong>
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Paid:</span>
                  <span className="font-bold text-slate-900 font-mono-numbers">
                    ₦{lastOrder.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Platform Commission ({platformSettings.commissionRatePercent}%):</span>
                  <span className="font-mono-numbers">₦{lastOrder.platformCommission.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Merchant Net Payout:</span>
                  <span className="font-mono-numbers font-semibold">₦{lastOrder.merchantPayout.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                  Delivery Address: {lastOrder.deliveryAddress}, {lastOrder.city}, {lastOrder.state}
                </div>
              </div>

              <button
                onClick={() => {
                  setStep('cart');
                  onClose();
                }}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : step === 'checkout' ? (
            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Store Purchase · Escrow Protected Delivery</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500 font-mono-numbers"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Delivery Address</label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500"
                  >
                    <option value="Lagos">Lagos</option>
                    <option value="Abuja (FCT)">Abuja (FCT)</option>
                    <option value="Rivers">Rivers</option>
                    <option value="Oyo">Oyo</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="flex justify-between font-bold text-sm text-slate-900">
                  <span>Grand Total:</span>
                  <span className="font-mono-numbers">₦{cartTotal.toLocaleString()}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    className="w-1/3 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-sm"
                  >
                    Confirm & Place Order
                  </button>
                </div>
              </div>
            </form>
          ) : cart.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <ShoppingBag className="w-10 h-10 mx-auto text-slate-300" />
              <p>Your shopping cart is empty.</p>
              <span className="text-[11px] text-slate-400 block">
                Add products from verified stores to enjoy buyer protection and direct checkout.
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl items-center"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.title}
                    className="w-14 h-14 rounded-lg object-cover bg-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 truncate">{item.product.title}</h4>
                    <p className="text-[11px] text-emerald-700 font-medium truncate">
                      {item.product.shopName}
                    </p>
                    <div className="text-xs font-bold text-slate-900 font-mono-numbers mt-0.5">
                      ₦{item.product.price.toLocaleString()} × {item.quantity}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'cart' && cart.length > 0 && (
          <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Subtotal ({cart.length} items):</span>
              <span className="text-lg font-bold text-slate-950 font-mono-numbers">
                ₦{cartTotal.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => setStep('checkout')}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-sm text-xs"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
