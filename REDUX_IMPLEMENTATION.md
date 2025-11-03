# Redux Implementation & Separate API Services

## Overview
This project now uses **Redux Toolkit** for state management and **separate API service modules** for better organization and maintainability.

## Project Structure

### API Services (`client/src/api/`)
Each feature has its own dedicated API service:

- **axiosConfig.js** - Base axios configuration with interceptors
- **authApi.js** - Authentication endpoints
- **tasksApi.js** - Task management endpoints
- **leavesApi.js** - Leave management endpoints
- **ticketsApi.js** - Ticket management endpoints
- **kpiApi.js** - KPI management endpoints
- **kmiApi.js** - KMI management endpoints
- **kaiApi.js** - KAI management endpoints
- **usersApi.js** - User management endpoints
- **calendarApi.js** - Calendar events endpoints

### Redux Store (`client/src/store/`)

#### Slices:
- **authSlice.js** - Authentication state
- **tasksSlice.js** - Tasks state
- **leavesSlice.js** - Leaves state
- **usersSlice.js** - Users state

#### Store Configuration:
- **store.js** - Redux store configuration

## Usage Examples

### 1. Using Redux in Components

#### Import hooks and actions:
```javascript
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyTasks, quickCaptureTask } from '../../store/slices/tasksSlice'
```

#### Access state and dispatch actions:
```javascript
const dispatch = useDispatch()
const { tasks, loading, error } = useSelector((state) => state.tasks)

// Fetch data
useEffect(() => {
  dispatch(fetchMyTasks())
}, [dispatch])

// Create/Update data
const handleSubmit = async (data) => {
  await dispatch(quickCaptureTask(data)).unwrap()
}
```

### 2. Using Separate API Services Directly

If you need to call APIs outside of Redux:

```javascript
import { tasksService } from '../../api/tasksApi'
import { leavesService } from '../../api/leavesApi'
import { usersService } from '../../api/usersApi'

// Fetch tasks
const tasks = await tasksService.getMyTasks()

// Create leave
const newLeave = await leavesService.applyLeave(leaveData)

// Get users
const users = await usersService.getStaffNames()
```

### 3. Authentication Flow

The authentication is managed through Redux but still accessible via AuthContext:

```javascript
import { useAuth } from '../auth/AuthContext'

const { user, login, logout } = useAuth()

// Login
await login(email, password)

// Logout
await logout()

// Access current user
console.log(user)
```

## Benefits

### Separate API Services:
✅ **Better Organization** - Each feature has its own API module
✅ **Easier Maintenance** - Changes to one API don't affect others
✅ **Reusability** - Services can be used anywhere in the app
✅ **Type Safety** - Easier to add TypeScript later
✅ **Testing** - Individual services can be tested independently

### Redux Integration:
✅ **Centralized State** - All app state in one place
✅ **Predictable Updates** - State changes are trackable
✅ **Developer Tools** - Redux DevTools for debugging
✅ **Less Prop Drilling** - Access state from any component
✅ **Async Handling** - Built-in with createAsyncThunk

## Available Redux Actions

### Auth Actions
- `loginUser({ email, password })` - Login user
- `logoutUser()` - Logout user
- `fetchCurrentUser()` - Get current user info
- `refreshToken(refreshToken)` - Refresh access token

### Tasks Actions
- `fetchMyTasks()` - Get user's tasks
- `fetchAllTasks()` - Get all tasks
- `createTask(taskData)` - Create new task
- `quickCaptureTask(taskData)` - Quick capture task
- `updateTask({ id, taskData })` - Update task
- `deleteTask(id)` - Delete task

### Leaves Actions
- `fetchMyLeaves()` - Get user's leaves
- `fetchAllLeaves()` - Get all leaves
- `fetchPendingLeaves()` - Get pending leaves
- `applyLeave(leaveData)` - Apply for leave
- `updateLeave({ id, leaveData })` - Update leave
- `approveLeave(id)` - Approve leave
- `rejectLeave(id)` - Reject leave
- `deleteLeave(id)` - Delete leave

### Users Actions
- `fetchAllUsers()` - Get all users
- `fetchStaffNames()` - Get staff names for dropdowns
- `createUser(userData)` - Create new user
- `updateUser({ id, userData })` - Update user
- `deleteUser(id)` - Delete user

## Migration Guide

### Before (Old API pattern):
```javascript
import { api } from '../../lib/api'

const res = await api.get('/tasks/mine')
setTasks(res.data)
```

### After (Redux pattern):
```javascript
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyTasks } from '../../store/slices/tasksSlice'

const dispatch = useDispatch()
const { tasks } = useSelector((state) => state.tasks)

dispatch(fetchMyTasks())
```

### After (Direct API pattern):
```javascript
import { tasksService } from '../../api/tasksApi'

const response = await tasksService.getMyTasks()
const tasks = response.data
```

## API Service Methods

### Tasks Service
- `getMyTasks()` - GET /tasks/mine
- `getAllTasks()` - GET /tasks
- `getTaskById(id)` - GET /tasks/:id
- `createTask(taskData)` - POST /tasks
- `quickCaptureTask(taskData)` - POST /tasks/quick-capture
- `updateTask(id, taskData)` - PUT /tasks/:id
- `deleteTask(id)` - DELETE /tasks/:id

### Leaves Service
- `getMyLeaves()` - GET /leaves/mine
- `getAllLeaves()` - GET /leaves
- `getPendingLeaves()` - GET /leaves/pending
- `getLeaveById(id)` - GET /leaves/:id
- `applyLeave(leaveData)` - POST /leaves
- `updateLeave(id, leaveData)` - PUT /leaves/:id
- `approveLeave(id)` - POST /leaves/:id/approve
- `rejectLeave(id)` - POST /leaves/:id/reject
- `deleteLeave(id)` - DELETE /leaves/:id

### Users Service
- `getAllUsers()` - GET /users
- `getStaffNames()` - GET /users/staff-names
- `getUserById(id)` - GET /users/:id
- `createUser(userData)` - POST /users
- `updateUser(id, userData)` - PUT /users/:id
- `deleteUser(id)` - DELETE /users/:id

## Notes

- The old `api.js` file is still available for backward compatibility
- All API calls automatically include authentication tokens
- Token refresh is handled automatically by axios interceptors
- Redux DevTools extension is automatically configured
- All async operations return promises that can be handled with `.unwrap()`

## Next Steps

To migrate other pages to use Redux:

1. Create slices for remaining features (tickets, KPI, KMI, KAI, calendar)
2. Update components to use `useDispatch` and `useSelector`
3. Replace direct API calls with Redux actions
4. Test thoroughly to ensure all functionality works

## Debugging

Use Redux DevTools browser extension to:
- Inspect current state
- Track action history
- Time-travel debug
- Export/import state

## Environment Variables

Make sure `.env` file has:
```
VITE_API_URL=http://localhost:4000/api
```
