const express = require('express');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const { createAsset, getMyAssets } = require('../controllers/assetController');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 104857600 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    // Allow all files - just check extension doesn't look suspicious
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Reject executable files and scripts for security
    const blockedExtensions = ['.exe', '.bat', '.cmd', '.sh', '.com', '.pif', '.scr'];
    
    if (blockedExtensions.includes(ext)) {
      return cb(new Error('Executable files are not allowed'));
    }
    
    // Allow everything else
    cb(null, true);
  }
});

const router = express.Router();

router.post('/signature', protect, (req, res) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, createAsset);
router.get('/my', protect, getMyAssets);

// File upload endpoint (fallback when Cloudinary CDN is unavailable)
router.post('/upload', protect, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      message: 'File uploaded successfully',
      fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
