/**
 * Migration script to add new fields to the staff table
 * Run this script to update the database schema with new staff fields
 * 
 * Usage: node src/scripts/add_staff_fields_migration.js
 */

const { sequelize } = require('../models');

async function migrateStaffTable() {
  try {
    console.log('Starting migration: Adding new fields to staff table...');

    // Add new columns to staff table
    await sequelize.query(`
      ALTER TABLE staff 
      ADD COLUMN IF NOT EXISTS date_of_birth DATE,
      ADD COLUMN IF NOT EXISTS phone_no TEXT,
      ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10),
      ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS emergency_contact_number TEXT,
      ADD COLUMN IF NOT EXISTS emergency_contact_relation VARCHAR(50),
      ADD COLUMN IF NOT EXISTS pan_no VARCHAR(10),
      ADD COLUMN IF NOT EXISTS aadhar_no VARCHAR(12),
      ADD COLUMN IF NOT EXISTS date_of_joining DATE;
    `);

    console.log('✅ Migration completed successfully!');
    console.log('New fields added to staff table:');
    console.log('  - date_of_birth (DATE)');
    console.log('  - phone_no (TEXT)');
    console.log('  - blood_group (VARCHAR(10))');
    console.log('  - emergency_contact_name (VARCHAR(255))');
    console.log('  - emergency_contact_number (TEXT)');
    console.log('  - emergency_contact_relation (VARCHAR(50))');
    console.log('  - pan_no (VARCHAR(10))');
    console.log('  - aadhar_no (VARCHAR(12))');
    console.log('  - date_of_joining (DATE)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateStaffTable();
