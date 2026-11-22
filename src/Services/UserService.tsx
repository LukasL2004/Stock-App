import type { AuthResponse, ForgotPassword, Login, resetPassword, SignUp, User } from "./Interfaces/UserInterface";
import { request } from "../lib/http";

const BASE = "/api/users";

const authService = {
  login: (data: Login) => request<AuthResponse>(`${BASE}/login`, { method: "POST", body: data, auth: false }),
  register: (data: SignUp) => request<{ message: string }>(`${BASE}/register`, { method: "POST", body: data, auth: false }),
  ForgotPassword: (data: ForgotPassword) =>
    request<string>(`${BASE}/forgotPassword`, { method: "POST", body: data, auth: false, parse: "text" }),
  ResetPassword: (data: resetPassword) =>
    request<string>(`${BASE}/resetPassword`, { method: "PUT", body: data, auth: false, parse: "text" }),
  getUser: () => request<User>(BASE),
};

export default authService;
