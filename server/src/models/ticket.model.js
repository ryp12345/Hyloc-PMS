module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define('Ticket', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.TEXT },
    
    // Category for unforeseen activities
    category: { 
      type: DataTypes.ENUM('Machine Breakdown', 'Equipment Failure', 'System Issue', 'Safety Incident', 'Maintenance', 'Other'), 
      defaultValue: 'Other' 
    },
    
    // Priority level
    priority: { 
      type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'), 
      defaultValue: 'Medium' 
    },
    
    // Department information
    department: { type: DataTypes.STRING(100) },
    department_id: { type: DataTypes.INTEGER },
    
    // Assignment tracking
    created_by: { type: DataTypes.UUID, allowNull: false },
    assigned_to: { type: DataTypes.UUID }, // Department/Company Head
    responsible_person: { type: DataTypes.UUID }, // Person actually handling it
    
    // Status tracking
    status: { 
      type: DataTypes.ENUM('Open', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Closed'), 
      defaultValue: 'Open' 
    },
    
    // Resolution tracking
    resolution_notes: { type: DataTypes.TEXT },
    resolved_at: { type: DataTypes.DATE },
    closed_at: { type: DataTypes.DATE },
    
    // Additional metadata
    estimated_time: { type: DataTypes.STRING(100) },
    actual_taken_time: { type: DataTypes.STRING(100) },
    attachment_url: { type: DataTypes.STRING(500) },
    
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE },
  }, { 
    tableName: 'tickets', 
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Ticket;
};