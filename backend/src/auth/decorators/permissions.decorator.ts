import { SetMetadata } from '@nestjs/common';
import { Permission } from '../types/permissions.types';

/**
 * Custom decorator to specify required permissions for accessing a route.
 * @param {...Permission[]} permissions - The permissions required to access the route.
 * @returns {MethodDecorator & ClassDecorator} A decorator that sets the required permissions metadata.
 */
export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
