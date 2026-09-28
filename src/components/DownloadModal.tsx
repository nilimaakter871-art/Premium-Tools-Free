import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  ExternalLink,
  Flame,
  HardDrive,
  Send,
  ShieldCheck,
  Sparkles,
  Timer,
  X,
  Zap,
} from 'lucide-react';
import { AdSettings, AppItem, SiteSettings } from '../types';

interface DownloadModalProps {
  app: AppItem | null;
  adSettings: AdSettings;
  siteSettings: SiteSettings;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  app,
  adSettings,
  siteSettings,
  onClose,
}) => {
  if (!app) return null;

  const totalTime = app.timerSeconds || adSettings.defaultTimerSec || 30;
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [isCompleted, setIsCompleted] = useState(false);
  const [adTriggered, setAdTriggered] = useState(false);

  useEffect(() => {
    setTimeLeft(totalTime);
    setIsCompleted(false);
    setAdTriggered(false);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [app, totalTime]);

  // Auto-redirect if enabled when timer finishes
  useEffect(() => {
    if (isCompleted && adSettings.autoRedirect && !adTriggered) {
      const redirectTimer = setTimeout(() => {
        const targetUrl = app.mainContentUrl || siteSettings.telegramChannel || adSettings.defaultMainContentUrl;
        if (targetUrl) {
          window.location.href = targetUrl;
        }
      }, 1500);
      return () => clearTimeout(redirectTimer);
    }
  }, [isCompleted, adSettings.autoRedirect, app, siteSettings, adSettings.defaultMainContentUrl, adTriggered]);

  const progressPercentage = Math.max(0, Math.min(100, ((totalTime - timeLeft) / totalTime) * 100));

  const handleSponsorClick = () => {
    const adUrl = app.adLink || adSettings.defaultAdLink;
    if (adUrl) {
      window.open(adUrl, '_blank');
      setAdTriggered(true);
    }
  };

  const handleDirectDownloadClick = () => {
    const targetUrl = app.mainContentUrl || siteSettings.telegramChannel || adSettings.defaultMainContentUrl;
    if (targetUrl) {
      window.open(targetUrl, '_blank');
    }
  };

  const targetUrl = app.mainContentUrl || siteSettings.telegramChannel || adSettings.defaultMainContentUrl;
  const adUrl = app.adLink || adSettings.defaultAdLink;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl rounded-3xl bg-[#121320] border border-cyan-500/30 p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-white overflow-hidden my-auto"
      >
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-white/5 hover:bg-white/10 p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* App Info Header */}
        <div className="flex items-start gap-4 pr-8 mb-5">
          <img
            src={app.logo}
            alt={app.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80';
            }}
            className="h-16 w-16 sm:h-18 sm:w-18 shrink-0 rounded-2xl border border-white/15 object-cover bg-[#0a0b12] p-1 shadow-lg"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="rounded-full bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                {app.category}
              </span>
              <span className="font-mono text-xs text-cyan-400 font-semibold">{app.version}</span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <HardDrive className="h-3 w-3" />
                {app.fileSize}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight line-clamp-1">
              {app.name}
            </h3>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2">{app.description}</p>
          </div>
        </div>

        {/* Security verification pill */}
        <div className="flex items-center gap-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 px-3 py-2 text-xs text-emerald-300 mb-5">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
          <span className="font-medium">File Hash Verified • 100% Virus-Free CDN Cloud Server</span>
        </div>

        {/* Countdown / Ready State Box */}
        <div className="rounded-2xl bg-[#0b0c14] border border-white/10 p-5 sm:p-6 text-center mb-5 relative overflow-hidden">
          {!isCompleted ? (
            <div className="space-y-4">
              {/* Circular SVG Timer */}
              <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-white/10"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-cyan-400 transition-all duration-1000 ease-linear"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (264 * progressPercentage) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-cyan-300 font-mono tracking-tighter">
                    {timeLeft}s
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400">Wait</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Generating High-Speed Download Mirror...
                </h4>
                <p className="text-xs text-slate-400">
                  Please hold on while your secure link is unlocked. No subscription required!
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-1000 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2 animate-in zoom-in-95 duration-200">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-black shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-black text-white">
                  🎉 Download Link Ready!
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Click the direct button below to get your verified file or telegram key.
                </p>
              </div>

              {/* Huge Download CTA */}
              <button
                onClick={handleDirectDownloadClick}
                className="btn-3d-cyan w-full py-3.5 rounded-2xl font-extrabold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_30px_rgba(0,242,234,0.5)] border-2 border-cyan-300"
              >
                <Download className="h-5 w-5" />
                <span>DOWNLOAD FILE NOW</span>
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Sponsored Fast-Track Unlock Box (Monetag/Adsterra Ad Placement) */}
        {!isCompleted && (
          <div
            onClick={handleSponsorClick}
            className="group mb-5 flex items-center justify-between gap-3 rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/60 via-[#141829] to-blue-950/60 p-3.5 sm:p-4 cursor-pointer hover:border-cyan-400 transition-all shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 group-hover:scale-105 transition-transform">
                <Zap className="h-5 w-5 fill-cyan-400 text-cyan-400 animate-pulse" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                  <span>Sponsored Accelerator</span>
                  <span className="rounded bg-cyan-400/20 px-1 py-0.2 text-[9px] text-cyan-200">
                    VIP
                  </span>
                </div>
                <h5 className="text-xs sm:text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                  Unlock Fast Direct Downloads & Uncapped Premium Bandwidth
                </h5>
              </div>
            </div>
            <span className="shrink-0 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-3 py-1.5 text-xs font-bold text-black shadow-md shadow-cyan-400/20 group-hover:scale-105 transition-transform whitespace-nowrap">
              Unlock Fast ↗
            </span>
          </div>
        )}

        {/* Download Modal Banner Ad Container (if enabled in ad settings) */}
        {adSettings.showDownloadBanner && (
          <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0e0f19] p-3 text-center">
            {adSettings.downloadBannerCode ? (
              <div
                dangerouslySetInnerHTML={{ __html: adSettings.downloadBannerCode }}
                className="flex items-center justify-center min-h-[90px]"
              />
            ) : (
              <a
                href={adUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-xl bg-gradient-to-r from-[#171a2e] to-[#121422] p-3 border border-white/5 hover:border-cyan-500/30 transition-all text-center"
              >
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Advertisement • High Speed Server Sponsor
                </div>
                <div className="text-xs sm:text-sm font-bold text-cyan-300 group-hover:underline">
                  🔥 Unlimited Cloud Storage & VPN - Protect Your Privacy Now!
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Click here to support free premium apps hosting
                </div>
              </a>
            )}
          </div>
        )}

        {/* Telegram Community Notice */}
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#0d0e17] border border-white/5 p-3.5 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <Send className="h-4 w-4 text-[#229ED9] shrink-0" />
            <span>Need activation key or update? Request on our Telegram Channel.</span>
          </div>
          <a
            href={siteSettings.telegramChannel || 'https://t.me/premiumtoolsfree1'}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 font-bold text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
          >
            Join <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
