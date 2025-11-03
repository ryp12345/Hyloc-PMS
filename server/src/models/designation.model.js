module.exports = (sequelize, DataTypes) => {
  const Designation = sequelize.define('Designation', {
    designation_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    designation_shortname: {
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
  return Designation;
};
