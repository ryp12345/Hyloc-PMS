const bcrypt = require('bcryptjs');
const { User, Role, Staff, Department, Designation } = require('../models');

exports.list = async (req, res) => {
  if (!['Management', 'HR'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const users = await User.findAll({ include: [Role, { model: Staff, include: [{ model: Department, as: 'Department' }, { model: Designation, as: 'Designation' }] }], attributes: { exclude: ['password'] } });
  res.json(users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.Role?.name, staff: u.Staff })));
};

exports.get = async (req, res) => {
  const user = await User.findByPk(req.params.id, { include: [Role, { model: Staff, include: [{ model: Department, as: 'Department' }, { model: Designation, as: 'Designation' }] }] });
  if (!user) return res.status(404).json({ message: 'Not found' });
  if (req.user.id !== user.id && !['Management','HR'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  res.json({ id: user.id, name: user.name, email: user.email, role: user.Role?.name, staff: user.Staff });
};

exports.create = async (req, res) => {
  if (!['Management', 'HR'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const { name, email, password, roleName = 'Employee', staff } = req.body;
  const role = await Role.findOne({ where: { name: roleName } });
  if (!role) return res.status(400).json({ message: 'Invalid role' });
  const hashed = await bcrypt.hash(password || 'password123', 10);
  const user = await User.create({ name, email, password: hashed, RoleId: role.id });
  if (staff) {
    const payload = { ...staff, UserId: user.id, name: staff.name || name };
    // Normalize possible camelCase keys from client
    if (payload.departmentId && !payload.department_id) payload.department_id = payload.departmentId;
    if (payload.designationId && !payload.designation_id) payload.designation_id = payload.designationId;
    await Staff.create(payload);
  }
  const full = await User.findByPk(user.id, { include: [Role, { model: Staff, include: [{ model: Department, as: 'Department' }, { model: Designation, as: 'Designation' }] }] });
  res.status(201).json({ id: full.id, name: full.name, email: full.email, role: full.Role.name, staff: full.Staff });
};

exports.update = async (req, res) => {
  const user = await User.findByPk(req.params.id, { include: [Role, Staff] });
  if (!user) return res.status(404).json({ message: 'Not found' });
  const canManage = ['Management', 'HR'].includes(req.user.role);
  if (req.user.id !== user.id && !canManage) return res.status(403).json({ message: 'Forbidden' });
  const { name, email, password, roleName, staff } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (password) user.password = await bcrypt.hash(password, 10);
  if (roleName && canManage) {
    const role = await Role.findOne({ where: { name: roleName } });
    if (role) user.RoleId = role.id;
  }
  await user.save();
  if (staff) {
    const payload = { ...staff };
    if (payload.departmentId && !payload.department_id) payload.department_id = payload.departmentId;
    if (payload.designationId && !payload.designation_id) payload.designation_id = payload.designationId;
    if (user.Staff) {
      await user.Staff.update(payload);
    } else {
      await Staff.create({ ...payload, UserId: user.id, name: staff.name || user.name });
    }
  }
  const full = await User.findByPk(user.id, { include: [Role, { model: Staff, include: [{ model: Department, as: 'Department' }, { model: Designation, as: 'Designation' }] }] });
  res.json({ id: full.id, name: full.name, email: full.email, role: full.Role?.name, staff: full.Staff });
};

exports.remove = async (req, res) => {
  if (!['Management', 'HR'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  await user.destroy();
  res.json({ message: 'Deleted' });
};

// Get staff names for dropdown (accessible to all authenticated users)
exports.getStaffNames = async (req, res) => {
  const users = await User.findAll({ 
    include: [Role, Staff], 
    attributes: ['id', 'name', 'email'] 
  });
  // Include all users (including the logged-in user)
  res.json(users.map(u => ({ 
    id: u.id, 
    name: u.name, 
    email: u.email,
    role: u.Role?.name || null,
    designation: u.Staff?.designation || null 
  })));
};

// Get staff names by department (for alternate selection)
exports.getStaffByDepartment = async (req, res) => {
  const { department_id } = req.query;
  if (!department_id) return res.status(400).json({ message: 'department_id is required' });
  const users = await User.findAll({
    include: [
      Role,
      {
        model: Staff,
        where: { department_id },
        required: true
      }
    ],
    attributes: ['id', 'name']
  });
  // Include all users (including the logged-in user)
  res.json(users.map(u => ({
    id: u.id,
    name: u.name,
    designation: u.Staff?.designation || null
  })));
};
