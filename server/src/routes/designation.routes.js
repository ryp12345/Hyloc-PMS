const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const designationController = require('../controllers/designation.controller');

router.use(authenticate);
router.get('/', authorize(['HR','Management']), designationController.findAll);
router.get('/:id', authorize(['HR','Management']), designationController.findOne);
router.post('/', authorize(['HR','Management']), designationController.create);
router.put('/:id', authorize(['HR','Management']), designationController.update);
router.delete('/:id', authorize(['HR','Management']), designationController.delete);

module.exports = router;
