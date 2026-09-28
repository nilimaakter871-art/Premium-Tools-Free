import React from 'react';
import { Search, Send, Shield, Sparkles, X } from 'lucide-react';
import { SiteSettings } from '../types';

interface NavbarProps {
  siteSettings: SiteSettings;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  siteSettings,
  searchQuery,
  onSearchChange,
  onOpenAdmin,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0b0c12]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="group flex items-center gap-3 select-none"
        >
          <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(0,242,234,0.4)] transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-wider text-white">
                {siteSettings.siteTitle || 'PREMIUM STORE'}
              </span>
              <span className="rounded bg-cyan-400/10 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-400/20">
                PRO
              </span>
            </div>
            <p className="hidden text-[11px] font-medium text-slate-400 sm:block">
              {siteSettings.siteSubtitle || '100% Working Apps & Tools Download'}
            </p>
          </div>
        </a>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md mx-2 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search apps, tools, Photoshop, IDM..."
              className="w-full rounded-xl bg-[#141624] border border-white/10 pl-10 pr-9 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Telegram CTA */}
          <a
            href={siteSettings.telegramChannel || 'https://t.me/premiumtoolsfree1'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#229ED9] to-[#0088cc] hover:from-[#1e8ec5] hover:to-[#0077b5] px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#229ED9]/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Join Telegram</span>
            <span className="sm:hidden">Telegram</span>
          </a>

          {/* Admin Access Button */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#161726] hover:bg-[#1f2136] hover:border-cyan-500/40 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
            title="Open Admin Portal"
          >
            <Shield className="h-4 w-4 text-cyan-400" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="px-4 pb-3 md:hidden">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search premium tools..."
            className="w-full rounded-xl bg-[#141624] border border-white/10 pl-10 pr-9 py-2 text-xs text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
