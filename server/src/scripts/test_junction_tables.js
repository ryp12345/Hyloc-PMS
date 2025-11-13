/**
 * Script to test junction tables: department_staff, designation_staff, association_staff
 * This will verify that the tables can store data correctly
 */

require('dotenv').config();
const { 
  sequelize, 
  Staff, 
  Department, 
  Designation, 
  Association,
  DepartmentStaff,
  DesignationStaff,
  AssociationStaff 
} = require('../models');

async function testJunctionTables() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connected\n');

    // Sync models (create tables if they don't exist)
    console.log('Syncing junction table models...');
    await DepartmentStaff.sync({ alter: true });
    await DesignationStaff.sync({ alter: true });
    await AssociationStaff.sync({ alter: true });
    console.log('✓ Junction tables synced\n');

    // Test 1: Check if we can query existing data
    console.log('Test 1: Querying existing staff with departments...');
    const staffWithDepts = await Staff.findAll({
      include: [
        { 
          model: Department, 
          as: 'Departments',
          through: { attributes: ['start_date', 'end_date'] }
        }
      ],
      limit: 5
    });
    console.log(`✓ Found ${staffWithDepts.length} staff members`);
    staffWithDepts.forEach(staff => {
      console.log(`  - Staff ID ${staff.id}: ${staff.name}, Departments: ${staff.Departments?.length || 0}`);
      if (staff.Departments && staff.Departments.length > 0) {
        staff.Departments.forEach(dept => {
          console.log(`    → ${dept.dept_name} (start: ${dept.DepartmentStaff?.start_date || 'N/A'}, end: ${dept.DepartmentStaff?.end_date || 'N/A'})`);
        });
      }
    });
    console.log('');

    // Test 2: Check designations
    console.log('Test 2: Querying existing staff with designations...');
    const staffWithDesig = await Staff.findAll({
      include: [
        { 
          model: Designation, 
          as: 'Designations',
          through: { attributes: ['start_date', 'end_date'] }
        }
      ],
      limit: 5
    });
    console.log(`✓ Found ${staffWithDesig.length} staff members`);
    staffWithDesig.forEach(staff => {
      console.log(`  - Staff ID ${staff.id}: ${staff.name}, Designations: ${staff.Designations?.length || 0}`);
      if (staff.Designations && staff.Designations.length > 0) {
        staff.Designations.forEach(desig => {
          console.log(`    → ${desig.name} (start: ${desig.DesignationStaff?.start_date || 'N/A'}, end: ${desig.DesignationStaff?.end_date || 'N/A'})`);
        });
      }
    });
    console.log('');

    // Test 3: Check associations
    console.log('Test 3: Querying existing staff with associations...');
    const staffWithAssoc = await Staff.findAll({
      include: [
        { 
          model: Association, 
          as: 'Associations',
          through: { attributes: ['start_date', 'end_date'] }
        }
      ],
      limit: 5
    });
    console.log(`✓ Found ${staffWithAssoc.length} staff members`);
    staffWithAssoc.forEach(staff => {
      console.log(`  - Staff ID ${staff.id}: ${staff.name}, Associations: ${staff.Associations?.length || 0}`);
      if (staff.Associations && staff.Associations.length > 0) {
        staff.Associations.forEach(assoc => {
          console.log(`    → ${assoc.asso_name} (start: ${assoc.AssociationStaff?.start_date || 'N/A'}, end: ${assoc.AssociationStaff?.end_date || 'N/A'})`);
        });
      }
    });
    console.log('');

    // Test 4: Check raw junction table data
    console.log('Test 4: Querying raw junction table data...');
    const deptStaffCount = await DepartmentStaff.count();
    const desigStaffCount = await DesignationStaff.count();
    const assocStaffCount = await AssociationStaff.count();
    console.log(`✓ department_staff records: ${deptStaffCount}`);
    console.log(`✓ designation_staff records: ${desigStaffCount}`);
    console.log(`✓ association_staff records: ${assocStaffCount}`);
    console.log('');

    // Show sample records
    if (deptStaffCount > 0) {
      const sampleDeptStaff = await DepartmentStaff.findAll({ limit: 3 });
      console.log('Sample department_staff records:');
      sampleDeptStaff.forEach(record => {
        console.log(`  ID: ${record.id}, staff_id: ${record.staff_id}, department_id: ${record.department_id}, start: ${record.start_date}, end: ${record.end_date}`);
      });
    }
    console.log('');

    console.log('✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

testJunctionTables();
