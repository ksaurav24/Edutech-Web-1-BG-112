import { request } from './httpClient.js';

export const notificationsApi = {
  list: () => request('/notifications'),
  markAllRead: () => request('/notifications/mark-all-read', { method: 'PATCH' }),
};

