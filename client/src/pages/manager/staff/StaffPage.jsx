import { useEffect, useMemo, useState } from 'react'
import { api } from '../../../lib/api'
import { getDepartments } from '../../../api/departmentApi'
import { getDesignations } from '../../../api/designationApi'

export default function StaffPage() {
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [filterRole, setFilterRole] = useState('')
  const [filterDept, setFilterDept] = useState('')

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
    // Fetch departments and designations for filter dropdowns
    Promise.allSettled([getDepartments(), getDesignations()])
      .then(([deptRes, desigRes]) => {
        if (deptRes.status === 'fulfilled') setDepartments(deptRes.value.data || [])
        if (desigRes.status === 'fulfilled') setDesignations(desigRes.value.data || [])
      })
      .catch(() => {})
  }, [])

  // Pagination state
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  // Filtered and sorted data
  const filtered = useMemo(() => {
    // Sort latest first using Staff.createdAt when available, else by id desc
    const sorted = [...rows].sort((a, b) => {
      const aTime = a.staff?.createdAt ? new Date(a.staff.createdAt).getTime() : 0
      const bTime = b.staff?.createdAt ? new Date(b.staff.createdAt).getTime() : 0
      if (bTime !== aTime) return bTime - aTime
      return (b.id || 0) - (a.id || 0)
    })
    const q = search.toLowerCase()
    return sorted.filter(r => {
      // Search filter
      const matchesSearch = r.name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.role?.toLowerCase().includes(q) ||
        r.staff?.department?.toLowerCase().includes(q) ||
        r.staff?.designation?.toLowerCase().includes(q) ||
        r.staff?.emp_id?.toLowerCase().includes(q) ||
        r.staff?.religion?.toLowerCase().includes(q) ||
        String(r.staff?.salary || '').toLowerCase().includes(q)
      
      // Role filter
      const matchesRole = !filterRole || r.role === filterRole
      
      // Department filter
      const matchesDept = !filterDept || 
        String(r.staff?.department_id) === filterDept ||
        r.staff?.department === filterDept ||
        r.staff?.Department?.dept_name === filterDept
      
      return matchesSearch && matchesRole && matchesDept
    })
  }, [rows, search, filterRole, filterDept])

  // Paginated data
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  // Reset to first page if search/filter changes
  useEffect(() => { setPage(1) }, [search, filterRole, filterDept, rows])

  // Get unique roles for filter
  const uniqueRoles = useMemo(() => {
    const roles = [...new Set(rows.map(r => r.role).filter(Boolean))]
    return roles.sort()
  }, [rows])

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-4xl font-extrabold text-gray-900">Staff Directory</h1>
          <p className="text-lg text-gray-600">View all staff details and information</p>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          {/* Search and Filters Row */}
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
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
            
            {/* Filter Dropdowns */}
            <div className="flex gap-3 w-full sm:w-auto">
              <select
                value={filterRole}
                onChange={(e)=>setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Roles</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              
              <select
                value={filterDept}
                onChange={(e)=>setFilterDept(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.dept_name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex gap-4 text-sm text-gray-600">
            <div className="px-4 py-2 bg-white rounded-lg shadow-sm">
              Total Staff: <span className="font-semibold text-gray-900">{filtered.length}</span>
            </div>
            <div className="px-4 py-2 bg-white rounded-lg shadow-sm">
              Showing: <span className="font-semibold text-gray-900">{paginated.length}</span> of <span className="font-semibold text-gray-900">{filtered.length}</span>
            </div>
          </div>
        </div>

        <div className="mb-10 overflow-hidden bg-white shadow-xl rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">S.NO</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Emp ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Designation</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Religion</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Salary</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.length === 0 ? (
                  <tr><td colSpan="9" className="px-6 py-12 text-center text-gray-500">No staff found</td></tr>
                ) : (
                  paginated.map((u, idx) => (
                    <tr key={u.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition-colors duration-150`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.staff?.emp_id || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.staff?.department || u.staff?.Department?.dept_name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.staff?.designation || u.staff?.Designation?.designation_name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.staff?.religion || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {u.staff?.salary ? `$${parseFloat(u.staff.salary).toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          {filtered.length > PAGE_SIZE && (
            <div className="flex justify-end items-center gap-2 px-6 pb-6">
              <button
                className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </button>
              <span className="text-sm text-gray-700">
                Page {page} of {Math.ceil(filtered.length / PAGE_SIZE)}
              </span>
              <button
                className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                onClick={() => setPage(p => Math.min(Math.ceil(filtered.length / PAGE_SIZE), p + 1))}
                disabled={page === Math.ceil(filtered.length / PAGE_SIZE)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
