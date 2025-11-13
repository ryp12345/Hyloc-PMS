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
  }, { 
    tableName: 'associations',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Association;
};
