module.exports = (sequelize, DataTypes) => {
  const LeaveEntitlement = sequelize.define('LeaveEntitlement', {
    id: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    user_id: { 
      type: DataTypes.UUID, 
      allowNull: false 
    },
    year: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    leave_entitled: { 
      type: DataTypes.DECIMAL(4,1), 
      allowNull: false, 
      defaultValue: 12.0 
    },
    leaves_accumulated: { 
      type: DataTypes.DECIMAL(4,1), 
      allowNull: false, 
      defaultValue: 0.0 
    },
    leaves_availed: { 
      type: DataTypes.DECIMAL(4,1), 
      allowNull: false, 
      defaultValue: 0.0 
    }
  }, { 
    tableName: 'leaves_entitlement', 
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'year'],
        name: 'leaves_entitlement_user_year_unique'
      }
    ]
  });
  
  return LeaveEntitlement;
};
