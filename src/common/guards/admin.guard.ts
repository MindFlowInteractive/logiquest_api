// src/common/guards/admin.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Simple admin guard that checks if the request user has role "admin".
 * Assumes an authentication guard (e.g., JwtAuthGuard) has already attached a
 * `user` object to the request.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    // If no user or role, deny access
    if (!user || !user.role) {
      return false;
    }
    // Allow if role includes 'admin'
    if (Array.isArray(user.role)) {
      return user.role.includes('admin');
    }
    return user.role === 'admin';
  }
}
