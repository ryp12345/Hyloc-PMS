const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/kmi.controller');

router.use(authenticate);
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
