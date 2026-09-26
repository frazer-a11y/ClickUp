import { apiFetch } from "./apiFetch";

export async function loginCreator(
  name: string,
  code: string
): Promise<{
  isValid: boolean;
  code?: string;
  name?: string;
  email?: string;
  error?: string;
}> {
  const res = await fetch("/api/creator-auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, code }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return { isValid: false, error: data?.error || "Login failed" };
  }

  return data;
}

export async function signupCreator(
  name: string,
  email: string
): Promise<{ name: string; email: string; code: string }> {
  return apiFetch("/api/creator-auth/signup", {
    method: "POST",
    body: { name, email },
    errorMessage: "Signup failed",
  });
}
