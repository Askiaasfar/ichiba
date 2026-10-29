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

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-super-admin-askia',
    name: 'Sensei Askia',
    email: 'askiasventures@gmail.com',
    phone: '+234 800 000 0001',
    accountType: 'admin',
    adminRole: 'super_admin',
    jobTitle: 'Founder & Super Administrator',
    department: 'Executive Office',
    createdAt: '2026-01-01T00:00:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'usr-buyer-guest',
    name: 'Customer (Buyer)',
    email: 'buyer@lagos.ng',
    phone: '+234 801 234 5678',
    accountType: 'buyer',
    createdAt: '2026-01-02T00:00:00Z',
    wishlist: ['prod-1', 'prod-3']
  },
  {
    id: 'usr-owner-1',
    name: 'Babajide Adeleke',
    email: 'adeola@auratechglobal.ng',
    phone: '+234 803 412 8899',
    accountType: 'shop_owner',
    shopId: 'shop-1',
    shopStaffRole: 'owner',
    createdAt: '2026-01-14T00:00:00Z'
  },
  {
    id: 'usr-adv-chinedu',
    name: 'Chinedu Okafor',
    email: 'chinedu.okafor.trading@gmail.com',
    phone: '+234 803 881 2290',
    accountType: 'advertiser',
    createdAt: '2026-02-10T00:00:00Z'
  }
];

export const INITIAL_ADMIN_STAFF: AdminStaffMember[] = [
  {
    id: 'adm-super',
    name: 'Sensei Askia',
    email: 'askiasventures@gmail.com',
    role: 'super_admin',
    jobTitle: 'Founder & Super Administrator',
    department: 'Executive Office',
    assignedBy: 'System Owner',
    permissions: ['all_permissions', 'manage_admins', 'approve_shops', 'approve_ads', 'approve_payments', 'platform_settings', 'system_security'],
    createdAt: '2026-01-01',
    status: 'active',
    lastActive: 'Just now'
  },
  {
    id: 'adm-coo',
    name: "Al'amin",
    email: 'alamin.coo@askiamarket.ng',
    role: 'coo',
    jobTitle: 'Chief Operating Officer (COO)',
    department: 'Operations & Strategy',
    assignedBy: 'Founder & Super Administrator',
    permissions: ['operations_oversight', 'approve_shops', 'approve_ads', 'escalations', 'audit_sellers', 'view_reports'],
    createdAt: '2026-01-05',
    status: 'active',
    lastActive: '12 mins ago'
  },
  {
    id: 'adm-finance',
    name: 'Khadija',
    email: 'khadija.finance@askiamarket.ng',
    role: 'finance_admin',
    jobTitle: 'Head of Finance & Escrow',
    department: 'Treasury & Accounts',
    assignedBy: 'Founder & Super Administrator',
    permissions: ['approve_payments', 'release_payouts', 'reconcile_escrow', 'refund_orders', 'view_financial_analytics'],
    createdAt: '2026-01-08',
    status: 'active',
    lastActive: '45 mins ago'
  },
  {
    id: 'adm-growth',
    name: 'Farhan',
    email: 'farhan.growth@askiamarket.ng',
    role: 'growth_manager',
    jobTitle: 'Head of Marketing & Growth',
    department: 'Growth & Merchant Acquisition',
    assignedBy: 'Founder & Super Administrator',
    permissions: ['approve_ads', 'flag_content', 'campaign_management', 'analytics', 'feature_promotions'],
    createdAt: '2026-01-10',
    status: 'active',
    lastActive: '2 hours ago'
  },
  {
    id: 'adm-compliance',
    name: 'Aminu',
    email: 'aminu.compliance@askiamarket.ng',
    role: 'verification_officer',
    jobTitle: 'Senior Seller Verification Officer',
    department: 'Trust & Safety',
    assignedBy: 'Founder & Super Administrator',
    permissions: ['approve_shops', 'reject_shops', 'verify_cac', 'audit_sellers', 'kyc_document_review'],
    createdAt: '2026-01-12',
    status: 'active',
    lastActive: '1 day ago'
  }
];

export const INITIAL_SHOP_STAFF: ShopStaffMember[] = [
  {
    id: 'staff-1',
    shopId: 'shop-1',
    name: 'Femi Oladipo',
    email: 'femi.manager@auratech.ng',
    phone: '+234 805 112 9901',
    role: 'store_manager',
    joinedAt: '2026-01-20',
    status: 'active'
  },
  {
    id: 'staff-2',
    shopId: 'shop-1',
    name: 'Blessing Chukwu',
    email: 'blessing.stock@auratech.ng',
    phone: '+234 812 445 7788',
    role: 'inventory_officer',
    joinedAt: '2026-02-01',
    status: 'active'
  },
  {
    id: 'staff-3',
    shopId: 'shop-1',
    name: 'Tariq Al-Mansur',
    email: 'tariq.sales@auratech.ng',
    phone: '+234 809 667 3322',
    role: 'sales_cashier',
    joinedAt: '2026-02-15',
    status: 'active'
  }
];

export const INITIAL_SHOPS: Shop[] = [
  {
    id: 'shop-1',
    name: 'Aura Tech Global Systems',
    slug: 'aura-tech-global',
    ownerId: 'usr-owner-1',
    ownerName: 'Babajide Adeleke',
    phone: '+234 803 412 8899',
    email: 'contact@auratechglobal.ng',
    state: 'Lagos',
    city: 'Ikeja',
    address: 'Suite 14, Digital Plaza, Otigba Street, Computer Village, Ikeja',
    description: 'Direct importers of tier-1 business laptops, flagship smartphones, workstation computers, and certified electronic accessories with full warranty.',
    logoUrl: '/assets/images/product_tech_laptop_1793094444722.jpg',
    bannerUrl: '/assets/images/hero_marketplace_nigeria_1793094442016.jpg',
    isVerified: true,
    verificationBadgeNumber: 'NG-VER-89104',
    verifiedDate: '14 Jan 2026',
    rating: 4.9,
    reviewCount: 142,
    commissionType: 'percentage',
    commissionValue: 5.0, // 5% platform commission
    totalSalesCount: 88,
    totalSalesAmount: 42500000,
    subscriptionPlan: 'commission_only'
  },
  {
    id: 'shop-2',
    name: 'AfrikGlam Luxury Couture',
    slug: 'afrikglam-couture',
    ownerId: 'usr-owner-2',
    ownerName: 'Folashade Adebayo',
    phone: '+234 812 770 4455',
    email: 'info@afrikglam.ng',
    state: 'Lagos',
    city: 'Victoria Island',
    address: 'Plot 22B, Adeola Odeku Street, Victoria Island, Lagos',
    description: 'Handcrafted contemporary African luxury apparel, bespoke velvet kaftans, royal 3-piece agbadas, and ceremonial evening attire.',
    logoUrl: '/assets/images/product_couture_fashion_1793094443759.jpg',
    bannerUrl: '/assets/images/product_couture_fashion_1793094443759.jpg',
    isVerified: true,
    verificationBadgeNumber: 'NG-VER-33291',
    verifiedDate: '02 Feb 2026',
    rating: 4.8,
    reviewCount: 96,
    commissionType: 'percentage',
    commissionValue: 5.0,
    totalSalesCount: 54,
    totalSalesAmount: 18200000,
    subscriptionPlan: 'commission_only'
  },
  {
    id: 'shop-3',
    name: 'Lekki Solar & Power Solutions',
    slug: 'lekki-solar-power',
    ownerId: 'usr-owner-3',
    ownerName: 'Engr. Emeka Nwosu',
    phone: '+234 802 998 1234',
    email: 'sales@lekkisolar.com.ng',
    state: 'Lagos',
    city: 'Lekki Phase 1',
    address: 'Block 4, Admiralty Way, Lekki Phase 1, Lagos',
    description: 'Pure sine wave inverters, Tier-1 solar panels, LiFePO4 lithium storage banks, and certified commercial renewable energy installations.',
    logoUrl: '/assets/images/hero_marketplace_nigeria_1793094442016.jpg',
    bannerUrl: '/assets/images/hero_marketplace_nigeria_1793094442016.jpg',
    isVerified: true,
    verificationBadgeNumber: 'NG-VER-67015',
    verifiedDate: '19 Feb 2026',
    rating: 4.7,
    reviewCount: 63,
    commissionType: 'flat_fee',
    commissionValue: 1500,
    totalSalesCount: 31,
    totalSalesAmount: 64000000,
    subscriptionPlan: 'commission_only'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    shopId: 'shop-1',
    shopName: 'Aura Tech Global Systems',
    title: 'AuraBook Pro 16" Ultra-Thin Performance Laptop (M3 Max / 32GB / 1TB SSD)',
    description: 'Precision engineered space gray workstation laptop featuring high-density liquid retina display, 18-hour battery endurance, and thunderbolt connectivity. Backed by 1-year verified store replacement warranty.',
    price: 1850000,
    category: 'Electronics & Computers',
    condition: 'Brand New',
    stock: 7,
    imageUrl: '/assets/images/product_tech_laptop_1793094444722.jpg',
    isFeatured: true,
    featuredUntil: '2026-11-15',
    createdAt: '2026-10-20T10:30:00Z',
    specs: {
      'Processor': 'M3 Max 14-Core CPU',
      'Memory': '32GB Unified RAM',
      'Storage': '1TB NVMe Gen4 SSD',
      'Warranty': '12 Months Shop Guarantee'
    },
    salesCount: 19
  },
  {
    id: 'prod-2',
    shopId: 'shop-2',
    shopName: 'AfrikGlam Luxury Couture',
    title: 'Emerald Gold Royal Embroidered Velvet Kaftan Set',
    description: 'Exquisite haute-couture hand-embroidered velvet kaftan with metallic thread filigree, tailored silhouette, and matching trousers. Ideal for dignitaries, galas, and milestone celebrations.',
    price: 245000,
    category: 'Fashion & Apparel',
    condition: 'Brand New',
    stock: 12,
    imageUrl: '/assets/images/product_couture_fashion_1793094443759.jpg',
    isFeatured: true,
    featuredUntil: '2026-11-18',
    createdAt: '2026-10-21T14:15:00Z',
    specs: {
      'Material': 'Grade-A Silk Velvet & Gold Thread',
      'Fit': 'Tailored Modern Fit',
      'Care': 'Dry Clean Only',
      'Inclusions': 'Kaftan + Trousers + Signature Hanger'
    },
    salesCount: 28
  },
  {
    id: 'prod-3',
    shopId: 'shop-1',
    shopName: 'Aura Tech Global Systems',
    title: 'Sony WH-1000XM5 Wireless Noise-Canceling Studio Headphones',
    description: 'Industry-leading noise cancellation with dual processors, 8 microphones, and LDAC high-resolution lossless audio codecs. Sealed manufacturer retail box with genuine import stamp.',
    price: 495000,
    category: 'Electronics & Computers',
    condition: 'Brand New',
    stock: 15,
    imageUrl: '/assets/images/product_tech_laptop_1793094444722.jpg',
    isFeatured: false,
    createdAt: '2026-10-22T08:00:00Z',
    specs: {
      'Battery': '30 Hours with ANC',
      'Connectivity': 'Bluetooth 5.3 + 3.5mm Aux',
      'Charging': 'USB-C Quick Charge'
    },
    salesCount: 42
  },
  {
    id: 'prod-4',
    shopId: 'shop-3',
    shopName: 'Lekki Solar & Power Solutions',
    title: '5kVA 48V Pure Sine Wave Hybrid Solar Inverter + Smart MPPT Charger',
    description: 'Robust hybrid power inverter compatible with utility grid, generator, and solar arrays. Integrated Bluetooth telemetry and automatic phase transition.',
    price: 980000,
    category: 'Solar & Renewable Power',
    condition: 'Brand New',
    stock: 9,
    imageUrl: '/assets/images/hero_marketplace_nigeria_1793094442016.jpg',
    isFeatured: false,
    createdAt: '2026-10-23T11:45:00Z',
    specs: {
      'Capacity': '5000W Continuous Output',
      'Waveform': 'Pure Sine Wave',
      'Solar Input': '100A MPPT (Up to 500VDC)',
      'Support': 'Free Technical Consultation'
    },
    salesCount: 14
  }
];

export const INITIAL_ADVERTISEMENTS: Advertisement[] = [
  {
    id: 'ad-1',
    advertiserId: 'usr-adv-chinedu',
    advertiserName: 'Chinedu Okafor',
    advertiserPhone: '+234 803 881 2290',
    advertiserEmail: 'chinedu.okafor.trading@gmail.com',
    title: 'Silver Toyota Camry 2016 XLE Sedan (Direct Tokunbo / Clean Title)',
    description: 'Direct foreign used Toyota Camry 2016 XLE. Extremely chilling air conditioning, silent 4-cylinder engine, smooth automatic transmission, alloy wheels, cream leather interior, untouched exhaust catalysts. Located in Ikeja for direct physical inspection.',
    price: 9200000,
    isNegotiable: true,
    category: 'Vehicles & Automotive',
    condition: 'Foreign Used / London Used',
    state: 'Lagos',
    city: 'Ikeja',
    imageUrl: '/assets/images/ad_toyota_vehicle_1793094444379.jpg',
    isFeatured: true,
    featuredUntil: '2026-11-12',
    createdAt: '2026-10-24T09:20:00Z',
    status: 'active',
    approvedAt: '2026-10-24T09:30:00Z',
    reviewedBy: 'Halima (Ad Moderation)'
  },
  {
    id: 'ad-2',
    advertiserId: 'adv-bello-2',
    advertiserName: 'Alhaji Bello Sani',
    advertiserPhone: '+234 809 332 5541',
    advertiserEmail: 'bello.sani.kano@gmail.com',
    title: 'Mikano 9kVA Soundproof Diesel Generator (Low Hours)',
    description: 'Original Perkins engine Mikano 9kVA diesel soundproof generator. Used lightly as backup for residential duplex. Only 650 runtime hours logged. Serious buyers can come with their mechanic to test in Surulere.',
    price: 2400000,
    isNegotiable: true,
    category: 'Home & Industrial Machinery',
    condition: 'Locally Used',
    state: 'Lagos',
    city: 'Surulere',
    imageUrl: '/assets/images/hero_marketplace_nigeria_1793094442016.jpg',
    isFeatured: false,
    createdAt: '2026-10-25T15:00:00Z',
    status: 'active',
    approvedAt: '2026-10-25T15:15:00Z',
    reviewedBy: 'Halima (Ad Moderation)'
  },
  {
    id: 'ad-3',
    advertiserId: 'adv-ngozi-3',
    advertiserName: 'Mrs. Ngozi Adeleke',
    advertiserPhone: '+234 814 550 7820',
    advertiserEmail: 'ngozi.adeleke92@yahoo.com',
    title: 'Spacious 2-Bedroom Serviced Flat for Rent in Gwarinpa Estate',
    description: 'Fully tiled 2-bedroom apartment with pop ceiling, fitted kitchen cabinets, borehole water supply, prepaid meter, and 24/7 uniform estate security. Direct owner listing, no agency commission.',
    price: 2800000,
    isNegotiable: false,
    category: 'Real Estate & Rentals',
    condition: 'Foreign Used / London Used',
    state: 'Abuja (FCT)',
    city: 'Gwarinpa',
    imageUrl: '/assets/images/hero_marketplace_nigeria_1793094442016.jpg',
    isFeatured: false,
    createdAt: '2026-10-25T17:30:00Z',
    status: 'active',
    approvedAt: '2026-10-25T18:00:00Z',
    reviewedBy: 'Halima (Ad Moderation)'
  },
  {
    id: 'ad-4',
    advertiserId: 'adv-emeka-4',
    advertiserName: 'Emeka Davies',
    advertiserPhone: '+234 705 120 4499',
    advertiserEmail: 'emeka.d.tech@gmail.com',
    title: 'Sony PlayStation 5 Disc Edition + 2 Controllers + 3 Games (Spider-Man 2, FC 25)',
    description: 'UK imported PS5 console disc version with 2 original wireless DualSense controllers and 3 disc games included. Perfect working order. Physical test before cash or transfer in GRA Phase 2.',
    price: 720000,
    isNegotiable: true,
    category: 'Electronics & Computers',
    condition: 'Foreign Used / London Used',
    state: 'Rivers',
    city: 'Port Harcourt',
    imageUrl: '/assets/images/product_tech_laptop_1793094444722.jpg',
    isFeatured: true,
    featuredUntil: '2026-11-20',
    createdAt: '2026-10-26T12:00:00Z',
    status: 'active',
    approvedAt: '2026-10-26T12:30:00Z',
    reviewedBy: 'Halima (Ad Moderation)'
  },
  {
    id: 'ad-pending-1',
    advertiserId: 'usr-adv-chinedu',
    advertiserName: 'Chinedu Okafor',
    advertiserPhone: '+234 803 881 2290',
    advertiserEmail: 'chinedu.okafor.trading@gmail.com',
    title: 'Brand New Yamaha EF6600E 5.5kVA Key-Start Petrol Generator',
    description: 'Brand new in box Yamaha generator with copper coil winding and electric ignition key. Awaiting physical inspection in Ikeja.',
    price: 680000,
    isNegotiable: true,
    category: 'Home & Industrial Machinery',
    condition: 'Brand New',
    state: 'Lagos',
    city: 'Ikeja',
    imageUrl: '/assets/images/hero_marketplace_nigeria_1793094442016.jpg',
    isFeatured: false,
    createdAt: '2026-10-27T02:40:00Z',
    status: 'pending_review' // Needs admin approval!
  }
];

export const INITIAL_AD_SUBSCRIPTIONS: Record<string, AdSubscription> = {
  'usr-adv-chinedu': {
    id: 'sub-chinedu-01',
    advertiserId: 'usr-adv-chinedu',
    packageName: 'Standard Ad Bundle (5 Ads)',
    priceNgn: 1000,
    totalAdsAllowed: 5,
    adsUsed: 2,
    remainingAds: 3,
    purchaseDate: '2026-10-24',
    expiresDate: '2026-11-24',
    status: 'active'
  }
};

export const INITIAL_PLATFORM_SETTINGS: PlatformSettings = {
  commissionRatePercent: 5.0,
  flatFeePerSaleNgn: 250,
  activeCommissionModel: 'percentage',
  adPackagePriceNgn: 1000,
  adPackageCount: 5,
  featureProductPriceNgn: 1500,
  featureAdPriceNgn: 800,
  requireAdApproval: true // Admin must approve classified ads before they appear in public feed
};

export const INITIAL_VERIFICATION_REQUESTS: VerificationRequest[] = [
  {
    id: 'req-1',
    shopName: 'Ibadan Mobile Hub',
    ownerName: 'Oluwaseun Bakare',
    businessRegNumber: 'RC-1849201',
    idType: 'National ID (NIN)',
    idNumber: '29481920491',
    phone: '+234 805 119 2200',
    email: 'bakare@ibadanmobile.com',
    address: 'Dugbe Commercial Arcade, Ibadan, Oyo State',
    status: 'pending',
    submittedAt: '2026-10-26T14:30:00Z'
  },
  {
    id: 'req-2',
    shopName: 'Kano Textile & Fabric Empire',
    ownerName: 'Musa Abdullahi',
    businessRegNumber: 'BN-882941',
    idType: 'International Passport',
    idNumber: 'A10948291',
    phone: '+234 802 445 1029',
    email: 'musa@kanotextiles.ng',
    address: 'Kanti Kwari Market, Kano',
    status: 'pending',
    submittedAt: '2026-10-27T01:10:00Z'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-991204',
    buyerName: 'Dr. Tariq Sanusi',
    buyerPhone: '+234 803 555 4190',
    buyerEmail: 'tariq.sanusi@health.gov.ng',
    deliveryAddress: '24 Bourdillon Road, Ikoyi',
    city: 'Ikoyi',
    state: 'Lagos',
    items: [
      {
        productId: 'prod-1',
        title: 'AuraBook Pro 16" Ultra-Thin Performance Laptop',
        price: 1850000,
        quantity: 1,
        shopId: 'shop-1',
        shopName: 'Aura Tech Global Systems'
      }
    ],
    totalAmount: 1850000,
    platformCommission: 92500,
    merchantPayout: 1757500,
    status: 'confirmed',
    paymentStatus: 'paid_escrow', // Awaiting Admin payout release to merchant
    createdAt: '2026-10-26T16:00:00Z'
  }
];

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'tx-1',
    type: 'ad_subscription',
    amountNgn: 1000,
    description: 'Ad Bundle (5 Ads) - Chinedu Okafor',
    reference: 'REF-SUB-99410',
    createdAt: '2026-10-24T09:10:00Z',
    userEmail: 'chinedu.okafor.trading@gmail.com',
    status: 'approved',
    approvedBy: 'Emeka (Finance & Payouts)'
  },
  {
    id: 'tx-2',
    type: 'feature_ad',
    amountNgn: 800,
    description: 'Featured Boost: Toyota Camry 2016 Listing',
    reference: 'REF-BOOST-4412',
    createdAt: '2026-10-24T09:25:00Z',
    userEmail: 'chinedu.okafor.trading@gmail.com',
    status: 'approved',
    approvedBy: 'Emeka (Finance & Payouts)'
  },
  {
    id: 'tx-3',
    type: 'feature_product',
    amountNgn: 1500,
    description: 'Featured Product: AuraBook Pro 16"',
    reference: 'REF-PROD-FEAT-881',
    createdAt: '2026-10-20T10:45:00Z',
    userEmail: 'contact@auratechglobal.ng',
    status: 'approved',
    approvedBy: 'Emeka (Finance & Payouts)'
  },
  {
    id: 'tx-4',
    type: 'product_sale_commission',
    amountNgn: 92500,
    description: '5% Commission on AuraBook Pro Sale (₦1,850,000)',
    reference: 'REF-COMM-0192',
    createdAt: '2026-10-25T11:00:00Z',
    userEmail: 'contact@auratechglobal.ng',
    status: 'approved',
    approvedBy: 'Emeka (Finance & Payouts)'
  },
  {
    id: 'tx-pending-payout-1',
    type: 'merchant_payout',
    amountNgn: 1757500,
    description: 'Disbursement Payout to Aura Tech Global (Order ORD-991204)',
    reference: 'PAYOUT-ESCROW-8812',
    createdAt: '2026-10-26T16:05:00Z',
    userEmail: 'contact@auratechglobal.ng',
    status: 'pending_approval' // Needs Admin Finance approval!
  }
];

export const INITIAL_STAFF_APPLICATIONS: StaffApplicationRequest[] = [
  {
    id: 'app-001',
    applicantName: 'Zainab Danjuma',
    applicantEmail: 'zainab.danjuma@gmail.com',
    applicantPhone: '+234 802 334 9911',
    desiredPosition: 'Customer Experience & Merchant Support',
    department: 'Operations & Strategy',
    experienceSummary: '3+ years managing merchant onboarding and Tier-2 escalation resolution at Jumia Logistics Nigeria.',
    submittedAt: '2026-10-27T10:15:00Z',
    status: 'pending'
  },
  {
    id: 'app-002',
    applicantName: 'Emeka Umeh',
    applicantEmail: 'emeka.umeh.risk@outlook.com',
    applicantPhone: '+234 814 882 1044',
    desiredPosition: 'KYC & Fraud Prevention Analyst',
    department: 'Trust & Safety',
    experienceSummary: 'Ex-Compliance associate at Moniepoint. Certified in CAC business verification and AML risk mitigation.',
    submittedAt: '2026-10-28T14:30:00Z',
    status: 'pending'
  }
];

export const INITIAL_STAFF_COMPENSATION: StaffCompensationRecord[] = [
  {
    id: 'comp-alamin',
    staffId: 'adm-coo',
    staffName: "Al'amin",
    staffEmail: 'alamin.coo@askiamarket.ng',
    position: 'Chief Operating Officer (COO)',
    department: 'Operations & Strategy',
    salaryNgn: 750000,
    frequency: 'monthly',
    paymentMethod: 'Bank Transfer',
    bankName: 'Guaranty Trust Bank (GTBank)',
    accountNumber: '0234889102',
    lastPaymentDate: '2026-09-30',
    nextScheduledPayment: '2026-10-31',
    status: 'active',
    paymentHistory: [
      {
        id: 'pay-gtb-0926',
        date: '2026-09-30',
        amountNgn: 750000,
        status: 'paid',
        reference: 'SAL-ALAMIN-2026-09',
        approvedBy: 'Sensei Askia (Founder)'
      },
      {
        id: 'pay-gtb-0826',
        date: '2026-08-31',
        amountNgn: 750000,
        status: 'paid',
        reference: 'SAL-ALAMIN-2026-08',
        approvedBy: 'Sensei Askia (Founder)'
      }
    ]
  },
  {
    id: 'comp-khadija',
    staffId: 'adm-finance',
    staffName: 'Khadija',
    staffEmail: 'khadija.finance@askiamarket.ng',
    position: 'Head of Finance & Escrow',
    department: 'Treasury & Accounts',
    salaryNgn: 650000,
    frequency: 'monthly',
    paymentMethod: 'Bank Transfer',
    bankName: 'Zenith Bank PLC',
    accountNumber: '2109448810',
    lastPaymentDate: '2026-09-30',
    nextScheduledPayment: '2026-10-31',
    status: 'active',
    paymentHistory: [
      {
        id: 'pay-zen-0926',
        date: '2026-09-30',
        amountNgn: 650000,
        status: 'paid',
        reference: 'SAL-KHADIJA-2026-09',
        approvedBy: 'Sensei Askia (Founder)'
      }
    ]
  },
  {
    id: 'comp-farhan',
    staffId: 'adm-growth',
    staffName: 'Farhan',
    staffEmail: 'farhan.growth@askiamarket.ng',
    position: 'Head of Marketing & Growth',
    department: 'Growth & Merchant Acquisition',
    salaryNgn: 550000,
    frequency: 'monthly',
    paymentMethod: 'Bank Transfer',
    bankName: 'Access Bank',
    accountNumber: '0812994432',
    lastPaymentDate: '2026-09-30',
    nextScheduledPayment: '2026-10-31',
    status: 'active',
    paymentHistory: [
      {
        id: 'pay-acc-0926',
        date: '2026-09-30',
        amountNgn: 550000,
        status: 'paid',
        reference: 'SAL-FARHAN-2026-09',
        approvedBy: 'Sensei Askia (Founder)'
      }
    ]
  },
  {
    id: 'comp-aminu',
    staffId: 'adm-compliance',
    staffName: 'Aminu',
    staffEmail: 'aminu.compliance@askiamarket.ng',
    position: 'Senior Seller Verification Officer',
    department: 'Trust & Safety',
    salaryNgn: 480000,
    frequency: 'monthly',
    paymentMethod: 'Bank Transfer',
    bankName: 'First Bank of Nigeria',
    accountNumber: '3099112284',
    lastPaymentDate: '2026-09-30',
    nextScheduledPayment: '2026-10-31',
    status: 'active',
    paymentHistory: [
      {
        id: 'pay-fbn-0926',
        date: '2026-09-30',
        amountNgn: 480000,
        status: 'paid',
        reference: 'SAL-AMINU-2026-09',
        approvedBy: 'Sensei Askia (Founder)'
      }
    ]
  }
];

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
    description: 'Post verified classified ads across 6 key commercial categories with optional 7-day high-visibility boost.',
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
