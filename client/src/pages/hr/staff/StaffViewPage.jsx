import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../../lib/api'

export default function StaffViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [staff, setStaff] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('basic')

  useEffect(() => {
    loadStaff()
  }, [id])

  const loadStaff = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/users/${id}`)
      setStaff(res.data)
    } catch (e) {
      console.error('Failed to load staff:', e)
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
            <p className="text-gray-500">Staff member not found</p>
            <button
              onClick={() => navigate('/staff')}
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
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/staff')}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Staff List
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow-md overflow-hidden">
          <nav className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'basic'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Basic Information
              </div>
            </button>
            <button
              onClick={() => setActiveTab('department')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'department'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Department
              </div>
            </button>
            <button
              onClick={() => setActiveTab('designation')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'designation'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Designation
              </div>
            </button>
            <button
              onClick={() => setActiveTab('association')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'association'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Association
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="py-3 border-b border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                    <p className="text-sm font-medium text-gray-900">{staff.name}</p>
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
              <div className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-indigo-50 rounded-lg border border-indigo-200">
                    <label className="block text-xs font-medium text-gray-500 mb-2">Department Name</label>
                    <p className="text-lg font-semibold text-indigo-600">{staff.staff?.Department?.dept_name || staff.staff?.department || '-'}</p>
                  </div>
                  {/* <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <label className="block text-xs font-medium text-gray-500 mb-2">Department ID</label>
                    <p className="text-lg font-semibold text-blue-600">{staff.staff?.department_id || staff.staff?.Department?.id || '-'}</p>
                  </div> */}
                </div>
                {staff.staff?.Department?.description && (
                  <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-xs font-medium text-gray-500 mb-2">Department Description</label>
                    <p className="text-sm text-gray-700">{staff.staff.Department.description}</p>
                  </div>
                )}
              </div>
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
              <div className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                    <label className="block text-xs font-medium text-gray-500 mb-2">Designation Name</label>
                    <p className="text-lg font-semibold text-purple-600">{staff.staff?.Designation?.name || staff.staff?.designation || '-'}</p>
                  </div>
                  {/* <div className="p-6 bg-pink-50 rounded-lg border border-pink-200">
                    <label className="block text-xs font-medium text-gray-500 mb-2">Designation ID</label>
                    <p className="text-lg font-semibold text-pink-600">{staff.staff?.designation_id || staff.staff?.Designation?.id || '-'}</p>
                  </div> */}
                </div>
                {staff.staff?.Designation?.description && (
                  <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-xs font-medium text-gray-500 mb-2">Designation Description</label>
                    <p className="text-sm text-gray-700">{staff.staff.Designation.description}</p>
                  </div>
                )}
              </div>
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
              {staff.staff?.Association || staff.staff?.association_id ? (
                <div className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                      <label className="block text-xs font-medium text-gray-500 mb-2">Association Name</label>
                      <p className="text-lg font-semibold text-green-600">{staff.staff?.Association?.asso_name || '-'}</p>
                    </div>
                    {/* <div className="p-6 bg-emerald-50 rounded-lg border border-emerald-200">
                      <label className="block text-xs font-medium text-gray-500 mb-2">Association ID</label>
                      <p className="text-lg font-semibold text-emerald-600">{staff.staff?.association_id || staff.staff?.Association?.id || '-'}</p>
                    </div> */}
                  </div>
                  {staff.staff?.Association?.description && (
                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-2">Association Description</label>
                      <p className="text-sm text-gray-700">{staff.staff.Association.description}</p>
                    </div>
                  )}
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
  )
}
