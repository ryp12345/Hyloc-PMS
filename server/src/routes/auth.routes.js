const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/auth.controller');

router.post('/register', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['Management','Manager','Employee','HR'])
], ctrl.register);

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
  body('selectedRole').optional().isString()
], ctrl.login);

router.post('/refresh', [ body('refreshToken').notEmpty() ], ctrl.refresh);
router.get('/me', authenticate, ctrl.me);
router.post('/logout', authenticate, ctrl.logout);
router.post('/change-password', authenticate, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], ctrl.changePassword);
router.post('/switch-role', authenticate, [
  body('roleId').isInt()
], ctrl.switchRole);

module.exports = router;
