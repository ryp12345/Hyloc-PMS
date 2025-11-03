module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.TEXT },
    assigned_to: { type: DataTypes.UUID, allowNull: false },
    assigned_by: { type: DataTypes.UUID, allowNull: false },
    due_date: { type: DataTypes.DATEONLY },
    status: { type: DataTypes.ENUM('Pending','In Progress','Completed'), defaultValue: 'Pending' },
    priority: { type: DataTypes.ENUM('Low','Medium','High'), defaultValue: 'Medium' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 'tasks', updatedAt: false, createdAt: 'created_at' });
  return Task;
};