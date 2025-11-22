import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../lib/api'
import { getDepartments } from '../../../api/departmentApi'
import { getDesignations } from '../../../api/designationApi'
import { getAssociations } from '../../../api/associationApi'
import { getRoles } from '../../../api/roleApi'

const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const RELATION_OPTIONS = ['Father', 'Mother', 'Spouse', 'Brother', 'Sister', 'Son', 'Daughter', 'Other']

const TPM_PILLAR_OPTIONS = [
  'Focused Improvement',
  'Autonomous Maintenance',
  'Quality Maintenance',
  'Planned Maintenance',
  'Early Management',
  'Training & Education',
  'Safety, Environment & Health (SHE)',
  'Administrative TPM'
]

export default function StaffPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [associations, setAssociations] = useState([])
  const [roles, setRoles] = useState([])
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)
  const [bulkFile, setBulkFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [bulkResults, setBulkResults] = useState(null)
  const [form, setForm] = useState({
    email: '',
    staff: { 
      first_name: '',
      middle_name: '',
      last_name: '',
      emp_id: '', 
      designation_id: '', 
      department_id: '', 
      religion: '', 
      association_id: '',
      date_of_birth: '',
      phone_no: '',
      blood_group: '',
      emergency_contact_name: '',
      emergency_contact_number: '',
      emergency_contact_relation: '',
      pan_no: '',
      aadhar_no: '',
      date_of_joining: '',
      tpm_pillar: '',
      staff_img: '',
      gender: '',
      address: ''
    }
  })
  // Assign Role moved to dedicated page
  const RELIGION_OPTIONS = [
    'Hindu',
    'Muslim',
    'Christian',
    'Sikh',
    'Buddhist',
    'Jain',
    'Other'
  ];
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const load = async () => {
    try {
      const res = await api.get('/users')
      const users = res.data || []
      
      // Fetch role assignments for each user
      const usersWithRoles = await Promise.all(
        users.map(async (user) => {
          try {
            const rolesRes = await api.get(`/users/${user.id}/roles`)
            return { ...user, roleAssignments: rolesRes.data || [] }
          } catch (e) {
            return { ...user, roleAssignments: [] }
          }
        })
      )
      
      setRows(usersWithRoles)
    } catch (e) {
      setRows([])
    }
  }
  useEffect(() => {
    load()
    // Fetch departments, designations, associations and roles for dropdowns
    Promise.allSettled([getDepartments(), getDesignations(), getAssociations(), getRoles()])
      .then(([deptRes, desigRes, assoRes, roleRes]) => {
        if (deptRes.status === 'fulfilled') setDepartments(deptRes.value.data || [])
        if (desigRes.status === 'fulfilled') setDesignations(desigRes.value.data || [])
        if (assoRes.status === 'fulfilled') setAssociations(assoRes.value.data || [])
        if (roleRes.status === 'fulfilled') setRoles(roleRes.value.data || [])
      })
      .catch(() => {})
  }, [])

  const onClose = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setImageFile(null)
    setImagePreview(null)
    setForm({ 
      email: '', 
      staff: { 
        first_name: '',
        middle_name: '',
        last_name: '',
        emp_id: '', 
        designation_id: '', 
        department_id: '', 
        religion: '', 
        association_id: '',
        date_of_birth: '',
        phone_no: '',
        blood_group: '',
        emergency_contact_name: '',
        emergency_contact_number: '',
        emergency_contact_relation: '',
        pan_no: '',
        aadhar_no: '',
        date_of_joining: '',
        tpm_pillar: '',
        staff_img: '',
        gender: '',
        address: ''
      } 
    })
    setError('')
  }

  const openCreate = () => { onClose(); setIsModalOpen(true) }

  const openEdit = (row) => {
    setEditingId(row.id)
    // Handle new many-to-many relationships - get first active department/designation/association
    const firstDepartment = row.staff?.Departments?.[0];
    const firstDesignation = row.staff?.Designations?.[0];
    const firstAssociation = row.staff?.Associations?.[0];
    
    // Set image preview if exists
    if (row.staff?.staff_img) {
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/api$/, '')
      setImagePreview(`${baseUrl}${row.staff.staff_img}`)
    }
    
    setForm({
      email: row.email || '',
      staff: {
        first_name: row.staff?.first_name || '',
        middle_name: row.staff?.middle_name || '',
        last_name: row.staff?.last_name || '',
        emp_id: row.staff?.emp_id || '',
        designation_id: firstDesignation?.id || row.staff?.designation_id || '',
        department_id: firstDepartment?.id || row.staff?.department_id || '',
        religion: row.staff?.religion || '',
        association_id: firstAssociation?.id || row.staff?.association_id || '',
        date_of_birth: row.staff?.date_of_birth || '',
        phone_no: row.staff?.phone_no || '',
        blood_group: row.staff?.blood_group || '',
        emergency_contact_name: row.staff?.emergency_contact_name || '',
        emergency_contact_number: row.staff?.emergency_contact_number || '',
        emergency_contact_relation: row.staff?.emergency_contact_relation || '',
        pan_no: row.staff?.pan_no || '',
        aadhar_no: row.staff?.aadhar_no || '',
        date_of_joining: row.staff?.date_of_joining || '',
        tpm_pillar: row.staff?.tpm_pillar || '',
        staff_img: row.staff?.staff_img || '',
        gender: row.staff?.gender || '',
        address: row.staff?.address || ''
      }
    })
    setIsModalOpen(true)
  }

  const openView = (row) => {
    navigate(`/staff/view/${row.id}`)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should not exceed 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      setImageFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (staffId) => {
    if (!imageFile) return form.staff.staff_img
    
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('staffImage', imageFile)
      formData.append('staffId', staffId || form.staff.emp_id)
      formData.append('firstName', form.staff.first_name || '')
      formData.append('middleName', form.staff.middle_name || '')
      formData.append('lastName', form.staff.last_name || '')
      // Send old image path for deletion
      if (form.staff.staff_img) {
        formData.append('oldImage', form.staff.staff_img)
      }
      
      // Debug log
      console.log('Uploading with data:', {
        firstName: form.staff.first_name,
        middleName: form.staff.middle_name,
        lastName: form.staff.last_name,
        staffId: staffId || form.staff.emp_id
      })
      
      const token = localStorage.getItem('accessToken') || JSON.parse(localStorage.getItem('auth') || '{}').accessToken
      // Use the base URL without /api suffix for the upload
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/api$/, '')
      const response = await fetch(`${baseUrl}/api/upload/staff-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Upload failed')
      }
      
      const data = await response.json()
      return data.path
    } catch (err) {
      console.error('Image upload error:', err)
      throw err
    } finally {
      setUploadingImage(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = { ...form }
      
      // Upload image if selected
      if (imageFile) {
        const imagePath = await uploadImage(payload.staff.emp_id)
        payload.staff.staff_img = imagePath
      }
      
      // Clean up date fields - set empty strings to null
      if (payload.staff) {
        if (payload.staff.date_of_birth === '') payload.staff.date_of_birth = null
        if (payload.staff.date_of_joining === '') payload.staff.date_of_joining = null
        
        // Remove deprecated fields that no longer exist in the database
        delete payload.staff.department
        delete payload.staff.designation
      }

      if (editingId) {
        // Ensure no roleName is sent in edit
        delete payload.roleName
        await api.put(`/users/${editingId}`, payload)
      } else {
        // CREATE: do not send roleName; roles assigned separately
        delete payload.roleName
        await api.post('/users', payload)
      }
      onClose(); load()
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to save')
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this staff user?')) return
    try { await api.delete(`/users/${id}`); load() } catch (e) { /* ignore */ }
  }

  const downloadTemplate = async () => {
    try {
      const response = await api.get('/users/download-template', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'staff_upload_template.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to download template')
    }
  }

  const handleBulkFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setError('Please select a valid Excel file (.xlsx or .xls)')
        return
      }
      setBulkFile(file)
      setBulkResults(null)
    }
  }

  const submitBulkUpload = async (e) => {
    e.preventDefault()
    if (!bulkFile) {
      setError('Please select a file')
      return
    }

    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', bulkFile)

      const response = await api.post('/users/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setBulkResults(response.data)
      setBulkFile(null)
      
      // Reload staff list
      if (response.data.successCount > 0) {
        load()
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const closeBulkUpload = () => {
    setIsBulkUploadOpen(false)
    setBulkFile(null)
    setBulkResults(null)
    setError('')
  }

  // Assign Role functionality moved to dedicated page



  // Pagination state
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Filtered and sorted data
  const filtered = useMemo(() => {
    // Sort latest first using Staff.created_at (underscored) or createdAt, fallback to staff id desc
    const getTime = (u) => {
      const s = u.staff;
      if (!s) return 0;
      const t = s.created_at || s.createdAt;
      return t ? new Date(t).getTime() : 0;
    };
    const sorted = [...rows].sort((a, b) => {
      const aTime = getTime(a);
      const bTime = getTime(b);
      if (bTime !== aTime) return bTime - aTime;
      // If timestamps equal, try staff.id (incremental) then fallback to 0
      return (b.staff?.id || 0) - (a.staff?.id || 0);
    });
    const q = search.toLowerCase();
    return sorted.filter(r => {
      const fullName = [r.staff?.first_name, r.staff?.middle_name, r.staff?.last_name].filter(Boolean).join(' ').toLowerCase();
      return (
        fullName.includes(q) ||
        r.email?.toLowerCase().includes(q) ||
      r.role?.toLowerCase().includes(q) ||
      r.staff?.Departments?.[0]?.dept_name?.toLowerCase().includes(q) ||
      r.staff?.Department?.dept_name?.toLowerCase().includes(q) ||
      r.staff?.department?.toLowerCase().includes(q) ||
      r.staff?.Designations?.[0]?.name?.toLowerCase().includes(q) ||
      r.staff?.Designation?.name?.toLowerCase().includes(q) ||
      r.staff?.designation?.toLowerCase().includes(q) ||
      r.staff?.religion?.toLowerCase().includes(q) ||
      r.staff?.phone_no?.toLowerCase().includes(q) ||
      r.staff?.emp_id?.toLowerCase().includes(q) ||
        r.staff?.Associations?.[0]?.asso_name?.toLowerCase().includes(q) ||
        r.staff?.Association?.asso_name?.toLowerCase().includes(q)
      );
    });
  }, [rows, search]);  // Paginated data
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
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={() => setIsBulkUploadOpen(true)} className="flex items-center justify-center px-6 py-3 font-medium text-white transition-all duration-300 transform rounded-lg shadow-lg bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 hover:-translate-y-1 hover:scale-105 flex-1 sm:flex-initial">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Staff Upload
            </button>
            <button onClick={openCreate} className="flex items-center justify-center px-6 py-3 font-medium text-white transition-all duration-300 transform rounded-lg shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-1 hover:scale-105 flex-1 sm:flex-initial">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
              Add Staff
            </button>
          </div>
        </div>

        <div className="mb-10 overflow-hidden bg-white shadow-xl rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">S.NO</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Roles</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Designation</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Association</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.length === 0 ? (
                  <tr><td colSpan="8" className="px-6 py-12 text-center text-gray-500">No staff found</td></tr>
                ) : (
                  paginated.map((u, idx) => (
                    <tr key={u.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition-colors duration-150`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{[u.staff?.first_name, u.staff?.middle_name, u.staff?.last_name].filter(Boolean).join(' ') || u.fullName || '-'}</td>
                      {/* Roles column */}
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
                      {/* Status column */}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.staff?.Departments?.[0]?.dept_name || u.staff?.Department?.dept_name || u.staff?.department || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.staff?.Designations?.[0]?.name || u.staff?.Designation?.name || u.staff?.designation || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.staff?.Associations?.[0]?.asso_name || u.staff?.Association?.asso_name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openView(u)}
                            className="p-2 text-white transition-colors duration-200 bg-green-600 rounded-lg hover:bg-green-700"
                            title="View Staff Details"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">First Name *</label>
                        <input value={form.staff.first_name} onChange={e=>setForm({ ...form, staff: { ...form.staff, first_name: e.target.value } })} className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="First Name" required maxLength="100" />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Middle Name</label>
                        <input value={form.staff.middle_name} onChange={e=>setForm({ ...form, staff: { ...form.staff, middle_name: e.target.value } })} className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Middle Name" maxLength="100" />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Last Name</label>
                        <input value={form.staff.last_name} onChange={e=>setForm({ ...form, staff: { ...form.staff, last_name: e.target.value } })} className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Last Name" maxLength="100" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
                        <input type="email" value={form.email} onChange={e=>setForm({ ...form, email: e.target.value })} className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Enter Email Address" required />
                      </div>
                       <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Employee ID</label>
                          <input required value={form.staff.emp_id} onChange={e=>setForm({ ...form, staff: { ...form.staff, emp_id: e.target.value } })} className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="EMP001" maxLength="20" />
                        </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Date of Birth</label>
                          <input type="date" value={form.staff.date_of_birth} onChange={e=>setForm({ ...form, staff: { ...form.staff, date_of_birth: e.target.value } })} className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Phone Number</label>
                          <input type="tel" value={form.staff.phone_no} onChange={e=>setForm({ ...form, staff: { ...form.staff, phone_no: e.target.value } })} className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="1234567890" maxLength="10" />
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Blood Group</label>
                          <select
                            value={form.staff.blood_group}
                            onChange={e=>setForm({ ...form, staff: { ...form.staff, blood_group: e.target.value } })}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">Select Blood Group</option>
                            {BLOOD_GROUP_OPTIONS.map(bg => (
                              <option key={bg} value={bg}>{bg}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Gender</label>
                          <div className="flex items-center gap-6 px-4 py-3">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name="gender"
                                value="Male"
                                checked={form.staff.gender === 'Male'}
                                onChange={e=>setForm({ ...form, staff: { ...form.staff, gender: e.target.value } })}
                                className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">Male</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name="gender"
                                value="Female"
                                checked={form.staff.gender === 'Female'}
                                onChange={e=>setForm({ ...form, staff: { ...form.staff, gender: e.target.value } })}
                                className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">Female</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name="gender"
                                value="Other"
                                checked={form.staff.gender === 'Other'}
                                onChange={e=>setForm({ ...form, staff: { ...form.staff, gender: e.target.value } })}
                                className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">Other</span>
                            </label>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block mb-2 text-sm font-medium text-gray-700">Address</label>
                          <textarea 
                            value={form.staff.address} 
                            onChange={e=>setForm({ ...form, staff: { ...form.staff, address: e.target.value } })} 
                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                            placeholder="Enter full address..." 
                            rows="2"
                          />
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
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Religion</label>
                          <select
                            value={form.staff.religion}
                            onChange={e=>setForm({ ...form, staff: { ...form.staff, religion: e.target.value } })}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">Select Religion</option>
                            {RELIGION_OPTIONS.map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Association</label>
                          <select
                            value={form.staff.association_id}
                            onChange={e=>setForm({ ...form, staff: { ...form.staff, association_id: e.target.value } })}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">Select Association</option>
                            {associations.map(a => (
                              <option key={a.id} value={a.id}>{a.asso_name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">TPM Pillar</label>
                          <select
                            value={form.staff.tpm_pillar}
                            onChange={e=>setForm({ ...form, staff: { ...form.staff, tpm_pillar: e.target.value } })}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">Select TPM Pillar</option>
                            {TPM_PILLAR_OPTIONS.map(pillar => (
                              <option key={pillar} value={pillar}>{pillar}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Date of Joining</label>
                          <input type="date" value={form.staff.date_of_joining} onChange={e=>setForm({ ...form, staff: { ...form.staff, date_of_joining: e.target.value } })} className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">PAN Number</label>
                          <input value={form.staff.pan_no} onChange={e=>setForm({ ...form, staff: { ...form.staff, pan_no: e.target.value } })} className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="ABCDE1234F" maxLength="10" />
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Aadhar Number</label>
                          <input value={form.staff.aadhar_no} onChange={e=>setForm({ ...form, staff: { ...form.staff, aadhar_no: e.target.value } })} className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="123456789012" maxLength="12" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block mb-2 text-sm font-medium text-gray-700">Staff Image</label>
                          <div className="flex items-center gap-4">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleImageChange}
                              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            {imagePreview && (
                              <div className="flex-shrink-0">
                                <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border-2 border-indigo-300" />
                              </div>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-500">Upload staff photo (Max 5MB, formats: JPG, PNG,)</p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <h4 className="mb-3 text-sm font-semibold text-gray-800">Emergency Contact</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Contact Name</label>
                          <input value={form.staff.emergency_contact_name} onChange={e=>setForm({ ...form, staff: { ...form.staff, emergency_contact_name: e.target.value } })} className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Enter Emergency Contact Name" />
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Contact Number</label>
                          <input type="tel" value={form.staff.emergency_contact_number} onChange={e=>setForm({ ...form, staff: { ...form.staff, emergency_contact_number: e.target.value } })} className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="1234567890" />
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Relation</label>
                          <select
                            value={form.staff.emergency_contact_relation}
                            onChange={e=>setForm({ ...form, staff: { ...form.staff, emergency_contact_relation: e.target.value } })}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">Select Relation</option>
                            {RELATION_OPTIONS.map(rel => (
                              <option key={rel} value={rel}>{rel}</option>
                            ))}
                          </select>
                        </div>
                        {/* Salary field commented out as of now */}
                        {/* <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Salary</label>
                          <input type="number" step="0.01" value={form.staff.salary} onChange={e=>setForm({ ...form, staff: { ...form.staff, salary: e.target.value } })} className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Enter Salary Amount" />
                        </div> */}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                      <button type="button" onClick={onClose} className="inline-flex justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancel</button>
                      <button 
                        type="submit" 
                        disabled={uploadingImage}
                        className="inline-flex justify-center px-6 py-3 text-sm font-medium text-white border border-transparent rounded-lg shadow-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploadingImage ? 'Uploading...' : (editingId ? 'Update Staff' : 'Create Staff')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Upload Modal */}
        {isBulkUploadOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={closeBulkUpload} />
              <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-teal-600">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium leading-6 text-white">Bulk Staff Upload</h3>
                    <button className="text-white hover:text-gray-200" onClick={closeBulkUpload}>
                      <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
                <div className="px-6 py-5 bg-white">
                  {error && <div className="mb-4 p-3 rounded border border-red-200 text-red-700 bg-red-50 text-sm">{error}</div>}
                  
                  {!bulkResults ? (
                    <form className="space-y-5" onSubmit={submitBulkUpload}>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Instructions:</h4>
                        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                          <li>Download the Excel template by clicking the button below</li>
                          <li>Fill in the staff details in the template (one staff per row)</li>
                          <li>Ensure Department, Designation, and Association names match exactly with existing records</li>
                          <li>Upload the completed Excel file</li>
                          <li>Review the results and fix any errors if needed</li>
                        </ol>
                      </div>

                      <div className="flex justify-center">
                        <button 
                          type="button"
                          onClick={downloadTemplate}
                          className="flex items-center px-6 py-3 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download Excel Template
                        </button>
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Upload Excel File</label>
                        <input 
                          type="file" 
                          accept=".xlsx,.xls" 
                          onChange={handleBulkFileChange}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          required
                        />
                        {bulkFile && (
                          <p className="mt-2 text-sm text-gray-600">Selected: {bulkFile.name}</p>
                        )}
                      </div>

                      <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={closeBulkUpload} className="inline-flex justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Cancel</button>
                        <button 
                          type="submit" 
                          disabled={uploading || !bulkFile}
                          className="inline-flex justify-center px-6 py-3 text-sm font-medium text-white border border-transparent rounded-lg shadow-sm bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {uploading ? 'Uploading...' : 'Upload Staff'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="text-sm text-blue-600 font-medium">Total Rows</div>
                          <div className="text-2xl font-bold text-blue-900">{bulkResults.total}</div>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <div className="text-sm text-green-600 font-medium">Successful</div>
                          <div className="text-2xl font-bold text-green-900">{bulkResults.successCount}</div>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg">
                          <div className="text-sm text-red-600 font-medium">Failed</div>
                          <div className="text-2xl font-bold text-red-900">{bulkResults.errorCount}</div>
                        </div>
                      </div>

                      {bulkResults.results.success.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold text-green-800 mb-2">Successfully Added:</h4>
                          <div className="max-h-40 overflow-y-auto border border-green-200 rounded">
                            <table className="min-w-full text-sm">
                              <thead className="bg-green-50">
                                <tr>
                                  <th className="px-4 py-2 text-left">Row</th>
                                  <th className="px-4 py-2 text-left">Name</th>
                                  <th className="px-4 py-2 text-left">Email</th>
                                  <th className="px-4 py-2 text-left">Employee ID</th>
                                </tr>
                              </thead>
                              <tbody>
                                {bulkResults.results.success.map((item, idx) => (
                                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-green-50'}>
                                    <td className="px-4 py-2">{item.row}</td>
                                    <td className="px-4 py-2">{item.name}</td>
                                    <td className="px-4 py-2">{item.email}</td>
                                    <td className="px-4 py-2">{item.empId}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {bulkResults.results.errors.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold text-red-800 mb-2">Errors:</h4>
                          <div className="max-h-60 overflow-y-auto border border-red-200 rounded">
                            <table className="min-w-full text-sm">
                              <thead className="bg-red-50">
                                <tr>
                                  <th className="px-4 py-2 text-left">Row</th>
                                  <th className="px-4 py-2 text-left">Error</th>
                                </tr>
                              </thead>
                              <tbody>
                                {bulkResults.results.errors.map((item, idx) => (
                                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-red-50'}>
                                    <td className="px-4 py-2">{item.row}</td>
                                    <td className="px-4 py-2 text-red-700">{item.error}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end space-x-4 pt-4">
                        <button 
                          onClick={closeBulkUpload}
                          className="inline-flex justify-center px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
