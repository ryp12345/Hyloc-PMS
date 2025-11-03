const { KPI, KMI } = require('../models');

exports.list = async (req, res) => {
  // Management, Managers, and Employees can see all KPIs
  // (Employees need to see KPIs to create KAIs under them)
  const where = ['Management', 'Manager', 'Employee'].includes(req.user.role) ? {} : { created_by: req.user.id };
  const rows = await KPI.findAll({ where });
  res.json(rows);
};

exports.get = async (req, res) => {
  const row = await KPI.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: 'Not found' });
  if (req.user.role !== 'Management' && row.created_by !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  res.json(row);
};

exports.create = async (req, res) => {
  // Department Heads (Managers) create; reviewed by Management
  if (!['Manager','Management'].includes(req.user.role)) return res.status(403).json({ message: 'Only Managers/Management can create KPI' });
  const { kmi_id } = req.body;
  const kmi = await KMI.findByPk(kmi_id);
  if (!kmi) return res.status(400).json({ message: 'Invalid KMI' });
  const row = await KPI.create({ ...req.body, created_by: req.user.id });
  res.status(201).json(row);
};

exports.update = async (req, res) => {
  const row = await KPI.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: 'Not found' });
  if (!['Manager','Management'].includes(req.user.role) && row.created_by !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  await row.update(req.body);
  res.json(row);
};

exports.remove = async (req, res) => {
  const row = await KPI.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: 'Not found' });
  if (!['Manager','Management'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  await row.destroy();
  res.json({ message: 'Deleted' });
};
