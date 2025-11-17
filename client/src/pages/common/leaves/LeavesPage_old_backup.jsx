import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyLeaves, applyLeave } from '../../../store/slices/leavesSlice'
import { fetchStaffNames } from '../../../store/slices/usersSlice'
import { leavesService } from '../../../api/leavesApi'
import { api } from '../../../lib/api'
import { useAuth } from '../../../auth/AuthContext'
import LeaveStatistics from '../../../components/common/LeaveStatistics'

export default function LeavesPage() {
  const dispatch = useDispatch()
  const { user } = useAuth()
  const { leaves, loading } = useSelector((state) => state.leaves)
  const { staffNames: staff } = useSelector((state) => state.users)
  
  const [form, setForm] = useState({
    from_date: new Date().toISOString().split('T')[0],
    to_date: '',
    leave_duration: 'Full Day',
    alternate_person: '',
    additional_alternate: '',
    leave_reason: '',
    available_on_phone: true
  })
  const [noOfDays, setNoOfDays] = useState(0)
  const [departmentStaff, setDepartmentStaff] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [leaveBalance, setLeaveBalance] = useState(null)
  const [loadingBalance, setLoadingBalance] = useState(true)

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
      // Handle new many-to-many relationship
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

  // Calculate number of days based on duration and dates
  useEffect(() => {
    if (form.leave_duration === 'Full Day') {
      if (form.from_date && form.to_date) {
        const from = new Date(form.from_date)
        const to = new Date(form.to_date)
        const diff = (to - from) / (1000 * 60 * 60 * 24) + 1
        setNoOfDays(diff > 0 ? diff : 0)
      } else {
        setNoOfDays(0)
      }
    } else {
      // Morning Half or Afternoon Half
      setNoOfDays(0.5)
      // Auto-set to_date to same as from_date for half-day
      if (form.from_date && form.to_date !== form.from_date) {
        setForm(prev => ({ ...prev, to_date: prev.from_date }))
      }
    }
  }, [form.from_date, form.to_date, form.leave_duration])

  // Handle leave duration change
  const handleDurationChange = (duration) => {
    setForm(prev => ({
      ...prev,
      leave_duration: duration,
      to_date: duration === 'Full Day' ? prev.to_date : prev.from_date
    }))
  }

  const apply = async (e) => {
    e.preventDefault()
    
    // Check if user has sufficient leave balance
    const creditedDays = noOfDays
    const currentBalance = leaveBalance?.leave_balance || 0
    
    let leaveType = 'Paid'
    if (currentBalance < creditedDays) {
      const confirmUnpaid = window.confirm(
        `No leaves to avail. You have only ${currentBalance} day(s) remaining. Do you still want to avail a leave? (It would be 'Unpaid')`
      )
      if (!confirmUnpaid) {
        return // User cancelled
      }
      leaveType = 'Unpaid'
    }
    
    const leaveData = {
      ...form,
      credited_days: creditedDays,
      leave_type: leaveType
    }
    
    await dispatch(applyLeave(leaveData)).unwrap()
    setForm({
      from_date: new Date().toISOString().split('T')[0],
      to_date: '',
      leave_duration: 'Full Day',
      alternate_person: '',
      additional_alternate: '',
      leave_reason: '',
      available_on_phone: true
    })
    setNoOfDays(0)
    
    // Refresh leave balance after applying
    const response = await leavesService.getLeaveBalance()
    setLeaveBalance(response.data)
  }

  const filteredLeaves = leaves.filter(leave => 
    leave.from_date?.includes(searchTerm) || 
    leave.to_date?.includes(searchTerm) ||
    leave.alternate_person?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-extrabold text-gray-900">Leave Management</h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            Apply for leave and track your leave requests
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

        {/* Apply for Leave Form */}
        <div className="mb-10 overflow-hidden bg-white shadow-xl rounded-xl">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
            <h2 className="flex items-center text-lg font-medium text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Apply for Leave
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={apply} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Leave Duration</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <select
                      required
                      className="block w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={form.leave_duration}
                      onChange={e => handleDurationChange(e.target.value)}
                    >
                      <option value="Full Day">Full Day</option>
                      <option value="Morning Half">Morning Half</option>
                      <option value="Afternoon Half">Afternoon Half</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">From Date</label>
                  <input
                    required
                    type="date"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={form.from_date}
                    onChange={e=>setForm({...form, from_date:e.target.value})}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">To Date</label>
                  <input
                    required
                    type="date"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={form.to_date}
                    onChange={e=>setForm({...form, to_date:e.target.value})}
                    disabled={form.leave_duration !== 'Full Day'}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">No. of Days</label>
                  <input
                    type="number"
                    step="0.5"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    value={noOfDays}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Leave Reason</label>
                  <input
                    required
                    type="text"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={form.leave_reason}
                    onChange={e=>setForm({...form, leave_reason:e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Alternate Person (Department Only)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <select
                    className="block w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={form.alternate_person}
                    onChange={e=>setForm({...form, alternate_person:e.target.value})}
                  >
                    <option value="">-- Select alternate person --</option>
                    {departmentStaff.map(s => (
                      <option key={s.id} value={s.name}>
                        {s.name} {s.designation ? `(${s.designation})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Additional Alternate (All Staff)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <select
                    className="block w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={form.additional_alternate}
                    onChange={e=>setForm({...form, additional_alternate:e.target.value})}
                  >
                    <option value="">-- Select additional alternate --</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.name}>
                        {s.name} {s.designation ? `(${s.designation})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <label className="block mb-3 text-sm font-medium text-gray-700">
                  Available on Phone
                </label>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <input 
                      id="phone_yes"
                      type="radio" 
                      name="available_on_phone"
                      checked={form.available_on_phone === true} 
                      onChange={() => setForm({...form, available_on_phone: true})} 
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="phone_yes" className="ml-2 text-sm font-medium text-gray-700">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      id="phone_no"
                      type="radio" 
                      name="available_on_phone"
                      checked={form.available_on_phone === false} 
                      onChange={() => setForm({...form, available_on_phone: false})} 
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="phone_no" className="ml-2 text-sm font-medium text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button 
                  type="submit"
                  className="inline-flex items-center px-6 py-3 text-sm font-medium text-white transition-all duration-300 transform border border-transparent rounded-lg shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:-translate-y-0.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Apply for Leave
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search leaves..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Leave Requests List */}
        <div className="overflow-hidden bg-white shadow-xl rounded-xl">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
            <h2 className="flex items-center text-lg font-medium text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              My Leave Requests
            </h2>
          </div>
          <div className="p-6">
            {filteredLeaves.length === 0 ? (
              <div className="py-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mb-1 text-lg font-medium text-gray-900">No leave requests found</h3>
                <p className="text-gray-500">{searchTerm ? "No leaves match your search" : "You haven't applied for any leaves yet"}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLeaves.map(l => (
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
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Alternate: <span className="ml-1 font-medium">{l.alternate_person || 'N/A'}</span>
                          </div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {l.available_on_phone ? 'Available on phone' : 'Not available'}
                          </div>
                        </div>
                      </div>
                      <span className={`px-4 py-2 text-xs font-semibold rounded-full border ${getStatusColor(l.status)}`}>
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
