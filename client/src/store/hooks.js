/**
 * Redux Hooks and Utilities
 * 
 * This file provides typed hooks and utility functions for using Redux
 */

import { useDispatch, useSelector } from 'react-redux'

// Export typed hooks for better IDE support
export const useAppDispatch = () => useDispatch()
export const useAppSelector = useSelector

/**
 * Custom hook to handle async Redux actions with loading states
 * 
 * @example
 * const { execute, loading, error } = useAsyncAction()
 * 
 * const handleSubmit = async () => {
 *   await execute(createTask(taskData))
 * }
 */
export const useAsyncAction = () => {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  const execute = async (action) => {
    setLoading(true)
    setError(null)
    try {
      const result = await action
      setLoading(false)
      return result
    } catch (err) {
      setError(err.message || 'An error occurred')
      setLoading(false)
      throw err
    }
  }

  return { execute, loading, error }
}

/**
 * Utility to check if Redux action is pending
 */
export const isPending = (action) => {
  return action.type.endsWith('/pending')
}

/**
 * Utility to check if Redux action is fulfilled
 */
export const isFulfilled = (action) => {
  return action.type.endsWith('/fulfilled')
}

/**
 * Utility to check if Redux action is rejected
 */
export const isRejected = (action) => {
  return action.type.endsWith('/rejected')
}

// Re-export commonly used Redux functions
export { useDispatch, useSelector } from 'react-redux'
