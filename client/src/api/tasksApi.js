import { createApiInstance } from './axiosConfig'

const tasksApi = createApiInstance()

export const tasksService = {
  getMyTasks: () => 
    tasksApi.get('/tasks/mine'),
  
  getAllTasks: () => 
    tasksApi.get('/tasks'),
  
  getTaskById: (id) => 
    tasksApi.get(`/tasks/${id}`),
  
  createTask: (taskData) => 
    tasksApi.post('/tasks', taskData),
  
  quickCaptureTask: (taskData) => 
    tasksApi.post('/tasks/quick-capture', taskData),
  
  updateTask: (id, taskData) => 
    tasksApi.put(`/tasks/${id}`, taskData),
  
  deleteTask: (id) => 
    tasksApi.delete(`/tasks/${id}`),
}
