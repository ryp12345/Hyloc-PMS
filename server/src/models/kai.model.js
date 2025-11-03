module.exports = (sequelize, DataTypes) => {
  const KAI = sequelize.define('KAI', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    description: { type: DataTypes.TEXT, allowNull: false },
    start_date: { type: DataTypes.DATEONLY },
    end_date: { type: DataTypes.DATEONLY },
    status: { type: DataTypes.ENUM('Pending','In Progress','Completed'), defaultValue: 'Pending' },
    notes: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.UUID, allowNull: false },
  }, { tableName: 'kai' });
  return KAI;
};