const { DataTypes } = require('sequelize');
const { sequelize } = require('../setup/db');

// Models
const Role = require('./role.model')(sequelize, DataTypes);
const User = require('./user.model')(sequelize, DataTypes);
const Staff = require('./staff.model')(sequelize, DataTypes);
const KMI = require('./kmi.model')(sequelize, DataTypes);
const KPI = require('./kpi.model')(sequelize, DataTypes);
const KAI = require('./kai.model')(sequelize, DataTypes);
const Task = require('./task.model')(sequelize, DataTypes);
const Ticket = require('./ticket.model')(sequelize, DataTypes);
const Leave = require('./leave.model')(sequelize, DataTypes);
const Goal = require('./goal.model')(sequelize, DataTypes);
const Department = require('./department.model')(sequelize, DataTypes);
const Designation = require('./designation.model')(sequelize, DataTypes);
const Association = require('./association.model')(sequelize, DataTypes);

// Associations per spec
Role.hasMany(User);
User.belongsTo(Role);

User.hasOne(Staff);
Staff.belongsTo(User);

// Master data: Staff belongs to Department and Designation (optional)
Department.hasMany(Staff, { foreignKey: 'department_id' });
Designation.hasMany(Staff, { foreignKey: 'designation_id' });
Staff.belongsTo(Department, { foreignKey: 'department_id', as: 'Department' });
Staff.belongsTo(Designation, { foreignKey: 'designation_id', as: 'Designation' });

KMI.hasMany(KPI);
KPI.belongsTo(KMI);

KPI.hasMany(KAI);
KAI.belongsTo(KPI);

User.hasMany(Task, { as: 'AssignedTasks', foreignKey: 'assigned_to' });
User.hasMany(Task, { as: 'CreatedTasks', foreignKey: 'assigned_by' });
Task.belongsTo(User, { as: 'Assignee', foreignKey: 'assigned_to' });
Task.belongsTo(User, { as: 'Assigner', foreignKey: 'assigned_by' });

User.hasMany(Leave);
Leave.belongsTo(User);

User.hasMany(Ticket, { as: 'CreatedTickets', foreignKey: 'created_by' });
User.hasMany(Ticket, { as: 'AssignedTickets', foreignKey: 'assigned_to' });
Ticket.belongsTo(User, { as: 'Creator', foreignKey: 'created_by' });
Ticket.belongsTo(User, { as: 'Owner', foreignKey: 'assigned_to' });

// Optional: Goal ownership
Goal.belongsTo(User, { as: 'Owner', foreignKey: 'owner_user_id' });
User.hasMany(Goal, { as: 'OwnedGoals', foreignKey: 'owner_user_id' });

module.exports = {
  sequelize,
  Role,
  User,
  Staff,
  KMI,
  KPI,
  KAI,
  Task,
  Ticket,
  Leave,
  Goal,
  Department,
  Designation,
  Association,
};
