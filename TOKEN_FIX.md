# Token Authorization Fix - "Missing token" 401 Errors

## Issue
Getting `401 Unauthorized - "Missing token"` errors on API requests after implementing Redux.

## Root Causes

### 1. **API calls triggered before auth restoration complete**
Pages were making API calls in `useEffect` without checking if the user was authenticated first.

### 2. **Old api.js not reading from localStorage**
The legacy `lib/api.js` was using an internal `tokens` variable that wasn't being synced with Redux state or localStorage.

## Fixes Applied

### ✅ Fix 1: Updated Pages to Wait for Auth

**Files Modified:**
- `pages/tasks/TasksPage.jsx`
- `pages/leaves/LeavesPage.jsx`
- `pages/ExampleUsagePage.jsx`

**What Changed:**
Added check to ensure user is authenticated before making API calls:

```javascript
// Before (BAD - calls API immediately)
useEffect(() => {
  dispatch(fetchMyTasks())
  dispatch(fetchStaffNames())
}, [dispatch])

// After (GOOD - waits for user)
const { user } = useAuth()

useEffect(() => {
  if (user) {  // ✅ Only fetch if authenticated
    dispatch(fetchMyTasks())
    dispatch(fetchStaffNames())
  }
}, [dispatch, user])
```

### ✅ Fix 2: Updated Old api.js to Read from localStorage

**File Modified:**
- `lib/api.js`

**What Changed:**
Updated the request interceptor to read tokens from localStorage:

```javascript
// Before (BAD - only used internal variable)
instance.interceptors.request.use((config) => {
  if (tokens.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`
  }
  return config
})

// After (GOOD - reads from localStorage)
instance.interceptors.request.use((config) => {
  let accessToken = tokens.accessToken
  
  // Fallback to localStorage
  if (!accessToken) {
    const authData = localStorage.getItem('auth')
    if (authData) {
      const parsed = JSON.parse(authData)
      accessToken = parsed.accessToken
    }
  }
  
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  
  return config
})
```

## Why This Happened

### Timeline of Events:
1. User logs in → Tokens saved to Redux + localStorage ✅
2. Page refresh → AuthContext starts restoring auth 🔄
3. **Component renders → useEffect fires immediately** ⚠️
4. **API call made → No token in header yet** ❌
5. Backend returns 401 "Missing token"
6. Auth restoration completes (too late)

### The Solution:
Wait for the `user` object to be available before making API calls:

```
Login/Refresh
     ↓
Auth Restoration (AuthContext)
     ↓
User object available in Redux
     ↓
useEffect detects user ✅
     ↓
API calls made with token ✅
```

## Testing

### Test 1: Fresh Login
1. ✅ Clear localStorage
2. ✅ Login
3. ✅ Navigate to Tasks/Leaves pages
4. ✅ **Expected**: No 401 errors, data loads successfully

### Test 2: Page Refresh
1. ✅ Login
2. ✅ Navigate to Tasks page
3. ✅ Refresh the page (F5)
4. ✅ **Expected**: No 401 errors, user stays logged in, data loads

### Test 3: Direct URL Access
1. ✅ Login
2. ✅ Close browser
3. ✅ Open new browser and go to http://localhost:3000/tasks
4. ✅ **Expected**: User stays logged in, data loads correctly

### Test 4: Other Pages (Using Old API)
1. ✅ Login
2. ✅ Navigate to pages like:
   - Staff Management
   - Tickets
   - KPI/KMI/KAI
   - Calendar
   - Analytics
3. ✅ **Expected**: All pages work without 401 errors

## Pages Status

### ✅ Using Redux (Updated)
- TasksPage
- LeavesPage
- ExampleUsagePage

### ✅ Using Old API (Now Fixed)
- StaffPage
- TicketsPage
- KPIPage
- KMIPage
- KAIPage
- CalendarPage
- AnalyticsPage
- HRDashboard
- ManagerDashboard
- EmployeeDashboard
- ManagementDashboard
- LeaveApprovalPage

## Technical Details

### Old API Token Flow (Fixed)
```
Request Made
     ↓
Request Interceptor
     ↓
Check internal tokens variable
     ↓
If empty → Read from localStorage ✅
     ↓
Add Authorization header
     ↓
Request sent with token
```

### Response Interceptor (Also Updated)
```
401 Response
     ↓
Get refresh token from localStorage ✅
     ↓
Call /auth/refresh
     ↓
Update localStorage
     ↓
Retry original request with new token
```

## Key Improvements

1. ✅ **Wait for Auth**: Pages now wait for user before fetching data
2. ✅ **localStorage Fallback**: Old API reads from localStorage automatically
3. ✅ **Token Sync**: Both new and old API systems work with Redux
4. ✅ **No Breaking Changes**: Backward compatible with all existing pages
5. ✅ **Automatic Refresh**: Token refresh works for all API calls

## Files Modified

```
✅ client/src/pages/common/tasks/TasksPage.jsx
✅ client/src/pages/hr/leaves/LeavesPage.jsx
✅ client/src/pages/ExampleUsagePage.jsx
✅ client/src/lib/api.js (legacy API with localStorage fallback)
```

## Port Configuration

**Development URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Database: localhost:5432 (PostgreSQL)

## Common Issues & Solutions

### Issue: Still getting 401 errors
**Check:**
1. Is the backend server running?
2. Is the token in localStorage valid?
3. Open DevTools → Application → Local Storage → Check 'auth' key
4. Open DevTools → Network → Check if Authorization header is present

### Issue: Token not being added to requests
**Check:**
1. localStorage should have 'auth' key with accessToken
2. Check browser console for parsing errors
3. Make sure you're logged in

### Issue: Infinite redirect to login
**Check:**
1. Backend /auth/refresh endpoint is working
2. Check if refreshToken is valid
3. Clear localStorage and login fresh

---

**Status**: ✅ FIXED
**Date**: November 3, 2025
**Issue**: 401 "Missing token" errors
**Solution**: Wait for auth + localStorage fallback in old API
