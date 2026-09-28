import React from 'react';
import { Send } from 'lucide-react';

interface FloatingTelegramProps {
  telegramUrl: string;
}

export const FloatingTelegram: React.FC<FloatingTelegramProps> = ({ telegramUrl }) => {
  if (!telegramUrl) return null;

  // Do not show in admin mode
  if (typeof window !== 'undefined' && (window as unknown as { __IS_ADMIN_MODE?: boolean }).__IS_ADMIN_MODE) {
    return null;
  }

  return (
    <aside
      aria-label="Telegram Channel Community"
      className="fixed bottom-5 right-5 z-40 flex items-center group"
    >
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        id="floating-telegram-btn"
        className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#229ED9] to-[#0088cc] hover:from-[#1e8ec5] hover:to-[#0077b5] text-white font-semibold text-xs sm:text-sm shadow-[0_8px_25px_rgba(34,158,217,0.5)] border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <div className="relative">
          <Send className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
          </span>
        </div>
        <span className="tracking-wide font-bold">Join Telegram Channel</span>
      </a>
    </aside>
  );
};
