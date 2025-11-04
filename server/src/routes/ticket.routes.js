const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/tickets.controller');

router.use(authenticate);

// List tickets with filters (scope, status, priority, department)
router.get('/', ctrl.list);

// Get single ticket
router.get('/:id', ctrl.getById);

// Create new ticket
router.post('/', ctrl.create);

// Assign ticket to responsible person (Manager/Management only)
router.patch('/:id/assign', ctrl.assignTicket);

// Update ticket status and resolution
router.patch('/:id/status', ctrl.updateStatus);

// Delete ticket
router.delete('/:id', ctrl.deleteTicket);

module.exports = router;
