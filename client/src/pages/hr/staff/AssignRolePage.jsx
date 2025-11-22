import { useEffect, useMemo, useState } from 'react'
import { api } from '../../../lib/api'
import { getRoles } from '../../../api/roleApi'

export default function AssignRolePage() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState(null)
  const [editingUserName, setEditingUserName] = useState('')
  const [selectedRoles, setSelectedRoles] = useState([])
  const [roleStatuses, setRoleStatuses] = useState({})
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const usersRes = await api.get('/users')
      const usersData = usersRes.data || []
      
      // Fetch role assignments for each user
      const usersWithRoles = await Promise.all(
        usersData.map(async (user) => {
          try {
            const rolesRes = await api.get(`/users/${user.id}/roles`)
            return { ...user, roleAssignments: rolesRes.data || [] }
          } catch (e) {
            return { ...user, roleAssignments: [] }
          }
        })
      )
      
      setUsers(usersWithRoles)
    } catch (e) {
      setUsers([])
    }
  }

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.allSettled([
      load(),
      getRoles()
    ]).then(([_, rolesRes]) => {
      if (!active) return
      if (rolesRes.status === 'fulfilled') setRoles(rolesRes.value.data || [])
    }).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const onClose = () => {
    setIsModalOpen(false)
    setEditingUserId(null)
    setEditingUserName('')
    setSelectedRoles([])
    setRoleStatuses({})
    setError('')
  }

  const openAssignRoles = async (user) => {
    setEditingUserId(user.id)
    const fullName = [user.staff?.first_name, user.staff?.middle_name, user.staff?.last_name].filter(Boolean).join(' ')
    setEditingUserName(fullName || user.fullName || user.email || `User #${user.id}`)
    setError('')
    try {
      const res = await api.get(`/users/${user.id}/roles`)
      const r = res.data || []
      setSelectedRoles(r.map(x => x.role))
      const statuses = {}
      r.forEach(x => { statuses[x.role] = x.status || 'Inactive' })
      setRoleStatuses(statuses)
    } catch (e) {
      setSelectedRoles([])
      setRoleStatuses({})
    }
    setIsModalOpen(true)
  }

  const save = async (e) => {
    e.preventDefault()
    if (!editingUserId) return
    setError('')
    setSaving(true)
    try {
      const existingRes = await api.get(`/users/${editingUserId}/roles`)
      const existing = (existingRes.data || []).map(r => ({ name: r.role, id: r.id }))

      for (const roleName of selectedRoles) {
        const status = roleStatuses[roleName] || 'Active'
        const found = existing.find(r => r.name === roleName)
        if (found) {
          await api.put(`/users/${editingUserId}/roles/${found.id}`, { status })
        } else {
          await api.post(`/users/${editingUserId}/assign-role`, { roleName, status })
        }
      }

      const toDelete = existing.filter(r => !selectedRoles.includes(r.name))
      for (const role of toDelete) {
        await api.delete(`/users/${editingUserId}/roles/${role.id}`)
      }
      
      onClose()
      load()
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to save roles')
    } finally {
      setSaving(false)
    }
  }

  // Pagination
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  const filtered = useMemo(() => {
    const sorted = [...users].sort((a, b) => {
      const aTime = a.staff?.created_at ? new Date(a.staff.created_at).getTime() : 0
      const bTime = b.staff?.created_at ? new Date(b.staff.created_at).getTime() : 0
      if (bTime !== aTime) return bTime - aTime
      return (b.staff?.id || 0) - (a.staff?.id || 0)
    })
    const q = search.toLowerCase()
    return sorted.filter(u => {
      const fullName = [u.staff?.first_name, u.staff?.middle_name, u.staff?.last_name].filter(Boolean).join(' ').toLowerCase()
      return (
        fullName.includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.staff?.emp_id?.toLowerCase().includes(q)
      )
    })
  }, [users, search])

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  useEffect(() => { setPage(1) }, [search, users])

  const openCreate = () => {
    setEditingUserId(null)
    setEditingUserName('')
    setSelectedRoles([])
    setRoleStatuses({})
    setError('')
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-4xl font-extrabold text-gray-900">Assign Roles</h1>
          <p className="text-lg text-gray-600">Manage role assignments for staff members</p>
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
            Assign Roles
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
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Roles</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No staff found</td></tr>
                ) : (
                  paginated.map((u, idx) => (
                    <tr key={u.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition-colors duration-150`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {[u.staff?.first_name, u.staff?.middle_name, u.staff?.last_name].filter(Boolean).join(' ') || u.fullName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.email || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        {u.roleAssignments && u.roleAssignments.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {u.roleAssignments.map((ra, raIdx) => (
                              <span
                                key={raIdx}
                                className="px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap bg-indigo-100 text-indigo-800"
                              >
                                {ra.role}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">No roles</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {u.roleAssignments && u.roleAssignments.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {u.roleAssignments.map((ra, raIdx) => (
                              <span
                                key={raIdx}
                                className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                                  ra.status === 'Active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {ra.status}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">--</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openAssignRoles(u)}
                            className="p-2 text-white transition-colors duration-200 bg-indigo-600 rounded-lg hover:bg-indigo-700"
                            title="Assign Roles"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                {/* Pagination Controls */}
                {filtered.length > PAGE_SIZE && (
                  <tr>
                    <td colSpan="6">
                      <div className="flex justify-end items-center gap-2 pb-6 pr-6 pt-4">
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
                    </td>
                  </tr>
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
                    <h3 className="text-lg font-medium leading-6 text-white">Assign Roles{editingUserName ? ` — ${editingUserName}` : ''}</h3>
                    <button className="text-white hover:text-gray-200" onClick={onClose}>
                      <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
                <div className="px-6 py-5 bg-white">
                  {error && <div className="mb-4 p-3 rounded border border-red-200 text-red-700 bg-red-50 text-sm">{error}</div>}
                  <form className="space-y-5" onSubmit={save}>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Select Staff *</label>
                      <select
                        value={editingUserId || ''}
                        onChange={(e) => {
                          const userId = e.target.value
                          setEditingUserId(userId)
                          if (userId) {
                            const user = users.find(u => String(u.id) === String(userId))
                            const fullName = [user?.staff?.first_name, user?.staff?.middle_name, user?.staff?.last_name].filter(Boolean).join(' ')
                            setEditingUserName(fullName || user?.fullName || user?.email || `User #${userId}`)
                            // Load existing roles
                            api.get(`/users/${userId}/roles`).then(res => {
                              const r = res.data || []
                              setSelectedRoles(r.map(x => x.role))
                              const statuses = {}
                              r.forEach(x => { statuses[x.role] = x.status || 'Inactive' })
                              setRoleStatuses(statuses)
                            }).catch(() => {
                              setSelectedRoles([])
                              setRoleStatuses({})
                            })
                          } else {
                            setEditingUserName('')
                            setSelectedRoles([])
                            setRoleStatuses({})
                          }
                        }}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="">-- Choose Staff --</option>
                        {users.map(u => {
                          const name = [u.staff?.first_name, u.staff?.middle_name, u.staff?.last_name].filter(Boolean).join(' ') || u.email
                          return (
                            <option key={u.id} value={u.id}>{name}</option>
                          )
                        })}
                      </select>
                    </div>

                    {editingUserId && (
                      <>
                        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-80 overflow-y-auto">
                          {roles.length === 0 ? (
                            <p className="text-sm text-gray-500">No roles available</p>
                          ) : (
                            <div className="space-y-3">
                              {roles.map(r => {
                                const isSelected = selectedRoles.includes(r.name)
                                const status = roleStatuses[r.name] || 'Active'
                                return (
                                  <div key={r.id} className="flex items-center justify-between p-2 hover:bg-white rounded transition-colors">
                                    <label className="flex items-center cursor-pointer flex-1">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedRoles([...selectedRoles, r.name])
                                            setRoleStatuses({ ...roleStatuses, [r.name]: 'Active' })
                                          } else {
                                            setSelectedRoles(selectedRoles.filter(rn => rn !== r.name))
                                            const ns = { ...roleStatuses }
                                            delete ns[r.name]
                                            setRoleStatuses(ns)
                                          }
                                        }}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                      />
                                      <span className="ml-3 text-sm font-medium text-gray-700">{r.name}</span>
                                    </label>
                                    {isSelected && (
                                      <select
                                        value={status}
                                        onChange={(e) => setRoleStatuses({ ...roleStatuses, [r.name]: e.target.value })}
                                        className={`ml-4 px-3 py-1 text-xs font-medium border rounded-md focus:ring-2 focus:ring-indigo-500 ${
                                          status === 'Active' 
                                            ? 'bg-green-50 text-green-800 border-green-300' 
                                            : 'bg-gray-50 text-gray-600 border-gray-300'
                                        }`}
                                      >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                      </select>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          ✓ Select multiple roles · Set each as Active or Inactive independently
                        </p>
                        {selectedRoles.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {selectedRoles.map(rn => {
                              const status = roleStatuses[rn] || 'Active'
                              return (
                                <span key={rn} className={`px-3 py-1 text-xs font-medium rounded-full ${
                                  status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {rn} ({status})
                                </span>
                              )
                            })}
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex justify-end space-x-4 pt-4">
                      <button type="button" onClick={onClose} className="inline-flex justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancel</button>
                      <button 
                        type="submit" 
                        disabled={saving}
                        className="inline-flex justify-center px-6 py-3 text-sm font-medium text-white border border-transparent rounded-lg shadow-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save Roles'}
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
