import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthorizationService } from '../services/authorization.service';
import { PERMISSIONS_KEY, REQUIRE_ANY_PERMISSION_KEY, ROLES_KEY, POLICY_KEY, PolicyDefinition } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authorizationService: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get the user from the request
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      return false;
    }
    
    // Check for required permissions
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    
    if (requiredPermissions) {
      return this.authorizationService.hasPermissions(user.id, requiredPermissions);
    }
    
    // Check for "any permission" requirement
    const anyRequiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_ANY_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    
    if (anyRequiredPermissions) {
      return this.authorizationService.hasAnyPermission(user.id, anyRequiredPermissions);
    }
    
    // Check for required roles
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    
    if (requiredRoles) {
      const userRoles = await this.authorizationService.getUserRoles(user.id);
      const userRoleNames = userRoles.map(role => role.name);
      return requiredRoles.some(role => userRoleNames.includes(role));
    }
    
    // Check for policy requirement
    const policyDef = this.reflector.getAllAndOverride<PolicyDefinition>(
      POLICY_KEY,
      [context.getHandler(), context.getClass()],
    );
    
    if (policyDef) {
      // Get the resource from the request
      const resourceId = request.params.id;
      let resource;
      
      if (resourceId) {
        // Fetch the resource using the appropriate service
        // This is a simplified example - you would need to dynamically
        // determine which service to use based on the resource type
        const resourceService = request[${policyDef.resource.toLowerCase()}Service];
        if (resourceService) {
          resource = await resourceService.findById(resourceId);
        }
      } else {
        // For create operations where resource doesn't exist yet
        resource = request.body;
      }
      
      if (!resource) {
        return false;
      }
      
      // Evaluate the policy
      return this.authorizationService.evaluatePolicy({
        user,
        resource,
        action: policyDef.action,
        attributes: {
          ...policyDef.attributes,
          requestIp: request.ip,
          headers: request.headers,
        },
      });
    }
    
    // If no auth metadata is present, allow access
    return true;
  }
}
