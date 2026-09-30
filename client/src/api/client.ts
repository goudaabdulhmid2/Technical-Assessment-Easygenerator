export interface FieldIssue {
  field?: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1').replace(/\/+$/, '');

function messageForStatus(status: number, serverMessage?: string): string {
  if (status === 401) return 'That email and password combination was not recognised.';
  if (status === 409) return 'An account with this email already exists. Try signing in instead.';
  if (status === 429) return 'Too many attempts. Please try again later.';
  if (status >= 500) return 'Something went wrong on our side. Please try again.';
  return serverMessage || 'Please check the information and try again.';
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body) headers.set('Content-Type', 'application/json');

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
      credentials: 'include',
    });
  } catch {
    throw new ApiError(0, 'We couldn’t reach the server. Check your connection and try again.');
  }

  const body: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const payload = typeof body === 'object' && body !== null
      ? body as { message?: string | string[]; errors?: FieldIssue[] }
      : {};
    const issues = Array.isArray(payload.errors) ? payload.errors : [];
    const fieldErrors = Object.fromEntries(
      issues.filter((issue) => issue.field && issue.message).map((issue) => [issue.field!, issue.message]),
    );
    const serverMessage = Array.isArray(payload.message)
      ? payload.message.join('. ')
      : payload.message;
    throw new ApiError(response.status, messageForStatus(response.status, serverMessage), fieldErrors);
  }

  return body as T;
}
