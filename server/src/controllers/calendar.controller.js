const { Task, Leave } = require('../models');

exports.events = async (req, res) => {
  const tasks = await Task.findAll({ where: { assigned_to: req.user.id } });
  const leaves = await Leave.findAll({ where: { user_id: req.user.id } });
  const events = [];
  for (const t of tasks) {
    if (t.due_date) {
      events.push({ id: `task-${t.id}`, title: `Task: ${t.title}`, date: t.due_date, extendedProps: { type: 'task', status: t.status } });
    }
  }
  for (const l of leaves) {
    events.push({ id: `leave-${l.id}`, title: `Leave (${l.status})`, start: l.from_date, end: l.to_date, allDay: true, extendedProps: { type: 'leave' } });
  }
  res.json(events);
};
