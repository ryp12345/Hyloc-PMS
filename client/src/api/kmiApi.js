import { createApiInstance } from './axiosConfig'

const kmiApi = createApiInstance()

export const kmiService = {
  getAllKMIs: () => 
    kmiApi.get('/kmi'),
  
  getMyKMIs: () => 
    kmiApi.get('/kmi/mine'),
  
  getKMIById: (id) => 
    kmiApi.get(`/kmi/${id}`),
  
  createKMI: (kmiData) => 
    kmiApi.post('/kmi', kmiData),
  
  updateKMI: (id, kmiData) => 
    kmiApi.put(`/kmi/${id}`, kmiData),
  
  deleteKMI: (id) => 
    kmiApi.delete(`/kmi/${id}`),
}
