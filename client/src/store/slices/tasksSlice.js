import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { tasksService } from '../../api/tasksApi'

// Async thunks
export const fetchMyTasks = createAsyncThunk(
  'tasks/fetchMyTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tasksService.getMyTasks()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks')
    }
  }
)

export const fetchAllTasks = createAsyncThunk(
  'tasks/fetchAllTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tasksService.getAllTasks()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks')
    }
  }
)

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await tasksService.createTask(taskData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task')
    }
  }
)

export const quickCaptureTask = createAsyncThunk(
  'tasks/quickCaptureTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await tasksService.quickCaptureTask(taskData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task')
    }
  }
)

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, taskData }, { rejectWithValue }) => {
    try {
      const response = await tasksService.updateTask(id, taskData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task')
    }
  }
)

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await tasksService.deleteTask(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete task')
    }
  }
)

const initialState = {
  tasks: [],
  loading: false,
  error: null,
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTasks: (state) => {
      state.tasks = []
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch my tasks
    builder
      .addCase(fetchMyTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.loading = false
        state.tasks = action.payload
      })
      .addCase(fetchMyTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // Fetch all tasks
    builder
      .addCase(fetchAllTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllTasks.fulfilled, (state, action) => {
        state.loading = false
        state.tasks = action.payload
      })
      .addCase(fetchAllTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // Create task
    builder
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload)
      })
    
    // Quick capture task
    builder
      .addCase(quickCaptureTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload)
      })
    
    // Update task
    builder
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(task => task.id === action.payload.id)
        if (index !== -1) {
          state.tasks[index] = action.payload
        }
      })
    
    // Delete task
    builder
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(task => task.id !== action.payload)
      })
  },
})

export const { clearTasks } = tasksSlice.actions
export default tasksSlice.reducer
