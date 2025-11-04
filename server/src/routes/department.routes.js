const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const departmentController = require('../controllers/department.controller');

router.use(authenticate);
// Allow all authenticated users to view departments
router.get('/', departmentController.findAll);
router.get('/:id', departmentController.findOne);
// Only HR/Management can create, update, delete
router.post('/', authorize(['HR','Management']), departmentController.create);
router.put('/:id', authorize(['HR','Management']), departmentController.update);
router.delete('/:id', authorize(['HR','Management']), departmentController.delete);

module.exports = router;
