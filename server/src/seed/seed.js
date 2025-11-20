require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Role, User, Staff, UserRole } = require('../models');

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    // Ensure roles exist
    const roleNames = ['Management', 'Manager', 'Employee', 'HR'];
    const roles = {};
    for (const name of roleNames) {
      const [row] = await Role.findOrCreate({ where: { name }, defaults: { name } });
      roles[name] = row;
    }

    // Empty dependent tables: user_roles, staff, users
    await sequelize.transaction(async (t) => {
      await sequelize.query('TRUNCATE TABLE user_roles RESTART IDENTITY CASCADE;', { transaction: t });
      await sequelize.query('TRUNCATE TABLE staff RESTART IDENTITY CASCADE;', { transaction: t });
      await sequelize.query('DELETE FROM users;', { transaction: t });
    });

    // Seed a single HR user (new implementation)
    const email = 'hr@gmail.com';
    const password = await bcrypt.hash('password123', 10);
    const user = await User.create({ email, password });
    await UserRole.create({ user_id: user.id, role_id: roles['HR'].id, status: 'Active' });

    console.log('Seed completed: created HR user hr@gmail.com / password123');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
})();
