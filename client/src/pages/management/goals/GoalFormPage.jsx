import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getGoal, createGoal, updateGoal } from '../../../api/goalApi';
import { getDepartments } from '../../../api/departmentApi';

export default function GoalFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department_id: '',
    target_date: '',
    completion_percent: 0,
    priority: 'Medium',
    status: 'Pending'
  });

  useEffect(() => {
    loadDepartments();
    if (isEdit) {
      loadGoal();
    }
  }, [id]);

  const loadDepartments = async () => {
    try {
      const res = await getDepartments();
      setDepartments(res.data);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadGoal = async () => {
    try {
      setLoading(true);
      const res = await getGoal(id);
      setFormData({
        title: res.data.title || '',
        description: res.data.description || '',
        department_id: res.data.department_id || '',
        target_date: res.data.target_date || '',
        completion_percent: res.data.completion_percent || 0,
        priority: res.data.priority || 'Medium',
        status: res.data.status || 'Pending'
      });
    } catch (error) {
      console.error('Error loading goal:', error);
      alert('Failed to load goal');
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

    try {
      setLoading(true);
      const payload = { ...formData };
      if (!payload.department_id) delete payload.department_id;
      if (!payload.target_date) delete payload.target_date;

      if (isEdit) {
        await updateGoal(id, payload);
      } else {
        await createGoal(payload);
      }
      navigate('/management/goals');
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('Failed to save goal');
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
            onClick={() => navigate('/management/goals')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Goals
          </button>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Goal' : 'Create New Goal'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Enter goal title"
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
                placeholder="Enter goal description (optional)"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.dept_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Target Date</label>
                <input
                  type="date"
                  name="target_date"
                  value={formData.target_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
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
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Completion Percentage: {formData.completion_percent}%
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  name="completion_percent"
                  min="0"
                  max="100"
                  value={formData.completion_percent}
                  onChange={handleChange}
                  className="flex-1"
                />
                <input
                  type="number"
                  name="completion_percent"
                  min="0"
                  max="100"
                  value={formData.completion_percent}
                  onChange={handleChange}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {loading ? 'Saving...' : isEdit ? 'Update Goal' : 'Create Goal'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/management/goals')}
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
