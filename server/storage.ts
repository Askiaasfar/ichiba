import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import {
  Product,
  Shop,
  Advertisement,
  Order,
  TransactionRecord,
  VerificationRequest,
  PlatformSettings,
  JobListing,
  JobApplication,
  WorkGigRequest,
  GigWorkerResponse,
  ChatThread,
  AppNotification
} from '../src/types/marketplace';

import pg from 'pg';
const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.resolve(ROOT_DIR, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'marketplace_db.json');

// Check for PostgreSQL connection parameters (e.g., Neon, Supabase, Cloud SQL, Railway, RDS)
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
const hasPgConfig = Boolean(
  DATABASE_URL ||
  (process.env.PGHOST && process.env.PGDATABASE) ||
  (process.env.SQL_HOST && process.env.SQL_DATABASE)
);

export interface ServerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  accountType: 'buyer' | 'shop_owner' | 'advertiser' | 'staff' | 'admin';
  adminRole?: string;
  jobTitle?: string;
  department?: string;
  permissions?: string[];
  shopId?: string;
  status: 'active' | 'pending_approval' | 'suspended' | 'revoked';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  kycStatus?: 'not_started' | 'pending' | 'verified' | 'rejected' | 'requires_review';
  createdAt: string;
  avatarUrl?: string;
  authProviders?: ('email' | 'phone' | 'google' | 'facebook')[];
  registrationSource?: 'email' | 'phone' | 'google' | 'facebook';
  googleId?: string;
  facebookId?: string;
  lastLoginAt?: string;
  wishlist?: string[];
}

export interface DatabaseSchema {
  users: ServerUser[];
  shops: Shop[];
  products: Product[];
  advertisements: Advertisement[];
  orders: Order[];
  transactions: TransactionRecord[];
  verificationRequests: VerificationRequest[];
  chatThreads: Record<string, ChatThread>;
  notifications: AppNotification[];
  jobListings: JobListing[];
  jobApplications: JobApplication[];
  workGigs: WorkGigRequest[];
  gigResponses: GigWorkerResponse[];
  platformSettings: PlatformSettings;
  auditLogs: {
    id: string;
    timestamp: string;
    type: string;
    email: string;
    ip: string;
    details: string;
  }[];
}

const DEFAULT_SETTINGS: PlatformSettings = {
  commissionRatePercent: 5.0,
  flatFeePerSaleNgn: 250,
  activeCommissionModel: 'percentage',
  adPackagePriceNgn: 1000,
  adPackageCount: 5,
  featureProductPriceNgn: 1500,
  featureAdPriceNgn: 800,
  requireAdApproval: false
};

function getInitialDatabase(): DatabaseSchema {
  const hash = bcrypt.hashSync('SenseiAskia@2026!', 10);
  return {
    users: [
      {
        id: 'usr-founder-1',
        name: 'Askia Founder',
        email: 'askiasventures@gmail.com',
        phone: '+234 800 000 0001',
        passwordHash: hash,
        accountType: 'admin',
        adminRole: 'super_admin',
        jobTitle: 'Founder & Super Administrator',
        department: 'Executive Office',
        permissions: ['all_permissions', 'manage_admins', 'approve_shops', 'approve_ads', 'approve_payments', 'platform_settings', 'system_security'],
        status: 'active',
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: '2026-01-01T00:00:00Z'
      },
      {
        id: 'usr-staff-ops-1',
        name: 'Askia Operations Staff',
        email: 'askiabusiness18@gmail.com',
        phone: '+234 800 000 0002',
        passwordHash: hash,
        accountType: 'staff',
        adminRole: 'operations_manager',
        jobTitle: 'Operations Officer',
        department: 'Marketplace Operations',
        permissions: ['operations_oversight', 'review_listings'],
        status: 'active',
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: '2026-01-01T00:00:00Z'
      }
    ],
    shops: [],
    products: [],
    advertisements: [],
    orders: [],
    transactions: [],
    verificationRequests: [],
    chatThreads: {},
    notifications: [],
    jobListings: [],
    jobApplications: [],
    workGigs: [],
    gigResponses: [],
    platformSettings: DEFAULT_SETTINGS,
    auditLogs: [
      {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'system_init',
        email: 'askiasventures@gmail.com',
        ip: '127.0.0.1',
        details: 'Production database initialized with zero fake records.'
      }
    ]
  };
}

class StorageEngine {
  private db: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;
  private pool: pg.Pool | null = null;
  private pgReady = false;

  constructor() {
    this.db = this.loadLocal();
    if (hasPgConfig) {
      this.initPostgres().catch((err) => {
        console.warn('[StorageEngine] PostgreSQL initialization notice:', err.message);
      });
    } else {
      console.log('[StorageEngine] Running with local JSON database (data/marketplace_db.json). Note: For multi-instance Cloud Run or distributed serverless deployments, set DATABASE_URL to ensure shared cross-instance persistence.');
    }
  }

  private async initPostgres(): Promise<void> {
    try {
      this.pool = new Pool({
        connectionString: DATABASE_URL || undefined,
        host: process.env.PGHOST || process.env.SQL_HOST,
        port: Number(process.env.PGPORT || process.env.SQL_PORT || 5432),
        database: process.env.PGDATABASE || process.env.SQL_DATABASE,
        user: process.env.PGUSER || process.env.SQL_USER,
        password: process.env.PGPASSWORD || process.env.SQL_PASSWORD,
        ssl: process.env.NODE_ENV === 'production' && !DATABASE_URL.includes('localhost') ? { rejectUnauthorized: false } : undefined,
        max: 10,
        idleTimeoutMillis: 30000
      });

      // Ensure key-value collection table exists
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS askia_collections (
          collection_name VARCHAR(64) PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Load collections from PostgreSQL if populated; otherwise seed with current local state
      const res = await this.pool.query('SELECT collection_name, data FROM askia_collections');
      if (res.rows.length > 0) {
        console.log(`[StorageEngine] Hydrating storage from PostgreSQL (${res.rows.length} collections loaded)`);
        for (const row of res.rows) {
          if (row.collection_name in this.db) {
            (this.db as any)[row.collection_name] = row.data;
          }
        }
      } else {
        console.log('[StorageEngine] PostgreSQL connected. Seeding initial schema from clean production state.');
        await this.syncAllToPostgres();
      }

      this.pgReady = true;
      console.log('[StorageEngine] PostgreSQL durable persistence active and ready.');
    } catch (err: any) {
      console.error('[StorageEngine] Failed to connect to PostgreSQL:', err.message);
      this.pgReady = false;
    }
  }

  private async syncAllToPostgres(): Promise<void> {
    if (!this.pool) return;
    const collections = [
      'users', 'shops', 'products', 'advertisements', 'orders',
      'transactions', 'verificationRequests', 'chatThreads', 'notifications',
      'jobListings', 'jobApplications', 'workGigs', 'gigResponses',
      'platformSettings', 'auditLogs'
    ];
    for (const name of collections) {
      const data = (this.db as any)[name];
      if (data !== undefined) {
        await this.pool.query(
          `INSERT INTO askia_collections (collection_name, data, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (collection_name)
           DO UPDATE SET data = $2, updated_at = NOW();`,
          [name, JSON.stringify(data)]
        ).catch((e: any) => console.error(`[StorageEngine] Error seeding ${name}:`, e.message));
      }
    }
  }

  private async saveToPostgres(): Promise<void> {
    if (!this.pool || !this.pgReady) return;
    try {
      await this.syncAllToPostgres();
    } catch (err: any) {
      console.error('[StorageEngine] PostgreSQL save error:', err.message);
    }
  }

  private loadLocal(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        // Ensure all required collections exist
        const initial = getInitialDatabase();
        return {
          users: Array.isArray(parsed.users) ? parsed.users : initial.users,
          shops: Array.isArray(parsed.shops) ? parsed.shops : [],
          products: Array.isArray(parsed.products) ? parsed.products : [],
          advertisements: Array.isArray(parsed.advertisements) ? parsed.advertisements : [],
          orders: Array.isArray(parsed.orders) ? parsed.orders : [],
          transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
          verificationRequests: Array.isArray(parsed.verificationRequests) ? parsed.verificationRequests : [],
          chatThreads: parsed.chatThreads && typeof parsed.chatThreads === 'object' ? parsed.chatThreads : {},
          notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
          jobListings: Array.isArray(parsed.jobListings) ? parsed.jobListings : [],
          jobApplications: Array.isArray(parsed.jobApplications) ? parsed.jobApplications : [],
          workGigs: Array.isArray(parsed.workGigs) ? parsed.workGigs : [],
          gigResponses: Array.isArray(parsed.gigResponses) ? parsed.gigResponses : [],
          platformSettings: parsed.platformSettings || DEFAULT_SETTINGS,
          auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : []
        };
      }
    } catch (err) {
      console.error('[StorageEngine] Error loading database file, initializing clean database:', err);
    }

    const clean = getInitialDatabase();
    this.saveSync(clean);
    return clean;
  }

  private saveSync(data: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('[StorageEngine] Failed to write database to disk:', err);
    }
  }

  public scheduleSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveSync(this.db);
      if (this.pgReady) {
        this.saveToPostgres().catch(() => {});
      }
      this.saveTimeout = null;
    }, 200);
  }

  public forceSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    this.saveSync(this.db);
    if (this.pgReady) {
      this.saveToPostgres().catch(() => {});
    }
  }

  // --- Users ---
  public getUsers(): ServerUser[] {
    return this.db.users;
  }

  public findUserById(id: string): ServerUser | undefined {
    return this.db.users.find((u) => u.id === id);
  }

  public findUserByEmail(email: string): ServerUser | undefined {
    const clean = email.trim().toLowerCase();
    return this.db.users.find((u) => u.email.trim().toLowerCase() === clean);
  }

  public findUserByPhone(phone: string): ServerUser | undefined {
    const clean = phone.replace(/\s+/g, '');
    return this.db.users.find((u) => u.phone && u.phone.replace(/\s+/g, '') === clean);
  }

  public addUser(user: ServerUser): ServerUser {
    this.db.users.unshift(user);
    this.scheduleSave();
    return user;
  }

  public updateUser(id: string, updates: Partial<ServerUser>): ServerUser | null {
    const idx = this.db.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.db.users[idx] = { ...this.db.users[idx], ...updates };
    this.scheduleSave();
    return this.db.users[idx];
  }

  // --- Shops ---
  public getShops(): Shop[] {
    return this.db.shops;
  }

  public findShopById(id: string): Shop | undefined {
    return this.db.shops.find((s) => s.id === id);
  }

  public findShopByOwnerId(ownerId: string): Shop | undefined {
    return this.db.shops.find((s) => s.ownerId === ownerId);
  }

  public addShop(shop: Shop): Shop {
    this.db.shops.unshift(shop);
    this.scheduleSave();
    return shop;
  }

  public updateShop(id: string, updates: Partial<Shop>): Shop | null {
    const idx = this.db.shops.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.db.shops[idx] = { ...this.db.shops[idx], ...updates };
    this.scheduleSave();
    return this.db.shops[idx];
  }

  // --- Products ---
  public getProducts(): Product[] {
    return this.db.products;
  }

  public findProductById(id: string): Product | undefined {
    return this.db.products.find((p) => p.id === id);
  }

  public addProduct(product: Product): Product {
    this.db.products.unshift(product);
    this.scheduleSave();
    return product;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.db.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.db.products[idx] = { ...this.db.products[idx], ...updates };
    this.scheduleSave();
    return this.db.products[idx];
  }

  public deleteProduct(id: string): boolean {
    const initialLen = this.db.products.length;
    this.db.products = this.db.products.filter((p) => p.id !== id);
    if (this.db.products.length !== initialLen) {
      this.scheduleSave();
      return true;
    }
    return false;
  }

  // --- Advertisements ---
  public getAdvertisements(): Advertisement[] {
    return this.db.advertisements;
  }

  public findAdById(id: string): Advertisement | undefined {
    return this.db.advertisements.find((a) => a.id === id);
  }

  public addAdvertisement(ad: Advertisement): Advertisement {
    this.db.advertisements.unshift(ad);
    this.scheduleSave();
    return ad;
  }

  public updateAdvertisement(id: string, updates: Partial<Advertisement>): Advertisement | null {
    const idx = this.db.advertisements.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.db.advertisements[idx] = { ...this.db.advertisements[idx], ...updates };
    this.scheduleSave();
    return this.db.advertisements[idx];
  }

  public deleteAdvertisement(id: string): boolean {
    const initialLen = this.db.advertisements.length;
    this.db.advertisements = this.db.advertisements.filter((a) => a.id !== id);
    if (this.db.advertisements.length !== initialLen) {
      this.scheduleSave();
      return true;
    }
    return false;
  }

  // --- Orders ---
  public getOrders(): Order[] {
    return this.db.orders;
  }

  public findOrderById(id: string): Order | undefined {
    return this.db.orders.find((o) => o.id === id);
  }

  public addOrder(order: Order): Order {
    this.db.orders.unshift(order);
    this.scheduleSave();
    return order;
  }

  public updateOrder(id: string, updates: Partial<Order>): Order | null {
    const idx = this.db.orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    this.db.orders[idx] = { ...this.db.orders[idx], ...updates };
    this.scheduleSave();
    return this.db.orders[idx];
  }

  // --- Transactions ---
  public getTransactions(): TransactionRecord[] {
    return this.db.transactions;
  }

  public addTransaction(tx: TransactionRecord): TransactionRecord {
    this.db.transactions.unshift(tx);
    this.scheduleSave();
    return tx;
  }

  public updateTransaction(id: string, updates: Partial<TransactionRecord>): TransactionRecord | null {
    const idx = this.db.transactions.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    this.db.transactions[idx] = { ...this.db.transactions[idx], ...updates };
    this.scheduleSave();
    return this.db.transactions[idx];
  }

  // --- Verification Requests ---
  public getVerificationRequests(): VerificationRequest[] {
    return this.db.verificationRequests;
  }

  public addVerificationRequest(req: VerificationRequest): VerificationRequest {
    this.db.verificationRequests.unshift(req);
    this.scheduleSave();
    return req;
  }

  public updateVerificationRequest(id: string, updates: Partial<VerificationRequest>): VerificationRequest | null {
    const idx = this.db.verificationRequests.findIndex((v) => v.id === id);
    if (idx === -1) return null;
    this.db.verificationRequests[idx] = { ...this.db.verificationRequests[idx], ...updates };
    this.scheduleSave();
    return this.db.verificationRequests[idx];
  }

  // --- Jobs ---
  public getJobs(): JobListing[] {
    return this.db.jobListings;
  }

  public findJobById(id: string): JobListing | undefined {
    return this.db.jobListings.find((j) => j.id === id);
  }

  public addJob(job: JobListing): JobListing {
    this.db.jobListings.unshift(job);
    this.scheduleSave();
    return job;
  }

  public updateJob(id: string, updates: Partial<JobListing>): JobListing | null {
    const idx = this.db.jobListings.findIndex((j) => j.id === id);
    if (idx === -1) return null;
    this.db.jobListings[idx] = { ...this.db.jobListings[idx], ...updates };
    this.scheduleSave();
    return this.db.jobListings[idx];
  }

  // --- Job Applications ---
  public getJobApplications(): JobApplication[] {
    return this.db.jobApplications;
  }

  public addJobApplication(app: JobApplication): JobApplication {
    this.db.jobApplications.unshift(app);
    // Increment job application counter
    const job = this.findJobById(app.jobId);
    if (job) {
      job.applicationsCount = (job.applicationsCount || 0) + 1;
    }
    this.scheduleSave();
    return app;
  }

  public updateJobApplication(id: string, updates: Partial<JobApplication>): JobApplication | null {
    const idx = this.db.jobApplications.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.db.jobApplications[idx] = { ...this.db.jobApplications[idx], ...updates };
    this.scheduleSave();
    return this.db.jobApplications[idx];
  }

  // --- Work Gigs ---
  public getWorkGigs(): WorkGigRequest[] {
    return this.db.workGigs;
  }

  public findWorkGigById(id: string): WorkGigRequest | undefined {
    return this.db.workGigs.find((g) => g.id === id);
  }

  public addWorkGig(gig: WorkGigRequest): WorkGigRequest {
    this.db.workGigs.unshift(gig);
    this.scheduleSave();
    return gig;
  }

  public addGigResponse(resp: GigWorkerResponse): GigWorkerResponse {
    this.db.gigResponses.unshift(resp);
    const gig = this.findWorkGigById(resp.gigId);
    if (gig) {
      gig.responsesCount = (gig.responsesCount || 0) + 1;
    }
    this.scheduleSave();
    return resp;
  }

  public getGigResponses(gigId?: string): GigWorkerResponse[] {
    if (gigId) {
      return this.db.gigResponses.filter((r) => r.gigId === gigId);
    }
    return this.db.gigResponses;
  }

  // --- Chats ---
  public getChatThreads(): Record<string, ChatThread> {
    return this.db.chatThreads;
  }

  public saveChatThread(threadId: string, thread: ChatThread): void {
    this.db.chatThreads[threadId] = thread;
    this.scheduleSave();
  }

  // --- Notifications ---
  public getNotifications(userId?: string): AppNotification[] {
    if (userId) {
      return this.db.notifications.filter((n) => n.recipientUserId === userId || !n.recipientUserId);
    }
    return this.db.notifications;
  }

  public addNotification(notification: AppNotification): AppNotification {
    this.db.notifications.unshift(notification);
    if (this.db.notifications.length > 200) {
      this.db.notifications.pop();
    }
    this.scheduleSave();
    return notification;
  }

  public markNotificationAsRead(id: string): boolean {
    const notif = this.db.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.scheduleSave();
      return true;
    }
    return false;
  }

  public markAllNotificationsAsRead(userId: string): void {
    this.db.notifications.forEach((n) => {
      if (n.recipientUserId === userId || !n.recipientUserId) {
        n.read = true;
      }
    });
    this.scheduleSave();
  }

  // --- Settings ---
  public getSettings(): PlatformSettings {
    return this.db.platformSettings;
  }

  public getPlatformSettings(): PlatformSettings {
    return this.db.platformSettings;
  }

  public updateSettings(settings: Partial<PlatformSettings>): PlatformSettings {
    this.db.platformSettings = { ...this.db.platformSettings, ...settings };
    this.scheduleSave();
    return this.db.platformSettings;
  }

  public updatePlatformSettings(settings: Partial<PlatformSettings>): PlatformSettings {
    return this.updateSettings(settings);
  }

  // --- Audit Logs ---
  public logAudit(type: string, email: string, ip: string, details: string): void {
    this.db.auditLogs.unshift({
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      type,
      email,
      ip,
      details
    });
    if (this.db.auditLogs.length > 500) {
      this.db.auditLogs.pop();
    }
    this.scheduleSave();
  }

  public getAuditLogs() {
    return this.db.auditLogs;
  }
}

export const storage = new StorageEngine();
