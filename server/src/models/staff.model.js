module.exports = (sequelize, DataTypes) => {
  const Staff = sequelize.define('Staff', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    emp_id: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    // Foreign keys present in DB
    user_id: { type: DataTypes.UUID, allowNull: true },
    department_id: { type: DataTypes.INTEGER, allowNull: true },
    // Domain fields per DB
    religion: { type: DataTypes.STRING(50) },
    // salary column not present in provided schema; omit to avoid alter
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