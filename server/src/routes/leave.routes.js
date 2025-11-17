const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/leaves.controller');

router.use(authenticate);
router.post('/', ctrl.apply);
router.get('/mine', ctrl.myLeaves);
router.get('/pending', ctrl.pendingLeaves);
router.get('/balance', ctrl.getLeaveBalance);
router.get('/all', ctrl.allLeaves);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/:id/approve', ctrl.approve);
router.post('/:id/reject', ctrl.reject);

module.exports = router;
