export const dynamic = 'force-dynamic';
// GET /api/releases/check?version=1.0.0 — check if a desktop app update is available
//
// Called by the desktop app on startup (no auth required).
// Compares the provided version against the latest GitHub release using semver.

import { NextRequest, NextResponse } from 'next/server';
import { checkDistributedRateLimit } from '@/lib/distributedRateLimit';

const GITHUB_OWNER = 'YachtingAdvisors';
const GITHUB_REPO = 'becandid';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface LatestRelease {
  version: string;
  downloadUrl: string | null;
  releaseNotes: string | null;
  fetchedAt: number;
}

let cache: LatestRelease | null = null;

// ─── Simple semver comparison (major.minor.patch) ────────────
// Returns  1 if a > b
//         -1 if a < b
//          0 if equal
function compareSemver(a: string, b: string): number {
  const pa = a.replace(/^v/, '').split('.').map(Number);
  const pb = b.replace(/^v/, '').split('.').map(Number);
  const len = Math.max(pa.length, pb.length);

  for (let i = 0; i < len; i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }

  return 0;
}

function isValidVersion(v: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(v.replace(/^v/, ''));
}

async function fetchLatestRelease(): Promise<LatestRelease> {
  // Return cache if fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache;
  }

  const ghToken = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'BeCandid-Web',
  };
  if (ghToken) headers.Authorization = `Bearer ${ghToken}`;

  let release: any = null;

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`,
    { headers, next: { revalidate: 300 } }
  );

  if (res.ok) {
    release = await res.json();
  } else {
    // Fallback: list releases and pick first non-draft
    const listRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases?per_page=5`,
      { headers, next: { revalidate: 300 } }
    );

    if (!listRes.ok) throw new Error('Unable to fetch releases from GitHub');

    const releases = await listRes.json();
    if (!releases.length) throw new Error('No releases found');
    release = releases.find((r: any) => !r.draft) ?? releases[0];
  }

  // Pick the first downloadable asset (prefer .dmg or .exe)
  const assets: any[] = release.assets ?? [];
  const downloadAsset =
    assets.find((a: any) => /\.(dmg|exe)$/i.test(a.name)) ??
    assets[0] ??
    null;

  const result: LatestRelease = {
    version: release.tag_name?.replace(/^v/, '') ?? '0.0.0',
    downloadUrl: downloadAsset?.browser_download_url ?? null,
    releaseNotes: release.body ?? null,
    fetchedAt: Date.now(),
  };

  cache = result;
  return result;
}

export async function GET(req: NextRequest) {
  // ── Rate limit by IP ────────────────────────────────────────
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const blocked = await checkDistributedRateLimit({
    scope: 'release-check',
    key: ip,
    max: 30,
    windowMs: 3_600_000,
  });
  if (blocked) return blocked;

  // ── Validate version param ──────────────────────────────────
  const { searchParams } = new URL(req.url);
  const version = searchParams.get('version');

  if (!version) {
    return NextResponse.json(
      { error: 'Missing required query parameter: version (e.g. ?version=1.0.0)' },
      { status: 400 }
    );
  }

  if (!isValidVersion(version)) {
    return NextResponse.json(
      { error: 'Invalid version format. Expected semver like 1.0.0' },
      { status: 400 }
    );
  }

  // ── Fetch latest release info ───────────────────────────────
  try {
    const latest = await fetchLatestRelease();
    const currentVersion = version.replace(/^v/, '');
    const updateAvailable = compareSemver(latest.version, currentVersion) > 0;

    return NextResponse.json({
      updateAvailable,
      currentVersion,
      latestVersion: latest.version,
      downloadUrl: updateAvailable ? latest.downloadUrl : null,
      releaseNotes: updateAvailable ? latest.releaseNotes : null,
    });
  } catch (err) {
    console.error('Failed to check for updates:', err);

    // Return stale cache if available
    if (cache) {
      const currentVersion = version.replace(/^v/, '');
      const updateAvailable = compareSemver(cache.version, currentVersion) > 0;
      return NextResponse.json({
        updateAvailable,
        currentVersion,
        latestVersion: cache.version,
        downloadUrl: updateAvailable ? cache.downloadUrl : null,
        releaseNotes: updateAvailable ? cache.releaseNotes : null,
      });
    }

    return NextResponse.json(
      { error: 'Failed to check for updates' },
      { status: 502 }
    );
  }
}
