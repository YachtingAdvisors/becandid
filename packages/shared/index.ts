export * from './types';
export * from './schemas';

// Re-export utility functions from types (getCategoryEmoji is defined there now)
// Additional utils below:

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function getSeverityWeight(severity: 'low' | 'medium' | 'high'): number {
  return { low: 1, medium: 2, high: 3 }[severity];
}

export function generateInviteToken(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Last resort — still better than Math.random
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain || !user) return '***@***';
  if (user.length <= 2) return `${user[0]}***@${domain}`;
  return `${user[0]}${'*'.repeat(Math.min(user.length - 2, 6))}${user[user.length - 1]}@${domain}`;
}
