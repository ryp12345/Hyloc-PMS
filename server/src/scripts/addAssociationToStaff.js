const { sequelize } = require('../setup/db');

async function addAssociationToStaff() {
  try {
    console.log('Adding association_id to staff table...');

    // Add association_id column to staff table
    await sequelize.query(`
      ALTER TABLE staff 
      ADD COLUMN IF NOT EXISTS association_id INTEGER REFERENCES "Associations"(id);
    `);

    console.log('✅ Successfully added association_id column to staff table');

    // Optional: Create index for better query performance
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_staff_association_id ON staff(association_id);
    `);

    console.log('✅ Successfully created index on association_id');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run migration
if (require.main === module) {
  addAssociationToStaff()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addAssociationToStaff;
