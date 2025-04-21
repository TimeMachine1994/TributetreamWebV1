export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  jwt: string;
  user: UserInfo;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthError {
  status: number;
  name: string;
  message: string;
  details?: Record<string, unknown>;
}