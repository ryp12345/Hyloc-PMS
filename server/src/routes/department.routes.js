const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const departmentController = require('../controllers/department.controller');

router.use(authenticate);
router.get('/', authorize(['HR','Management']), departmentController.findAll);
router.get('/:id', authorize(['HR','Management']), departmentController.findOne);
router.post('/', authorize(['HR','Management']), departmentController.create);
router.put('/:id', authorize(['HR','Management']), departmentController.update);
router.delete('/:id', authorize(['HR','Management']), departmentController.delete);

module.exports = router;
