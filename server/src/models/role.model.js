module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        isIn: [['Management', 'Manager', 'Employee', 'HR']],
      },
    },
  }, {
    tableName: 'roles',
    timestamps: false,
  });
  return Role;
};