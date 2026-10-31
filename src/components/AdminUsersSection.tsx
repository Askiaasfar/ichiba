import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Mail,
  Phone,
  Lock,
  Unlock,
  Key,
  Globe,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
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

interface UserItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  accountType: 'buyer' | 'shop_owner' | 'advertiser' | 'admin' | 'staff';
  registrationSource?: 'google' | 'facebook' | 'email' | 'phone';
  authProviders?: string[];
  status?: 'active' | 'suspended' | 'pending_approval';
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  kycStatus?: string;
  createdAt: string;
}

interface AnalyticsData {
  totalUsers: number;
  newToday: number;
  newThisWeek: number;
  newThisMonth: number;
  activeUsers: number;
  inactiveUsers: number;
  verifiedUsers: number;
  suspendedUsers: number;
  buyers: number;
  merchants: number;
  advertisers: number;
  staff: number;
  growthTimeline: { date: string; users: number; newUsers: number }[];
  registrationSources: { source: string; count: number }[];
}

export const AdminUsersSection: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, usersRes] = await Promise.all([
        fetch('/api/admin/users/analytics'),
        fetch('/api/admin/users')
      ]);

      const aData = await analyticsRes.json();
      const uData = await usersRes.json();

      if (aData.success && aData.analytics) {
        setAnalytics(aData.analytics);
      }
      if (uData.success && Array.isArray(uData.users)) {
        setUsers(uData.users);
      }
    } catch (err) {
      console.warn('Failed to fetch admin users data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'suspended') => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
        );
        setActionMessage({
          text: `User account ${newStatus === 'active' ? 'reactivated' : 'suspended'} successfully.`,
          type: 'success'
        });
        setTimeout(() => setActionMessage(null), 3000);
      } else {
        setActionMessage({ text: data.message || 'Action failed.', type: 'error' });
      }
    } catch (err: any) {
      setActionMessage({ text: err.message, type: 'error' });
    }
  };

  const handleRevokeSessions = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/revoke-sessions`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({ text: 'All active sessions revoked for this user.', type: 'success' });
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err: any) {
      setActionMessage({ text: err.message, type: 'error' });
    }
  };

  const filteredUsers = users.filter((u) => {
    if (typeFilter !== 'all' && u.accountType !== typeFilter) return false;
    if (statusFilter !== 'all') {
      const s = u.status || 'active';
      if (s !== statusFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = u.name.toLowerCase().includes(q);
      const emailMatch = u.email.toLowerCase().includes(q);
      const phoneMatch = u.phone ? u.phone.includes(q) : false;
      return nameMatch || emailMatch || phoneMatch;
    }
    return true;
  });

  const pieColors = ['#4285F4', '#1877F2', '#D4AF37', '#10B981'];

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      {/* Action Notification Toast */}
      {actionMessage && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-red-50 text-red-800 border-red-300'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-500 hover:text-black">
            ✕
          </button>
        </div>
      )}

      {/* Top Founder Analytics Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</span>
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950 font-mono-numbers mt-2">
            {analytics?.totalUsers?.toLocaleString() || users.length}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            +{analytics?.newThisMonth || 4} new this month
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New Registrations</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950 font-mono-numbers mt-2">
            {analytics?.newThisWeek || 3}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Today: <strong className="text-slate-800">{analytics?.newToday || 1}</strong>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Merchants</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950 font-mono-numbers mt-2">
            {analytics?.merchants || 2}
          </div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">
            CAC + Representative verified
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Health</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono-numbers mt-2">
            {analytics?.activeUsers || users.length} Active
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Suspended: <strong className="text-red-600">{analytics?.suspendedUsers || 0}</strong>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Growth Over Time */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">User Growth &amp; Registrations</h3>
              <p className="text-xs text-slate-500">Cumulative user base expansion across 2026-2027</p>
            </div>
            <button
              onClick={fetchUserData}
              className="p-1.5 text-slate-400 hover:text-black rounded-lg hover:bg-slate-100 transition-colors"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analytics?.growthTimeline || [
                  { date: 'Jun', users: 1, newUsers: 1 },
                  { date: 'Jul', users: 2, newUsers: 1 },
                  { date: 'Aug', users: 3, newUsers: 1 },
                  { date: 'Sep', users: 5, newUsers: 2 },
                  { date: 'Oct', users: 8, newUsers: 3 },
                  { date: 'Now', users: 12, newUsers: 4 }
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="goldGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A0A0A',
                    borderColor: '#D4AF37',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 12
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  name="Total Users"
                  stroke="#D4AF37"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#goldGrowth)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Registration Sources Pie Chart */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Registration Providers</h3>
            <p className="text-xs text-slate-500">Universal auth breakdown</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.registrationSources || [
                    { source: 'Google', count: 5 },
                    { source: 'Email', count: 4 },
                    { source: 'Phone', count: 2 },
                    { source: 'Facebook', count: 1 }
                  ]}
                  dataKey="count"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {(analytics?.registrationSources || [1, 2, 3, 4]).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A0A0A',
                    borderColor: '#333',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 11
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4]" />
              <span className="text-slate-600">Google OAuth</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2]" />
              <span className="text-slate-600">Facebook</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
              <span className="text-slate-600">Email Auth</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <span className="text-slate-600">Phone OTP</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">User Directory &amp; Governance</h3>
            <p className="text-xs text-slate-500">
              Manage accounts, verify identities, suspend or reactivate platform access.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-emerald-500"
              />
            </div>

            {/* Account Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
            >
              <option value="all">All Roles</option>
              <option value="buyer">Buyers</option>
              <option value="shop_owner">Merchants</option>
              <option value="advertiser">Advertisers</option>
              <option value="staff">Staff Officers</option>
              <option value="admin">Administrators</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="px-5 py-3">User &amp; Contact</th>
                <th className="px-4 py-3">Role &amp; Type</th>
                <th className="px-4 py-3">Auth Source</th>
                <th className="px-4 py-3">KYC Status</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-5 py-3 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSuspended = u.status === 'suspended';
                  const isFounder = u.email.toLowerCase() === 'askiasventures@gmail.com';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Contact */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{u.email}</span>
                        </div>
                        {u.phone && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                          u.accountType === 'admin'
                            ? 'bg-[#D4AF37]/20 text-[#9A7D0A] border border-[#D4AF37]/40'
                            : u.accountType === 'shop_owner'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : u.accountType === 'advertiser'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : u.accountType === 'staff'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {u.accountType === 'shop_owner'
                            ? 'Verified Merchant'
                            : u.accountType === 'advertiser'
                            ? 'Advertiser'
                            : u.accountType === 'admin'
                            ? 'Super Admin'
                            : u.accountType}
                        </span>
                      </td>

                      {/* Auth Source */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
                          {u.registrationSource === 'google' ? (
                            <span className="text-blue-600 font-semibold flex items-center gap-1">
                              Google
                            </span>
                          ) : u.registrationSource === 'facebook' ? (
                            <span className="text-[#1877F2] font-semibold flex items-center gap-1">
                              Facebook
                            </span>
                          ) : u.registrationSource === 'phone' ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              Phone OTP
                            </span>
                          ) : (
                            <span className="text-slate-700 font-semibold flex items-center gap-1">
                              Email / Pass
                            </span>
                          )}
                        </div>
                      </td>

                      {/* KYC Status */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                          u.kycStatus === 'verified'
                            ? 'text-emerald-700'
                            : u.kycStatus === 'pending'
                            ? 'text-amber-700'
                            : 'text-slate-400'
                        }`}>
                          {u.kycStatus === 'verified' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Verified</span>
                            </>
                          ) : u.kycStatus === 'pending' ? (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              <span>In Review</span>
                            </>
                          ) : (
                            <span>Standard</span>
                          )}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          isSuspended
                            ? 'bg-red-100 text-red-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        {!isFounder && (
                          <>
                            {isSuspended ? (
                              <button
                                onClick={() => handleStatusChange(u.id, 'active')}
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                Reactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(u.id, 'suspended')}
                                className="px-2.5 py-1 bg-red-50 text-red-800 hover:bg-red-100 border border-red-200 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                Suspend
                              </button>
                            )}

                            <button
                              onClick={() => handleRevokeSessions(u.id)}
                              className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded text-[11px] font-medium transition-colors cursor-pointer"
                              title="Force sign out on all devices"
                            >
                              Revoke Sessions
                            </button>
                          </>
                        )}
                        {isFounder && (
                          <span className="text-[11px] text-[#D4AF37] font-bold">
                            Founder (Protected)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
