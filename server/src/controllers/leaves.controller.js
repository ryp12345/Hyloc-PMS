const { Leave, User } = require('../models');

exports.apply = async (req, res) => {
  const payload = { ...req.body, user_id: req.user.id };
  const row = await Leave.create(payload);
  res.status(201).json(row);
};

exports.myLeaves = async (req, res) => {
  const rows = await Leave.findAll({ where: { user_id: req.user.id }, order: [['created_at', 'DESC']] });
  res.json(rows);
};

exports.allLeaves = async (req, res) => {
  if (!['Manager','Management','HR'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  const rows = await Leave.findAll({ 
    include: [{ model: User, attributes: ['name', 'email'] }],
    order: [['created_at', 'DESC']] 
  });
  res.json(rows);
};

exports.approve = async (req, res) => {
  if (!['Manager','Management','HR'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  const row = await Leave.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: 'Not found' });
  await row.update({ status: 'Approved', approved_by: req.user.id });
  res.json(row);
};

exports.reject = async (req, res) => {
  if (!['Manager','Management','HR'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  const row = await Leave.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: 'Not found' });
  await row.update({ status: 'Rejected', approved_by: req.user.id });
  res.json(row);
};

exports.update = async (req, res) => {
  const row = await Leave.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: 'Not found' });
  
  // Only the user who created it can update, and only if status is Pending
  if (row.user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  if (row.status !== 'Pending') return res.status(400).json({ message: 'Can only update pending leaves' });
  
  await row.update(req.body);
  res.json(row);
};

exports.remove = async (req, res) => {
  const row = await Leave.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: 'Not found' });
  
  // Only the user who created it can delete, and only if status is Pending
  if (row.user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  if (row.status !== 'Pending') return res.status(400).json({ message: 'Can only delete pending leaves' });
  
  await row.destroy();
  res.json({ message: 'Deleted' });
};
