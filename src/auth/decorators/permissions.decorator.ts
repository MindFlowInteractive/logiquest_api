import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);

export const REQUIRE_ANY_PERMISSION_KEY = 'requireAnyPermission';
export const RequireAnyPermission = (...permissions: string[]) => SetMetadata(REQUIRE_ANY_PERMISSION_KEY, permissions);

export const ROLES_KEY = 'roles';
export const RequireRoles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const POLICY_KEY = 'policy';
export interface PolicyDefinition {
  resource: string;
  action: string;
  attributes?: Record<string, any>;
}
export const RequirePolicy = (policy: PolicyDefinition) => SetMetadata(POLICY_KEY, policy);