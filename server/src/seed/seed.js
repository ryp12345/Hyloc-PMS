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
      { email: 'mgmt@gmail.com', role: 'Management', firstName: 'Mgmt', lastName: 'User' },
      { email: 'manager@gmail.com', role: 'Manager', firstName: 'Dept', lastName: 'Manager' },
      { email: 'employee@gmail.com', role: 'Employee', firstName: 'Employee', lastName: 'One' },
      { email: 'hr@gmail.com', role: 'HR', firstName: 'HR', lastName: 'User' },
    ];
    const users = {};
    for (const u of usersData) {
      const [user] = await User.findOrCreate({
        where: { email: u.email },
        defaults: { email: u.email, password: await bcrypt.hash('password123', 10), RoleId: roles[u.role].id }
      });
      users[u.role] = { user, firstName: u.firstName, lastName: u.lastName };
    }

    // Staff for Manager and Employee
    await Staff.findOrCreate({ 
      where: { emp_id: 'MGR001' }, 
      defaults: { 
        emp_id: 'MGR001', 
        first_name: users['Manager'].firstName,
        last_name: users['Manager'].lastName,
        designation: 'Dept Head', 
        department: 'Production', 
        salary: 90000, 
        user_id: users['Manager'].user.id 
      } 
    });
    await Staff.findOrCreate({ 
      where: { emp_id: 'EMP001' }, 
      defaults: { 
        emp_id: 'EMP001', 
        first_name: users['Employee'].firstName,
        last_name: users['Employee'].lastName,
        designation: 'Engineer', 
        department: 'Production', 
        salary: 50000, 
        user_id: users['Employee'].user.id 
      } 
    });

    // KMI
    const kmi = await KMI.create({ description: 'Improve OEE to 85%', start_date: '2025-08-01', end_date: '2025-12-31', status: 'In Progress', notes: 'Company-wide initiative', created_by: users['Management'].user.id });

    // KPI
    const kpi = await KPI.create({ kmi_id: kmi.id, description: 'Reduce downtime by 20%', start_date: '2025-08-15', end_date: '2025-12-15', status: 'In Progress', notes: 'Maintenance dept', created_by: users['Manager'].user.id });

    // KAI
    await KAI.create({ kpi_id: kpi.id, description: 'Implement preventive maintenance schedule', start_date: '2025-09-01', end_date: '2025-10-31', status: 'In Progress', notes: 'PM rollout', created_by: users['Manager'].user.id });

    // Tasks
    await Task.create({ title: 'Quick fix for Machine A', description: 'Vibration issue', assigned_to: users['Employee'].user.id, assigned_by: users['Manager'].user.id, due_date: '2025-09-05', priority: 'High', status: 'In Progress' });

    // Tickets
    await Ticket.create({ title: 'Machine B breakdown', description: 'Hydraulic failure', department: 'Production', assigned_to: users['Manager'].user.id, created_by: users['Employee'].user.id, status: 'Open' });

    // Leaves
    await Leave.create({ user_id: users['Employee'].user.id, from_date: '2025-09-10', to_date: '2025-09-12', alternate_person: 'John D', available_on_phone: true, status: 'Pending', credited_days: 2.0 });

    // Goals
    await Goal.create({ title: 'Complete 5S audit', description: 'For Assembly line', owner_user_id: users['Manager'].user.id, target_date: '2025-10-20', completion_percent: 40, status: 'In Progress' });

    console.log('Seed completed.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
})();
