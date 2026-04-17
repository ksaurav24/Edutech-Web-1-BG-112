import { request } from './httpClient.js';
import { tokenStore } from './tokenStore.js';

function persistAccessToken(data) {
  const accessToken = data?.tokens?.accessToken || data?.accessToken || null;
  if (accessToken) {
    tokenStore.set(accessToken);
  }
}

export const authApi = {
  async signup(payload) {
    const data = await request('/auth/signup', { method: 'POST', body: payload, includeAuth: false });
    persistAccessToken(data);
    return data;
  },
  async login(payload) {
    const data = await request('/auth/login', { method: 'POST', body: payload, includeAuth: false });
    persistAccessToken(data);
    return data;
  },
  async forgotPassword(payload) {
    return request('/auth/forgot-password', { method: 'POST', body: payload, includeAuth: false });
  },
  async refresh() {
    const data = await request('/auth/refresh-token', { method: 'POST', includeAuth: false });
    persistAccessToken(data);
    return data;
  },
  verify() {
    return request('/auth/verify');
  },
};

