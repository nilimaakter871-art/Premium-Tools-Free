import { INITIAL_STORE_DATA } from '../data/initialData';
import { GitHubSyncSettings, StoreData } from '../types';

const LOCAL_STORAGE_KEY = 'ps_store_data_v2';
const POPUNDER_LAST_TRIGGER_KEY = 'ps_popunder_last_trigger';
const ADMIN_SESSION_KEY = 'ps_admin_session_auth';

export async function loadStoreData(): Promise<StoreData> {
  // 1. Try to fetch from server disk first
  try {
    const res = await fetch('/api/store');
    if (res.ok) {
      const serverData = (await res.json()) as StoreData;
      if (serverData && Array.isArray(serverData.apps) && serverData.apps.length > 0) {
        // Cache to localStorage
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serverData));
        } catch {
          // ignore
        }
        return serverData;
      }
    }
  } catch (err) {
    console.warn('[Storage] Could not load from /api/store, checking localStorage:', err);
  }

  // 2. Try localStorage
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local) as StoreData;
      if (parsed && Array.isArray(parsed.apps) && parsed.apps.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[Storage] Error reading localStorage:', err);
  }

  // 3. Fallback to INITIAL_STORE_DATA
  return INITIAL_STORE_DATA;
}

export async function persistStoreData(data: StoreData): Promise<{
  success: boolean;
  savedToServer: boolean;
  syncedToGithub?: boolean;
  error?: string;
}> {
  // Always update updatedAt
  const dataToSave: StoreData = {
    ...data,
    updatedAt: Date.now(),
  };

  // 1. Save to localStorage immediately
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (err) {
    console.error('[Storage] Error saving to localStorage:', err);
  }

  // 2. Save to server backend /api/store
  let savedToServer = false;
  let syncedToGithub = false;
  let serverError: string | undefined;

  try {
    const res = await fetch('/api/store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSave),
    });

    if (res.ok) {
      savedToServer = true;
      const resJson = await res.json();
      if (resJson.githubResult) {
        syncedToGithub = true;
      }
    } else {
      serverError = `Server responded with ${res.status}`;
    }
  } catch (err: unknown) {
    serverError = err instanceof Error ? err.message : String(err);
  }

  return {
    success: true,
    savedToServer,
    syncedToGithub,
    error: serverError,
  };
}

export async function pushToGitHubApi(
  settings: GitHubSyncSettings,
  dataToPush: StoreData
): Promise<{ success: boolean; message: string; commitUrl?: string }> {
  if (!settings.githubToken.trim() || !settings.githubRepo.trim()) {
    throw new Error('Please enter both your GitHub Token and Repository (e.g. username/repo)');
  }

  const res = await fetch('/api/github/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: settings.githubToken.trim(),
      repo: settings.githubRepo.trim(),
      branch: settings.githubBranch?.trim() || 'main',
      filePath: settings.githubFilePath?.trim() || 'data/store.json',
      content: JSON.stringify(dataToPush, null, 2),
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: 'Unknown GitHub sync error' }));
    throw new Error(errData.error || `Sync failed with status ${res.status}`);
  }

  const result = await res.json();
  const commitUrl = result?.result?.commit?.html_url || '';
  return {
    success: true,
    message: 'Successfully committed and pushed to GitHub repository!',
    commitUrl,
  };
}

// Popunder frequency control
export function canTriggerPopunder(cooldownMinutes: number = 1): boolean {
  if (typeof window === 'undefined') return false;
  if ((window as unknown as { __IS_ADMIN_MODE?: boolean }).__IS_ADMIN_MODE) return false;

  try {
    const last = localStorage.getItem(POPUNDER_LAST_TRIGGER_KEY);
    if (!last) return true;
    const diffMs = Date.now() - parseInt(last, 10);
    return diffMs > cooldownMinutes * 60 * 1000;
  } catch {
    return true;
  }
}

export function recordPopunderTrigger(): void {
  try {
    localStorage.setItem(POPUNDER_LAST_TRIGGER_KEY, Date.now().toString());
  } catch {
    // ignore
  }
}

// Admin session tracking
export function getAdminSession(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'authenticated';
  } catch {
    return false;
  }
}

export function setAdminSession(auth: boolean): void {
  try {
    if (auth) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'authenticated');
    } else {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
  } catch {
    // ignore
  }
}
