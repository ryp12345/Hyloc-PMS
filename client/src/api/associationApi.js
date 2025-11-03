import { createApiInstance } from './axiosConfig';

const associationsApi = createApiInstance();

export const getAssociations = () => associationsApi.get('/associations');
export const getAssociation = (id) => associationsApi.get(`/associations/${id}`);
export const createAssociation = (data) => associationsApi.post('/associations', data);
export const updateAssociation = (id, data) => associationsApi.put(`/associations/${id}`, data);
export const deleteAssociation = (id) => associationsApi.delete(`/associations/${id}`);
