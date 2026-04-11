export const dynamic = 'force-dynamic';
// GET /api/releases — fetch latest desktop release info from GitHub
//
// Returns download URLs, version, and file sizes for the download page.
// Caches for 5 minutes to avoid hitting GitHub rate limits.

import { NextResponse } from 'next/server';

const GITHUB_OWNER = 'YachtingAdvisors';
const GITHUB_REPO = 'becandid';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CachedRelease {
  data: ReleaseInfo;
  fetchedAt: number;
}

interface ReleaseAsset {
  name: string;
  url: string;
  size: number;
}

interface ReleaseInfo {
  version: string;
  tag: string;
  publishedAt: string;
  assets: {
    windowsX64: ReleaseAsset | null;
    windowsArm64: ReleaseAsset | null;
    macDmg: ReleaseAsset | null;
    macZip: ReleaseAsset | null;
  };
}

let cache: CachedRelease | null = null;

function classifyAsset(name: string): keyof ReleaseInfo['assets'] | null {
  const lower = name.toLowerCase();
  if (lower.endsWith('.exe') && lower.includes('x64')) return 'windowsX64';
  if (lower.endsWith('.exe') && !lower.includes('x64')) return 'windowsArm64';
  if (lower.endsWith('.dmg')) return 'macDmg';
  if (lower.endsWith('.zip') && lower.includes('mac')) return 'macZip';
  // Fallback: if it's an .exe without x64, treat as ARM64
  if (lower.endsWith('.exe')) return 'windowsArm64';
  return null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function GET() {
  // Return cache if fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json(cache.data);
  }

  try {
    const ghToken = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'BeCandid-Web',
    };
    if (ghToken) headers.Authorization = `Bearer ${ghToken}`;

    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`,
      { headers, next: { revalidate: 300 } }
    );

    if (!res.ok) {
      // If no "latest" release, try listing all releases and pick first
      const listRes = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases?per_page=5`,
        { headers, next: { revalidate: 300 } }
      );

      if (!listRes.ok) {
        return NextResponse.json({ error: 'Unable to fetch releases' }, { status: 502 });
      }

      const releases = await listRes.json();
      if (!releases.length) {
        return NextResponse.json({ error: 'No releases found' }, { status: 404 });
      }

      // Use the first non-draft release
      const release = releases.find((r: any) => !r.draft) ?? releases[0];
      const data = buildReleaseInfo(release);
      cache = { data, fetchedAt: Date.now() };
      return NextResponse.json(data);
    }

    const release = await res.json();
    const data = buildReleaseInfo(release);
    cache = { data, fetchedAt: Date.now() };
    return NextResponse.json(data);
  } catch (err) {
    console.error('Failed to fetch GitHub releases:', err);
    // Return stale cache if available
    if (cache) return NextResponse.json(cache.data);
    return NextResponse.json({ error: 'Failed to fetch releases' }, { status: 502 });
  }
}

function buildReleaseInfo(release: any): ReleaseInfo {
  const assets: ReleaseInfo['assets'] = {
    windowsX64: null,
    windowsArm64: null,
    macDmg: null,
    macZip: null,
  };

  for (const asset of release.assets ?? []) {
    const key = classifyAsset(asset.name);
    if (key && !assets[key]) {
      assets[key] = {
        name: asset.name,
        url: asset.browser_download_url,
        size: asset.size,
      };
    }
  }

  return {
    version: release.tag_name?.replace(/^v/, '') ?? '0.0.0',
    tag: release.tag_name ?? '',
    publishedAt: release.published_at ?? release.created_at ?? '',
    assets,
  };
}
