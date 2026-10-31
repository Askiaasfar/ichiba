import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { AppNotification } from '../types/marketplace';
import { 
  Bell, 
  MessageSquare, 
  ShoppingBag, 
  ShieldCheck, 
  CheckCheck, 
  X, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChatWithSeller?: (threadId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onOpenChatWithSeller
}) => {
  const { 
    notifications, 
    unreadNotificationCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    requestPushPermission
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'messages' | 'orders'>('all');
  const [pushStatus, setPushStatus] = useState<'idle' | 'success' | 'denied'>('idle');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === 'unread') return !notif.read;
    if (activeTab === 'messages') return notif.type === 'chat_message' || notif.type === 'inquiry';
    if (activeTab === 'orders') return notif.type === 'order_update' || notif.type === 'payment_update';
    return true;
  });

  const getIconForType = (type: AppNotification['type']) => {
    switch (type) {
      case 'chat_message':
      case 'inquiry':
        return <MessageSquare className="w-4 h-4 text-[#D4AF37]" />;
      case 'order_update':
      case 'payment_update':
        return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
      case 'kyc_update':
        return <ShieldCheck className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-[#D4AF37]" />;
    }
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.read) {
      markNotificationAsRead(notif.id);
    }
    if (notif.metadata?.threadId && onOpenChatWithSeller) {
      onOpenChatWithSeller(notif.metadata.threadId);
      onClose();
    }
  };

  const handleEnablePush = async () => {
    const granted = await requestPushPermission();
    if (granted) {
      setPushStatus('success');
    } else {
      setPushStatus('denied');
    }
    setTimeout(() => setPushStatus('idle'), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Background click dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md bg-[#0A0A0A] border-l border-[#D4AF37]/30 h-full flex flex-col shadow-2xl z-10 text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-black/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
              <Bell className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                Notifications
                {unreadNotificationCount > 0 && (
                  <span className="bg-[#D4AF37] text-black text-xs font-black px-2 py-0.5 rounded-full">
                    {unreadNotificationCount}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-neutral-400">ASKIA MARKET Live Updates</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadNotificationCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-xs font-medium text-[#D4AF37] hover:text-[#f3cc56] px-2.5 py-1 rounded hover:bg-[#D4AF37]/10 transition-colors flex items-center gap-1 cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Close notifications"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Push Notification Bar */}
        <div className="px-5 py-2.5 bg-neutral-900/80 border-b border-neutral-800 flex items-center justify-between text-xs">
          <span className="text-neutral-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            Instant desktop & mobile push
          </span>
          <button
            onClick={handleEnablePush}
            disabled={pushStatus === 'success'}
            className="text-[11px] font-semibold text-[#D4AF37] hover:underline cursor-pointer"
          >
            {pushStatus === 'success'
              ? 'Push Enabled ✓'
              : pushStatus === 'denied'
              ? 'Permission Denied'
              : 'Enable Push Alerts'}
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex border-b border-neutral-800 px-4 pt-2 bg-black/40">
          {(['all', 'unread', 'messages', 'orders'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-3 text-xs font-medium capitalize border-b-2 transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'border-[#D4AF37] text-[#D4AF37]'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab}
              {tab === 'unread' && unreadNotificationCount > 0 && (
                <span className="ml-1.5 bg-[#D4AF37]/20 text-[#D4AF37] px-1.5 py-0.2 rounded text-[10px] font-bold">
                  {unreadNotificationCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-900/60 p-2 space-y-1">
          {filteredNotifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-neutral-400">
              <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-3">
                <Bell className="w-5 h-5 text-neutral-600" />
              </div>
              <p className="text-sm font-medium text-neutral-300">You're all caught up!</p>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                New buyer inquiries, order milestones, and verification updates will appear here in real time.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 rounded-xl transition-all cursor-pointer relative flex gap-3 ${
                  notif.read
                    ? 'bg-neutral-950/40 hover:bg-neutral-900/50 text-neutral-300'
                    : 'bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-white'
                }`}
              >
                {/* Icon */}
                <div className="shrink-0 mt-0.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                    notif.read ? 'bg-neutral-900 border-neutral-800' : 'bg-black border-[#D4AF37]/40 shadow-xs'
                  }`}>
                    {getIconForType(notif.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h4 className="text-xs font-semibold tracking-tight truncate text-neutral-100">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-neutral-500 flex items-center gap-1 shrink-0">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTimestamp(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {notif.body}
                  </p>

                  {/* Actions / Meta */}
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    {notif.senderName && (
                      <span className="text-neutral-500 text-[10px]">
                        From: <span className="text-[#D4AF37] font-medium">{notif.senderName}</span>
                      </span>
                    )}
                    <span className="text-[#D4AF37] text-[10px] font-semibold flex items-center gap-0.5 ml-auto hover:underline">
                      View details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* Unread indicator pip */}
                {!notif.read && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-black/90 text-center text-[11px] text-neutral-500">
          Powered by ASKIA MARKET Real-Time Notification SSE Engine
        </div>
      </div>
    </div>
  );
};
