import * as fs from 'fs';

let content = fs.readFileSync('apps/web/app/api/coach/__tests__/route.test.ts', 'utf8');

// Wait, the checkCoachLimit mock is `vi.mock('@/lib/coachLimits', () => ({ checkCoachLimit: vi.fn(async () => true) }));`
// But it returns `{ allowed: true }` in the real implementation probably. Let's see: `if (!coachLimit.allowed) { return 403 }`
// So my mock returns `true` which evaluates `if (!true.allowed)` to true, so it returns 403!

content = content.replace(
  /vi\.mock\('@\/lib\/coachLimits', \(\) => \(\{ checkCoachLimit: vi\.fn\(async \(\) => true\) \}\)\);/,
  "vi.mock('@/lib/coachLimits', () => ({ checkCoachLimit: vi.fn(async () => ({ allowed: true })) }));"
);

fs.writeFileSync('apps/web/app/api/coach/__tests__/route.test.ts', content, 'utf8');
