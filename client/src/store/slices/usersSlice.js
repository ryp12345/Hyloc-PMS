import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { usersService } from '../../api/usersApi'

// Async thunks
export const fetchAllUsers = createAsyncThunk(
  'users/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await usersService.getAllUsers()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users')
    }
  }
)

export const fetchStaffNames = createAsyncThunk(
  'users/fetchStaffNames',
  async (_, { rejectWithValue }) => {
    try {
      const response = await usersService.getStaffNames()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch staff names')
    }
  }
)

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await usersService.createUser(userData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user')
    }
  }
)

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await usersService.updateUser(id, userData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user')
    }
  }
)

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await usersService.deleteUser(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user')
    }
  }
)

const initialState = {
  users: [],
  staffNames: [],
  loading: false,
  error: null,
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUsers: (state) => {
      state.users = []
      state.staffNames = []
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch all users
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // Fetch staff names
    builder
      .addCase(fetchStaffNames.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStaffNames.fulfilled, (state, action) => {
        state.loading = false
        state.staffNames = action.payload
      })
      .addCase(fetchStaffNames.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // Create user
    builder
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload)
      })
    
    // Update user
    builder
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
      })
    
    // Delete user
    builder
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.id !== action.payload)
      })
  },
})

export const { clearUsers } = usersSlice.actions
export default usersSlice.reducer
