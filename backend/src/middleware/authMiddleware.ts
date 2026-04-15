import type { NextFunction, Request, Response } from "express";

import type { UserRole } from "../types/auth.js";
import { verifyToken } from "../services/authService.js";
import { HttpError } from "../utils/httpError.js";

function readBearerToken(authorizationHeader?: string): string {
  if (!authorizationHeader) {
    throw new HttpError(401, "Authorization header is required");
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new HttpError(401, "Authorization must be Bearer token");
  }

  return token;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token = readBearerToken(req.header("authorization"));
    req.authUser = verifyToken(token);
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.authUser) {
        throw new HttpError(401, "Authentication required");
      }

      if (!allowedRoles.includes(req.authUser.role)) {
        throw new HttpError(403, "Insufficient role permissions");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
