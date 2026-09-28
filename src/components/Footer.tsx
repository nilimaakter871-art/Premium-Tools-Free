import React from 'react';
import { Lock, Send, ShieldCheck, Sparkles } from 'lucide-react';
import { SiteSettings } from '../types';

interface FooterProps {
  siteSettings: SiteSettings;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ siteSettings, onOpenAdmin }) => {
  return (
    <footer className="mt-16 border-t border-white/10 bg-[#090a10] py-12 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-black shadow-md shadow-cyan-500/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-base font-extrabold tracking-wider text-white">
                {siteSettings.siteTitle || 'PREMIUM STORE'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              {siteSettings.siteSubtitle || '100% Working Apps & Tools Download'}. All software and tools
              shared on this portal are tested for stability, verified clean from malware, and updated weekly.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Direct CDN Mirrors • Anti-Virus Verified • 24/7 Monitoring</span>
            </div>
          </div>

          {/* Col 2: Channels & Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Official Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href={siteSettings.telegramChannel || 'https://t.me/premiumtoolsfree1'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Telegram VIP Channel</span>
                </a>
              </li>
              <li>
                <a
                  href="#featured"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Featured Premium Tools
                </a>
              </li>
              <li>
                <a
                  href="#how-to-download"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  How to Download & Activate
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Management & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Admin & Security</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <Lock className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Admin Management Portal</span>
                </button>
              </li>
              <li className="text-[11px] text-slate-500">
                DMCA: All trademarks and logos belong to their respective owners. Educational & testing use only.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/5 pt-6 text-[11px] text-slate-500 gap-3">
          <div>
            © {new Date().getFullYear()} {siteSettings.siteTitle || 'Premium Store'}. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1 text-[11px]"
            >
              <Lock className="h-3 w-3" />
              <span>Admin Access</span>
            </button>
            <span>•</span>
            <span>Fast CDN Mirrors</span>
            <span>•</span>
            <span>Zero Subscription</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
