const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User, Role, Staff, Department, Designation, Association } = require('../models');

function signAccessToken(user) {
  return jwt.sign({ id: user.id, role: user.Role?.name || user.roleName }, process.env.JWT_SECRET, {
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

  const { name, email, password, role = 'Employee' } = req.body;
  try {
    const exists = await User.findOne({ where: { email }, include: Role });
    if (exists) return res.status(409).json({ message: 'Email already in use' });
    const roleRow = await Role.findOne({ where: { name: role } });
    if (!roleRow) return res.status(400).json({ message: 'Invalid role' });

    const hashed = await bcrypt.hash(password, 10);
    const created = await User.create({ name, email, password: hashed, RoleId: roleRow.id });
    const full = await User.findByPk(created.id, { 
      include: [
        Role, 
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

    const access = signAccessToken(full);
    const refresh = signRefreshToken(full);
    res.json({ 
      user: { 
        id: full.id, 
        name: full.name, 
        email: full.email, 
        role: full.Role.name,
        staff: full.Staff 
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

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ 
      where: { email }, 
      include: [
        Role,
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

    const access = signAccessToken(user);
    const refresh = signRefreshToken(user);
    res.json({ 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.Role ? user.Role.name : null,
        staff: user.Staff 
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
        Role,
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
    const access = signAccessToken(user);
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
        Role,
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
      name: user.name, 
      email: user.email, 
      role: user.Role ? user.Role.name : null,
      staff: user.Staff 
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
