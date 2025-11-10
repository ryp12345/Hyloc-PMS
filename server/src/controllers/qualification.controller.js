const { Qualification } = require('../models');

module.exports = {
  async create(req, res) {
    try {
      const data = { ...req.body };
      const qualification = await Qualification.create(data);
      res.status(201).json(qualification);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async findAll(req, res) {
    try {
      const qualifications = await Qualification.findAll();
      res.json(qualifications);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async findOne(req, res) {
    try {
      const qualification = await Qualification.findByPk(req.params.id);
      if (!qualification) return res.status(404).json({ error: 'Not found' });
      res.json(qualification);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const qualification = await Qualification.findByPk(req.params.id);
      if (!qualification) return res.status(404).json({ error: 'Not found' });
      const data = { ...req.body };
      await qualification.update(data);
      res.json(qualification);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      const qualification = await Qualification.findByPk(req.params.id);
      if (!qualification) return res.status(404).json({ error: 'Not found' });
      await qualification.destroy();
      res.json({ message: 'Deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
