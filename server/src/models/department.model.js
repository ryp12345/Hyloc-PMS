module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define('Department', {
    dept_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dept_shortname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
    },
  }, { tableName: 'departments' });
  return Department;
};
