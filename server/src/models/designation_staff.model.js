module.exports = (sequelize, DataTypes) => {
  const DesignationStaff = sequelize.define('DesignationStaff', {
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
    designation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'designations',
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
    tableName: 'designation_staff',
    underscored: true,
    timestamps: false // Junction tables typically don't need timestamps
  });
  return DesignationStaff;
};
