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
const Milestone = require('./milestone.model')(sequelize, DataTypes);
const Department = require('./department.model')(sequelize, DataTypes);
const Designation = require('./designation.model')(sequelize, DataTypes);
const Association = require('./association.model')(sequelize, DataTypes);
const Qualification = require('./qualification.model')(sequelize, DataTypes);

// Junction table models
const DepartmentStaff = require('./department_staff.model')(sequelize, DataTypes);
const DesignationStaff = require('./designation_staff.model')(sequelize, DataTypes);
const AssociationStaff = require('./association_staff.model')(sequelize, DataTypes);

// Associations per spec
// Use snake_case FKs to match DB columns
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

User.hasOne(Staff, { foreignKey: 'user_id', onDelete: 'CASCADE', hooks: true });
Staff.belongsTo(User, { foreignKey: 'user_id' });

// Master data relations
// Staff has many Departments via join table department_staff
Department.belongsToMany(Staff, {
  through: DepartmentStaff,
  foreignKey: 'department_id',
  otherKey: 'staff_id',
  as: 'StaffMembers',
  onDelete: 'CASCADE',
  hooks: true
});
Staff.belongsToMany(Department, {
  through: DepartmentStaff,
  foreignKey: 'staff_id',
  otherKey: 'department_id',
  as: 'Departments',
  onDelete: 'CASCADE',
  hooks: true
});

// Staff has many Designations via join table designation_staff
Designation.belongsToMany(Staff, {
  through: DesignationStaff,
  foreignKey: 'designation_id',
  otherKey: 'staff_id',
  as: 'StaffMembers',
  onDelete: 'CASCADE',
  hooks: true
});
Staff.belongsToMany(Designation, {
  through: DesignationStaff,
  foreignKey: 'staff_id',
  otherKey: 'designation_id',
  as: 'Designations',
  onDelete: 'CASCADE',
  hooks: true
});

// Staff has many Associations via join table association_staff
Association.belongsToMany(Staff, {
  through: AssociationStaff,
  foreignKey: 'association_id',
  otherKey: 'staff_id',
  as: 'StaffMembers',
  onDelete: 'CASCADE',
  hooks: true
});
Staff.belongsToMany(Association, {
  through: AssociationStaff,
  foreignKey: 'staff_id',
  otherKey: 'association_id',
  as: 'Associations',
  onDelete: 'CASCADE',
  hooks: true
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

// Goal-Milestone association
Goal.hasMany(Milestone, { as: 'milestones', foreignKey: 'goal_id', onDelete: 'CASCADE' });
Milestone.belongsTo(Goal, { as: 'Goal', foreignKey: 'goal_id' });

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
  Milestone,
  Department,
  Designation,
  Association,
  Qualification,
  DepartmentStaff,
  DesignationStaff,
  AssociationStaff,
};
