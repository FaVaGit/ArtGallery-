import { apiRequest } from "./client";
import type { LoginResponse } from "../types";

export async function login(username: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function getCurrentUser(token: string): Promise<{ user: LoginResponse["user"] }> {
  return apiRequest<{ user: LoginResponse["user"] }>("/auth/me", {
    method: "GET",
    token,
  });
}
