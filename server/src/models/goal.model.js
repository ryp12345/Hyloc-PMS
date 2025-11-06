module.exports = (sequelize, DataTypes) => {
  const Goal = sequelize.define('Goal', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.TEXT },
    owner_user_id: { type: DataTypes.UUID, allowNull: false },
    department_id: { type: DataTypes.INTEGER, allowNull: false },
    target_date: { type: DataTypes.DATEONLY },
    completion_percent: { type: DataTypes.INTEGER, defaultValue: 0, validate: { min: 0, max: 100 } },
    priority: { type: DataTypes.ENUM('High', 'Medium', 'Low'), defaultValue: 'Medium' },
    status: { type: DataTypes.ENUM('Pending','In Progress','Completed'), defaultValue: 'Pending' },
  }, { tableName: 'goals' });
  return Goal;
};