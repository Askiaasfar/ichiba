import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  Megaphone,
  CreditCard,
  Plus,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Trash2,
  ShieldAlert
} from 'lucide-react';
import { CautionNoticeBanner } from './CautionNoticeBanner';
import { MediaUpload } from './MediaUpload';

interface AdvertiserPortalProps {
  onOpenPaymentModal: (item: {
    type: 'ad_subscription' | 'feature_ad';
    id: string;
    title: string;
    price: number;
  }) => void;
}

export const AdvertiserPortal: React.FC<AdvertiserPortalProps> = ({ onOpenPaymentModal }) => {
  const {
    currentAdvertiserSubscription,
    advertisements,
    postAdvertisement,
    deleteAdvertisement,
    platformSettings,
    buyAdSubscription
  } = useMarketplace();

  const [showPostModal, setShowPostModal] = useState(false);
  const [cautionAcknowledged, setCautionAcknowledged] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [category, setCategory] = useState('Vehicles & Automotive');
  const [condition, setCondition] = useState<'Brand New' | 'Foreign Used / London Used' | 'Locally Used'>('Foreign Used / London Used');
  const [state, setState] = useState('Lagos');
  const [city, setCity] = useState('Ikeja');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('+234 803 881 2290');
  const [advertiserName, setAdvertiserName] = useState('Chinedu Okafor');
  const [imageUrl, setImageUrl] = useState('/src/assets/images/ad_toyota_vehicle_1793094444379.jpg');

  const myAds = advertisements.filter(
    (a) => a.advertiserId === 'adv-current-user' || a.advertiserName === 'Chinedu Okafor'
  );

  const remainingQuota = currentAdvertiserSubscription?.remainingAds ?? 0;
  const totalAllowed = currentAdvertiserSubscription?.totalAdsAllowed ?? 5;
  const hasCredits = remainingQuota > 0;

  const handlePostAd = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);

    if (!cautionAcknowledged) {
      setErrorNotice('You must acknowledge that your advertisement will display the mandatory Buyer Caution & Non-Liability notice.');
      return;
    }

    if (!title || !price) {
      setErrorNotice('Please fill in both the title and price.');
      return;
    }

    const res = postAdvertisement({
      advertiserName,
      advertiserPhone: phone,
      advertiserEmail: 'chinedu.advertiser@market.ng',
      title,
      description: description || `${title} in clean working condition. Inspect physically before payment.`,
      price: parseFloat(price) || 50000,
      isNegotiable,
      category,
      condition,
      state,
      city,
      imageUrl,
      isFeatured: false
    });

    if (!res.success) {
      setErrorNotice(res.error || 'Failed to post advertisement.');
      return;
    }

    // Reset form
    setTitle('');
    setPrice('');
    setDescription('');
    setShowPostModal(false);
    setCautionAcknowledged(false);
  };

  return (
    <div className="space-y-6">
      {/* Subscription & Quota Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-2xl shrink-0 shadow-sm">
              <Megaphone className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">Advertiser Account: {advertiserName}</h2>
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-xs font-bold rounded-md">
                  Classifieds Poster (Individual)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Individual sellers without a verified shop can post classified advertisements via subscription packages.
              </p>
              <div className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-amber-900 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  <strong>Note:</strong> All ads carry a mandatory Buyer Caution notice stating ASKIA MARKET is not liable for transactions.
                </span>
              </div>
            </div>
          </div>

          {/* Quick Subscription / Post Action */}
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              onClick={() =>
                onOpenPaymentModal({
                  type: 'ad_subscription',
                  id: 'sub-package-5',
                  title: `${platformSettings.adPackageCount} Classified Advertisements Subscription`,
                  price: platformSettings.adPackagePriceNgn
                })
              }
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              <CreditCard className="w-4 h-4" />
              <span>
                Buy 5 Ads Bundle (₦{platformSettings.adPackagePriceNgn.toLocaleString()})
              </span>
            </button>

            <button
              onClick={() => {
                if (!hasCredits) {
                  onOpenPaymentModal({
                    type: 'ad_subscription',
                    id: 'sub-package-5',
                    title: `${platformSettings.adPackageCount} Classified Advertisements Subscription`,
                    price: platformSettings.adPackagePriceNgn
                  });
                } else {
                  setShowPostModal(true);
                }
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Classified Ad</span>
            </button>
          </div>
        </div>

        {/* Quota Progress Strip */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700">
              Active Ad Bundle Subscription: <strong>₦{platformSettings.adPackagePriceNgn.toLocaleString()} for {platformSettings.adPackageCount} Ads</strong>
            </span>
            <span className="font-mono-numbers font-bold text-slate-900">
              {remainingQuota} of {totalAllowed} Ads Remaining
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${
                remainingQuota > 0 ? 'bg-amber-500' : 'bg-red-400'
              }`}
              style={{ width: `${Math.min(100, (remainingQuota / Math.max(1, totalAllowed)) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
            <span>
              {hasCredits
                ? `You have ${remainingQuota} available ad credits to publish.`
                : 'Your ad quota is exhausted. Purchase a bundle (₦1,000 for 5 ads) to publish more.'}
            </span>
            <span>Validity: 30 days active cycle</span>
          </div>
        </div>
      </div>

      {/* Mandatory Caution Preview */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Mandatory Buyer Notice Applied to Your Postings
        </h3>
        <CautionNoticeBanner variant="compact" />
      </div>

      {/* My Active Advertisements */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-amber-500" />
            <span>My Posted Advertisements ({myAds.length})</span>
          </h3>
          <span className="text-xs text-slate-500">Each ad consumes 1 subscription credit</span>
        </div>

        {myAds.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500 space-y-2">
            <p>You haven't posted any advertisements yet.</p>
            <button
              onClick={() => {
                if (!hasCredits) {
                  onOpenPaymentModal({
                    type: 'ad_subscription',
                    id: 'sub-package-5',
                    title: `${platformSettings.adPackageCount} Classified Advertisements Subscription`,
                    price: platformSettings.adPackagePriceNgn
                  });
                } else {
                  setShowPostModal(true);
                }
              }}
              className="px-3 py-1.5 bg-amber-500 text-slate-950 font-semibold rounded-lg hover:bg-amber-600 transition-colors"
            >
              Post Your First Ad Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myAds.map((ad) => (
              <div
                key={ad.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
              >
                <div className="flex gap-3">
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-20 h-20 rounded-lg object-cover bg-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {ad.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                      {ad.title}
                    </h4>
                    <div className="text-sm font-bold text-slate-950 font-mono-numbers">
                      ₦{ad.price.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Promotional & Danger Actions */}
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    {ad.isFeatured ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        Featured Ad (Active)
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          onOpenPaymentModal({
                            type: 'feature_ad',
                            id: ad.id,
                            title: ad.title,
                            price: platformSettings.featureAdPriceNgn
                          })
                        }
                        className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-md transition-colors text-xs"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Feature Ad (₦{platformSettings.featureAdPriceNgn.toLocaleString()})</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Delete this classified advertisement?')) {
                        deleteAdvertisement(ad.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                    title="Delete Ad"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post New Advertisement Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">Post Classified Advertisement</h3>
              </div>
              <button
                onClick={() => setShowPostModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {errorNotice && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                {errorNotice}
              </div>
            )}

            <form onSubmit={handlePostAd} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Advertisement Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Clean Silver Toyota Camry 2016 XLE Sedan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price in Naira (₦)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 9200000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-amber-500 font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Negotiability</label>
                  <select
                    value={isNegotiable ? 'yes' : 'no'}
                    onChange={(e) => setIsNegotiable(e.target.value === 'yes')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-amber-500"
                  >
                    <option value="yes">Price is Negotiable</option>
                    <option value="no">Fixed Price</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-amber-500"
                  >
                    <option value="Vehicles & Automotive">Vehicles & Automotive</option>
                    <option value="Electronics & Computers">Electronics & Computers</option>
                    <option value="Real Estate & Rentals">Real Estate & Rentals</option>
                    <option value="Home & Industrial Machinery">Home & Industrial Machinery</option>
                    <option value="Phones & Tablets">Phones & Tablets</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-amber-500"
                  >
                    <option value="Foreign Used / London Used">Foreign Used / London Used</option>
                    <option value="Locally Used">Locally Used</option>
                    <option value="Brand New">Brand New</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-amber-500"
                  >
                    <option value="Lagos">Lagos</option>
                    <option value="Abuja (FCT)">Abuja (FCT)</option>
                    <option value="Rivers">Rivers</option>
                    <option value="Oyo">Oyo</option>
                    <option value="Kano">Kano</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City / Neighborhood</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Ikeja / Lekki"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <MediaUpload
                  label="Classified Advertisement Photos"
                  hint="Upload high-res item photo (auto-compressed on device, max 1200px)"
                  value={imageUrl}
                  onChange={(val) => setImageUrl(typeof val === 'string' ? val : val[0] || '')}
                  aspectRatio="16:9"
                />
                <div>
                  <span className="text-[11px] font-medium text-slate-500 block mb-1">Or select a standard classified preset:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Toyota Sedan Car', url: '/src/assets/images/ad_toyota_vehicle_1793094444379.jpg' },
                      { label: 'Electronics Gadget', url: '/src/assets/images/product_tech_laptop_1793094444722.jpg' },
                      { label: 'Equipment / Property', url: '/src/assets/images/hero_marketplace_nigeria_1793094442016.jpg' }
                    ].map((img) => (
                      <button
                        type="button"
                        key={img.url}
                        onClick={() => setImageUrl(img.url)}
                        className={`p-1 rounded-lg border text-left overflow-hidden transition-all ${
                          imageUrl === img.url ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/30' : 'border-slate-200 hover:border-slate-300'
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
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your item honestly. State physical meeting location and inspection instructions."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-amber-500"
                />
              </div>

              {/* MANDATORY DISCLAIMER ACKNOWLEDGEMENT */}
              <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-2">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="cautionAck"
                    checked={cautionAcknowledged}
                    onChange={(e) => setCautionAcknowledged(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-amber-400 mt-0.5"
                  />
                  <label htmlFor="cautionAck" className="text-xs text-amber-950 font-medium leading-relaxed">
                    <strong>Mandatory Advertiser Agreement:</strong> I acknowledge that because I do not operate a CAC-verified merchant store, my listing is an <em>individual classified advertisement</em> and will prominently display the platform caution banner informing buyers that <strong>ASKIA MARKET accepts no liability for transactions or money loss</strong> made with me.
                  </label>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-slate-500">
                  Will consume <strong>1 of {remainingQuota}</strong> remaining ad credits.
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!cautionAcknowledged}
                    className={`px-4 py-2 font-semibold rounded-lg shadow-sm text-slate-950 ${
                      cautionAcknowledged
                        ? 'bg-amber-500 hover:bg-amber-600 cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Publish Advertisement
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
