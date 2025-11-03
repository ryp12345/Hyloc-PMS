import KpiCards from '../../../widgets/KpiCards'

export default function EmployeeDashboard() {
  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-extrabold text-gray-900">Employee Dashboard</h1>
          <p className="text-gray-600">Track your key action items and performance</p>
        </div>

        <KpiCards />

        <div className="grid gap-6 mt-8 md:grid-cols-2">
          <div className="overflow-hidden bg-white shadow-xl rounded-xl">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
              <h2 className="flex items-center text-lg font-medium text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Quick Actions
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <a href="/kai" className="flex items-center p-4 transition-all duration-200 border border-gray-200 rounded-lg hover:shadow-md hover:border-indigo-300">
                  <div className="p-2 mr-4 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Manage KAI</p>
                    <p className="text-sm text-gray-600">View and update your action items</p>
                  </div>
                </a>
                <a href="/tasks" className="flex items-center p-4 transition-all duration-200 border border-gray-200 rounded-lg hover:shadow-md hover:border-indigo-300">
                  <div className="p-2 mr-4 bg-blue-500 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">View Tasks</p>
                    <p className="text-sm text-gray-600">Check your assigned tasks</p>
                  </div>
                </a>
                <a href="/leaves" className="flex items-center p-4 transition-all duration-200 border border-gray-200 rounded-lg hover:shadow-md hover:border-indigo-300">
                  <div className="p-2 mr-4 bg-green-500 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Apply for Leave</p>
                    <p className="text-sm text-gray-600">Submit leave requests</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div className="overflow-hidden bg-white shadow-xl rounded-xl">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
              <h2 className="flex items-center text-lg font-medium text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Activity
              </h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600">Your recent activities will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
