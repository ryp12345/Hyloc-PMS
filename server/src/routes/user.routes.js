const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/users.controller');

router.use(authenticate);
router.get('/staff-names', ctrl.getStaffNames); // Must be before /:id route
router.get('/staff-by-department', ctrl.getStaffByDepartment); // Must be before /:id route
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
