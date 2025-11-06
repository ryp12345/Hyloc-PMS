const router = require('express').Router();
const goalController = require('../controllers/goal.controller');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET /api/goals/stats must come before /:id
router.get('/stats', goalController.getStats);
router.get('/', goalController.findAll);
router.get('/:id', goalController.findOne);
router.post('/', goalController.create);
router.put('/:id', goalController.update);
router.delete('/:id', goalController.delete);

module.exports = router;
