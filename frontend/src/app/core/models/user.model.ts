export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  role: 'admin' | 'agent' | 'user';
  isActive: boolean;
}

export interface UserFilterDto {
  role?: 'agent' | 'admin' | 'user';
  isActive?: boolean;
  email?: string;
  name?: string;
  createdAtMin?: string;
  createdAtMax?: string;
}

export interface UserResponse {
  items: User[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface UpdateProfileDto {
  name?: string;
  email?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export type ProfileUpdateResponse = User;

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'agent' | 'user';
}
