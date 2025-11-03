module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define('Ticket', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.TEXT },
    department: { type: DataTypes.STRING(100) },
    assigned_to: { type: DataTypes.UUID },
    created_by: { type: DataTypes.UUID, allowNull: false },
    status: { type: DataTypes.ENUM('Open','In Progress','Resolved'), defaultValue: 'Open' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 'tickets', updatedAt: false, createdAt: 'created_at' });
  return Ticket;
};