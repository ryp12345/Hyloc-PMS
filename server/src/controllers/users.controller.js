const bcrypt = require('bcryptjs');
const XLSX = require('xlsx');
const ExcelJS = require('exceljs');
const { Op } = require('sequelize');
const { User, Role, Staff, Department, Designation, Association, Leave } = require('../models');

// Helper function to build full name from staff name parts
const buildFullName = (staff) => {
  if (!staff) return '';
  const parts = [
    staff.first_name,
    staff.middle_name,
    staff.last_name
  ].filter(Boolean);
  return parts.join(' ');
};

// Helper function to split name into parts
const splitName = (fullName) => {
  const parts = (fullName || '').trim().split(/\s+/);
  if (parts.length === 1) {
    return { first_name: parts[0], middle_name: '', last_name: '' };
  } else if (parts.length === 2) {
    return { first_name: parts[0], middle_name: '', last_name: parts[1] };
  } else if (parts.length >= 3) {
    return {
      first_name: parts[0],
      middle_name: parts.slice(1, -1).join(' '),
      last_name: parts[parts.length - 1]
    };
  }
  return { first_name: '', middle_name: '', last_name: '' };
};

exports.list = async (req, res) => {
  if (!['Management', 'HR', 'Manager'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const users = await User.findAll({ 
    include: [
      { model: Role, through: { attributes: ['status', 'created_at'] } }, 
      { 
        model: Staff, 
        include: [
          { model: Department, as: 'Departments', through: { attributes: ['start_date', 'end_date'] } }, 
          { model: Designation, as: 'Designations', through: { attributes: ['start_date', 'end_date'] } }, 
          { model: Association, as: 'Associations', through: { attributes: ['start_date', 'end_date'] } }
        ]
      }
    ], 
    attributes: { exclude: ['password'] } 
  });
  res.json(users.map(u => ({ 
    id: u.id, 
    email: u.email, 
    role: (u.Roles || []).find(r => r.UserRole?.status === 'Active')?.name || null, 
    staff: u.Staff,
    fullName: buildFullName(u.Staff)
  })));
};

exports.get = async (req, res) => {
  const user = await User.findByPk(req.params.id, { 
    include: [
      { model: Role, through: { attributes: ['status', 'created_at'] } }, 
      { 
        model: Staff, 
        include: [
          { model: Department, as: 'Departments', through: { attributes: ['start_date', 'end_date'] } }, 
          { model: Designation, as: 'Designations', through: { attributes: ['start_date', 'end_date'] } }, 
          { model: Association, as: 'Associations', through: { attributes: ['start_date', 'end_date'] } }
        ]
      }
    ] 
  });
  if (!user) return res.status(404).json({ message: 'Not found' });
  if (req.user.id !== user.id && !['Management','HR','Manager'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  res.json({ 
    id: user.id, 
    email: user.email, 
    role: (user.Roles || []).find(r => r.UserRole?.status === 'Active')?.name || null, 
    staff: user.Staff,
    fullName: buildFullName(user.Staff)
  });
};

exports.create = async (req, res) => {
  if (!['Management', 'HR'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const { email, password, roleName = 'Employee', staff } = req.body;
  
  try {
    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) return res.status(400).json({ message: 'Invalid role' });
    const hashed = await bcrypt.hash(password || 'password123', 10);
    const user = await User.create({ email, password: hashed });
    const { UserRole } = require('../models');
    await UserRole.create({ user_id: user.id, role_id: role.id, status: 'Active' });
    
    if (staff) {
      // Normalize payload and capture M2M ids
      const payload = { ...staff };
      
      // Remove M2M fields before creating staff record
      let designationIds = [];
      if (Array.isArray(payload.designation_ids)) designationIds = payload.designation_ids;
      else if (payload.designation_id) designationIds = [payload.designation_id];
      
      let associationIds = [];
      if (Array.isArray(payload.association_ids)) associationIds = payload.association_ids;
      else if (payload.association_id) associationIds = [payload.association_id];
      
      let departmentIds = [];
      if (Array.isArray(payload.department_ids)) departmentIds = payload.department_ids;
      else if (payload.department_id) departmentIds = [payload.department_id];
      
      // Clean up payload - remove ALL fields that are not in the staff model
      const cleanPayload = {
        first_name: payload.first_name,
        middle_name: payload.middle_name,
        last_name: payload.last_name,
        emp_id: payload.emp_id,
        religion: payload.religion,
        date_of_birth: payload.date_of_birth,
        phone_no: payload.phone_no,
        blood_group: payload.blood_group,
        emergency_contact_name: payload.emergency_contact_name,
        emergency_contact_number: payload.emergency_contact_number,
        emergency_contact_relation: payload.emergency_contact_relation,
        pan_no: payload.pan_no,
        aadhar_no: payload.aadhar_no,
        date_of_joining: payload.date_of_joining,
        staff_img: payload.staff_img,
        award_recognition: payload.award_recognition,
        tpm_pillar: payload.tpm_pillar,
        gender: payload.gender,
        address: payload.address
      };
      
      console.log('Creating staff with payload:', cleanPayload);
      
      // Create staff via association to ensure user_id is set
      const staffInstance = await user.createStaff(cleanPayload);
      
      // Write pivot rows with start_date
      const startDate = payload.date_of_joining || new Date().toISOString().split('T')[0];
      
      if (departmentIds.length) {
        await staffInstance.setDepartments(
          departmentIds.map(id => Number(id)),
          { through: { start_date: startDate, end_date: null } }
        );
      }
      
      if (designationIds.length) {
        await staffInstance.setDesignations(
          designationIds.map(id => Number(id)),
          { through: { start_date: startDate, end_date: null } }
        );
      }
      
      if (associationIds.length) {
        await staffInstance.setAssociations(
          associationIds.map(id => Number(id)),
          { through: { start_date: startDate, end_date: null } }
        );
      }
    }
    
    const full = await User.findByPk(user.id, { 
      include: [
        { model: Role, through: { attributes: ['status', 'created_at'] } }, 
        { 
          model: Staff, 
          include: [
            { model: Department, as: 'Departments', through: { attributes: ['start_date', 'end_date'] } }, 
            { model: Designation, as: 'Designations', through: { attributes: ['start_date', 'end_date'] } }, 
            { model: Association, as: 'Associations', through: { attributes: ['start_date', 'end_date'] } }
          ]
        }
      ] 
    });
    res.status(201).json({ 
      id: full.id, 
      email: full.email, 
      role: (full.Roles || []).find(r => r.UserRole?.status === 'Active')?.name || null, 
      staff: full.Staff,
      fullName: buildFullName(full.Staff)
    });
  } catch (error) {
    console.error('Error creating user/staff:', error);
    res.status(500).json({ message: error.message || 'Failed to create user' });
  }
};

exports.update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { include: [{ model: Role, through: { attributes: ['status'] } }, Staff] });
    if (!user) return res.status(404).json({ message: 'Not found' });
    const canManage = ['Management', 'HR'].includes(req.user.role);
    if (req.user.id !== user.id && !canManage) return res.status(403).json({ message: 'Forbidden' });
    const { email, password, roleName, staff } = req.body;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (roleName && canManage) {
      const role = await Role.findOne({ where: { name: roleName } });
      if (role) {
        const { UserRole } = require('../models');
        // No longer set previous active roles to Inactive - allow multiple active roles
        await UserRole.create({ user_id: user.id, role_id: role.id, status: 'Active' });
      }
    }
    await user.save();
    
    if (staff) {
      const payload = { ...staff };

      // Extract M2M ids safely (support single or array)
      const designationIds = Array.isArray(payload.designation_ids)
        ? payload.designation_ids
        : payload.designation_id ? [payload.designation_id] : [];
      const associationIds = Array.isArray(payload.association_ids)
        ? payload.association_ids
        : payload.association_id ? [payload.association_id] : [];
      const departmentIds = Array.isArray(payload.department_ids)
        ? payload.department_ids
        : payload.department_id ? [payload.department_id] : [];

      // Only map allowed fields (ignore any user_id passed from client)
      const cleanPayload = {
        first_name: payload.first_name,
        middle_name: payload.middle_name,
        last_name: payload.last_name,
        emp_id: payload.emp_id,
        religion: payload.religion,
        date_of_birth: payload.date_of_birth,
        phone_no: payload.phone_no,
        blood_group: payload.blood_group,
        emergency_contact_name: payload.emergency_contact_name,
        emergency_contact_number: payload.emergency_contact_number,
        emergency_contact_relation: payload.emergency_contact_relation,
        pan_no: payload.pan_no,
        aadhar_no: payload.aadhar_no,
        date_of_joining: payload.date_of_joining,
        staff_img: payload.staff_img,
        award_recognition: payload.award_recognition,
        tpm_pillar: payload.tpm_pillar,
        gender: payload.gender,
        address: payload.address
      };

      // Ensure we never create a duplicate staff row for the same user
      let staffInstance = await Staff.findOne({ where: { user_id: user.id } });
      if (staffInstance) {
        await staffInstance.update(cleanPayload);
      } else {
        staffInstance = await user.createStaff(cleanPayload);
      }

      const startDate = payload.date_of_joining || new Date().toISOString().split('T')[0];

      if (departmentIds.length) {
        await staffInstance.setDepartments(
          departmentIds.map(id => Number(id)),
          { through: { start_date: startDate, end_date: null } }
        );
      }
      if (designationIds.length) {
        await staffInstance.setDesignations(
          designationIds.map(id => Number(id)),
          { through: { start_date: startDate, end_date: null } }
        );
      }
      if (associationIds.length) {
        await staffInstance.setAssociations(
          associationIds.map(id => Number(id)),
          { through: { start_date: startDate, end_date: null } }
        );
      }
    }
    
    const full = await User.findByPk(user.id, { 
      include: [
        { model: Role, through: { attributes: ['status', 'created_at'] } }, 
        { 
          model: Staff, 
          include: [
            { model: Department, as: 'Departments', through: { attributes: ['start_date', 'end_date'] } }, 
            { model: Designation, as: 'Designations', through: { attributes: ['start_date', 'end_date'] } }, 
            { model: Association, as: 'Associations', through: { attributes: ['start_date', 'end_date'] } }
          ]
        }
      ] 
    });
    res.json({ 
      id: full.id, 
      email: full.email, 
      role: (full.Roles || []).find(r => r.UserRole?.status === 'Active')?.name || null, 
      staff: full.Staff,
      fullName: buildFullName(full.Staff)
    });
  } catch (error) {
    console.error('Error updating user/staff:', error);
    // Provide clearer validation / uniqueness feedback
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = (error.errors && error.errors[0] && error.errors[0].path) || 'field';
      // Provide friendlier staff message
      if (field === 'user_id') {
        return res.status(400).json({ message: 'Staff record already exists for this user' });
      }
      return res.status(400).json({ message: `${field === 'email' ? 'Email' : field} already exists` });
    }
    if (error.name === 'SequelizeValidationError') {
      const messages = (error.errors || []).map(e => e.message).filter(Boolean);
      return res.status(400).json({ message: messages.join('; ') || 'Validation failed' });
    }
    res.status(500).json({ message: error.message || 'Failed to update user' });
  }
};

exports.remove = async (req, res) => {
  if (!['Management', 'HR'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  
  try {
    const user = await User.findByPk(req.params.id, { 
      include: [{ model: Staff, include: ['Departments', 'Designations', 'Associations'] }] 
    });
    
    if (!user) return res.status(404).json({ message: 'Not found' });
    
    // Import all related models
    const { DepartmentStaff, DesignationStaff, AssociationStaff, Task, Leave, Ticket, Goal } = require('../models');
    
    // If staff exists, delete all related junction table entries
    if (user.Staff) {
      const staffId = user.Staff.id;
      
      // Delete junction table entries for staff
      await Promise.all([
        DepartmentStaff.destroy({ where: { staff_id: staffId } }),
        DesignationStaff.destroy({ where: { staff_id: staffId } }),
        AssociationStaff.destroy({ where: { staff_id: staffId } })
      ]);
      
      console.log(`Deleted junction table entries for staff_id: ${staffId}`);
      
      // Delete the staff record
      await user.Staff.destroy();
      console.log(`Deleted staff record with id: ${staffId}`);
    }
    
    // Delete all user-related data
    const userId = user.id;
    
    // Option 1: Set foreign keys to NULL (if you want to keep the records)
    // await Task.update({ assigned_to: null }, { where: { assigned_to: userId } });
    // await Task.update({ assigned_by: null }, { where: { assigned_by: userId } });
    
    // Option 2: Delete all related records (recommended for complete cleanup)
    await Promise.all([
      Task.destroy({ where: { assigned_to: userId } }),
      Task.destroy({ where: { assigned_by: userId } }),
      Leave.destroy({ where: { user_id: userId } }),
      Ticket.destroy({ where: { created_by: userId } }),
      Ticket.destroy({ where: { assigned_to: userId } }),
      Goal.destroy({ where: { owner_user_id: userId } })
    ]);
    
    console.log(`Deleted all related data for user_id: ${userId}`);
    
    // Finally delete the user
    await user.destroy();
    console.log(`Deleted user with id: ${userId}`);
    
    res.json({ message: 'Staff and all related data deleted successfully' });
  } catch (error) {
    console.error('Error deleting user/staff:', error);
    res.status(500).json({ message: error.message || 'Failed to delete user' });
  }
};

// Get a user's leave history for a calendar year
// Access: the user themself, or Management/HR
// GET /api/users/:userId/leave-history?year=YYYY
exports.getUserLeaveHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();

    // Authorization: allow self or HR/Management
    const isSelf = req.user.id === userId;
    const isAdmin = ['Management', 'HR'].includes(req.user.role);
    if (!isSelf && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const start = new Date(Date.UTC(year, 0, 1)); // Jan 1 UTC
    const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)); // Dec 31 UTC end

    // Return leaves that overlap the given year window
    const rows = await Leave.findAll({
      where: {
        user_id: userId,
        [Op.or]: [
          { from_date: { [Op.between]: [start, end] } },
          { to_date: { [Op.between]: [start, end] } },
          {
            [Op.and]: [
              { from_date: { [Op.lt]: start } },
              { to_date: { [Op.gt]: end } }
            ]
          }
        ]
      },
      order: [ ['from_date', 'DESC'], ['created_at', 'DESC'] ]
    });

    res.json(rows);
  } catch (error) {
    console.error('Error fetching user leave history:', error);
    res.status(500).json({ message: 'Error fetching user leave history', error: error.message });
  }
};

// Get staff names for dropdown (accessible to all authenticated users)
exports.getStaffNames = async (req, res) => {
  const users = await User.findAll({ 
    include: [{ model: Role, through: { attributes: ['status'] } }, Staff], 
    attributes: ['id', 'email'] 
  });
  // Include all users (including the logged-in user)
  res.json(users.map(u => ({ 
    id: u.id, 
    email: u.email,
    fullName: buildFullName(u.Staff),
    role: (u.Roles || []).find(r => r.UserRole?.status === 'Active')?.name || null,
    designation: u.Staff?.designation || null 
  })));
};

// Get staff names by department (for alternate selection)
exports.getStaffByDepartment = async (req, res) => {
  const { department_id } = req.query;
  if (!department_id) return res.status(400).json({ message: 'department_id is required' });
  const users = await User.findAll({
    include: [
      { model: Role, through: { attributes: ['status'] } },
      {
        model: Staff,
        required: true,
        include: [
          {
            model: Department,
            as: 'Departments',
            where: { id: department_id },
            through: { attributes: [] },
            required: true
          }
        ]
      }
    ],
    attributes: ['id']
  });
  // Include all users (including the logged-in user)
  res.json(users.map(u => ({
    id: u.id,
    fullName: buildFullName(u.Staff),
    designation: u.Staff?.Designations?.[0]?.designation_name || null
  })));
};

// Assign a role to a user (HR/Management only)
exports.assignRole = async (req, res) => {
  try {
    if (!['Management', 'HR'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const userId = req.params.id;
    const { roleName, status = 'Active' } = req.body;
    if (!roleName) return res.status(400).json({ message: 'roleName is required' });
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) return res.status(400).json({ message: 'Invalid role' });

    const { UserRole } = require('../models');
    // No longer force other roles to Inactive - allow multiple active roles
    const row = await UserRole.create({ user_id: userId, role_id: role.id, status });
    res.status(201).json({ message: 'Role assigned', id: row.id });
  } catch (error) {
    console.error('Assign role error:', error);
    res.status(500).json({ message: error.message || 'Failed to assign role' });
  }
};

// Get roles history for a user (HR/Management only)
exports.getUserRoles = async (req, res) => {
  try {
    if (!['Management', 'HR'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const userId = req.params.id;
    const { UserRole } = require('../models');
    const rows = await UserRole.findAll({
      where: { user_id: userId },
      include: [Role],
      order: [['created_at', 'DESC']]
    });
    res.json(rows.map(r => ({ id: r.id, role: r.Role?.name, status: r.status, created_at: r.created_at })));
  } catch (error) {
    console.error('Get user roles error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch roles' });
  }
};

// List ALL role assignments (HR/Management only)
exports.listAssignments = async (req, res) => {
  try {
    if (!['Management', 'HR'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { UserRole } = require('../models');
    const rows = await UserRole.findAll({
      include: [
        { model: User, attributes: ['id', 'email'] },
        { model: Role, attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(rows.map(r => ({
      id: r.id,
      user_id: r.user_id,
      user_email: r.User?.email || null,
      role_id: r.role_id,
      role_name: r.Role?.name || null,
      status: r.status,
      created_at: r.created_at
    })));
  } catch (error) {
    console.error('List assignments error:', error);
    res.status(500).json({ message: error.message || 'Failed to list assignments' });
  }
};

// Update a role assignment (HR/Management only)
exports.updateAssignment = async (req, res) => {
  try {
    if (!['Management', 'HR'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const userId = req.params.id;
    const { assignmentId } = req.params;
    const { roleName, status } = req.body;
    const { UserRole } = require('../models');

    const row = await UserRole.findByPk(assignmentId, { include: [Role] });
    if (!row) return res.status(404).json({ message: 'Assignment not found' });
    if (row.user_id !== userId) return res.status(400).json({ message: 'User mismatch' });

    const updates = {};
    if (roleName) {
      const role = await Role.findOne({ where: { name: roleName } });
      if (!role) return res.status(400).json({ message: 'Invalid role' });
      updates.role_id = role.id;
    }
    if (status) updates.status = status;

    // No longer force other roles to Inactive when setting one to Active
    // Allow multiple active roles simultaneously

    await row.update(updates);
    res.json({ message: 'Updated' });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: error.message || 'Failed to update assignment' });
  }
};

// Delete a role assignment (HR/Management only)
exports.deleteAssignment = async (req, res) => {
  try {
    if (!['Management', 'HR'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const userId = req.params.id;
    const { assignmentId } = req.params;
    const { UserRole } = require('../models');
    const row = await UserRole.findByPk(assignmentId);
    if (!row) return res.status(404).json({ message: 'Assignment not found' });
    if (row.user_id !== userId) return res.status(400).json({ message: 'User mismatch' });
    await row.destroy();
    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: error.message || 'Failed to delete assignment' });
  }
};

// Bulk create staff from Excel upload
exports.bulkCreate = async (req, res) => {
  if (!['Management', 'HR'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (!data || data.length === 0) {
      return res.status(400).json({ message: 'Excel file is empty' });
    }

    // Get all departments, designations, and associations for mapping
    const [departments, designations, associations] = await Promise.all([
      Department.findAll(),
      Designation.findAll(),
      Association.findAll()
    ]);

    const departmentMap = {};
    departments.forEach(d => {
      departmentMap[d.dept_name.toLowerCase()] = d.id;
    });

    const designationMap = {};
    designations.forEach(d => {
      designationMap[d.name.toLowerCase()] = d.id;
    });

    const associationMap = {};
    associations.forEach(a => {
      associationMap[a.asso_name.toLowerCase()] = a.id;
    });

    const results = {
      success: [],
      errors: []
    };

    // Get employee role
    const employeeRole = await Role.findOne({ where: { name: 'Employee' } });
    if (!employeeRole) {
      return res.status(500).json({ message: 'Employee role not found in database' });
    }

    // Helpers
    const toTrimmedString = (v) => (v === null || v === undefined) ? '' : String(v).trim();
    const normalizeDate = (v) => {
      if (v === null || v === undefined || v === '') return null;
      if (v instanceof Date && !isNaN(v)) {
        return v.toISOString().slice(0, 10);
      }
      if (typeof v === 'number') {
        try {
          const parsed = XLSX.SSF.parse_date_code(v);
          if (parsed && parsed.y && parsed.m && parsed.d) {
            const mm = String(parsed.m).padStart(2, '0');
            const dd = String(parsed.d).padStart(2, '0');
            return `${parsed.y}-${mm}-${dd}`;
          }
        } catch (_) {}
      }
      const s = String(v).trim();
      // Accept formats like YYYY-MM-DD or DD/MM/YYYY etc.
      // Try Date parse as last resort
      const d = new Date(s);
      if (!isNaN(d)) return d.toISOString().slice(0, 10);
      return null;
    };

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2; // Excel row number (accounting for header)

      try {
        // Required fields validation
        const FirstName = toTrimmedString(row.FirstName);
        const MiddleName = toTrimmedString(row.MiddleName);
        const LastName = toTrimmedString(row.LastName);
        const Email = toTrimmedString(row.Email).toLowerCase();
        const EmployeeID = toTrimmedString(row.EmployeeID);

        if (!FirstName || !Email || !EmployeeID) {
          results.errors.push({
            row: rowNum,
            data: row,
            error: 'Missing required fields: FirstName, Email, or EmployeeID'
          });
          continue;
        }

        // Validate field lengths before creating staff
        const empId = EmployeeID || null;
        const firstName = FirstName || null;
        const middleName = MiddleName || '';
        const lastName = LastName || '';
        const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
        const bloodGroup = toTrimmedString(row.BloodGroup) || null;
        const panNo = toTrimmedString(row.PANNumber) || null;
        const aadharNo = toTrimmedString(row.AadharNumber) || null;
        const religion = toTrimmedString(row.Religion) || null;
        const emergencyRelation = toTrimmedString(row.EmergencyContactRelation) || null;

        // Field length validations
        if (!empId) {
          results.errors.push({
            row: rowNum,
            data: row,
            error: 'Employee ID is required'
          });
          continue;
        }

        if (empId.length > 20) {
          results.errors.push({
            row: rowNum,
            data: row,
            error: `Employee ID exceeds 20 characters (current: ${empId.length})`
          });
          continue;
        }

        if (firstName && firstName.length > 100) {
          results.errors.push({
            row: rowNum,
            data: row,
            error: `First Name exceeds 100 characters (current: ${firstName.length})`
          });
          continue;
        }

        if (middleName && middleName.length > 100) {
          results.errors.push({
            row: rowNum,
            data: row,
            error: `Middle Name exceeds 100 characters (current: ${middleName.length})`
          });
          continue;
        }

        if (lastName && lastName.length > 100) {
          results.errors.push({
            row: rowNum,
            data: row,
            error: `Last Name exceeds 100 characters (current: ${lastName.length})`
          });
          continue;
        }

        if (bloodGroup && bloodGroup.length > 10) {
          results.errors.push({
            row: rowNum,
            data: row,
            error: `Blood Group exceeds 10 characters (current: ${bloodGroup.length})`
          });
          continue;
        }

        if (panNo && panNo.length > 10) {
          results.errors.push({
            row: rowNum,
            data: row,
            error: `PAN Number exceeds 10 characters (current: ${panNo.length}). PAN should be in format: ABCDE1234F`
          });
          continue;
        }

        if (aadharNo && aadharNo.length > 12) {
          results.errors.push({
            row: rowNum,
            data: row,
            error: `Aadhar Number exceeds 12 characters (current: ${aadharNo.length})`
          });
          continue;
        }

        if (religion && religion.length > 50) {
          results.errors.push({
            row: rowNum,
            data: row,
            error: `Religion exceeds 50 characters (current: ${religion.length})`
          });
          continue;
        }

        if (emergencyRelation && emergencyRelation.length > 50) {
          results.errors.push({
            row: rowNum,
            data: row,
            error: `Emergency Contact Relation exceeds 50 characters (current: ${emergencyRelation.length})`
          });
          continue;
        }

        // Check if email already exists
        const existingUser = await User.findOne({ where: { email: Email } });
        if (existingUser) {
          results.errors.push({
            row: rowNum,
            data: row,
            error: `Email ${Email} already exists`
          });
          continue;
        }

        // Check if employee ID already exists
        const existingStaff = await Staff.findOne({ where: { emp_id: empId } });
        if (existingStaff) {
          results.errors.push({
            row: rowNum,
            data: row,
            error: `Employee ID ${empId} already exists`
          });
          continue;
        }

        // Map department, designation, association
        let departmentId = null;
        const DepartmentName = toTrimmedString(row.Department);
        if (DepartmentName) {
          departmentId = departmentMap[DepartmentName.toLowerCase()];
          if (!departmentId) {
            results.errors.push({
              row: rowNum,
              data: row,
              error: `Department "${DepartmentName}" not found`
            });
            continue;
          }
        }

        let designationId = null;
        const DesignationName = toTrimmedString(row.Designation);
        if (DesignationName) {
          designationId = designationMap[DesignationName.toLowerCase()];
          if (!designationId) {
            results.errors.push({
              row: rowNum,
              data: row,
              error: `Designation "${DesignationName}" not found`
            });
            continue;
          }
        }

        let associationId = null;
        const AssociationName = toTrimmedString(row.Association);
        if (AssociationName) {
          associationId = associationMap[AssociationName.toLowerCase()];
          if (!associationId) {
            results.errors.push({
              row: rowNum,
              data: row,
              error: `Association "${AssociationName}" not found`
            });
            continue;
          }
        }

        // Create user with default password
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await User.create({
          email: Email,
          password: hashedPassword
        });
        const { UserRole } = require('../models');
        await UserRole.create({ user_id: user.id, role_id: employeeRole.id, status: 'Active' });

        // Prepare staff data
        const staffPayload = {
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          emp_id: empId,
          religion: religion,
          date_of_birth: normalizeDate(row.DateOfBirth),
          phone_no: toTrimmedString(row.PhoneNumber) || null,
          blood_group: bloodGroup,
          emergency_contact_name: toTrimmedString(row.EmergencyContactName) || null,
          emergency_contact_number: toTrimmedString(row.EmergencyContactNumber) || null,
          emergency_contact_relation: emergencyRelation,
          pan_no: panNo,
          aadhar_no: aadharNo,
          date_of_joining: normalizeDate(row.DateOfJoining) || new Date().toISOString().split('T')[0],
          tpm_pillar: toTrimmedString(row.TPMPillar) || null,
          staff_img: null,
          //award_recognition: toTrimmedString(row.AwardRecognition) || null,
          gender: toTrimmedString(row.Gender) || null,
          address: toTrimmedString(row.Address) || null
        };

        // Create staff
        const staffInstance = await user.createStaff(staffPayload);

        // Set relationships
        const startDate = staffPayload.date_of_joining;

        if (departmentId) {
          await staffInstance.setDepartments([departmentId], {
            through: { start_date: startDate, end_date: null }
          });
        }

        if (designationId) {
          await staffInstance.setDesignations([designationId], {
            through: { start_date: startDate, end_date: null }
          });
        }

        if (associationId) {
          await staffInstance.setAssociations([associationId], {
            through: { start_date: startDate, end_date: null }
          });
        }

        results.success.push({
          row: rowNum,
          name: fullName,
          email: Email,
          empId: empId
        });

      } catch (error) {
        results.errors.push({
          row: rowNum,
          data: row,
          error: error.message
        });
      }
    }

    res.status(200).json({
      message: 'Bulk upload completed',
      total: data.length,
      successCount: results.success.length,
      errorCount: results.errors.length,
      results
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ message: error.message || 'Failed to process bulk upload' });
  }
};

// (Removed older XLSX-based template generator in favor of ExcelJS version below)

// Use ExcelJS for template with proper dropdowns using hidden reference sheet
exports.downloadTemplate = async (req, res) => {
  try {
    // Fetch all departments, designations, and associations for dropdowns
    const [departments, designations, associations] = await Promise.all([
      Department.findAll(),
      Designation.findAll(),
      Association.findAll()
    ]);

    // Predefined dropdown values
    const religionOptions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'];
    const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const relationOptions = ['Father', 'Mother', 'Spouse', 'Brother', 'Sister', 'Son', 'Daughter', 'Other'];
    const tpmPillarOptions = [
      'Focused Improvement',
      'Autonomous Maintenance',
      'Quality Maintenance',
      'Planned Maintenance',
      'Early Management',
      'Training & Education',
      'Safety, Environment & Health (SHE)',
      'Administrative TPM'
    ];

    // Create dropdown lists from database
    const departmentList = departments.map(d => d.dept_name);
    const designationList = designations.map(d => d.name);
    const associationList = associations.map(a => a.asso_name);

    // Create a new workbook with ExcelJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Staff Template');

    // Create hidden reference sheet for dropdown values
    const refSheet = workbook.addWorksheet('DropdownData');
    refSheet.state = 'hidden'; // Hide the reference sheet

    // Add dropdown data to reference sheet
    // Column A: Departments
    refSheet.getCell('A1').value = 'Departments';
    departmentList.forEach((dept, idx) => {
      refSheet.getCell(`A${idx + 2}`).value = dept;
    });

    // Column B: Designations
    refSheet.getCell('B1').value = 'Designations';
    designationList.forEach((desig, idx) => {
      refSheet.getCell(`B${idx + 2}`).value = desig;
    });

    // Column C: Religions
    refSheet.getCell('C1').value = 'Religions';
    religionOptions.forEach((rel, idx) => {
      refSheet.getCell(`C${idx + 2}`).value = rel;
    });

    // Column D: Associations
    refSheet.getCell('D1').value = 'Associations';
    associationList.forEach((asso, idx) => {
      refSheet.getCell(`D${idx + 2}`).value = asso;
    });

    // Column E: Blood Groups
    refSheet.getCell('E1').value = 'BloodGroups';
    bloodGroupOptions.forEach((bg, idx) => {
      refSheet.getCell(`E${idx + 2}`).value = bg;
    });

    // Column F: Relations
    refSheet.getCell('F1').value = 'Relations';
    relationOptions.forEach((rel, idx) => {
      refSheet.getCell(`F${idx + 2}`).value = rel;
    });

    // Column G: TPM Pillars
    refSheet.getCell('G1').value = 'TPMPillars';
    tpmPillarOptions.forEach((pillar, idx) => {
      refSheet.getCell(`G${idx + 2}`).value = pillar;
    });

    // Column H: Gender
    const genderOptions = ['Male', 'Female', 'Other'];
    refSheet.getCell('H1').value = 'Gender';
    genderOptions.forEach((gender, idx) => {
      refSheet.getCell(`H${idx + 2}`).value = gender;
    });

    // Define columns in main worksheet
    worksheet.columns = [
      { header: 'FirstName', key: 'firstName', width: 20 },
      { header: 'MiddleName', key: 'middleName', width: 20 },
      { header: 'LastName', key: 'lastName', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'EmployeeID', key: 'employeeId', width: 15 },
      { header: 'Department', key: 'department', width: 25 },
      { header: 'Designation', key: 'designation', width: 25 },
      { header: 'Religion', key: 'religion', width: 15 },
      { header: 'Association', key: 'association', width: 25 },
      { header: 'DateOfBirth', key: 'dateOfBirth', width: 15 },
      { header: 'PhoneNumber', key: 'phoneNumber', width: 15 },
      { header: 'BloodGroup', key: 'bloodGroup', width: 12 },
      { header: 'Gender', key: 'gender', width: 12 },
      { header: 'Address', key: 'address', width: 40 },
      { header: 'EmergencyContactName', key: 'emergencyContactName', width: 25 },
      { header: 'EmergencyContactNumber', key: 'emergencyContactNumber', width: 20 },
      { header: 'EmergencyContactRelation', key: 'emergencyContactRelation', width: 25 },
      { header: 'PANNumber', key: 'panNumber', width: 15 },
      { header: 'AadharNumber', key: 'aadharNumber', width: 15 },
      { header: 'DateOfJoining', key: 'dateOfJoining', width: 15 },
      { header: 'TPMPillar', key: 'tpmPillar', width: 30 },
      //{ header: 'AwardRecognition', key: 'awardRecognition', width: 30 }
    ];

    // Template now has headers only, no example data

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' }
    };

    // Add data validations (dropdowns) for rows 2 to 1001 using reference sheet
    for (let rowNum = 2; rowNum <= 1001; rowNum++) {
      // Department dropdown (Column F) - Reference to hidden sheet
      if (departmentList.length > 0) {
        worksheet.getCell(`F${rowNum}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`DropdownData!$A$2:$A$${departmentList.length + 1}`],
          showErrorMessage: true,
          errorTitle: 'Invalid Department',
          error: 'Please select a department from the list'
        };
      }

      // Designation dropdown (Column G)
      if (designationList.length > 0) {
        worksheet.getCell(`G${rowNum}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`DropdownData!$B$2:$B$${designationList.length + 1}`],
          showErrorMessage: true,
          errorTitle: 'Invalid Designation',
          error: 'Please select a designation from the list'
        };
      }

      // Religion dropdown (Column H)
      worksheet.getCell(`H${rowNum}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`DropdownData!$C$2:$C$${religionOptions.length + 1}`],
        showErrorMessage: true,
        errorTitle: 'Invalid Religion',
        error: 'Please select a religion from the list'
      };

      // Association dropdown (Column I)
      if (associationList.length > 0) {
        worksheet.getCell(`I${rowNum}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`DropdownData!$D$2:$D$${associationList.length + 1}`],
          showErrorMessage: true,
          errorTitle: 'Invalid Association',
          error: 'Please select an association from the list'
        };
      }

      // Blood Group dropdown (Column L)
      worksheet.getCell(`L${rowNum}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`DropdownData!$E$2:$E$${bloodGroupOptions.length + 1}`],
        showErrorMessage: true,
        errorTitle: 'Invalid Blood Group',
        error: 'Please select a blood group from the list'
      };

      // Gender dropdown (Column M)
      worksheet.getCell(`M${rowNum}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['DropdownData!$H$2:$H$4'],
        showErrorMessage: true,
        errorTitle: 'Invalid Gender',
        error: 'Please select a gender from the list'
      };

      // Emergency Contact Relation dropdown (Column Q)
      worksheet.getCell(`Q${rowNum}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`DropdownData!$F$2:$F$${relationOptions.length + 1}`],
        showErrorMessage: true,
        errorTitle: 'Invalid Relation',
        error: 'Please select a relation from the list'
      };

      // TPM Pillar dropdown (Column U)
      worksheet.getCell(`U${rowNum}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`DropdownData!$G$2:$G$${tpmPillarOptions.length + 1}`],
        showErrorMessage: true,
        errorTitle: 'Invalid TPM Pillar',
        error: 'Please select a TPM pillar from the list'
      };
    }

    // Add instructions in a note/comment on the first row
    worksheet.getCell('A1').note = {
      texts: [
        { 
          font: { size: 10, color: { theme: 1 }, name: 'Calibri', family: 2, scheme: 'minor' },
          text: 'Instructions:\n1. Fill in all required fields\n2. Use dropdowns for Department, Designation, Religion, Association, Blood Group, Emergency Contact Relation, and TPM Pillar\n3. Date format: YYYY-MM-DD\n4. Phone numbers: 10 digits\n5. PAN: 10 characters\n6. Aadhar: 12 digits'
        }
      ]
    };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Set headers and send file
    res.setHeader('Content-Disposition', 'attachment; filename=staff_upload_template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error) {
    console.error('Template download error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate template' });
  }
};