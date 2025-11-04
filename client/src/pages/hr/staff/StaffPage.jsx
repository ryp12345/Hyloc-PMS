import { useEffect, useMemo, useState } from 'react'
import { api } from '../../../lib/api'
import { getDepartments } from '../../../api/departmentApi'
import { getDesignations } from '../../../api/designationApi'

const ROLE_OPTIONS = ['Management','Manager','HR','Employee']

export default function StaffPage() {
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [form, setForm] = useState({
    name: '',
    email: '',
    roleName: 'Employee',
    password: '',
    staff: { emp_id: '', designation: '', department: '', designation_id: '', department_id: '', religion: '', salary: '' }
  })
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const res = await api.get('/users')
      setRows(res.data)
    } catch (e) {
      setRows([])
    }
  }
  useEffect(() => {
    load()
    // Fetch departments and designations for dropdowns
    Promise.allSettled([getDepartments(), getDesignations()])
      .then(([deptRes, desigRes]) => {
        if (deptRes.status === 'fulfilled') setDepartments(deptRes.value.data || [])
        if (desigRes.status === 'fulfilled') setDesignations(desigRes.value.data || [])
      })
      .catch(() => {})
  }, [])

  const onClose = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setForm({ name: '', email: '', roleName: 'Employee', password: '', staff: { emp_id: '', designation: '', department: '', designation_id: '', department_id: '', religion: '', salary: '' } })
    setError('')
  }

  const openCreate = () => { onClose(); setIsModalOpen(true) }

  const openEdit = (row) => {
    setEditingId(row.id)
    setForm({
      name: row.name || '',
      email: row.email || '',
      roleName: row.role || 'Employee',
      password: '',
      staff: {
        emp_id: row.staff?.emp_id || '',
        designation: row.staff?.designation || row.staff?.Designation?.designation_name || '',
        department: row.staff?.department || row.staff?.Department?.dept_name || '',
        designation_id: row.staff?.designation_id || row.staff?.Designation?.id || '',
        department_id: row.staff?.department_id || row.staff?.Department?.id || '',
        religion: row.staff?.religion || '',
        salary: row.staff?.salary || ''
      }
    })
    setIsModalOpen(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = { ...form }
      // Ensure we also send the readable names matching selected ids for backwards compatibility
      if (payload.staff?.department_id) {
        const d = departments.find(x => String(x.id) === String(payload.staff.department_id))
        if (d) payload.staff.department = d.dept_name
      }
      if (payload.staff?.designation_id) {
        const d = designations.find(x => String(x.id) === String(payload.staff.designation_id))
        if (d) payload.staff.designation = d.designation_name
      }

      if (editingId) {
        await api.put(`/users/${editingId}`, payload)
      } else {
        if (!payload.password) payload.password = 'password123'
        await api.post('/users', payload)
      }
      onClose(); load()
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save')
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this staff user?')) return
    try { await api.delete(`/users/${id}`); load() } catch (e) { /* ignore */ }
  }


  // Pagination state
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Filtered and sorted data
  const filtered = useMemo(() => {
    // Sort latest first using Staff.createdAt when available, else by id desc
    const sorted = [...rows].sort((a, b) => {
      const aTime = a.staff?.createdAt ? new Date(a.staff.createdAt).getTime() : 0;
      const bTime = b.staff?.createdAt ? new Date(b.staff.createdAt).getTime() : 0;
      if (bTime !== aTime) return bTime - aTime;
      return (b.id || 0) - (a.id || 0);
    });
    const q = search.toLowerCase();
    return sorted.filter(r => (
      r.name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.role?.toLowerCase().includes(q) ||
      r.staff?.department?.toLowerCase().includes(q) ||
      r.staff?.designation?.toLowerCase().includes(q) ||
      r.staff?.religion?.toLowerCase().includes(q) ||
      String(r.staff?.salary || '').toLowerCase().includes(q)
    ));
  }, [rows, search]);

  // Paginated data
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  // Reset to first page if search/filter changes
  useEffect(() => { setPage(1); }, [search, rows]);

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-4xl font-extrabold text-gray-900">Staff Management</h1>
          <p className="text-lg text-gray-600">Create, update and manage staff records</p>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <input
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              placeholder="Search staff..."
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button onClick={openCreate} className="flex items-center justify-center w-full px-6 py-3 font-medium text-white transition-all duration-300 transform rounded-lg shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-1 hover:scale-105 sm:w-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            Add Staff
          </button>
        </div>

        <div className="mb-10 overflow-hidden bg-white shadow-xl rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">S.NO</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Emp ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Designation</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Religion</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Salary</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.length === 0 ? (
                  <tr><td colSpan="10" className="px-6 py-12 text-center text-gray-500">No staff found</td></tr>
                ) : (
                  paginated.map((u, idx) => (
                    <tr key={u.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition-colors duration-150`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm"><span className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">{u.role}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.staff?.emp_id || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.staff?.department || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.staff?.designation || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.staff?.religion || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.staff?.salary || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openEdit(u)}
                            className="p-2 text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
                            title="Edit Staff"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => remove(u.id)}
                            className="p-2 text-white transition-colors duration-200 bg-red-600 rounded-lg hover:bg-red-700"
                            title="Delete Staff"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
              <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium leading-6 text-white">{editingId ? 'Edit Staff' : 'Add Staff'}</h3>
                    <button className="text-white hover:text-gray-200" onClick={onClose}>
                      <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
                <div className="px-6 py-5 bg-white">
                  {error && <div className="mb-4 p-3 rounded border border-red-200 text-red-700 bg-red-50 text-sm">{error}</div>}
                  <form className="space-y-5" onSubmit={submit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Full Name</label>
                        <input value={form.name} onChange={e=>setForm({ ...form, name: e.target.value })} className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Enter Your Name" required />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
                        <input type="email" value={form.email} onChange={e=>setForm({ ...form, email: e.target.value })} className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Enter Email Address" required />
                      </div>
                      {!editingId && (
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
                          <input type="text" value={form.password} onChange={e=>setForm({ ...form, password: e.target.value })} className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="password123 (default if empty)" />
                        </div>
                      )}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Role</label>
                        <select value={form.roleName} onChange={e=>setForm({ ...form, roleName: e.target.value })} className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                          {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <h4 className="mb-3 text-sm font-semibold text-gray-800">Staff Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Employee ID</label>
                          <input required value={form.staff.emp_id} onChange={e=>setForm({ ...form, staff: { ...form.staff, emp_id: e.target.value } })} className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="EMP001" />
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Department</label>
                          <select
                            value={form.staff.department_id}
                            onChange={e=>setForm({ ...form, staff: { ...form.staff, department_id: e.target.value } })}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">Select Department</option>
                            {departments.map(d => (
                              <option key={d.id} value={d.id}>{d.dept_name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Designation</label>
                          <select
                            value={form.staff.designation_id}
                            onChange={e=>setForm({ ...form, staff: { ...form.staff, designation_id: e.target.value } })}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">Select Designation</option>
                            {designations.map(d => (
                              <option key={d.id} value={d.id}>{d.designation_name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Religion</label>
                          <input value={form.staff.religion} onChange={e=>setForm({ ...form, staff: { ...form.staff, religion: e.target.value } })} className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="-" />
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Salary</label>
                          <input type="number" step="0.01" value={form.staff.salary} onChange={e=>setForm({ ...form, staff: { ...form.staff, salary: e.target.value } })} className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Enter Salary Amount" />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                      <button type="button" onClick={onClose} className="inline-flex justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancel</button>
                      <button type="submit" className="inline-flex justify-center px-6 py-3 text-sm font-medium text-white border border-transparent rounded-lg shadow-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">{editingId? 'Update Staff':'Create Staff'}</button>
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
