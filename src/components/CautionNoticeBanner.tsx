import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, Info } from 'lucide-react';

interface CautionNoticeBannerProps {
  variant?: 'compact' | 'full' | 'inline';
}

export const CautionNoticeBanner: React.FC<CautionNoticeBannerProps> = ({ variant = 'full' }) => {
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200/80 rounded text-[11px] font-medium text-amber-900">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span className="truncate">
          <strong>Caution:</strong> Unverified Classified Ad · Meet in person · No upfront transfer
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-semibold text-amber-950">Buyer Caution Notice</p>
          <p className="text-amber-800 text-[11px] mt-0.5">
            This is an individual classified advertisement. We are not liable for any loss of money or fraud. Never pay in advance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 bg-amber-50/95 border-2 border-amber-300 rounded-xl text-amber-950 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0">
          <ShieldAlert className="w-5 h-5 text-amber-700" />
        </div>
        <div className="space-y-2">
          <div>
            <h4 className="text-sm font-bold text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
              <span>⚠️ Buyer Caution & Platform Non-Liability Disclaimer</span>
            </h4>
            <p className="text-xs text-amber-900 mt-1 leading-relaxed font-medium">
              This listing is an <strong>independent classified advertisement</strong> posted by an individual. 
              <strong> NkemMarket is strictly NOT liable for any loss of money, fraud, counterfeit items, or failed commitments made via this person.</strong>
            </p>
          </div>

          <div className="pt-2 border-t border-amber-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-amber-900">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-600 font-bold">1.</span>
              <span>Never send money or delivery fees before seeing the item.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-600 font-bold">2.</span>
              <span>Always meet in secure, crowded public locations during daylight.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-600 font-bold">3.</span>
              <span>Physically inspect, power-on, and test before cash/transfer.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-600 font-bold">4.</span>
              <span>Prefer our <strong>Verified Stores</strong> for escrow & return coverage.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
