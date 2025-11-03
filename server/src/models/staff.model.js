module.exports = (sequelize, DataTypes) => {
  const Staff = sequelize.define('Staff', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    emp_id: { type: DataTypes.STRING(20), allowNull: false },
    name: { type: DataTypes.STRING(100), allowNull: false },
    // New relational fields for master data linkage
    department_id: { type: DataTypes.INTEGER, allowNull: true },
    designation_id: { type: DataTypes.INTEGER, allowNull: true },
    designation: { type: DataTypes.STRING(100) },
    department: { type: DataTypes.STRING(100) },
    religion: { type: DataTypes.STRING(50) },
    salary: { type: DataTypes.DECIMAL(10, 2) },
  }, { tableName: 'staff' });
  return Staff;
};