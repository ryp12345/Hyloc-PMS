// DUPLICATE_LEAVE_CALENDAR_DISABLED: 2025-11-15 — Disabled duplicate leave management (Calendar routes)
// Entire calendar routes file commented out to disable the duplicate API.
/*
const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/calendar.controller');

router.use(authenticate);
router.get('/events', ctrl.events);

module.exports = router;
*/

// Export an empty router to avoid runtime errors if imported accidentally
const router = require('express').Router();
module.exports = router;
