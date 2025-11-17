const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/staff_images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Get staff info from request body
    const { staffId, firstName, middleName, lastName, oldImage } = req.body;
    const ext = path.extname(file.originalname);
    
    // Log received data for debugging
    console.log('Received upload data:', { staffId, firstName, middleName, lastName, oldImage });
    
    // Delete old image if exists
    if (oldImage) {
      const oldImagePath = path.join(uploadDir, path.basename(oldImage));
      if (fs.existsSync(oldImagePath)) {
        try {
          fs.unlinkSync(oldImagePath);
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }
    }
    
    // Create filename: firstName_middleName_lastName_timestamp.ext
    const nameParts = [
      firstName ? firstName.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') : '',
      middleName ? middleName.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') : '',
      lastName ? lastName.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') : ''
    ].filter(Boolean);
    const sanitizedName = nameParts.length > 0 ? nameParts.join('_') : 'staff';
    const timestamp = Date.now();
    const filename = `${sanitizedName}_${timestamp}${ext}`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Upload staff image
router.post('/staff-image', authenticate, upload.single('staffImage'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Return the filename to be stored in database
    res.json({
      message: 'File uploaded successfully',
      filename: req.file.filename,
      path: `/uploads/staff_images/${req.file.filename}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload file' });
  }
});

// Delete staff image
router.delete('/staff-image/:filename', authenticate, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Failed to delete file' });
  }
});

module.exports = router;
