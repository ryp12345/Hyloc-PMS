module.exports = (sequelize, DataTypes) => {
  const Milestone = sequelize.define('Milestone', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    goal_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.TEXT },
    from_date: { type: DataTypes.DATEONLY, allowNull: false },
    to_date: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.ENUM('Pending', 'In Progress', 'Completed'), defaultValue: 'Pending' },
  }, { 
    tableName: 'milestones',
    validate: {
      datesAreValid() {
        if (this.from_date && this.to_date && this.from_date > this.to_date) {
          throw new Error('from_date must be before or equal to to_date');
        }
      }
    }
  });
  return Milestone;
};
