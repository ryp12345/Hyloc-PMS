const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const associationController = require('../controllers/association.controller');

router.use(authenticate);
router.get('/', authorize(['HR','Management']), associationController.findAll);
router.get('/:id', authorize(['HR','Management']), associationController.findOne);
router.post('/', authorize(['HR','Management']), associationController.create);
router.put('/:id', authorize(['HR','Management']), associationController.update);
router.delete('/:id', authorize(['HR','Management']), associationController.delete);

module.exports = router;
