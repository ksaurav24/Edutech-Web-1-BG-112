import { API_BASE_URL, API_TIMEOUT_MS, JSON_HEADERS } from './config.js';
import { tokenStore } from './tokenStore.js';
import { normalizeApiError, unwrapApiResponse, ApiHttpError } from './response.js';

let refreshInFlight = null;

function withTimeoutSignal(timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout),
  };
}

function isAuthPath(path) {
  return path.startsWith('/auth/login') || path.startsWith('/auth/signup') || path.startsWith('/auth/refresh-token');
}

function resolveBody(body) {
  if (body == null) {
    return undefined;
  }
  if (typeof body === 'string' || body instanceof FormData) {
    return body;
  }
  return JSON.stringify(body);
}

function resolveHeaders(inputHeaders = {}, includeAuth = true, body) {
  const headers = body instanceof FormData ? { ...inputHeaders } : { ...JSON_HEADERS, ...inputHeaders };
  const accessToken = tokenStore.get();
  if (includeAuth && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return headers;
}

async function refreshAccessToken() {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const { signal, clear } = withTimeoutSignal(API_TIMEOUT_MS);
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          credentials: 'include',
          headers: JSON_HEADERS,
          signal,
        });
        const data = await unwrapApiResponse(response);
        const nextAccessToken = data?.tokens?.accessToken || data?.accessToken || null;
        if (!nextAccessToken) {
          throw new ApiHttpError('Missing access token in refresh response', 401, data);
        }
        tokenStore.set(nextAccessToken);
      } catch (err) {
        tokenStore.clear();
        throw err;
      } finally {
        clear();
        refreshInFlight = null;
      }
    })();
  }

  return refreshInFlight;
}

export async function request(path, options = {}, retryOn401 = true) {
  const {
    method = 'GET',
    body,
    headers = {},
    includeAuth = true,
    credentials = 'include',
    timeoutMs = API_TIMEOUT_MS,
  } = options;

  const finalBody = resolveBody(body);
  const finalHeaders = resolveHeaders(headers, includeAuth, body);
  const { signal, clear } = withTimeoutSignal(timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      body: finalBody,
      headers: finalHeaders,
      credentials,
      signal,
    });

    if (response.status === 401 && retryOn401 && includeAuth && !isAuthPath(path)) {
      await refreshAccessToken();
      return request(path, options, false);
    }

    return await unwrapApiResponse(response);
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new ApiHttpError('Request timed out', 408);
    }
    if (err instanceof ApiHttpError) {
      throw err;
    }
    if (err?.status) {
      throw err;
    }
    throw normalizeApiError(null, { message: 'Network error. Please try again.' });
  } finally {
    clear();
  }
}

export function clearAuthSession() {
  tokenStore.clear();
}

