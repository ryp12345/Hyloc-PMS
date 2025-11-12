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
const Qualification = require('./qualification.model')(sequelize, DataTypes);

// Associations per spec
// Use snake_case FKs to match DB columns
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

User.hasOne(Staff, { foreignKey: 'user_id' });
Staff.belongsTo(User, { foreignKey: 'user_id' });

// Master data relations
// Staff belongs to Department via department_id
Department.hasMany(Staff, { foreignKey: 'department_id' });
Staff.belongsTo(Department, { foreignKey: 'department_id', as: 'Department' });

// Staff has many Designations via join table designation_staff
Designation.belongsToMany(Staff, {
  through: 'designation_staff',
  foreignKey: 'designation_id',
  otherKey: 'staff_id',
  as: 'StaffMembers'
});
Staff.belongsToMany(Designation, {
  through: 'designation_staff',
  foreignKey: 'staff_id',
  otherKey: 'designation_id',
  as: 'Designations'
});

// Staff has many Associations via join table association_staff
Association.belongsToMany(Staff, {
  through: 'association_staff',
  foreignKey: 'association_id',
  otherKey: 'staff_id',
  as: 'StaffMembers'
});
Staff.belongsToMany(Association, {
  through: 'association_staff',
  foreignKey: 'staff_id',
  otherKey: 'association_id',
  as: 'Associations'
});

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

// Goal-Department association
Goal.belongsTo(Department, { as: 'Department', foreignKey: 'department_id' });
Department.hasMany(Goal, { as: 'Goals', foreignKey: 'department_id' });

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
  Qualification,
};
