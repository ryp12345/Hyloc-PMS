const router = require('express').Router();
const milestoneController = require('../controllers/milestone.controller');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

router.get('/', milestoneController.findAll);
router.get('/:id', milestoneController.findOne);
router.post('/', milestoneController.create);
router.put('/:id', milestoneController.update);
router.delete('/:id', milestoneController.delete);

module.exports = router;
