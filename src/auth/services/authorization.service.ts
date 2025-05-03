import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { RoleRepository } from '../repositories/role.repository';
import { PermissionRepository } from '../repositories/permission.repository';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';

export interface PolicyEvaluationContext {
  user: User;
  resource: any;
  action: string;
  attributes?: Record<string, any>;
}

@Injectable()
export class AuthorizationService {
  private readonly logger = new Logger(AuthorizationService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private roleRepository: RoleRepository,
    private permissionRepository: PermissionRepository,
  ) {}

  // ---------- Role Management ----------

  async assignRoleToUser(userId: string, roleId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    
    if (!user) {
      throw new Error(User with ID ${userId} not found);
    }
    
    await this.userRepository
      .createQueryBuilder()
      .relation(User, 'roles')
      .of(userId)
      .add(roleId);
    
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<User> {
    await this.userRepository
      .createQueryBuilder()
      .relation(User, 'roles')
      .of(userId)
      .remove(roleId);
    
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    
    if (!user) {
      throw new Error(User with ID ${userId} not found);
    }
    
    return user.roles;
  }

  // ---------- Permission Management ----------

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });
    
    if (!user) {
      throw new Error(User with ID ${userId} not found);
    }
    
    // Collect all direct permissions from user roles
    const directPermissions = user.roles.flatMap(role => role.permissions || []);
    
    // Get all permissions including those from role hierarchy
    const allPermissions = new Set<string>();
    for (const role of user.roles) {
      const roleWithHierarchy = await this.roleRepository.findWithHierarchy(role.id);
      this.collectPermissionsFromRoleHierarchy(roleWithHierarchy, allPermissions);
    }
    
    // Get full permission objects
    return this.permissionRepository.findAllByNames(Array.from(allPermissions));
  }

  private collectPermissionsFromRoleHierarchy(
    role: Role, 
    permissionNames: Set<string>
  ): void {
    // Add direct permissions
    for (const permission of role.permissions || []) {
      permissionNames.add(permission.name);
    }
    
    // Recursively add permissions from child roles
    for (const childRole of role.children || []) {
      this.collectPermissionsFromRoleHierarchy(childRole, permissionNames);
    }
  }

  // ---------- Permission Checking ----------

  async hasPermission(userId: string, permissionName: string): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId);
      return permissions.some(p => p.name === permissionName);
    } catch (error) {
      this.logger.error(Error checking permission: ${error.message}, error.stack);
      return false;
    }
  }

  async hasPermissions(userId: string, permissionNames: string[]): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId);
      const userPermissionNames = permissions.map(p => p.name);
      return permissionNames.every(name => userPermissionNames.includes(name));
    } catch (error) {
      this.logger.error(Error checking permissions: ${error.message}, error.stack);
      return false;
    }
  }

  async hasAnyPermission(userId: string, permissionNames: string[]): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId);
      const userPermissionNames = permissions.map(p => p.name);
      return permissionNames.some(name => userPermissionNames.includes(name));
    } catch (error) {
      this.logger.error(Error checking permissions: ${error.message}, error.stack);
      return false;
    }
  }

  // ---------- Policy Evaluation (ABAC) ----------

  async evaluatePolicy(context: PolicyEvaluationContext): Promise<boolean> {
    try {
      // 1. RBAC check - verify user has the required permission
      const requiredPermission = ${context.resource.type || context.resource.constructor.name}:${context.action};
      const hasPermission = await this.hasPermission(context.user.id, requiredPermission);
      
      if (!hasPermission) {
        return false;
      }
      
      // 2. ABAC check - apply attribute-based policies
      return this.evaluateAttributeBasedPolicies(context);
    } catch (error) {
      this.logger.error(Error evaluating policy: ${error.message}, error.stack);
      return false;
    }
  }
  
  private evaluateAttributeBasedPolicies(context: PolicyEvaluationContext): boolean {
    // Check for resource ownership (common ABAC pattern)
    if (context.resource.ownerId && context.user.id === context.resource.ownerId) {
      return true;
    }
    
    // Check for department-based access
    if (
      context.resource.departmentId && 
      context.user.attributes?.departmentId === context.resource.departmentId
    ) {
      return true;
    }
    
    // Check for time-based restrictions
    const currentHour = new Date().getHours();
    if (
      context.user.attributes?.accessRestrictions?.timeLimit && 
      (currentHour < 9 || currentHour > 17)
    ) {
      return false;
    }
    
    // Check for location-based restrictions
    if (
      context.user.attributes?.accessRestrictions?.locationLimit &&
      context.attributes?.requestIp &&
      !this.isIpInAllowedRange(context.attributes.requestIp, context.user.attributes.allowedIpRanges)
    ) {
      return false;
    }
    
    // Custom logic based on resource type
    switch (context.resource.type || context.resource.constructor.name) {
      case 'Document':
        return this.evaluateDocumentPolicy(context);
      case 'Project':
        return this.evaluateProjectPolicy(context);
      default:
        // Default to role-based permission which was already checked
        return true;
    }
  }
  
  private evaluateDocumentPolicy(context: PolicyEvaluationContext): boolean {
    // Example: restrict access to classified documents based on user clearance
    if (
      context.resource.classificationLevel && 
      (!context.user.attributes?.clearanceLevel || 
       context.user.attributes.clearanceLevel < context.resource.classificationLevel)
    ) {
      return false;
    }
    
    return true;
  }
  
  private evaluateProjectPolicy(context: PolicyEvaluationContext): boolean {
    // Example: team-based access control
    if (
      context.resource.teamIds && 
      context.user.attributes?.teamIds &&
      !context.resource.teamIds.some(id => context.user.attributes.teamIds.includes(id))
    ) {
      return false;
    }
    
    return true;
  }
  
  private isIpInAllowedRange(ip: string, allowedRanges: string[]): boolean {
    // Implementation of IP range checking would go here
    // For simplicity, we're just returning true in this example
    return true;
  }
}