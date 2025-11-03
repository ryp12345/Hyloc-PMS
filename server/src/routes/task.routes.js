const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/tasks.controller');

router.use(authenticate);
router.get('/mine', ctrl.myTasks);
router.get('/created', ctrl.createdByMe);
router.post('/quick-capture', ctrl.quickCapture);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
