import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { leavesService } from '../../api/leavesApi'

// Async thunks
export const fetchMyLeaves = createAsyncThunk(
  'leaves/fetchMyLeaves',
  async (_, { rejectWithValue }) => {
    try {
      const response = await leavesService.getMyLeaves()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaves')
    }
  }
)

export const fetchAllLeaves = createAsyncThunk(
  'leaves/fetchAllLeaves',
  async (_, { rejectWithValue }) => {
    try {
      const response = await leavesService.getAllLeaves()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaves')
    }
  }
)

export const fetchPendingLeaves = createAsyncThunk(
  'leaves/fetchPendingLeaves',
  async (_, { rejectWithValue }) => {
    try {
      const response = await leavesService.getPendingLeaves()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending leaves')
    }
  }
)

export const applyLeave = createAsyncThunk(
  'leaves/applyLeave',
  async (leaveData, { rejectWithValue }) => {
    try {
      const response = await leavesService.applyLeave(leaveData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to apply leave')
    }
  }
)

export const updateLeave = createAsyncThunk(
  'leaves/updateLeave',
  async ({ id, leaveData }, { rejectWithValue }) => {
    try {
      const response = await leavesService.updateLeave(id, leaveData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update leave')
    }
  }
)

export const approveLeave = createAsyncThunk(
  'leaves/approveLeave',
  async (id, { rejectWithValue }) => {
    try {
      const response = await leavesService.approveLeave(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve leave')
    }
  }
)

export const rejectLeave = createAsyncThunk(
  'leaves/rejectLeave',
  async (id, { rejectWithValue }) => {
    try {
      const response = await leavesService.rejectLeave(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject leave')
    }
  }
)

export const deleteLeave = createAsyncThunk(
  'leaves/deleteLeave',
  async (id, { rejectWithValue }) => {
    try {
      await leavesService.deleteLeave(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete leave')
    }
  }
)

const initialState = {
  leaves: [],
  pendingLeaves: [],
  loading: false,
  error: null,
}

const leavesSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    clearLeaves: (state) => {
      state.leaves = []
      state.pendingLeaves = []
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch my leaves
    builder
      .addCase(fetchMyLeaves.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMyLeaves.fulfilled, (state, action) => {
        state.loading = false
        state.leaves = action.payload
      })
      .addCase(fetchMyLeaves.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // Fetch all leaves
    builder
      .addCase(fetchAllLeaves.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllLeaves.fulfilled, (state, action) => {
        state.loading = false
        state.leaves = action.payload
      })
      .addCase(fetchAllLeaves.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // Fetch pending leaves
    builder
      .addCase(fetchPendingLeaves.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPendingLeaves.fulfilled, (state, action) => {
        state.loading = false
        state.pendingLeaves = action.payload
      })
      .addCase(fetchPendingLeaves.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // Apply leave
    builder
      .addCase(applyLeave.fulfilled, (state, action) => {
        state.leaves.push(action.payload)
      })
    
    // Update leave
    builder
      .addCase(updateLeave.fulfilled, (state, action) => {
        const index = state.leaves.findIndex(leave => leave.id === action.payload.id)
        if (index !== -1) {
          state.leaves[index] = action.payload
        }
      })
    
    // Approve leave
    builder
      .addCase(approveLeave.fulfilled, (state, action) => {
        const index = state.leaves.findIndex(leave => leave.id === action.payload.id)
        if (index !== -1) {
          state.leaves[index] = action.payload
        }
        const pendingIndex = state.pendingLeaves.findIndex(leave => leave.id === action.payload.id)
        if (pendingIndex !== -1) {
          state.pendingLeaves.splice(pendingIndex, 1)
        }
      })
    
    // Reject leave
    builder
      .addCase(rejectLeave.fulfilled, (state, action) => {
        const index = state.leaves.findIndex(leave => leave.id === action.payload.id)
        if (index !== -1) {
          state.leaves[index] = action.payload
        }
        const pendingIndex = state.pendingLeaves.findIndex(leave => leave.id === action.payload.id)
        if (pendingIndex !== -1) {
          state.pendingLeaves.splice(pendingIndex, 1)
        }
      })
    
    // Delete leave
    builder
      .addCase(deleteLeave.fulfilled, (state, action) => {
        state.leaves = state.leaves.filter(leave => leave.id !== action.payload)
        state.pendingLeaves = state.pendingLeaves.filter(leave => leave.id !== action.payload)
      })
  },
})

export const { clearLeaves } = leavesSlice.actions
export default leavesSlice.reducer
