import { User } from "./user.model";

export interface Session {
  expiresAt: string;
  token: string;
  createdAt: string;
  updatedAt: string;
  ipAddress: string;
  userAgent: string;
  userId: string;
  id: string;
}

export interface SessionResponse {
  session: Session;
  user: User;
}

export interface LoginResponse {
  token: string;
  user: User;
  redirect: boolean;
}

export interface SignUpResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    image: string | null;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface SignUpDto{
  email: string;
  password: string;
  name: string;
  role?: string;
}