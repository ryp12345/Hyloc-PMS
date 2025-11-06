import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMilestone, createMilestone, updateMilestone } from '../../../api/milestoneApi';
import { getGoals } from '../../../api/goalApi';

export default function MilestoneFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    goal_id: '',
    title: '',
    description: '',
    from_date: '',
    to_date: '',
    status: 'Pending'
  });

  useEffect(() => {
    loadGoals();
    if (isEdit) {
      loadMilestone();
    }
  }, [id]);

  const loadGoals = async () => {
    try {
      const res = await getGoals({});
      setGoals(res.data);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const loadMilestone = async () => {
    try {
      setLoading(true);
      const res = await getMilestone(id);
      setFormData({
        goal_id: res.data.goal_id || '',
        title: res.data.title || '',
        description: res.data.description || '',
        from_date: res.data.from_date || '',
        to_date: res.data.to_date || '',
        status: res.data.status || 'Pending'
      });
    } catch (error) {
      console.error('Error loading milestone:', error);
      alert('Failed to load milestone');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }
    if (!formData.goal_id) {
      alert('Please select a goal');
      return;
    }
    if (!formData.from_date || !formData.to_date) {
      alert('Both start and end dates are required');
      return;
    }
    if (new Date(formData.from_date) > new Date(formData.to_date)) {
      alert('Start date must be before or equal to end date');
      return;
    }

    try {
      setLoading(true);
      if (isEdit) {
        await updateMilestone(id, formData);
      } else {
        await createMilestone(formData);
      }
      navigate('/management/goals/milestones');
    } catch (error) {
      console.error('Error saving milestone:', error);
      alert(error.response?.data?.message || 'Failed to save milestone');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/management/goals/milestones')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Milestones
          </button>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Milestone' : 'Create New Milestone'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Goal <span className="text-red-500">*</span>
              </label>
              <select
                name="goal_id"
                value={formData.goal_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a goal</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter milestone title"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter milestone description (optional)"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="from_date"
                  value={formData.from_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="to_date"
                  value={formData.to_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {loading ? 'Saving...' : isEdit ? 'Update Milestone' : 'Create Milestone'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/management/goals/milestones')}
                className="px-6 py-3 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
