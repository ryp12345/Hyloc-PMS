module.exports = (sequelize, DataTypes) => {
  const DepartmentStaff = sequelize.define('DepartmentStaff', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    staff_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'staff',
        key: 'id'
      }
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'departments',
        key: 'id'
      }
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, { 
    tableName: 'department_staff',
    underscored: true,
    timestamps: false // Junction tables typically don't need timestamps
  });
  return DepartmentStaff;
};
