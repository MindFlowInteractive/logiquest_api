import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Placeholder: In real scenario, extract and validate JWT/token
    // For now, assume a user is attached to request for testing purposes
    if (!request.headers['authorization']) {
      throw new UnauthorizedException('Missing auth token');
    }
    // Mock user extraction
    request.user = { id: 'test-user-id', role: 'player' };
    return true;
  }
}
