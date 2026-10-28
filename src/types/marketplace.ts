export type UserRole = 'buyer' | 'shop_owner' | 'advertiser' | 'admin';

export type AccountType = 'shop_owner' | 'advertiser' | 'admin' | 'buyer';

export type AdminRole = 
  | 'super_admin' 
  | 'verification_officer' 
  | 'moderation_admin' 
  | 'finance_admin';

export type ShopStaffRole = 
  | 'owner' 
  | 'store_manager' 
  | 'inventory_officer' 
  | 'sales_cashier';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  accountType: AccountType;
  adminRole?: AdminRole;
  shopId?: string;
  shopStaffRole?: ShopStaffRole;
  createdAt: string;
  avatarUrl?: string;
}

export interface AdminStaffMember {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  assignedBy: string;
  permissions: string[];
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface ShopStaffMember {
  id: string;
  shopId: string;
  name: string;
  email: string;
  phone: string;
  role: ShopStaffRole;
  joinedAt: string;
  status: 'active' | 'suspended';
}

export type CommissionType = 'percentage' | 'flat_fee';

export interface Shop {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  ownerName: string;
  phone: string;
  email: string;
  state: string;
  city: string;
  address: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  isVerified: boolean;
  verificationBadgeNumber: string;
  verifiedDate: string;
  rating: number;
  reviewCount: number;
  commissionType: CommissionType;
  commissionValue: number; // e.g. 5 for 5% or 250 for 250 NGN flat fee
  totalSalesCount: number;
  totalSalesAmount: number;
  subscriptionPlan: 'commission_only' | 'monthly_pro';
}

export interface Product {
  id: string;
  shopId: string;
  shopName: string;
  title: string;
  description: string;
  price: number; // in NGN (Naira)
  category: string;
  condition: 'Brand New' | 'Open Box' | 'Refurbished';
  stock: number;
  imageUrl: string;
  isFeatured: boolean;
  featuredUntil?: string;
  createdAt: string;
  specs: Record<string, string>;
  salesCount: number;
}

export interface Advertisement {
  id: string;
  advertiserId: string;
  advertiserName: string;
  advertiserPhone: string;
  advertiserEmail: string;
  title: string;
  description: string;
  price: number; // in NGN
  isNegotiable: boolean;
  category: string;
  condition: 'Brand New' | 'Foreign Used / London Used' | 'Locally Used';
  state: string;
  city: string;
  imageUrl: string;
  isFeatured: boolean;
  featuredUntil?: string;
  createdAt: string;
  status: 'active' | 'pending_review' | 'flagged' | 'rejected' | 'sold';
  approvedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface AdSubscription {
  id: string;
  advertiserId: string;
  packageName: string;
  priceNgn: number;
  totalAdsAllowed: number;
  adsUsed: number;
  remainingAds: number;
  purchaseDate: string;
  expiresDate: string;
  status: 'active' | 'exhausted';
}

export interface VerificationRequest {
  id: string;
  shopId?: string;
  shopName: string;
  ownerName: string;
  businessRegNumber: string; // CAC Registration
  idType: 'National ID (NIN)' | 'International Passport' | "Voter's Card";
  idNumber: string;
  phone: string;
  email: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  shopId: string;
  shopName: string;
}

export interface Order {
  id: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  deliveryAddress: string;
  city: string;
  state: string;
  items: OrderItem[];
  totalAmount: number;
  platformCommission: number;
  merchantPayout: number;
  status: 'confirmed' | 'dispatched' | 'delivered';
  paymentStatus: 'paid_escrow' | 'payout_approved' | 'payout_released';
  createdAt: string;
}

export interface PlatformSettings {
  commissionRatePercent: number; // e.g. 5.0%
  flatFeePerSaleNgn: number; // e.g. 250 NGN
  activeCommissionModel: 'percentage' | 'flat_fee';
  adPackagePriceNgn: number; // 1,000 NGN for 5 ads
  adPackageCount: number; // 5 ads
  featureProductPriceNgn: number; // 1,500 NGN for 7 days
  featureAdPriceNgn: number; // 800 NGN for 7 days
  requireAdApproval: boolean; // whether ads need admin approval before going live
}

export interface TransactionRecord {
  id: string;
  type: 'ad_subscription' | 'product_sale_commission' | 'feature_product' | 'feature_ad' | 'merchant_payout';
  amountNgn: number;
  description: string;
  reference: string;
  createdAt: string;
  userEmail: string;
  status: 'approved' | 'pending_approval' | 'rejected';
  approvedBy?: string;
}

export interface ChatMessage {
  id: string;
  senderRole: 'buyer' | 'seller';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface ChatThread {
  id: string; // listingId
  listingId: string;
  listingType: 'product' | 'ad';
  listingTitle: string;
  listingPrice: number;
  listingImageUrl: string;
  sellerName: string;
  sellerPhone?: string;
  isVerifiedSeller: boolean;
  messages: ChatMessage[];
  lastMessageAt: string;
}

