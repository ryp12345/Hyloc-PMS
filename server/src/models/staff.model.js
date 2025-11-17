module.exports = (sequelize, DataTypes) => {
  const Staff = sequelize.define('Staff', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    emp_id: { type: DataTypes.STRING(20), allowNull: true },
    first_name: { type: DataTypes.STRING(100), allowNull: true },
    middle_name: { type: DataTypes.STRING(100), allowNull: true },
    last_name: { type: DataTypes.STRING(100), allowNull: true },
    // Foreign keys present in DB
    user_id: { type: DataTypes.UUID, allowNull: true },
    // Domain fields per DB
    religion: { type: DataTypes.STRING(50) },
    date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
    phone_no: { type: DataTypes.TEXT, allowNull: true },
    blood_group: { type: DataTypes.STRING(10), allowNull: true },
    emergency_contact_name: { type: DataTypes.STRING(255), allowNull: true },
    emergency_contact_number: { type: DataTypes.TEXT, allowNull: true },
    emergency_contact_relation: { type: DataTypes.STRING(50), allowNull: true },
    pan_no: { type: DataTypes.STRING(10), allowNull: true },
    aadhar_no: { type: DataTypes.STRING(12), allowNull: true },
    date_of_joining: { type: DataTypes.DATEONLY, allowNull: true },
    staff_img: { type: DataTypes.TEXT, allowNull: true },
    award_recognition: { type: DataTypes.TEXT, allowNull: true },
    tpm_pillar: { type: DataTypes.TEXT, allowNull: true },
    gender: { type: DataTypes.STRING(10), allowNull: true },
    address: { type: DataTypes.TEXT, allowNull: true },
  }, { 
    tableName: 'staff',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Staff;
};