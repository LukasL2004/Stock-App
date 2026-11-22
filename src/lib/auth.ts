const TOKEN_KEY = "token";
const EMAIL_KEY = "email";

/** Token lives in localStorage ("remember me") or sessionStorage (this tab only). */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

export function setSession(token: string, email: string, remember: boolean) {
  clearSession();
  const store = remember ? localStorage : sessionStorage;
  store.setItem(TOKEN_KEY, token);
  store.setItem(EMAIL_KEY, email.trim().toLowerCase());
}

export function getEmail(): string | null {
  return localStorage.getItem(EMAIL_KEY) ?? sessionStorage.getItem(EMAIL_KEY);
}

export function clearSession() {
  for (const s of [localStorage, sessionStorage]) {
    s.removeItem(TOKEN_KEY);
    s.removeItem(EMAIL_KEY);
  }
}

/** Reads the `exp` claim without verifying the signature (the server does that). */
export function tokenExpiry(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json.exp === "number" ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  const exp = tokenExpiry(token);
  if (exp !== null && exp <= Date.now()) {
    clearSession();
    return false;
  }
  return true;
}
