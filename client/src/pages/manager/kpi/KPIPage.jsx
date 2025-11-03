import { useEffect, useMemo, useState } from 'react'
import { api } from '../../../lib/api'

export default function KPIPage() {
  const [rows, setRows] = useState([])
  const [kmis, setKmis] = useState([])
  const [form, setForm] = useState({ kmi_id: '', description: '', start_date: '', end_date: '', status: 'Pending', notes: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({ id: null, kmi_id: '', description: '', start_date: '', end_date: '', status: 'Pending', notes: '' })
  const [error, setError] = useState('')

  const load = async () => {
    const [kpi, kmi] = await Promise.all([api.get('/kpi'), api.get('/kmi')])
    setRows(kpi.data)
    setKmis(kmi.data)
  }
  useEffect(() => { load() }, [])

  const create = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/kpi', { ...form, kmi_id: parseInt(form.kmi_id) })
      setForm({ kmi_id: '', description: '', start_date: '', end_date: '', status: 'Pending', notes: '' })
      load()
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create KPI')
    }
  }

  const filteredRows = useMemo(() => rows.filter(row => 
    row.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [rows, searchTerm])

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const openEdit = (row) => {
    setError('')
    setEditForm({
      id: row.id,
      kmi_id: row.kmi_id || '',
      description: row.description || '',
      start_date: row.start_date || '',
      end_date: row.end_date || '',
      status: row.status || 'Pending',
      notes: row.notes || ''
    })
    setIsEditOpen(true)
  }

  const closeEdit = () => {
    setIsEditOpen(false)
    setEditForm({ id: null, kmi_id: '', description: '', start_date: '', end_date: '', status: 'Pending', notes: '' })
  }

  const update = async (e) => {
    e.preventDefault()
    if (!editForm.id) return
    setError('')
    try {
      await api.put(`/kpi/${editForm.id}`, { ...editForm, kmi_id: parseInt(editForm.kmi_id) })
      closeEdit()
      load()
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update KPI')
    }
  }

  const remove = async (id) => {
    // eslint-disable-next-line no-alert
    if (!confirm('Delete this KPI?')) return
    try { await api.delete(`/kpi/${id}`); load() } catch (e) { /* ignore */ }
  }

  return (
    <>
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-extrabold text-gray-900">KPI Management</h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            Key Performance Indicators - Track your performance metrics
          </p>
        </div>

        <div className="mb-10 overflow-hidden bg-white shadow-xl rounded-xl">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
            <h2 className="flex items-center text-lg font-medium text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Create New KPI
            </h2>
          </div>
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 rounded border border-red-200 text-red-700 bg-red-50 text-sm">{error}</div>
            )}
            <form onSubmit={create} className="space-y-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Select KMI</label>
                <select className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={form.kmi_id} onChange={e=>setForm({...form, kmi_id:e.target.value})}>
                  <option value="">-- Select KMI --</option>
                  {kmis.map(k => <option key={k.id} value={k.id}>{k.description}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Description</label>
                <input className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="KPI description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Start Date</label>
                  <input type="date" className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={form.start_date} onChange={e=>setForm({...form, start_date:e.target.value})} />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">End Date</label>
                  <input type="date" className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={form.end_date} onChange={e=>setForm({...form, end_date:e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Status</label>
                <select className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={form.status} onChange={e=>setForm({...form, status:e.target.value})}>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Notes</label>
                <textarea rows="3" className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Additional notes..." value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} />
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className="inline-flex items-center px-6 py-3 text-sm font-medium text-white transition-all duration-300 transform border border-transparent rounded-lg shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:-translate-y-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  Save KPI
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative w-full sm:w-64">
            <input type="text" placeholder="Search KPIs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="overflow-hidden bg-white shadow-xl rounded-xl">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
            <h2 className="flex items-center text-lg font-medium text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              KPI List
            </h2>
          </div>
          <div className="p-6">
            {filteredRows.length === 0 ? (
              <div className="py-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mb-1 text-lg font-medium text-gray-900">No KPIs found</h3>
                <p className="text-gray-500">{searchTerm ? "No KPIs match your search" : "Create your first KPI to get started"}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRows.map(r => (
                  <div key={r.id} className="p-5 transition-all duration-300 border border-gray-200 rounded-lg hover:shadow-md">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="px-2 py-1 mr-2 text-xs font-medium text-indigo-700 bg-indigo-100 rounded">{kmis.find(k=>k.id===r.kmi_id)?.description ? `KMI: ${kmis.find(k=>k.id===r.kmi_id)?.description}` : `KMI #${r.kmi_id}`}</span>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(r.status)}`}>{r.status}</span>
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">{r.description}</h3>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button onClick={()=>openEdit(r)} className="text-indigo-600 hover:text-indigo-800 text-sm">Edit</button>
                        <button onClick={()=>remove(r.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                      </div>
                    </div>
                    <div className="flex items-center mb-2 text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {r.start_date} → {r.end_date}
                    </div>
                    {r.notes && <p className="text-sm text-gray-600">{r.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    {isEditOpen && (
      <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={()=>setIsEditOpen(false)} />
          <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium leading-6 text-white">Edit KPI</h3>
                <button className="text-white hover:text-gray-200" onClick={()=>setIsEditOpen(false)}>
                  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-5 bg-white">
              {error && <div className="mb-4 p-3 rounded border border-red-200 text-red-700 bg-red-50 text-sm">{error}</div>}
              <form className="space-y-5" onSubmit={update}>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Select KMI</label>
                  <select className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={editForm.kmi_id} onChange={e=>setEditForm({...editForm, kmi_id:e.target.value})}>
                    <option value="">-- Select KMI --</option>
                    {kmis.map(k => <option key={k.id} value={k.id}>{k.description}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Description</label>
                  <input className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={editForm.description} onChange={e=>setEditForm({...editForm, description: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Start Date</label>
                    <input type="date" className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={editForm.start_date} onChange={e=>setEditForm({...editForm, start_date:e.target.value})} />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">End Date</label>
                    <input type="date" className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={editForm.end_date} onChange={e=>setEditForm({...editForm, end_date:e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Status</label>
                  <select className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={editForm.status} onChange={e=>setEditForm({...editForm, status:e.target.value})}>
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Notes</label>
                  <textarea rows="3" className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={editForm.notes} onChange={e=>setEditForm({...editForm, notes:e.target.value})} />
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button type="button" onClick={()=>setIsEditOpen(false)} className="inline-flex justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancel</button>
                  <button type="submit" className="inline-flex justify-center px-6 py-3 text-sm font-medium text-white border border-transparent rounded-lg shadow-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Update KPI</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
