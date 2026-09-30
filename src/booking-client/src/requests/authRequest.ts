import { httpClient } from "../lib/httpClient";
import type { LoginPayload, RegisterPayload, UserProfile } from "../types/auth";

export const authRequest = {
  login: (payload: LoginPayload) =>
    httpClient.post<string>("/Auth/login", {
      username: payload.username || payload.email,
      email: payload.email,
      password: payload.password,
    }),
  logout: () =>
    httpClient.post<void>("/Auth/logout", {}, { authenticated: true }),
  register: (payload: RegisterPayload) =>
    httpClient.post<string>("/Auth/register", {
      username: payload.username || payload.email,
      email: payload.email,
      password: payload.password,
      companyName: payload.companyName,
      department: payload.department,
    }),

  getProfile: () =>
    httpClient.get<UserProfile>("/Auth/me", { authenticated: true }),
};
