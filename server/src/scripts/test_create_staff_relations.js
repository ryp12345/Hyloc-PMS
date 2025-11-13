/**
 * Script to test creating staff with junction table relationships
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
  AssociationStaff,
  User,
  Role
} = require('../models');

async function testCreateStaffWithRelations() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connected\n');

    // Get available departments, designations, and associations
    console.log('Fetching available master data...');
    const departments = await Department.findAll({ limit: 2 });
    const designations = await Designation.findAll({ limit: 2 });
    const associations = await Association.findAll({ limit: 2 });
    
    console.log(`✓ Found ${departments.length} departments`);
    console.log(`✓ Found ${designations.length} designations`);
    console.log(`✓ Found ${associations.length} associations\n`);

    if (departments.length === 0) {
      console.log('⚠️  No departments found. Please create departments first.');
      return;
    }

    // Get an existing staff to update
    const staff = await Staff.findOne();
    
    if (!staff) {
      console.log('⚠️  No staff found. Please create a staff member first.');
      return;
    }

    console.log(`Working with staff: ${staff.name} (ID: ${staff.id})\n`);

    const startDate = new Date().toISOString().split('T')[0];

    // Test 1: Assign departments
    if (departments.length > 0) {
      console.log('Test 1: Assigning departments...');
      const deptIds = departments.map(d => d.id);
      console.log(`  Department IDs: ${deptIds.join(', ')}`);
      
      await staff.setDepartments(deptIds, {
        through: { start_date: startDate, end_date: null }
      });
      console.log('✓ Departments assigned\n');

      // Verify
      const updated = await Staff.findByPk(staff.id, {
        include: [{ 
          model: Department, 
          as: 'Departments',
          through: { attributes: ['id', 'staff_id', 'department_id', 'start_date', 'end_date'] }
        }]
      });
      console.log(`  Verification: ${updated.Departments?.length || 0} departments found`);
      updated.Departments?.forEach(dept => {
        const through = dept.DepartmentStaff;
        console.log(`    → ${dept.dept_name}`);
        console.log(`      Junction data: ID=${through.id}, staff_id=${through.staff_id}, department_id=${through.department_id}, start=${through.start_date}, end=${through.end_date}`);
      });
      console.log('');
    }

    // Test 2: Assign designations
    if (designations.length > 0) {
      console.log('Test 2: Assigning designations...');
      const desigIds = designations.map(d => d.id);
      console.log(`  Designation IDs: ${desigIds.join(', ')}`);
      
      await staff.setDesignations(desigIds, {
        through: { start_date: startDate, end_date: null }
      });
      console.log('✓ Designations assigned\n');

      // Verify
      const updated = await Staff.findByPk(staff.id, {
        include: [{ 
          model: Designation, 
          as: 'Designations',
          through: { attributes: ['id', 'staff_id', 'designation_id', 'start_date', 'end_date'] }
        }]
      });
      console.log(`  Verification: ${updated.Designations?.length || 0} designations found`);
      updated.Designations?.forEach(desig => {
        const through = desig.DesignationStaff;
        console.log(`    → ${desig.name}`);
        console.log(`      Junction data: ID=${through.id}, staff_id=${through.staff_id}, designation_id=${through.designation_id}, start=${through.start_date}, end=${through.end_date}`);
      });
      console.log('');
    }

    // Test 3: Assign associations
    if (associations.length > 0) {
      console.log('Test 3: Assigning associations...');
      const assocIds = associations.map(a => a.id);
      console.log(`  Association IDs: ${assocIds.join(', ')}`);
      
      await staff.setAssociations(assocIds, {
        through: { start_date: startDate, end_date: null }
      });
      console.log('✓ Associations assigned\n');

      // Verify
      const updated = await Staff.findByPk(staff.id, {
        include: [{ 
          model: Association, 
          as: 'Associations',
          through: { attributes: ['id', 'staff_id', 'association_id', 'start_date', 'end_date'] }
        }]
      });
      console.log(`  Verification: ${updated.Associations?.length || 0} associations found`);
      updated.Associations?.forEach(assoc => {
        const through = assoc.AssociationStaff;
        console.log(`    → ${assoc.asso_name}`);
        console.log(`      Junction data: ID=${through.id}, staff_id=${through.staff_id}, association_id=${through.association_id}, start=${through.start_date}, end=${through.end_date}`);
      });
      console.log('');
    }

    // Check raw counts
    console.log('Final junction table counts:');
    console.log(`  department_staff: ${await DepartmentStaff.count()}`);
    console.log(`  designation_staff: ${await DesignationStaff.count()}`);
    console.log(`  association_staff: ${await AssociationStaff.count()}`);
    console.log('');

    console.log('✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

testCreateStaffWithRelations();
