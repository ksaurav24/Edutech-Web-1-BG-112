import { request } from './httpClient.js';

export const sessionsApi = {
  list: () => request('/sessions'),
  create: (payload) => request('/sessions', { method: 'POST', body: payload }),
  remove: (sessionId) => request(`/sessions/${sessionId}`, { method: 'DELETE' }),
};

