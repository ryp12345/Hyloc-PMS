import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

import logo from '../../assets/hyloc.png'


const navByRole = {
  Management: [
    { to: '/dashboard/management', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { to: '/kmi', label: 'KMI', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { 
      label: 'Goals', 
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      submenu: [
        { to: '/management/goals', label: 'All Goals' },
        { to: '/management/goals/milestones', label: 'Milestones' }
      ]
    },
    { to: '/manager/staff', label: 'Staff', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { to: '/calendar', label: 'Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { to: '/tickets', label: 'Help Tickets', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { to: '/analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { to: '/leave-approval', label: 'Leave Approval', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  ],
  Manager: [
    { to: '/dashboard/manager', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { to: '/kpi', label: 'KPI', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { to: '/manager/staff', label: 'Staff', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { to: '/calendar', label: 'Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { to: '/tickets', label: 'Help Tickets', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  ],
  Employee: [
    { to: '/dashboard/employee', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { to: '/kai', label: 'KAI', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { to: '/calendar', label: 'Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { to: '/tickets', label: 'Help Tickets', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  ],
  HR: [
    { to: '/dashboard/hr', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { to: '/staff', label: 'Staff Mgmt', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { to: '/departments', label: 'Departments', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
    { to: '/designations', label: 'Designations', icon: 'M5 13l4 4L19 7' },
    { to: '/associations', label: 'Associations', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { to: '/leave-approval', label: 'Leave Approval', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  ],
}

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const nav = navByRole[user?.role] || []
  const [openSubmenu, setOpenSubmenu] = useState(null)

  return (
    <div className="min-h-screen h-screen grid grid-cols-[260px_1fr] bg-gray-50 overflow-hidden">
      <aside className="bg-white border-r border-gray-200 shadow-sm overflow-y-auto">
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 flex flex-col items-center">
          <img src={logo} alt="Hyloc-GIT" className="h-16 w-auto object-contain mb-2" />
          <p className="text-xs text-indigo-100 text-center">Management System</p>
        </div>
        <nav className="px-3 py-4 space-y-1">
          {nav.map((i, idx) => (
            i.submenu ? (
              <div key={idx}>
                <button 
                  onClick={() => setOpenSubmenu(openSubmenu === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={i.icon} />
                    </svg>
                    {i.label}
                  </div>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`w-4 h-4 transition-transform ${openSubmenu === idx ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openSubmenu === idx && (
                  <div className="ml-8 mt-1 space-y-1">
                    {i.submenu.map(subItem => (
                      <Link
                        key={subItem.to}
                        to={subItem.to}
                        className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          location.pathname === subItem.to
                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                        }`}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link 
                key={i.to} 
                to={i.to} 
                className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  location.pathname===i.to
                    ?'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-medium shadow-sm'
                    :'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={i.icon} />
                </svg>
                {i.label}
              </Link>
            )
          ))}
          <Link 
            to="/tasks" 
            className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
              location.pathname==='/tasks'
                ?'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-medium shadow-sm'
                :'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Tasks
          </Link>
          {/* <Link 
            to="/leaves" 
            className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
              location.pathname==='/leaves'
                ?'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-medium shadow-sm'
                :'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Leaves
          </Link> */}
        </nav>
      </aside>
      <main className="flex flex-col h-screen overflow-hidden">
        <div className="px-8 py-4 bg-white border-b border-gray-200 shadow-sm flex-shrink-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Welcome back, {user?.name}</h2>
              <p className="text-xs text-gray-600 mt-0.5"></p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="ml-2 text-left">
                  <p className="text-sm font-medium text-gray-900 leading-tight">{user?.name}</p>
                  <p className="text-xs text-gray-500 leading-tight">{user?.role}</p>
                </div>
              </div>
              <button 
                onClick={logout} 
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-all duration-300 transform bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </div>
      </main>
    </div>
  )
}