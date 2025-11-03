import { createApiInstance } from './axiosConfig';

const designationsApi = createApiInstance();

export const getDesignations = () => designationsApi.get('/designations');
export const getDesignation = (id) => designationsApi.get(`/designations/${id}`);
export const createDesignation = (data) => designationsApi.post('/designations', data);
export const updateDesignation = (id, data) => designationsApi.put(`/designations/${id}`, data);
export const deleteDesignation = (id) => designationsApi.delete(`/designations/${id}`);
