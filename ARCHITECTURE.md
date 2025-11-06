# Architecture Overview

## System Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────┐
│                    REACT APPLICATION (Port 3000)                      │
├───────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                     COMPONENTS LAYER                          │    │
│  │  Organized by Role: auth, common, employee, manager, hr, mgmt│    │
│  │  ┌─────────┐  ┌─────────┐  ┌────────┐  ┌──────┐  ┌───────┐ │    │
│  │  │ Tasks   │  │ Leaves  │  │Tickets │  │ KPI  │  │ Staff │ │    │
│  │  │ Page    │  │ Page    │  │ Page   │  │ Page │  │ Page  │ │    │
│  │  └────┬────┘  └────┬────┘  └────┬───┘  └───┬──┘  └───┬───┘ │    │
│  └───────┼────────────┼────────────┼──────────┼─────────┼──────┘    │
│          │            │            │          │         │            │
│          │ Redux      │ Redux      │ Legacy   │ Legacy  │ Legacy     │
│          │            │            │          │         │            │
│  ┌───────▼────────────▼────────────▼──────────▼─────────▼──────┐    │
│  │              REDUX STORE (State Management)                 │    │
│  │                                                              │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │    │
│  │  │   auth   │  │  tasks   │  │  leaves  │  │  users   │   │    │
│  │  │  Slice   │  │  Slice   │  │  Slice   │  │  Slice   │   │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │    │
│  │       │             │             │             │           │    │
│  │       └─────────────┴─────────────┴─────────────┘           │    │
│  │                         │                                   │    │
│  │                  dispatch actions                           │    │
│  └─────────────────────────┼───────────────────────────────────┘    │
│                            │                                         │
│  ┌─────────────────────────▼───────────────────────────────────┐    │
│  │                  API SERVICES LAYER                          │    │
│  │  (9 separate service modules)                               │    │
│  │                                                              │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐         │    │
│  │  │  auth   │ │  tasks  │ │ leaves  │ │  users   │         │    │
│  │  │ Service │ │ Service │ │ Service │ │ Service  │         │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └──────────┘         │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐         │    │
│  │  │ tickets │ │   kpi   │ │   kmi   │ │   kai    │         │    │
│  │  │ Service │ │ Service │ │ Service │ │ Service  │         │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └──────────┘         │    │
│  │  ┌──────────┐                                              │    │
│  │  │ calendar │  (Plus legacy lib/api.js for backward        │    │
│  │  │ Service  │   compatibility)                             │    │
│  │  └──────────┘                                              │    │
│  │                                                              │    │
│  │  ┌────────────────────────────────────────────────────┐    │    │
│  │  │          AXIOS CONFIGURATION                       │    │    │
│  │  │  • Base URL: http://localhost:3001/api            │    │    │
│  │  │  • Request Interceptor (Add Token)                │    │    │
│  │  │  • Response Interceptor (Token Refresh)           │    │    │
│  │  │  • Error Handling & Logging                       │    │    │
│  │  └────────────────┬───────────────────────────────────┘    │    │
│  └───────────────────┼────────────────────────────────────────┘    │
│                      │                                             │
└──────────────────────┼─────────────────────────────────────────────┘
                       │ HTTP Requests
                       │
┌──────────────────────▼───────────────────────────────────────────────┐
│                 BACKEND API (Port 3001)                              │
│                 (Express.js Server)                                  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  ROUTES (11 modules):                                      │    │
│  │  /api/auth         /api/users       /api/tasks            │    │
│  │  /api/leaves       /api/tickets     /api/kmi              │    │
│  │  /api/kpi          /api/kai         /api/calendar         │    │
│  │  /api/departments  /api/designations /api/associations    │    │
│  │  /api/health (Health Check)                               │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  MIDDLEWARE:                                               │    │
│  │  • CORS (origin: http://localhost:3000)                   │    │
│  │  • JWT Verification                                        │    │
│  │  • Role-Based Access Control (RBAC)                       │    │
│  │  • express-validator                                       │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  SEQUELIZE ORM (12 models):                               │    │
│  │  Role, User, Staff, KMI, KPI, KAI, Task, Ticket, Leave    │    │
│  │  Goal, Department, Designation, Association               │    │
│  └────────────────┬───────────────────────────────────────────┘    │
│                   │                                                 │
└───────────────────┼─────────────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────────────────┐
│               PostgreSQL Database (Port 5432)                       │
│                      hyloc_db                                       │
└─────────────────────────────────────────────────────────────────────┘
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
├── api/                      # API Services Layer (9 modules)
│   ├── axiosConfig.js       # ← Base Axios setup with interceptors
│   ├── authApi.js           # ← Auth endpoints (login, logout, refresh, me)
│   ├── tasksApi.js          # ← Tasks endpoints (CRUD + quick capture)
│   ├── leavesApi.js         # ← Leaves endpoints (CRUD + approval)
│   ├── ticketsApi.js        # ← Tickets endpoints
│   ├── kpiApi.js            # ← KPI endpoints
│   ├── kmiApi.js            # ← KMI endpoints
│   ├── kaiApi.js            # ← KAI endpoints
│   ├── usersApi.js          # ← Users endpoints (CRUD + staff names)
│   ├── calendarApi.js       # ← Calendar endpoints
│   ├── departmentApi.js     # ← Department endpoints
│   ├── designationApi.js    # ← Designation endpoints
│   └── associationApi.js    # ← Association endpoints
│
├── store/                    # Redux Layer
│   ├── slices/              # Redux Slices (4 slices)
│   │   ├── authSlice.js     # ← Auth state & actions (login, logout, refresh)
│   │   ├── tasksSlice.js    # ← Tasks state & actions
│   │   ├── leavesSlice.js   # ← Leaves state & actions
│   │   └── usersSlice.js    # ← Users state & actions
│   ├── store.js             # ← Store configuration (Redux Toolkit)
│   └── hooks.js             # ← Custom Redux hooks (useAppDispatch, useAppSelector)
│
├── pages/                    # UI Components (Organized by Role)
│   ├── auth/                # Authentication pages
│   │   └── LoginPage.jsx
│   ├── common/              # Accessible by all roles
│   │   ├── calendar/
│   │   │   └── CalendarPage.jsx
│   │   ├── tasks/
│   │   │   └── TasksPage.jsx          # ← Uses Redux
│   │   └── tickets/
│   │       └── TicketsPage.jsx
│   ├── employee/            # Employee role pages
│   │   ├── dashboards/
│   │   │   └── EmployeeDashboard.jsx
│   │   └── kai/
│   │       └── KAIPage.jsx
│   ├── manager/             # Manager role pages
│   │   ├── dashboards/
│   │   │   └── ManagerDashboard.jsx
│   │   ├── kpi/
│   │   │   └── KPIPage.jsx
│   │   ├── leaves/
│   │   │   └── LeaveApprovalPage.jsx
│   │   └── staff/
│   │       └── StaffPage.jsx
│   ├── hr/                  # HR role pages
│   │   ├── dashboards/
│   │   │   └── HRDashboard.jsx
│   │   ├── staff/
│   │   │   └── StaffPage.jsx
│   │   ├── leaves/
│   │   │   └── LeavesPage.jsx         # ← Uses Redux
│   │   ├── departments/
│   │   │   └── DepartmentsPage.jsx
│   │   ├── designations/
│   │   │   └── DesignationsPage.jsx
│   │   └── associations/
│   │       └── AssociationsPage.jsx
│   ├── management/          # Management role pages
│   │   ├── dashboards/
│   │   │   └── ManagementDashboard.jsx
│   │   ├── kmi/
│   │   │   └── KMIPage.jsx
│   │   └── analytics/
│   │       └── AnalyticsPage.jsx
│   └── ExampleUsagePage.jsx # ← Demo page (Redux examples)
│
├── components/              # Shared Components
│   └── layout/
│       └── DashboardLayout.jsx  # ← Role-based navigation
│
├── auth/                    # Auth Context
│   └── AuthContext.jsx      # ← Wrapper around Redux, handles auth state
│
├── lib/                     # Legacy API
│   └── api.js               # ← Legacy Axios setup (backward compatibility)
│
├── widgets/                 # Reusable Widgets
│   └── KpiCards.jsx         # ← Dashboard metric cards
│
├── App.jsx                  # ← Router with protected routes
└── main.jsx                 # ← Redux Provider + React Router setup
```

```
server/src/
│
├── controllers/             # Request handlers (12 controllers)
│   ├── auth.controller.js
│   ├── users.controller.js
│   ├── tasks.controller.js
│   ├── leaves.controller.js
│   ├── tickets.controller.js
│   ├── kmi.controller.js
│   ├── kpi.controller.js
│   ├── kai.controller.js
│   ├── calendar.controller.js
│   ├── department.controller.js
│   ├── designation.controller.js
│   └── association.controller.js
│
├── middleware/              # Express middleware
│   └── auth.js             # JWT verification + RBAC
│
├── models/                  # Sequelize models (12 models)
│   ├── index.js            # Model associations
│   ├── role.model.js
│   ├── user.model.js
│   ├── staff.model.js
│   ├── kmi.model.js
│   ├── kpi.model.js
│   ├── kai.model.js
│   ├── task.model.js
│   ├── ticket.model.js
│   ├── leave.model.js
│   ├── goal.model.js
│   ├── department.model.js
│   ├── designation.model.js
│   └── association.model.js
│
├── routes/                  # Express routes (11 route modules)
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── task.routes.js
│   ├── leave.routes.js
│   ├── ticket.routes.js
│   ├── kmi.routes.js
│   ├── kpi.routes.js
│   ├── kai.routes.js
│   ├── calendar.routes.js
│   ├── department.routes.js
│   ├── designation.routes.js
│   └── association.routes.js
│
├── scripts/                 # Utility scripts
│   ├── createDb.js         # Create database
│   └── resetDb.js          # Reset database
│
├── seed/                    # Database seeding
│   └── seed.js             # Seed sample data
│
├── setup/                   # Configuration
│   └── db.js               # Sequelize connection
│
└── server.js               # Express app entry point
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

## Port Configuration

```
┌─────────────────────────────────────────┐
│  Frontend (Vite)                        │
│  Port: 3000                             │
│  URL: http://localhost:3000             │
└────────────┬────────────────────────────┘
             │
             │ HTTP Requests
             │
┌────────────▼────────────────────────────┐
│  Backend (Express)                      │
│  Port: 3001                             │
│  API URL: http://localhost:3001/api     │
└────────────┬────────────────────────────┘
             │
             │ Database Queries
             │
┌────────────▼────────────────────────────┐
│  PostgreSQL                             │
│  Port: 5432                             │
│  Database: hyloc_db                     │
└─────────────────────────────────────────┘
```

## Performance Optimization

```
┌─────────────────────────────────────────────┐
│         Redux State Normalization           │
│                                             │
│  Current approach (array-based):            │
│  tasks: [                                   │
│    { id: 1, assignedTo: { id, name... } }  │
│  ]                                          │
│                                             │
│  Future optimization (normalized):          │
│  tasks: { 1: { id: 1, assignedTo: 2 } }   │
│  users: { 2: { id: 2, name: "..." } }     │
│                                             │
│  Benefits:                                  │
│  ✓ No data duplication                     │
│  ✓ Faster updates                          │
│  ✓ Easier to sync                          │
│  ✓ Better for large datasets               │
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

## Technology Stack Details

### Frontend Stack
- **React 18** - Component-based UI library
- **Redux Toolkit 2.9** - State management with simplified API
- **React Redux 9.2** - React bindings for Redux
- **React Router v6** - Client-side routing
- **Axios 1.7** - HTTP client with interceptors
- **Vite 5** - Fast build tool and dev server
- **Tailwind CSS 3** - Utility-first CSS framework
- **Recharts 2** - Charting library for analytics
- **FullCalendar 6** - Calendar and scheduling library
- **Headless UI 2** - Unstyled, accessible UI components
- **Heroicons 2** - Icon library

### Backend Stack
- **Node.js** - JavaScript runtime
- **Express 5** - Web application framework
- **Sequelize 6** - ORM for PostgreSQL
- **PostgreSQL 14+** - Relational database
- **JSON Web Token (JWT)** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Request validation
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **uuid** - Unique ID generation

### Development Tools
- **Nodemon** - Auto-restart server on changes
- **Concurrently** - Run multiple commands concurrently
- **Redux DevTools** - State debugging and time-travel

---

## Key Architecture Decisions

###  Redux Toolkit over Context API
**Reason**: Better performance, built-in dev tools, standardized patterns, easier async handling

###  Separate API Service Modules
**Reason**: Better code organization, easier to test, clear separation of concerns, scalable

###  Role-Based Page Organization
**Reason**: Clear ownership, easier navigation, better access control implementation

###  JWT with Refresh Tokens
**Reason**: Secure authentication, automatic token refresh, persistent sessions

###  Sequelize ORM
**Reason**: Type-safe database queries, easy migrations, model associations, PostgreSQL optimization

###  Vite over Create React App
**Reason**: Faster dev server, faster builds, modern ES modules, better DX

---

**Enhanced Architecture Benefits:**
 **Scalability** - Easy to add new features and modules
 **Maintainability** - Clear separation of concerns and file organization
 **Testability** - Each layer can be tested independently
 **Developer Experience** - Clear patterns, hot reload, Redux DevTools
 **Performance** - Optimized builds, code splitting, lazy loading ready
 **Security** - JWT auth, RBAC, password hashing, CORS protection
 **Type Safety Ready** - Easy migration to TypeScript when needed
