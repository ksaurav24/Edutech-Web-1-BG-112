export class ApiHttpError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'ApiHttpError';
    this.status = status;
    this.details = details;
  }
}

export function normalizeApiError(response, payload = {}) {
  const message =
    payload?.message ||
    payload?.error?.message ||
    response?.statusText ||
    'Request failed';

  return new ApiHttpError(message, response?.status || 500, payload);
}

export async function unwrapApiResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.success === false) {
    throw normalizeApiError(response, payload);
  }
  return payload?.data ?? payload;
}

