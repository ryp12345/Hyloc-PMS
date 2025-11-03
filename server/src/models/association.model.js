module.exports = (sequelize, DataTypes) => {
  const Association = sequelize.define('Association', {
    asso_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('Associated', 'Temporary Associated', 'Disassociated'),
      allowNull: false,
      defaultValue: 'Associated',
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
    },
  });
  return Association;
};
