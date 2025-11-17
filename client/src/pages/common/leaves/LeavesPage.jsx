import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyLeaves, applyLeave } from '../../../store/slices/leavesSlice'
import { fetchStaffNames } from '../../../store/slices/usersSlice'
import { leavesService } from '../../../api/leavesApi'
import { api } from '../../../lib/api'
import { useAuth } from '../../../auth/AuthContext'
import LeaveStatistics from '../../../components/common/LeaveStatistics'
import LeaveCalendar from '../../../components/common/LeaveCalendar'

export default function LeavesPage() {
  const dispatch = useDispatch()
  const { user } = useAuth()
  const { leaves, loading } = useSelector((state) => state.leaves)
  const { staffNames: staff } = useSelector((state) => state.users)
  const canApply = user?.role !== 'Management'
  
  const [departmentStaff, setDepartmentStaff] = useState([])
  const [leaveBalance, setLeaveBalance] = useState(null)
  const [loadingBalance, setLoadingBalance] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [yearLeaves, setYearLeaves] = useState([])
  const [loadingYearLeaves, setLoadingYearLeaves] = useState(false)

  useEffect(() => {
    if (user) {
      dispatch(fetchMyLeaves())
      dispatch(fetchStaffNames())
      
      // Fetch leave balance
      const fetchLeaveBalance = async () => {
        try {
          setLoadingBalance(true)
          const response = await leavesService.getLeaveBalance()
          setLeaveBalance(response.data)
        } catch (error) {
          console.error('Failed to fetch leave balance:', error)
        } finally {
          setLoadingBalance(false)
        }
      }
      fetchLeaveBalance()
      
      // Fetch department staff for alternate dropdown
      console.log('User data:', user)
      const departmentId = user.staff?.Departments?.[0]?.id || user.staff?.Department?.id || user.staff?.department_id;
      if (departmentId) {
        console.log('Fetching staff for department:', departmentId)
        api.get(`/users/staff-by-department?department_id=${departmentId}`)
          .then(res => {
            console.log('Department staff loaded:', res.data)
            setDepartmentStaff(res.data)
          })
          .catch(err => {
            console.error('Failed to load department staff:', err)
            setDepartmentStaff([])
          })
      } else {
        console.log('No department_id found in user.staff')
      }
    }
  }, [dispatch, user])

  // Handle month navigation
  const handleMonthChange = (direction) => {
    const newMonth = new Date(currentMonth)
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1)
    } else if (direction === 'next') {
      newMonth.setMonth(newMonth.getMonth() + 1)
    } else if (direction === 'today') {
      setCurrentMonth(new Date())
      return
    }
    setCurrentMonth(newMonth)
  }

  // Load leaves for the visible year to keep calendar accurate and light
  useEffect(() => {
    if (!user) return
    const year = currentMonth.getFullYear()
    const fetchYear = async () => {
      try {
        setLoadingYearLeaves(true)
        const { data } = await leavesService.getUserLeaveHistory(user.id, year)
        setYearLeaves(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error('Failed to fetch year leaves:', e)
        setYearLeaves([])
      } finally {
        setLoadingYearLeaves(false)
      }
    }
    fetchYear()
  }, [user, currentMonth])

  // Handle leave application submission
  const handleLeaveSubmit = async (leaveData) => {
    try {
      await dispatch(applyLeave(leaveData)).unwrap()
      
      // Refresh leave balance
      const response = await leavesService.getLeaveBalance()
      setLeaveBalance(response.data)
      
      // Refresh leaves to update calendar
      dispatch(fetchMyLeaves())

      // Also refresh current year's leaves for the calendar
      if (user) {
        const year = currentMonth.getFullYear()
        const { data } = await leavesService.getUserLeaveHistory(user.id, year)
        setYearLeaves(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error submitting leave:', error)
      throw error // Re-throw so the calendar component can catch it
    }
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-extrabold text-gray-900">Leave Management</h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            View your leave calendar and apply for leave
          </p>
        </div>

        {/* Leave Statistics */}
        {loadingBalance ? (
          <div className="flex items-center justify-center mb-8">
            <div className="w-8 h-8 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading leave statistics...</span>
          </div>
        ) : (
          <LeaveStatistics balance={leaveBalance} />
        )}

        {/* Current Month and Year Label with Month View Info */}
        <div className="flex items-center justify-between p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center px-3 py-1 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Month View
            </div>
            <span className="text-sm text-gray-600">
              {canApply ? 'Click on any day to apply for leave' : 'View leave calendar and history'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Year: <span className="font-semibold text-gray-900">{currentMonth.getFullYear()}</span>
          </div>
        </div>

        {/* Calendar */}
        <div className="mb-8">
          <LeaveCalendar
            leaves={yearLeaves}
            currentMonth={currentMonth}
            onMonthChange={handleMonthChange}
            departmentStaff={departmentStaff}
            allStaff={staff}
            leaveBalance={leaveBalance}
            onLeaveSubmit={handleLeaveSubmit}
            joinDate={user?.staff?.date_of_joining}
            canApply={canApply}
          />
        </div>

        {/* Leave History Section */}
        <div className="mt-8 overflow-hidden bg-white shadow-xl rounded-xl">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
            <h2 className="flex items-center text-lg font-medium text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Leave History ({yearLeaves.length} total)
            </h2>
          </div>
          <div className="p-6">
            {loadingYearLeaves ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                <span className="ml-3 text-gray-600">Loading year history...</span>
              </div>
            ) : yearLeaves.length === 0 ? (
              <div className="py-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mb-1 text-lg font-medium text-gray-900">No leave requests found</h3>
                <p className="text-gray-500">{canApply ? 'Click on a calendar day to apply for leave' : 'No leaves recorded yet'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {yearLeaves.slice(0, 10).map(l => (
                  <div key={l.id} className="p-5 transition-all duration-300 border border-gray-200 rounded-lg hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-lg font-semibold text-gray-900">
                            {l.from_date} to {l.to_date}
                          </span>
                          <span className="ml-3 text-sm text-gray-600">
                            ({l.credited_days} {l.credited_days === 1 ? 'day' : 'days'} - {l.leave_duration})
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          {l.leave_reason && (
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                              </svg>
                              Reason: <span className="ml-1 font-medium">{l.leave_reason}</span>
                            </div>
                          )}
                          {l.alternate_person && (
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Alternate: <span className="ml-1 font-medium">{l.alternate_person}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {l.available_on_phone ? 'Available on phone' : 'Not available'}
                          </div>
                          <div className="flex items-center">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${l.leave_type === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                              {l.leave_type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-4 py-2 text-xs font-semibold rounded-full border ${
                        l.status === 'Approved' ? 'bg-green-100 text-green-800 border-green-200' :
                        l.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {l.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
