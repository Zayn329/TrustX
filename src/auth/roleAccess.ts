export type AccountRole = 'company' | 'researcher';

export type RoleResolution = { role: AccountRole } | { error: string };

export function resolveWorkspaceRole(
  selectedRole: AccountRole,
  tokenRole: unknown,
): RoleResolution {
  if (tokenRole !== 'company' && tokenRole !== 'researcher') {
    return { error: 'Your account has not been assigned a TrustX workspace role.' };
  }

  if (selectedRole !== tokenRole) {
    const workspace = selectedRole === 'company' ? 'Company' : 'Bug Reporter';
    return { error: `This account is not authorized for the ${workspace} workspace.` };
  }

  return { role: tokenRole };
}
