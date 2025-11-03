# 🚀 Quick Reference - Redux & API Services

## Import Statements

### Redux Hooks & Actions
```javascript
// Redux hooks
import { useDispatch, useSelector } from 'react-redux'

// Auth actions
import { loginUser, logoutUser, fetchCurrentUser } from '../store/slices/authSlice'

// Tasks actions
import { fetchMyTasks, createTask, updateTask, deleteTask } from '../store/slices/tasksSlice'

// Leaves actions
import { fetchMyLeaves, applyLeave, approveLeave } from '../store/slices/leavesSlice'

// Users actions
import { fetchAllUsers, fetchStaffNames } from '../store/slices/usersSlice'
```

### API Services
```javascript
import { authService } from '../api/authApi'
import { tasksService } from '../api/tasksApi'
import { leavesService } from '../api/leavesApi'
import { usersService } from '../api/usersApi'
import { ticketsService } from '../api/ticketsApi'
import { kpiService } from '../api/kpiApi'
import { kmiService } from '../api/kmiApi'
import { kaiService } from '../api/kaiApi'
import { calendarService } from '../api/calendarApi'
```

## Common Patterns

### 1. Fetch Data (Redux)
```javascript
const dispatch = useDispatch()
const { data, loading, error } = useSelector(state => state.feature)

useEffect(() => {
  dispatch(fetchData())
}, [dispatch])
```

### 2. Create/Update Data (Redux)
```javascript
const handleSubmit = async (formData) => {
  try {
    await dispatch(createItem(formData)).unwrap()
    alert('Success!')
  } catch (error) {
    alert('Error: ' + error)
  }
}
```

### 3. Direct API Call
```javascript
const fetchData = async () => {
  try {
    const response = await service.getData()
    setData(response.data)
  } catch (error) {
    console.error(error)
  }
}
```

## Redux State Structure

```javascript
{
  auth: {
    user: { id, email, name, role },
    accessToken: 'token...',
    refreshToken: 'token...',
    isAuthenticated: true,
    loading: false,
    error: null
  },
  tasks: {
    tasks: [...],
    loading: false,
    error: null
  },
  leaves: {
    leaves: [...],
    pendingLeaves: [...],
    loading: false,
    error: null
  },
  users: {
    users: [...],
    staffNames: [...],
    loading: false,
    error: null
  }
}
```

## Available Actions

### Auth
- `loginUser({ email, password })`
- `logoutUser()`
- `fetchCurrentUser()`
- `refreshToken(token)`

### Tasks
- `fetchMyTasks()`
- `fetchAllTasks()`
- `createTask(data)`
- `quickCaptureTask(data)`
- `updateTask({ id, data })`
- `deleteTask(id)`

### Leaves
- `fetchMyLeaves()`
- `fetchAllLeaves()`
- `fetchPendingLeaves()`
- `applyLeave(data)`
- `updateLeave({ id, data })`
- `approveLeave(id)`
- `rejectLeave(id)`
- `deleteLeave(id)`

### Users
- `fetchAllUsers()`
- `fetchStaffNames()`
- `createUser(data)`
- `updateUser({ id, data })`
- `deleteUser(id)`

## API Service Methods

### Tasks Service
```javascript
tasksService.getMyTasks()
tasksService.getAllTasks()
tasksService.getTaskById(id)
tasksService.createTask(data)
tasksService.quickCaptureTask(data)
tasksService.updateTask(id, data)
tasksService.deleteTask(id)
```

### Leaves Service
```javascript
leavesService.getMyLeaves()
leavesService.getAllLeaves()
leavesService.getPendingLeaves()
leavesService.getLeaveById(id)
leavesService.applyLeave(data)
leavesService.updateLeave(id, data)
leavesService.approveLeave(id)
leavesService.rejectLeave(id)
leavesService.deleteLeave(id)
```

### Users Service
```javascript
usersService.getAllUsers()
usersService.getStaffNames()
usersService.getUserById(id)
usersService.createUser(data)
usersService.updateUser(id, data)
usersService.deleteUser(id)
```

## When to Use What?

### Use Redux when:
✅ Multiple components need the same data
✅ Data needs to be cached
✅ Need to track loading/error states globally
✅ Need to update UI optimistically

### Use Direct API when:
✅ One-off API calls
✅ Data is only used in one component
✅ Quick operations without state management
✅ Downloading files or special operations

## Component Template

```javascript
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchData, createData } from '../../store/slices/featureSlice'

export default function MyComponent() {
  const dispatch = useDispatch()
  const { items, loading, error } = useSelector(state => state.feature)
  const [form, setForm] = useState({ /* initial state */ })

  useEffect(() => {
    dispatch(fetchData())
  }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await dispatch(createData(form)).unwrap()
      setForm({ /* reset */ })
      alert('Success!')
    } catch (error) {
      alert('Error: ' + error)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {/* Your component JSX */}
    </div>
  )
}
```

## Debugging

### Redux DevTools
1. Install Redux DevTools browser extension
2. Open DevTools → Redux tab
3. View state, actions, and diffs

### Console Logging
```javascript
// Log Redux state
console.log(useSelector(state => state))

// Log action result
dispatch(action()).then(result => console.log(result))
```

### Network Tab
- Check API calls in browser Network tab
- Verify request headers include Authorization
- Check response status codes

## Error Handling

### Redux Error
```javascript
try {
  await dispatch(action()).unwrap()
} catch (error) {
  // Handle error
  console.error(error)
}
```

### API Error
```javascript
try {
  const response = await service.method()
} catch (error) {
  console.error(error.response?.data)
}
```

## Tips

💡 Always use `.unwrap()` when dispatching async actions if you want to catch errors

💡 Use `useEffect` cleanup to cancel pending requests

💡 Check Redux DevTools for state changes

💡 Use loading states to show spinners

💡 Handle errors gracefully with try-catch

💡 Keep API services thin - just HTTP calls

💡 Put business logic in Redux slices or components

💡 Use TypeScript for better type safety (future enhancement)

---

📚 **Full docs**: See `REDUX_IMPLEMENTATION.md`
📝 **Examples**: Check `pages/ExampleUsagePage.jsx`
