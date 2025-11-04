# Hyloc-GIT Full-Stack Application

**PERN Stack (PostgreSQL + Express + React + Node.js) with Redux, Tailwind CSS, JWT Auth, and Role-Based Access Control**

KLS, Gogte Institute of Technology (GIT), Belagavi, in collaboration with **Hyloc Hydrotechnic Pvt. Ltd.**

---

## 🚀 Quick Start

### 1. Prerequisites

- **Node.js** 18+ and **npm** installed
- **PostgreSQL** 14+ running on `localhost:5432`
- PostgreSQL superuser credentials (default: `postgres` / `itcell`)

### 2. Clone/Navigate to Workspace

```bash
cd d:\Demo-Hyloc
```

### 3. Install Dependencies

```bash
# Install root dependencies (includes concurrently)
npm install

# Backend dependencies
cd server
npm install

# Frontend dependencies
cd ../client
npm install
cd ..
```

### 4. Configure Environment

**Backend** (`server/.env`):
```env
NODE_ENV=development
PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_NAME=hyloc_db
DB_USER=postgres
DB_PASS=itcell

JWT_SECRET=supersecret_access_please_change
JWT_EXPIRES=15m
JWT_REFRESH_SECRET=supersecret_refresh_please_change
JWT_REFRESH_EXPIRES=7d

CORS_ORIGIN=http://localhost:3000
```

**Frontend** (`client/.env`):
```env
VITE_API_URL=http://localhost:3001/api
```

### 5. Setup Database

```bash
cd server
npm run db:create
npm run seed
```

This will:
- Create the `hyloc_db` database
- Sync all tables (roles, users, staff, kmi, kpi, kai, tasks, tickets, leaves, goals)
- Seed sample data (4 roles, 4 users, sample tasks, tickets, leaves)

### 6. Run Development Servers

**Option 1: Run Both Together (Recommended)**
```bash
# From root directory
npm run dev
```

**Option 2: Run Separately**

**Backend** (Terminal 1):
```bash
cd server
npm run dev
```
→ Server at http://localhost:3001

**Frontend** (Terminal 2):
```bash
cd client
npm run dev
```
→ Client at http://localhost:3000

---

## 🔐 Default Users

| Email                    | Password      | Role       |
|--------------------------|---------------|------------|
| mgmt@example.com         | password123   | Management |
| manager@example.com      | password123   | Manager    |
| employee@example.com     | password123   | Employee   |
| hr@example.com           | password123   | HR         |

---

## 📂 Project Structure

```
Demo-Hyloc/
├── server/
│   ├── src/
│   │   ├── controllers/     # Auth, Users, KMI, KPI, KAI, Tasks, Tickets, Leaves, Calendar, Departments, Designations, Associations
│   │   ├── middleware/      # Auth (JWT verify, RBAC)
│   │   ├── models/          # Sequelize models (Role, User, Staff, KMI, KPI, KAI, Task, Ticket, Leave, Goal, Department, Designation, Association)
│   │   ├── routes/          # Express routes
│   │   ├── scripts/         # createDb.js, resetDb.js
│   │   ├── seed/            # seed.js
│   │   ├── setup/           # db.js (Sequelize config)
│   │   └── server.js        # Express app entry
│   ├── .env
│   └── package.json
├── client/
│   ├── src/
│   │   ├── api/             # Separate API services (authApi, tasksApi, leavesApi, etc.)
│   │   ├── auth/            # AuthContext (JWT refresh logic, Redux wrapper)
│   │   ├── components/      # DashboardLayout (role-based sidebar)
│   │   ├── lib/             # Legacy api.js (Axios with interceptors)
│   │   ├── pages/           # Organized by role (auth, common, employee, manager, hr, management)
│   │   │   ├── auth/        # LoginPage
│   │   │   ├── common/      # Tasks, Tickets, Calendar
│   │   │   ├── employee/    # Employee Dashboard, KAI
│   │   │   ├── manager/     # Manager Dashboard, KPI, Analytics, Leave Approval
│   │   │   ├── hr/          # HR Dashboard, Staff, Leaves, Departments, Designations, Associations
│   │   │   └── management/  # Management Dashboard, KMI
│   │   ├── store/           # Redux store (slices for auth, tasks, leaves, users)
│   │   ├── widgets/         # KpiCards (dashboard metrics)
│   │   ├── App.jsx          # Router (protected routes, role redirects)
│   │   └── main.jsx         # Redux Provider setup
│   ├── .env
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── package.json             # Root package with dev scripts
├── README.md                # This file
├── ARCHITECTURE.md          # Detailed architecture documentation
├── REDUX_IMPLEMENTATION.md  # Redux usage guide
├── QUICK_REFERENCE.md       # Quick reference for common patterns
├── PORT_CONFIGURATION.md    # Port setup guide
├── IMPLEMENTATION_SUMMARY.md # Implementation summary
├── AUTH_FIX.md              # Auth persistence fix documentation
└── TOKEN_FIX.md             # Token authorization fix documentation
```

---

## 🗄️ Database Schema

### Core Tables
- **roles**: Management, Manager, Employee, HR
- **users**: id (UUID), name, email, password (hashed), role_id
- **staff**: emp_id, name, designation, department, religion, salary, user_id
- **kmi**: Key Management Indicators (Management-created)
- **kpi**: Key Performance Indicators (linked to KMI, Manager-created)
- **kai**: Key Activity Indicators (linked to KPI, Manager-created)
- **tasks**: Quick Capture tasks with assigned_to/assigned_by
- **tickets**: Help tickets for unforeseen issues
- **leaves**: Digital leave forms with approval workflow
- **goals**: Goal tracking with completion percentage

### Associations (Sequelize)
- `Role.hasMany(User)`
- `User.hasOne(Staff)`
- `KMI.hasMany(KPI)`
- `KPI.hasMany(KAI)`
- `User.hasMany(Task)` (as Assignee/Assigner)
- `User.hasMany(Ticket)` (as Creator/Owner)
- `User.hasMany(Leave)`

---

## 🎯 Features Implemented

### Backend (Express + Sequelize)
✅ JWT authentication with refresh tokens  
✅ Role-based access control (RBAC)  
✅ CRUD APIs for KMI, KPI, KAI, Users, Tasks, Tickets, Leaves  
✅ Department, Designation, and Association management  
✅ Quick Capture task assignment  
✅ Ticket workflow (Open → In Progress → Resolved)  
✅ Leave approval workflow (Pending → Approved/Rejected)  
✅ Calendar events integration  
✅ Database seed script with sample data  
✅ Health check endpoint

### Frontend (React + Redux + Tailwind)
✅ **Redux Toolkit** for state management  
✅ **Separate API service modules** for better organization  
✅ Login page with JWT auth and auto token refresh  
✅ Protected routes and role-based redirects  
✅ Dynamic sidebar navigation per role  
✅ Dashboards: Management, Manager, Employee, HR  
✅ KMI/KPI/KAI management pages  
✅ Task manager with Quick Capture modal (Redux-powered)  
✅ Ticket creation and status tracking  
✅ Leave application and approval system (Redux-powered)  
✅ Staff management with departments, designations, and associations  
✅ FullCalendar integration  
✅ Analytics dashboard with Recharts  
✅ Responsive Tailwind UI  
✅ Auth persistence on page refresh  
✅ Automatic token refresh on expiration

---

## 🧩 API Endpoints

### Auth
- `POST /api/auth/register` – Register new user
- `POST /api/auth/login` – Login (get access + refresh tokens)
- `POST /api/auth/refresh` – Refresh access token
- `GET /api/auth/me` – Get current user
- `POST /api/auth/logout` – Logout

### Users
- `GET /api/users` – List users (Management/HR only)
- `GET /api/users/staff-names` – Get staff names for dropdowns
- `GET /api/users/:id` – Get user by ID
- `POST /api/users` – Create user (Management/HR)
- `PUT /api/users/:id` – Update user
- `DELETE /api/users/:id` – Delete user (Management/HR)

### KMI (Key Management Indicators)
- `GET /api/kmi` – List KMI (Management sees all, others see own)
- `POST /api/kmi` – Create KMI (Management only)
- `PUT /api/kmi/:id` – Update KMI
- `DELETE /api/kmi/:id` – Delete KMI

### KPI (Key Performance Indicators)
- `GET /api/kpi` – List KPI (Manager/Management)
- `POST /api/kpi` – Create KPI (Manager/Management)
- `PUT /api/kpi/:id` – Update KPI
- `DELETE /api/kpi/:id` – Delete KPI

### KAI (Key Activity Indicators)
- `GET /api/kai` – List KAI (Employee/Manager/Management)
- `POST /api/kai` – Create KAI
- `PUT /api/kai/:id` – Update KAI
- `DELETE /api/kai/:id` – Delete KAI

### Tasks
- `GET /api/tasks` – List all tasks
- `GET /api/tasks/mine` – My assigned tasks
- `GET /api/tasks/created` – Tasks I created
- `POST /api/tasks` – Create task
- `POST /api/tasks/quick-capture` – Quick Capture (assign task)
- `PUT /api/tasks/:id` – Update task
- `DELETE /api/tasks/:id` – Delete task

### Tickets
- `GET /api/tickets` – List tickets (created or assigned)
- `POST /api/tickets` – Create ticket
- `PATCH /api/tickets/:id/status` – Update ticket status

### Leaves
- `POST /api/leaves` – Apply for leave
- `GET /api/leaves` – List all leaves (Manager/HR/Management)
- `GET /api/leaves/mine` – My leave requests
- `GET /api/leaves/pending` – Pending leave requests
- `PUT /api/leaves/:id` – Update leave
- `POST /api/leaves/:id/approve` – Approve leave (Manager/HR/Management)
- `POST /api/leaves/:id/reject` – Reject leave
- `DELETE /api/leaves/:id` – Delete leave

### Departments
- `GET /api/departments` – List all departments
- `POST /api/departments` – Create department
- `PUT /api/departments/:id` – Update department
- `DELETE /api/departments/:id` – Delete department

### Designations
- `GET /api/designations` – List all designations
- `POST /api/designations` – Create designation
- `PUT /api/designations/:id` – Update designation
- `DELETE /api/designations/:id` – Delete designation

### Associations
- `GET /api/associations` – List all associations
- `POST /api/associations` – Create association
- `PUT /api/associations/:id` – Update association
- `DELETE /api/associations/:id` – Delete association

### Calendar
- `GET /api/calendar/events` – Get calendar events (tasks + leaves)

### Health Check
- `GET /api/health` – Server health check

---

## 📊 Role-Based Navigation

| Role       | Navigation Items                               | Dashboard       |
|------------|------------------------------------------------|-----------------|
| Management | KMI, Staff, Calendar, Help Tickets, Analytics  | KMI Dashboard   |
| Manager    | KPI, Staff, Calendar, Help Tickets             | KPI Dashboard   |
| Employee   | KAI, Calendar, Help Tickets                    | KAI Dashboard   |
| HR         | Staff Management                               | HR Dashboard    |

---

## 🔧 Development Scripts

### Root Directory
```bash
npm run dev        # Start both client and server concurrently
npm run client     # Start only client (port 3000)
npm run server     # Start only server (port 3001)
```

### Backend (`server/`)
```bash
npm run dev        # Start dev server with nodemon (auto-reload)
npm start          # Production server
npm run db:create  # Create database
npm run seed       # Seed sample data
```

### Frontend (`client/`)
```bash
npm run dev        # Start Vite dev server (port 3000)
npm run build      # Build for production
npm run preview    # Preview production build
```

---

## 🛠️ Tech Stack

| Layer          | Technology                     |
|----------------|--------------------------------|
| Frontend       | React 18 + Vite                |
| State Mgmt     | Redux Toolkit + React-Redux    |
| Styling        | Tailwind CSS                   |
| Routing        | React Router v6                |
| Charts         | Recharts                       |
| Calendar       | FullCalendar.js                |
| HTTP Client    | Axios (with interceptors)      |
| Backend        | Node.js + Express              |
| ORM            | Sequelize                      |
| Database       | PostgreSQL 14+                 |
| Auth           | JWT (access + refresh tokens)  |
| Validation     | express-validator              |
| Dev Tools      | Nodemon, Concurrently          |

---

## 📝 Minutes of Meeting (MoM) Summary

**Venue**: Hyloc Hydrotechnic Pvt. Ltd., Office  
**Date**: 25.08.2025  
**Time**: 11:30 AM

### Key Requirements
1. **Quick Capture**: Icon to assign/forward tasks to any user (even non-attendees)
2. **KMI–KPI–KAI Model**: Hierarchical indicator management
3. **Role-Based Access**: Management, Manager, Employee, HR dashboards
4. **HR & Staff Module**: Employee CRUD (EmpID, Name, Dept, Salary, etc.)
5. **Leave Management**: Digital leave forms with approval workflow
6. **Ticket System**: Unforeseen activity tracking routed to Dept/Company Head
7. **Calendar Integration**: Tasks and leaves in FullCalendar

---

## � Additional Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed system architecture and data flow
- **[REDUX_IMPLEMENTATION.md](./REDUX_IMPLEMENTATION.md)** - Complete Redux usage guide
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick reference for common patterns
- **[PORT_CONFIGURATION.md](./PORT_CONFIGURATION.md)** - Port configuration guide
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Implementation summary
- **[AUTH_FIX.md](./AUTH_FIX.md)** - Auth persistence fix documentation
- **[TOKEN_FIX.md](./TOKEN_FIX.md)** - Token authorization fix documentation

## �🚦 Next Steps

1. **Production Deployment**
   - Configure PostgreSQL on production server
   - Set production environment variables
   - Build frontend: `npm run build` (in `client/`)
   - Serve backend via PM2 or Docker
   - Use Nginx/Caddy as reverse proxy
   - Configure SSL certificates

2. **Enhancements**
   - Migrate remaining pages to Redux (tickets, KPI, KMI, KAI, calendar)
   - Add goal management UI
   - Implement real-time notifications (Socket.io)
   - Add file upload for tickets/tasks
   - Export analytics to PDF/Excel
   - Multi-tenant support (for multiple companies)
   - Add TypeScript for better type safety

3. **Testing**
   - Unit tests (Jest + Supertest for backend)
   - Integration tests for API endpoints
   - E2E tests (Playwright/Cypress for frontend)
   - Redux slice tests

---

## 📧 Contact

**Project**: KLS GIT × Hyloc Hydrotechnic Pvt. Ltd.  
**Developed By**: AI Full-Stack Assistant  
**Stack**: PERN (PostgreSQL + Express + React + Node.js)

---

## 🔍 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Cannot connect to database:**
- Check PostgreSQL is running on port 5432
- Verify credentials in `server/.env`
- Ensure `hyloc_db` database exists

**401 Unauthorized errors:**
- Check if you're logged in
- Verify token in browser localStorage
- Check Authorization header in Network tab

**CORS errors:**
- Verify `CORS_ORIGIN=http://localhost:3000` in `server/.env`
- Restart backend server after changing .env
- Clear browser cache

**Page refresh logs out:**
- See [AUTH_FIX.md](./AUTH_FIX.md) for solution details
- Auth persistence is already implemented

### Debugging Tools

- **Redux DevTools** - Install browser extension to inspect state
- **Network Tab** - Monitor API calls and responses
- **Console** - Check for JavaScript errors
- **PostgreSQL logs** - Check database queries and errors

---

**Enjoy building! 🚀**

````
