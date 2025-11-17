// DUPLICATE_LEAVE_CALENDAR_DISABLED: 2025-11-15 — Disabled duplicate leave management (Calendar variant)
// This view is deprecated and intentionally disabled to remove the duplicate flow.

export default function CalendarPage() {
  return null
}

/*
Original implementation was here and has been commented out to prevent the
duplicate Calendar-based leave application flow. See LeaveDuplicate.md for
the detailed diff and reasoning.

BEGIN_DISABLED_DUPLICATE
*/
/*
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
            // DUPLICATE_LEAVE_CALENDAR_DISABLED: 2025-11-15 — Disabled duplicate leave management (Calendar variant)
            // This view is deprecated and intentionally disabled to remove the duplicate flow.
            export default function CalendarPage() {
              return null
            }
            */

            /*
            Original implementation was here and has been commented out to prevent the
            duplicate Calendar-based leave application flow. See LeaveDuplicate.md for
            the detailed diff and reasoning.
            */
                  {editingLeave ? 'View / Update Leave' : 'Apply for Leave'}
