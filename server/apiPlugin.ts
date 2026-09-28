import fs from 'node:fs';
import path from 'node:path';
import type { Plugin, ViteDevServer } from 'vite';

const STORE_PATH = path.resolve(process.cwd(), 'data/store.json');

async function syncToGitHubApi(params: {
  token: string;
  repo: string; // "owner/repo"
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

  // 1. Check if file already exists to get SHA
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
    console.warn('[GitHub Sync] Error checking existing file sha:', err);
  }

  // 2. Put file to GitHub
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

  const result = await putRes.json();
  return result;
}

export function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-plugin',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';

        // Handle GET /api/store
        if (url === '/api/store' && req.method === 'GET') {
          try {
            if (fs.existsSync(STORE_PATH)) {
              const fileContent = fs.readFileSync(STORE_PATH, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(fileContent);
              return;
            }
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Store file not found' }));
            return;
          } catch (err: unknown) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
            return;
          }
        }

        // Handle POST /api/store
        if (url === '/api/store' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body);
              const dataDir = path.dirname(STORE_PATH);
              if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
              }
              const jsonString = JSON.stringify(parsed, null, 2);
              fs.writeFileSync(STORE_PATH, jsonString, 'utf-8');

              // Auto sync to GitHub if enabled
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

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, updatedAt: Date.now(), githubResult }));
            } catch (err: unknown) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
            }
          });
          return;
        }

        // Handle POST /api/github/sync
        if (url === '/api/github/sync' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body);
              const { token, repo, branch, filePath } = payload;
              let content = payload.content;

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

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, result }));
            } catch (err: unknown) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}
