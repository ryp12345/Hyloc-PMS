const { Ticket, User, Staff, Role, Department } = require('../models');
const { Op } = require('sequelize');

/**
 * List tickets based on user role and scope
 * - Employee: tickets they created
 * - Manager/Department Head: tickets assigned to them + tickets in their department
 * - Management: all tickets
 */
exports.list = async (req, res) => {
  try {
    const { scope, status, priority, department } = req.query;
    const userRole = req.user.role;
    let where = {};

    // Build base query based on scope and role
    if (scope === 'created') {
      where.created_by = req.user.id;
    } else if (scope === 'assigned') {
      where.assigned_to = req.user.id;
    } else if (scope === 'responsible') {
      where.responsible_person = req.user.id;
    } else if (scope === 'all') {
      // Management can see all, Managers see their department
      if (userRole === 'Manager') {
        const staff = await Staff.findOne({ where: { UserId: req.user.id } });
        if (staff && staff.department) {
          where.department = staff.department;
        }
      }
      // Management sees everything (no filter)
    } else {
      // Default: show relevant tickets based on role
      if (userRole === 'Employee') {
        where.created_by = req.user.id;
      } else if (userRole === 'Manager') {
        const staff = await Staff.findOne({ where: { UserId: req.user.id } });
        where[Op.or] = [
          { assigned_to: req.user.id },
          { responsible_person: req.user.id },
          { department: staff?.department || '' }
        ];
      }
      // Management sees all
    }

    // Apply additional filters
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (department) where.department = department;

    const rows = await Ticket.findAll({
      where,
      include: [
        { model: User, as: 'Creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'Owner', attributes: ['id', 'name', 'email'] },
      ],
      order: [
        ['priority', 'DESC'], // Critical first
        ['created_at', 'DESC']
      ],
    });
    res.json(rows);
  } catch (error) {
    console.error('Error listing tickets:', error);
    res.status(500).json({ message: 'Failed to fetch tickets' });
  }
};

/**
 * Create a new ticket
 * Auto-assigns to department head (Manager) or company head (Management) based on department
 */
exports.create = async (req, res) => {
  try {
    const { title, description, department, category, priority, estimated_time } = req.body;
    
    let assigned_to = null;
    let department_id = null;

    // Find department ID if department name provided
    if (department) {
      const dept = await Department.findOne({ where: { dept_name: department } });
      if (dept) department_id = dept.id;

      // Find department head (Manager role in that department)
      const manager = await User.findOne({
        include: [
          { model: Staff, where: { department }, required: true },
          { model: Role, where: { name: 'Manager' }, required: true }
        ],
      });
      
      if (manager) {
        assigned_to = manager.id;
      } else {
        // If no department manager, assign to Management/Company Head
        const companyHead = await User.findOne({
          include: [{ model: Role, where: { name: 'Management' }, required: true }]
        });
        if (companyHead) assigned_to = companyHead.id;
      }
    }

    const ticket = await Ticket.create({
      title,
      description,
      department,
      department_id,
      category: category || 'Other',
      priority: priority || 'Medium',
      estimated_time,
      assigned_to,
      created_by: req.user.id,
      status: assigned_to ? 'Assigned' : 'Open'
    });

    // Fetch with relations
    const result = await Ticket.findByPk(ticket.id, {
      include: [
        { model: User, as: 'Creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'Owner', attributes: ['id', 'name', 'email'] },
      ]
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ message: 'Failed to create ticket' });
  }
};

/**
 * Assign/Reassign ticket to a responsible person
 * Only accessible by Department Head (Manager) or Company Head (Management)
 */
exports.assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { responsible_person, estimated_time } = req.body;
    
    const ticket = await Ticket.findByPk(id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    // Check permissions
    const canAssign = req.user.role === 'Management' || 
                      req.user.role === 'Manager' || 
                      req.user.id === ticket.assigned_to;
    
    if (!canAssign) {
      return res.status(403).json({ message: 'You do not have permission to assign this ticket' });
    }

    // Update ticket
    await ticket.update({
      responsible_person,
      estimated_time: estimated_time || ticket.estimated_time,
      status: responsible_person ? 'In Progress' : ticket.status
    });

    const result = await Ticket.findByPk(id, {
      include: [
        { model: User, as: 'Creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'Owner', attributes: ['id', 'name', 'email'] },
      ]
    });

    res.json(result);
  } catch (error) {
    console.error('Error assigning ticket:', error);
    res.status(500).json({ message: 'Failed to assign ticket' });
  }
};

/**
 * Update ticket status and resolution
 */
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution_notes, actual_taken_time, priority } = req.body;
    
    const ticket = await Ticket.findByPk(id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    // Check permissions
    const canUpdate = req.user.role === 'Management' || 
                      req.user.role === 'Manager' || 
                      req.user.id === ticket.assigned_to || 
                      req.user.id === ticket.responsible_person ||
                      req.user.id === ticket.created_by;
    
    if (!canUpdate) {
      return res.status(403).json({ message: 'You do not have permission to update this ticket' });
    }

    const updates = { status };
    if (resolution_notes !== undefined) updates.resolution_notes = resolution_notes;
    if (actual_taken_time !== undefined) updates.actual_taken_time = actual_taken_time;
    if (priority !== undefined) updates.priority = priority;
    
    // Set timestamps based on status
    if (status === 'Resolved' && !ticket.resolved_at) {
      updates.resolved_at = new Date();
    }
    if (status === 'Closed' && !ticket.closed_at) {
      updates.closed_at = new Date();
    }

    await ticket.update(updates);

    const result = await Ticket.findByPk(id, {
      include: [
        { model: User, as: 'Creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'Owner', attributes: ['id', 'name', 'email'] },
      ]
    });

    res.json(result);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ message: 'Failed to update ticket' });
  }
};

/**
 * Get single ticket details
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByPk(id, {
      include: [
        { model: User, as: 'Creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'Owner', attributes: ['id', 'name', 'email'] },
      ]
    });

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ message: 'Failed to fetch ticket' });
  }
};

/**
 * Delete ticket (only creator or Management)
 */
exports.deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByPk(id);
    
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const canDelete = req.user.role === 'Management' || req.user.id === ticket.created_by;
    if (!canDelete) {
      return res.status(403).json({ message: 'You do not have permission to delete this ticket' });
    }

    await ticket.destroy();
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ message: 'Failed to delete ticket' });
  }
};
