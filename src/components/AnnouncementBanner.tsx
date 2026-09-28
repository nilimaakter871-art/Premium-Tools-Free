import React from 'react';
import { Send, Zap } from 'lucide-react';

interface AnnouncementBannerProps {
  message: string;
  telegramUrl: string;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  message,
  telegramUrl,
}) => {
  if (!message) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-cyan-950/70 via-[#101222] to-blue-950/70 border-b border-cyan-500/20 py-2.5 px-4 text-center">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 text-xs sm:text-sm font-medium text-slate-200">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300">
          <Zap className="h-3 w-3 fill-cyan-400 text-cyan-400 animate-pulse" />
        </span>
        <span className="line-clamp-1">{message}</span>
        {telegramUrl && (
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-cyan-400/10 px-2.5 py-0.5 text-xs font-bold text-cyan-300 hover:bg-cyan-400/20 hover:text-white transition-colors ml-1 shrink-0"
          >
            <span>Join Now</span>
            <Send className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
};
