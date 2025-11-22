
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

export default function HRDashboard() {
  const [staffCount, setStaffCount] = useState('-');
  const [leaveCount, setLeaveCount] = useState('-');
  const [ticketCount, setTicketCount] = useState('-');

  useEffect(() => {
    // Fetch staff
    api.get('/users').then(res => setStaffCount(res.data.length)).catch(()=>setStaffCount('-'));
    // Fetch all leaves
    api.get('/leaves/all').then(res => setLeaveCount(res.data.length)).catch(()=>setLeaveCount('-'));
    // Fetch all tickets (open only)
    api.get('/tickets?scope=all').then(res => {
      // If tickets have status, count only open
      if (Array.isArray(res.data) && res.data.length && res.data[0].status) {
        setTicketCount(res.data.filter(t=>t.status!=='Closed'&&t.status!=='Resolved').length);
      } else {
        setTicketCount(res.data.length);
      }
    }).catch(()=>setTicketCount('-'));
  }, []);

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-extrabold text-gray-900">HR Dashboard</h1>
          <p className="text-gray-600">Manage staff, leaves, and HR operations</p>
        </div>

        <div className="grid gap-6 mb-8 md:grid-cols-3">
          <div className="p-6 transition-all duration-300 transform bg-white shadow-lg rounded-xl hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-3xl font-bold text-gray-900">{staffCount}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-6 transition-all duration-300 transform bg-white shadow-lg rounded-xl hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                <p className="text-3xl font-bold text-red-600">{ticketCount}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden bg-white shadow-xl rounded-xl">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
            <h2 className="flex items-center text-lg font-medium text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Staff Management
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <a href="/staff" className="flex items-center p-4 transition-all duration-200 border border-gray-200 rounded-lg hover:shadow-md hover:border-indigo-300">
                <div className="p-2 mr-4 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Manage Staff</p>
                  <p className="text-sm text-gray-600">View and manage all staff members</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
