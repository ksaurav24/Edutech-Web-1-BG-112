import { request } from './httpClient.js';

export const profileApi = {
  get: () => request('/profile'),
  update: (payload) => request('/profile', { method: 'PATCH', body: payload }),
  updatePreferences: (payload) => request('/profile/preferences', { method: 'PATCH', body: payload }),
  uploadAvatar: (base64DataUrl) => request('/profile/avatar', { method: 'POST', body: { avatar: base64DataUrl } }),
};

