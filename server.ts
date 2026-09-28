import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const STORE_PATH = path.resolve(__dirname, 'data/store.json');

app.use(express.json({ limit: '10mb' }));

// Helper for GitHub sync
async function syncToGitHubApi(params: {
  token: string;
  repo: string;
  branch?: string;
  filePath?: string;
  content: string;
}) {
  const { token, repo, branch = 'main', filePath = 'data/store.json', content } = params;

  if (!token || !repo) {
    throw new Error('GitHub token and repository (owner/repo) are required');
  }

  const cleanRepo = repo.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '').trim();
  const cleanPath = filePath.replace(/^\/+/, '').trim();
  const targetBranch = branch.trim() || 'main';

  const baseUrl = `https://api.github.com/repos/${cleanRepo}/contents/${cleanPath}`;

  let fileSha: string | undefined;
  try {
    const getRes = await fetch(`${baseUrl}?ref=${encodeURIComponent(targetBranch)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'PremiumStore-App',
      },
    });

    if (getRes.status === 200) {
      const existingData = (await getRes.json()) as { sha?: string };
      fileSha = existingData.sha;
    }
  } catch (err) {
    console.warn('[GitHub Sync] Error checking file sha:', err);
  }

  const base64Content = Buffer.from(content, 'utf-8').toString('base64');
  const putBody: Record<string, unknown> = {
    message: `chore: update premium tools & ads settings [${new Date().toISOString()}]`,
    content: base64Content,
    branch: targetBranch,
  };
  if (fileSha) {
    putBody.sha = fileSha;
  }

  const putRes = await fetch(baseUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token.trim()}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'PremiumStore-App',
    },
    body: JSON.stringify(putBody),
  });

  if (!putRes.ok) {
    const errorData = await putRes.text();
    throw new Error(`GitHub API error (${putRes.status}): ${errorData}`);
  }

  return await putRes.json();
}

// GET /api/store
app.get('/api/store', (req, res) => {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const content = fs.readFileSync(STORE_PATH, 'utf-8');
      res.setHeader('Content-Type', 'application/json');
      res.send(content);
      return;
    }
    res.status(404).json({ error: 'Store file not found' });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /api/store
app.post('/api/store', async (req, res) => {
  try {
    const parsed = req.body;
    const dataDir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const jsonString = JSON.stringify(parsed, null, 2);
    fs.writeFileSync(STORE_PATH, jsonString, 'utf-8');

    let githubResult: unknown = null;
    if (parsed?.githubSettings?.autoSyncToGithub && parsed?.githubSettings?.githubToken && parsed?.githubSettings?.githubRepo) {
      try {
        githubResult = await syncToGitHubApi({
          token: parsed.githubSettings.githubToken,
          repo: parsed.githubSettings.githubRepo,
          branch: parsed.githubSettings.githubBranch || 'main',
          filePath: parsed.githubSettings.githubFilePath || 'data/store.json',
          content: jsonString,
        });
      } catch (ghErr) {
        console.warn('[Auto GitHub Sync Failed]:', ghErr);
      }
    }

    res.json({ success: true, updatedAt: Date.now(), githubResult });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /api/github/sync
app.post('/api/github/sync', async (req, res) => {
  try {
    const { token, repo, branch, filePath } = req.body;
    let content = req.body.content;

    if (!content) {
      if (fs.existsSync(STORE_PATH)) {
        content = fs.readFileSync(STORE_PATH, 'utf-8');
      } else {
        throw new Error('No content provided and data/store.json does not exist');
      }
    }

    const result = await syncToGitHubApi({
      token,
      repo,
      branch,
      filePath,
      content: typeof content === 'string' ? content : JSON.stringify(content, null, 2),
    });

    res.json({ success: true, result });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// Serve frontend dist files if built
const distPath = path.resolve(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
