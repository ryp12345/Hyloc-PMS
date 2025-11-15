module.exports = (sequelize, DataTypes) => {
  const Leave = sequelize.define('Leave', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    from_date: { type: DataTypes.DATEONLY, allowNull: false },
    to_date: { type: DataTypes.DATEONLY, allowNull: false },
    alternate_person: { type: DataTypes.STRING(100) },
    additional_alternate: { type: DataTypes.STRING(100) },
    leave_reason: { type: DataTypes.STRING(255) },
    leave_duration: { type: DataTypes.STRING(50), defaultValue: 'Full Day' },
    leave_type: { type: DataTypes.STRING(20), defaultValue: 'Paid' },
    available_on_phone: { type: DataTypes.BOOLEAN, defaultValue: true },
    approved_by: { type: DataTypes.UUID },
    status: { type: DataTypes.ENUM('Pending','Approved','Rejected'), defaultValue: 'Pending' },
    credited_days: { type: DataTypes.DECIMAL(4,1), defaultValue: 0 },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 'leaves', updatedAt: false, createdAt: 'created_at' });
  return Leave;
};