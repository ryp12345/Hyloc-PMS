import { useState } from 'react'
import { leavesService } from '../../api/leavesApi'

export default function PendingLeaveCard({ leave, onApprovalChange }) {
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this leave?')) return

    try {
      setIsProcessing(true)
      await leavesService.approveLeave(leave.id)
      alert('Leave approved successfully')
      if (onApprovalChange) onApprovalChange()
    } catch (error) {
      console.error('Failed to approve leave:', error)
      alert('Failed to approve leave: ' + (error.response?.data?.message || error.message))
    } finally {
      setIsProcessing(false)
    }
  }

  const openRejectModal = () => {
    setRejectionReason('')
    setShowRejectModal(true)
  }

  const handleReject = async () => {
    try {
      setIsProcessing(true)
      await leavesService.rejectLeave(leave.id, {})
      alert('Leave rejected successfully')
      setShowRejectModal(false)
      if (onApprovalChange) onApprovalChange()
    } catch (error) {
      console.error('Failed to reject leave:', error)
      alert('Failed to reject leave: ' + (error.response?.data?.message || error.message))
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300 bg-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Employee Info */}
            <div className="mb-3">
              <div className="flex items-center mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="text-base font-semibold text-gray-900">
                  {leave.User?.name || 'Unknown'}
                </h3>
              </div>
              <div className="ml-6 text-xs text-gray-600">
                <span className="mr-3">
                  <span className="font-medium">ID:</span> {leave.User?.Staff?.emp_id || 'N/A'}
                </span>
                {leave.User?.Staff?.Departments?.[0] && (
                  <span>
                    <span className="font-medium">Dept:</span> {leave.User.Staff.Departments[0].dept_name}
                  </span>
                )}
              </div>
            </div>

            {/* Leave Details Grid */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-xs font-medium text-blue-900">From</p>
                <p className="text-xs font-semibold text-blue-700">{formatDate(leave.from_date)}</p>
              </div>
              <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-xs font-medium text-blue-900">To</p>
                <p className="text-xs font-semibold text-blue-700">{formatDate(leave.to_date)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="p-2 bg-purple-50 border border-purple-200 rounded">
                <p className="text-xs font-medium text-purple-900">Duration</p>
                <p className="text-xs font-semibold text-purple-700">{leave.leave_duration}</p>
              </div>
              <div className="p-2 bg-green-50 border border-green-200 rounded">
                <p className="text-xs font-medium text-green-900">Days</p>
                <p className="text-xs font-semibold text-green-700">{leave.credited_days}</p>
              </div>
            </div>

            {/* Leave Type Badge */}
            <div className="mb-2">
              <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                leave.leave_type === 'Paid' 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-orange-100 text-orange-800 border border-orange-300'
              }`}>
                {leave.leave_type} Leave
              </span>
            </div>

            {/* Leave Reason */}
            <div className="p-2 mb-2 bg-gray-50 border border-gray-200 rounded">
              <p className="text-xs font-medium text-gray-700 mb-1">Reason</p>
              <p className="text-xs text-gray-900">{leave.leave_reason || 'No reason provided'}</p>
            </div>

            {/* Applied Date */}
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Applied: {formatDate(leave.created_at)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col ml-3 space-y-2">
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Approve
            </button>
            <button
              onClick={openRejectModal}
              disabled={isProcessing}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Reject
            </button>
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
                Are you sure you want to reject this leave request from <strong>{leave.User?.name}</strong>?
              </p>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows="3"
                placeholder="Enter rejection reason (optional)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <div className="flex justify-end mt-4 space-x-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  disabled={isProcessing}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
