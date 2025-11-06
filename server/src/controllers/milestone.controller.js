const { Milestone, Goal } = require('../models');

exports.create = async (req, res) => {
  try {
    const { goal_id, from_date, to_date } = req.body;
    
    // Verify parent goal exists
    const goal = await Goal.findByPk(goal_id);
    if (!goal) {
      return res.status(404).json({ message: 'Parent goal not found' });
    }
    
    // Validate date range
    if (from_date && to_date && new Date(from_date) > new Date(to_date)) {
      return res.status(400).json({ message: 'from_date must be before or equal to to_date' });
    }
    
    const milestone = await Milestone.create(req.body);
    res.status(201).json(milestone);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.findAll = async (req, res) => {
  try {
    const { goal_id, status } = req.query;
    const where = {};
    if (goal_id) where.goal_id = goal_id;
    if (status) where.status = status;

    const milestones = await Milestone.findAll({
      where,
      include: [
        { model: Goal, as: 'Goal', attributes: ['id', 'title', 'status', 'priority'], required: false }
      ],
      order: [['from_date', 'ASC']]
    });
    res.json(milestones);
  } catch (error) {
    console.error('Error in findAll milestones:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.findOne = async (req, res) => {
  try {
    const milestone = await Milestone.findByPk(req.params.id, {
      include: [
        { model: Goal, as: 'Goal', required: false }
      ]
    });
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    res.json(milestone);
  } catch (error) {
    console.error('Error in findOne milestone:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const milestone = await Milestone.findByPk(req.params.id);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    
    // Validate date range if dates are being updated
    const from_date = req.body.from_date || milestone.from_date;
    const to_date = req.body.to_date || milestone.to_date;
    if (new Date(from_date) > new Date(to_date)) {
      return res.status(400).json({ message: 'from_date must be before or equal to to_date' });
    }
    
    await milestone.update(req.body);
    const updated = await Milestone.findByPk(req.params.id, {
      include: [{ model: Goal, as: 'Goal', required: false }]
    });
    res.json(updated);
  } catch (error) {
    console.error('Error in update milestone:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const milestone = await Milestone.findByPk(req.params.id);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    await milestone.destroy();
    res.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
