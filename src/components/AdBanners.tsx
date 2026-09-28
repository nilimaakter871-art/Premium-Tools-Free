import React, { useEffect } from 'react';
import { AdSettings } from '../types';

interface TopBannerProps {
  adSettings: AdSettings;
}

export const TopBannerAd: React.FC<TopBannerProps> = ({ adSettings }) => {
  if (!adSettings.showTopBanner) return null;

  // Never show in admin mode
  if (typeof window !== 'undefined' && (window as unknown as { __IS_ADMIN_MODE?: boolean }).__IS_ADMIN_MODE) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-[#121323] via-[#0f101d] to-[#121323] p-3 shadow-lg">
        {adSettings.topBannerCode ? (
          <div
            dangerouslySetInnerHTML={{ __html: adSettings.topBannerCode }}
            className="flex items-center justify-center min-h-[90px] w-full"
          />
        ) : (
          <a
            href={adSettings.defaultAdLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2 text-center sm:text-left transition-colors hover:bg-white/[0.02] rounded-xl"
          >
            <div className="flex items-center gap-3">
              <span className="rounded bg-cyan-400/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 uppercase tracking-widest border border-cyan-400/30">
                Sponsor
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  ⚡ High-Speed Direct Downloads & Verified Safe Files
                </h4>
                <p className="text-[11px] text-slate-400">
                  Instant servers provided by our official network partners. Click to learn more.
                </p>
              </div>
            </div>
            <span className="btn-3d-cyan shrink-0 rounded-xl px-4 py-1.5 text-xs font-bold text-black shadow-md shadow-cyan-400/20 group-hover:scale-105 transition-transform">
              Explore Now ↗
            </span>
          </a>
        )}
      </div>
    </div>
  );
};

interface ScriptInjectorProps {
  headerScript: string;
}

export const AdScriptInjector: React.FC<ScriptInjectorProps> = ({ headerScript }) => {
  useEffect(() => {
    // Strictly skip script injection in admin mode
    if (typeof window !== 'undefined' && (window as unknown as { __IS_ADMIN_MODE?: boolean }).__IS_ADMIN_MODE) {
      return;
    }

    if (!headerScript || !headerScript.trim()) return;

    try {
      // Create a container and parse elements
      const container = document.createElement('div');
      container.innerHTML = headerScript;

      const scripts = container.querySelectorAll('script');
      scripts.forEach((oldScript) => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.innerHTML = oldScript.innerHTML;
        document.head.appendChild(newScript);
      });
    } catch (err) {
      console.warn('[AdScriptInjector] Error injecting custom ad script:', err);
    }
  }, [headerScript]);

  return null;
};
