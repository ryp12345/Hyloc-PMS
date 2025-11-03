import { createApiInstance } from './axiosConfig'

const kaiApi = createApiInstance()

export const kaiService = {
  getAllKAIs: () => 
    kaiApi.get('/kai'),
  
  getMyKAIs: () => 
    kaiApi.get('/kai/mine'),
  
  getKAIById: (id) => 
    kaiApi.get(`/kai/${id}`),
  
  createKAI: (kaiData) => 
    kaiApi.post('/kai', kaiData),
  
  updateKAI: (id, kaiData) => 
    kaiApi.put(`/kai/${id}`, kaiData),
  
  deleteKAI: (id) => 
    kaiApi.delete(`/kai/${id}`),
}
