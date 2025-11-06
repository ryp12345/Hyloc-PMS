# Pages Folder Structure

This folder is organized by user roles to make navigation and maintenance easier.

## Folder Organization

### 📁 auth/
Authentication related pages
- `LoginPage.jsx` - User login page

### 📁 common/
Pages accessible by all authenticated users
- **calendar/** - Calendar management
  - `CalendarPage.jsx`
- **tasks/** - Task management
  - `TasksPage.jsx`
- **tickets/** - Ticket management
  - `TicketsPage.jsx`

### 📁 employee/
Pages accessible by Employee role (and higher)
- **dashboards/**
  - `EmployeeDashboard.jsx` - Employee dashboard
- **kai/** - Key Activity Indicators
  - `KAIPage.jsx`

### 📁 manager/
Pages accessible by Manager role (and Management)
- **dashboards/**
  - `ManagerDashboard.jsx` - Manager dashboard
- **kpi/** - Key Performance Indicators
  - `KPIPage.jsx`
- **leaves/** - Leave approval
  - `LeaveApprovalPage.jsx`
- **staff/** - Staff management
  - `StaffPage.jsx`

### 📁 hr/
Pages accessible by HR role (and Management)
- **associations/** - Company associations
  - `AssociationsPage.jsx`
- **dashboards/**
  - `HRDashboard.jsx` - HR dashboard
- **departments/** - Department management
  - `DepartmentsPage.jsx`
- **designations/** - Designation management
  - `DesignationsPage.jsx`
- **leaves/** - Leave management
  - `LeavesPage.jsx`
- **staff/** - Staff management
  - `StaffPage.jsx`

### 📁 management/
Pages accessible by Management role only
- **analytics/** - Analytics and reports
  - `AnalyticsPage.jsx`
- **dashboards/**
  - `ManagementDashboard.jsx` - Management dashboard
- **kmi/** - Key Milestone Indicators
  - `KMIPage.jsx`

## Role Hierarchy

```
Management (Full Access)
    ├── Manager
    │   └── Employee
    └── HR
```

## Adding New Pages

When adding a new page, place it in the appropriate role folder:
1. Determine which role(s) should access the page
2. Create the page in the corresponding folder
3. Update `App.jsx` with the new route and import
4. Add role restrictions using `ProtectedRoute` component

## Import Path Examples

```javascript
// Auth
import LoginPage from './pages/auth/LoginPage'

// Common
import TasksPage from './pages/common/tasks/TasksPage'

// Employee
import EmployeeDashboard from './pages/employee/dashboards/EmployeeDashboard'

// Manager
import KPIPage from './pages/manager/kpi/KPIPage'

// HR
import StaffPage from './pages/hr/staff/StaffPage'

// Management
import KMIPage from './pages/management/kmi/KMIPage'
```
