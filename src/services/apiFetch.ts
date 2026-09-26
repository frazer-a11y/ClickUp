// Shared fetch helper for all /api/* calls: builds JSON headers, optionally
// sends cookies, and normalizes error handling so each service file doesn't
// have to re-implement "fetch -> check res.ok -> parse error json -> throw".
export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Send cookies (used by the cookie-authenticated admin endpoints). */
  withCredentials?: boolean;
  /** Fallback error message used when the server didn't send one. */
  errorMessage?: string;
}

export async function apiFetch<T = unknown>(
  path: string,
  { body, withCredentials, headers, errorMessage, ...rest }: ApiFetchOptions = {}
): Promise<T> {
  const res = await fetch(path, {
    ...rest,
    headers: body !== undefined ? { "Content-Type": "application/json", ...headers } : headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: withCredentials ? "include" : rest.credentials,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || errorMessage || "Request failed");
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
