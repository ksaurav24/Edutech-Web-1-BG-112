import { request } from './httpClient.js';

export const profileApi = {
  get: () => request('/profile'),
  update: (payload) => request('/profile', { method: 'PATCH', body: payload }),
  updatePreferences: (payload) => request('/profile/preferences', { method: 'PATCH', body: payload }),
};

