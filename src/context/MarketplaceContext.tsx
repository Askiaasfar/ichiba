import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Shop,
  Product,
  Advertisement,
  AdSubscription,
  PlatformSettings,
  VerificationRequest,
  TransactionRecord,
  Order,
  OrderItem,
  UserRole,
  UserAccount,
  AdminStaffMember,
  ShopStaffMember,
  AdminRole,
  ShopStaffRole,
  ChatMessage,
  ChatThread
} from '../types/marketplace';
import {
  INITIAL_USERS,
  INITIAL_ADMIN_STAFF,
  INITIAL_SHOP_STAFF,
  INITIAL_SHOPS,
  INITIAL_PRODUCTS,
  INITIAL_ADVERTISEMENTS,
  INITIAL_AD_SUBSCRIPTIONS,
  INITIAL_PLATFORM_SETTINGS,
  INITIAL_VERIFICATION_REQUESTS,
  INITIAL_ORDERS,
  INITIAL_TRANSACTIONS
} from '../data/initialData';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface MarketplaceContextType {
  // Current user & authentication
  currentUser: UserAccount;
  users: UserAccount[];
  adminStaff: AdminStaffMember[];
  shopStaff: ShopStaffMember[];
  loginAsUser: (userId: string) => void;
  registerUser: (data: {
    name: string;
    email: string;
    phone: string;
    accountCategory: 'shop_owner' | 'advertiser';
    shopDetails?: {
      shopName: string;
      cacNumber: string;
      idType: 'National ID (NIN)' | 'International Passport' | "Voter's Card";
      idNumber: string;
      address: string;
      city: string;
      state: string;
      description: string;
    };
  }) => UserAccount;
  logout: () => void;

  // Platform entities
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentShop: Shop | undefined;
  shops: Shop[];
  products: Product[];
  advertisements: Advertisement[];
  adSubscriptions: Record<string, AdSubscription>;
  verificationRequests: VerificationRequest[];
  transactions: TransactionRecord[];
  orders: Order[];
  platformSettings: PlatformSettings;
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  currentAdvertiserSubscription: AdSubscription | undefined;
  
  // Chat messaging
  chatThreads: Record<string, ChatThread>;
  activeChatThread: ChatThread | null;
  openChat: (listing: { type: 'product'; data: Product } | { type: 'ad'; data: Advertisement }) => void;
  closeChat: () => void;
  sendChatMessage: (listingId: string, messageText: string) => void;

  // Actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  postProduct: (data: Omit<Product, 'id' | 'createdAt' | 'salesCount'>) => void;
  featureProduct: (productId: string) => boolean;
  postAdvertisement: (data: Omit<Advertisement, 'id' | 'createdAt' | 'status' | 'advertiserId'>) => { success: boolean; error?: string; pendingApproval?: boolean };
  buyAdSubscription: (advertiserId?: string) => void;
  featureAdvertisement: (adId: string) => boolean;
  checkoutCart: (buyer: { name: string; phone: string; email: string; address: string; city: string; state: string }) => Order;
  submitShopVerification: (data: Omit<VerificationRequest, 'id' | 'status' | 'submittedAt'>) => void;
  
  // Admin platform approvals & role governance
  approveShopVerification: (requestId: string, adminName?: string) => void;
  rejectShopVerification: (requestId: string, reason?: string) => void;
  approveAdvertisement: (adId: string, adminName?: string) => void;
  rejectAdvertisement: (adId: string, reason?: string) => void;
  approveTransactionPayment: (txId: string, adminName?: string) => void;
  rejectTransactionPayment: (txId: string) => void;
  approveMerchantOrderPayout: (orderId: string, adminName?: string) => void;
  addAdminStaff: (staffData: Omit<AdminStaffMember, 'id' | 'createdAt'>) => void;
  removeAdminStaff: (staffId: string) => void;
  
  // Shop owner staff management
  addShopStaff: (shopId: string, staffData: Omit<ShopStaffMember, 'id' | 'shopId' | 'joinedAt'>) => void;
  removeShopStaff: (staffId: string) => void;
  
  updatePlatformSettings: (settings: Partial<PlatformSettings>) => void;
  deleteAdvertisement: (adId: string) => void;
  reportAdvertisement: (adId: string, reason: string) => void;
  resetDemoData: () => void;
}

const STORAGE_KEY = 'AURA_NKEM_MARKETPLACE_v2';

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Users state
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Current logged in user (defaults to Super Admin for easy full review, or first user)
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_current_user_id`);
    return saved || 'usr-admin-super';
  });

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  // Admin staff directory
  const [adminStaff, setAdminStaff] = useState<AdminStaffMember[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_admin_staff`);
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_STAFF;
  });

  // Shop staff directory
  const [shopStaff, setShopStaff] = useState<ShopStaffMember[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_shop_staff`);
    return saved ? JSON.parse(saved) : INITIAL_SHOP_STAFF;
  });

  // Role synced with currentUser.accountType
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (currentUser.accountType as UserRole) || 'buyer';
  });

  // Shops
  const [shops, setShops] = useState<Shop[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_shops`);
    return saved ? JSON.parse(saved) : INITIAL_SHOPS;
  });

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Advertisements
  const [advertisements, setAdvertisements] = useState<Advertisement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_advertisements`);
    return saved ? JSON.parse(saved) : INITIAL_ADVERTISEMENTS;
  });

  // Ad Subscriptions
  const [adSubscriptions, setAdSubscriptions] = useState<Record<string, AdSubscription>>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_subscriptions`);
    return saved ? JSON.parse(saved) : INITIAL_AD_SUBSCRIPTIONS;
  });

  // Verification Requests
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_verifications`);
    return saved ? JSON.parse(saved) : INITIAL_VERIFICATION_REQUESTS;
  });

  // Transactions
  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_orders`);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // Platform Settings
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    return saved ? JSON.parse(saved) : INITIAL_PLATFORM_SETTINGS;
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Chat messaging threads
  const [chatThreads, setChatThreads] = useState<Record<string, ChatThread>>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_chats`);
    return saved ? JSON.parse(saved) : {};
  });
  const [activeChatListingId, setActiveChatListingId] = useState<string | null>(null);

  // Synchronize role whenever current user changes
  useEffect(() => {
    if (currentUser) {
      setCurrentRole(currentUser.accountType as UserRole);
    }
  }, [currentUser]);

  // Sync chats to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_chats`, JSON.stringify(chatThreads));
  }, [chatThreads]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_current_user_id`, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_admin_staff`, JSON.stringify(adminStaff));
  }, [adminStaff]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_shop_staff`, JSON.stringify(shopStaff));
  }, [shopStaff]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_shops`, JSON.stringify(shops));
  }, [shops]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_advertisements`, JSON.stringify(advertisements));
  }, [advertisements]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_subscriptions`, JSON.stringify(adSubscriptions));
  }, [adSubscriptions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_verifications`, JSON.stringify(verificationRequests));
  }, [verificationRequests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(platformSettings));
  }, [platformSettings]);

  // Determine active shop for current user
  const currentShop = currentUser.shopId
    ? shops.find((s) => s.id === currentUser.shopId)
    : shops[0];

  const currentAdvertiserSubscription = adSubscriptions[currentUser.id] || adSubscriptions['usr-adv-chinedu'];

  // Login handler
  const loginAsUser = (userId: string) => {
    setCurrentUserId(userId);
    const u = users.find((x) => x.id === userId);
    if (u) {
      setCurrentRole(u.accountType as UserRole);
    }
  };

  const logout = () => {
    // Switch to public buyer mode
    const existingBuyer = users.find((u) => u.accountType === 'buyer');
    if (existingBuyer) {
      setCurrentUserId(existingBuyer.id);
      setCurrentRole('buyer');
      return;
    }
    const newBuyer: UserAccount = {
      id: `usr-buyer-${Date.now()}`,
      name: 'Guest Buyer',
      email: 'guest@buyer.ng',
      phone: '+234 800 000 0000',
      accountType: 'buyer',
      createdAt: new Date().toISOString()
    };
    setUsers((prev) => [...prev, newBuyer]);
    setCurrentUserId(newBuyer.id);
    setCurrentRole('buyer');
  };

  // Register New User Account (Shop Owner vs Advertiser Category)
  const registerUser = (data: {
    name: string;
    email: string;
    phone: string;
    accountCategory: 'shop_owner' | 'advertiser';
    shopDetails?: {
      shopName: string;
      cacNumber: string;
      idType: 'National ID (NIN)' | 'International Passport' | "Voter's Card";
      idNumber: string;
      address: string;
      city: string;
      state: string;
      description: string;
    };
  }): UserAccount => {
    const newUserId = `usr-${Date.now()}`;
    let associatedShopId: string | undefined = undefined;

    if (data.accountCategory === 'shop_owner' && data.shopDetails) {
      associatedShopId = `shop-${Date.now()}`;
      
      // Create new shop (initially unverified pending Admin approval)
      const newShop: Shop = {
        id: associatedShopId,
        name: data.shopDetails.shopName,
        slug: data.shopDetails.shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        ownerId: newUserId,
        ownerName: data.name,
        phone: data.phone,
        email: data.email,
        state: data.shopDetails.state,
        city: data.shopDetails.city,
        address: data.shopDetails.address,
        description: data.shopDetails.description || `${data.shopDetails.shopName} - Certified retail store.`,
        logoUrl: '/src/assets/images/hero_marketplace_nigeria_1793094442016.jpg',
        bannerUrl: '/src/assets/images/hero_marketplace_nigeria_1793094442016.jpg',
        isVerified: false, // Must be approved by Admin!
        verificationBadgeNumber: 'PENDING_VERIFICATION',
        verifiedDate: 'Pending Review',
        rating: 5.0,
        reviewCount: 0,
        commissionType: platformSettings.activeCommissionModel,
        commissionValue: platformSettings.activeCommissionModel === 'percentage' ? platformSettings.commissionRatePercent : platformSettings.flatFeePerSaleNgn,
        totalSalesCount: 0,
        totalSalesAmount: 0,
        subscriptionPlan: 'commission_only'
      };

      // Create Verification Request for Admin Dashboard Queue
      const verifyReq: VerificationRequest = {
        id: `req-${Date.now()}`,
        shopId: associatedShopId,
        shopName: data.shopDetails.shopName,
        ownerName: data.name,
        businessRegNumber: data.shopDetails.cacNumber,
        idType: data.shopDetails.idType,
        idNumber: data.shopDetails.idNumber,
        phone: data.phone,
        email: data.email,
        address: data.shopDetails.address,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      setShops((prev) => [newShop, ...prev]);
      setVerificationRequests((prev) => [verifyReq, ...prev]);
    } else if (data.accountCategory === 'advertiser') {
      // Create starter bundle subscription ready for purchase (₦1,000 for 5 ads)
      const sub: AdSubscription = {
        id: `sub-${Date.now()}`,
        advertiserId: newUserId,
        packageName: 'Standard Ad Bundle (5 Ads)',
        priceNgn: platformSettings.adPackagePriceNgn,
        totalAdsAllowed: 5,
        adsUsed: 0,
        remainingAds: 5,
        purchaseDate: new Date().toISOString().split('T')[0],
        expiresDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        status: 'active'
      };
      setAdSubscriptions((prev) => ({
        ...prev,
        [newUserId]: sub
      }));
    }

    const newUser: UserAccount = {
      id: newUserId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      accountType: data.accountCategory,
      shopId: associatedShopId,
      shopStaffRole: data.accountCategory === 'shop_owner' ? 'owner' : undefined,
      createdAt: new Date().toISOString()
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(newUserId);
    setCurrentRole(data.accountCategory as UserRole);

    return newUser;
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Active chat thread
  const activeChatThread = activeChatListingId ? chatThreads[activeChatListingId] || null : null;

  const openChat = (listing: { type: 'product'; data: Product } | { type: 'ad'; data: Advertisement }) => {
    const isProd = listing.type === 'product';
    const itemData = listing.data;
    const listingId = itemData.id;

    setChatThreads((prev) => {
      if (prev[listingId]) return prev;

      const shop = isProd ? shops.find((s) => s.id === (itemData as Product).shopId) : null;
      const initialThread: ChatThread = {
        id: listingId,
        listingId,
        listingType: listing.type,
        listingTitle: itemData.title,
        listingPrice: itemData.price,
        listingImageUrl: itemData.imageUrl,
        sellerName: isProd ? (itemData as Product).shopName : (itemData as Advertisement).advertiserName,
        sellerPhone: isProd ? shop?.phone : (itemData as Advertisement).advertiserPhone,
        isVerifiedSeller: isProd,
        messages: [
          {
            id: `msg-init-${Date.now()}`,
            senderRole: 'seller',
            senderName: isProd ? (itemData as Product).shopName : (itemData as Advertisement).advertiserName,
            text: isProd
              ? `Hello! Welcome to ${(itemData as Product).shopName}. How can we assist you with "${itemData.title}" today?`
              : `Hello! I am ${(itemData as Advertisement).advertiserName}. Thanks for your interest in "${itemData.title}". Feel free to ask questions or arrange a daytime physical meeting.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ],
        lastMessageAt: new Date().toISOString()
      };

      return {
        ...prev,
        [listingId]: initialThread
      };
    });

    setActiveChatListingId(listingId);
  };

  const closeChat = () => {
    setActiveChatListingId(null);
  };

  const sendChatMessage = (listingId: string, messageText: string) => {
    if (!messageText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderRole: 'buyer',
      senderName: currentUser.name || 'Prospective Buyer',
      text: messageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatThreads((prev) => {
      const thread = prev[listingId];
      if (!thread) return prev;

      return {
        ...prev,
        [listingId]: {
          ...thread,
          messages: [...thread.messages, newMsg],
          lastMessageAt: new Date().toISOString()
        }
      };
    });

    // Realistic automated seller response simulation
    setTimeout(() => {
      setChatThreads((prev) => {
        const thread = prev[listingId];
        if (!thread) return prev;

        const isVerified = thread.isVerifiedSeller;
        const autoReplyText = isVerified
          ? `Thank you for your inquiry! This item is 100% verified in-stock at our store with return warranty. Would you like to proceed with direct cart checkout or have any other questions?`
          : `Thanks for the message! Yes, this item is available. Where are you located so we can arrange a physical inspection before you pay?`;

        const replyMsg: ChatMessage = {
          id: `msg-rep-${Date.now()}`,
          senderRole: 'seller',
          senderName: thread.sellerName,
          text: autoReplyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        return {
          ...prev,
          [listingId]: {
            ...thread,
            messages: [...thread.messages, replyMsg],
            lastMessageAt: new Date().toISOString()
          }
        };
      });
    }, 900);
  };

  // Shop Owner: Add Product
  const postProduct = (data: Omit<Product, 'id' | 'createdAt' | 'salesCount'>) => {
    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      salesCount: 0
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  // Feature Product
  const featureProduct = (productId: string): boolean => {
    const product = products.find((p) => p.id === productId);
    if (!product) return false;

    const featurePrice = platformSettings.featureProductPriceNgn;
    const newTx: TransactionRecord = {
      id: `tx-feat-${Date.now()}`,
      type: 'feature_product',
      amountNgn: featurePrice,
      description: `Featured Product Boost (7 Days): ${product.title}`,
      reference: `REF-FEAT-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      userEmail: currentUser.email || 'merchant@market.ng',
      status: 'approved',
      approvedBy: 'Auto-Gateway Verified'
    };

    setTransactions((prev) => [newTx, ...prev]);
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              isFeatured: true,
              featuredUntil: new Date(Date.now() + 7 * 86400000).toISOString()
            }
          : p
      )
    );
    return true;
  };

  // Advertiser: Post an advertisement
  const postAdvertisement = (
    data: Omit<Advertisement, 'id' | 'createdAt' | 'status' | 'advertiserId'>
  ): { success: boolean; error?: string; pendingApproval?: boolean } => {
    const userSub = adSubscriptions[currentUser.id] || adSubscriptions['usr-adv-chinedu'];

    if (!userSub || userSub.remainingAds <= 0) {
      return {
        success: false,
        error: `You need an active advertisement subscription. Pay ₦${platformSettings.adPackagePriceNgn.toLocaleString()} for a bundle of ${platformSettings.adPackageCount} advertisements before posting.`
      };
    }

    const requiresReview = platformSettings.requireAdApproval;

    const newAd: Advertisement = {
      ...data,
      id: `ad-${Date.now()}`,
      advertiserId: currentUser.id,
      createdAt: new Date().toISOString(),
      status: requiresReview ? 'pending_review' : 'active'
    };

    // Deduct 1 ad credit from subscription
    const updatedSub: AdSubscription = {
      ...userSub,
      adsUsed: userSub.adsUsed + 1,
      remainingAds: userSub.remainingAds - 1,
      status: userSub.remainingAds - 1 <= 0 ? 'exhausted' : 'active'
    };

    setAdSubscriptions((prev) => ({
      ...prev,
      [userSub.advertiserId]: updatedSub
    }));

    setAdvertisements((prev) => [newAd, ...prev]);
    return { success: true, pendingApproval: requiresReview };
  };

  // Buy Ad Subscription (₦1,000 for 5 Ads)
  const buyAdSubscription = (advertiserId = currentUser.id) => {
    const existing = adSubscriptions[advertiserId];
    const price = platformSettings.adPackagePriceNgn;
    const count = platformSettings.adPackageCount;

    const newTx: TransactionRecord = {
      id: `tx-sub-${Date.now()}`,
      type: 'ad_subscription',
      amountNgn: price,
      description: `Classified Ad Bundle (${count} Ads Subscription)`,
      reference: `REF-SUB-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      userEmail: currentUser.email || 'advertiser@market.ng',
      status: 'approved',
      approvedBy: 'Paystack Automated'
    };

    const newSubscription: AdSubscription = {
      id: `sub-${Date.now()}`,
      advertiserId,
      packageName: `Standard Ad Bundle (${count} Ads)`,
      priceNgn: price,
      totalAdsAllowed: (existing?.remainingAds || 0) + count,
      adsUsed: existing ? existing.adsUsed : 0,
      remainingAds: (existing?.remainingAds || 0) + count,
      purchaseDate: new Date().toISOString().split('T')[0],
      expiresDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'active'
    };

    setTransactions((prev) => [newTx, ...prev]);
    setAdSubscriptions((prev) => ({
      ...prev,
      [advertiserId]: newSubscription
    }));
  };

  // Feature an Advertisement
  const featureAdvertisement = (adId: string): boolean => {
    const ad = advertisements.find((a) => a.id === adId);
    if (!ad) return false;

    const featurePrice = platformSettings.featureAdPriceNgn;
    const newTx: TransactionRecord = {
      id: `tx-feat-ad-${Date.now()}`,
      type: 'feature_ad',
      amountNgn: featurePrice,
      description: `Featured Classified Boost (7 Days): ${ad.title}`,
      reference: `REF-ADBOOST-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      userEmail: ad.advertiserEmail,
      status: 'approved',
      approvedBy: 'Paystack Automated'
    };

    setTransactions((prev) => [newTx, ...prev]);
    setAdvertisements((prev) =>
      prev.map((a) =>
        a.id === adId
          ? {
              ...a,
              isFeatured: true,
              featuredUntil: new Date(Date.now() + 7 * 86400000).toISOString()
            }
          : a
      )
    );
    return true;
  };

  // Checkout Cart
  const checkoutCart = (buyer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
  }): Order => {
    const orderItems: OrderItem[] = cart.map((item) => ({
      productId: item.product.id,
      title: item.product.title,
      price: item.product.price,
      quantity: item.quantity,
      shopId: item.product.shopId,
      shopName: item.product.shopName
    }));

    let platformCommission = 0;
    if (platformSettings.activeCommissionModel === 'percentage') {
      platformCommission = Math.round((cartTotal * platformSettings.commissionRatePercent) / 100);
    } else {
      platformCommission = platformSettings.flatFeePerSaleNgn * orderItems.length;
    }

    const merchantPayout = cartTotal - platformCommission;

    const newOrder: Order = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      buyerName: buyer.name,
      buyerPhone: buyer.phone,
      buyerEmail: buyer.email,
      deliveryAddress: buyer.address,
      city: buyer.city,
      state: buyer.state,
      items: orderItems,
      totalAmount: cartTotal,
      platformCommission,
      merchantPayout,
      status: 'confirmed',
      paymentStatus: 'paid_escrow',
      createdAt: new Date().toISOString()
    };

    const commissionTx: TransactionRecord = {
      id: `tx-comm-${Date.now()}`,
      type: 'product_sale_commission',
      amountNgn: platformCommission,
      description: `${platformSettings.activeCommissionModel === 'percentage' ? `${platformSettings.commissionRatePercent}%` : `₦${platformSettings.flatFeePerSaleNgn} Flat`} Commission on Order ${newOrder.id}`,
      reference: `REF-COMM-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      userEmail: buyer.email,
      status: 'approved',
      approvedBy: 'Escrow Engine'
    };

    // Pending payout record for merchant (needs admin release)
    const payoutTx: TransactionRecord = {
      id: `tx-payout-${Date.now()}`,
      type: 'merchant_payout',
      amountNgn: merchantPayout,
      description: `Escrow Net Payout for Order ${newOrder.id} to Merchant`,
      reference: `PAYOUT-ESCROW-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      userEmail: buyer.email,
      status: 'pending_approval' // Admin will approve in Admin Dashboard
    };

    setProducts((prev) =>
      prev.map((prod) => {
        const item = cart.find((c) => c.product.id === prod.id);
        if (item) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - item.quantity),
            salesCount: prod.salesCount + item.quantity
          };
        }
        return prod;
      })
    );

    setShops((prev) =>
      prev.map((s) => {
        const shopOrderItems = orderItems.filter((i) => i.shopId === s.id);
        if (shopOrderItems.length > 0) {
          const shopSaleSum = shopOrderItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
          return {
            ...s,
            totalSalesCount: s.totalSalesCount + shopOrderItems.length,
            totalSalesAmount: s.totalSalesAmount + shopSaleSum
          };
        }
        return s;
      })
    );

    setTransactions((prev) => [commissionTx, payoutTx, ...prev]);
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  // Submit Shop Verification Request
  const submitShopVerification = (data: Omit<VerificationRequest, 'id' | 'status' | 'submittedAt'>) => {
    const newReq: VerificationRequest = {
      ...data,
      id: `req-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };
    setVerificationRequests((prev) => [newReq, ...prev]);
  };

  // Admin Approvals:
  // 1. Approve Shop Verification
  const approveShopVerification = (requestId: string, adminName = currentUser.name) => {
    const req = verificationRequests.find((r) => r.id === requestId);
    if (!req) return;

    const badgeNum = `NG-VER-${Math.floor(10000 + Math.random() * 90000)}`;
    const verifiedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // Update existing shop or create new verified shop
    if (req.shopId) {
      setShops((prev) =>
        prev.map((s) =>
          s.id === req.shopId
            ? {
                ...s,
                isVerified: true,
                verificationBadgeNumber: badgeNum,
                verifiedDate
              }
            : s
        )
      );
    } else {
      const newShop: Shop = {
        id: `shop-${Date.now()}`,
        name: req.shopName,
        slug: req.shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        ownerId: currentUser.id,
        ownerName: req.ownerName,
        phone: req.phone,
        email: req.email,
        state: 'Lagos',
        city: 'Ikeja',
        address: req.address,
        description: `Verified retail merchant registered under CAC ${req.businessRegNumber}. Verified identity via ${req.idType}.`,
        logoUrl: '/src/assets/images/hero_marketplace_nigeria_1793094442016.jpg',
        bannerUrl: '/src/assets/images/hero_marketplace_nigeria_1793094442016.jpg',
        isVerified: true,
        verificationBadgeNumber: badgeNum,
        verifiedDate,
        rating: 5.0,
        reviewCount: 1,
        commissionType: platformSettings.activeCommissionModel,
        commissionValue: platformSettings.activeCommissionModel === 'percentage' ? platformSettings.commissionRatePercent : platformSettings.flatFeePerSaleNgn,
        totalSalesCount: 0,
        totalSalesAmount: 0,
        subscriptionPlan: 'commission_only'
      };
      setShops((prev) => [newShop, ...prev]);
    }

    setVerificationRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'approved',
              reviewedAt: new Date().toISOString(),
              reviewedBy: adminName
            }
          : r
      )
    );
  };

  // 2. Reject Shop Verification
  const rejectShopVerification = (requestId: string, reason = 'Document verification failed') => {
    setVerificationRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'rejected',
              reviewedAt: new Date().toISOString(),
              reviewedBy: currentUser.name,
              notes: reason
            }
          : r
      )
    );
  };

  // 3. Approve Classified Advertisement
  const approveAdvertisement = (adId: string, adminName = currentUser.name) => {
    setAdvertisements((prev) =>
      prev.map((a) =>
        a.id === adId
          ? {
              ...a,
              status: 'active',
              approvedAt: new Date().toISOString(),
              reviewedBy: adminName
            }
          : a
      )
    );
  };

  // 4. Reject Classified Advertisement
  const rejectAdvertisement = (adId: string, reason = 'Violation of content policy') => {
    setAdvertisements((prev) =>
      prev.map((a) =>
        a.id === adId
          ? {
              ...a,
              status: 'rejected',
              rejectionReason: reason,
              reviewedBy: currentUser.name
            }
          : a
      )
    );
  };

  // 5. Approve Transaction Payment / Escrow release
  const approveTransactionPayment = (txId: string, adminName = currentUser.name) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txId
          ? {
              ...t,
              status: 'approved',
              approvedBy: adminName
            }
          : t
      )
    );
  };

  const rejectTransactionPayment = (txId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'rejected' } : t))
    );
  };

  // 6. Release Merchant Order Payout
  const approveMerchantOrderPayout = (orderId: string, adminName = currentUser.name) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              paymentStatus: 'payout_released'
            }
          : o
      )
    );

    // Also update any matching pending payout transaction
    setTransactions((prev) =>
      prev.map((t) =>
        t.description.includes(orderId) && t.type === 'merchant_payout'
          ? { ...t, status: 'approved', approvedBy: adminName }
          : t
      )
    );
  };

  // 7. Admin Staff Roles Management
  const addAdminStaff = (staffData: Omit<AdminStaffMember, 'id' | 'createdAt'>) => {
    const newStaff: AdminStaffMember = {
      ...staffData,
      id: `adm-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setAdminStaff((prev) => [newStaff, ...prev]);

    // Also register user account so they can log in
    const newUser: UserAccount = {
      id: `usr-adm-${Date.now()}`,
      name: staffData.name,
      email: staffData.email,
      phone: '+234 800 000 0000',
      accountType: 'admin',
      adminRole: staffData.role,
      createdAt: new Date().toISOString()
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const removeAdminStaff = (staffId: string) => {
    setAdminStaff((prev) => prev.filter((s) => s.id !== staffId));
  };

  // 8. Shop Staff Roles Management
  const addShopStaff = (shopId: string, staffData: Omit<ShopStaffMember, 'id' | 'shopId' | 'joinedAt'>) => {
    const newStaff: ShopStaffMember = {
      ...staffData,
      id: `staff-${Date.now()}`,
      shopId,
      joinedAt: new Date().toISOString().split('T')[0]
    };
    setShopStaff((prev) => [newStaff, ...prev]);

    // Add user account for staff member
    const newUser: UserAccount = {
      id: `usr-staff-${Date.now()}`,
      name: staffData.name,
      email: staffData.email,
      phone: staffData.phone,
      accountType: 'shop_owner',
      shopId,
      shopStaffRole: staffData.role,
      createdAt: new Date().toISOString()
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const removeShopStaff = (staffId: string) => {
    setShopStaff((prev) => prev.filter((s) => s.id !== staffId));
  };

  const updatePlatformSettings = (newSettings: Partial<PlatformSettings>) => {
    setPlatformSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const deleteAdvertisement = (adId: string) => {
    setAdvertisements((prev) => prev.filter((a) => a.id !== adId));
  };

  const reportAdvertisement = (adId: string, reason: string) => {
    setAdvertisements((prev) =>
      prev.map((a) => (a.id === adId ? { ...a, status: 'flagged' } : a))
    );
  };

  const resetDemoData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_users`);
    localStorage.removeItem(`${STORAGE_KEY}_current_user_id`);
    localStorage.removeItem(`${STORAGE_KEY}_admin_staff`);
    localStorage.removeItem(`${STORAGE_KEY}_shop_staff`);
    localStorage.removeItem(`${STORAGE_KEY}_shops`);
    localStorage.removeItem(`${STORAGE_KEY}_products`);
    localStorage.removeItem(`${STORAGE_KEY}_advertisements`);
    localStorage.removeItem(`${STORAGE_KEY}_subscriptions`);
    localStorage.removeItem(`${STORAGE_KEY}_verifications`);
    localStorage.removeItem(`${STORAGE_KEY}_transactions`);
    localStorage.removeItem(`${STORAGE_KEY}_orders`);
    localStorage.removeItem(`${STORAGE_KEY}_settings`);

    setUsers(INITIAL_USERS);
    setCurrentUserId('usr-admin-super');
    setAdminStaff(INITIAL_ADMIN_STAFF);
    setShopStaff(INITIAL_SHOP_STAFF);
    setShops(INITIAL_SHOPS);
    setProducts(INITIAL_PRODUCTS);
    setAdvertisements(INITIAL_ADVERTISEMENTS);
    setAdSubscriptions(INITIAL_AD_SUBSCRIPTIONS);
    setVerificationRequests(INITIAL_VERIFICATION_REQUESTS);
    setOrders(INITIAL_ORDERS);
    setTransactions(INITIAL_TRANSACTIONS);
    setPlatformSettings(INITIAL_PLATFORM_SETTINGS);
    setCart([]);
  };

  return (
    <MarketplaceContext.Provider
      value={{
        currentUser,
        users,
        adminStaff,
        shopStaff,
        loginAsUser,
        registerUser,
        logout,
        currentRole,
        setCurrentRole,
        currentShop,
        shops,
        products,
        advertisements,
        adSubscriptions,
        verificationRequests,
        transactions,
        orders,
        platformSettings,
        cart,
        cartCount,
        cartTotal,
        currentAdvertiserSubscription,
        chatThreads,
        activeChatThread,
        openChat,
        closeChat,
        sendChatMessage,
        addToCart,
        removeFromCart,
        clearCart,
        postProduct,
        featureProduct,
        postAdvertisement,
        buyAdSubscription,
        featureAdvertisement,
        checkoutCart,
        submitShopVerification,
        approveShopVerification,
        rejectShopVerification,
        approveAdvertisement,
        rejectAdvertisement,
        approveTransactionPayment,
        rejectTransactionPayment,
        approveMerchantOrderPayout,
        addAdminStaff,
        removeAdminStaff,
        addShopStaff,
        removeShopStaff,
        updatePlatformSettings,
        deleteAdvertisement,
        reportAdvertisement,
        resetDemoData
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
