import { describe, expect, it } from 'vitest';
import {
  getAudienceQueryConfig,
  normalizeAdminUserUpdate,
  readAuditMetadata,
} from '../adminTools';

describe('adminTools', () => {
  it('normalizes plan changes onto valid subscription status values', () => {
    const result = normalizeAdminUserUpdate({ subscription_plan: 'pro' });

    expect('error' in result).toBe(false);
    if ('update' in result) {
      expect(result.update).toEqual({
        subscription_plan: 'pro',
        subscription_status: 'active',
      });
    }
  });

  it('rejects invalid subscription statuses', () => {
    const result = normalizeAdminUserUpdate({ subscription_status: 'pro' });

    expect(result).toEqual({ error: 'Invalid subscription_status' });
  });

  it('treats free audience as free-or-null subscription plans', () => {
    expect(getAudienceQueryConfig('free')).toEqual({ includeNullPlan: true });
  });

  it('reads structured audit metadata from either metadata or legacy details', () => {
    expect(readAuditMetadata({ metadata: { sent: 5 } })).toEqual({ sent: 5 });
    expect(readAuditMetadata({ details: '{"subject":"Launch"}' })).toEqual({ subject: 'Launch' });
  });
});
