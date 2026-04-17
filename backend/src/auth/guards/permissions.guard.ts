import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import {
  Permission,
  ROLE_PERMISSIONS,
  UserRole,
} from '../types/permissions.types';
import { auth } from '../../utils/auth';
import { Request } from 'express';

/**
 * Guard to handle route permissions and authentication.
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string | null;
    isActive?: boolean | null;
  };
  permissions?: Permission[];
}

/**
 * Helper function to convert Express headers to Fetch API Headers.
 * @param {Record<string, string | string[] | undefined>} expressHeaders - The headers from the Express request.
 * @returns {Headers} The converted Fetch API Headers.
 */
const expressHeadersToFetchHeaders = (
  expressHeaders: Record<string, string | string[] | undefined>,
) => {
  // Convert Express headers to Fetch API Headers
  const headers = new Headers();
  // Iterate over each header and append to Fetch Headers
  for (const [key, value] of Object.entries(expressHeaders)) {
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v);
    } else if (value) {
      headers.append(key, value);
    }
  }
  return headers;
};

@Injectable()
/**
 * PermissionsGuard checks if a user has the required permissions to access a route.
 */
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {} // Inject Reflector to access metadata

  /**
   * Determines if the current request can proceed based on route permissions and authentication.
   * @param {ExecutionContext} context - The execution context of the request.
   * @returns {Promise<boolean>} True if access is granted, otherwise throws an exception.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // Check if the route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    // Get session from BetterAuth
    const headers = expressHeadersToFetchHeaders(request.headers);
    const session = await auth.api.getSession({ headers });

    // If no authenticated user, throw UnauthorizedException
    if (!session?.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (!session.user.emailVerified) {
      throw new ForbiddenException(
        'Please verify your email to access this resource',
      );
    }

    // If user is not active, throw ForbiddenException
    if (session.user.isActive === false) {
      throw new ForbiddenException(
        'Your account has been deactivated. Please contact an administrator.',
      );
    }

    // This ensures @CurrentUser() decorator works even on routes without specific permissions
    request.user = session.user;

    // Get required permissions from metadata
    const requiredPermissions =
      this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];

    // If no specific permissions required, allow access (user is authenticated)
    if (requiredPermissions.length === 0) {
      const userRole = session.user.role as UserRole;
      const userPermissions = ROLE_PERMISSIONS[userRole] || [];
      request.permissions = userPermissions;
      return true;
    }

    // Check if user has all required permissions
    const userRole = session.user.role as UserRole;
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];

    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Insufficient permissions');
    }

    // Attach permissions to the request object for further use
    request.permissions = userPermissions;

    return true;
  }
}
