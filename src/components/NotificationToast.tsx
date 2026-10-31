import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Bell, MessageSquare, ShoppingBag, ShieldCheck, X } from 'lucide-react';

interface NotificationToastProps {
  onOpenDrawer: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ onOpenDrawer }) => {
  const { activeToast, dismissToast, markNotificationAsRead } = useMarketplace();

  if (!activeToast) return null;

  const getIcon = () => {
    switch (activeToast.type) {
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

  const handleClick = () => {
    markNotificationAsRead(activeToast.id);
    dismissToast();
    onOpenDrawer();
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-bounce-in">
      <div 
        onClick={handleClick}
        className="bg-[#0A0A0A] border-2 border-[#D4AF37] rounded-xl p-4 shadow-2xl shadow-black/80 flex items-start gap-3.5 cursor-pointer hover:bg-neutral-900 transition-all group"
      >
        <div className="w-10 h-10 rounded-full bg-black border border-[#D4AF37]/50 flex items-center justify-center shrink-0">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">
              ASKIA MARKET • Real-Time Alert
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissToast();
              }}
              className="text-neutral-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <h4 className="text-xs font-bold text-white mt-0.5 truncate">{activeToast.title}</h4>
          <p className="text-xs text-neutral-300 line-clamp-2 mt-0.5 leading-snug">{activeToast.body}</p>
        </div>
      </div>
    </div>
  );
};
