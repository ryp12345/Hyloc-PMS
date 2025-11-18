import { createApiInstance } from './axiosConfig';

const rolesApi = createApiInstance();

export const getRoles = () => rolesApi.get('/roles');
export const getRole = (id) => rolesApi.get(`/roles/${id}`);
export const createRole = (data) => rolesApi.post('/roles', data);
export const updateRole = (id, data) => rolesApi.put(`/roles/${id}`, data);
export const deleteRole = (id) => rolesApi.delete(`/roles/${id}`);
