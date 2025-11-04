import KpiCards from '../../../widgets/KpiCards'

export default function ManagementDashboard() {
  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-extrabold text-gray-900">Management Dashboard</h1>
          <p className="text-gray-600">Strategic overview and organizational insights</p>
        </div>

        <KpiCards />

        <div className="grid gap-6 mt-8 md:grid-cols-3">
          <div className="overflow-hidden bg-white shadow-xl rounded-xl">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
              <h2 className="flex items-center text-lg font-medium text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Access
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <a href="/kmi" className="flex items-center p-3 transition-all duration-200 border border-gray-200 rounded-lg hover:shadow-md hover:border-indigo-300">
                  <div className="p-2 mr-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">KMI</p>
                    <p className="text-xs text-gray-600">Manage milestones</p>
                  </div>
                </a>
                <a href="/manager/staff" className="flex items-center p-3 transition-all duration-200 border border-gray-200 rounded-lg hover:shadow-md hover:border-indigo-300">
                  <div className="p-2 mr-3 bg-blue-500 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Staff</p>
                    <p className="text-xs text-gray-600">View team</p>
                  </div>
                </a>
                <a href="/analytics" className="flex items-center p-3 transition-all duration-200 border border-gray-200 rounded-lg hover:shadow-md hover:border-indigo-300">
                  <div className="p-2 mr-3 bg-green-500 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Analytics</p>
                    <p className="text-xs text-gray-600">View insights</p>
                  </div>
                </a>
                <a href="/tasks" className="flex items-center p-3 transition-all duration-200 border border-gray-200 rounded-lg hover:shadow-md hover:border-indigo-300">
                  <div className="p-2 mr-3 bg-orange-500 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Tasks</p>
                    <p className="text-xs text-gray-600">Manage tasks</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div className="overflow-hidden bg-white shadow-xl rounded-xl md:col-span-2">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
              <h2 className="flex items-center text-lg font-medium text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                KMI Overview & Approvals
              </h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600">Strategic milestones and pending approvals will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
