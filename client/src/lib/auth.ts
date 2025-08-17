import { apiRequest } from "./queryClient";
import type { LoginResponse } from "@/types";

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await apiRequest("POST", "/api/auth/login", {
    email,
    password,
  });
  
  return response.json();
}

export async function requestAdminAccess(userData: any, adminData: any): Promise<void> {
  await apiRequest("POST", "/api/auth/request-admin-access", {
    user: userData,
    admin: adminData,
  });
}

export function getAuthToken(): string | null {
  return localStorage.getItem("token");
}

export function setAuthToken(token: string): void {
  localStorage.setItem("token", token);
}

export function removeAuthToken(): void {
  localStorage.removeItem("token");
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
