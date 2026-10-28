import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface CautionNoticeBannerProps {
  variant?: 'compact' | 'full' | 'inline';
}

export const CautionNoticeBanner: React.FC<CautionNoticeBannerProps> = ({ variant = 'full' }) => {
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-[11px] font-medium text-amber-900">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span className="truncate">
          <strong>Caution:</strong> Classified Advertisement · In-person inspection only · No advance transfers
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-semibold text-amber-950">ASKIA MARKET Safety Caution</p>
          <p className="text-amber-800 text-[11px] mt-0.5 font-light">
            This is an individual classified advertisement. ASKIA MARKET is not liable for loss of funds. Always inspect before payment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 bg-gradient-to-r from-amber-50 via-amber-50/80 to-amber-100/50 border border-amber-300 rounded-2xl text-amber-950 shadow-xs">
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0 border border-amber-200">
          <ShieldAlert className="w-5 h-5 text-amber-700" />
        </div>
        <div className="space-y-2.5 flex-1">
          <div>
            <h4 className="text-sm font-bold text-amber-950 uppercase tracking-wide flex items-center gap-1.5 font-sans">
              <span>⚠️ ASKIA MARKET · Classified Caution & Non-Liability Notice</span>
            </h4>
            <p className="text-xs text-amber-900 mt-1 leading-relaxed font-normal">
              This listing is an <strong>independent classified advertisement</strong> posted by an individual subscriber. 
              <strong> ASKIA MARKET is strictly NOT liable for any loss of money, fraud, counterfeit goods, or broken commitments made through classified advertisers.</strong>
            </p>
          </div>

          <div className="pt-2 border-t border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-amber-900 font-light">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-700 font-bold font-mono-numbers">01.</span>
              <span>Never send advance payments, commitment fees, or delivery deposits.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-700 font-bold font-mono-numbers">02.</span>
              <span>Arrange meetings only in daylight within busy, well-lit public facilities.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-700 font-bold font-mono-numbers">03.</span>
              <span>Test and power-on electronics or check vehicle documentation on-site.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-700 font-bold font-mono-numbers">04.</span>
              <span>Choose our <strong>Verified Stores</strong> for integrated escrow protection & return guarantees.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
