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
  ChatThread,
  StaffApplicationRequest,
  StaffCompensationRecord,
  AccountTypeConfig,
  AccountType,
  AppNotification
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
  INITIAL_TRANSACTIONS,
  INITIAL_STAFF_APPLICATIONS,
  INITIAL_STAFF_COMPENSATION,
  INITIAL_ACCOUNT_TYPES
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
  staffApplications: StaffApplicationRequest[];
  staffCompensation: StaffCompensationRecord[];
  accountTypes: AccountTypeConfig[];
  isSuperAdmin: boolean;
  serverAdminSession: { authenticated: boolean; email?: string; name?: string; role?: string; avatarUrl?: string } | null;
  checkServerAdminSession: () => Promise<boolean>;
  loginSuperAdminWithGoogle: (credential: string) => Promise<{ success: boolean; error?: string; unauthorizedEmail?: string }>;
  loginWithGoogleToken: (credential: string) => Promise<{ success: boolean; user?: any; error?: string; unauthorizedEmail?: string; pendingApproval?: boolean }>;
  loginWithEmailOrPhone: (emailOrPhone: string, password: string) => Promise<{ success: boolean; user?: any; error?: string; pendingApproval?: boolean }>;
  registerUniversal: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    accountType: 'buyer' | 'shop_owner' | 'advertiser';
    shopDetails?: {
      shopName: string;
      cacNumber: string;
      idType: string;
      idNumber: string;
      address: string;
      city: string;
      state: string;
      description: string;
    };
  }) => Promise<{ success: boolean; user?: any; error?: string }>;
  requestOtp: (target: string, type: 'email' | 'phone') => Promise<{ success: boolean; message?: string; error?: string }>;
  verifyOtp: (target: string, code: string, type?: 'email' | 'phone') => Promise<{ success: boolean; message?: string; error?: string }>;
  resetPasswordWithOtp: (emailOrPhone: string, code: string, newPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  submitMerchantKyc: (data: any) => Promise<{ success: boolean; record?: any; error?: string }>;
  syncServerAdminSession: (user: { email: string; name: string; role: string; avatarUrl?: string }) => void;
  loginAsUser: (userId: string) => void;
  loginSuperAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (data: {
    name: string;
    email: string;
    phone: string;
    accountCategory: 'buyer' | 'shop_owner' | 'advertiser';
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
  toggleWishlist: (productId: string) => void;

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
  
  // Real-Time Notifications & Interaction
  notifications: AppNotification[];
  unreadNotificationCount: number;
  activeToast: AppNotification | null;
  dismissToast: () => void;
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  trackProductView: (productId: string) => Promise<void>;
  linkSocialAccount: (provider: string, identifier: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  requestPushPermission: () => Promise<boolean>;

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
  
  // Staff applications & Compensation
  submitStaffApplication: (data: Omit<StaffApplicationRequest, 'id' | 'submittedAt' | 'status'>) => void;
  approveStaffApplication: (id: string, role: AdminRole, jobTitle: string, department: string, permissions: string[], reviewerName?: string) => void;
  rejectStaffApplication: (id: string, reason: string, reviewerName?: string) => void;
  updateStaffCompensation: (record: StaffCompensationRecord) => void;
  processStaffPayout: (compensationId: string, amountNgn: number, reference: string, approvedBy: string) => void;
  updateAccountTypeConfig: (id: AccountType, updates: Partial<AccountTypeConfig>) => void;

  // Shop owner staff management
  addShopStaff: (shopId: string, staffData: Omit<ShopStaffMember, 'id' | 'shopId' | 'joinedAt'>) => void;
  removeShopStaff: (staffId: string) => void;
  
  updatePlatformSettings: (settings: Partial<PlatformSettings>) => void;
  deleteAdvertisement: (adId: string) => void;
  reportAdvertisement: (adId: string, reason: string) => void;
  resetDemoData: () => void;
}

const STORAGE_KEY = 'ASKIA_MARKET_v1';

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Users state
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Current logged in user (defaults to Buyer; Super Admin requires explicit password login)
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_current_user_id`);
    if (saved && users.some((u) => u.id === saved)) {
      return saved;
    }
    const defaultBuyer = INITIAL_USERS.find((u) => u.accountType === 'buyer');
    return defaultBuyer ? defaultBuyer.id : INITIAL_USERS[0].id;
  });

  const currentUser = users.find((u) => u.id === currentUserId) || users.find((u) => u.accountType === 'buyer') || users[0];
  const isSuperAdmin = (currentUser?.email?.toLowerCase() === 'askiasventures@gmail.com' || currentUser?.email?.toLowerCase() === 'askiabusiness18@gmail.com') && currentUser?.accountType === 'admin';

  // Verified server-side Super Admin session from HTTP-only cookie
  const [serverAdminSession, setServerAdminSession] = useState<{
    authenticated: boolean;
    email?: string;
    name?: string;
    role?: string;
    avatarUrl?: string;
  } | null>(null);

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

  // Staff applications queue (Workflow B)
  const [staffApplications, setStaffApplications] = useState<StaffApplicationRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_staff_applications`);
    return saved ? JSON.parse(saved) : INITIAL_STAFF_APPLICATIONS;
  });

  // Staff compensation & payroll ledger (isolated from customer escrow)
  const [staffCompensation, setStaffCompensation] = useState<StaffCompensationRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_staff_compensation`);
    return saved ? JSON.parse(saved) : INITIAL_STAFF_COMPENSATION;
  });

  // Account types policies & registration availability
  const [accountTypes, setAccountTypes] = useState<AccountTypeConfig[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_account_types`);
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNT_TYPES;
  });

  const normalizeSavedJson = <T,>(savedStr: string | null, fallback: T): T => {
    if (!savedStr) return fallback;
    try {
      const cleaned = savedStr.replace(/\/src\/assets\/images\//g, '/assets/images/');
      return JSON.parse(cleaned);
    } catch {
      return fallback;
    }
  };

  // Role synced with currentUser.accountType
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (currentUser.accountType as UserRole) || 'buyer';
  });

  // Shops (auto-migrating legacy /src/ image paths)
  const [shops, setShops] = useState<Shop[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_shops`);
    return normalizeSavedJson(saved, INITIAL_SHOPS);
  });

  // Products (auto-migrating legacy /src/ image paths)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
    return normalizeSavedJson(saved, INITIAL_PRODUCTS);
  });

  // Advertisements (auto-migrating legacy /src/ image paths)
  const [advertisements, setAdvertisements] = useState<Advertisement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_advertisements`);
    return normalizeSavedJson(saved, INITIAL_ADVERTISEMENTS);
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

  // In-app notifications & SSE real-time connection
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : [];
  });
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const dismissToast = () => setActiveToast(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications?userId=${encodeURIComponent(currentUser?.id || '')}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(data.notifications));
      }
    } catch {
      // offline fallback
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchNotifications();
    }
  }, [currentUser?.id]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
  }, [notifications]);

  // Real-Time SSE Stream for Instant Push & In-App Toast
  useEffect(() => {
    if (!currentUser?.id) return;

    let es: EventSource | null = null;
    try {
      es = new EventSource(`/api/notifications/stream?userId=${encodeURIComponent(currentUser.id)}`);

      es.addEventListener('notification', (e: MessageEvent) => {
        try {
          const notif: AppNotification = JSON.parse(e.data);
          setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== notif.id)]);
          setActiveToast(notif);
          setTimeout(() => {
            setActiveToast((curr) => (curr?.id === notif.id ? null : curr));
          }, 6000);
        } catch (err) {
          console.error('SSE notification parse error:', err);
        }
      });

      es.addEventListener('chat_message', (e: MessageEvent) => {
        try {
          const chatMsg = JSON.parse(e.data);
          if (chatMsg.threadId) {
            setChatThreads((prev) => {
              const thread = prev[chatMsg.threadId];
              if (!thread) return prev;
              const alreadyHas = thread.messages.some((m) => m.id === chatMsg.id);
              if (alreadyHas) return prev;
              return {
                ...prev,
                [chatMsg.threadId]: {
                  ...thread,
                  messages: [
                    ...thread.messages,
                    {
                      id: chatMsg.id,
                      senderRole: chatMsg.senderRole,
                      senderName: chatMsg.senderName,
                      text: chatMsg.text,
                      timestamp: new Date(chatMsg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    }
                  ],
                  lastMessageAt: chatMsg.createdAt
                }
              };
            });
          }
        } catch (err) {
          console.error('SSE chat_message parse error:', err);
        }
      });
    } catch (err) {
      console.warn('SSE stream error:', err);
    }

    return () => {
      if (es) {
        es.close();
      }
    };
  }, [currentUser?.id]);

  const markNotificationAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    } catch {}
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id })
      });
    } catch {}
  };

  const trackProductView = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success && typeof data.viewCount === 'number') {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, viewCount: data.viewCount } : p))
        );
      }
    } catch {}
  };

  const linkSocialAccount = async (provider: string, identifier: string) => {
    try {
      const res = await fetch('/api/auth/link-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id, provider, identifier })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUsers((prev) => prev.map((u) => (u.id === data.user.id ? data.user : u)));
      }
      return data;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const requestPushPermission = async (): Promise<boolean> => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return false;

      const reg = await navigator.serviceWorker.ready;
      const keyRes = await fetch('/api/notifications/vapid-public-key');
      const keyData = await keyRes.json();

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyData.publicKey
      });

      await fetch('/api/notifications/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub, userId: currentUser?.id })
      });

      return true;
    } catch (err) {
      console.warn('Push registration notification:', err);
      return false;
    }
  };

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

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_staff_applications`, JSON.stringify(staffApplications));
  }, [staffApplications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_staff_compensation`, JSON.stringify(staffCompensation));
  }, [staffCompensation]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_account_types`, JSON.stringify(accountTypes));
  }, [accountTypes]);

  // Determine active shop for current user
  const currentShop = currentUser.shopId
    ? shops.find((s) => s.id === currentUser.shopId)
    : shops[0];

  const currentAdvertiserSubscription = adSubscriptions[currentUser.id] || adSubscriptions['usr-adv-chinedu'];

  // Login handler
  const loginAsUser = (userId: string) => {
    const u = users.find((x) => x.id === userId);
    if (!u) return;
    // Admin account cannot be switched into without explicit super admin password
    if (u.accountType === 'admin') {
      return;
    }
    setCurrentUserId(userId);
    setCurrentRole(u.accountType as UserRole);
  };

  // Check verified server session on boot (Universal for all account types)
  useEffect(() => {
    checkUniversalSession();
  }, []);

  const checkUniversalSession = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/session', { credentials: 'include' });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.authenticated && data.user) {
        applyAuthenticatedUser(data.user, data.isSuperAdmin);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const checkServerAdminSession = async (): Promise<boolean> => {
    return checkUniversalSession();
  };

  const applyAuthenticatedUser = (userData: any, isFounderAdmin?: boolean) => {
    const cleanEmail = (userData.email || '').toLowerCase();
    const isFounder = isFounderAdmin || cleanEmail === 'askiasventures@gmail.com' || cleanEmail === 'askiabusiness18@gmail.com';

    let matchedUser = users.find((u) => u.email.toLowerCase() === cleanEmail || u.id === userData.id);
    if (!matchedUser) {
      matchedUser = {
        id: userData.id || `usr-${Date.now()}`,
        name: userData.name || 'Askia Market Member',
        email: cleanEmail,
        phone: userData.phone || '',
        accountType: userData.accountType || (isFounder ? 'admin' : 'buyer'),
        adminRole: isFounder ? 'super_admin' : userData.adminRole,
        jobTitle: userData.jobTitle || (isFounder ? 'Founder & Super Administrator' : undefined),
        department: userData.department || (isFounder ? 'Executive Office' : undefined),
        permissions: userData.permissions,
        status: userData.status || 'active',
        isEmailVerified: userData.isEmailVerified,
        isPhoneVerified: userData.isPhoneVerified,
        createdAt: userData.createdAt || new Date().toISOString(),
        avatarUrl: userData.avatarUrl || userData.picture
      };
      setUsers((prev) => [matchedUser!, ...prev]);
    } else {
      matchedUser = {
        ...matchedUser,
        name: userData.name || matchedUser.name,
        accountType: userData.accountType || (isFounder ? 'admin' : matchedUser.accountType),
        adminRole: isFounder ? 'super_admin' : (userData.adminRole || matchedUser.adminRole),
        status: userData.status || matchedUser.status,
        avatarUrl: userData.avatarUrl || userData.picture || matchedUser.avatarUrl
      };
      setUsers((prev) => prev.map((u) => (u.id === matchedUser!.id ? matchedUser! : u)));
    }

    setCurrentUserId(matchedUser.id);
    if (isFounder || matchedUser.accountType === 'admin') {
      setCurrentRole('admin');
      setServerAdminSession({
        authenticated: true,
        email: cleanEmail,
        name: matchedUser.name,
        role: 'super_admin',
        avatarUrl: matchedUser.avatarUrl
      });
    } else if (matchedUser.accountType === 'shop_owner') {
      setCurrentRole('shop_owner');
    } else if (matchedUser.accountType === 'advertiser') {
      setCurrentRole('advertiser');
    } else {
      setCurrentRole('buyer');
    }
  };

  const syncServerAdminSession = (user: { email: string; name: string; role: string; avatarUrl?: string }) => {
    applyAuthenticatedUser({ ...user, accountType: 'admin', adminRole: 'super_admin' }, true);
  };

  const loginWithGoogleToken = async (
    credential: string
  ): Promise<{ success: boolean; user?: any; error?: string; unauthorizedEmail?: string; pendingApproval?: boolean }> => {
    try {
      const res = await fetch('/api/auth/google/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ credential })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.message || 'Access Denied: Google verification failed.',
          unauthorizedEmail: data.unauthorizedEmail,
          pendingApproval: data.pendingApproval
        };
      }

      if (data.pendingApproval) {
        return {
          success: true,
          pendingApproval: true,
          user: data.user
        };
      }

      applyAuthenticatedUser(data.user, data.isSuperAdmin);
      return { success: true, user: data.user };
    } catch (err: any) {
      return {
        success: false,
        error: `Server connection error during Google sign-in: ${err.message}`
      };
    }
  };

  const loginSuperAdminWithGoogle = async (
    credential: string
  ): Promise<{ success: boolean; error?: string; unauthorizedEmail?: string }> => {
    const res = await loginWithGoogleToken(credential);
    return {
      success: res.success && !res.pendingApproval,
      error: res.error,
      unauthorizedEmail: res.unauthorizedEmail
    };
  };

  // Universal Sign-In with Email/Phone + Password via Backend
  const loginWithEmailOrPhone = async (
    emailOrPhone: string,
    password: string
  ): Promise<{ success: boolean; user?: any; error?: string; pendingApproval?: boolean }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ emailOrPhone, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.message || 'Invalid credentials. Please verify your details.',
          pendingApproval: data.error === 'pending_approval'
        };
      }

      applyAuthenticatedUser(data.user, data.isSuperAdmin);
      return { success: true, user: data.user };
    } catch (err: any) {
      return {
        success: false,
        error: `Failed to connect to authentication server: ${err.message}`
      };
    }
  };

  // Server-authorized Super Admin Login
  const loginSuperAdmin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const res = await loginWithEmailOrPhone(email, password);
    if (res.success) {
      const isFounder = email.trim().toLowerCase() === 'askiasventures@gmail.com' || email.trim().toLowerCase() === 'askiabusiness18@gmail.com';
      if (!isFounder) {
        return { success: false, error: 'Access Denied: Only authorized Askia Market administrators (askiasventures@gmail.com) are permitted.' };
      }
      return { success: true };
    }
    return { success: false, error: res.error || 'Invalid administrator credentials.' };
  };

  // Universal User Registration
  const registerUniversal = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    accountType: 'buyer' | 'shop_owner' | 'advertiser';
    shopDetails?: any;
  }): Promise<{ success: boolean; user?: any; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        return { success: false, error: resData.message || 'Registration failed.' };
      }

      applyAuthenticatedUser(resData.user, false);
      return { success: true, user: resData.user };
    } catch (err: any) {
      return { success: false, error: `Connection error: ${err.message}` };
    }
  };

  // OTP Request
  const requestOtp = async (target: string, type: 'email' | 'phone'): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: target, type })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.message || 'Failed to request verification code.' };
      }
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // OTP Verification
  const verifyOtp = async (target: string, code: string, type: 'email' | 'phone' = 'email'): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: target, type, code })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.message || 'Invalid or expired code.' };
      }
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Password Reset with OTP
  const resetPasswordWithOtp = async (emailOrPhone: string, code: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone, code, newPassword })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.message || 'Failed to reset password.' };
      }
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Submit Merchant KYC with CAC & NIN
  const submitMerchantKyc = async (data: any): Promise<{ success: boolean; record?: any; error?: string }> => {
    try {
      const res = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        return { success: false, error: resData.message || 'KYC submission failed.' };
      }
      return { success: true, record: resData.record };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    setServerAdminSession({ authenticated: false });

    // Reset current user to guest buyer
    const guestBuyer: UserAccount = {
      id: 'usr-buyer-guest',
      name: 'Customer (Buyer)',
      email: 'buyer@lagos.ng',
      phone: '+234 801 234 5678',
      accountType: 'buyer',
      createdAt: '2026-01-02T00:00:00Z'
    };
    setUsers((prev) => [guestBuyer, ...prev.filter((u) => u.id !== 'usr-buyer-guest')]);
    setCurrentUserId('usr-buyer-guest');
    setCurrentRole('buyer');
  };



  // Toggle saved wishlist item for buyer
  const toggleWishlist = (productId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          const currentWishlist = u.wishlist || [];
          const exists = currentWishlist.includes(productId);
          const nextWishlist = exists
            ? currentWishlist.filter((id) => id !== productId)
            : [...currentWishlist, productId];
          return { ...u, wishlist: nextWishlist };
        }
        return u;
      })
    );
  };

  // Register New User Account (Buyer vs Shop Owner vs Advertiser Category)
  const registerUser = (data: {
    name: string;
    email: string;
    phone: string;
    accountCategory: 'buyer' | 'shop_owner' | 'advertiser';
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
        logoUrl: '/assets/images/hero_marketplace_nigeria_1793094442016.jpg',
        bannerUrl: '/assets/images/hero_marketplace_nigeria_1793094442016.jpg',
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
      createdAt: new Date().toISOString(),
      wishlist: []
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(newUserId);
    setCurrentRole(data.accountCategory as UserRole);

    return newUser;
  };

  // Staff Application Submission (Workflow B)
  const submitStaffApplication = (data: Omit<StaffApplicationRequest, 'id' | 'submittedAt' | 'status'>) => {
    const newApp: StaffApplicationRequest = {
      id: `app-${Date.now()}`,
      ...data,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };
    setStaffApplications((prev) => [newApp, ...prev]);
  };

  // Staff Application Review (Founder Decision)
  const approveStaffApplication = (
    id: string,
    role: AdminRole,
    jobTitle: string,
    department: string,
    permissions: string[],
    reviewerName: string = 'Sensei Askia (Founder)'
  ) => {
    const app = staffApplications.find((a) => a.id === id);
    if (!app) return;

    // Update application record
    setStaffApplications((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'approved',
              reviewedAt: new Date().toISOString(),
              reviewedBy: reviewerName,
              assignedRole: role,
              assignedPermissions: permissions
            }
          : a
      )
    );

    // Create AdminStaffMember
    const newStaffMember: AdminStaffMember = {
      id: `adm-${Date.now()}`,
      name: app.applicantName,
      email: app.applicantEmail,
      role,
      jobTitle,
      department,
      assignedBy: reviewerName,
      permissions,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
      lastActive: 'Just registered'
    };
    setAdminStaff((prev) => [...prev, newStaffMember]);

    // Create staff user account
    const staffUser: UserAccount = {
      id: `usr-staff-${Date.now()}`,
      name: app.applicantName,
      email: app.applicantEmail,
      phone: app.applicantPhone,
      accountType: 'staff',
      adminRole: role,
      jobTitle,
      department,
      permissions,
      createdAt: new Date().toISOString()
    };
    setUsers((prev) => [...prev, staffUser]);
  };

  const rejectStaffApplication = (id: string, reason: string, reviewerName: string = 'Sensei Askia (Founder)') => {
    setStaffApplications((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'rejected',
              reviewedAt: new Date().toISOString(),
              reviewedBy: reviewerName,
              rejectionReason: reason
            }
          : a
      )
    );
  };

  // Update Staff Compensation Record
  const updateStaffCompensation = (record: StaffCompensationRecord) => {
    setStaffCompensation((prev) => {
      const exists = prev.some((c) => c.id === record.id);
      if (exists) {
        return prev.map((c) => (c.id === record.id ? record : c));
      }
      return [...prev, record];
    });
  };

  // Process Staff Payout / Disbursement
  const processStaffPayout = (
    compensationId: string,
    amountNgn: number,
    reference: string,
    approvedBy: string = 'Sensei Askia (Founder)'
  ) => {
    setStaffCompensation((prev) =>
      prev.map((c) => {
        if (c.id === compensationId) {
          const payoutRecord = {
            id: `pay-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            amountNgn,
            status: 'paid' as const,
            reference: reference || `SAL-${c.staffName.toUpperCase().replace(/[^A-Z]/g, '')}-${Date.now().toString().slice(-4)}`,
            approvedBy
          };
          return {
            ...c,
            lastPaymentDate: payoutRecord.date,
            paymentHistory: [payoutRecord, ...c.paymentHistory]
          };
        }
        return c;
      })
    );
  };

  // Update Account Type Config & Policies
  const updateAccountTypeConfig = (id: AccountType, updates: Partial<AccountTypeConfig>) => {
    setAccountTypes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
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
  const cartTotal = cart.reduce((sum, item) => {
    const activePrice =
      item.product.salePrice !== undefined && item.product.salePrice !== null && item.product.salePrice > 0
        ? item.product.salePrice
        : item.product.price;
    return sum + activePrice * item.quantity;
  }, 0);

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

    const thread = chatThreads[listingId];
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderRole: 'buyer',
      senderName: currentUser.name || 'Prospective Buyer',
      text: messageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatThreads((prev) => {
      const t = prev[listingId];
      if (!t) return prev;

      return {
        ...prev,
        [listingId]: {
          ...t,
          messages: [...t.messages, newMsg],
          lastMessageAt: new Date().toISOString()
        }
      };
    });

    // Send to server-authoritative chat & notification engine
    fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        threadId: listingId,
        listingId,
        listingTitle: thread?.listingTitle || 'Marketplace Item',
        senderId: currentUser.id,
        senderName: currentUser.name || 'Prospective Buyer',
        senderRole: 'buyer',
        recipientId: thread?.sellerName || 'Verified Merchant',
        recipientRole: 'seller',
        text: messageText.trim()
      })
    }).catch((err) => console.warn('Real-time chat dispatch note:', err));

    // Realistic automated seller response simulation for instant feedback
    setTimeout(() => {
      setChatThreads((prev) => {
        const t = prev[listingId];
        if (!t) return prev;

        const isVerified = t.isVerifiedSeller;
        const autoReplyText = isVerified
          ? `Thank you for your inquiry! This item is 100% verified in-stock at our store with return warranty. Would you like to proceed with direct cart checkout or have any other questions?`
          : `Thanks for the message! Yes, this item is available. Where are you located so we can arrange a physical inspection before you pay?`;

        const replyMsg: ChatMessage = {
          id: `msg-rep-${Date.now()}`,
          senderRole: 'seller',
          senderName: t.sellerName,
          text: autoReplyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        return {
          ...prev,
          [listingId]: {
            ...t,
            messages: [...t.messages, replyMsg],
            lastMessageAt: new Date().toISOString()
          }
        };
      });
    }, 1100);
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
    const orderItems: OrderItem[] = cart.map((item) => {
      const activeUnitPrice =
        item.product.salePrice !== undefined && item.product.salePrice !== null && item.product.salePrice > 0
          ? item.product.salePrice
          : item.product.price;
      return {
        productId: item.product.id,
        title: item.product.title,
        price: activeUnitPrice,
        quantity: item.quantity,
        shopId: item.product.shopId,
        shopName: item.product.shopName
      };
    });

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
        logoUrl: '/assets/images/hero_marketplace_nigeria_1793094442016.jpg',
        bannerUrl: '/assets/images/hero_marketplace_nigeria_1793094442016.jpg',
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
    localStorage.removeItem(`${STORAGE_KEY}_staff_applications`);
    localStorage.removeItem(`${STORAGE_KEY}_staff_compensation`);
    localStorage.removeItem(`${STORAGE_KEY}_account_types`);

    setUsers(INITIAL_USERS);
    setCurrentUserId('usr-buyer-guest');
    setCurrentRole('buyer');
    setAdminStaff(INITIAL_ADMIN_STAFF);
    setShopStaff(INITIAL_SHOP_STAFF);
    setStaffApplications(INITIAL_STAFF_APPLICATIONS);
    setStaffCompensation(INITIAL_STAFF_COMPENSATION);
    setAccountTypes(INITIAL_ACCOUNT_TYPES);
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
        staffApplications,
        staffCompensation,
        accountTypes,
        isSuperAdmin,
        serverAdminSession,
        checkServerAdminSession,
        loginSuperAdminWithGoogle,
        loginWithGoogleToken,
        loginWithEmailOrPhone,
        registerUniversal,
        requestOtp,
        verifyOtp,
        resetPasswordWithOtp,
        submitMerchantKyc,
        syncServerAdminSession,
        loginAsUser,
        loginSuperAdmin,
        registerUser,
        logout,
        toggleWishlist,
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
        notifications,
        unreadNotificationCount,
        activeToast,
        dismissToast,
        fetchNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        trackProductView,
        linkSocialAccount,
        requestPushPermission,
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
        submitStaffApplication,
        approveStaffApplication,
        rejectStaffApplication,
        updateStaffCompensation,
        processStaffPayout,
        updateAccountTypeConfig,
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
