/**
 * EXAMPLE: How to use Redux and separate API services
 * 
 * This file demonstrates two approaches:
 * 1. Using Redux for state management (recommended for shared state)
 * 2. Using API services directly (for one-off calls)
 */

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// Redux actions
import { fetchMyTasks, createTask } from '../../store/slices/tasksSlice'
import { fetchMyLeaves, applyLeave } from '../../store/slices/leavesSlice'
import { fetchStaffNames } from '../../store/slices/usersSlice'

// Direct API services (alternative approach)
import { tasksService } from '../../api/tasksApi'
import { leavesService } from '../../api/leavesApi'
import { usersService } from '../../api/usersApi'
import { ticketsService } from '../../api/ticketsApi'

export default function ExampleUsagePage() {
  // ========================================
  // APPROACH 1: Using Redux (Recommended)
  // ========================================
  
  const dispatch = useDispatch()
  
  // Access Redux state
  const { tasks, loading: tasksLoading } = useSelector((state) => state.tasks)
  const { leaves, loading: leavesLoading } = useSelector((state) => state.leaves)
  const { staffNames } = useSelector((state) => state.users)
  const { user } = useSelector((state) => state.auth)

  // Fetch data on mount using Redux
  useEffect(() => {
    // Only fetch data if user is authenticated
    if (user) {
      dispatch(fetchMyTasks())
      dispatch(fetchMyLeaves())
      dispatch(fetchStaffNames())
    }
  }, [dispatch, user])

  // Example: Create task using Redux
  const handleCreateTaskRedux = async () => {
    const taskData = {
      title: 'New Task',
      description: 'Task description',
      assigned_to: 1,
      due_date: '2024-12-31',
      priority: 'High'
    }
    
    try {
      await dispatch(createTask(taskData)).unwrap()
      alert('Task created successfully!')
    } catch (error) {
      alert('Failed to create task: ' + error)
    }
  }

  // Example: Apply leave using Redux
  const handleApplyLeaveRedux = async () => {
    const leaveData = {
      from_date: '2024-12-01',
      to_date: '2024-12-05',
      alternate_person: 'John Doe',
      available_on_phone: true
    }
    
    try {
      await dispatch(applyLeave(leaveData)).unwrap()
      alert('Leave applied successfully!')
    } catch (error) {
      alert('Failed to apply leave: ' + error)
    }
  }

  // ========================================
  // APPROACH 2: Using API Services Directly
  // ========================================
  
  const [tickets, setTickets] = useState([])

  // Example: Fetch tickets using API service directly
  const fetchTicketsDirectly = async () => {
    try {
      const response = await ticketsService.getMyTickets()
      setTickets(response.data)
      alert('Tickets fetched successfully!')
    } catch (error) {
      alert('Failed to fetch tickets: ' + error.message)
    }
  }

  // Example: Create task using API service directly
  const handleCreateTaskDirect = async () => {
    const taskData = {
      title: 'New Task (Direct)',
      description: 'Created using direct API call',
      assigned_to: 1,
      due_date: '2024-12-31',
      priority: 'Medium'
    }
    
    try {
      const response = await tasksService.createTask(taskData)
      alert('Task created successfully: ' + JSON.stringify(response.data))
    } catch (error) {
      alert('Failed to create task: ' + error.message)
    }
  }

  // Example: Get staff names directly
  const getStaffNamesDirect = async () => {
    try {
      const response = await usersService.getStaffNames()
      console.log('Staff names:', response.data)
      alert('Check console for staff names')
    } catch (error) {
      alert('Failed to fetch staff names: ' + error.message)
    }
  }

  // ========================================
  // Render
  // ========================================
  
  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Redux & API Services Example
          </h1>
          <p className="text-gray-600">
            This page demonstrates how to use Redux and separate API services
          </p>
        </div>

        {/* Current User */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Current User (from Redux)</h3>
          <pre className="text-sm">{JSON.stringify(user, null, 2)}</pre>
        </div>

        {/* Redux Approach */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Approach 1: Using Redux (Recommended)
          </h2>
          
          <div className="space-y-4">
            {/* Tasks from Redux */}
            <div>
              <h3 className="font-semibold mb-2">Tasks from Redux State</h3>
              {tasksLoading ? (
                <p className="text-gray-500">Loading tasks...</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Total tasks: {tasks.length}
                  </p>
                  <button
                    onClick={handleCreateTaskRedux}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Create Task (Redux)
                  </button>
                </div>
              )}
            </div>

            {/* Leaves from Redux */}
            <div>
              <h3 className="font-semibold mb-2">Leaves from Redux State</h3>
              {leavesLoading ? (
                <p className="text-gray-500">Loading leaves...</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Total leaves: {leaves.length}
                  </p>
                  <button
                    onClick={handleApplyLeaveRedux}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Apply Leave (Redux)
                  </button>
                </div>
              )}
            </div>

            {/* Staff Names from Redux */}
            <div>
              <h3 className="font-semibold mb-2">Staff Names from Redux State</h3>
              <p className="text-sm text-gray-600">
                Total staff: {staffNames.length}
              </p>
            </div>
          </div>
        </div>

        {/* Direct API Approach */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Approach 2: Using API Services Directly
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-600 mb-4">
              Use this approach for one-off API calls that don't need to be in global state
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={fetchTicketsDirectly}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Fetch Tickets (Direct)
              </button>
              
              <button
                onClick={handleCreateTaskDirect}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Create Task (Direct)
              </button>
              
              <button
                onClick={getStaffNamesDirect}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Get Staff Names (Direct)
              </button>
            </div>

            {tickets.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Tickets (fetched directly)</h3>
                <p className="text-sm text-gray-600">Total tickets: {tickets.length}</p>
              </div>
            )}
          </div>
        </div>

        {/* Code Examples */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Code Examples</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Redux Pattern:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`import { useDispatch, useSelector } from 'react-redux'
import { fetchMyTasks } from '../../store/slices/tasksSlice'

const dispatch = useDispatch()
const { tasks, loading } = useSelector((state) => state.tasks)

// Fetch data
useEffect(() => {
  dispatch(fetchMyTasks())
}, [dispatch])

// Create data
await dispatch(createTask(data)).unwrap()`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Direct API Pattern:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`import { tasksService } from '../../api/tasksApi'

// Fetch data
const response = await tasksService.getMyTasks()
const tasks = response.data

// Create data
await tasksService.createTask(data)`}
              </pre>
            </div>
          </div>
        </div>

        {/* Documentation Link */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-yellow-900">
            📚 For more details, check the <strong>REDUX_IMPLEMENTATION.md</strong> file in the project root
          </p>
        </div>
      </div>
    </div>
  )
}
