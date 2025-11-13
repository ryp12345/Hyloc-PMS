module.exports = (sequelize, DataTypes) => {
  const AssociationStaff = sequelize.define('AssociationStaff', {
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
    association_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'associations',
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
    tableName: 'association_staff',
    underscored: true,
    timestamps: false // Junction tables typically don't need timestamps
  });
  return AssociationStaff;
};
