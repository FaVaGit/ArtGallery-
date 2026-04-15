export type UserRole = "admin" | "viewer";

export interface AuthUser {
  username: string;
  role: UserRole;
}

export interface LoginResult {
  token: string;
  expiresIn: string;
  user: AuthUser;
}
