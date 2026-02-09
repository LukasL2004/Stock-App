export interface User {
  id: number;
  email: string;
  password: string;
}

export interface Login {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface ForgotPassword {
  email: string;
}

export interface resetPassword {
  email: string;
  password: string;
  code: string;
}
