import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { api } from '../../../lib/api'
import { useAuth } from '../../../auth/AuthContext'

export default function CalendarPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [leaves, setLeaves] = useState([])
  const [tasks, setTasks] = useState([])
  const [staff, setStaff] = useState([])
  const [departmentStaff, setDepartmentStaff] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [editingLeave, setEditingLeave] = useState(null)
  const [form, setForm] = useState({ 
    from_date: '', 
    to_date: '', 
    alternate_person: '', 
    additional_alternate: '',
    leave_reason: '',
    available_on_phone: true 
  })
  const [noOfDays, setNoOfDays] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    console.log('User data:', user)
    // Handle new many-to-many relationship
    const departmentId = user?.staff?.Departments?.[0]?.id || user?.staff?.Department?.id || user?.staff?.department_id;
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
  }, [user])

  // Calculate number of days
  useEffect(() => {
    if (form.from_date && form.to_date) {
      const from = new Date(form.from_date)
      const to = new Date(form.to_date)
      const diff = (to - from) / (1000 * 60 * 60 * 24) + 1
      setNoOfDays(diff > 0 ? diff : 0)
    } else {
      setNoOfDays(0)
    }
  }, [form.from_date, form.to_date])

  const load = async () => {
    try {
      const [calRes, leavesRes, staffRes, tasksRes] = await Promise.all([
        api.get('/calendar/events').catch(() => ({ data: [] })),
        api.get('/leaves/mine').catch(() => ({ data: [] })),
        api.get('/users/staff-names').catch(() => ({ data: [] })),
        api.get('/tasks/mine').catch(() => ({ data: [] }))
      ])
      
      // Store raw leaves and tasks data for later lookup
      setLeaves(leavesRes.data)
      setTasks(tasksRes.data)
      
      // Combine calendar events and leaves
      const leaveEvents = leavesRes.data.map(leave => ({
        id: `leave-${leave.id}`,
        title: `Leave - ${leave.status}`,
        start: leave.from_date,
        end: leave.to_date,
        backgroundColor: leave.status === 'Approved' ? '#10b981' : leave.status === 'Pending' ? '#f59e0b' : '#ef4444',
        borderColor: leave.status === 'Approved' ? '#059669' : leave.status === 'Pending' ? '#d97706' : '#dc2626',
        extendedProps: {
          type: 'leave',
          leaveId: leave.id,
          status: leave.status,
          alternate: leave.alternate_person
        }
      }))
      
      // Add task events
      const taskEvents = tasksRes.data.map(task => ({
        id: `task-${task.id}`,
        title: `Task: ${task.title}`,
        start: task.due_date,
        backgroundColor: task.status === 'Completed' ? '#10b981' : task.status === 'In Progress' ? '#3b82f6' : '#6366f1',
        borderColor: task.status === 'Completed' ? '#059669' : task.status === 'In Progress' ? '#2563eb' : '#4f46e5',
        extendedProps: {
          type: 'task',
          taskId: task.id,
          status: task.status,
          priority: task.priority,
          description: task.description
        }
      }))
      
      setEvents([...calRes.data, ...leaveEvents, ...taskEvents])
      setStaff(staffRes.data)
    } catch {}
  }

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event
    const eventType = event.extendedProps.type
    
    if (eventType === 'task') {
      // Show task details
      const taskId = event.extendedProps.taskId
      const task = tasks.find(t => t.id === taskId)
      if (task) {
        setSelectedTask(task)
        setIsTaskModalOpen(true)
      }
    } else if (eventType === 'leave') {
      // Show leave details
      const leaveId = event.extendedProps.leaveId
      const leave = leaves.find(l => l.id === leaveId)
      if (leave) {
        setEditingLeave(leave)
        setForm({
          from_date: leave.from_date,
          to_date: leave.to_date,
          alternate_person: leave.alternate_person || '',
          additional_alternate: leave.additional_alternate || '',
          leave_reason: leave.leave_reason || '',
          available_on_phone: leave.available_on_phone
        })
        setIsModalOpen(true)
      }
    }
  }

  const handleDateClick = (info) => {
    const clickedDate = info.dateStr
    
    // Check if there's an existing leave on this date
    const existingLeave = leaves.find(leave => 
      clickedDate >= leave.from_date && clickedDate <= leave.to_date
    )
    
    if (existingLeave) {
      // Load existing leave for editing
      setEditingLeave(existingLeave)
      setForm({
        from_date: existingLeave.from_date,
        to_date: existingLeave.to_date,
        alternate_person: existingLeave.alternate_person || '',
        additional_alternate: existingLeave.additional_alternate || '',
        leave_reason: existingLeave.leave_reason || '',
        available_on_phone: existingLeave.available_on_phone
      })
    } else {
      // New leave application
      setEditingLeave(null)
      setForm({ 
        from_date: clickedDate, 
        to_date: clickedDate, 
        alternate_person: '', 
        additional_alternate: '',
        leave_reason: '',
        available_on_phone: true 
      })
    }
    
    setError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingLeave(null)
    setForm({ 
      from_date: '', 
      to_date: '', 
      alternate_person: '', 
      additional_alternate: '',
      leave_reason: '',
      available_on_phone: true 
    })
    setNoOfDays(0)
    setError('')
  }

  const submitLeave = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editingLeave) {
        // Update existing leave
        await api.put(`/leaves/${editingLeave.id}`, form)
      } else {
        // Create new leave
        await api.post('/leaves', form)
      }
      closeModal()
      load() // Reload data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save leave')
    }
  }

  const deleteLeave = async () => {
    if (!editingLeave) return
    // eslint-disable-next-line no-alert
    if (!confirm('Are you sure you want to delete this leave application?')) return
    
    try {
      await api.delete(`/leaves/${editingLeave.id}`)
      closeModal()
      load() // Reload data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete leave')
    }
  }

  return (
    <>
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-extrabold text-gray-900">Calendar</h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            Click on any date to apply for leave
          </p>
        </div>

        <div className="overflow-hidden bg-white shadow-xl rounded-xl">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
            <h2 className="flex items-center text-lg font-medium text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Event Calendar
            </h2>
          </div>
          <div className="p-6">
            <FullCalendar 
              plugins={[dayGridPlugin, interactionPlugin]} 
              initialView="dayGridMonth" 
              events={events}
              height="auto"
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek'
              }}
              eventContent={(eventInfo) => (
                <div className="px-1 py-0.5 text-xs font-medium truncate cursor-pointer">
                  {eventInfo.event.title}
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>

    {isModalOpen && (
      <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={closeModal} />
          <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium leading-6 text-white">
                  {editingLeave ? 'View / Update Leave' : 'Apply for Leave'}
                </h3>
                <button className="text-white hover:text-gray-200" onClick={closeModal}>
                  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-5 bg-white">
              {editingLeave && (
                <div className={`mb-4 p-3 rounded border ${
                  editingLeave.status === 'Approved' ? 'border-green-200 bg-green-50 text-green-700' :
                  editingLeave.status === 'Pending' ? 'border-yellow-200 bg-yellow-50 text-yellow-700' :
                  'border-red-200 bg-red-50 text-red-700'
                } text-sm flex items-center justify-between`}>
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Status: <strong className="ml-1">{editingLeave.status}</strong>
                  </span>
                  {editingLeave.status === 'Pending' && (
                    <span className="text-xs">(You can update pending leaves)</span>
                  )}
                </div>
              )}
              {error && <div className="mb-4 p-3 rounded border border-red-200 text-red-700 bg-red-50 text-sm">{error}</div>}
              <form className="space-y-5" onSubmit={submitLeave}>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">No. of Days</label>
                    <input
                      type="number"
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
                <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <input 
                    id="available_on_phone"
                    type="checkbox" 
                    checked={form.available_on_phone} 
                    onChange={e=>setForm({...form, available_on_phone:e.target.checked})} 
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="available_on_phone" className="ml-3 text-sm font-medium text-gray-700">
                    I will be available on phone during this period
                  </label>
                </div>
                <div className="flex justify-between pt-4">
                  <div>
                    {editingLeave && editingLeave.status === 'Pending' && (
                      <button 
                        type="button" 
                        onClick={deleteLeave} 
                        className="inline-flex justify-center px-6 py-3 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete Leave
                      </button>
                    )}
                  </div>
                  <div className="flex space-x-4">
                    <button type="button" onClick={closeModal} className="inline-flex justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancel</button>
                    {(!editingLeave || editingLeave.status === 'Pending') && (
                      <button type="submit" className="inline-flex justify-center px-6 py-3 text-sm font-medium text-white border border-transparent rounded-lg shadow-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        {editingLeave ? 'Update Leave' : 'Apply for Leave'}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Task Details Modal */}
    {isTaskModalOpen && selectedTask && (
      <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setIsTaskModalOpen(false)} />
          <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium leading-6 text-white">
                  Task Details
                </h3>
                <button className="text-white hover:text-gray-200" onClick={() => setIsTaskModalOpen(false)}>
                  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-5 bg-white">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">{selectedTask.title}</h4>
                  {selectedTask.description && (
                    <p className="text-gray-600">{selectedTask.description}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      selectedTask.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      selectedTask.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedTask.status}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      selectedTask.priority === 'High' ? 'bg-red-100 text-red-800' :
                      selectedTask.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedTask.priority}
                    </span>
                  </div>
                  
                  {selectedTask.due_date && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                      <div className="flex items-center text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {selectedTask.due_date}
                      </div>
                    </div>
                  )}
                  
                  {selectedTask.Assignee && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                      <div className="flex items-center text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {selectedTask.Assignee.name}
                      </div>
                    </div>
                  )}
                  
                  {selectedTask.Assigner && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assigned By</label>
                      <div className="flex items-center text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {selectedTask.Assigner.name}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsTaskModalOpen(false)} 
                    className="inline-flex justify-center px-6 py-3 text-sm font-medium text-white border border-transparent rounded-lg shadow-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
