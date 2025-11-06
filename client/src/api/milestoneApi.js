import { createApiInstance } from './axiosConfig';

const api = createApiInstance();

export const getMilestones = (params) => api.get('/milestones', { params });
export const getMilestone = (id) => api.get(`/milestones/${id}`);
export const createMilestone = (data) => api.post('/milestones', data);
export const updateMilestone = (id, data) => api.put(`/milestones/${id}`, data);
export const deleteMilestone = (id) => api.delete(`/milestones/${id}`);
