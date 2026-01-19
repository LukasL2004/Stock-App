import type { AuditLogInterface } from "./Interfaces/AuditLogInterface";

const API_URL = "http://localhost:8080/api/audit";

const AuditLog = {
  GetAudit: async (): Promise<AuditLogInterface[]> => {
    const token = localStorage.getItem("token");
    try {
      const response: Response = await fetch(`${API_URL}/get`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data: AuditLogInterface[] = await response.json();
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};

export default AuditLog;
