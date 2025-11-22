/**
 * Migration: introduce user_roles and remove users.role_id
 * Usage: node src/scripts/migrate_user_roles.js
 */
require('dotenv').config();
const { sequelize } = require('../models');

async function migrate() {
  try {
    console.log('Starting migration: user_roles + drop users.role_id');

    // 1) Create user_roles table if not exists
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL DEFAULT 'Active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 2) Migrate existing data from users.role_id -> user_roles
    // Insert active assignments for any users that still have a role_id column
    const [{ rows: col }] = await sequelize.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='users' AND column_name='role_id';
    `);

    if (col && col.length > 0) {
      console.log('role_id column detected, migrating data to user_roles...');
      await sequelize.query(`
        INSERT INTO user_roles (user_id, role_id, status)
        SELECT id AS user_id, role_id, 'Active' AS status
        FROM users
        WHERE role_id IS NOT NULL;
      `);

      // 3) Drop users.role_id
      await sequelize.query(`
        ALTER TABLE users DROP COLUMN IF EXISTS role_id;
      `);
      console.log('Dropped users.role_id');
    } else {
      console.log('users.role_id already removed; skipping migration step.');
    }

    console.log('✅ Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
