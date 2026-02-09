import {
  type AuthResponse,
  type ForgotPassword,
  type Login,
  type resetPassword,
} from "./Interfaces/UserInterface";

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
        throw new Error("Incorect credentials");
      }
      const data: AuthResponse = await response.json();

      return data;

      return data;
    } catch (error) {
      console.error("error is: ", error);
      throw error;
    }
  },
  ForgotPassword: async (credentials: ForgotPassword): Promise<string> => {
    try {
      const response: Response = await fetch(`${API_URL}/forgotPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        throw new Error("Sorry the email was not found");
      }

      const data = await response.text();
      return data;
    } catch (e) {
      console.log(e);
      throw e;
    }
  },
  ResetPassword: async (reset: resetPassword): Promise<string> => {
    try {
      const response: Response = await fetch(`${API_URL}/resetPassword`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reset),
      });

      if (!response.ok) {
        throw new Error("Sorry wrong credentials");
      }

      const data = await response.text();
      return data;
    } catch (e) {
      console.log(e);
      throw e;
    }
  },
};

export default authService;
