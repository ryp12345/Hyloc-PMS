const { Association } = require('../models');

module.exports = {
  async create(req, res) {
    try {
      const association = await Association.create(req.body);
      res.status(201).json(association);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async findAll(req, res) {
    try {
      const associations = await Association.findAll();
      res.json(associations);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async findOne(req, res) {
    try {
      const association = await Association.findByPk(req.params.id);
      if (!association) return res.status(404).json({ error: 'Not found' });
      res.json(association);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const association = await Association.findByPk(req.params.id);
      if (!association) return res.status(404).json({ error: 'Not found' });
      await association.update(req.body);
      res.json(association);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      const association = await Association.findByPk(req.params.id);
      if (!association) return res.status(404).json({ error: 'Not found' });
      await association.destroy();
      res.json({ message: 'Deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
