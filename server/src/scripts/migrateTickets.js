/**
 * Migration script to update tickets table with new fields
 * Run this script to add new columns to existing tickets table
 */

const { sequelize } = require('../setup/db');
const { QueryTypes } = require('sequelize');

async function migrateTickets() {
  try {
    console.log('Starting tickets table migration...');

    // Check if tickets table exists
    const [tables] = await sequelize.query(
      "SHOW TABLES LIKE 'tickets'",
      { type: QueryTypes.SELECT }
    );

    if (!tables || Object.keys(tables).length === 0) {
      console.log('Tickets table does not exist. It will be created when server starts.');
      return;
    }

    // Get current columns
    const columns = await sequelize.query(
      "SHOW COLUMNS FROM tickets",
      { type: QueryTypes.SELECT }
    );

    const columnNames = columns.map(col => col.Field);
    console.log('Current columns:', columnNames);

    // Add new columns if they don't exist
    const migrations = [
      {
        column: 'category',
        sql: "ALTER TABLE tickets ADD COLUMN category ENUM('Machine Breakdown', 'Equipment Failure', 'System Issue', 'Safety Incident', 'Maintenance', 'Other') DEFAULT 'Other' AFTER description"
      },
      {
        column: 'priority',
        sql: "ALTER TABLE tickets ADD COLUMN priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium' AFTER category"
      },
      {
        column: 'department_id',
        sql: "ALTER TABLE tickets ADD COLUMN department_id INT AFTER priority"
      },
      {
        column: 'responsible_person',
        sql: "ALTER TABLE tickets ADD COLUMN responsible_person CHAR(36) AFTER assigned_to"
      },
      {
        column: 'resolution_notes',
        sql: "ALTER TABLE tickets ADD COLUMN resolution_notes TEXT AFTER status"
      },
      {
        column: 'resolved_at',
        sql: "ALTER TABLE tickets ADD COLUMN resolved_at DATETIME AFTER resolution_notes"
      },
      {
        column: 'closed_at',
        sql: "ALTER TABLE tickets ADD COLUMN closed_at DATETIME AFTER resolved_at"
      },
      {
        column: 'estimated_time',
        sql: "ALTER TABLE tickets ADD COLUMN estimated_time VARCHAR(100) AFTER closed_at"
      },
      {
        column: 'actual_taken_time',
        sql: "ALTER TABLE tickets ADD COLUMN actual_taken_time VARCHAR(100) AFTER estimated_time"
      },
      {
        column: 'attachment_url',
        sql: "ALTER TABLE tickets ADD COLUMN attachment_url VARCHAR(500) AFTER actual_taken_time"
      },
      {
        column: 'updated_at',
        sql: "ALTER TABLE tickets ADD COLUMN updated_at DATETIME AFTER created_at"
      }
    ];

    for (const migration of migrations) {
      if (!columnNames.includes(migration.column)) {
        console.log(`Adding column: ${migration.column}`);
        await sequelize.query(migration.sql);
        console.log(`✓ Added ${migration.column}`);
      } else {
        console.log(`✓ Column ${migration.column} already exists`);
      }
    }

    // Update status ENUM to include new values
    console.log('Updating status ENUM values...');
    await sequelize.query(`
      ALTER TABLE tickets 
      MODIFY COLUMN status ENUM('Open', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Closed') 
      DEFAULT 'Open'
    `);
    console.log('✓ Updated status ENUM');

    console.log('\n✅ Migration completed successfully!');
    console.log('The tickets table has been updated with new fields.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run migration
migrateTickets()
  .then(() => {
    console.log('\nMigration script finished.');
    process.exit(0);
  })
  .catch(err => {
    console.error('\nMigration script failed:', err);
    process.exit(1);
  });
