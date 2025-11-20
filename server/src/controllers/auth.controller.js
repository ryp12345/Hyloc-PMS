const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User, Role, Staff, Department, Designation, Association } = require('../models');

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

function signAccessToken(user, roleName) {
  return jwt.sign({ id: user.id, role: roleName }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || '15m',
  });
}

function signRefreshToken(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });
}

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, role = 'Employee' } = req.body;
  try {
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email already in use' });
    const roleRow = await Role.findOne({ where: { name: role } });
    if (!roleRow) return res.status(400).json({ message: 'Invalid role' });

    const hashed = await bcrypt.hash(password, 10);
    const created = await User.create({ email, password: hashed });
    // assign role via user_roles
    const { UserRole } = require('../models');
    await UserRole.create({ user_id: created.id, role_id: roleRow.id, status: 'Active' });

    const full = await User.findByPk(created.id, { 
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

    const activeRole = (full.Roles || []).find(r => r.UserRole?.status === 'Active')?.name || roleRow.name;
    const access = signAccessToken(full, activeRole);
    const refresh = signRefreshToken(full);
    res.json({ 
      user: { 
        id: full.id, 
        email: full.email, 
        role: activeRole,
        staff: full.Staff,
        fullName: buildFullName(full.Staff)
      }, 
      accessToken: access, 
      refreshToken: refresh 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, selectedRole } = req.body;
  try {
    const user = await User.findOne({ 
      where: { email }, 
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
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    // Get all active roles
    const activeRoles = (user.Roles || [])
      .filter(r => r.UserRole?.status === 'Active')
      .map(r => r.name);

    // If user has multiple roles and no role selected, return roles for selection
    if (activeRoles.length > 1 && !selectedRole) {
      return res.json({
        requiresRoleSelection: true,
        availableRoles: activeRoles,
        user: {
          id: user.id,
          email: user.email,
          staff: user.Staff,
          fullName: buildFullName(user.Staff)
        }
      });
    }

    // Validate selected role if provided
    if (selectedRole && !activeRoles.includes(selectedRole)) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }
    
    // Use selected role or the only available role
    const roleToUse = selectedRole || activeRoles[0] || null;

    const access = signAccessToken(user, roleToUse);
    const refresh = signRefreshToken(user);
    res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        role: roleToUse,
        availableRoles: activeRoles,
        staff: user.Staff,
        fullName: buildFullName(user.Staff)
      }, 
      accessToken: access, 
      refreshToken: refresh 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
};

exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Missing refresh token' });
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(payload.id, { 
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
    if (!user) return res.status(401).json({ message: 'Invalid refresh token' });
    const activeRole = (user.Roles || []).find(r => r.UserRole?.status === 'Active')?.name || null;
    const access = signAccessToken(user, activeRole);
    const newRefresh = signRefreshToken(user);
    res.json({ accessToken: access, refreshToken: newRefresh });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { 
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
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ 
      id: user.id, 
      email: user.email, 
      role: (user.Roles || []).find(r => r.UserRole?.status === 'Active')?.name || null,
      staff: user.Staff,
      fullName: buildFullName(user.Staff)
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

exports.logout = async (req, res) => {
  // Stateless JWT: client should drop tokens; server may implement blacklist if needed.
  return res.json({ message: 'Logged out' });
};

exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return res.status(401).json({ message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashed });

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to change password' });
  }
};

exports.switchRole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { roleId } = req.body;
  try {
    const user = await User.findByPk(req.user.id, {
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
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify user has access to this role
    const hasRole = (user.Roles || []).some(r => 
      r.id === roleId && r.UserRole?.status === 'Active'
    );
    
    if (!hasRole) {
      return res.status(403).json({ message: 'You do not have access to this role' });
    }

    const selectedRole = user.Roles.find(r => r.id === roleId);
    const access = signAccessToken(user, selectedRole.name);
    const refresh = signRefreshToken(user);

    const activeRoles = (user.Roles || [])
      .filter(r => r.UserRole?.status === 'Active')
      .map(r => r.name);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: selectedRole.name,
        availableRoles: activeRoles,
        staff: user.Staff,
        fullName: buildFullName(user.Staff)
      },
      accessToken: access,
      refreshToken: refresh
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to switch role' });
  }
};
