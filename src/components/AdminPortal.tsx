import React, { useState, useMemo } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  AdminRole,
  AdminStaffMember,
  StaffApplicationRequest,
  StaffCompensationRecord,
  AccountTypeConfig,
  AccountType
} from '../types/marketplace';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Settings,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  TrendingUp,
  DollarSign,
  Megaphone,
  Sparkles,
  Users,
  Store,
  Layers,
  Save,
  Check,
  Clock,
  AlertTriangle,
  UserPlus,
  Trash2,
  CreditCard,
  Building,
  Eye,
  BarChart2,
  PieChart as PieChartIcon,
  Lock,
  Wallet,
  Briefcase,
  FileCheck,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const {
    currentUser,
    verificationRequests,
    approveShopVerification,
    rejectShopVerification,
    advertisements,
    approveAdvertisement,
    rejectAdvertisement,
    transactions,
    approveTransactionPayment,
    rejectTransactionPayment,
    orders,
    approveMerchantOrderPayout,
    platformSettings,
    updatePlatformSettings,
    shops,
    products,
    adminStaff,
    addAdminStaff,
    removeAdminStaff,
    staffApplications,
    approveStaffApplication,
    rejectStaffApplication,
    staffCompensation,
    updateStaffCompensation,
    processStaffPayout,
    accountTypes,
    updateAccountTypeConfig,
    logout
  } = useMarketplace();

  // Active admin sub-tab
  const [activeAdminTab, setActiveAdminTab] = useState<
    'overview' | 'sellers' | 'ads' | 'payments' | 'roles' | 'payroll' | 'account_types' | 'settings'
  >('overview');

  // Staff creation form (Workflow A: Founder Invitation)
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffJobTitle, setNewStaffJobTitle] = useState('');
  const [newStaffDepartment, setNewStaffDepartment] = useState('Operations & Strategy');
  const [newStaffRole, setNewStaffRole] = useState<AdminRole>('verification_officer');

  // Staff Application Review Modal (Workflow B)
  const [reviewingApp, setReviewingApp] = useState<StaffApplicationRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [assignedRoleForApp, setAssignedRoleForApp] = useState<AdminRole>('verification_officer');
  const [assignedTitleForApp, setAssignedTitleForApp] = useState('');
  const [assignedDeptForApp, setAssignedDeptForApp] = useState('Operations & Strategy');
  const [rejectionReasonText, setRejectionReasonText] = useState('');

  // Staff Compensation Payout Modal
  const [payoutModalRecord, setPayoutModalRecord] = useState<StaffCompensationRecord | null>(null);
  const [payoutAmountNgn, setPayoutAmountNgn] = useState<string>('');
  const [payoutReference, setPayoutReference] = useState<string>('');
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState<string | null>(null);

  // Settings form state
  const [commRate, setCommRate] = useState(platformSettings.commissionRatePercent.toString());
  const [flatFee, setFlatFee] = useState(platformSettings.flatFeePerSaleNgn.toString());
  const [commModel, setCommModel] = useState<'percentage' | 'flat_fee'>(platformSettings.activeCommissionModel);
  const [adPackPrice, setAdPackPrice] = useState(platformSettings.adPackagePriceNgn.toString());
  const [featProdPrice, setFeatProdPrice] = useState(platformSettings.featureProductPriceNgn.toString());
  const [featAdPrice, setFeatAdPrice] = useState(platformSettings.featureAdPriceNgn.toString());
  const [requireAdApproval, setRequireAdApproval] = useState(platformSettings.requireAdApproval);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Financial aggregates
  const adSubRevenue = transactions
    .filter((t) => t.type === 'ad_subscription' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amountNgn, 0);

  const commRevenue = transactions
    .filter((t) => t.type === 'product_sale_commission' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amountNgn, 0);

  const featRevenue = transactions
    .filter((t) => (t.type === 'feature_product' || t.type === 'feature_ad') && t.status === 'approved')
    .reduce((sum, t) => sum + t.amountNgn, 0);

  const totalPlatformGross = adSubRevenue + commRevenue + featRevenue;

  // Queues
  const pendingSellers = verificationRequests.filter((r) => r.status === 'pending');
  const pendingAds = advertisements.filter((a) => a.status === 'pending_review');
  const pendingPayments = transactions.filter((t) => t.status === 'pending_approval');
  const pendingOrdersEscrow = orders.filter((o) => o.paymentStatus === 'paid_escrow');

  // Chart 1: Sales Volume Over Time Data (Simulated baseline + live accumulated orders)
  const salesOverTimeData = useMemo(() => {
    const liveOrderSum = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const liveCommSum = orders.reduce((sum, o) => sum + o.platformCommission, 0);
    const livePayoutSum = orders.reduce((sum, o) => sum + o.merchantPayout, 0);

    return [
      {
        date: '21 Oct',
        grossSales: 1450000,
        merchantPayout: 1377500,
        commission: 72500,
        adSubFees: 5000
      },
      {
        date: '22 Oct',
        grossSales: 2200000,
        merchantPayout: 2090000,
        commission: 110000,
        adSubFees: 6000
      },
      {
        date: '23 Oct',
        grossSales: 980000,
        merchantPayout: 931000,
        commission: 49000,
        adSubFees: 4000
      },
      {
        date: '24 Oct',
        grossSales: 3400000,
        merchantPayout: 3230000,
        commission: 170000,
        adSubFees: 8000
      },
      {
        date: '25 Oct',
        grossSales: 1850000,
        merchantPayout: 1757500,
        commission: 92500,
        adSubFees: 7000
      },
      {
        date: '26 Oct',
        grossSales: 2950000,
        merchantPayout: 2802500,
        commission: 147500,
        adSubFees: 9000
      },
      {
        date: '27 Oct (Today)',
        grossSales: 3850000 + liveOrderSum,
        merchantPayout: 3657500 + livePayoutSum,
        commission: 192500 + liveCommSum,
        adSubFees: 12000
      }
    ];
  }, [orders]);

  // Chart 2: Active vs. Pending Listings Breakdown
  const listingsBreakdown = useMemo(() => {
    const activeProducts = products.length;
    const activeAds = advertisements.filter((a) => a.status === 'active').length;
    const pendingReviewAds = advertisements.filter((a) => a.status === 'pending_review').length;
    const flaggedAds = advertisements.filter((a) => a.status === 'flagged' || a.status === 'rejected').length;
    const verifiedShops = shops.filter((s) => s.isVerified).length;
    const pendingShops = verificationRequests.filter((r) => r.status === 'pending').length;

    const barData = [
      {
        category: 'Store Products',
        Active: activeProducts,
        Pending: 0,
        Flagged: 0
      },
      {
        category: 'Classified Ads',
        Active: activeAds,
        Pending: pendingReviewAds,
        Flagged: flaggedAds
      },
      {
        category: 'Merchant Stores',
        Active: verifiedShops,
        Pending: pendingShops,
        Flagged: 0
      }
    ];

    const totalActive = activeProducts + activeAds + verifiedShops;
    const totalPending = pendingReviewAds + pendingShops;
    const totalFlagged = flaggedAds;

    const donutData = [
      { name: 'Active & Verified', value: totalActive, color: '#10B981' },
      { name: 'Pending Admin Review', value: totalPending, color: '#F59E0B' },
      { name: 'Flagged / Moderation', value: totalFlagged || 1, color: '#EF4444' }
    ];

    return {
      barData,
      donutData,
      totalActive,
      totalPending,
      totalFlagged
    };
  }, [products, advertisements, shops, verificationRequests]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlatformSettings({
      commissionRatePercent: parseFloat(commRate) || 5.0,
      flatFeePerSaleNgn: parseFloat(flatFee) || 250,
      activeCommissionModel: commModel,
      adPackagePriceNgn: parseFloat(adPackPrice) || 1000,
      featureProductPriceNgn: parseFloat(featProdPrice) || 1500,
      featureAdPriceNgn: parseFloat(featAdPrice) || 800,
      requireAdApproval
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail) return;

    const permissionsMap: Record<AdminRole, string[]> = {
      super_admin: ['all_permissions', 'manage_admins', 'approve_shops', 'approve_ads', 'approve_payments', 'platform_settings', 'system_security'],
      coo: ['operations_oversight', 'approve_shops', 'approve_ads', 'escalations', 'audit_sellers', 'view_reports'],
      finance_admin: ['approve_payments', 'release_payouts', 'reconcile_escrow', 'refund_orders', 'view_financial_analytics'],
      growth_manager: ['approve_ads', 'flag_content', 'campaign_management', 'analytics', 'feature_promotions'],
      verification_officer: ['approve_shops', 'reject_shops', 'verify_cac', 'audit_sellers', 'kyc_document_review'],
      moderation_admin: ['approve_ads', 'reject_ads', 'flag_content', 'ban_advertisers'],
      custom: ['operations_oversight', 'view_reports']
    };

    addAdminStaff({
      name: newStaffName,
      email: newStaffEmail,
      role: newStaffRole,
      jobTitle: newStaffJobTitle || (newStaffRole === 'coo' ? 'Chief Operating Officer' : newStaffRole === 'finance_admin' ? 'Finance Administrator' : 'Staff Officer'),
      department: newStaffDepartment || 'Operations & Strategy',
      assignedBy: currentUser.name || 'Sensei Askia (Founder)',
      permissions: permissionsMap[newStaffRole],
      status: 'active'
    });

    setNewStaffName('');
    setNewStaffEmail('');
    setNewStaffJobTitle('');
    setShowAddStaffModal(false);
  };

  const handleReviewAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingApp) return;

    if (reviewAction === 'approve') {
      const permissionsMap: Record<AdminRole, string[]> = {
        super_admin: ['all_permissions', 'manage_admins', 'approve_shops', 'approve_ads', 'approve_payments', 'platform_settings', 'system_security'],
        coo: ['operations_oversight', 'approve_shops', 'approve_ads', 'escalations', 'audit_sellers', 'view_reports'],
        finance_admin: ['approve_payments', 'release_payouts', 'reconcile_escrow', 'refund_orders', 'view_financial_analytics'],
        growth_manager: ['approve_ads', 'flag_content', 'campaign_management', 'analytics', 'feature_promotions'],
        verification_officer: ['approve_shops', 'reject_shops', 'verify_cac', 'audit_sellers', 'kyc_document_review'],
        moderation_admin: ['approve_ads', 'reject_ads', 'flag_content', 'ban_advertisers'],
        custom: ['operations_oversight']
      };

      approveStaffApplication(
        reviewingApp.id,
        assignedRoleForApp,
        assignedTitleForApp || reviewingApp.desiredPosition,
        assignedDeptForApp || reviewingApp.department,
        permissionsMap[assignedRoleForApp] || ['operations_oversight'],
        currentUser.name || 'Sensei Askia (Founder)'
      );
    } else {
      rejectStaffApplication(
        reviewingApp.id,
        rejectionReasonText || 'Application does not align with current departmental staffing priorities.',
        currentUser.name || 'Sensei Askia (Founder)'
      );
    }

    setReviewingApp(null);
    setRejectionReasonText('');
  };

  const handleProcessPayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutModalRecord) return;
    const amount = parseFloat(payoutAmountNgn) || payoutModalRecord.salaryNgn;
    const ref = payoutReference.trim() || `SAL-${payoutModalRecord.staffName.toUpperCase().replace(/[^A-Z]/g, '')}-${Date.now().toString().slice(-4)}`;

    processStaffPayout(
      payoutModalRecord.id,
      amount,
      ref,
      currentUser.name || 'Sensei Askia (Founder)'
    );

    setPayoutSuccessMsg(`Disbursement of ₦${amount.toLocaleString()} recorded for ${payoutModalRecord.staffName}. Reference: ${ref}`);
    setTimeout(() => {
      setPayoutSuccessMsg(null);
      setPayoutModalRecord(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Platform Banner Header */}
      <div className="bg-[#0A0A0A] text-white rounded-3xl p-7 shadow-xl border border-[#262626] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-8 h-8 rounded-lg bg-black border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center font-bold text-sm shadow-sm font-serif-brand">
                A
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 font-bold text-[10px] tracking-widest uppercase">
                {currentUser.adminRole ? currentUser.adminRole.replace('_', ' ').toUpperCase() : 'SUPER ADMIN PRIVILEGES'}
              </span>
              <h2 className="text-xl font-serif-brand font-bold tracking-wide">
                ASKIA MARKET <span className="text-[#D4AF37] font-sans font-normal text-sm">· Executive Command</span>
              </h2>
            </div>
            <p className="text-[11px] text-[#D4AF37] font-medium tracking-wider uppercase font-sans">
              Your World. Your Market.
            </p>
            <p className="text-xs text-slate-400 font-light">
              Authenticated Administrator: <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.email}). Manage verified merchant storefronts, moderate classified listings, release escrow payouts, and govern administrative staff.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Google OAuth · Verified Super Admin</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Authorized Founder: <strong className="text-[#D4AF37] font-mono">askiasventures@gmail.com</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddStaffModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Admin Role</span>
            </button>

            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-red-950/80 border border-slate-700 hover:border-red-600/60 text-slate-300 hover:text-red-200 rounded-xl text-xs font-semibold transition-colors shadow-xs"
              title="Lock Admin Dashboard and log out"
            >
              <Lock className="w-3.5 h-3.5 text-red-400" />
              <span>Lock Admin Dashboard</span>
            </button>
          </div>
        </div>

        {/* 4 Quick Stat Metric Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-slate-400 block text-[11px]">Total Platform Revenue</span>
            <div className="text-lg sm:text-xl font-bold text-white font-mono-numbers mt-0.5">
              ₦{totalPlatformGross.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-400 mt-0.5 block">Commissions + Subscriptions</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-slate-400 block text-[11px]">Pending Seller Reviews</span>
            <div className="text-lg sm:text-xl font-bold text-emerald-300 font-mono-numbers mt-0.5">
              {pendingSellers.length} Requests
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">{shops.filter((s) => s.isVerified).length} verified stores active</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-slate-400 block text-[11px]">Pending Ad Approvals</span>
            <div className="text-lg sm:text-xl font-bold text-amber-300 font-mono-numbers mt-0.5">
              {pendingAds.length} Classifieds
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Needs moderation check</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-slate-400 block text-[11px]">Pending Payment Approvals</span>
            <div className="text-lg sm:text-xl font-bold text-indigo-300 font-mono-numbers mt-0.5">
              {pendingPayments.length + pendingOrdersEscrow.length} Approvals
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Escrow disbursements & orders</span>
          </div>
        </div>
      </div>

      {/* Admin Module Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 overflow-x-auto text-xs font-semibold shadow-xs">
        <button
          onClick={() => setActiveAdminTab('overview')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeAdminTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('sellers')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeAdminTab === 'sellers'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-emerald-900 hover:bg-emerald-50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Approve Verified Sellers ({pendingSellers.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('ads')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeAdminTab === 'ads'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-amber-900 hover:bg-amber-50'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>Approve Classified Ads ({pendingAds.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('payments')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeAdminTab === 'payments'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-indigo-900 hover:bg-indigo-50'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Approve Payments & Payouts ({pendingPayments.length + pendingOrdersEscrow.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('roles')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeAdminTab === 'roles'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Staff Leadership & Applications ({staffApplications.filter((a) => a.status === 'pending').length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('payroll')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeAdminTab === 'payroll'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-emerald-900 hover:bg-emerald-50'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Staff Payroll & Compensation</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('account_types')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeAdminTab === 'account_types'
              ? 'bg-[#0A0A0A] text-[#D4AF37] border border-[#D4AF37]/50 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Account Types & Policies</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('settings')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeAdminTab === 'settings'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Platform Settings</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quick Action Card 1: Sellers */}
            <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Seller Verifications</span>
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-600">
                  {pendingSellers.length} merchant applications awaiting CAC document review.
                </p>
              </div>
              <button
                onClick={() => setActiveAdminTab('sellers')}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold rounded-lg transition-colors"
              >
                Review Applications ({pendingSellers.length})
              </button>
            </div>

            {/* Quick Action Card 2: Ads */}
            <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Classified Ads Moderation</span>
                  <Megaphone className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-xs text-slate-600">
                  {pendingAds.length} individual advertisements awaiting safety caution approval.
                </p>
              </div>
              <button
                onClick={() => setActiveAdminTab('ads')}
                className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold rounded-lg transition-colors"
              >
                Moderate Ads ({pendingAds.length})
              </button>
            </div>

            {/* Quick Action Card 3: Payments */}
            <div className="bg-white rounded-2xl border border-indigo-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Escrow & Payout Approvals</span>
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-xs text-slate-600">
                  {pendingPayments.length + pendingOrdersEscrow.length} transactions pending finance authorization.
                </p>
              </div>
              <button
                onClick={() => setActiveAdminTab('payments')}
                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-semibold rounded-lg transition-colors"
              >
                Approve Disbursements
              </button>
            </div>
          </div>

          {/* Chart 1: Sales Volume Over Time */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span>Sales Volume Over Time (Gross Sales & Merchant Payouts)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audited platform transaction throughput in Nigerian Naira (₦), tracking buyer online checkouts and net merchant disbursements.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono-numbers">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span className="text-slate-600 font-medium">Gross Sales Volume</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className="text-slate-600 font-medium">Merchant Payout</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-600 font-medium">Platform Fee</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesOverTimeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorPayout" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    tickFormatter={(val) => `₦${(val / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      `₦${Number(value).toLocaleString()}`,
                      name === 'grossSales'
                        ? 'Gross Sales'
                        : name === 'merchantPayout'
                        ? 'Merchant Escrow Payout'
                        : name === 'commission'
                        ? 'Platform Commission'
                        : name
                    ]}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '0.75rem',
                      color: '#FFFFFF',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="grossSales"
                    name="Gross Sales"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorGross)"
                  />
                  <Area
                    type="monotone"
                    dataKey="merchantPayout"
                    name="Merchant Payout"
                    stroke="#6366F1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPayout)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[11px]">7-Day Peak Volume</span>
                <span className="font-bold text-slate-900 font-mono-numbers mt-0.5 block">
                  ₦{Math.max(...salesOverTimeData.map((d) => d.grossSales)).toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-emerald-50/70 rounded-xl">
                <span className="text-emerald-700 block text-[11px]">Avg Daily Volume</span>
                <span className="font-bold text-emerald-950 font-mono-numbers mt-0.5 block">
                  ₦{Math.round(salesOverTimeData.reduce((acc, d) => acc + d.grossSales, 0) / salesOverTimeData.length).toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-indigo-50/70 rounded-xl">
                <span className="text-indigo-700 block text-[11px]">Escrow Payout Rate</span>
                <span className="font-bold text-indigo-950 font-mono-numbers mt-0.5 block">
                  95.0% Payout Ratio
                </span>
              </div>
              <div className="p-3 bg-amber-50/70 rounded-xl">
                <span className="text-amber-700 block text-[11px]">Platform Commission Retained</span>
                <span className="font-bold text-amber-950 font-mono-numbers mt-0.5 block">
                  5.0% Guaranteed Split
                </span>
              </div>
            </div>
          </div>

          {/* Chart 2: Active vs. Pending Listings Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-indigo-600" />
                  <span>Active vs. Pending Listings Breakdown</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comparative distribution of live approved inventory versus items in the Admin moderation and verification queues.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono-numbers">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600">Active Live</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-600">Pending Review</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="text-slate-600">Flagged</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
              {/* Categorical Bar Chart (7 Cols) */}
              <div className="lg:col-span-7 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={listingsBreakdown.barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748B', fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      formatter={(value: any, name: any) => [`${value} items`, `${name} Listings`]}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#1E293B',
                        borderRadius: '0.75rem',
                        color: '#FFFFFF',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="Active" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={36} />
                    <Bar dataKey="Pending" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={36} />
                    <Bar dataKey="Flagged" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Donut Proportion Chart & Metric Roster (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col items-center justify-around gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200">
                <div className="w-40 h-40 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={listingsBreakdown.donutData}
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {listingsBreakdown.donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any, name: any) => [`${val} items`, name]}
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#1E293B',
                          borderRadius: '0.75rem',
                          color: '#FFFFFF',
                          fontSize: '11px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-bold font-mono-numbers text-slate-900 leading-none">
                      {listingsBreakdown.totalActive}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Active</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs w-full max-w-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="font-semibold text-emerald-950">Active & Verified Live</span>
                    </div>
                    <span className="font-bold font-mono-numbers text-emerald-800">
                      {listingsBreakdown.totalActive} items
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="font-semibold text-amber-950">Pending Review</span>
                    </div>
                    <span className="font-bold font-mono-numbers text-amber-800">
                      {listingsBreakdown.totalPending} items
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span className="font-semibold text-red-950">Flagged / Moderation</span>
                    </div>
                    <span className="font-bold font-mono-numbers text-red-800">
                      {listingsBreakdown.totalFlagged} items
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Performance Ledger */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Revenue Streams Breakdown</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Ad Bundle Subscriptions (₦1,000 / 5 ads)</span>
                <span className="text-xl font-bold text-slate-900 font-mono-numbers mt-1 block">
                  ₦{adSubRevenue.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">Paid by casual advertisers</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
                <span className="text-emerald-800 block">Shop Sales Commissions ({platformSettings.commissionRatePercent}%)</span>
                <span className="text-xl font-bold text-emerald-950 font-mono-numbers mt-1 block">
                  ₦{commRevenue.toLocaleString()}
                </span>
                <span className="text-[11px] text-emerald-700 mt-1 block">Deducted on fulfilled verified sales</span>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200">
                <span className="text-indigo-800 block">Featured Listing Promotions</span>
                <span className="text-xl font-bold text-indigo-950 font-mono-numbers mt-1 block">
                  ₦{featRevenue.toLocaleString()}
                </span>
                <span className="text-[11px] text-indigo-700 mt-1 block">7-day spotlight boosts</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Approve Verified Sellers */}
      {activeAdminTab === 'sellers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Pending Seller Verification Queue ({pendingSellers.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review applicant CAC business registration documents and issue official Verified Merchant Badges.
                </p>
              </div>
            </div>

            {pendingSellers.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                ✓ No pending seller applications. All merchant identities verified.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingSellers.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{req.shopName}</h4>
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded">
                            Pending Review
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Owner: <strong>{req.ownerName}</strong> · CAC Reg: <strong className="font-mono-numbers">{req.businessRegNumber}</strong>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Identity Proof: {req.idType} ({req.idNumber}) · Phone: {req.phone} · Email: {req.email}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Store Address: {req.address}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => rejectShopVerification(req.id)}
                          className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5 text-red-500" />
                          <span>Reject</span>
                        </button>

                        <button
                          onClick={() => approveShopVerification(req.id, currentUser.name)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Grant Verified Badge</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Directory of Active Verified Stores */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-600" />
              <span>Active Verified Stores on Platform ({shops.length})</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="pb-3 font-semibold">Storefront</th>
                    <th className="pb-3 font-semibold">Verified Badge</th>
                    <th className="pb-3 font-semibold">Owner</th>
                    <th className="pb-3 font-semibold">Commission Model</th>
                    <th className="pb-3 font-semibold">Total Sales</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shops.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-bold text-slate-900">{s.name}</td>
                      <td className="py-3 font-mono-numbers text-emerald-700 font-semibold">
                        {s.isVerified ? s.verificationBadgeNumber : 'Pending Verification'}
                      </td>
                      <td className="py-3 text-slate-600">{s.ownerName}</td>
                      <td className="py-3 text-slate-600">
                        {s.commissionType === 'percentage' ? `${s.commissionValue}%` : `₦${s.commissionValue} flat`}
                      </td>
                      <td className="py-3 font-mono-numbers font-bold text-slate-900">
                        ₦{s.totalSalesAmount.toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {s.isVerified ? 'Verified Active' : 'Unverified'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Approve Classified Ads */}
      {activeAdminTab === 'ads' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-amber-500" />
                  <span>Classified Advertisements Moderation Queue ({pendingAds.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Approve submitted classified ads before publication to ensure safety caution compliance and prevent prohibited goods.
                </p>
              </div>
            </div>

            {pendingAds.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                ✓ No pending classified ads. All submitted advertisements reviewed.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingAds.map((ad) => (
                  <div
                    key={ad.id}
                    className="p-5 rounded-xl border border-amber-200 bg-amber-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={ad.imageUrl}
                        alt={ad.title}
                        className="w-16 h-16 rounded-lg object-cover bg-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                          {ad.category} · {ad.city}, {ad.state}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{ad.title}</h4>
                        <div className="text-xs font-mono-numbers font-bold text-slate-900">
                          Asking: ₦{ad.price.toLocaleString()} ({ad.condition})
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Advertiser: <strong>{ad.advertiserName}</strong> ({ad.advertiserPhone})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => rejectAdvertisement(ad.id, 'Prohibited category or suspicious pricing')}
                        className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                        <span>Reject Ad</span>
                      </button>

                      <button
                        onClick={() => approveAdvertisement(ad.id, currentUser.name)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition-colors shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve & Publish Ad</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Live Advertisements List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-500" />
              <span>Published Classified Ads ({advertisements.filter((a) => a.status === 'active').length})</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="pb-3 font-semibold">Title</th>
                    <th className="pb-3 font-semibold">Advertiser</th>
                    <th className="pb-3 font-semibold">Price</th>
                    <th className="pb-3 font-semibold">Moderation Status</th>
                    <th className="pb-3 font-semibold">Approved By</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {advertisements.map((ad) => (
                    <tr key={ad.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-medium text-slate-900 max-w-xs truncate">{ad.title}</td>
                      <td className="py-3 text-slate-600">{ad.advertiserName}</td>
                      <td className="py-3 font-mono-numbers font-bold text-slate-900">₦{ad.price.toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ad.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ad.status === 'pending_review'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {ad.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 text-[11px]">{ad.reviewedBy || 'Auto / System'}</td>
                      <td className="py-3 text-right">
                        {ad.status === 'active' && (
                          <button
                            onClick={() => rejectAdvertisement(ad.id, 'Flagged by Admin')}
                            className="text-red-600 hover:text-red-800 text-[11px] font-semibold"
                          >
                            Flag / Take Down
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Approve Payments & Payouts */}
      {activeAdminTab === 'payments' && (
        <div className="space-y-6">
          {/* Pending Merchant Payouts from Customer Escrow */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <span>Customer Order Escrow & Merchant Payout Approvals</span>
            </h3>
            <p className="text-xs text-slate-500">
              When customers buy products from verified shops, funds are held in escrow. Once confirmed, Admin releases net payouts to merchant accounts.
            </p>

            {orders.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                No orders placed yet.
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono-numbers text-slate-900">{o.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.paymentStatus === 'payout_released'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {o.paymentStatus === 'payout_released' ? 'Payout Released to Merchant' : 'Paid (Held in Escrow)'}
                        </span>
                      </div>
                      <p className="text-slate-600">
                        Buyer: <strong>{o.buyerName}</strong> ({o.buyerPhone}) · Destination: {o.deliveryAddress}, {o.city}
                      </p>
                      <div className="flex items-center gap-4 text-[11px] pt-1">
                        <span>Total Paid: <strong className="font-mono-numbers text-slate-900">₦{o.totalAmount.toLocaleString()}</strong></span>
                        <span className="text-emerald-700">Platform Commission: <strong className="font-mono-numbers">₦{o.platformCommission.toLocaleString()}</strong></span>
                        <span className="text-slate-900">Merchant Net Payout: <strong className="font-mono-numbers text-indigo-700">₦{o.merchantPayout.toLocaleString()}</strong></span>
                      </div>
                    </div>

                    <div>
                      {o.paymentStatus === 'paid_escrow' ? (
                        <button
                          onClick={() => approveMerchantOrderPayout(o.id, currentUser.name)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs"
                        >
                          Release Payout to Merchant (₦{o.merchantPayout.toLocaleString()})
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <Check className="w-4 h-4" /> Disbursed to Merchant
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Transactions Queue */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-700" />
              <span>All Platform Transactions & Approvals</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="pb-3 font-semibold">Ref</th>
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold">Description</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Approval Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-mono-numbers font-medium text-slate-600">{t.reference}</td>
                      <td className="py-3 font-medium text-slate-800">{t.type.replace(/_/g, ' ')}</td>
                      <td className="py-3 text-slate-600 max-w-xs truncate">{t.description}</td>
                      <td className="py-3 font-bold font-mono-numbers text-slate-900">₦{t.amountNgn.toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'pending_approval'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {t.status === 'pending_approval' && (
                          <button
                            onClick={() => approveTransactionPayment(t.id, currentUser.name)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px]"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Admin Team Roles & Staff Management */}
      {activeAdminTab === 'roles' && (
        <div className="space-y-6">
          {/* Active Operating Leadership Team */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span>Platform Operating Team & Leadership</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Internal organizational hierarchy established by Founder Sensei Askia. Governs operations oversight, seller verification, marketing growth, and escrow release.
                </p>
              </div>

              <button
                onClick={() => setShowAddStaffModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-black hover:bg-slate-900 text-[#D4AF37] border border-[#D4AF37]/50 rounded-xl text-xs font-bold transition-colors shadow-xs shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite New Staff Member</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {adminStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between space-y-3 hover:border-[#D4AF37]/60 transition-all shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <span>{staff.name}</span>
                          {staff.role === 'super_admin' && (
                            <span className="text-[10px] text-[#D4AF37] font-serif-brand font-bold">★</span>
                          )}
                        </h4>
                        <div className="text-[11px] font-semibold text-slate-800 mt-0.5">
                          {staff.jobTitle || 'Executive Officer'}
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono-numbers block">
                          {staff.email}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        staff.role === 'super_admin'
                          ? 'bg-[#000000] text-[#D4AF37] border border-[#D4AF37]/60'
                          : staff.role === 'coo'
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : staff.role === 'finance_admin'
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : staff.role === 'growth_manager'
                          ? 'bg-pink-100 text-pink-900 border border-pink-200'
                          : staff.role === 'verification_officer'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}>
                        {staff.role.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 space-y-1">
                      <div className="font-semibold text-slate-700 flex items-center justify-between">
                        <span>Department:</span>
                        <span className="text-slate-900 font-medium">{staff.department || 'Operations'}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Status:</span>
                        <span className="text-emerald-700 font-bold capitalize">{staff.status}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Last Active:</span>
                        <span className="text-slate-700 font-medium">{staff.lastActive || 'Today'}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-1">
                      <span className="font-semibold text-slate-700 block text-[10px] uppercase tracking-wider">
                        Authorized Permissions:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {staff.permissions.map((p) => (
                          <span key={p} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] text-slate-700 font-mono">
                            {p.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Assigned by: <strong className="text-slate-700">{staff.assignedBy}</strong></span>
                    {staff.role !== 'super_admin' && (
                      <button
                        onClick={() => removeAdminStaff(staff.id)}
                        className="text-red-600 hover:text-red-700 font-semibold hover:underline"
                      >
                        Revoke Access
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow B: Staff Applications Queue */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <span>Applicant Review Queue (Workflow B)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Applications submitted through the external staff portal. Requires Founder & Super Admin evaluation and role assignment.
                </p>
              </div>

              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-lg font-mono-numbers">
                {staffApplications.filter((a) => a.status === 'pending').length} Pending Review
              </span>
            </div>

            {staffApplications.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                No staff applications submitted yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px]">
                      <th className="pb-3 font-semibold">Applicant</th>
                      <th className="pb-3 font-semibold">Target Position</th>
                      <th className="pb-3 font-semibold">Department</th>
                      <th className="pb-3 font-semibold">Experience Summary</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Founder Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {staffApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3">
                          <div className="font-bold text-slate-900">{app.applicantName}</div>
                          <div className="text-[11px] text-slate-500 font-mono-numbers">{app.applicantEmail}</div>
                          <div className="text-[11px] text-slate-500">{app.applicantPhone}</div>
                        </td>
                        <td className="py-3 font-semibold text-slate-800">{app.desiredPosition}</td>
                        <td className="py-3 text-slate-600">{app.department}</td>
                        <td className="py-3 text-slate-600 max-w-xs truncate" title={app.experienceSummary}>
                          {app.experienceSummary}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            app.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {app.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {app.status === 'pending' ? (
                            <button
                              onClick={() => {
                                setReviewingApp(app);
                                setAssignedTitleForApp(app.desiredPosition);
                                setAssignedDeptForApp(app.department);
                              }}
                              className="px-3 py-1.5 bg-black hover:bg-slate-800 text-[#D4AF37] font-bold text-xs rounded-lg transition-colors border border-[#D4AF37]/40 shadow-xs"
                            >
                              Review & Authorize
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500 italic">
                              {app.reviewedBy ? `Reviewed by ${app.reviewedBy.split(' ')[0]}` : 'Processed'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Staff Compensation & Payroll */}
      {activeAdminTab === 'payroll' && (
        <div className="space-y-6">
          {/* Safeguard Notice */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-950 to-black text-white p-5 rounded-2xl border border-emerald-800/60 shadow-md space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Restricted Treasury & Founder Payroll Console</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Internal staff salaries are funded strictly from the company's settled commission revenue and platform capital reserves. Staff compensation is <strong>strictly isolated</strong> from customer order escrow funds, ensuring customer buyer protection remains 100% solvent.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500">Monthly Payroll Obligation</span>
              <div className="text-xl font-bold text-slate-900 font-mono-numbers">
                ₦{staffCompensation.reduce((sum, c) => sum + c.salaryNgn, 0).toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold block">Across 4 executive officers</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500">Active Payroll Count</span>
              <div className="text-xl font-bold text-slate-900 font-mono-numbers">
                {staffCompensation.filter((c) => c.status === 'active').length} Active
              </div>
              <span className="text-[10px] text-slate-500 block">Bank transfer verification active</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500">Next Scheduled Payroll</span>
              <div className="text-xl font-bold text-indigo-700 font-mono-numbers">
                Oct 31, 2026
              </div>
              <span className="text-[10px] text-indigo-600 block">Monthly cycle automated preview</span>
            </div>
          </div>

          {/* Compensation Records Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                  <span>Executive & Staff Salary Records</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monthly remuneration schedule for key management personnel.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="pb-3 font-semibold">Staff Member</th>
                    <th className="pb-3 font-semibold">Department</th>
                    <th className="pb-3 font-semibold">Salary Amount</th>
                    <th className="pb-3 font-semibold">Frequency</th>
                    <th className="pb-3 font-semibold">Bank Destination</th>
                    <th className="pb-3 font-semibold">Last Paid</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffCompensation.map((comp) => (
                    <tr key={comp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3">
                        <div className="font-bold text-slate-900">{comp.staffName}</div>
                        <div className="text-[11px] text-slate-500">{comp.position}</div>
                        <div className="text-[10px] text-slate-400 font-mono-numbers">{comp.staffEmail}</div>
                      </td>
                      <td className="py-3 text-slate-600">{comp.department}</td>
                      <td className="py-3 font-bold font-mono-numbers text-slate-900 text-sm">
                        ₦{comp.salaryNgn.toLocaleString()}
                      </td>
                      <td className="py-3 text-slate-600 capitalize">{comp.frequency}</td>
                      <td className="py-3">
                        <div className="font-medium text-slate-800">{comp.bankName || 'GTBank'}</div>
                        <div className="text-[11px] text-slate-500 font-mono-numbers">{comp.accountNumber || '0000000000'}</div>
                      </td>
                      <td className="py-3 text-slate-600 font-mono-numbers">
                        {comp.lastPaymentDate || 'Never'}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            setPayoutModalRecord(comp);
                            setPayoutAmountNgn(comp.salaryNgn.toString());
                            setPayoutReference(`SAL-${comp.staffName.toUpperCase().replace(/[^A-Z]/g, '')}-${new Date().toISOString().slice(0, 7)}`);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
                        >
                          Process Payout
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Past Payout Audit Trail */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-600" />
              <span>Staff Salary Disbursement History & Audit Trail</span>
            </h3>

            <div className="space-y-2">
              {staffCompensation.flatMap((c) => c.paymentHistory.map((p) => ({ ...p, staffName: c.staffName, staffRole: c.position }))).map((pay) => (
                <div
                  key={pay.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono-numbers">{pay.reference}</span>
                      <span className="px-2 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                        DISBURSED
                      </span>
                    </div>
                    <div className="text-slate-600">
                      Recipient: <strong>{pay.staffName}</strong> ({pay.staffRole}) · Authorized by: {pay.approvedBy}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 font-mono-numbers text-sm">
                      ₦{pay.amountNgn.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono-numbers">{pay.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Account Types & Registration Policies */}
      {activeAdminTab === 'account_types' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-slate-700" />
                <span>Account Types & Access Policies</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Govern which roles are enabled on ASKIA MARKET, whether visitors can self-register, and whether merchant CAC verification is strictly enforced.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {accountTypes.map((act) => (
                <div
                  key={act.id}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-4 shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">{act.label}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        act.enabled ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
                      }`}>
                        {act.enabled ? 'Active Role' : 'Disabled'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {act.description}
                    </p>

                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">Self-Registration Allowed:</span>
                        <button
                          onClick={() => updateAccountTypeConfig(act.id, { allowsSelfRegistration: !act.allowsSelfRegistration })}
                          className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                            act.allowsSelfRegistration
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {act.allowsSelfRegistration ? 'Public Allowed' : 'Invitation Only'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">Requires Admin Verification:</span>
                        <button
                          onClick={() => updateAccountTypeConfig(act.id, { requiresVerificationApproval: !act.requiresVerificationApproval })}
                          className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                            act.requiresVerificationApproval
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {act.requiresVerificationApproval ? 'Enforced Review' : 'Instant Activation'}
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 pt-1">
                      <strong className="text-slate-700">Capabilities:</strong> {act.permissionsSummary}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Settings */}
      {activeAdminTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-700" />
              <span>Platform Monetization & Policy Parameters</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure commissions, ad pack bundles (₦1,000 for 5 ads), and moderation policies.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Shop Commission Billing Model
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCommModel('percentage')}
                  className={`p-2.5 rounded-lg border text-left font-medium transition-colors ${
                    commModel === 'percentage'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Percentage (% per sale)
                </button>
                <button
                  type="button"
                  onClick={() => setCommModel('flat_fee')}
                  className={`p-2.5 rounded-lg border text-left font-medium transition-colors ${
                    commModel === 'flat_fee'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Flat Fee (₦ per sale)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Commission Rate (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={commRate}
                  onChange={(e) => setCommRate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-numbers focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Flat Fee per Sale (₦)</label>
                <input
                  type="number"
                  value={flatFee}
                  onChange={(e) => setFlatFee(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-numbers focus:outline-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block font-semibold text-slate-700 mb-1">
                Classified Ad Bundle Price (₦ for 5 Ads)
              </label>
              <input
                type="number"
                value={adPackPrice}
                onChange={(e) => setAdPackPrice(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-numbers focus:outline-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Feature Product (₦ / 7 days)</label>
                <input
                  type="number"
                  value={featProdPrice}
                  onChange={(e) => setFeatProdPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-numbers focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Feature Ad (₦ / 7 days)</label>
                <input
                  type="number"
                  value={featAdPrice}
                  onChange={(e) => setFeatAdPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-numbers focus:outline-emerald-500"
                />
              </div>
            </div>

            {/* Content Approval Toggle */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Require Admin Approval on New Classified Ads</span>
                <span className="text-[11px] text-slate-500">Hold newly posted classifieds in moderation queue before going live.</span>
              </div>
              <input
                type="checkbox"
                checked={requireAdApproval}
                onChange={(e) => setRequireAdApproval(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </div>

            {savedSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium">
                ✓ Platform settings updated successfully!
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors shadow-xs"
            >
              Save Configuration
            </button>
          </form>
        </div>
      )}

      {/* Add Admin Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Assign Platform Admin Role</h3>
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Staff Full Name</label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Ibrahim Danjuma"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Staff Email Address</label>
                <input
                  type="email"
                  required
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="e.g. ibrahim.moderation@askiamarket.ng"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={newStaffJobTitle}
                  onChange={(e) => setNewStaffJobTitle(e.target.value)}
                  placeholder="e.g. Senior Escalations Specialist"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={newStaffDepartment}
                  onChange={(e) => setNewStaffDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-indigo-500 bg-white"
                >
                  <option value="Operations & Strategy">Operations & Strategy</option>
                  <option value="Trust & Safety">Trust & Safety</option>
                  <option value="Treasury & Accounts">Treasury & Accounts</option>
                  <option value="Growth & Merchant Acquisition">Growth & Merchant Acquisition</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Admin Role</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as AdminRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-indigo-500"
                >
                  <option value="coo">Chief Operating Officer (COO - Operations & Escalations)</option>
                  <option value="finance_admin">Finance & Payments Manager (Reconciles & Releases Escrow)</option>
                  <option value="growth_manager">Marketing & Growth Manager (Campaigns & Featured Ads)</option>
                  <option value="verification_officer">Seller Verification & Compliance Officer (Reviews CAC)</option>
                  <option value="moderation_admin">Content Moderation Admin (Reviews Classified Ads)</option>
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
                  className="px-4 py-2 bg-black hover:bg-slate-900 text-[#D4AF37] border border-[#D4AF37]/50 font-bold rounded-lg shadow-sm"
                >
                  Authorize & Issue Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Application Review & Authorization Modal (Workflow B) */}
      {reviewingApp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Founder Review: Staff Application
                </h3>
                <p className="text-[11px] text-[#917112] font-medium">
                  Candidate: {reviewingApp.applicantName} ({reviewingApp.applicantEmail})
                </p>
              </div>
              <button
                onClick={() => setReviewingApp(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-bold text-slate-900">{reviewingApp.applicantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact:</span>
                <span className="font-mono-numbers text-slate-700">{reviewingApp.applicantPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Role:</span>
                <span className="font-bold text-emerald-800">{reviewingApp.desiredPosition}</span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block mb-1">Qualifications Summary:</span>
                <p className="text-slate-800 leading-relaxed bg-white p-2.5 rounded border border-slate-200 text-[11px]">
                  {reviewingApp.experienceSummary}
                </p>
              </div>
            </div>

            <form onSubmit={handleReviewAppSubmit} className="space-y-3 text-xs">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 font-bold cursor-pointer text-emerald-800">
                  <input
                    type="radio"
                    name="reviewAction"
                    value="approve"
                    checked={reviewAction === 'approve'}
                    onChange={() => setReviewAction('approve')}
                    className="text-emerald-600"
                  />
                  <span>Approve & Onboard</span>
                </label>
                <label className="flex items-center gap-1.5 font-bold cursor-pointer text-red-700">
                  <input
                    type="radio"
                    name="reviewAction"
                    value="reject"
                    checked={reviewAction === 'reject'}
                    onChange={() => setReviewAction('reject')}
                    className="text-red-600"
                  />
                  <span>Decline Application</span>
                </label>
              </div>

              {reviewAction === 'approve' ? (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Assign Admin Role</label>
                    <select
                      value={assignedRoleForApp}
                      onChange={(e) => setAssignedRoleForApp(e.target.value as AdminRole)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500 bg-white"
                    >
                      <option value="verification_officer">Seller Verification & Compliance Officer</option>
                      <option value="moderation_admin">Content Moderation Admin</option>
                      <option value="growth_manager">Marketing & Growth Manager</option>
                      <option value="finance_admin">Finance & Escrow Administrator</option>
                      <option value="coo">Operations Associate (COO Branch)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Official Job Title</label>
                    <input
                      type="text"
                      value={assignedTitleForApp}
                      onChange={(e) => setAssignedTitleForApp(e.target.value)}
                      placeholder={reviewingApp.desiredPosition}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="pt-1">
                  <label className="block font-semibold text-slate-700 mb-1">Reason for Decline</label>
                  <textarea
                    rows={2}
                    value={rejectionReasonText}
                    onChange={(e) => setRejectionReasonText(e.target.value)}
                    placeholder="Candidate does not meet requirements for this position..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:outline-red-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewingApp(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 font-bold text-xs rounded-lg transition-colors shadow-xs ${
                    reviewAction === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {reviewAction === 'approve' ? 'Confirm Approval & Create Account' : 'Decline Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Salary Payout Modal */}
      {payoutModalRecord && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                <span>Process Salary Disbursement</span>
              </h3>
              <button
                onClick={() => setPayoutModalRecord(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {payoutSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="font-bold text-emerald-900 text-xs">Payment Executed</div>
                <p className="text-[11px] text-emerald-800">{payoutSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleProcessPayoutSubmit} className="space-y-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Staff Recipient:</span>
                    <strong className="text-slate-900">{payoutModalRecord.staffName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Role:</span>
                    <span>{payoutModalRecord.position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bank:</span>
                    <span>{payoutModalRecord.bankName} ({payoutModalRecord.accountNumber})</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Disbursement Amount (₦ NGN)</label>
                  <input
                    type="number"
                    required
                    value={payoutAmountNgn}
                    onChange={(e) => setPayoutAmountNgn(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-numbers focus:outline-emerald-500 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Treasury Audit Reference</label>
                  <input
                    type="text"
                    required
                    value={payoutReference}
                    onChange={(e) => setPayoutReference(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-numbers focus:outline-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setPayoutModalRecord(null)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-xs"
                  >
                    Authorize & Disburse Salary
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
