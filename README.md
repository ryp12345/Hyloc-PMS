# Hyloc-GIT Full-Stack Application

**PERN Stack (PostgreSQL + Express + React + Node.js) with Tailwind CSS, JWT Auth, and Role-Based Access Control**

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
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 4. Configure Environment

**Backend** (`server/.env`):
```env
NODE_ENV=development
PORT=4000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=hyloc_db
DB_USER=postgres
DB_PASS=itcell

JWT_SECRET=supersecret_access_please_change
JWT_EXPIRES=15m
JWT_REFRESH_SECRET=supersecret_refresh_please_change
JWT_REFRESH_EXPIRES=7d

CORS_ORIGIN=http://localhost:5173
```

**Frontend** (`client/.env`):
```env
VITE_API_URL=http://localhost:4000/api
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

**Backend** (Terminal 1):
```bash
cd server
npm run dev
```
→ Server at http://localhost:4000

**Frontend** (Terminal 2):
```bash
cd client
npm run dev
```
→ Client at http://localhost:5173

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
│   │   ├── controllers/     # Auth, Users, KMI, KPI, KAI, Tasks, Tickets, Leaves, Calendar
│   │   ├── middleware/      # Auth (JWT verify, RBAC)
│   │   ├── models/          # Sequelize models (Role, User, Staff, KMI, KPI, KAI, Task, Ticket, Leave, Goal)
│   │   ├── routes/          # Express routes
│   │   ├── scripts/         # createDb.js
│   │   ├── seed/            # seed.js
│   │   ├── setup/           # db.js (Sequelize config)
│   │   └── server.js        # Express app entry
│   ├── .env
│   └── package.json
├── client/
│   ├── src/
│   │   ├── auth/            # AuthContext (JWT refresh logic)
│   │   ├── components/      # DashboardLayout (role-based sidebar)
│   │   ├── lib/             # api.js (Axios with interceptors)
│   │   ├── pages/           # Login, Dashboards, KMI/KPI/KAI, Tasks, Tickets, Leaves, Calendar, Analytics
│   │   ├── widgets/         # KpiCards (dashboard metrics)
│   │   ├── App.jsx          # Router (protected routes, role redirects)
│   │   └── main.jsx
│   ├── .env
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
└── README.md
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
✅ Quick Capture task assignment  
✅ Ticket workflow (Open → In Progress → Resolved)  
✅ Leave approval workflow (Pending → Approved/Rejected)  
✅ Calendar events integration  
✅ Seed data script

### Frontend (React + Tailwind)
✅ Login page with JWT auth  
✅ Protected routes and role-based redirects  
✅ Dynamic sidebar navigation per role  
✅ Dashboards: Management, Manager, Employee, HR  
✅ KMI/KPI/KAI management pages  
✅ Task manager with Quick Capture modal  
✅ Ticket creation and status tracking  
✅ Leave application form  
✅ FullCalendar integration  
✅ Analytics dashboard with Recharts  
✅ Responsive Tailwind UI

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
- `GET /api/users/:id` – Get user by ID
- `POST /api/users` – Create user (Management/HR)
- `PUT /api/users/:id` – Update user
- `DELETE /api/users/:id` – Delete user (Management/HR)

### KMI/KPI/KAI
- `GET /api/kmi` – List KMI (Management sees all, others see own)
- `POST /api/kmi` – Create KMI (Management only)
- `PUT /api/kmi/:id` – Update KMI
- `DELETE /api/kmi/:id` – Delete KMI
- *(Same CRUD for `/api/kpi` and `/api/kai`)*

### Tasks
- `GET /api/tasks/mine` – My assigned tasks
- `GET /api/tasks/created` – Tasks I created
- `POST /api/tasks/quick-capture` – Quick Capture (assign task)
- `PUT /api/tasks/:id` – Update task
- `DELETE /api/tasks/:id` – Delete task

### Tickets
- `GET /api/tickets` – List tickets (created or assigned)
- `POST /api/tickets` – Create ticket
- `PATCH /api/tickets/:id/status` – Update ticket status

### Leaves
- `POST /api/leaves` – Apply for leave
- `GET /api/leaves/mine` – My leave requests
- `POST /api/leaves/:id/approve` – Approve leave (Manager/HR/Management)
- `POST /api/leaves/:id/reject` – Reject leave

### Calendar
- `GET /api/calendar/events` – Get calendar events (tasks + leaves)

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

### Backend (`server/`)
```bash
npm run dev        # Start dev server (nodemon)
npm start          # Production server
npm run db:create  # Create database
npm run seed       # Seed sample data
```

### Frontend (`client/`)
```bash
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

---

## 🛠️ Tech Stack

| Layer       | Technology                 |
|-------------|----------------------------|
| Frontend    | React 18 + Vite            |
| Styling     | Tailwind CSS               |
| Routing     | React Router v6            |
| State       | React Context + Hooks      |
| Charts      | Recharts                   |
| Calendar    | FullCalendar.js            |
| HTTP Client | Axios (with interceptors)  |
| Backend     | Node.js + Express          |
| ORM         | Sequelize                  |
| Database    | PostgreSQL                 |
| Auth        | JWT (access + refresh)     |
| Validation  | express-validator          |

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

## 🚦 Next Steps

1. **Production Deployment**
   - Configure PostgreSQL on production server
   - Set production environment variables
   - Build frontend: `npm run build` (in `client/`)
   - Serve backend via PM2 or Docker
   - Use Nginx/Caddy as reverse proxy

2. **Enhancements**
   - Add goal management UI
   - Implement real-time notifications (Socket.io)
   - Add file upload for tickets/tasks
   - Export analytics to PDF/Excel
   - Multi-tenant support (for multiple companies)

3. **Testing**
   - Unit tests (Jest + Supertest for backend)
   - E2E tests (Playwright/Cypress for frontend)

---

## 📧 Contact

**Project**: KLS GIT × Hyloc Hydrotechnic Pvt. Ltd.  
**Developed By**: AI Full-Stack Assistant  
**Stack**: PERN (PostgreSQL + Express + React + Node.js)

---

**Enjoy building! 🚀**
