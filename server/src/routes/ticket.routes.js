const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/tickets.controller');

router.use(authenticate);
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.patch('/:id/status', ctrl.updateStatus);

module.exports = router;
