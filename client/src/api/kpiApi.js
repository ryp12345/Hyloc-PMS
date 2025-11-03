import { createApiInstance } from './axiosConfig'

const kpiApi = createApiInstance()

export const kpiService = {
  getAllKPIs: () => 
    kpiApi.get('/kpi'),
  
  getMyKPIs: () => 
    kpiApi.get('/kpi/mine'),
  
  getKPIById: (id) => 
    kpiApi.get(`/kpi/${id}`),
  
  createKPI: (kpiData) => 
    kpiApi.post('/kpi', kpiData),
  
  updateKPI: (id, kpiData) => 
    kpiApi.put(`/kpi/${id}`, kpiData),
  
  deleteKPI: (id) => 
    kpiApi.delete(`/kpi/${id}`),
}
