import { createApiInstance } from './axiosConfig';

const departmentsApi = createApiInstance();

export const getDepartments = () => departmentsApi.get('/departments');
export const getDepartment = (id) => departmentsApi.get(`/departments/${id}`);
export const createDepartment = (data) => departmentsApi.post('/departments', data);
export const updateDepartment = (id, data) => departmentsApi.put(`/departments/${id}`, data);
export const deleteDepartment = (id) => departmentsApi.delete(`/departments/${id}`);
