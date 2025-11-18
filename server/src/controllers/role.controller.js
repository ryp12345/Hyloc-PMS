const { Role } = require('../models');

module.exports = {
  async create(req, res) {
    try {
      const role = await Role.create(req.body);
      res.status(201).json(role);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async findAll(req, res) {
    try {
      const roles = await Role.findAll();
      res.json(roles);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async findOne(req, res) {
    try {
      const role = await Role.findByPk(req.params.id);
      if (!role) return res.status(404).json({ error: 'Not found' });
      res.json(role);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const role = await Role.findByPk(req.params.id);
      if (!role) return res.status(404).json({ error: 'Not found' });
      await role.update(req.body);
      res.json(role);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      const role = await Role.findByPk(req.params.id);
      if (!role) return res.status(404).json({ error: 'Not found' });
      await role.destroy();
      res.json({ message: 'Deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
