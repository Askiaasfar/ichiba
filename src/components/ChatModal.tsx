import React, { useState, useEffect, useRef } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  X,
  Send,
  ShieldCheck,
  AlertTriangle,
  MessageCircle,
  Phone,
  Sparkles,
  CheckCheck
} from 'lucide-react';

export const ChatModal: React.FC = () => {
  const { activeChatThread, closeChat, sendChatMessage, currentUser } = useMarketplace();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChatThread?.messages]);

  if (!activeChatThread) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(activeChatThread.listingId, inputText.trim());
    setInputText('');
  };

  const quickReplies = [
    'Is this item still available?',
    'What is your final price?',
    'Can we arrange physical inspection?'
  ];

  const handleQuickReply = (text: string) => {
    sendChatMessage(activeChatThread.listingId, text);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4">
      <div className="relative bg-white w-full sm:max-w-md h-[88vh] sm:h-[620px] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header Bar */}
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              activeChatThread.isVerifiedSeller
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}>
              {activeChatThread.isVerifiedSeller ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              ) : (
                <MessageCircle className="w-4 h-4 text-amber-600" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 text-xs truncate">
                  {activeChatThread.sellerName}
                </h3>
                {activeChatThread.isVerifiedSeller ? (
                  <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded shrink-0">
                    Verified Store
                  </span>
                ) : (
                  <span className="text-[9px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.2 rounded shrink-0">
                    Individual
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {activeChatThread.isVerifiedSeller
                  ? 'Official Store Representative'
                  : 'Classified Advertiser'}
              </p>
            </div>
          </div>

          <button
            onClick={closeChat}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Listing Context Header Strip */}
        <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={activeChatThread.listingImageUrl}
              alt={activeChatThread.listingTitle}
              className="w-10 h-10 rounded-lg object-cover bg-slate-200 border border-slate-300 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <h4 className="font-semibold text-slate-900 line-clamp-1 text-[11px]">
                {activeChatThread.listingTitle}
              </h4>
              <span className="font-bold text-slate-950 font-mono-numbers text-xs">
                ₦{activeChatThread.listingPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Caution Notice if Classified Advertiser */}
        {!activeChatThread.isVerifiedSeller && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-[10px] text-amber-900 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              <strong>Buyer Caution:</strong> Individual seller. Meet in daylight in public. Never pay or transfer money in advance.
            </span>
          </div>
        )}

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFBFD] text-xs">
          <div className="text-center my-2">
            <span className="px-2.5 py-1 bg-slate-200/60 text-slate-500 text-[10px] rounded-full font-mono-numbers">
              Direct message inquiry started
            </span>
          </div>

          {activeChatThread.messages.map((msg) => {
            const isMe = msg.senderRole === 'buyer';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl shadow-xs leading-relaxed text-xs ${
                    isMe
                      ? 'bg-slate-900 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-[9px] text-slate-400 font-mono-numbers px-1">
                  <span>{msg.timestamp}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-emerald-500" />}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          {quickReplies.map((qr) => (
            <button
              key={qr}
              onClick={() => handleQuickReply(qr)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap shrink-0 transition-colors"
            >
              {qr}
            </button>
          ))}
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${activeChatThread.sellerName}...`}
            className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`p-2 rounded-xl transition-colors ${
              inputText.trim()
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
