type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};

type ApiError = {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
};

const API_BASE = '/api/v1';

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiSuccess<T>> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json()) as ApiSuccess<T> | ApiError;

  if (!response.ok || !payload.success) {
    throw new ApiClientError(
      payload.success ? 'Request failed' : payload.message,
      response.status,
      payload.success ? undefined : payload.errors,
    );
  }

  return payload;
}

export async function apiFetchPaginated<T>(
  path: string,
  init?: RequestInit,
): Promise<{ data: T[]; meta: NonNullable<ApiSuccess<T[]>['meta']> }> {
  const response = await apiFetch<T[]>(path, init);
  if (!response.meta) {
    throw new ApiClientError('Missing pagination metadata', 500);
  }

  return {
    data: response.data,
    meta: response.meta,
  };
}
