const express = require('express');
const cloudinary = require('cloudinary').v2;
const { protect } = require('../middleware/authMiddleware');
const { createAsset, getMyAssets } = require('../controllers/assetController');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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

module.exports = router;
