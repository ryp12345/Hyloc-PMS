# Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        REACT APPLICATION                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    COMPONENTS LAYER                     │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │    │
│  │  │ Tasks    │  │ Leaves   │  │ Tickets  │  │  KPI   │ │    │
│  │  │ Page     │  │ Page     │  │ Page     │  │  Page  │ │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘ │    │
│  └───────┼─────────────┼─────────────┼────────────┼───────┘    │
│          │             │             │            │             │
│          │             │             │            │             │
│  ┌───────▼─────────────▼─────────────▼────────────▼───────┐    │
│  │              REDUX STORE (State Management)            │    │
│  │                                                         │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────┐  │    │
│  │  │   auth   │  │  tasks   │  │  leaves  │  │users │  │    │
│  │  │  Slice   │  │  Slice   │  │  Slice   │  │Slice │  │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──┬───┘  │    │
│  │       │             │             │           │       │    │
│  │       └─────────────┴─────────────┴───────────┘       │    │
│  │                         │                             │    │
│  └─────────────────────────┼─────────────────────────────┘    │
│                            │                                   │
│                            │ dispatch actions                  │
│                            │                                   │
│  ┌─────────────────────────▼─────────────────────────────┐    │
│  │                  API SERVICES LAYER                    │    │
│  │                                                         │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐    │    │
│  │  │  auth   │ │  tasks  │ │ leaves  │ │  users   │    │    │
│  │  │ Service │ │ Service │ │ Service │ │  Service │    │    │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬─────┘    │    │
│  │       │           │           │           │           │    │
│  │  ┌────┴───────────┴───────────┴───────────┴────┐      │    │
│  │  │          AXIOS CONFIGURATION                │      │    │
│  │  │  • Request Interceptor (Add Token)         │      │    │
│  │  │  • Response Interceptor (Token Refresh)    │      │    │
│  │  │  • Error Handling                          │      │    │
│  │  └────────────────┬───────────────────────────┘      │    │
│  └───────────────────┼────────────────────────────────────┘    │
│                      │                                         │
└──────────────────────┼─────────────────────────────────────────┘
                       │ HTTP Requests
                       │
┌──────────────────────▼─────────────────────────────────────────┐
│                      BACKEND API                                │
│                   (Express.js Server)                           │
│                                                                  │
│  /api/auth     /api/tasks    /api/leaves    /api/users         │
│  /api/tickets  /api/kpi      /api/kmi       /api/kai           │
│  /api/calendar                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow Patterns

### Pattern 1: Redux Flow (State Management)

```
┌──────────────┐
│  Component   │
└──────┬───────┘
       │ 1. dispatch(action)
       ▼
┌──────────────┐
│ Redux Thunk  │ (Async Action)
└──────┬───────┘
       │ 2. API call
       ▼
┌──────────────┐
│ API Service  │
└──────┬───────┘
       │ 3. HTTP request
       ▼
┌──────────────┐
│   Backend    │
└──────┬───────┘
       │ 4. Response
       ▼
┌──────────────┐
│ Redux Store  │ (State Updated)
└──────┬───────┘
       │ 5. useSelector
       ▼
┌──────────────┐
│  Component   │ (Re-renders)
└──────────────┘
```

### Pattern 2: Direct API Flow (One-off Calls)

```
┌──────────────┐
│  Component   │
└──────┬───────┘
       │ 1. Call service
       ▼
┌──────────────┐
│ API Service  │
└──────┬───────┘
       │ 2. HTTP request
       ▼
┌──────────────┐
│   Backend    │
└──────┬───────┘
       │ 3. Response
       ▼
┌──────────────┐
│  Component   │ (Update local state)
└──────────────┘
```

## Authentication Flow

```
┌─────────────┐
│ Login Page  │
└─────┬───────┘
      │ 1. User enters credentials
      ▼
┌─────────────────┐
│ dispatch(login) │
└─────┬───────────┘
      │ 2. API call
      ▼
┌─────────────────┐
│  authService    │
└─────┬───────────┘
      │ 3. POST /api/auth/login
      ▼
┌─────────────────┐
│    Backend      │
└─────┬───────────┘
      │ 4. Returns tokens + user
      ▼
┌─────────────────┐
│  Redux Store    │ (Store tokens & user)
└─────┬───────────┘
      │ 5. Save to localStorage
      ▼
┌─────────────────┐
│  localStorage   │
└─────────────────┘
      │
      │ On subsequent requests
      ▼
┌─────────────────────────┐
│ Axios Request           │
│ Interceptor             │
│ • Reads token from      │
│   localStorage          │
│ • Adds Authorization    │
│   header                │
└─────────────────────────┘
```

## Token Refresh Flow

```
┌──────────────┐
│   Request    │
└──────┬───────┘
       │ 1. API call with expired token
       ▼
┌──────────────┐
│   Backend    │
└──────┬───────┘
       │ 2. Returns 401 Unauthorized
       ▼
┌──────────────────────┐
│ Response Interceptor │
└──────┬───────────────┘
       │ 3. Detects 401
       ▼
┌──────────────────────┐
│ Auto Refresh Token   │
└──────┬───────────────┘
       │ 4. POST /api/auth/refresh
       ▼
┌──────────────────────┐
│  Get New Tokens      │
└──────┬───────────────┘
       │ 5. Update localStorage
       ▼
┌──────────────────────┐
│ Retry Original       │
│ Request              │
└──────────────────────┘
```

## File Organization

```
client/src/
│
├── api/                      # API Services Layer
│   ├── axiosConfig.js       # ← Base Axios setup
│   ├── authApi.js           # ← Auth endpoints
│   ├── tasksApi.js          # ← Tasks endpoints
│   ├── leavesApi.js         # ← Leaves endpoints
│   ├── ticketsApi.js        # ← Tickets endpoints
│   ├── kpiApi.js            # ← KPI endpoints
│   ├── kmiApi.js            # ← KMI endpoints
│   ├── kaiApi.js            # ← KAI endpoints
│   ├── usersApi.js          # ← Users endpoints
│   └── calendarApi.js       # ← Calendar endpoints
│
├── store/                    # Redux Layer
│   ├── slices/              # Redux Slices
│   │   ├── authSlice.js     # ← Auth state & actions
│   │   ├── tasksSlice.js    # ← Tasks state & actions
│   │   ├── leavesSlice.js   # ← Leaves state & actions
│   │   └── usersSlice.js    # ← Users state & actions
│   ├── store.js             # ← Store configuration
│   └── hooks.js             # ← Custom Redux hooks
│
├── pages/                    # UI Components
│   ├── tasks/
│   │   └── TasksPage.jsx    # ← Uses Redux
│   ├── leaves/
│   │   └── LeavesPage.jsx   # ← Uses Redux
│   └── ExampleUsagePage.jsx # ← Demo page
│
├── auth/
│   └── AuthContext.jsx       # ← Wrapper around Redux
│
└── main.jsx                  # ← Redux Provider setup
```

## Redux State Tree

```
store
├── auth
│   ├── user
│   │   ├── id
│   │   ├── email
│   │   ├── name
│   │   └── role
│   ├── accessToken
│   ├── refreshToken
│   ├── isAuthenticated
│   ├── loading
│   └── error
│
├── tasks
│   ├── tasks []
│   │   └── { id, title, description, status, priority, ... }
│   ├── loading
│   └── error
│
├── leaves
│   ├── leaves []
│   │   └── { id, from_date, to_date, status, ... }
│   ├── pendingLeaves []
│   ├── loading
│   └── error
│
└── users
    ├── users []
    │   └── { id, name, email, role, ... }
    ├── staffNames []
    │   └── { id, name, designation }
    ├── loading
    └── error
```

## Component Communication

```
┌────────────────────────────────────────────────────────┐
│                    Parent Component                     │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Child A    │  │   Child B    │  │   Child C   │ │
│  │              │  │              │  │             │ │
│  │ useSelector  │  │ useSelector  │  │ useSelector │ │
│  │  (tasks)     │  │  (tasks)     │  │  (leaves)   │ │
│  └──────────────┘  └──────────────┘  └─────────────┘ │
│         │                  │                 │         │
│         └──────────┬───────┴─────────────────┘         │
│                    │                                   │
│                    ▼                                   │
│          ┌──────────────────┐                         │
│          │   Redux Store    │                         │
│          │  (Shared State)  │                         │
│          └──────────────────┘                         │
│                                                         │
│  No prop drilling needed! All components access        │
│  the same centralized state.                           │
└────────────────────────────────────────────────────────┘
```

## Benefits Visualization

### Before (Single API + Local State)

```
Component A ──┐
               ├──► api.js ──► Backend
Component B ──┘
     │
     └──► useState (Local state)
          • Duplicated state
          • Hard to share
          • Prop drilling needed
```

### After (Separate APIs + Redux)

```
Component A ──┐                    ┌──► authApi.js
               │                    │
Component B ───┼──► Redux Store ───┼──► tasksApi.js  ──► Backend
               │                    │
Component C ──┘                    └──► leavesApi.js
     
     • Centralized state
     • Easy to share
     • No prop drilling
     • Better organized
```

## Performance Optimization

```
┌─────────────────────────────────────────────┐
│         Redux State Normalization           │
│                                             │
│  Instead of:                                │
│  tasks: [                                   │
│    { id: 1, assignedTo: { id, name... } }  │
│  ]                                          │
│                                             │
│  Use:                                       │
│  tasks: { 1: { id: 1, assignedTo: 2 } }   │
│  users: { 2: { id: 2, name: "..." } }     │
│                                             │
│  Benefits:                                  │
│  ✓ No data duplication                     │
│  ✓ Faster updates                          │
│  ✓ Easier to sync                          │
└─────────────────────────────────────────────┘
```

## Error Handling Strategy

```
┌──────────────┐
│   Request    │
└──────┬───────┘
       │
       ├──► Success ──► Update State ──► Show Success
       │
       ├──► 401 ──► Refresh Token ──► Retry
       │
       ├──► 400 ──► Show Validation Error
       │
       ├──► 403 ──► Show Permission Error
       │
       ├──► 500 ──► Show Server Error
       │
       └──► Network Error ──► Show Connection Error
```

---

This architecture provides:
✅ **Scalability** - Easy to add new features
✅ **Maintainability** - Clear separation of concerns
✅ **Testability** - Each layer can be tested independently
✅ **Developer Experience** - Clear patterns and structure
