import { apiRequest, getApiBaseUrl } from "./client";

export interface CommentResponse {
  id: number;
  item_id: string;
  username: string;
  text: string;
  created_at: string;
}

export interface RatingResponse {
  averageRating: number;
  userRating: number | null;
  totalRatings: number;
}

export async function getComments(itemId: string): Promise<CommentResponse[]> {
  return apiRequest<CommentResponse[]>(`/social/${encodeURIComponent(itemId)}/comments`);
}

export async function postComment(token: string, itemId: string, text: string): Promise<CommentResponse> {
  return apiRequest<CommentResponse>(`/social/${encodeURIComponent(itemId)}/comments`, {
    method: "POST",
    token,
    body: JSON.stringify({ text }),
  });
}

export async function deleteComment(token: string, itemId: string, commentId: number): Promise<void> {
  await apiRequest<void>(`/social/${encodeURIComponent(itemId)}/comments/${commentId}`, {
    method: "DELETE",
    token,
  });
}

export async function getRating(itemId: string, token?: string): Promise<RatingResponse> {
  return apiRequest<RatingResponse>(`/social/${encodeURIComponent(itemId)}/rating`, {
    ...(token ? { token } : {}),
  });
}

export async function postRating(token: string, itemId: string, score: number): Promise<RatingResponse> {
  return apiRequest<RatingResponse>(`/social/${encodeURIComponent(itemId)}/rating`, {
    method: "POST",
    token,
    body: JSON.stringify({ score }),
  });
}

export async function uploadFile(token: string, file: File, parentId?: string): Promise<unknown> {
  const formData = new FormData();
  formData.append("file", file);
  if (parentId) formData.append("parentId", parentId);

  const apiBaseUrl = getApiBaseUrl();

  const response = await fetch(`${apiBaseUrl}/drive/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const errorBody = (await response.json()) as { error?: string };
      errorMessage = errorBody.error ?? errorMessage;
    } catch {
      // keep status text
    }
    throw new Error(errorMessage || "Upload failed");
  }

  return response.json();
}
