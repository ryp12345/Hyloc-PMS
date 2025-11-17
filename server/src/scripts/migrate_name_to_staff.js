/**
 * Migration Script: Remove name from users table and staff table,
 * add first_name, middle_name, last_name to staff table
 * 
 * This script:
 * 1. Adds first_name, middle_name, last_name columns to staff table
 * 2. Migrates existing name data by splitting into first/middle/last names
 * 3. Removes name column from staff table
 * 4. Removes name column from users table
 */

const { sequelize } = require('../models');

async function migrateNameFields() {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    console.log('Starting name field migration...\n');

    // Step 1: Add new name columns to staff table
    console.log('Step 1: Adding first_name, middle_name, last_name columns to staff table...');
    
    const staffTableDesc = await queryInterface.describeTable('staff');
    
    if (!staffTableDesc.first_name) {
      await queryInterface.addColumn('staff', 'first_name', {
        type: sequelize.Sequelize.STRING(100),
        allowNull: true
      });
      console.log('✓ Added first_name column');
    } else {
      console.log('✓ first_name column already exists');
    }

    if (!staffTableDesc.middle_name) {
      await queryInterface.addColumn('staff', 'middle_name', {
        type: sequelize.Sequelize.STRING(100),
        allowNull: true
      });
      console.log('✓ Added middle_name column');
    } else {
      console.log('✓ middle_name column already exists');
    }

    if (!staffTableDesc.last_name) {
      await queryInterface.addColumn('staff', 'last_name', {
        type: sequelize.Sequelize.STRING(100),
        allowNull: true
      });
      console.log('✓ Added last_name column');
    } else {
      console.log('✓ last_name column already exists');
    }

    // Step 2: Migrate existing name data from staff table
    console.log('\nStep 2: Migrating existing name data in staff table...');
    
    if (staffTableDesc.name) {
      const [staffRecords] = await sequelize.query(
        'SELECT id, name FROM staff WHERE name IS NOT NULL AND name != ""'
      );

      console.log(`Found ${staffRecords.length} staff records with names to migrate`);

      for (const staff of staffRecords) {
        const nameParts = staff.name.trim().split(/\s+/);
        
        let firstName = '';
        let middleName = '';
        let lastName = '';

        if (nameParts.length === 1) {
          firstName = nameParts[0];
        } else if (nameParts.length === 2) {
          firstName = nameParts[0];
          lastName = nameParts[1];
        } else if (nameParts.length >= 3) {
          firstName = nameParts[0];
          lastName = nameParts[nameParts.length - 1];
          middleName = nameParts.slice(1, -1).join(' ');
        }

        await sequelize.query(
          'UPDATE staff SET first_name = ?, middle_name = ?, last_name = ? WHERE id = ?',
          {
            replacements: [firstName, middleName, lastName, staff.id]
          }
        );
      }

      console.log(`✓ Migrated ${staffRecords.length} staff names`);
    }

    // Step 3: Remove name column from staff table
    console.log('\nStep 3: Removing name column from staff table...');
    
    if (staffTableDesc.name) {
      await queryInterface.removeColumn('staff', 'name');
      console.log('✓ Removed name column from staff table');
    } else {
      console.log('✓ name column already removed from staff table');
    }

    // Step 4: Remove name column from users table
    console.log('\nStep 4: Removing name column from users table...');
    
    const usersTableDesc = await queryInterface.describeTable('users');
    
    if (usersTableDesc.name) {
      await queryInterface.removeColumn('users', 'name');
      console.log('✓ Removed name column from users table');
    } else {
      console.log('✓ name column already removed from users table');
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\nSummary:');
    console.log('- Added first_name, middle_name, last_name to staff table');
    console.log('- Migrated existing name data');
    console.log('- Removed name from staff table');
    console.log('- Removed name from users table');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
if (require.main === module) {
  migrateNameFields()
    .then(() => {
      console.log('\nClosing database connection...');
      process.exit(0);
    })
    .catch(err => {
      console.error('Migration error:', err);
      process.exit(1);
    });
}

module.exports = migrateNameFields;
