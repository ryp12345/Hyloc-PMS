module.exports = (sequelize, DataTypes) => {
  const Association = sequelize.define('Association', {
    asso_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
    },
  }, { tableName: 'associations' });
  return Association;
};
