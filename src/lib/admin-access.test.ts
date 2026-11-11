import { describe, expect, it } from 'vitest';
import { adminAccessReady, advanceLogoClicks } from './admin-access';

describe('private admin access', () => {
  it('requires a current database-verified administrator', () => {
    expect(adminAccessReady('admin-a', 'admin-a', true)).toBe(true);
    expect(adminAccessReady('visitor', 'visitor', false)).toBe(false);
  });
  it('never carries permissions across account changes or sign-out', () => {
    expect(adminAccessReady('visitor', 'admin-a', true)).toBe(false);
    expect(adminAccessReady(undefined, 'admin-a', true)).toBe(false);
  });
  it('opens private entry on exactly five quick clicks', () => {
    let state = { count: 0, at: 0 };
    for (let i = 1; i <= 5; i++) {
      const next = advanceLogoClicks(state, i * 100);
      expect(next.openAdmin).toBe(i === 5);
      state = next;
    }
  });
  it('resets the sequence after a slow click', () => {
    expect(advanceLogoClicks({ count: 4, at: 100 }, 1000).openAdmin).toBe(false);
  });
});