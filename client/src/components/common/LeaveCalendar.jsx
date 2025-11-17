import React, { useState, useEffect } from 'react'

export default function LeaveCalendar({ 
  leaves = [], 
  currentMonth, 
  onMonthChange,
  departmentStaff = [],
  allStaff = [],
  leaveBalance,
  onLeaveSubmit,
  joinDate,
  canApply = true
}) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDayDetail, setShowDayDetail] = useState(false)
  const [dayLeaves, setDayLeaves] = useState([])
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

  // Update from_date when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setForm(prev => ({ ...prev, from_date: selectedDate, to_date: '' }))
    }
  }, [selectedDate])

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

  // Handle modal submit
  const handleModalSubmit = async (e) => {
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
    
    try {
      await onLeaveSubmit(leaveData)
      
      // Show success message
      alert('Leave application submitted successfully! It is now pending approval.')
      
      // Reset form and close modal
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
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to submit leave application:', error)
      const errorMessage = error?.message || error?.response?.data?.message || error || 'Unknown error occurred'
      alert('Failed to submit leave application: ' + errorMessage)
    }
  }

  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  // Navigation boundaries
  const monthStart = new Date(year, month, 1)
  const today = new Date()
  const todayMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const maxFutureMonthStart = new Date(todayMonthStart)
  maxFutureMonthStart.setMonth(maxFutureMonthStart.getMonth() + 12)
  let minPastMonthStart = null
  if (joinDate) {
    const jd = new Date(joinDate)
    if (!isNaN(jd)) {
      minPastMonthStart = new Date(jd.getFullYear(), jd.getMonth(), 1)
    }
  }
  const canGoPrev = minPastMonthStart ? monthStart > minPastMonthStart : true
  const canGoNext = monthStart < maxFutureMonthStart

  // Create array of days
  const days = []
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  // Check if a day has a leave
  const getLeaveForDay = (day) => {
    if (!day) return null
    
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    return leaves.find(leave => {
      const fromDate = new Date(leave.from_date)
      const toDate = new Date(leave.to_date)
      const checkDate = new Date(dateStr)
      
      return checkDate >= fromDate && checkDate <= toDate
    })
  }

  // Get leave status color
  const getLeaveColor = (leave) => {
    if (!leave) return ''
    
    switch(leave.status) {
      case 'Approved':
        return 'bg-green-100 border-green-400 text-green-800'
      case 'Pending':
        return 'bg-yellow-100 border-yellow-400 text-yellow-800'
      case 'Rejected':
        return 'bg-red-100 border-red-400 text-red-800'
      default:
        return 'bg-gray-100 border-gray-400 text-gray-800'
    }
  }

  // Check if day is today
  const isToday = (day) => {
    if (!day) return false
    const today = new Date()
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear()
  }

  // Handle day click
  const handleDayClick = (day) => {
    if (!day) return
    
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    // Check if this day has any leaves
    const leavesOnDay = leaves.filter(leave => {
      const fromDate = new Date(leave.from_date)
      const toDate = new Date(leave.to_date)
      const checkDate = new Date(dateStr)
      return checkDate >= fromDate && checkDate <= toDate
    })
    
    if (leavesOnDay.length > 0) {
      // Show day detail popup
      setDayLeaves(leavesOnDay)
      setSelectedDate(dateStr)
      setShowDayDetail(true)
    } else {
      // Open apply modal only if allowed
      if (!canApply) return
      setSelectedDate(dateStr)
      setIsModalOpen(true)
    }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Calendar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {monthNames[month]} {year}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => canGoPrev && onMonthChange('prev')}
              className={`p-2 transition-colors rounded-lg ${canGoPrev ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' : 'text-gray-300 cursor-not-allowed'}`}
              title={canGoPrev ? 'Previous Month' : 'Reached join month'}
              disabled={!canGoPrev}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => onMonthChange('today')}
              className="px-3 py-1 text-sm font-medium text-white transition-colors rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              Today
            </button>
            <button
              onClick={() => canGoNext && onMonthChange('next')}
              className={`p-2 transition-colors rounded-lg ${canGoNext ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' : 'text-gray-300 cursor-not-allowed'}`}
              title={canGoNext ? 'Next Month' : 'Max 12 months ahead'}
              disabled={!canGoNext}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day names */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-xs font-semibold text-center text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const leave = getLeaveForDay(day)
            const todayClass = isToday(day) ? 'ring-2 ring-blue-500' : ''

            // Determine past vs future for styling
            let temporalClass = ''
            if (day) {
              const cellDate = new Date(year, month, day)
              const todayStart = new Date()
              todayStart.setHours(0,0,0,0)
              if (cellDate < todayStart) {
                temporalClass = 'opacity-80'
              } else if (cellDate > todayStart) {
                temporalClass = 'ring-1 ring-indigo-200'
              }
            }

            const leaveClass = leave ? getLeaveColor(leave) : 'bg-white hover:bg-gray-50'
            
            return (
              <div
                key={index}
                onClick={() => handleDayClick(day)}
                className={`
                  relative min-h-[60px] p-2 border rounded-lg cursor-pointer transition-all
                  ${day ? leaveClass : 'bg-gray-50 cursor-default'}
                  ${todayClass}
                  ${day ? temporalClass : ''}
                  ${!leave && day ? 'border-gray-200 hover:border-indigo-300 hover:shadow-sm' : ''}
                `}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium ${isToday(day) ? 'text-blue-600' : 'text-gray-700'}`}>
                      {day}
                    </div>
                    {leave && (
                      <div className="flex items-center justify-center mt-1">
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                          leave.leave_duration === 'Full Day' ? 'bg-indigo-600 text-white' : 
                          leave.leave_duration === 'Morning Half' ? 'bg-amber-500 text-white' : 
                          'bg-purple-500 text-white'
                        }`}>
                          {leave.leave_duration === 'Full Day' ? 'FULL' : 
                           leave.leave_duration === 'Morning Half' ? 'AM' : 'PM'}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 border-2 border-blue-500 rounded"></div>
            <span className="text-gray-600">Today</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 bg-green-100 border border-green-400 rounded"></div>
            <span className="text-gray-600">Approved</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 bg-yellow-100 border border-yellow-400 rounded"></div>
            <span className="text-gray-600">Pending</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 bg-red-100 border border-red-400 rounded"></div>
            <span className="text-gray-600">Rejected</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 bg-gray-200 border border-gray-300 rounded opacity-80"></div>
            <span className="text-gray-600">Past Day</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 bg-white border border-indigo-200 rounded ring-1 ring-indigo-200"></div>
            <span className="text-gray-600">Upcoming Day</span>
          </div>
        </div>
      </div>

      {/* Day Detail Popup - Shows leaves for a specific day */}
      {showDayDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-lg overflow-hidden bg-white shadow-2xl rounded-xl">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center text-lg font-medium text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Leaves on {selectedDate}
                </h2>
                <button
                  onClick={() => setShowDayDetail(false)}
                  className="text-white transition-colors hover:text-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="space-y-3">
                {dayLeaves.map((lv, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${
                          lv.leave_duration === 'Full Day' ? 'bg-indigo-600 text-white' : 
                          lv.leave_duration === 'Morning Half' ? 'bg-amber-500 text-white' : 
                          'bg-purple-500 text-white'
                        }`}>
                          {lv.leave_duration === 'Full Day' ? 'FULL DAY' : 
                           lv.leave_duration === 'Morning Half' ? 'MORNING' : 'AFTERNOON'}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          lv.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          lv.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {lv.status}
                        </span>
                      </div>
                      <span className="text-xs text-gray-600">{lv.credited_days} {lv.credited_days === 1 ? 'day' : 'days'}</span>
                    </div>
                    
                    <p className="mb-2 text-sm text-gray-700">
                      <span className="font-medium">Reason:</span> {lv.leave_reason}
                    </p>
                    
                    {lv.alternate_person && (
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Alternate:</span> {lv.alternate_person}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Type:</span> {lv.leave_type}
                      {lv.available_on_phone && ' • Available on phone'}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => setShowDayDetail(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {canApply && (
                  <button
                    onClick={() => {
                      setShowDayDetail(false)
                      setIsModalOpen(true)
                    }}
                    className="px-4 py-2 text-sm font-medium text-white transition-colors border border-transparent rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    Apply New Leave
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-2xl overflow-hidden bg-white shadow-2xl rounded-xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center text-lg font-medium text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Apply for Leave
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white transition-colors hover:text-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={handleModalSubmit} className="space-y-5">
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
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  
                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-700">Leave Reason</label>
                    <input
                      required
                      type="text"
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={form.leave_reason}
                      onChange={e=>setForm({...form, leave_reason:e.target.value})}
                      placeholder="Enter reason for leave"
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
                      {allStaff.map(s => (
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
                
                {/* Modal Footer - Buttons */}
                <div className="flex justify-end pt-4 space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="inline-flex items-center px-6 py-3 text-sm font-medium text-white transition-all duration-300 transform border border-transparent rounded-lg shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
        </div>
      )}
    </div>
  )
}
