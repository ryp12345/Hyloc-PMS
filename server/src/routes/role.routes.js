const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const roleController = require('../controllers/role.controller');

router.use(authenticate);
// Allow all authenticated users to view roles
router.get('/', roleController.findAll);
router.get('/:id', roleController.findOne);
// Only HR/Management can create, update, delete
router.post('/', authorize(['HR','Management']), roleController.create);
router.put('/:id', authorize(['HR','Management']), roleController.update);
router.delete('/:id', authorize(['HR','Management']), roleController.delete);

module.exports = router;
