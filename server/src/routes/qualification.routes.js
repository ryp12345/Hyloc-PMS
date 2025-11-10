const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const qualificationController = require('../controllers/qualification.controller');

router.use(authenticate);
// Only HR/Management can access qualifications
router.get('/', authorize(['HR','Management']), qualificationController.findAll);
router.get('/:id', authorize(['HR','Management']), qualificationController.findOne);
router.post('/', authorize(['HR','Management']), qualificationController.create);
router.put('/:id', authorize(['HR','Management']), qualificationController.update);
router.delete('/:id', authorize(['HR','Management']), qualificationController.delete);

module.exports = router;
