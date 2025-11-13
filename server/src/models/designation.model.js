module.exports = (sequelize, DataTypes) => {
  const Designation = sequelize.define('Designation', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shortname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
    },
  }, { 
    tableName: 'designations',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Designation;
};
