import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthorizationService } from '../services/authorization.service';

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthorizationMiddleware.name);

  constructor(private authorizationService: AuthorizationService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Skip if no user (authentication middleware should run first)
      if (!req.user) {
        return next();
      }
      
      // Extract resource type and action from URL pattern
      // This is a simplified example - you would need a more robust approach
      // to map URLs to resources and actions
      const urlSegments = req.path.split('/').filter(Boolean);
      
      if (urlSegments.length >= 1) {
        const resourceType = urlSegments[0]; // e.g., 'users', 'documents'
        let action: string;
        
        // Determine action based on HTTP method
        switch (req.method) {
          case 'GET':
            action = 'read';
            break;
          case 'POST':
            action = 'create';
            break;
          case 'PUT':
          case 'PATCH':
            action = 'update';
            break;
          case 'DELETE':
            action = 'delete';
            break;
          default:
            action = 'access';
        }
        
        // Check if user has permission for this resource and action
        const permissionName = ${resourceType}:${action};
        const hasPermission = await this.authorizationService.hasPermission(req.user.id, permissionName);
        
        if (!hasPermission) {
          this.logger.warn(Access denied for user ${req.user.id} - missing permission: ${permissionName});
          return res.status(403).json({
            statusCode: 403,
            message: 'Forbidden: You do not have permission to access this resource',
          });
        }
      }
      
      next();
    } catch (error) {
      this.logger.error(Error in authorization middleware: ${error.message}, error.stack);
      res.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
      });
    }
  }
}