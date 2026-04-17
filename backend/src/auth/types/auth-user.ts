/**
 * Interface representing the authenticated user.
 */
export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'agent' | 'user';
  isActive: boolean;
}
