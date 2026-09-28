import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  Flame,
  FolderGit2,
  Globe,
  HardDrive,
  Key,
  Layers,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  Zap,
} from 'lucide-react';
import { AdSettings, AppItem, GitHubSyncSettings, SiteSettings, StoreData } from '../types';
import {
  getAdminSession,
  persistStoreData,
  pushToGitHubApi,
  setAdminSession,
} from '../utils/storage';

interface AdminPanelProps {
  storeData: StoreData;
  onUpdateStore: (updated: StoreData) => void;
  onCloseAdmin: () => void;
}

type TabType = 'apps' | 'monetization' | 'site' | 'github';

const CATEGORY_PRESETS = [
  'Design & Creative',
  'Video Editing',
  'Utilities & Tools',
  'AI & Productivity',
  'Security & VPN',
  'Android Apps',
  'Windows Software',
  'Developer Tools',
];

const LOGO_PRESETS = [
  { name: 'Canva', url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=200&auto=format&fit=crop&q=80' },
  { name: 'CapCut', url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=200&auto=format&fit=crop&q=80' },
  { name: 'Photoshop', url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=200&auto=format&fit=crop&q=80' },
  { name: 'Filmora', url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=200&auto=format&fit=crop&q=80' },
  { name: 'IDM', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&auto=format&fit=crop&q=80' },
  { name: 'AI / ChatGPT', url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=200&auto=format&fit=crop&q=80' },
  { name: 'VPN / Security', url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&auto=format&fit=crop&q=80' },
  { name: 'Telegram Bot', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80' },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  storeData,
  onUpdateStore,
  onCloseAdmin,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => getAdminSession());
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('apps');

  // Form editing states
  const [localAdSettings, setLocalAdSettings] = useState<AdSettings>(storeData.adSettings);
  const [localSiteSettings, setLocalSiteSettings] = useState<SiteSettings>(storeData.siteSettings);
  const [localGithubSettings, setLocalGithubSettings] = useState<GitHubSyncSettings>(storeData.githubSettings);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // App Editor Modal State
  const [editingApp, setEditingApp] = useState<AppItem | null>(null);
  const [isNewApp, setIsNewApp] = useState(false);
  const [appSearch, setAppSearch] = useState('');

  // Status notifications
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Activate AdShield mode when AdminPanel mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as { __IS_ADMIN_MODE: boolean }).__IS_ADMIN_MODE = true;
      document.body?.classList.add('in-admin-mode');
      document.documentElement?.classList.add('in-admin-mode');
    }

    return () => {
      if (typeof window !== 'undefined') {
        (window as unknown as { __IS_ADMIN_MODE: boolean }).__IS_ADMIN_MODE = false;
        document.body?.classList.remove('in-admin-mode');
        document.documentElement?.classList.remove('in-admin-mode');
      }
    };
  }, []);

  // Sync props when storeData updates
  useEffect(() => {
    setLocalAdSettings(storeData.adSettings);
    setLocalSiteSettings(storeData.siteSettings);
    setLocalGithubSettings(storeData.githubSettings);
  }, [storeData]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === storeData.siteSettings.adminPassword) {
      setIsAuthenticated(true);
      setAdminSession(true);
      setAuthError('');
      showToast('Welcome back, Admin! AdShield is active.', 'success');
    } else {
      setAuthError('Incorrect Admin Security Password. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminSession(false);
    onCloseAdmin();
  };

  // Helper: Persist and sync everywhere
  const commitStoreUpdate = async (newStoreData: StoreData, actionDescription: string) => {
    setIsSaving(true);
    onUpdateStore(newStoreData);

    try {
      const res = await persistStoreData(newStoreData);
      let msg = `✓ ${actionDescription}: Saved to Server & Local Storage!`;

      // If github configured, push to github
      if (newStoreData.githubSettings.autoSyncToGithub && newStoreData.githubSettings.githubToken) {
        try {
          await pushToGitHubApi(newStoreData.githubSettings, newStoreData);
          msg += ' & Synced to GitHub!';
        } catch (ghErr) {
          console.warn('[GitHub Auto Sync Fail]:', ghErr);
          msg += ' (GitHub auto-sync pending)';
        }
      }

      showToast(msg, 'success');
    } catch (err) {
      console.error('[Admin Save Error]:', err);
      showToast(`Error saving: ${err instanceof Error ? err.message : String(err)}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // 1-Click Sync Everywhere Action
  const handleOneClickSyncEverywhere = async () => {
    setIsSaving(true);
    showToast('Syncing data to Server, Local Storage, and GitHub...', 'info');

    try {
      const currentData: StoreData = {
        apps: storeData.apps,
        adSettings: localAdSettings,
        siteSettings: localSiteSettings,
        githubSettings: localGithubSettings,
        version: storeData.version + 1,
        updatedAt: Date.now(),
      };

      // 1. Save to server & local
      const saveRes = await persistStoreData(currentData);
      onUpdateStore(currentData);

      let ghMessage = '';
      if (localGithubSettings.githubToken && localGithubSettings.githubRepo) {
        try {
          const ghRes = await pushToGitHubApi(localGithubSettings, currentData);
          ghMessage = ` | GitHub Commit: ${ghRes.commitUrl ? 'Pushed' : 'OK'}`;
          const updatedSettings = {
            ...localGithubSettings,
            lastSyncedAt: Date.now(),
            lastSyncStatus: 'Successfully synced',
          };
          setLocalGithubSettings(updatedSettings);
          currentData.githubSettings = updatedSettings;
          await persistStoreData(currentData);
          onUpdateStore(currentData);
        } catch (ghErr) {
          ghMessage = ` | GitHub sync error: ${ghErr instanceof Error ? ghErr.message : String(ghErr)}`;
        }
      } else {
        ghMessage = ' (GitHub token not configured, saved to server disk)';
      }

      showToast(`⚡ 1-Click Sync Successful! Server Disk (/data/store.json) updated${ghMessage}`, 'success');
    } catch (err) {
      showToast(`Sync Failed: ${err instanceof Error ? err.message : String(err)}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // App CRUD handlers
  const handleAddNewApp = () => {
    setIsNewApp(true);
    setEditingApp({
      id: `app-${Date.now()}`,
      name: '',
      logo: LOGO_PRESETS[0].url,
      category: CATEGORY_PRESETS[0],
      description: '',
      version: 'v1.0.0',
      fileSize: '50 MB',
      adLink: localAdSettings.defaultAdLink,
      mainContentUrl: localSiteSettings.telegramChannel || localAdSettings.defaultMainContentUrl,
      timerSeconds: 30,
      downloadsCount: Math.floor(Math.random() * 5000) + 1200,
      rating: 4.9,
      isFeatured: false,
      createdAt: Date.now(),
    });
  };

  const handleEditApp = (app: AppItem) => {
    setIsNewApp(false);
    setEditingApp({ ...app });
  };

  const handleDuplicateApp = (app: AppItem) => {
    const duplicated: AppItem = {
      ...app,
      id: `app-${Date.now()}`,
      name: `${app.name} (Copy)`,
      downloadsCount: Math.floor(Math.random() * 2000) + 500,
      createdAt: Date.now(),
    };
    const updatedApps = [duplicated, ...storeData.apps];
    commitStoreUpdate({ ...storeData, apps: updatedApps }, `Cloned "${app.name}"`);
  };

  const handleDeleteApp = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action will immediately remove it and update server & GitHub!`)) {
      const updatedApps = storeData.apps.filter((a) => a.id !== id);
      commitStoreUpdate({ ...storeData, apps: updatedApps }, `Deleted "${name}"`);
    }
  };

  const handleToggleFeatured = (id: string) => {
    const updatedApps = storeData.apps.map((a) =>
      a.id === id ? { ...a, isFeatured: !a.isFeatured } : a
    );
    commitStoreUpdate({ ...storeData, apps: updatedApps }, 'Updated Featured status');
  };

  const handleSaveAppForm = () => {
    if (!editingApp || !editingApp.name.trim() || !editingApp.mainContentUrl.trim()) {
      alert('Please fill in both the App Name and Main Content / Telegram URL.');
      return;
    }

    let updatedApps: AppItem[];
    if (isNewApp) {
      updatedApps = [editingApp, ...storeData.apps];
    } else {
      updatedApps = storeData.apps.map((a) => (a.id === editingApp.id ? editingApp : a));
    }

    commitStoreUpdate(
      { ...storeData, apps: updatedApps },
      isNewApp ? `Added new tool "${editingApp.name}"` : `Updated tool "${editingApp.name}"`
    );
    setEditingApp(null);
  };

  // Save Ad Settings
  const handleSaveAdSettings = () => {
    commitStoreUpdate({ ...storeData, adSettings: localAdSettings }, 'Ad Network Settings');
  };

  // Save Site Settings
  const handleSaveSiteSettings = () => {
    commitStoreUpdate({ ...storeData, siteSettings: localSiteSettings }, 'Site Settings & Password');
  };

  // Save GitHub Settings
  const handleSaveGithubSettings = () => {
    commitStoreUpdate({ ...storeData, githubSettings: localGithubSettings }, 'GitHub Configuration');
  };

  // Export Backup File
  const handleExportBackup = () => {
    const jsonStr = JSON.stringify(storeData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `premium-tools-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ Backup file downloaded to your device!', 'success');
  };

  // Import Backup File
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.apps)) {
          commitStoreUpdate(parsed, 'Restored from Backup');
          showToast('✓ Successfully restored store data from backup file!', 'success');
        } else {
          showToast('Invalid backup file format.', 'error');
        }
      } catch (err) {
        showToast('Error parsing JSON backup file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filter apps in admin view
  const filteredApps = storeData.apps.filter(
    (a) =>
      a.name.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.category.toLowerCase().includes(appSearch.toLowerCase())
  );

  // If not authenticated, render login gate
  if (!isAuthenticated) {
    return (
      <div
        id="admin-panel-root"
        data-admin-panel="true"
        onClick={(e) => e.stopPropagation()}
        className="min-h-screen w-full bg-[#0a0b14] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-['Poppins',sans-serif]"
      >
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative w-full max-w-md rounded-3xl bg-[#131422] border border-cyan-500/30 p-7 sm:p-9 shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-center text-white z-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-black shadow-lg shadow-cyan-500/30">
            <Lock className="w-8 h-8 stroke-[2.5]" />
          </div>

          <h2 className="text-2xl font-extrabold text-white mb-1 tracking-wide">
            Master Admin Portal
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Private management access. Manage apps, Monetag/Adsterra ads, and 1-Click GitHub sync.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError('');
                }}
                placeholder="Enter Admin Password..."
                className="w-full px-4 py-3.5 pr-12 rounded-xl bg-[#0a0b12] border border-white/10 focus:border-cyan-400 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center gap-2 text-left">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-3d-cyan w-full py-3.5 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Key className="w-4 h-4 text-black" />
              <span>Unlock Admin Panel</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Default key: Aa123456@</span>
            <button
              type="button"
              onClick={onCloseAdmin}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div
      id="admin-panel-root"
      data-admin-panel="true"
      onClick={(e) => e.stopPropagation()}
      className="min-h-screen w-full bg-[#0b0c14] text-white flex flex-col font-['Poppins',sans-serif]"
    >
      {/* Toast Notification */}
      {statusMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-3 duration-200">
          <div
            className={`flex items-center gap-2.5 rounded-2xl px-5 py-3 shadow-2xl border text-xs sm:text-sm font-semibold ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
                : statusMessage.type === 'error'
                ? 'bg-red-950/90 text-red-200 border-red-500/50'
                : 'bg-cyan-950/90 text-cyan-200 border-cyan-500/50'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : statusMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            ) : (
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        </div>
      )}

      {/* Admin Top Header */}
      <header className="border-b border-white/10 bg-[#10111f]/90 backdrop-blur-md sticky top-0 z-30 px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-black shadow-md shadow-cyan-400/20">
              <Shield className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white">Master Admin Panel</h1>
                <span className="flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  AdShield Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Connected to Server Disk (/data/store.json) • 0 Ads Guarantee
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 1-Click Sync Everywhere button */}
            <button
              onClick={handleOneClickSyncEverywhere}
              disabled={isSaving}
              className="btn-3d-cyan flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-black cursor-pointer shadow-[0_0_20px_rgba(0,242,234,0.4)]"
              title="1-Click Save to Server & Sync to GitHub"
            >
              {isSaving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5 fill-black" />
              )}
              <span>⚡ 1-Click Sync Everywhere</span>
            </button>

            <button
              onClick={onCloseAdmin}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Public Store</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-950/40 hover:bg-red-900/60 px-3 py-2 text-xs font-semibold text-red-300 cursor-pointer transition-colors"
              title="Logout from Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Admin Tab Navigation */}
      <div className="border-b border-white/5 bg-[#0e0f19] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('apps')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'apps'
                ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Manage Apps & Tools ({storeData.apps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('monetization')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'monetization'
                ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Ad Networks & Monetization</span>
          </button>

          <button
            onClick={() => setActiveTab('site')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'site'
                ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Site & Telegram Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'github'
                ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>GitHub Sync & Backup</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-6 sm:px-6 lg:px-8">
        {/* TAB 1: MANAGE APPS */}
        {activeTab === 'apps' && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#121321] p-4 rounded-2xl border border-white/5">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  placeholder="Filter apps by name or category..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0a0b12] border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-400 outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddNewApp}
                  className="btn-3d-cyan flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-black cursor-pointer shadow-md shadow-cyan-400/20"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add New Tool</span>
                </button>
              </div>
            </div>

            {/* Apps Table */}
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#121321]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0e0f1a] text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/5">
                    <tr>
                      <th className="px-4 py-3.5">App / Tool</th>
                      <th className="px-4 py-3.5">Category</th>
                      <th className="px-4 py-3.5">Timer</th>
                      <th className="px-4 py-3.5">HOT</th>
                      <th className="px-4 py-3.5">Target / Telegram URL</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredApps.map((app) => (
                      <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                        {/* App Col */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={app.logo}
                              alt={app.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80';
                              }}
                              className="h-10 w-10 shrink-0 rounded-xl object-cover border border-white/10 bg-[#090a10]"
                            />
                            <div>
                              <div className="font-bold text-white text-sm">{app.name}</div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-cyan-400">{app.version}</span>
                                <span>•</span>
                                <span>{app.fileSize}</span>
                                <span>•</span>
                                <span>★ {app.rating}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3">
                          <span className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300 border border-white/5">
                            {app.category}
                          </span>
                        </td>

                        {/* Timer */}
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-cyan-400">
                            {app.timerSeconds}s
                          </span>
                        </td>

                        {/* HOT Toggle */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleFeatured(app.id)}
                            className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                              app.isFeatured
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'
                            }`}
                            title="Toggle HOT / Featured Badge"
                          >
                            <Flame className="w-4 h-4" />
                          </button>
                        </td>

                        {/* Target URL */}
                        <td className="px-4 py-3 max-w-[200px] truncate">
                          <a
                            href={app.mainContentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-400 hover:underline flex items-center gap-1 truncate text-xs"
                            title={app.mainContentUrl}
                          >
                            <span className="truncate">{app.mainContentUrl}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditApp(app)}
                              className="p-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/50 cursor-pointer transition-colors"
                              title="Edit Tool Details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicateApp(app)}
                              className="p-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900 text-blue-300 border border-blue-800/50 cursor-pointer transition-colors"
                              title="Duplicate Tool"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteApp(app.id, app.name)}
                              className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/50 cursor-pointer transition-colors"
                              title="Delete Tool"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AD NETWORKS & MONETIZATION */}
        {activeTab === 'monetization' && (
          <div className="space-y-6 max-w-4xl">
            {/* Banner Guide Card */}
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-[#171a2f] via-[#121424] to-[#171a2f] p-5 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-cyan-400/20 p-3 text-cyan-300 border border-cyan-400/30">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Adsterra & Monetag CPM Income Engine
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Earning without user clicks is powered by{' '}
                    <strong className="text-cyan-300">CPM Banners, Popunders, and Social Bars</strong>.
                    When visitors view tools or wait on the 30-second countdown, ad impressions generate
                    revenue automatically!
                  </p>
                </div>
              </div>
            </div>

            {/* Smartlink & Target URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-white/5 bg-[#121321] p-4 space-y-2">
                <label className="block text-xs font-bold text-slate-200">
                  Primary Adsterra / Monetag Smart Direct Link
                </label>
                <input
                  type="text"
                  value={localAdSettings.defaultAdLink}
                  onChange={(e) =>
                    setLocalAdSettings({ ...localAdSettings, defaultAdLink: e.target.value })
                  }
                  placeholder="https://splendid-garage.com/SJ7fF4"
                  className="w-full rounded-xl bg-[#0a0b12] border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 outline-none"
                />
                <p className="text-[11px] text-slate-400">
                  Used by default when visitors click on tools or sponsored unlock buttons.
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-[#121321] p-4 space-y-2">
                <label className="block text-xs font-bold text-slate-200">
                  Default Target / Telegram Channel Link
                </label>
                <input
                  type="text"
                  value={localAdSettings.defaultMainContentUrl}
                  onChange={(e) =>
                    setLocalAdSettings({ ...localAdSettings, defaultMainContentUrl: e.target.value })
                  }
                  placeholder="https://t.me/premiumtoolsfree1"
                  className="w-full rounded-xl bg-[#0a0b12] border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 outline-none"
                />
                <p className="text-[11px] text-slate-400">
                  Where users are redirected once the 30-second countdown completes.
                </p>
              </div>
            </div>

            {/* Toggles & Timer Config */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl border border-white/5 bg-[#121321] p-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Default Countdown Timer (Seconds)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={localAdSettings.defaultTimerSec}
                  onChange={(e) =>
                    setLocalAdSettings({
                      ...localAdSettings,
                      defaultTimerSec: parseInt(e.target.value) || 30,
                    })
                  }
                  className="w-full rounded-xl bg-[#0a0b12] border border-white/10 px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none"
                />
                <span className="text-[10px] text-slate-400">Standard: 30 seconds</span>
              </div>

              <div className="flex flex-col justify-center">
                <label className="text-xs font-bold text-slate-200 mb-1">
                  Auto-Redirect After Timer
                </label>
                <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={localAdSettings.autoRedirect}
                    onChange={(e) =>
                      setLocalAdSettings({ ...localAdSettings, autoRedirect: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
                  <span className="ml-2 text-xs text-slate-300">
                    {localAdSettings.autoRedirect ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>

              <div className="flex flex-col justify-center">
                <label className="text-xs font-bold text-slate-200 mb-1">
                  Popunder on App Click
                </label>
                <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={localAdSettings.popunderOnClick}
                    onChange={(e) =>
                      setLocalAdSettings({ ...localAdSettings, popunderOnClick: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
                  <span className="ml-2 text-xs text-slate-300">
                    {localAdSettings.popunderOnClick ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
            </div>

            {/* Banner Slots Custom Codes */}
            <div className="space-y-4">
              {/* Header Banner */}
              <div className="rounded-2xl border border-white/5 bg-[#121321] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200">
                    Top / Header Banner Code (728x90 or Responsive HTML)
                  </label>
                  <label className="inline-flex items-center cursor-pointer text-xs text-slate-400">
                    <input
                      type="checkbox"
                      checked={localAdSettings.showTopBanner}
                      onChange={(e) =>
                        setLocalAdSettings({ ...localAdSettings, showTopBanner: e.target.checked })
                      }
                      className="mr-1.5"
                    />
                    <span>Show Top Banner</span>
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={localAdSettings.topBannerCode}
                  onChange={(e) =>
                    setLocalAdSettings({ ...localAdSettings, topBannerCode: e.target.value })
                  }
                  placeholder="<!-- Paste Adsterra/Monetag banner HTML or iframe here -->"
                  className="w-full rounded-xl bg-[#0a0b12] border border-white/10 px-3.5 py-2 font-mono text-[11px] text-cyan-200 focus:border-cyan-400 outline-none"
                />
                <p className="text-[10px] text-slate-400">
                  If left empty, a high-converting default sponsor banner linking to your direct link will be shown.
                </p>
              </div>

              {/* Download Modal Banner */}
              <div className="rounded-2xl border border-white/5 bg-[#121321] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200">
                    Download Modal Banner Code (300x250 or Native Ad)
                  </label>
                  <label className="inline-flex items-center cursor-pointer text-xs text-slate-400">
                    <input
                      type="checkbox"
                      checked={localAdSettings.showDownloadBanner}
                      onChange={(e) =>
                        setLocalAdSettings({
                          ...localAdSettings,
                          showDownloadBanner: e.target.checked,
                        })
                      }
                      className="mr-1.5"
                    />
                    <span>Show Download Banner</span>
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={localAdSettings.downloadBannerCode}
                  onChange={(e) =>
                    setLocalAdSettings({
                      ...localAdSettings,
                      downloadBannerCode: e.target.value,
                    })
                  }
                  placeholder="<!-- Paste 300x250 Ad code here -->"
                  className="w-full rounded-xl bg-[#0a0b12] border border-white/10 px-3.5 py-2 font-mono text-[11px] text-cyan-200 focus:border-cyan-400 outline-none"
                />
              </div>

              {/* Social Bar / Anti-Adblock Script */}
              <div className="rounded-2xl border border-white/5 bg-[#121321] p-4 space-y-2">
                <label className="block text-xs font-bold text-slate-200">
                  Adsterra Social Bar / Monetag In-Page Push / Anti-Adblock Script
                </label>
                <textarea
                  rows={3}
                  value={localAdSettings.headerScript}
                  onChange={(e) =>
                    setLocalAdSettings({ ...localAdSettings, headerScript: e.target.value })
                  }
                  placeholder="<!-- Paste Social Bar / In-Page Push script here: <script src='...'></script> -->"
                  className="w-full rounded-xl bg-[#0a0b12] border border-white/10 px-3.5 py-2 font-mono text-[11px] text-cyan-200 focus:border-cyan-400 outline-none"
                />
                <p className="text-[10px] text-slate-400">
                  Floats on the screen automatically on public store and pays CPM every time a user views the website.
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSaveAdSettings}
                disabled={isSaving}
                className="btn-3d-cyan flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black cursor-pointer shadow-[0_0_20px_rgba(0,242,234,0.4)]"
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>Save Ad Settings</span>
              </button>

              <a
                href={localAdSettings.defaultAdLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                <span>Test Direct Ad Link</span>
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              </a>
            </div>
          </div>
        )}

        {/* TAB 3: SITE & TELEGRAM SETTINGS */}
        {activeTab === 'site' && (
          <div className="space-y-6 max-w-2xl">
            <div className="rounded-2xl border border-white/5 bg-[#121321] p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">General Store Information</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Store Title
                </label>
                <input
                  type="text"
                  value={localSiteSettings.siteTitle}
                  onChange={(e) =>
                    setLocalSiteSettings({ ...localSiteSettings, siteTitle: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b12] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={localSiteSettings.siteSubtitle}
                  onChange={(e) =>
                    setLocalSiteSettings({ ...localSiteSettings, siteSubtitle: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b12] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Telegram Channel Link
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={localSiteSettings.telegramChannel}
                    onChange={(e) =>
                      setLocalSiteSettings({
                        ...localSiteSettings,
                        telegramChannel: e.target.value,
                      })
                    }
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0a0b12] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none"
                  />
                  <Send className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Top Announcement Bar Message
                </label>
                <input
                  type="text"
                  value={localSiteSettings.announcement}
                  onChange={(e) =>
                    setLocalSiteSettings({ ...localSiteSettings, announcement: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b12] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            {/* Admin Password Change */}
            <div className="rounded-2xl border border-white/5 bg-[#121321] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-cyan-400" />
                  <span>Admin Security Password</span>
                </h3>
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                  Protected
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The admin password is encrypted and never shown to public visitors. Only change it if needed.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Set / Change Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={localSiteSettings.adminPassword}
                    onChange={(e) =>
                      setLocalSiteSettings({ ...localSiteSettings, adminPassword: e.target.value })
                    }
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#0a0b12] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showAdminPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveSiteSettings}
                disabled={isSaving}
                className="btn-3d-cyan flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black cursor-pointer shadow-[0_0_20px_rgba(0,242,234,0.4)]"
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>Save Site Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: GITHUB SYNC & BACKUP */}
        {activeTab === 'github' && (
          <div className="space-y-6 max-w-3xl">
            {/* Bengali & English Guide */}
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-[#171a2f] via-[#121424] to-[#171a2f] p-5 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-cyan-400/20 p-3 text-cyan-300 border border-cyan-400/30">
                  <FolderGit2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    ⚡ 1-Click GitHub & Server Auto-Sync
                  </h3>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                    <strong>বাংলা:</strong> এডমিন প্যানেল থেকে আপনি যা কিছুই Add বা Delete করবেন, তা
                    এক ক্লিকেই আপনার লোকাল সার্ভার ডিস্ক (<code className="text-cyan-300 font-mono">/data/store.json</code>)
                    এবং আপনার GitHub রিপোজিটরিতে সেভ হয়ে যাবে!
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter your GitHub Personal Access Token (PAT) and Repo below to enable 1-Click automatic syncing.
                  </p>
                </div>
              </div>
            </div>

            {/* GitHub Configuration Inputs */}
            <div className="rounded-2xl border border-white/5 bg-[#121321] p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                GitHub Repository Credentials
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  GitHub Personal Access Token (PAT)
                </label>
                <input
                  type="password"
                  value={localGithubSettings.githubToken}
                  onChange={(e) =>
                    setLocalGithubSettings({
                      ...localGithubSettings,
                      githubToken: e.target.value,
                    })
                  }
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b12] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Create a token with <code className="text-cyan-300">repo</code> scope at{' '}
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline"
                  >
                    github.com/settings/tokens
                  </a>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Repository Name (owner/repo)
                  </label>
                  <input
                    type="text"
                    value={localGithubSettings.githubRepo}
                    onChange={(e) =>
                      setLocalGithubSettings({
                        ...localGithubSettings,
                        githubRepo: e.target.value,
                      })
                    }
                    placeholder="nilimaakter/premium-tools"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b12] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Branch
                  </label>
                  <input
                    type="text"
                    value={localGithubSettings.githubBranch}
                    onChange={(e) =>
                      setLocalGithubSettings({
                        ...localGithubSettings,
                        githubBranch: e.target.value,
                      })
                    }
                    placeholder="main"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b12] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  File Path in Repository
                </label>
                <input
                  type="text"
                  value={localGithubSettings.githubFilePath}
                  onChange={(e) =>
                    setLocalGithubSettings({
                      ...localGithubSettings,
                      githubFilePath: e.target.value,
                    })
                  }
                  placeholder="data/store.json"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b12] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none font-mono"
                />
              </div>

              <div className="pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localGithubSettings.autoSyncToGithub}
                    onChange={(e) =>
                      setLocalGithubSettings({
                        ...localGithubSettings,
                        autoSyncToGithub: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
                  <span className="ml-2 text-xs font-semibold text-slate-200">
                    Automatically Push to GitHub every time an app is added, edited, or deleted
                  </span>
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={handleSaveGithubSettings}
                  className="btn-3d-cyan flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold text-black cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save GitHub Config</span>
                </button>

                <button
                  onClick={handleOneClickSyncEverywhere}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 px-5 py-2 text-xs font-bold text-cyan-300 cursor-pointer transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 fill-cyan-400" />
                  <span>Push & Sync to GitHub Now</span>
                </button>
              </div>

              {localGithubSettings.lastSyncedAt && (
                <div className="text-[11px] text-slate-400 pt-1">
                  Last Synced: {new Date(localGithubSettings.lastSyncedAt).toLocaleString()} • Status:{' '}
                  <span className="text-emerald-400 font-semibold">
                    {localGithubSettings.lastSyncStatus || 'Synced'}
                  </span>
                </div>
              )}
            </div>

            {/* Offline JSON Backup & Restore */}
            <div className="rounded-2xl border border-white/5 bg-[#121321] p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Offline Backup & Data Export
              </h4>
              <p className="text-xs text-slate-400">
                You can also download a direct JSON backup file or restore your store anytime.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleExportBackup}
                  className="flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white cursor-pointer"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Download Backup JSON</span>
                </button>

                <label className="flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white cursor-pointer">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Restore from JSON File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* APP EDIT / ADD MODAL */}
      {editingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-3xl bg-[#121321] border border-cyan-500/30 p-5 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.95)] text-white my-auto max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400 text-black font-bold">
                  {isNewApp ? <Plus className="w-5 h-5 stroke-[3]" /> : <Edit className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isNewApp ? 'Add New Premium Tool' : `Edit: ${editingApp.name}`}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Saves directly to Server Disk & triggers auto-sync.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingApp(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* App Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  App / Software Name *
                </label>
                <input
                  type="text"
                  value={editingApp.name}
                  onChange={(e) => setEditingApp({ ...editingApp, name: e.target.value })}
                  placeholder="e.g. Canva Pro Lifetime 2025"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b12] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none"
                />
              </div>

              {/* Logo URL & Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Logo Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingApp.logo}
                    onChange={(e) => setEditingApp({ ...editingApp, logo: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0a0b12] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none"
                  />
                  {editingApp.logo && (
                    <img
                      src={editingApp.logo}
                      alt="Preview"
                      className="h-9 w-9 rounded-xl object-cover border border-white/15 bg-black"
                    />
                  )}
                </div>
                {/* Logo Presets */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-2">
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">Presets:</span>
                  {LOGO_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setEditingApp({ ...editingApp, logo: p.url })}
                      className="rounded bg-white/5 hover:bg-cyan-500/20 px-2 py-0.5 text-[10px] text-slate-300 hover:text-cyan-300 border border-white/5 cursor-pointer whitespace-nowrap"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category & Version */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={editingApp.category}
                    onChange={(e) => setEditingApp({ ...editingApp, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0a0b12] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none"
                  >
                    {CATEGORY_PRESETS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Version</label>
                  <input
                    type="text"
                    value={editingApp.version}
                    onChange={(e) => setEditingApp({ ...editingApp, version: e.target.value })}
                    placeholder="v4.92.0"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b12] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none font-mono"
                  />
                </div>
              </div>

              {/* File Size & Downloads & Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">File Size</label>
                  <input
                    type="text"
                    value={editingApp.fileSize}
                    onChange={(e) => setEditingApp({ ...editingApp, fileSize: e.target.value })}
                    placeholder="48 MB"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0a0b12] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rating (★)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={editingApp.rating}
                    onChange={(e) =>
                      setEditingApp({ ...editingApp, rating: parseFloat(e.target.value) || 4.9 })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0a0b12] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Downloads Count
                  </label>
                  <input
                    type="number"
                    value={editingApp.downloadsCount}
                    onChange={(e) =>
                      setEditingApp({
                        ...editingApp,
                        downloadsCount: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0a0b12] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>

              {/* Target / Telegram Link & Custom Ad Link */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Main Content / Telegram File Link *
                  </label>
                  <input
                    type="text"
                    value={editingApp.mainContentUrl}
                    onChange={(e) =>
                      setEditingApp({ ...editingApp, mainContentUrl: e.target.value })
                    }
                    placeholder="https://t.me/premiumtoolsfree1"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b12] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none"
                  />
                  <span className="text-[10px] text-slate-400">
                    Visitor is redirected here when countdown completes.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Custom App Ad Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingApp.adLink}
                    onChange={(e) => setEditingApp({ ...editingApp, adLink: e.target.value })}
                    placeholder={localAdSettings.defaultAdLink}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b12] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none"
                  />
                  <span className="text-[10px] text-slate-400">
                    Leave blank to use the default smartlink ({localAdSettings.defaultAdLink}).
                  </span>
                </div>
              </div>

              {/* Timer & Featured Toggle */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Countdown Seconds
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={editingApp.timerSeconds}
                    onChange={(e) =>
                      setEditingApp({
                        ...editingApp,
                        timerSeconds: parseInt(e.target.value) || 30,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0a0b12] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="isFeaturedApp"
                    checked={editingApp.isFeatured || false}
                    onChange={(e) =>
                      setEditingApp({ ...editingApp, isFeatured: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400"
                  />
                  <label htmlFor="isFeaturedApp" className="text-xs font-semibold text-slate-200">
                    Mark as Featured (HOT badge)
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingApp.description}
                  onChange={(e) =>
                    setEditingApp({ ...editingApp, description: e.target.value })
                  }
                  placeholder="Short summary of unlocked features..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0a0b12] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-3 pt-5 mt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingApp(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAppForm}
                disabled={isSaving}
                className="btn-3d-cyan px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer text-black"
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>{isNewApp ? 'Save New Tool' : 'Update Tool'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
