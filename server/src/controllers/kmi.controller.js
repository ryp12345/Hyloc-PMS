const { KMI } = require('../models');

exports.list = async (req, res) => {
  // Management and Managers can see all KMIs (Managers need to select KMIs for creating KPIs)
  // Others see only those they created
  const where = ['Management', 'Manager'].includes(req.user.role) ? {} : { created_by: req.user.id };
  const rows = await KMI.findAll({ where });
  res.json(rows);
};

exports.get = async (req, res) => {
  const row = await KMI.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: 'Not found' });
  if (req.user.role !== 'Management' && row.created_by !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  res.json(row);
};

exports.create = async (req, res) => {
  if (req.user.role !== 'Management') return res.status(403).json({ message: 'Only Management can create KMI' });
  const payload = { ...req.body, created_by: req.user.id };
  const row = await KMI.create(payload);
  res.status(201).json(row);
};

exports.update = async (req, res) => {
  const row = await KMI.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: 'Not found' });
  if (req.user.role !== 'Management') return res.status(403).json({ message: 'Only Management can update KMI' });
  await row.update(req.body);
  res.json(row);
};

exports.remove = async (req, res) => {
  if (req.user.role !== 'Management') return res.status(403).json({ message: 'Only Management can delete KMI' });
  const row = await KMI.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: 'Not found' });
  await row.destroy();
  res.json({ message: 'Deleted' });
};
