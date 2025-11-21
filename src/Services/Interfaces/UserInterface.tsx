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
