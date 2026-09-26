import { ContentSubmission } from "../types";
import { apiFetch } from "./apiFetch";

export async function requestUploadSession(
  creatorCode: string,
  fileName: string,
  mimeType: string,
  fileSize: number
): Promise<{ uploadUrl: string; stagingFolderId: string }> {
  return apiFetch("/api/creator/upload-session", {
    method: "POST",
    body: { creatorCode, fileName, mimeType, fileSize },
    errorMessage: "Failed to start upload",
  });
}

// Uploads directly to Google Drive, bypassing our own server entirely.
export async function uploadFileToDrive(
  uploadUrl: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ id: string; name: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

    xhr.upload.onprogress = (event) => {
      if (onProgress && event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error("Unexpected response from Google Drive"));
        }
      } else {
        reject(new Error(`Upload failed (${xhr.status}). Please try again.`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload. Please try again."));

    xhr.send(file);
  });
}

export async function submitContent(payload: {
  creatorCode: string;
  creatorName?: string;
  product: string;
  driveFileId: string;
  stagingFolderId: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  usageRightsAccepted: boolean;
}): Promise<ContentSubmission> {
  const data = await apiFetch<{ submission: ContentSubmission }>("/api/creator/submissions", {
    method: "POST",
    body: payload,
    errorMessage: "Failed to submit content",
  });
  return data.submission;
}

export async function fetchMySubmissions(creatorCode: string): Promise<ContentSubmission[]> {
  const data = await apiFetch<{ submissions: ContentSubmission[] }>(
    `/api/creator/submissions?code=${encodeURIComponent(creatorCode)}`,
    { errorMessage: "Failed to load submissions" }
  );
  return data.submissions || [];
}

export async function dismissSubmission(id: string, creatorCode: string): Promise<void> {
  await apiFetch(`/api/creator/submissions/${id}/dismiss`, {
    method: "POST",
    body: { creatorCode },
    errorMessage: "Failed to dismiss submission",
  });
}

export async function cancelSubmission(id: string, creatorCode: string): Promise<void> {
  await apiFetch(`/api/creator/submissions/${id}/cancel`, {
    method: "POST",
    body: { creatorCode },
    errorMessage: "Failed to cancel submission",
  });
}
