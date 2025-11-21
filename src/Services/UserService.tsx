import { type AuthResponse, type Login } from "./Interfaces/UserInterface";

const API_URL = "http://localhost:8080/api/users";

const authService = {
  login: async (loginData: Login): Promise<AuthResponse> => {
    try {
      const response: Response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });
      if (!response.ok) {
        throw new Error("User not found");
      }
      const data: AuthResponse = await response.json();

      localStorage.setItem("token", data.token);

      return data;
    } catch (error) {
      console.error("error is: ", error);
      throw error;
    }
  },
  register: async (registerData: Login): Promise<AuthResponse> => {
    try {
      const response: Response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });
      if (!response.ok) {
        throw new Error("User not found");
      }
      const data: AuthResponse = await response.json();

      localStorage.setItem("token", data.token);

      return data;
    } catch (error) {
      console.error("error is: ", error);
      throw error;
    }
  },
};
