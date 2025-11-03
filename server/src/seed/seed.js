require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Role, User, Staff, KMI, KPI, KAI, Task, Ticket, Leave, Goal } = require('../models');

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    // Roles
    const roleNames = ['Management', 'Manager', 'Employee', 'HR'];
    const roles = {};
    for (const name of roleNames) {
      const [row] = await Role.findOrCreate({ where: { name }, defaults: { name } });
      roles[name] = row;
    }

    // Users
    const usersData = [
      { name: 'Mgmt User', email: 'mgmt@example.com', role: 'Management' },
      { name: 'Dept Manager', email: 'manager@example.com', role: 'Manager' },
      { name: 'Employee One', email: 'employee@example.com', role: 'Employee' },
      { name: 'HR User', email: 'hr@example.com', role: 'HR' },
    ];
    const users = {};
    for (const u of usersData) {
      const [user] = await User.findOrCreate({
        where: { email: u.email },
        defaults: { name: u.name, email: u.email, password: await bcrypt.hash('password123', 10), RoleId: roles[u.role].id }
      });
      users[u.role] = user;
    }

    // Staff for Manager and Employee
    await Staff.findOrCreate({ where: { emp_id: 'MGR001' }, defaults: { emp_id: 'MGR001', name: users['Manager'].name, designation: 'Dept Head', department: 'Production', salary: 90000, UserId: users['Manager'].id } });
    await Staff.findOrCreate({ where: { emp_id: 'EMP001' }, defaults: { emp_id: 'EMP001', name: users['Employee'].name, designation: 'Engineer', department: 'Production', salary: 50000, UserId: users['Employee'].id } });

    // KMI
    const kmi = await KMI.create({ description: 'Improve OEE to 85%', start_date: '2025-08-01', end_date: '2025-12-31', status: 'In Progress', notes: 'Company-wide initiative', created_by: users['Management'].id });

    // KPI
    const kpi = await KPI.create({ kmi_id: kmi.id, description: 'Reduce downtime by 20%', start_date: '2025-08-15', end_date: '2025-12-15', status: 'In Progress', notes: 'Maintenance dept', created_by: users['Manager'].id });

    // KAI
    await KAI.create({ kpi_id: kpi.id, description: 'Implement preventive maintenance schedule', start_date: '2025-09-01', end_date: '2025-10-31', status: 'In Progress', notes: 'PM rollout', created_by: users['Manager'].id });

    // Tasks
    await Task.create({ title: 'Quick fix for Machine A', description: 'Vibration issue', assigned_to: users['Employee'].id, assigned_by: users['Manager'].id, due_date: '2025-09-05', priority: 'High', status: 'In Progress' });

    // Tickets
    await Ticket.create({ title: 'Machine B breakdown', description: 'Hydraulic failure', department: 'Production', assigned_to: users['Manager'].id, created_by: users['Employee'].id, status: 'Open' });

    // Leaves
    await Leave.create({ user_id: users['Employee'].id, from_date: '2025-09-10', to_date: '2025-09-12', alternate_person: 'John D', available_on_phone: true, status: 'Pending', credited_days: 2.0 });

    // Goals
    await Goal.create({ title: 'Complete 5S audit', description: 'For Assembly line', owner_user_id: users['Manager'].id, target_date: '2025-10-20', completion_percent: 40, status: 'In Progress' });

    console.log('Seed completed.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
})();
