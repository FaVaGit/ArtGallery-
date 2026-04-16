import { apiRequest } from "./client";
import { isDemoMode, demoLogin, demoGetCurrentUser, DEMO_TOKEN } from "../demo/demoMode";
import type { LoginResponse } from "../types";

export async function login(username: string, password: string): Promise<LoginResponse> {
  if (isDemoMode()) {
    const result = demoLogin(username, password);
    if (!result) throw new Error("Invalid demo credentials (use admin / demo)");
    return result;
  }
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function getCurrentUser(token: string): Promise<{ user: LoginResponse["user"] }> {
  if (isDemoMode() && token === DEMO_TOKEN) {
    const result = demoGetCurrentUser();
    if (result) return result;
  }
  return apiRequest<{ user: LoginResponse["user"] }>("/auth/me", {
    method: "GET",
    token,
  });
}
