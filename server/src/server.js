require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./setup/db');


const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const kmiRoutes = require('./routes/kmi.routes');
const kpiRoutes = require('./routes/kpi.routes');
const kaiRoutes = require('./routes/kai.routes');
const taskRoutes = require('./routes/task.routes');
const ticketRoutes = require('./routes/ticket.routes');
const leaveRoutes = require('./routes/leave.routes');
const calendarRoutes = require('./routes/calendar.routes');
const departmentRoutes = require('./routes/department.routes');
const designationRoutes = require('./routes/designation.routes');
const associationRoutes = require('./routes/association.routes');
const qualificationRoutes = require('./routes/qualification.routes');
const goalRoutes = require('./routes/goal.routes');
const milestoneRoutes = require('./routes/milestone.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/kmi', kmiRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/kai', kaiRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/associations', associationRoutes);
app.use('/api/qualifications', qualificationRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/upload', uploadRoutes);

const PORT = process.env.PORT || 3001;

(async () => {
  try {
    console.log('Authenticating database connection...');
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
  console.log('Syncing database models (no alter)...');
  await sequelize.sync(); // Avoid altering existing DB schema; use migrations to evolve schema
  console.log('Database models synced (no alter).');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API server running on http://localhost:${PORT}`);
      //console.log(`API server also accessible on http://10.22.0.153:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
