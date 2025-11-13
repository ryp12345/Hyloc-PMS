const { Goal, User, Department } = require('../models');
const { sequelize } = require('../setup/db');

exports.create = async (req, res) => {
  try {
    const goalData = { ...req.body };
    if (!goalData.owner_user_id && req.user) {
      goalData.owner_user_id = req.user.id;
    }
    const goal = await Goal.create(goalData);
    res.status(201).json(goal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.findAll = async (req, res) => {
  try {
    const { department_id, status, priority } = req.query;
    const where = {};
    if (department_id) where.department_id = department_id;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const goals = await Goal.findAll({
      where,
      include: [
        { model: Department, as: 'Department', required: false },
        { model: User, as: 'Owner', attributes: ['id', 'name', 'email'], required: false }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(goals);
  } catch (error) {
    console.error('Error in findAll goals:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: error.message });
  }
};

exports.findOne = async (req, res) => {
  try {
    const goal = await Goal.findByPk(req.params.id, {
      include: [
        { model: Department, as: 'Department', required: false },
        { model: User, as: 'Owner', attributes: ['id', 'name', 'email'], required: false }
      ]
    });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.json(goal);
  } catch (error) {
    console.error('Error in findOne goal:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const goal = await Goal.findByPk(req.params.id);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    await goal.update(req.body);
    const updated = await Goal.findByPk(req.params.id, {
      include: [
        { model: Department, as: 'Department', required: false },
        { model: User, as: 'Owner', attributes: ['id', 'name', 'email'], required: false }
      ]
    });
    res.json(updated);
  } catch (error) {
    console.error('Error in update goal:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const goal = await Goal.findByPk(req.params.id);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    await goal.destroy();
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const { department_id } = req.query;
    const where = {};
    if (department_id) where.department_id = department_id;

    const stats = await Goal.findAll({
      attributes: [
        'status',
        'priority',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where,
      group: ['status', 'priority'],
      raw: true
    });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
