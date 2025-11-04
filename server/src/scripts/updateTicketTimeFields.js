/**
 * Migration script to change time fields from numeric to text
 * This updates estimated_hours -> estimated_time and actual_hours -> actual_taken_time
 */

const { sequelize } = require('../setup/db');
const { QueryTypes } = require('sequelize');

async function updateTicketTimeFields() {
  try {
    console.log('Starting tickets time fields migration...');

    // Check if tickets table exists
    const tables = await sequelize.query(
      "SELECT tablename FROM pg_tables WHERE tablename = 'tickets'",
      { type: QueryTypes.SELECT }
    );

    if (!tables || tables.length === 0) {
      console.log('Tickets table does not exist. Run the main migration first.');
      return;
    }

    // Get current columns
    const columns = await sequelize.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'tickets'",
      { type: QueryTypes.SELECT }
    );

    const columnNames = columns.map(col => col.column_name);
    console.log('Current columns:', columnNames);

    // Step 1: Add new text columns if they don't exist
    if (!columnNames.includes('estimated_time')) {
      console.log('Adding estimated_time column...');
      await sequelize.query(
        "ALTER TABLE tickets ADD COLUMN estimated_time VARCHAR(100)"
      );
      console.log('✓ Added estimated_time column');
    }

    if (!columnNames.includes('actual_taken_time')) {
      console.log('Adding actual_taken_time column...');
      await sequelize.query(
        "ALTER TABLE tickets ADD COLUMN actual_taken_time VARCHAR(100)"
      );
      console.log('✓ Added actual_taken_time column');
    }

    // Step 2: Migrate data from old columns to new columns (if old columns exist)
    if (columnNames.includes('estimated_hours')) {
      console.log('Migrating estimated_hours data to estimated_time...');
      await sequelize.query(`
        UPDATE tickets 
        SET estimated_time = CONCAT(estimated_hours, ' hours')
        WHERE estimated_hours IS NOT NULL AND estimated_time IS NULL
      `);
      console.log('✓ Migrated estimated_hours data');
      
      console.log('Dropping estimated_hours column...');
      await sequelize.query("ALTER TABLE tickets DROP COLUMN estimated_hours");
      console.log('✓ Dropped estimated_hours column');
    }

    if (columnNames.includes('actual_hours')) {
      console.log('Migrating actual_hours data to actual_taken_time...');
      await sequelize.query(`
        UPDATE tickets 
        SET actual_taken_time = CONCAT(actual_hours, ' hours')
        WHERE actual_hours IS NOT NULL AND actual_taken_time IS NULL
      `);
      console.log('✓ Migrated actual_hours data');
      
      console.log('Dropping actual_hours column...');
      await sequelize.query("ALTER TABLE tickets DROP COLUMN actual_hours");
      console.log('✓ Dropped actual_hours column');
    }

    console.log('\n✅ Time fields migration completed successfully!');
    console.log('Tickets now use text-based time fields:');
    console.log('  - estimated_time (VARCHAR)');
    console.log('  - actual_taken_time (VARCHAR)');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run migration
updateTicketTimeFields()
  .then(() => {
    console.log('\nMigration script finished.');
    process.exit(0);
  })
  .catch(err => {
    console.error('\nMigration script failed:', err);
    process.exit(1);
  });
