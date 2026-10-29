import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { X, Briefcase, CheckCircle2, ShieldCheck, User, Mail, Phone, FileText } from 'lucide-react';

interface StaffApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StaffApplicationModal: React.FC<StaffApplicationModalProps> = ({
  isOpen,
  onClose
}) => {
  const { submitStaffApplication } = useMarketplace();

  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [department, setDepartment] = useState('Trust & Safety');
  const [desiredPosition, setDesiredPosition] = useState('KYC & Verification Associate');
  const [experienceSummary, setExperienceSummary] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const positionsByDept: Record<string, string[]> = {
    'Trust & Safety': [
      'KYC & Verification Associate',
      'Merchant Compliance Inspector',
      'Fraud Prevention Specialist'
    ],
    'Operations & Strategy': [
      'Operations Associate (Reporting to COO Al\'amin)',
      'Escalations & Resolution Officer',
      'Merchant Success Partner'
    ],
    'Treasury & Accounts': [
      'Escrow Reconciliation Specialist',
      'Settlements & Payout Analyst'
    ],
    'Growth & Merchant Acquisition': [
      'Growth & Content Moderator',
      'Classified Ads Quality Inspector'
    ]
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantEmail || !applicantPhone || !experienceSummary) return;

    setIsSubmitting(true);
    try {
      submitStaffApplication({
        applicantName,
        applicantEmail,
        applicantPhone,
        department,
        desiredPosition,
        experienceSummary
      });

      // Also submit to backend
      await fetch('/api/staff/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantName,
          applicantEmail,
          applicantPhone,
          department,
          desiredPosition,
          experienceSummary
        })
      }).catch(() => {});

      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-black text-white px-6 py-4 border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-black border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center font-bold font-serif-brand">
              A
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-serif-brand tracking-wide">
                Staff Onboarding Application
              </h3>
              <p className="text-[11px] text-[#D4AF37]">
                Executive Review by Founder Sensei Askia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-slate-900 font-serif-brand">
                Application Received
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                Thank you, <span className="font-semibold text-slate-900">{applicantName}</span>. Your application for <span className="font-semibold text-[#917112]">{desiredPosition}</span> has been placed in the Founder's Executive Queue in the Super Admin Command Dashboard.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-black hover:bg-slate-900 text-[#D4AF37] font-bold text-xs rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 p-3 rounded-xl text-slate-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-black">
                <Briefcase className="w-4 h-4 text-[#D4AF37]" />
                <span>Join the Askia Market Operating Team</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Staff accounts possess departmental dashboard access for seller verification, operations oversight, or escrow resolution. Applications require founder authorization.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g. Zainab Danjuma"
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    placeholder="e.g. applicant@domain.ng"
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-[#D4AF37]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-[#D4AF37]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => {
                    const nextDept = e.target.value;
                    setDepartment(nextDept);
                    setDesiredPosition(positionsByDept[nextDept]?.[0] || 'Associate');
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-[#D4AF37] bg-white"
                >
                  <option value="Trust & Safety">Trust & Safety</option>
                  <option value="Operations & Strategy">Operations & Strategy</option>
                  <option value="Treasury & Accounts">Treasury & Accounts</option>
                  <option value="Growth & Merchant Acquisition">Growth & Merchant Acquisition</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Desired Position</label>
                <select
                  value={desiredPosition}
                  onChange={(e) => setDesiredPosition(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-[#D4AF37] bg-white"
                >
                  {(positionsByDept[department] || []).map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Background & Relevant Qualifications
              </label>
              <textarea
                required
                rows={3}
                value={experienceSummary}
                onChange={(e) => setExperienceSummary(e.target.value)}
                placeholder="Detail past operations, fintech, marketplace, or fraud prevention experience..."
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:outline-[#D4AF37]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-black hover:bg-slate-900 text-[#D4AF37] font-bold rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
