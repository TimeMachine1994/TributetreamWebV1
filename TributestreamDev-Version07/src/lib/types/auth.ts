export interface StrapiUser {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  role: StrapiRole;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiRole {
  id: number;
  name: string;
  description: string;
  type: string;
}

export interface LoginPayload {
  identifier: string; // Email or username
  password: string;
}

export interface AuthResponse {
  jwt: string;
  user: StrapiUser;
}
