import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle,
  Clock,
  Download,
  Flame,
  Globe,
  HardDrive,
  Layers,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { AdScriptInjector, TopBannerAd } from './components/AdBanners';
import { AdminPanel } from './components/AdminPanel';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { AppCard } from './components/AppCard';
import { CategoryFilter } from './components/CategoryFilter';
import { DownloadModal } from './components/DownloadModal';
import { FloatingTelegram } from './components/FloatingTelegram';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { INITIAL_STORE_DATA } from './data/initialData';
import { AppItem, StoreData } from './types';
import { loadStoreData } from './utils/storage';

export default function App() {
  const [storeData, setStoreData] = useState<StoreData>(INITIAL_STORE_DATA);
  const [isLoading, setIsLoading] = useState(true);

  // Check URL routing for /admin or #admin
  const checkIsAdminRoute = () => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return (
      path === '/admin' ||
      path === '/admin/' ||
      path.includes('/admin') ||
      search.includes('admin') ||
      hash.includes('admin')
    );
  };

  const [currentView, setCurrentView] = useState<'store' | 'admin'>(() =>
    checkIsAdminRoute() ? 'admin' : 'store'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Tools');
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);

  // Load persistent store data on initial mount
  useEffect(() => {
    loadStoreData()
      .then((data) => {
        setStoreData(data);
      })
      .catch((err) => {
        console.error('[App] Error loading data:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Listen for hash change to toggle admin
    const handleHashChange = () => {
      if (checkIsAdminRoute()) {
        setCurrentView('admin');
      } else {
        setCurrentView('store');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  const handleOpenAdmin = () => {
    window.location.hash = '#admin';
    setCurrentView('admin');
  };

  const handleCloseAdmin = () => {
    window.location.hash = '';
    setCurrentView('store');
  };

  const handleUpdateStore = (updated: StoreData) => {
    setStoreData(updated);
  };

  // Derive categories and counts
  const { categories, categoryCounts } = useMemo(() => {
    const counts: Record<string, number> = { 'All Tools': storeData.apps.length };
    const set = new Set<string>();

    storeData.apps.forEach((app) => {
      if (app.category) {
        set.add(app.category);
        counts[app.category] = (counts[app.category] || 0) + 1;
      }
    });

    return {
      categories: ['All Tools', ...Array.from(set)],
      categoryCounts: counts,
    };
  }, [storeData.apps]);

  // Filter apps by category & search query
  const filteredApps = useMemo(() => {
    return storeData.apps.filter((app) => {
      const matchesCategory =
        selectedCategory === 'All Tools' || app.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        app.name.toLowerCase().includes(q) ||
        app.category.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.version.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [storeData.apps, selectedCategory, searchQuery]);

  // Total downloads calculation
  const totalDownloads = useMemo(() => {
    return storeData.apps.reduce((sum, a) => sum + (a.downloadsCount || 0), 0);
  }, [storeData.apps]);

  // If view is Admin, render the separate AdminPanel
  if (currentView === 'admin') {
    return (
      <AdminPanel
        storeData={storeData}
        onUpdateStore={handleUpdateStore}
        onCloseAdmin={handleCloseAdmin}
      />
    );
  }

  // Otherwise render the public store
  return (
    <div className="min-h-screen bg-[#0b0c12] text-white flex flex-col selection:bg-[#00f2ea] selection:text-black">
      {/* Dynamic Ad Scripts Injector (Only runs in public store) */}
      <AdScriptInjector headerScript={storeData.adSettings.headerScript} />

      {/* Top Announcement Bar */}
      <AnnouncementBanner
        message={storeData.siteSettings.announcement}
        telegramUrl={storeData.siteSettings.telegramChannel}
      />

      {/* Sticky Main Navigation */}
      <Navbar
        siteSettings={storeData.siteSettings}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Top Banner Ad Slot */}
      <TopBannerAd adSettings={storeData.adSettings} />

      {/* Hero Header Section */}
      <section className="relative overflow-hidden pt-8 pb-10 sm:pt-12 sm:pb-14 px-4 sm:px-6 lg:px-8 text-center">
        {/* Ambient neon radial glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-4xl space-y-4">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-400/10 border border-cyan-400/25 px-3.5 py-1 text-xs font-bold text-cyan-300 shadow-sm shadow-cyan-400/10">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span>100% Working • Lifetime VIP Access • Clean CDN Files</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Download Verified{' '}
            <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Premium Apps & Tools
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-xs sm:text-sm lg:text-base text-slate-300/90 leading-relaxed font-normal">
            Direct high-speed downloads without forced surveys. Get full pre-activated creative suites,
            AI productivity bundles, video editors, and utility toolkits updated daily.
          </p>

          {/* Stats Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Download className="h-4 w-4 text-cyan-400" />
              <span className="font-bold text-white">
                {(totalDownloads / 1000).toFixed(0)}k+
              </span>
              <span>Downloads</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="font-bold text-white">100% Virus-Free</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-cyan-400" />
              <span className="font-bold text-white">Daily Updates</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Send className="h-4 w-4 text-[#229ED9]" />
              <span className="font-bold text-white">Telegram 24/7 Keys</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl w-full flex-1 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Category Filters */}
        <div className="border-b border-white/5 pb-4">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categoryCounts={categoryCounts}
          />
        </div>

        {/* Featured Section Header if on 'All Tools' */}
        {selectedCategory === 'All Tools' && !searchQuery && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-400 fill-amber-400 animate-pulse" />
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Trending Premium Tools
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Showing {filteredApps.length} working releases
            </span>
          </div>
        )}

        {/* Apps Grid */}
        {filteredApps.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredApps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                adSettings={storeData.adSettings}
                onSelectApp={(clickedApp) => setSelectedApp(clickedApp)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/5 bg-[#121321] p-12 text-center my-6">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-slate-400">
              <Search className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">No Tools Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              We couldn't find any tool matching "{searchQuery}". Check our Telegram channel or search another keyword.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All Tools');
              }}
              className="btn-3d-cyan px-4 py-2 rounded-xl text-xs font-bold text-black"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* How It Works Steps */}
        <section className="mt-16 rounded-3xl border border-white/5 bg-gradient-to-b from-[#131424] to-[#0d0e17] p-6 sm:p-10 text-center">
          <div className="mx-auto max-w-2xl mb-8 space-y-2">
            <span className="rounded-full bg-cyan-400/10 border border-cyan-400/20 px-3 py-1 text-xs font-bold text-cyan-300">
              Simple 3-Step Process
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              How to Download and Unlock Your Tools
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Instant access without registration or payment details.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="rounded-2xl border border-white/5 bg-[#0e0f19] p-5 space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/20 text-cyan-300 font-mono font-bold text-sm">
                01
              </div>
              <h4 className="text-sm font-bold text-white">Choose Your Software</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Browse our curated repository of pre-activated creative, video editing, and utility tools.
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#0e0f19] p-5 space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/20 text-blue-300 font-mono font-bold text-sm">
                02
              </div>
              <h4 className="text-sm font-bold text-white">Wait for CDN Mirror</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our secure cloud server scans the file hash and prepares an uncapped direct bandwidth token in 30s.
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#0e0f19] p-5 space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-300 font-mono font-bold text-sm">
                03
              </div>
              <h4 className="text-sm font-bold text-white">Get File & Join Telegram</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Download your unlocked package directly or join our official VIP channel for serials and assistance.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Download / Unlock Modal */}
      <DownloadModal
        app={selectedApp}
        adSettings={storeData.adSettings}
        siteSettings={storeData.siteSettings}
        onClose={() => setSelectedApp(null)}
      />

      {/* Floating Telegram CTA Button */}
      <FloatingTelegram telegramUrl={storeData.siteSettings.telegramChannel} />

      {/* Footer */}
      <Footer siteSettings={storeData.siteSettings} onOpenAdmin={handleOpenAdmin} />
    </div>
  );
}
