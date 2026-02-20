const Asset = require('../models/Asset');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createAsset = async (req, res) => {
  try {
    const { title, description, fileUrl } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!fileUrl) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const publicId = fileUrl.split('/').pop().split('.')[0];
    const resource = await cloudinary.api.resource(publicId);

    const fileType = resource.type === 'image' ? 'image' : 'video';

    const asset = await Asset.create({
      user: req.user._id,
      title,
      description: description || '',
      fileUrl,
      fileType,
      mimeType: resource.format,
      originalName: title,
      size: resource.bytes || 0,
    });

    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyAssets = async (req, res) => {
  try {
    const assets = await Asset.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAsset,
  getMyAssets,
};
