# Auth Persistence Fix - Testing Guide

## Issue Fixed
**Problem**: After refreshing the page, user was getting logged out automatically.

**Root Cause**: 
1. The loading state was not being properly managed during initialization
2. AuthContext was rendering before localStorage auth was restored
3. Redux state wasn't properly initialized from localStorage

## Changes Made

### 1. Updated `AuthContext.jsx`
- ✅ Added `isInitialized` state to track auth restoration
- ✅ Show loading spinner while checking localStorage
- ✅ Properly handle token validation and refresh on app load
- ✅ Better error handling for failed token refresh
- ✅ Only render app after auth state is fully restored

### 2. Updated `authSlice.js`
- ✅ Fixed `setCredentials` to properly handle null values
- ✅ Added proper loading states for logout action
- ✅ Better handling of logout failures

## How Auth Persistence Works Now

```
Page Load/Refresh
      ↓
Show Loading Spinner
      ↓
Check localStorage for 'auth'
      ↓
   Found? ──No──→ Show Login Page
      ↓
     Yes
      ↓
Set credentials in Redux
      ↓
Validate with /auth/me
      ↓
Valid? ──Yes──→ Show Dashboard
      ↓
     No
      ↓
Try Refresh Token
      ↓
Success? ──Yes──→ Show Dashboard
      ↓
     No
      ↓
Clear auth & Show Login Page
```

## Testing Instructions

### Test 1: Normal Login & Refresh
1. ✅ Open the app (http://localhost:5174)
2. ✅ Login with credentials
3. ✅ Navigate to any protected page (Tasks, Leaves, etc.)
4. ✅ **Refresh the page (F5 or Ctrl+R)**
5. ✅ **Expected**: User should stay logged in and remain on the same page

### Test 2: Token Expiration Handling
1. ✅ Login successfully
2. ✅ Open browser DevTools → Application → Local Storage
3. ✅ Find the 'auth' key
4. ✅ Manually modify the accessToken to make it invalid
5. ✅ Refresh the page
6. ✅ **Expected**: App should attempt token refresh, and keep user logged in if refresh token is valid

### Test 3: Invalid Tokens
1. ✅ Login successfully
2. ✅ Open browser DevTools → Application → Local Storage
3. ✅ Manually modify both accessToken and refreshToken to invalid values
4. ✅ Refresh the page
5. ✅ **Expected**: User should be logged out and redirected to login page

### Test 4: Manual Logout
1. ✅ Login successfully
2. ✅ Click logout button
3. ✅ **Expected**: Redirect to login page
4. ✅ Try to navigate back to a protected route
5. ✅ **Expected**: Should redirect to login page

### Test 5: Direct URL Access (When Logged In)
1. ✅ Login successfully
2. ✅ Close the browser tab
3. ✅ Open a new tab and go directly to http://localhost:5174/tasks
4. ✅ **Expected**: User should remain logged in and see the tasks page

### Test 6: Protected Route Access (When Logged Out)
1. ✅ Make sure you're logged out
2. ✅ Try to access http://localhost:5174/tasks directly
3. ✅ **Expected**: Should redirect to login page

## Visual Indicators

### Loading State
When the app is initializing auth:
```
┌──────────────────────────┐
│                          │
│    ⟳ Loading Spinner     │
│      "Loading..."        │
│                          │
└──────────────────────────┘
```

### After Successful Auth Restore
- User stays on the current page
- No redirect to login
- User data is available in Redux store

## Debugging

### Check Redux State
Open Redux DevTools and check:
```javascript
{
  auth: {
    user: { ... },           // Should have user data
    accessToken: "...",      // Should have token
    refreshToken: "...",     // Should have refresh token
    isAuthenticated: true,   // Should be true
    loading: false,
    error: null
  }
}
```

### Check localStorage
Open DevTools → Application → Local Storage:
```javascript
{
  "auth": {
    "user": { "id": 1, "email": "...", "name": "...", "role": "..." },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### Check Console
Look for these logs:
- ✅ No "Token refresh failed" errors (unless tokens are actually invalid)
- ✅ No "Failed to parse auth data" errors

## Common Issues & Solutions

### Issue: Still getting logged out on refresh
**Solution**: 
1. Check if backend server is running
2. Verify `/auth/me` endpoint is working
3. Check browser console for errors
4. Clear localStorage and login again

### Issue: Infinite loading spinner
**Solution**:
1. Check network tab - is `/auth/me` returning 401?
2. Check if refresh token endpoint is working
3. Clear localStorage and try again

### Issue: "Network Error" on refresh
**Solution**:
1. Make sure backend server is running on http://localhost:4000
2. Check VITE_API_URL in .env file
3. Check browser console for CORS errors

## Technical Details

### Auth Flow on Page Load

1. **Check localStorage** - Read saved auth data
2. **Dispatch setCredentials** - Set initial state in Redux
3. **Validate Token** - Call `/auth/me` to verify token is still valid
4. **On Success** - User stays logged in
5. **On Failure (401)** - Try to refresh the token
6. **Token Refresh** - Call `/auth/refresh` with refreshToken
7. **Update Tokens** - Save new tokens to Redux and localStorage
8. **Retry Validation** - Call `/auth/me` again with new token
9. **Final Success** - User stays logged in
10. **Final Failure** - Clear auth and show login page

### Key Code Changes

**AuthContext.jsx**:
- Added `isInitialized` state
- Show loading UI until auth is restored
- Better error handling

**authSlice.js**:
- Fixed `setCredentials` to handle null values
- Added loading states for all auth actions

## Environment Variables

Make sure you have:
```env
VITE_API_URL=http://localhost:4000/api
```

## Backend Requirements

The backend must support these endpoints:
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user (with auth token)
- `POST /api/auth/refresh` - Refresh access token

---

**Status**: ✅ FIXED
**Date**: November 3, 2025
**Issue**: User logout on page refresh
**Solution**: Proper auth state initialization and persistence
