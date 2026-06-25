const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export class ApiClientError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions extends RequestInit {
  csrfToken?: string;
}

/**
 * Server-side fetch helper. Used inside Server Components / generateStaticParams /
 * generateMetadata. No cookies are forwarded (public, unauthenticated reads only).
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit & { revalidate?: number } = {}
): Promise<T> {
  const { revalidate, ...init } = options;
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    next: revalidate !== undefined ? { revalidate } : undefined,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiClientError(res.status, body.error || "Request failed.", body.details);
  }

  return res.json();
}

/**
 * Client-side fetch helper. Sends cookies for session auth and attaches
 * the CSRF token header for mutating requests when provided.
 */
export async function apiClientFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { csrfToken, headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      ...headers,
    },
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiClientError(res.status, body.error || "Request failed.", body.details);
  }

  return body;
}

export function apiAssetUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const base = API_URL.replace(/\/api$/, "");
  return `${base}${path}`;
}
