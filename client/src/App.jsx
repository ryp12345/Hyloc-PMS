import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import DashboardLayout from './components/layout/DashboardLayout'
import ManagementDashboard from './pages/management/dashboards/ManagementDashboard'
import ManagerDashboard from './pages/manager/dashboards/ManagerDashboard'
import EmployeeDashboard from './pages/employee/dashboards/EmployeeDashboard'
import HRDashboard from './pages/hr/dashboards/HRDashboard'
import KMIPage from './pages/management/kmi/KMIPage'
import KPIPage from './pages/manager/kpi/KPIPage'
import KAIPage from './pages/employee/kai/KAIPage'
import TasksPage from './pages/common/tasks/TasksPage'
import TicketsPage from './pages/common/tickets/TicketsPage'
import LeavesPage from './pages/hr/leaves/LeavesPage'
import LeaveApprovalPage from './pages/manager/leaves/LeaveApprovalPage'
import CalendarPage from './pages/common/calendar/CalendarPage'
import AnalyticsPage from './pages/manager/analytics/AnalyticsPage'
import { AuthProvider, useAuth } from './auth/AuthContext'
import StaffPage from './pages/hr/staff/StaffPage'
import DepartmentsPage from './pages/hr/departments/DepartmentsPage'
import DesignationsPage from './pages/hr/designations/DesignationsPage'
import AssociationsPage from './pages/hr/associations/AssociationsPage'

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<HomeRedirect />} />
          <Route path="dashboard/management" element={<ProtectedRoute roles={['Management']}><ManagementDashboard /></ProtectedRoute>} />
          <Route path="dashboard/manager" element={<ProtectedRoute roles={['Manager','Management']}><ManagerDashboard /></ProtectedRoute>} />
          <Route path="dashboard/employee" element={<ProtectedRoute roles={['Employee','Manager','Management']}><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="dashboard/hr" element={<ProtectedRoute roles={['HR','Management']}><HRDashboard /></ProtectedRoute>} />

          <Route path="kmi" element={<ProtectedRoute roles={['Management']}><KMIPage /></ProtectedRoute>} />
          <Route path="kpi" element={<ProtectedRoute roles={['Manager','Management']}><KPIPage /></ProtectedRoute>} />
          <Route path="kai" element={<ProtectedRoute roles={['Employee','Manager','Management']}><KAIPage /></ProtectedRoute>} />
          <Route path="tasks" element={<ProtectedRoute roles={['Employee','Manager','Management','HR']}><TasksPage /></ProtectedRoute>} />
          <Route path="tickets" element={<ProtectedRoute roles={['Employee','Manager','Management','HR']}><TicketsPage /></ProtectedRoute>} />
          <Route path="leaves" element={<ProtectedRoute roles={['Employee','Manager','Management','HR']}><LeavesPage /></ProtectedRoute>} />
          <Route path="leave-approval" element={<ProtectedRoute roles={['Manager','Management','HR']}><LeaveApprovalPage /></ProtectedRoute>} />
          <Route path="calendar" element={<ProtectedRoute roles={['Employee','Manager','Management','HR']}><CalendarPage /></ProtectedRoute>} />
          <Route path="analytics" element={<ProtectedRoute roles={['Manager','Management']}><AnalyticsPage /></ProtectedRoute>} />
          <Route path="staff" element={<ProtectedRoute roles={['HR','Management']}><StaffPage /></ProtectedRoute>} />
          <Route path="departments" element={<ProtectedRoute roles={['HR','Management']}><DepartmentsPage /></ProtectedRoute>} />
          <Route path="designations" element={<ProtectedRoute roles={['HR','Management']}><DesignationsPage /></ProtectedRoute>} />
          <Route path="associations" element={<ProtectedRoute roles={['HR','Management']}><AssociationsPage /></ProtectedRoute>} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

function HomeRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  switch (user.role) {
    case 'Management': return <Navigate to="/dashboard/management" />
    case 'Manager': return <Navigate to="/dashboard/manager" />
    case 'HR': return <Navigate to="/dashboard/hr" />
    default: return <Navigate to="/dashboard/employee" />
  }
}
