/**
 * Enum representing various permissions in the system.
 */
export enum Permission {
  USERS_VIEW = 'users:view',
  USERS_DELETE = 'users:delete',
  USERS_UPDATE = 'users:update',
  ADMIN_USER_CREATE = 'admin:user:create',
  ADMIN_USER_ACTIVATE = 'admin:user:activate',
  UPDATE_USER_ROLE = 'update:user:role',
  REAL_ESTATE_CREATE = 'realestate:create',
  REAL_ESTATE_UPDATE = 'realestate:update',
  REAL_ESTATE_DELETE = 'realestate:delete',
  MANAGE_RESERVATIONS = 'reservations:manage',
  RESERVATION_CREATE = 'reservations:create',
  PAYMENT_VIEW = 'payment:view',
  PAYMENT_CREATE = 'payment:create',
  PAYMENT_UPDATE = 'payment:update',
  PAYMENT_DELETE = 'payment:delete',
  CONTRACT_VIEW = 'contract:view',
  CONTRACT_CREATE = 'contract:create',
  CONTRACT_UPDATE = 'contract:update',
  CONTRACT_DELETE = 'contract:delete',
  VIEW_STATS = 'stats:view',
}

/**
 * Type representing user roles in the system.
 */
export type UserRole = 'admin' | 'agent' | 'user';

/**
 * Mapping of user roles to their associated permissions.
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    Permission.USERS_VIEW,
    Permission.USERS_DELETE,
    Permission.USERS_UPDATE,
    Permission.ADMIN_USER_CREATE,
    Permission.ADMIN_USER_ACTIVATE,
    Permission.UPDATE_USER_ROLE,
    Permission.REAL_ESTATE_CREATE,
    Permission.REAL_ESTATE_UPDATE,
    Permission.REAL_ESTATE_DELETE,
    Permission.MANAGE_RESERVATIONS,
    Permission.RESERVATION_CREATE,
    Permission.PAYMENT_VIEW,
    Permission.PAYMENT_CREATE,
    Permission.PAYMENT_UPDATE,
    Permission.PAYMENT_DELETE,
    Permission.CONTRACT_VIEW,
    Permission.CONTRACT_CREATE,
    Permission.CONTRACT_UPDATE,
    Permission.CONTRACT_DELETE,
    Permission.VIEW_STATS,
  ],
  agent: [
    Permission.REAL_ESTATE_CREATE,
    Permission.REAL_ESTATE_UPDATE,
    Permission.REAL_ESTATE_DELETE,
    Permission.MANAGE_RESERVATIONS,
    Permission.RESERVATION_CREATE,
    Permission.PAYMENT_VIEW,
    Permission.PAYMENT_CREATE,
    Permission.PAYMENT_UPDATE,
    Permission.PAYMENT_DELETE,
    Permission.CONTRACT_VIEW,
    Permission.CONTRACT_CREATE,
    Permission.CONTRACT_UPDATE,
    Permission.CONTRACT_DELETE,
    Permission.VIEW_STATS,
  ],
  user: [Permission.RESERVATION_CREATE],
};
