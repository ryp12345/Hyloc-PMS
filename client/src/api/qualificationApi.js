import { createApiInstance } from './axiosConfig';

const qualificationsApi = createApiInstance();

export const getQualifications = () => qualificationsApi.get('/qualifications');
export const getQualification = (id) => qualificationsApi.get(`/qualifications/${id}`);
export const createQualification = (data) => qualificationsApi.post('/qualifications', data);
export const updateQualification = (id, data) => qualificationsApi.put(`/qualifications/${id}`, data);
export const deleteQualification = (id) => qualificationsApi.delete(`/qualifications/${id}`);
