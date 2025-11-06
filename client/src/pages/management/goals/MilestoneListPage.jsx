import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMilestones, deleteMilestone } from '../../../api/milestoneApi';
import { getGoals } from '../../../api/goalApi';

export default function MilestoneListPage() {
  const [milestones, setMilestones] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', goal_id: '' });

  useEffect(() => {
    loadGoals();
    loadMilestones();
  }, [filters]);

  const loadGoals = async () => {
    try {
      const res = await getGoals({});
      setGoals(res.data);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const loadMilestones = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.goal_id) params.goal_id = filters.goal_id;
      const res = await getMilestones(params);
      setMilestones(res.data);
    } catch (error) {
      console.error('Error loading milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      try {
        await deleteMilestone(id);
        loadMilestones();
      } catch (error) {
        console.error('Error deleting milestone:', error);
        alert('Failed to delete milestone');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = (milestone) => {
    const start = new Date(milestone.from_date);
    const end = new Date(milestone.to_date);
    const now = new Date();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Milestones Management</h1>
          <Link
            to="/management/goals/milestones/new"
            className="px-4 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            + New Milestone
          </Link>
        </div>

        {/* Filters */}
        <div className="grid gap-4 p-4 mb-6 bg-white rounded-lg shadow md:grid-cols-2">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Goal</label>
            <select
              value={filters.goal_id}
              onChange={(e) => setFilters({ ...filters, goal_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Goals</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Milestones List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : milestones.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-lg shadow">
            <p className="text-gray-500">No milestones found. Create your first milestone to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="p-6 transition-shadow bg-white rounded-lg shadow hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-semibold text-gray-900">{milestone.title}</h3>
                    {milestone.Goal && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Goal:</span> {milestone.Goal.title}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/management/goals/milestones/edit/${milestone.id}`}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(milestone.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <p className="mb-4 text-sm text-gray-600">{milestone.description || 'No description'}</p>

                <div className="flex items-center gap-4 mb-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(milestone.status)}`}>
                    {milestone.status}
                  </span>
                  <span className="text-sm text-gray-600">
                    {new Date(milestone.from_date).toLocaleDateString()} - {new Date(milestone.to_date).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="font-medium text-gray-700">Timeline Progress</span>
                    <span className="text-gray-600">{calculateProgress(milestone)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 bg-indigo-600 rounded-full transition-all"
                      style={{ width: `${calculateProgress(milestone)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
