import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key used to flag a route handler (or controller) as publicly
 * accessible. A global authentication guard is expected to read this key and
 * skip JWT verification when it is present.
 *
 * @example
 * ```ts
 * @Injectable()
 * export class JwtAuthGuard implements CanActivate {
 *   canActivate(ctx: ExecutionContext): boolean {
 *     const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
 *       ctx.getHandler(),
 *       ctx.getClass(),
 *     ]);
 *     if (isPublic) return true;
 *     // ...verify token
 *   }
 * }
 * ```
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route or controller as public so it is excluded from JWT
 * authentication once a global auth guard is introduced. Health probes are
 * marked with this decorator because orchestrators (Kubernetes, load
 * balancers) must reach them without credentials.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
