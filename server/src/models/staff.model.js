module.exports = (sequelize, DataTypes) => {
  const Staff = sequelize.define('Staff', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    emp_id: { type: DataTypes.STRING(20), allowNull: false },
    name: { type: DataTypes.STRING(100), allowNull: false },
    // New relational fields for master data linkage
    department_id: { type: DataTypes.INTEGER, allowNull: true },
    designation_id: { type: DataTypes.INTEGER, allowNull: true },
    association_id: { type: DataTypes.INTEGER, allowNull: true },
    designation: { type: DataTypes.STRING(100) },
    department: { type: DataTypes.STRING(100) },
    religion: { type: DataTypes.STRING(50) },
    salary: { type: DataTypes.DECIMAL(10, 2) },
    // Additional personal and contact information
    date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
    phone_no: { type: DataTypes.TEXT, allowNull: true },
    blood_group: { type: DataTypes.STRING(10), allowNull: true },
    emergency_contact_name: { type: DataTypes.STRING(255), allowNull: true },
    emergency_contact_number: { type: DataTypes.TEXT, allowNull: true },
    emergency_contact_relation: { type: DataTypes.STRING(50), allowNull: true },
    pan_no: { type: DataTypes.STRING(10), allowNull: true },
    aadhar_no: { type: DataTypes.STRING(12), allowNull: true },
    date_of_joining: { type: DataTypes.DATEONLY, allowNull: true },
  }, { tableName: 'staff' });
  return Staff;
};