import { useEffect, useState } from 'react'
import { leavesService } from '../../../api/leavesApi'

export default function LeaveApprovalsPage() {
  const [pendingLeaves, setPendingLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchPendingLeaves()
  }, [])

  const fetchPendingLeaves = async () => {
    try {
      setLoading(true)
      const response = await leavesService.getPendingLeaves()
      setPendingLeaves(response.data)
    } catch (error) {
      console.error('Failed to fetch pending leaves:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (leaveId) => {
    if (!window.confirm('Are you sure you want to approve this leave?')) return

    try {
      await leavesService.approveLeave(leaveId)
      alert('Leave approved successfully')
      fetchPendingLeaves() // Refresh the list
    } catch (error) {
      console.error('Failed to approve leave:', error)
      alert('Failed to approve leave: ' + (error.response?.data?.message || error.message))
    }
  }

  const openRejectModal = (leave) => {
    setSelectedLeave(leave)
    setRejectionReason('')
    setShowRejectModal(true)
  }

  const handleReject = async () => {
    if (!selectedLeave) return

    try {
      // Backend no longer accepts/stores rejection_reason; send empty payload
      await leavesService.rejectLeave(selectedLeave.id, {})
      alert('Leave rejected successfully')
      setShowRejectModal(false)
      setSelectedLeave(null)
      fetchPendingLeaves() // Refresh the list
    } catch (error) {
      console.error('Failed to reject leave:', error)
      alert('Failed to reject leave: ' + (error.response?.data?.message || error.message))
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-extrabold text-gray-900">Leave Approvals</h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            Review and approve pending leave requests
          </p>
        </div>

        {/* Pending Count Badge */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center px-4 py-2 bg-indigo-100 border border-indigo-300 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-indigo-900">
              {pendingLeaves.length} Pending {pendingLeaves.length === 1 ? 'Request' : 'Requests'}
            </span>
          </div>
        </div>

        {/* Pending Leaves List */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
            <h2 className="flex items-center text-lg font-medium text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Pending Leave Requests
            </h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                <span className="ml-3 text-gray-600">Loading pending requests...</span>
              </div>
            ) : pendingLeaves.length === 0 ? (
              <div className="py-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mb-1 text-lg font-medium text-gray-900">All caught up!</h3>
                <p className="text-gray-500">No pending leave requests at this time</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingLeaves.map(leave => (
                  <div key={leave.id} className="p-5 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Employee Info */}
                        <div className="mb-3">
                          <div className="flex items-center mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {leave.User?.fullName || [leave.User?.staff?.first_name, leave.User?.staff?.middle_name, leave.User?.staff?.last_name].filter(Boolean).join(' ') || 'Unknown'}
                            </h3>
                            {/* Role Badge */}
                            <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded ${
                              leave.User?.role_id === 1 ? 'bg-purple-100 text-purple-800' :
                              leave.User?.role_id === 2 ? 'bg-blue-100 text-blue-800' :
                              leave.User?.role_id === 3 ? 'bg-green-100 text-green-800' :
                              leave.User?.role_id === 4 ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {leave.User?.role_id === 1 ? 'Management' :
                               leave.User?.role_id === 2 ? 'Manager' :
                               leave.User?.role_id === 3 ? 'Employee' :
                               leave.User?.role_id === 4 ? 'HR' : 'Unknown'}
                            </span>
                          </div>
                          <div className="ml-7 text-sm text-gray-600">
                            <span className="mr-4">
                              <span className="font-medium">Emp ID:</span> {leave.User?.Staff?.emp_id || 'N/A'}
                            </span>
                            <span className="mr-4">
                              <span className="font-medium">Email:</span> {leave.User?.email || 'N/A'}
                            </span>
                            {leave.User?.Staff?.Departments?.[0] && (
                              <span>
                                <span className="font-medium">Dept:</span> {leave.User.Staff.Departments[0].dept_name}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Leave Details Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-3 md:grid-cols-4">
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs font-medium text-blue-900 uppercase">From Date</p>
                            <p className="text-sm font-semibold text-blue-700">{formatDate(leave.from_date)}</p>
                          </div>
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs font-medium text-blue-900 uppercase">To Date</p>
                            <p className="text-sm font-semibold text-blue-700">{formatDate(leave.to_date)}</p>
                          </div>
                          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                            <p className="text-xs font-medium text-purple-900 uppercase">Duration</p>
                            <p className="text-sm font-semibold text-purple-700">{leave.leave_duration}</p>
                          </div>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-xs font-medium text-green-900 uppercase">Days</p>
                            <p className="text-sm font-semibold text-green-700">{leave.credited_days}</p>
                          </div>
                        </div>

                        {/* Leave Type Badge */}
                        <div className="mb-3">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                            leave.leave_type === 'Paid' 
                              ? 'bg-green-100 text-green-800 border border-green-300' 
                              : 'bg-orange-100 text-orange-800 border border-orange-300'
                          }`}>
                            {leave.leave_type} Leave
                          </span>
                        </div>

                        {/* Leave Reason */}
                        <div className="p-3 mb-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-xs font-medium text-gray-700 uppercase mb-1">Reason</p>
                          <p className="text-sm text-gray-900">{leave.leave_reason || 'No reason provided'}</p>
                        </div>

                        {/* Additional Details */}
                        {(leave.alternate_person || leave.additional_alternate || leave.available_on_phone !== null) && (
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-3 text-sm">
                            {leave.alternate_person && (
                              <div>
                                <span className="font-medium text-gray-700">Alternate:</span>
                                <span className="ml-1 text-gray-600">{leave.alternate_person}</span>
                              </div>
                            )}
                            {leave.additional_alternate && (
                              <div>
                                <span className="font-medium text-gray-700">Additional Alt:</span>
                                <span className="ml-1 text-gray-600">{leave.additional_alternate}</span>
                              </div>
                            )}
                            {leave.available_on_phone !== null && (
                              <div>
                                <span className="font-medium text-gray-700">Available on Phone:</span>
                                <span className={`ml-1 ${leave.available_on_phone ? 'text-green-600' : 'text-red-600'}`}>
                                  {leave.available_on_phone ? 'Yes' : 'No'}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col ml-4 space-y-2">
                        <button
                          onClick={() => handleApprove(leave.id)}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(leave)}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Reject
                        </button>
                      </div>
                    </div>

                    {/* Applied Date */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Applied on: {formatDate(leave.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl">
            <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-red-700">
              <h3 className="text-lg font-medium text-white">Reject Leave Request</h3>
            </div>
            <div className="p-6">
              <p className="mb-4 text-sm text-gray-600">
                Please provide a reason for rejecting this leave request:
              </p>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows="4"
                placeholder="Enter rejection reason (optional)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <div className="flex justify-end mt-4 space-x-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false)
                    setSelectedLeave(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
