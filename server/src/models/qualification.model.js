module.exports = (sequelize, DataTypes) => {
  const Qualification = sequelize.define('Qualification', {
    qual_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    qual_shortname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
    },
  });
  return Qualification;
};
