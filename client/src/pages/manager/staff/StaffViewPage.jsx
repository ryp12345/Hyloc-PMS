import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../../lib/api'

export default function StaffViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [staff, setStaff] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('basic')
  
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    if (imagePath.startsWith('http')) return imagePath
    return API_BASE.replace('/api', '') + imagePath
  }
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleDateString()
    } catch {
      return '-'
    }
  }

  useEffect(() => {
    loadStaff()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadStaff = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get(`/users/${id}`)
      console.log('Staff data loaded:', res.data)
      setStaff(res.data)
    } catch (e) {
      console.error('Failed to load staff:', e)
      console.error('Error details:', e.response?.data || e.message)
      setError(e.response?.data?.message || e.message || 'Failed to load staff data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!staff) {
    return (
      <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 mb-2">Staff member not found</p>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              onClick={() => navigate('/manager/staff')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Back to Staff List
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-gray-50 to-gray-100 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/manager/staff')}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Staff
          </button>
        </div>

        {/* Main Layout: Left Sidebar + Right Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            {/* Staff Image Box */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-4">
              <div className="flex flex-col items-center">
                {/* Staff Image */}
                <div className="mb-4">
                  {staff.staff?.staff_img ? (
                    <img
                      src={getImageUrl(staff.staff.staff_img)}
                      alt={staff.fullName || 'Staff'}
                      className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100 shadow-lg"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center border-4 border-indigo-100 shadow-lg"
                    style={{ display: staff.staff?.staff_img ? 'none' : 'flex' }}
                  >
                    <span className="text-4xl font-bold text-white">
                      {(staff.staff?.first_name?.[0] || staff.fullName?.[0] || '?').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Staff Name and Role */}
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-800 mb-1">
                    {[staff.staff?.first_name, staff.staff?.middle_name, staff.staff?.last_name].filter(Boolean).join(' ') || staff.fullName || 'Unknown'}
                  </h2>
                  <p className="text-xs text-gray-500 mb-2">{staff.staff?.emp_id || 'No ID'}</p>
                  <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                    {staff.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Vertical Tabs */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <nav className="flex flex-col">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`flex items-center px-6 py-4 text-sm font-medium transition-colors border-l-4 ${
                    activeTab === 'basic'
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Basic Information</span>
                </button>
                <button
                  onClick={() => setActiveTab('department')}
                  className={`flex items-center px-6 py-4 text-sm font-medium transition-colors border-l-4 ${
                    activeTab === 'department'
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Department</span>
                </button>
                <button
                  onClick={() => setActiveTab('designation')}
                  className={`flex items-center px-6 py-4 text-sm font-medium transition-colors border-l-4 ${
                    activeTab === 'designation'
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Designation</span>
                </button>
                <button
                  onClick={() => setActiveTab('association')}
                  className={`flex items-center px-6 py-4 text-sm font-medium transition-colors border-l-4 ${
                    activeTab === 'association'
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Association</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-6">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="py-3 border-b border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                    <p className="text-sm font-medium text-gray-900">{[staff.staff?.first_name, staff.staff?.middle_name, staff.staff?.last_name].filter(Boolean).join(' ') || staff.fullName || '-'}</p>
                  </div>
                  <div className="py-3 border-b border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
                    <p className="text-sm font-medium text-gray-900">{staff.email}</p>
                  </div>
                  <div className="py-3 border-b border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Employee ID</label>
                    <p className="text-sm font-medium text-gray-900">{staff.staff?.emp_id || '-'}</p>
                  </div>
                  <div className="py-3 border-b border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                    <p className="text-sm font-medium text-indigo-600">{staff.role}</p>
                  </div>
                  <div className="py-3 border-b border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number</label>
                    <p className="text-sm font-medium text-gray-900">{staff.staff?.phone_no || '-'}</p>
                  </div>
                  <div className="py-3 border-b border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Date of Birth</label>
                    <p className="text-sm font-medium text-gray-900">{staff.staff?.date_of_birth ? new Date(staff.staff.date_of_birth).toLocaleDateString() : '-'}</p>
                  </div>
                  <div className="py-3 border-b border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Blood Group</label>
                    <p className="text-sm font-medium text-gray-900">{staff.staff?.blood_group || '-'}</p>
                  </div>
                  <div className="py-3 border-b border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Religion</label>
                    <p className="text-sm font-medium text-gray-900">{staff.staff?.religion || '-'}</p>
                  </div>
                  <div className="py-3 border-b border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Gender</label>
                    <p className="text-sm font-medium text-gray-900">{staff.staff?.gender || '-'}</p>
                  </div>
                  <div className="py-3 border-b border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Date of Joining</label>
                    <p className="text-sm font-medium text-gray-900">{staff.staff?.date_of_joining ? new Date(staff.staff.date_of_joining).toLocaleDateString() : '-'}</p>
                  </div>
                  <div className="py-3 border-b border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1">TPM Pillar</label>
                    <p className="text-sm font-medium text-gray-900">{staff.staff?.tpm_pillar || '-'}</p>
                  </div>
                  <div className="py-3 border-b border-gray-100 md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                    <p className="text-sm font-medium text-gray-900">{staff.staff?.address || '-'}</p>
                  </div>
                  <div className="py-3 border-b border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1">PAN Number</label>
                    <p className="text-sm font-medium text-gray-900">{staff.staff?.pan_no || '-'}</p>
                  </div>
                  <div className="py-3 border-b border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Aadhar Number</label>
                    <p className="text-sm font-medium text-gray-900">{staff.staff?.aadhar_no || '-'}</p>
                  </div>
                </div>
              </div>
              {staff.staff?.award_recognition && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Awards & Recognition</h4>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-700">{staff.staff.award_recognition}</p>
                  </div>
                </div>
              )}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="py-3 border-b border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Contact Name</label>
                    <p className="text-sm font-medium text-gray-900">{staff.staff?.emergency_contact_name || '-'}</p>
                  </div>
                  <div className="py-3 border-b border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Contact Number</label>
                    <p className="text-sm font-medium text-gray-900">{staff.staff?.emergency_contact_number || '-'}</p>
                  </div>
                  <div className="py-3 border-b border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Relation</label>
                    <p className="text-sm font-medium text-gray-900">{staff.staff?.emergency_contact_relation || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Department Tab */}
          {activeTab === 'department' && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Department Information
              </h4>
              {Array.isArray(staff.staff?.Departments) && staff.staff.Departments.length > 0 ? (
                <div className="mt-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">S.No</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department Name</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">End Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {staff.staff.Departments.map((dept, idx) => (
                          <tr key={dept.id ?? idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-700">{idx + 1}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{dept.dept_name || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{formatDate(dept.DepartmentStaff?.start_date)}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{formatDate(dept.DepartmentStaff?.end_date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-gray-500 text-sm">No department history available for this staff member</p>
                </div>
              )}
            </div>
          )}

          {/* Designation Tab */}
          {activeTab === 'designation' && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Designation Information
              </h4>
              {Array.isArray(staff.staff?.Designations) && staff.staff.Designations.length > 0 ? (
                <div className="mt-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">S.No</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Designation Name</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">End Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {staff.staff.Designations.map((desig, idx) => (
                          <tr key={desig.id ?? idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-700">{idx + 1}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{desig.name || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{formatDate(desig.DesignationStaff?.start_date)}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{formatDate(desig.DesignationStaff?.end_date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500 text-sm">No designation history available for this staff member</p>
                </div>
              )}
            </div>
          )}

          {/* Association Tab */}
          {activeTab === 'association' && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Association Information
              </h4>
              {Array.isArray(staff.staff?.Associations) && staff.staff.Associations.length > 0 ? (
                <div className="mt-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">S.No</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Association Name</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">End Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {staff.staff.Associations.map((asso, idx) => (
                          <tr key={asso.id ?? idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-700">{idx + 1}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{asso.asso_name || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{formatDate(asso.AssociationStaff?.start_date)}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{formatDate(asso.AssociationStaff?.end_date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-500 text-sm">No association assigned to this staff member</p>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}
