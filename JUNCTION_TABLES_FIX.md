# Junction Tables Fix - Department Staff, Designation Staff, Association Staff

## Problem
The junction tables `department_staff`, `designation_staff`, and `association_staff` were not storing data correctly when creating or updating staff members. The tables exist in the database with the proper structure:

```sql
-- department_staff
id              integer (PK, auto-increment)
staff_id        integer (FK to staff)
department_id   integer (FK to departments)
start_date      date
end_date        date

-- designation_staff
id              integer (PK, auto-increment)
staff_id        integer (FK to staff)
designation_id  integer (FK to designations)
start_date      date
end_date        date

-- association_staff
id              integer (PK, auto-increment)
staff_id        integer (FK to staff)
association_id  integer (FK to associations)
start_date      date
end_date        date
```

However, when using Sequelize's `belongsToMany` with string references (e.g., `through: 'department_staff'`), the ORM was not properly mapping to the database tables.

## Root Cause
Sequelize's `belongsToMany` associations were using string references for the `through` option:
```javascript
// OLD - Using string references
Department.belongsToMany(Staff, {
  through: 'department_staff',  // String reference
  foreignKey: 'department_id',
  otherKey: 'staff_id',
  as: 'StaffMembers'
});
```

This approach has limitations:
1. No explicit model definition for junction tables
2. Limited control over junction table columns and behavior
3. Timestamps configuration issues
4. Difficulty debugging and testing

## Solution
Created explicit Sequelize models for each junction table and updated the associations to use model references instead of strings.

### Files Created

#### 1. `server/src/models/department_staff.model.js`
```javascript
module.exports = (sequelize, DataTypes) => {
  const DepartmentStaff = sequelize.define('DepartmentStaff', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    staff_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'staff',
        key: 'id'
      }
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'departments',
        key: 'id'
      }
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, { 
    tableName: 'department_staff',
    underscored: true,
    timestamps: false
  });
  return DepartmentStaff;
};
```

#### 2. `server/src/models/designation_staff.model.js`
Similar structure with `designation_id` instead of `department_id`.

#### 3. `server/src/models/association_staff.model.js`
Similar structure with `association_id`.

### Files Modified

#### `server/src/models/index.js`
**Changes:**
1. Added imports for junction table models:
```javascript
const DepartmentStaff = require('./department_staff.model')(sequelize, DataTypes);
const DesignationStaff = require('./designation_staff.model')(sequelize, DataTypes);
const AssociationStaff = require('./association_staff.model')(sequelize, DataTypes);
```

2. Updated associations to use model references:
```javascript
// NEW - Using model references
Department.belongsToMany(Staff, {
  through: DepartmentStaff,  // Model reference
  foreignKey: 'department_id',
  otherKey: 'staff_id',
  as: 'StaffMembers'
});
Staff.belongsToMany(Department, {
  through: DepartmentStaff,  // Model reference
  foreignKey: 'staff_id',
  otherKey: 'department_id',
  as: 'Departments'
});
```

3. Added models to exports:
```javascript
module.exports = {
  // ... existing exports
  DepartmentStaff,
  DesignationStaff,
  AssociationStaff,
};
```

## Testing

### Test Scripts Created

#### 1. `server/src/scripts/test_junction_tables.js`
Verifies junction tables are properly synced and can be queried.

#### 2. `server/src/scripts/test_create_staff_relations.js`
Tests creating staff relationships with departments, designations, and associations.

**Usage:**
```bash
cd server
node src/scripts/test_create_staff_relations.js
```

### Test Results
✅ All tests passed successfully:
- Junction tables properly synced with database
- Data stored correctly with all fields (id, staff_id, department_id/designation_id/association_id, start_date, end_date)
- Relationships can be queried and retrieved
- Test verified with actual data:
  - 2 departments assigned to staff
  - 2 designations assigned to staff
  - 2 associations assigned to staff

## Existing Controller Logic
The controller logic in `server/src/controllers/users.controller.js` was already correct and didn't require changes. The `setDepartments()`, `setDesignations()`, and `setAssociations()` methods work properly now that explicit junction models are defined.

Example from the controller:
```javascript
if (departmentIds.length) {
  await staffInstance.setDepartments(
    departmentIds.map(id => Number(id)),
    { through: { start_date: startDate, end_date: null } }
  );
}
```

## Benefits of This Fix

1. **Explicit Schema Definition**: Junction tables have clear, typed model definitions
2. **Better Type Safety**: Foreign keys and data types are explicitly defined
3. **Easier Testing**: Can directly query and test junction models
4. **Proper Data Storage**: All fields including start_date and end_date are stored correctly
5. **Maintainability**: Easy to add new fields or modify junction table behavior
6. **Debugging**: Can directly inspect junction table models and data

## Verification Steps

After restarting the server:

1. **Check junction tables exist:**
   ```sql
   SELECT * FROM department_staff;
   SELECT * FROM designation_staff;
   SELECT * FROM association_staff;
   ```

2. **Create/Update a staff member** via the API with departments, designations, and associations

3. **Verify data is stored** in junction tables with proper IDs and dates

4. **Query staff with relationships:**
   ```javascript
   const staff = await Staff.findByPk(staffId, {
     include: [
       { model: Department, as: 'Departments', through: { attributes: ['start_date', 'end_date'] } },
       { model: Designation, as: 'Designations', through: { attributes: ['start_date', 'end_date'] } },
       { model: Association, as: 'Associations', through: { attributes: ['start_date', 'end_date'] } }
     ]
   });
   ```

## No Breaking Changes
This fix is backward compatible:
- Existing database tables remain unchanged
- Controller logic remains unchanged
- API endpoints remain unchanged
- Only the internal Sequelize model definitions were improved

## Next Steps
1. Restart the server to load the new models
2. Test creating/updating staff members through the UI
3. Verify junction table data in pgAdmin
4. Monitor logs for any Sequelize-related warnings

---
**Fixed on:** November 13, 2025
**Files Changed:** 4 files created, 1 file modified
**Tested:** ✅ Verified with test scripts
