import type { AuditLogInterface } from "./Interfaces/AuditLogInterface";
import { request } from "../lib/http";

const AuditLog = {
  GetAudit: () => request<AuditLogInterface[]>("/api/audit/get"),
};

export default AuditLog;
