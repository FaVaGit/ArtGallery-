const API_BASE_ENV =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:4000/api";

let runtimeApiBaseUrl = "";

export function setApiBaseUrl(apiBaseUrl: string): void {
  runtimeApiBaseUrl = apiBaseUrl.trim().replace(/\/$/, "");
}

export function getApiBaseUrl(): string {
  return runtimeApiBaseUrl || API_BASE_ENV;
}

interface ApiRequestOptions extends RequestInit {
  token?: string;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;
  const apiBaseUrl = getApiBaseUrl();

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    let errorMessage = response.statusText;

    try {
      const errorBody = (await response.json()) as { error?: string };
      errorMessage = errorBody.error ?? errorMessage;
    } catch {
      // If response body is not json keep status text.
    }

    throw new ApiError(response.status, errorMessage || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
