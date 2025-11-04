# Port Configuration Guide

## New Port Settings

### ✅ Client (Frontend)
- **Port**: 3000
- **URL**: http://localhost:3000

### ✅ Server (Backend API)
- **Port**: 3001
- **URL**: http://localhost:3001
- **API Base**: http://localhost:3001/api

## Files Updated

### Client Files:
1. ✅ `client/vite.config.js` - Changed from 5173 to 3000
2. ✅ `client/.env` - VITE_API_URL=http://localhost:3001/api
3. ✅ `client/src/api/axiosConfig.js` - Default URL updated (new API services)
4. ✅ `client/src/lib/api.js` - Default URL updated (legacy API)
5. ✅ `client/src/auth/AuthContext.jsx` - Default URL updated

### Server Files:
1. ✅ `server/.env` - PORT=3001, CORS_ORIGIN=http://localhost:3000
2. ✅ `server/src/server.js` - Default port 3001 and CORS updated

### Root Files:
1. ✅ `package.json` - Added convenience scripts (dev, client, server)

## Architecture Overview

```
┌────────────────────────────────────────┐
│  Browser (http://localhost:3000)       │
│  - React Application                   │
│  - Redux Store                         │
│  - Vite Dev Server                     │
└────────────┬───────────────────────────┘
             │
             │ Axios HTTP Requests
             │ Authorization: Bearer <token>
             │
┌────────────▼───────────────────────────┐
│  Backend (http://localhost:3001)       │
│  - Express Server                      │
│  - REST API Endpoints                  │
│  - JWT Authentication                  │
│  - CORS: localhost:3000                │
└────────────┬───────────────────────────┘
             │
             │ SQL Queries
             │
┌────────────▼───────────────────────────┐
│  PostgreSQL (localhost:5432)           │
│  - Database: hyloc_db                  │
│  - Sequelize ORM                       │
└────────────────────────────────────────┘
```

## How to Start

### Option 1: Start Both Together (Recommended)
```bash
npm run dev
```

### Option 2: Start Separately

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### Option 3: Individual Commands

**Start Backend:**
```bash
npm run server
```

**Start Client:**
```bash
npm run client
```

## Verification

### 1. Check Backend is Running
Open: http://localhost:3001/api/health

**Expected Response:**
```json
{
  "status": "ok",
  "time": "2025-11-03T..."
}
```

### 2. Check Frontend is Running
Open: http://localhost:3000

**Expected:**
- Should show the login page or dashboard
- No CORS errors in console

### 3. Check API Connection
1. Login to the app
2. Open Browser DevTools → Network tab
3. Look for API calls going to `http://localhost:3001/api`
4. Check that they return 200 OK (not 401 or CORS errors)

## Environment Variables

### Client (.env)
```properties
VITE_API_URL=http://localhost:3001/api
```

### Server (.env)
```properties
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000

# Database settings
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hyloc_db
DB_USER=postgres
DB_PASS=itcell

# JWT secrets
JWT_SECRET=supersecret_access_please_change
JWT_EXPIRES=15m
JWT_REFRESH_SECRET=supersecret_refresh_please_change
JWT_REFRESH_EXPIRES=7d
```

## CORS Configuration

The server is configured to accept requests from:
- http://localhost:3000 (client)

If you get CORS errors:
1. Check that both servers are running
2. Verify CORS_ORIGIN in server/.env is http://localhost:3000
3. Clear browser cache and reload

## Common Issues

### Issue: Port already in use
**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or just change the port in .env files
```

### Issue: Cannot connect to API
**Check:**
1. Is backend server running on port 3001?
2. Is `VITE_API_URL` set correctly in client/.env?
3. Check browser console for errors
4. Verify network tab shows correct API URL

### Issue: CORS Error
**Check:**
1. Is `CORS_ORIGIN=http://localhost:3000` in server/.env?
2. Restart the backend server after changing .env
3. Clear browser cache

### Issue: 401 Unauthorized
**Check:**
1. Are you logged in?
2. Is the token in localStorage?
3. Check if token is being sent in Authorization header (DevTools → Network)

## Quick Test

After starting both servers:

1. ✅ Open http://localhost:3000
2. ✅ Login with credentials
3. ✅ Navigate to Tasks or Leaves page
4. ✅ Open DevTools → Network
5. ✅ Verify API calls go to http://localhost:3001/api
6. ✅ Check that requests have Authorization header
7. ✅ Verify responses are 200 OK

## NPM Scripts Available

From root directory:

```bash
npm run client    # Start frontend only (port 3000)
npm run server    # Start backend only (port 3001)
npm run dev       # Start both together
```

From client directory:

```bash
npm run dev       # Start Vite dev server
npm run build     # Build for production
npm run preview   # Preview production build
```

From server directory:

```bash
npm run dev       # Start with nodemon (auto-reload)
npm start         # Start normally
```

## URLs Summary

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend API | 3001 | http://localhost:3001/api |
| Health Check | 3001 | http://localhost:3001/api/health |

## Running the Application

### Method 1: Run Both Together (Recommended)
```bash
# From root directory
npm run dev
```
This runs both client and server concurrently using the `concurrently` package.

### Method 2: Run Separately
```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client  
cd client
npm run dev
```

### Method 3: Individual Scripts (from root)
```bash
# Start only server
npm run server

# Start only client
npm run client
```

## Features Verification

After starting both servers, verify:

1. **Backend Health Check**
   - Open: http://localhost:3001/api/health
   - Should return: `{"status":"ok","time":"..."}`

2. **Frontend Load**
   - Open: http://localhost:3000
   - Should show login page

3. **CORS Working**
   - Login and check browser console
   - No CORS errors should appear

4. **API Communication**
   - Open DevTools → Network tab
   - API calls should go to `http://localhost:3001/api/*`
   - Should have `Authorization: Bearer ...` header

---

**Status**: ✅ Configured and Production Ready
**Client Port**: 3000 (Vite Dev Server)
**Server Port**: 3001 (Express API Server)
**Database Port**: 5432 (PostgreSQL)
**CORS**: Properly configured for localhost:3000
