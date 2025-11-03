const { Designation } = require('../models');

module.exports = {
  async create(req, res) {
    try {
      const data = { ...req.body };
      if (data.end_date === '' || data.end_date === 'Invalid date') data.end_date = null;
      if (data.start_date === '' || data.start_date === 'Invalid date') data.start_date = null;
      const designation = await Designation.create(data);
      res.status(201).json(designation);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async findAll(req, res) {
    try {
      const designations = await Designation.findAll();
      res.json(designations);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async findOne(req, res) {
    try {
      const designation = await Designation.findByPk(req.params.id);
      if (!designation) return res.status(404).json({ error: 'Not found' });
      res.json(designation);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const designation = await Designation.findByPk(req.params.id);
      if (!designation) return res.status(404).json({ error: 'Not found' });
      const data = { ...req.body };
      if (data.end_date === '' || data.end_date === 'Invalid date') data.end_date = null;
      if (data.start_date === '' || data.start_date === 'Invalid date') data.start_date = null;
      await designation.update(data);
      res.json(designation);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      const designation = await Designation.findByPk(req.params.id);
      if (!designation) return res.status(404).json({ error: 'Not found' });
      await designation.destroy();
      res.json({ message: 'Deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
