import { useEffect, useMemo, useState } from 'react'
import { api } from '../../../lib/api'

const STATUS_OPTIONS = ['Open', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Closed']
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical']
const CATEGORY_OPTIONS = ['Machine Breakdown', 'Equipment Failure', 'System Issue', 'Safety Incident', 'Maintenance', 'Other']

export default function TicketsPage() {
  const [tickets, setTickets] = useState([])
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [viewMode, setViewMode] = useState('created') // created, assigned, responsible, all
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [assigningTicket, setAssigningTicket] = useState(null)
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    department_id: '', 
    category: 'Other',
    priority: 'Medium',
    estimated_time: ''
  })
  const [assignForm, setAssignForm] = useState({
    responsible_person: '',
    estimated_time: ''
  })
  const [statusForm, setStatusForm] = useState({
    status: '',
    resolution_notes: '',
    actual_taken_time: ''
  })
  const [error, setError] = useState('')
  const [userRole, setUserRole] = useState('')

  const loadUsers = async () => {
    try {
      const res = await api.get('/users/staff-names')
      setUsers(res.data || [])
    } catch (e) {
      console.error('Failed to load users:', e)
    }
  }

  const loadDepartments = async () => {
    try {
      const res = await api.get('/departments')
      setDepartments(res.data || [])
    } catch (e) {
      console.error('Failed to load departments:', e)
    }
  }

  const load = async () => {
    try {
      const params = new URLSearchParams()
      if (viewMode) params.append('scope', viewMode)
      if (filterStatus) params.append('status', filterStatus)
      if (filterPriority) params.append('priority', filterPriority)
      
      const res = await api.get(`/tickets?${params.toString()}`)
      setTickets(res.data)
    } catch (e) {
      setTickets([])
    }
  }

  const loadUserRole = async () => {
    try {
      const res = await api.get('/auth/me')
      setUserRole(res.data?.role || '')
    } catch (e) {
      console.error('Failed to load user role:', e)
    }
  }

  useEffect(() => { 
    load()
    loadUsers()
    loadDepartments()
    loadUserRole()
  }, [])
  
  useEffect(() => {
    load()
  }, [viewMode, filterStatus, filterPriority])

  const onClose = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setForm({ 
      title: '', 
      description: '', 
      department_id: '', 
      category: 'Other',
      priority: 'Medium',
      estimated_time: ''
    })
    setError('')
  }

  const onCloseAssign = () => {
    setIsAssignModalOpen(false)
    setAssigningTicket(null)
    setAssignForm({
      responsible_person: '',
      estimated_time: ''
    })
    setError('')
  }

  const openCreate = () => { onClose(); setIsModalOpen(true) }

  const openEdit = (ticket) => {
    setEditingId(ticket.id)
    setStatusForm({
      status: ticket.status || 'Open',
      resolution_notes: ticket.resolution_notes || '',
      actual_taken_time: ticket.actual_taken_time || ''
    })
    setIsModalOpen(true)
  }

  const openAssign = (ticket) => {
    setAssigningTicket(ticket)
    setAssignForm({
      responsible_person: ticket.responsible_person || '',
      estimated_time: ticket.estimated_time || ''
    })
    setIsAssignModalOpen(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editingId) {
        await api.patch(`/tickets/${editingId}/status`, statusForm)
      } else {
        // Send department_id and also department name for display
        const dept = departments.find(d => d.id === Number(form.department_id))
        const payload = {
          ...form,
          department: dept ? dept.dept_name : '',
        }
        await api.post('/tickets', payload)
      }
      onClose(); load()
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save')
    }
  }

  const submitAssignment = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.patch(`/tickets/${assigningTicket.id}/assign`, assignForm)
      onCloseAssign()
      load()
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to assign ticket')
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this ticket?')) return
    try { 
      await api.delete(`/tickets/${id}`); 
      load() 
    } catch (e) { 
      alert('Cannot delete ticket: ' + (e.response?.data?.message || 'Permission denied'))
    }
  }


  // Pagination state
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Filtered, sorted, and paginated data
  const filtered = useMemo(() => {
    // Sort latest first by createdAt or id desc
    const sorted = [...tickets].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (bTime !== aTime) return bTime - aTime;
      return (b.id || 0) - (a.id || 0);
    });
    const q = search.toLowerCase();
    return sorted.filter(t => (
      t.title?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.department?.toLowerCase().includes(q) ||
      t.status?.toLowerCase().includes(q)
    ));
  }, [tickets, search]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => { setPage(1); }, [search, tickets]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Resolved': return 'bg-green-100 text-green-800'
      case 'Closed': return 'bg-gray-100 text-gray-800'
      case 'In Progress': return 'bg-blue-100 text-blue-800'
      case 'Assigned': return 'bg-purple-100 text-purple-800'
      case 'Pending': return 'bg-orange-100 text-orange-800'
      case 'Open': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-300'
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Low': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'Critical': return '🔴'
      case 'High': return '🟠'
      case 'Medium': return '🟡'
      case 'Low': return '🟢'
      default: return '⚪'
    }
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-4xl font-extrabold text-gray-900">Help Desk Tickets</h1>
          <p className="text-lg text-gray-600">Report unforeseen activities and track resolution</p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setViewMode('created')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'created' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            My Tickets
          </button>
          {(userRole === 'Manager' || userRole === 'Management') && (
            <>
              <button
                onClick={() => setViewMode('assigned')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'assigned' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                Assigned to Me
              </button>
              <button
                onClick={() => setViewMode('responsible')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'responsible' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                I'm Responsible
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'all' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                All Tickets
              </button>
            </>
          )}
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <input
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
                placeholder="Search tickets..."
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Status</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Priority</option>
              {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{getPriorityIcon(p)} {p}</option>)}
            </select>

            <button onClick={openCreate} className="flex items-center justify-center px-6 py-2 font-medium text-white transition-all duration-300 rounded-lg shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
              Create Ticket
            </button>
          </div>
        </div>

        <div className="mb-10 overflow-hidden bg-white shadow-xl rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <tr>
                  <th className="px-2 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">S.No</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Title</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Category</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Department</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Assigned To</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Estimated Time</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Actual Time Taken</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Resolution Notes</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Created</th>
                  <th className="px-4 py-4 text-center text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.length === 0 ? (
                  <tr><td colSpan="12" className="px-6 py-12 text-center text-gray-500">No tickets found</td></tr>
                ) : (
                  paginated.map((t, idx) => (
                    <tr key={t.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition-colors duration-150`}>
                      <td className="px-2 py-4 whitespace-nowrap text-center">{idx + 1 + (page-1)*PAGE_SIZE}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded border ${getPriorityColor(t.priority)}`}>
                          {getPriorityIcon(t.priority)} {t.priority}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900 max-w-xs">
                        <div className="font-semibold">{t.title}</div>
                        {t.description && (
                          <div className="text-xs text-gray-500 truncate mt-1">{t.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-600">
                        {t.category || 'Other'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {(() => {
                          if (t.department) return t.department;
                          if (t.department_id && departments.length > 0) {
                            const dept = departments.find(d => d.id === t.department_id || d.id === Number(t.department_id));
                            return dept ? dept.dept_name : '-';
                          }
                          return '-';
                        })()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs">
                        {t.Owner?.fullName || [t.Owner?.staff?.first_name, t.Owner?.staff?.last_name].filter(Boolean).join(' ') ? (
                          <div className="text-gray-900 font-medium">{t.Owner.fullName || [t.Owner?.staff?.first_name, t.Owner?.staff?.last_name].filter(Boolean).join(' ')}</div>
                        ) : (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(t.status)}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-600">
                        {t.estimated_time || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-600">
                        {t.actual_taken_time || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-600 max-w-xs">
                        {t.resolution_notes ? (
                          <div className="truncate">{t.resolution_notes}</div>
                        ) : (
                          <span className="text-gray-400 italic">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500">
                        {t.created_at ? new Date(t.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center space-x-1">
                          {t.status === 'Resolved' || t.status === 'Closed' ? (
                            <span className="px-3 py-2 text-xs text-gray-500 bg-gray-100 rounded-lg border border-gray-300">
                              No actions available
                            </span>
                          ) : (
                            <>
                              {(userRole === 'Manager' || userRole === 'Management') && (
                                <button
                                  onClick={() => openAssign(t)}
                                  className="p-2 text-white transition-colors duration-200 bg-purple-600 rounded-lg hover:bg-purple-700"
                                  title="Assign Ticket"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </button>
                              )}
                              <button
                                onClick={() => openEdit(t)}
                                className="p-2 text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
                                title="Update Status"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => remove(t.id)}
                                className="p-2 text-white transition-colors duration-200 bg-red-600 rounded-lg hover:bg-red-700"
                                title="Delete Ticket"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          {/* Pagination Controls */}
          {filtered.length > PAGE_SIZE && (
            <div className="flex justify-end items-center gap-2 pb-6">
              <button
                className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </button>
              <span className="text-sm text-gray-700">
                Page {page} of {Math.ceil(filtered.length / PAGE_SIZE)}
              </span>
              <button
                className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
                onClick={() => setPage(p => Math.min(Math.ceil(filtered.length / PAGE_SIZE), p + 1))}
                disabled={page === Math.ceil(filtered.length / PAGE_SIZE)}
              >
                Next
              </button>
            </div>
          )}
          </div>
        </div>

        {/* Create/Edit Ticket Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
              <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium leading-6 text-white">{editingId ? 'Update Ticket Status' : 'Create New Ticket'}</h3>
                    <button className="text-white hover:text-gray-200" onClick={onClose}>
                      <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
                <div className="px-6 py-5 bg-white">
                  {error && <div className="mb-4 p-3 rounded border border-red-200 text-red-700 bg-red-50 text-sm">{error}</div>}
                  <form className="space-y-5" onSubmit={submit}>
                    {!editingId ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block mb-2 text-sm font-medium text-gray-700">Ticket Title *</label>
                            <input 
                              value={form.title} 
                              onChange={e=>setForm({ ...form, title: e.target.value })} 
                              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                              placeholder="e.g., Machine breakdown in production line 3" 
                              required 
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block mb-2 text-sm font-medium text-gray-700">Description *</label>
                            <textarea 
                              rows="4" 
                              value={form.description} 
                              onChange={e=>setForm({ ...form, description: e.target.value })} 
                              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                              placeholder="Provide detailed information about the unforeseen activity..." 
                              required 
                            />
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Category *</label>
                            <select 
                              value={form.category} 
                              onChange={e=>setForm({ ...form, category: e.target.value })} 
                              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              required
                            >
                              {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Priority *</label>
                            <select 
                              value={form.priority} 
                              onChange={e=>setForm({ ...form, priority: e.target.value })} 
                              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              required
                            >
                              {PRIORITY_OPTIONS.map(p => (
                                <option key={p} value={p}>{getPriorityIcon(p)} {p}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Department *</label>
                            <select 
                              value={form.department_id} 
                              onChange={e=>setForm({ ...form, department_id: e.target.value })} 
                              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              required
                            >
                              <option value="">Select Department</option>
                              {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.dept_name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Estimated Time</label>
                            <input 
                              type="text"
                              value={form.estimated_time} 
                              onChange={e=>setForm({ ...form, estimated_time: e.target.value })} 
                              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                              placeholder="e.g., 10 days, 3 hours, 1 week" 
                            />
                          </div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800">
                            <strong>Note:</strong> This ticket will be automatically assigned to your Department Head or Company Head for review and assignment to the appropriate person.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Status *</label>
                            <select 
                              value={statusForm.status} 
                              onChange={e=>setStatusForm({ ...statusForm, status: e.target.value })} 
                              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Actual Time Taken</label>
                            <input 
                              type="text"
                              value={statusForm.actual_taken_time} 
                              onChange={e=>setStatusForm({ ...statusForm, actual_taken_time: e.target.value })} 
                              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                              placeholder="e.g., 2 hours, 3 days, 1 week" 
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block mb-2 text-sm font-medium text-gray-700">Resolution Notes</label>
                            <textarea 
                              rows="4" 
                              value={statusForm.resolution_notes} 
                              onChange={e=>setStatusForm({ ...statusForm, resolution_notes: e.target.value })} 
                              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                              placeholder="Describe what was done to resolve this ticket..." 
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex justify-end space-x-4 pt-4 border-t">
                      <button type="button" onClick={onClose} className="inline-flex justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancel</button>
                      <button type="submit" className="inline-flex justify-center px-6 py-3 text-sm font-medium text-white border border-transparent rounded-lg shadow-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        {editingId ? 'Update Status' : 'Create Ticket'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assignment Modal */}
        {isAssignModalOpen && assigningTicket && (
          <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onCloseAssign} />
              <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium leading-6 text-white">Assign Ticket to Responsible Person</h3>
                    <button className="text-white hover:text-gray-200" onClick={onCloseAssign}>
                      <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
                <div className="px-6 py-5 bg-white">
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-1">{assigningTicket.title}</h4>
                    <p className="text-sm text-gray-600">{assigningTicket.description}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${getPriorityColor(assigningTicket.priority)}`}>
                        {assigningTicket.priority}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded">
                        {assigningTicket.category}
                      </span>
                    </div>
                  </div>
                  
                  {error && <div className="mb-4 p-3 rounded border border-red-200 text-red-700 bg-red-50 text-sm">{error}</div>}
                  
                  <form className="space-y-5" onSubmit={submitAssignment}>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Assign to Responsible Person *</label>
                      <select 
                        value={assignForm.responsible_person} 
                        onChange={e=>setAssignForm({ ...assignForm, responsible_person: e.target.value })} 
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      >
                        <option value="">Select Person</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.fullName || [u.staff?.first_name, u.staff?.last_name].filter(Boolean).join(' ') || u.email} {u.role ? `- ${u.role}` : ''} {u.email && !u.fullName ? '' : `(${u.email})`}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">Select the person who will be responsible for resolving this ticket</p>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Estimated Time</label>
                      <input 
                        type="text"
                        value={assignForm.estimated_time} 
                        onChange={e=>setAssignForm({ ...assignForm, estimated_time: e.target.value })} 
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
                        placeholder="e.g., 4 hours, 2 days, 1 week" 
                      />
                    </div>

                    <div className="flex justify-end space-x-4 pt-4 border-t">
                      <button type="button" onClick={onCloseAssign} className="inline-flex justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Cancel</button>
                      <button type="submit" className="inline-flex justify-center px-6 py-3 text-sm font-medium text-white border border-transparent rounded-lg shadow-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        Assign Ticket
                      </button>
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
