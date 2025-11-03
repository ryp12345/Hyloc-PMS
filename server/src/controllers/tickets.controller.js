const { Ticket, User, Staff } = require('../models');

exports.list = async (req, res) => {
  // Show tickets created by me or assigned to me
  const rows = await Ticket.findAll({
    where: req.query.scope === 'assigned' ? { assigned_to: req.user.id } : { created_by: req.user.id },
    order: [['created_at', 'DESC']],
  });
  res.json(rows);
};

exports.create = async (req, res) => {
  const { title, description, department } = req.body;
  let assigned_to = null;
  // Auto-assign to department head (Manager) if possible
  if (department) {
    const manager = await User.findOne({
      include: [{ model: Staff, where: { department }, required: true }, 'Role'],
      where: {},
    });
    if (manager && manager.Role?.name === 'Manager') assigned_to = manager.id;
  }
  const row = await Ticket.create({ title, description, department, assigned_to, created_by: req.user.id });
  res.status(201).json(row);
};

exports.updateStatus = async (req, res) => {
  const row = await Ticket.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: 'Not found' });
  const can = req.user.role === 'Management' || req.user.role === 'Manager' || req.user.id === row.assigned_to || req.user.id === row.created_by;
  if (!can) return res.status(403).json({ message: 'Forbidden' });
  const { status, assigned_to } = req.body;
  await row.update({ status, assigned_to });
  res.json(row);
};
