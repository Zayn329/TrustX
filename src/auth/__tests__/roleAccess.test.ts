import { describe, expect, it } from 'vitest';
import { resolveWorkspaceRole } from '../roleAccess';

describe('resolveWorkspaceRole', () => {
  it('accepts the role asserted by the server token', () => {
    expect(resolveWorkspaceRole('company', 'company')).toEqual({ role: 'company' });
  });

  it('rejects a selected role that does not match the server token', () => {
    expect(resolveWorkspaceRole('company', 'researcher')).toEqual({
      error: 'This account is not authorized for the Company workspace.'
    });
  });

  it('rejects an account without a supported server role', () => {
    expect(resolveWorkspaceRole('researcher', undefined)).toEqual({
      error: 'Your account has not been assigned a TrustX workspace role.'
    });
  });
});
