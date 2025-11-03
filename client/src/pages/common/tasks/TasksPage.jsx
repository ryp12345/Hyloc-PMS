import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyTasks, quickCaptureTask } from '../../../store/slices/tasksSlice'
import { fetchStaffNames } from '../../../store/slices/usersSlice'
import { useAuth } from '../../../auth/AuthContext'

export default function TasksPage() {
  const dispatch = useDispatch()
  const { user } = useAuth()
  const { tasks, loading } = useSelector((state) => state.tasks)
  const { staffNames: users } = useSelector((state) => state.users)
  
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', assigned_to: '', due_date: '', priority: 'Medium' })
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (user) {
      dispatch(fetchMyTasks())
      dispatch(fetchStaffNames())
    }
  }, [dispatch, user])

  const quickCapture = async (e) => {
    e.preventDefault()
    await dispatch(quickCaptureTask(form)).unwrap()
    setForm({ title: '', description: '', assigned_to: '', due_date: '', priority: 'Medium' })
    setShowModal(false)
  }

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-800'
      case 'In Progress': return 'bg-blue-100 text-blue-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-extrabold text-gray-900">Task Management</h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            Organize and track your tasks efficiently
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center w-full px-6 py-3 font-medium text-white transition-all duration-300 transform rounded-lg shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-1 hover:scale-105 sm:w-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Quick Capture
          </button>
        </div>

        {/* Tasks Grid */}
        <div className="grid gap-6 mb-10 md:grid-cols-2">
          {filteredTasks.length === 0 ? (
            <div className="col-span-2 py-12 text-center bg-white shadow-xl rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3 className="mb-1 text-lg font-medium text-gray-900">No tasks found</h3>
              <p className="text-gray-500">{searchTerm ? "No tasks match your search" : "Get started by creating your first task"}</p>
            </div>
          ) : (
            filteredTasks.map(t => (
              <div key={t.id} className="overflow-hidden transition-all duration-300 transform bg-white shadow-lg rounded-xl hover:-translate-y-1 hover:shadow-xl">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{t.title}</h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(t.priority)}`}>
                      {t.priority}
                    </span>
                  </div>
                  <p className="mb-4 text-sm text-gray-600">{t.description || 'No description'}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {t.due_date || 'No due date'}
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(t.status)}`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Capture Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" aria-hidden="true" onClick={() => setShowModal(false)}></div>
              <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium leading-6 text-white" id="modal-title">Quick Capture Task</h3>
                    <button type="button" className="text-white hover:text-gray-200 focus:outline-none" onClick={() => setShowModal(false)}>
                      <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="px-6 py-5 bg-white">
                  <form onSubmit={quickCapture} className="space-y-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Task Title</label>
                      <input required className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" placeholder="Enter task title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Description</label>
                      <textarea rows="3" className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" placeholder="Task details..." value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Assign To</label>
                      <select required className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" value={form.assigned_to} onChange={e=>setForm({...form, assigned_to:e.target.value})}>
                        <option value="">-- Select User --</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}{u.designation ? ` (${u.designation})` : ''}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Due Date</label>
                      <input type="date" className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" value={form.due_date} onChange={e=>setForm({...form, due_date:e.target.value})} />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Priority</label>
                      <select className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" value={form.priority} onChange={e=>setForm({...form, priority:e.target.value})}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div className="flex justify-end pt-4 space-x-4">
                      <button type="button" onClick={() => setShowModal(false)} className="inline-flex justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancel</button>
                      <button type="submit" className="inline-flex justify-center px-6 py-3 text-sm font-medium text-white border border-transparent rounded-lg shadow-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Assign Task</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
