const { Task, User } = require('../models');

exports.myTasks = async (req, res) => {
  const rows = await Task.findAll({ where: { assigned_to: req.user.id }, order: [['created_at', 'DESC']] });
  res.json(rows);
};

exports.createdByMe = async (req, res) => {
  const rows = await Task.findAll({ where: { assigned_by: req.user.id }, order: [['created_at', 'DESC']] });
  res.json(rows);
};

exports.quickCapture = async (req, res) => {
  const { title, description, assigned_to, due_date, priority = 'Medium' } = req.body;
  if (!title || !assigned_to) return res.status(400).json({ message: 'title and assigned_to required' });
  const assignee = await User.findByPk(assigned_to);
  if (!assignee) return res.status(400).json({ message: 'Invalid assignee' });
  const row = await Task.create({ title, description, assigned_to, assigned_by: req.user.id, due_date, priority });
  res.status(201).json(row);
};

exports.update = async (req, res) => {
  const row = await Task.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: 'Not found' });
  // Assignee can update status; assigner can update everything; Management can manage
  const isAssignee = row.assigned_to === req.user.id;
  const isAssigner = row.assigned_by === req.user.id;
  if (!(isAssignee || isAssigner || req.user.role === 'Management')) return res.status(403).json({ message: 'Forbidden' });
  const allowed = isAssignee ? { status: req.body.status } : req.body;
  await row.update(allowed);
  res.json(row);
};

exports.remove = async (req, res) => {
  const row = await Task.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: 'Not found' });
  const isAssigner = row.assigned_by === req.user.id || req.user.role === 'Management';
  if (!isAssigner) return res.status(403).json({ message: 'Forbidden' });
  await row.destroy();
  res.json({ message: 'Deleted' });
};
