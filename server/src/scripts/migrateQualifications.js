/**
 * Migration script to create/recreate qualifications table
 * Run this script to create the qualifications table if it was lost
 */

require('dotenv').config();
const { sequelize } = require('../setup/db');
const { QueryTypes } = require('sequelize');

async function migrateQualifications() {
  try {
    console.log('Starting qualifications table migration...');

    // Check if qualifications table exists
    const [tableExists] = await sequelize.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'qualifications'
      );`,
      { type: QueryTypes.SELECT }
    );

    if (tableExists.exists) {
      console.log('Qualifications table already exists.');
      
      // Get current columns
      const columns = await sequelize.query(
        `SELECT column_name 
         FROM information_schema.columns 
         WHERE table_name = 'qualifications'`,
        { type: QueryTypes.SELECT }
      );
      
      const columnNames = columns.map(col => col.column_name);
      console.log('Current columns:', columnNames);
      
    } else {
      console.log('Qualifications table does not exist. Creating table...');
      
      // Create the qualifications table
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS qualifications (
          id SERIAL PRIMARY KEY,
          qual_name VARCHAR(255) NOT NULL,
          qual_shortname VARCHAR(255) NOT NULL,
          status VARCHAR(255) NOT NULL DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `);
      
      console.log('✓ Created qualifications table');
    }

    // Ensure all required columns exist
    const requiredColumns = [
      {
        name: 'qual_name',
        sql: "ALTER TABLE qualifications ADD COLUMN qual_name VARCHAR(255) NOT NULL"
      },
      {
        name: 'qual_shortname',
        sql: "ALTER TABLE qualifications ADD COLUMN qual_shortname VARCHAR(255) NOT NULL"
      },
      {
        name: 'status',
        sql: "ALTER TABLE qualifications ADD COLUMN status VARCHAR(255) NOT NULL DEFAULT 'active'"
      },
      {
        name: 'created_at',
        sql: "ALTER TABLE qualifications ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()"
      },
      {
        name: 'updated_at',
        sql: "ALTER TABLE qualifications ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()"
      }
    ];

    // Get current columns again to check what's missing
    const columns = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'qualifications'`,
      { type: QueryTypes.SELECT }
    );
    
    const columnNames = columns.map(col => col.column_name);

    for (const column of requiredColumns) {
      if (!columnNames.includes(column.name)) {
        console.log(`Adding missing column: ${column.name}`);
        try {
          await sequelize.query(column.sql);
          console.log(`✓ Added ${column.name}`);
        } catch (err) {
          console.log(`⚠ Could not add ${column.name}: ${err.message}`);
        }
      } else {
        console.log(`✓ Column ${column.name} already exists`);
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('The qualifications table is ready to use.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run migration
migrateQualifications()
  .then(() => {
    console.log('\nMigration script finished.');
    process.exit(0);
  })
  .catch(err => {
    console.error('\nMigration script failed:', err);
    process.exit(1);
  });
