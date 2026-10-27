import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  ShieldCheck,
  Megaphone,
  AlertTriangle,
  Sparkles,
  FileCheck,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { CautionNoticeBanner } from './CautionNoticeBanner';

export const RulesAndSafetyTab: React.FC = () => {
  const { submitShopVerification, platformSettings } = useMarketplace();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Verification form
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [cacNumber, setCacNumber] = useState('');
  const [idType, setIdType] = useState<'National ID (NIN)' | 'International Passport' | "Voter's Card">('National ID (NIN)');
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    submitShopVerification({
      shopName,
      ownerName,
      businessRegNumber: cacNumber,
      idType,
      idNumber,
      phone,
      email,
      address
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowApplyModal(false);
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      {/* Intro Hero */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Platform Architecture & Safety Standards
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          NkemMarket maintains strict operational standards to protect buyers and provide transparent monetization for both established merchants and casual advertisers.
        </p>
      </div>

      {/* Two Models Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model 1: Verified Shop Owners */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">1. Verified Shop Owners</h3>
                <span className="text-xs text-emerald-700 font-semibold">Storefronts & Catalog Products</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Mandatory Verification:</strong> Every shop owner must hold an officially approved <strong>Verified Merchant Badge (#NG-VER-XXXX)</strong> with verified CAC business registration and identity.
                </span>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Monetization Model:</strong> Pay per sale via automated commission (e.g. <strong>{platformSettings.commissionRatePercent}% percentage</strong> or <strong>₦{platformSettings.flatFeePerSaleNgn} flat fee</strong>) or merchant subscription. Zero upfront ad limits.
                </span>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Full E-Commerce Capabilities:</strong> Dedicated store URL, inventory catalog management, direct cart checkout, and verified merchant return guarantee.
                </span>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Paid Product Featuring:</strong> Verified sellers can spotlight any product at the top of category feeds for ₦{platformSettings.featureProductPriceNgn.toLocaleString()} / 7 days.
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowApplyModal(true)}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
          >
            Apply for Verified Shop Badge
          </button>
        </div>

        {/* Model 2: Casual Advertisers */}
        <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">2. Classified Advertisers</h3>
                <span className="text-xs text-amber-700 font-semibold">Individual Postings & Listings</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>For Non-Shop Owners:</strong> Individuals without a verified commercial storefront are strictly restricted to posting classified advertisements.
                </span>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Subscription Bundle Only:</strong> Advertisers pay <strong>₦{platformSettings.adPackagePriceNgn.toLocaleString()} for a bundle of {platformSettings.adPackageCount} advertisements</strong>.
                </span>
              </div>

              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Mandatory Buyer Caution Notice:</strong> Every advertisement prominently displays our legal disclaimer: <em>We are strictly NOT liable for any loss of money made via this person.</em>
                </span>
              </div>

              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Paid Ad Featuring:</strong> Advertisers can boost classified reach with a 7-day featured spotlight badge for ₦{platformSettings.featureAdPriceNgn.toLocaleString()}.
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
            💡 <strong>Want to sell as a verified merchant instead?</strong> Submit your business documents to upgrade to a full verified shop.
          </div>
        </div>
      </div>

      {/* Mandatory Caution Notice Emphasis Showcase */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">
          The Mandatory Buyer Caution Standard for Advertisements
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Because individual advertisers are not verified corporate entities, our platform enforces transparency by showing the following caution banner on all classified ads across the marketplace:
        </p>
        <CautionNoticeBanner variant="full" />
      </div>

      {/* Verification Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Shop Verification Application</h3>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900">Application Submitted!</h4>
                <p className="text-xs text-slate-600">
                  Platform administrators will verify your CAC registration and issue your Verified Merchant Badge.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4 mt-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Business / Shop Name</label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Alaba Digital Sound Solutions"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Owner Full Name</label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. Adeola Balogun"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">CAC Reg Number</label>
                    <input
                      type="text"
                      required
                      value={cacNumber}
                      onChange={(e) => setCacNumber(e.target.value)}
                      placeholder="RC-129481"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-numbers focus:outline-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ID Type</label>
                    <select
                      value={idType}
                      onChange={(e) => setIdType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500"
                    >
                      <option value="National ID (NIN)">National ID (NIN)</option>
                      <option value="International Passport">International Passport</option>
                      <option value="Voter's Card">Voter's Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ID Number</label>
                    <input
                      type="text"
                      required
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="NIN or Passport Number"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-numbers focus:outline-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-numbers focus:outline-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="shop@domain.ng"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Physical Store Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Shop 4B, Electronic Market, Lagos"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
                  >
                    Submit for Verification
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
