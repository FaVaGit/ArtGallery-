import jwt, { type SignOptions } from "jsonwebtoken";

import type { AuthUser, LoginResult, UserRole } from "../types/auth.js";
import { HttpError } from "../utils/httpError.js";

interface StoredUser {
  username: string;
  password: string;
  role: UserRole;
}

interface JwtPayload {
  username: string;
  role: UserRole;
}

const DEFAULT_EXPIRES_IN = "12h";

function getJwtSecret(): string {
  const secret = process.env.AUTH_JWT_SECRET;

  if (!secret) {
    throw new HttpError(500, "AUTH_JWT_SECRET is required");
  }

  return secret;
}

function parseUsers(): StoredUser[] {
  const usersJson = process.env.AUTH_USERS_JSON;

  if (!usersJson) {
    throw new HttpError(500, "AUTH_USERS_JSON is required");
  }

  try {
    const parsed = JSON.parse(usersJson) as unknown;

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("No users configured");
    }

    const users = parsed.map((entry) => {
      const username = typeof entry?.username === "string" ? entry.username.trim() : "";
      const password = typeof entry?.password === "string" ? entry.password : "";
      const role = entry?.role;

      if (!username || !password || (role !== "admin" && role !== "viewer")) {
        throw new Error("Invalid user entry");
      }

      return { username, password, role };
    });

    return users;
  } catch {
    throw new HttpError(500, "Invalid AUTH_USERS_JSON format");
  }
}

export function login(username: string, password: string): LoginResult {
  const users = parseUsers();
  const normalizedUsername = username.trim();

  const user = users.find((entry) => entry.username === normalizedUsername);

  if (!user || user.password !== password) {
    throw new HttpError(401, "Invalid username or password");
  }

  const authUser: AuthUser = {
    username: user.username,
    role: user.role,
  };

  const expiresInRaw = process.env.AUTH_JWT_EXPIRES_IN ?? DEFAULT_EXPIRES_IN;
  const signOptions: SignOptions = {
    expiresIn: expiresInRaw as SignOptions["expiresIn"],
  };

  const token = jwt.sign(
    {
      username: authUser.username,
      role: authUser.role,
    },
    getJwtSecret(),
    signOptions,
  );

  return {
    token,
    expiresIn: expiresInRaw,
    user: authUser,
  };
}

export function verifyToken(token: string): AuthUser {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as JwtPayload;

    if (!payload.username || (payload.role !== "admin" && payload.role !== "viewer")) {
      throw new HttpError(401, "Invalid auth token payload");
    }

    return {
      username: payload.username,
      role: payload.role,
    };
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }
}
