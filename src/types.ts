export interface AppItem {
  id: string;
  name: string;
  logo: string;
  category: string;
  description: string;
  version: string;
  fileSize: string;
  adLink: string;
  customAdCode?: string;
  sponsorName?: string;
  sponsorLink?: string;
  mainContentUrl: string;
  timerSeconds: number;
  downloadsCount: number;
  rating: number;
  isFeatured?: boolean;
  createdAt: number;
}

export interface AdSettings {
  defaultAdLink: string;
  defaultMainContentUrl: string;
  defaultTimerSec: number;
  autoRedirect: boolean;
  openAdInNewTab: boolean;
  popunderOnClick: boolean;
  popunderCooldownMinutes: number;
  headerScript: string;
  topBannerCode: string;
  downloadBannerCode: string;
  floatingSocialBarCode: string;
  showTopBanner: boolean;
  showDownloadBanner: boolean;
  enableImpressionBoost: boolean;
}

export interface SiteSettings {
  siteTitle: string;
  siteSubtitle: string;
  telegramChannel: string;
  announcement: string;
  adminPassword: string;
}

export interface GitHubSyncSettings {
  githubToken: string;
  githubRepo: string; // e.g. "username/repo"
  githubBranch: string; // "main"
  githubFilePath: string; // "data/store.json"
  autoSyncToGithub: boolean;
  lastSyncedAt: number | null;
  lastSyncStatus?: string;
}

export interface StoreData {
  apps: AppItem[];
  adSettings: AdSettings;
  siteSettings: SiteSettings;
  githubSettings: GitHubSyncSettings;
  version: number;
  updatedAt: number;
}
