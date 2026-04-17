import { request } from './httpClient.js';

export const practiceApi = {
  chat: (payload) => request('/practice/chat', { method: 'POST', body: payload }),
};

