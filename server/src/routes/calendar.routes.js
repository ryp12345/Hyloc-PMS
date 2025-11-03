const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/calendar.controller');

router.use(authenticate);
router.get('/events', ctrl.events);

module.exports = router;
