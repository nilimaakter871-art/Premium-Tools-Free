import React, { useState } from 'react';
import { Download, Flame, HardDrive, Sparkles, Star } from 'lucide-react';
import { AdSettings, AppItem } from '../types';
import { canTriggerPopunder, recordPopunderTrigger } from '../utils/storage';

interface AppCardProps {
  app: AppItem;
  adSettings: AdSettings;
  onSelectApp: (app: AppItem) => void;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  adSettings,
  onSelectApp,
}) => {
  const [imgError, setImgError] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // If popunder is enabled and cooldown passed, open ad
    if (adSettings.popunderOnClick && canTriggerPopunder(adSettings.popunderCooldownMinutes)) {
      const adUrl = app.adLink || adSettings.defaultAdLink;
      if (adUrl) {
        try {
          window.open(adUrl, '_blank');
          recordPopunderTrigger();
        } catch (err) {
          console.warn('[Ad] Popunder blocked:', err);
        }
      }
    }

    onSelectApp(app);
  };

  const formattedDownloads =
    app.downloadsCount >= 1000
      ? `${(app.downloadsCount / 1000).toFixed(1)}k`
      : `${app.downloadsCount}`;

  return (
    <div
      onClick={handleClick}
      className="cyber-card group relative flex flex-col justify-between overflow-hidden rounded-2xl p-4 sm:p-5 cursor-pointer"
    >
      {/* Glow border gradient effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Top Section: Logo, Title, Badges */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0e0f18] p-1 shadow-md">
            <img
              src={
                imgError
                  ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80'
                  : app.logo
              }
              alt={app.name}
              onError={() => setImgError(true)}
              className="h-full w-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {app.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                <Flame className="h-3 w-3 fill-amber-400 text-amber-400" />
                HOT
              </span>
            )}
            <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-300">
              {app.category}
            </span>
          </div>
        </div>

        {/* Title & Version info */}
        <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1">
          {app.name}
        </h3>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2.5">
          <span className="font-mono text-cyan-400/90 font-medium">{app.version}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <HardDrive className="h-3 w-3" />
            {app.fileSize}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300/80 line-clamp-2 leading-relaxed mb-4">
          {app.description}
        </p>
      </div>

      {/* Bottom Section: Rating, Downloads & CTA */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1 text-amber-400 font-semibold">
            <Star className="h-3.5 w-3.5 fill-amber-400" />
            <span>{app.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Download className="h-3 w-3" />
            <span>{formattedDownloads}</span>
          </div>
        </div>

        <button
          type="button"
          className="btn-3d-cyan flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold text-black"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Get Link</span>
        </button>
      </div>
    </div>
  );
};
