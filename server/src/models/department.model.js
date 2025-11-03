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
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
    },
  });
  return Department;
};
