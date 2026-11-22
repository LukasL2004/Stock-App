import { clearSession, getToken } from "./auth";

export const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "http://localhost:8080";
export const WS_URL = `${API_URL}/ws`;
export const MOCK_MODE = import.meta.env.VITE_MOCK_API === "true";

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;
  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

type Method = "GET" | "POST" | "PUT" | "DELETE";

interface Options {
  method?: Method;
  body?: unknown;
  auth?: boolean;
  /** "json" (default) or "text" */
  parse?: "json" | "text";
}

const FRIENDLY: Record<number, string> = {
  400: "That request could not be processed.",
  401: "Your session has expired. Please log in again.",
  403: "You do not have access to that.",
  404: "We could not find what you asked for.",
  409: "That already exists.",
  500: "Something went wrong on our side. Try again in a moment.",
};

async function readError(res: Response): Promise<ApiError> {
  let message = FRIENDLY[res.status] ?? `Request failed (${res.status}).`;
  let fields: Record<string, string> | undefined;
  try {
    const text = await res.text();
    if (text) {
      try {
        const data = JSON.parse(text);
        if (typeof data === "string") message = data;
        else if (data && typeof data.message === "string") message = data.message;
        else if (data && typeof data.error === "string") message = data.error;
        else if (data && typeof data === "object") {
          // Bean-validation payload: { field: "message" }
          const entries = Object.entries(data).filter(([, v]) => typeof v === "string") as [string, string][];
          if (entries.length) {
            fields = Object.fromEntries(entries);
            message = entries[0][1];
          }
        }
      } catch {
        message = text.length < 160 ? text : message;
      }
    }
  } catch {
    /* ignore */
  }
  return new ApiError(message, res.status, fields);
}

export async function request<T>(path: string, opts: Options = {}): Promise<T> {
  const { method = "GET", body, auth = true, parse = "json" } = opts;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Cannot reach the server. Check your connection and try again.", 0);
  }

  if (res.status === 401 && auth) {
    clearSession();
    if (!window.location.pathname.toLowerCase().startsWith("/login")) {
      window.location.assign("/Login?expired=1");
    }
    throw new ApiError(FRIENDLY[401], 401);
  }

  if (!res.ok) throw await readError(res);

  if (res.status === 204) return undefined as T;
  if (parse === "text") return (await res.text()) as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return "Something went wrong.";
}
