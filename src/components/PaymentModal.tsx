import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { X, CreditCard, ShieldCheck, CheckCircle2, Building, Smartphone, Loader2 } from 'lucide-react';

interface PaymentModalProps {
  item: {
    type: 'ad_subscription' | 'feature_product' | 'feature_ad';
    id: string;
    title: string;
    price: number;
  } | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  item,
  onClose,
  onSuccess
}) => {
  const { buyAdSubscription, featureProduct, featureAdvertisement } = useMarketplace();
  const [payMethod, setPayMethod] = useState<'card' | 'transfer' | 'ussd'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [reference, setReference] = useState('');

  // Card fields
  const [cardNumber, setCardNumber] = useState('5399 4100 8821 9034');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvv, setCardCvv] = useState('712');

  if (!item) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const ref = `REF-PAY-${Math.floor(100000 + Math.random() * 900000)}`;
    setReference(ref);

    setTimeout(() => {
      if (item.type === 'ad_subscription') {
        buyAdSubscription();
      } else if (item.type === 'feature_product') {
        featureProduct(item.id);
      } else if (item.type === 'feature_ad') {
        featureAdvertisement(item.id);
      }

      setIsProcessing(false);
      setIsDone(true);

      if (onSuccess) {
        onSuccess();
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              ₦
            </div>
            <span className="text-sm font-bold text-slate-900">Secure Payment Checkout</span>
          </div>
          {!isProcessing && !isDone && (
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {isDone ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Payment Successful!</h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                {item.type === 'ad_subscription'
                  ? 'Your 5-Advertisement Subscription bundle has been activated. You can now post classified ads!'
                  : 'Your listing has been upgraded to Featured status with top homepage and category spotlight!'}
              </p>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 font-mono-numbers text-[11px]">
                Ref: {reference} · Amount Paid: ₦{item.price.toLocaleString()}
              </div>
              <button
                onClick={onClose}
                className="mt-4 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors shadow-sm"
              >
                Continue to Platform
              </button>
            </div>
          ) : (
            <>
              {/* Order summary */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Transaction Item
                </span>
                <div className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</div>
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Amount Due:</span>
                  <span className="text-base font-bold text-emerald-700 font-mono-numbers">
                    ₦{item.price.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPayMethod('card')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    payMethod === 'card'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1 text-slate-700" />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPayMethod('transfer')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    payMethod === 'transfer'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-4 h-4 mx-auto mb-1 text-slate-700" />
                  <span>Transfer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPayMethod('ussd')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    payMethod === 'ussd'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4 mx-auto mb-1 text-slate-700" />
                  <span>USSD</span>
                </button>
              </div>

              <form onSubmit={handlePay} className="space-y-3">
                {payMethod === 'card' && (
                  <>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Card Number (Mastercard / Visa / Verve)
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-numbers focus:outline-emerald-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Expiry</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-numbers focus:outline-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-numbers focus:outline-emerald-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {payMethod === 'transfer' && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-[11px] text-slate-500 block">Bank Account Details</span>
                    <p className="font-bold text-slate-900 text-sm">Zenith Bank PLC</p>
                    <p className="font-mono-numbers font-semibold text-slate-800 text-xs">
                      1018992410 (NkemMarket Automated Escrow)
                    </p>
                    <span className="text-[10px] text-slate-400 block">
                      Transfer will be verified automatically upon click.
                    </span>
                  </div>
                )}

                {payMethod === 'ussd' && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[11px] text-slate-500 block">Dial USSD String:</span>
                    <p className="font-bold font-mono-numbers text-slate-900 text-sm">
                      *737*000*8924#
                    </p>
                    <span className="text-[10px] text-slate-400 block">
                      GTBank / Access / Zenith USSD quick checkout.
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>256-Bit SSL Encrypted Payment Gateway</span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authorizing ₦{item.price.toLocaleString()}...</span>
                    </>
                  ) : (
                    <span>Pay ₦{item.price.toLocaleString()}</span>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
