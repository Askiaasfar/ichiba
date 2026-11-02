import {
  Shop,
  Product,
  Advertisement,
  AdSubscription,
  PlatformSettings,
  VerificationRequest,
  TransactionRecord,
  UserAccount,
  AdminStaffMember,
  ShopStaffMember,
  Order,
  StaffApplicationRequest,
  StaffCompensationRecord,
  AccountTypeConfig
} from '../types/marketplace';

/**
 * ASKIA MARKET — Authentic Initial System State
 * All demo products, fake sellers, artificial ratings, fake statistics,
 * fabricated staff, and sample orders have been purged for production.
 * Only legitimate system configurations, account types, and policies are retained.
 */

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-founder-primary',
    name: 'Askia Founder',
    email: 'askiasventures@gmail.com',
    phone: '+234 800 000 0001',
    accountType: 'admin',
    adminRole: 'super_admin',
    jobTitle: 'Founder & Super Administrator',
    department: 'Executive Office',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'usr-founder-secondary',
    name: 'Askia Executive',
    email: 'askiabusiness18@gmail.com',
    phone: '+234 800 000 0002',
    accountType: 'admin',
    adminRole: 'super_admin',
    jobTitle: 'Executive Office',
    department: 'Executive Office',
    createdAt: '2026-01-01T00:00:00Z'
  }
];

export const INITIAL_ADMIN_STAFF: AdminStaffMember[] = [];

export const INITIAL_SHOP_STAFF: ShopStaffMember[] = [];

export const INITIAL_SHOPS: Shop[] = [];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_ADVERTISEMENTS: Advertisement[] = [];

export const INITIAL_AD_SUBSCRIPTIONS: Record<string, AdSubscription> = {};

export const INITIAL_PLATFORM_SETTINGS: PlatformSettings = {
  commissionRatePercent: 5.0,
  flatFeePerSaleNgn: 250,
  activeCommissionModel: 'percentage',
  adPackagePriceNgn: 1000,
  adPackageCount: 5,
  featureProductPriceNgn: 1500,
  featureAdPriceNgn: 800,
  requireAdApproval: false
};

export const INITIAL_VERIFICATION_REQUESTS: VerificationRequest[] = [];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [];

export const INITIAL_STAFF_APPLICATIONS: StaffApplicationRequest[] = [];

export const INITIAL_STAFF_COMPENSATION: StaffCompensationRecord[] = [];

export const INITIAL_ACCOUNT_TYPES: AccountTypeConfig[] = [
  {
    id: 'buyer',
    label: 'Customer / Buyer',
    description: 'Browse verified shops, discover classified ads, chat with merchants, and place escrow-protected orders.',
    enabled: true,
    allowsSelfRegistration: true,
    requiresVerificationApproval: false,
    permissionsSummary: 'Order placement, buyer order tracking, direct seller chat, saved wishlist'
  },
  {
    id: 'shop_owner',
    label: 'Verified Shop Owner / Merchant',
    description: 'Launch a branded digital storefront, list inventory, manage staff members, and receive escrow disbursements.',
    enabled: true,
    allowsSelfRegistration: true,
    requiresVerificationApproval: true,
    permissionsSummary: 'Storefront customization, product catalog, inventory sync, store staff management, payout requests'
  },
  {
    id: 'advertiser',
    label: 'Classified Advertiser',
    description: 'Post verified classified ads across 18 key commercial categories with optional 7-day high-visibility boost.',
    enabled: true,
    allowsSelfRegistration: true,
    requiresVerificationApproval: false,
    permissionsSummary: 'Post classified listings, purchase 5-ad packages (₦1,000), boost listings (₦800), direct buyer messaging'
  },
  {
    id: 'staff',
    label: 'Operational Staff',
    description: 'Internal platform team member assigned to operations, verification, compliance, or finance.',
    enabled: true,
    allowsSelfRegistration: false,
    requiresVerificationApproval: true,
    permissionsSummary: 'Founder invitation or approved staff application required. Granular departmental dashboard.'
  }
];

export const NIGERIAN_STATES: string[] = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];
