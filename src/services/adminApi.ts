import { ContentSubmission, SubmissionStatus } from "../types";
import { apiFetch } from "./apiFetch";

export async function adminLogin(email: string, password: string): Promise<{ email: string }> {
  return apiFetch("/api/admin/login", { method: "POST", body: { email, password }, withCredentials: true });
}

export async function adminLogout(): Promise<void> {
  await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
}

export async function adminMe(): Promise<{ email: string } | null> {
  const res = await fetch("/api/admin/me", { credentials: "include" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Request failed");
  return res.json();
}

export async function fetchAdminSubmissions(status?: SubmissionStatus): Promise<ContentSubmission[]> {
  const url = status ? `/api/admin/submissions?status=${status}` : "/api/admin/submissions";
  const data = await apiFetch<{ submissions: ContentSubmission[] }>(url, { withCredentials: true });
  return data.submissions;
}

export async function updateSubmissionProduct(id: string, product: string): Promise<void> {
  await apiFetch(`/api/admin/submissions/${id}/product`, { method: "PATCH", body: { product }, withCredentials: true });
}

export async function approveSubmission(id: string, product?: string): Promise<void> {
  await apiFetch(`/api/admin/submissions/${id}/approve`, { method: "POST", body: { product }, withCredentials: true });
}

export async function denySubmission(id: string, reason: string): Promise<void> {
  await apiFetch(`/api/admin/submissions/${id}/deny`, { method: "POST", body: { reason }, withCredentials: true });
}

export async function saveSubmissionComment(id: string, comment: string): Promise<void> {
  await apiFetch(`/api/admin/submissions/${id}/comment`, { method: "PATCH", body: { comment }, withCredentials: true });
}
