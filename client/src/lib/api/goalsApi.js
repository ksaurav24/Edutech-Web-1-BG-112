import { request } from './httpClient.js';

export const goalsApi = {
  list: () => request('/goals'),
  create: (payload) => request('/goals', { method: 'POST', body: payload }),
  update: (goalId, payload) => request(`/goals/${goalId}`, { method: 'PATCH', body: payload }),
  remove: (goalId) => request(`/goals/${goalId}`, { method: 'DELETE' }),
};

