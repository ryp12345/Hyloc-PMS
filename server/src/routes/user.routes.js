const router = require('express').Router();
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/users.controller');

// Configure multer for file upload (memory storage for Excel files)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  }
});

router.use(authenticate);
router.get('/staff-names', ctrl.getStaffNames); // Must be before /:id route
router.get('/staff-by-department', ctrl.getStaffByDepartment); // Must be before /:id route
router.get('/download-template', ctrl.downloadTemplate); // Download Excel template
router.post('/bulk-upload', upload.single('file'), ctrl.bulkCreate); // Bulk upload
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
