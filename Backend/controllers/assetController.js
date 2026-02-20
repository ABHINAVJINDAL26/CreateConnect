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

    let fileType = 'file';
    let mimeType = 'application/octet-stream';
    let fileSize = 0;

    // Check if it's a Cloudinary URL or local file URL
    if (fileUrl.includes('cloudinary.com')) {
      // Handle Cloudinary URL
      try {
        const publicId = fileUrl.split('/').pop().split('.')[0];
        const resource = await cloudinary.api.resource(publicId);
        fileType = resource.type === 'image' ? 'image' : 'video';
        mimeType = resource.format;
        fileSize = resource.bytes || 0;
      } catch (err) {
        console.warn('Could not fetch Cloudinary resource info:', err.message);
        // Fallback for Cloudinary URLs if resource fetch fails
        fileType = fileUrl.includes('.mp4') || fileUrl.includes('.avi') || fileUrl.includes('.mov') ? 'video' : 'image';
      }
    } else if (fileUrl.includes('/uploads/')) {
      // Handle local file uploads
      const filename = fileUrl.split('/').pop();
      const ext = filename.split('.').pop().toLowerCase();
      
      // Determine file type and mime type based on extension
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) {
        fileType = 'image';
        mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext === 'svg' ? 'svg+xml' : ext}`;
      } else if (['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv'].includes(ext)) {
        fileType = 'video';
        mimeType = `video/${ext === 'mkv' ? 'x-matroska' : ext}`;
      } else if (['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'].includes(ext)) {
        fileType = 'audio';
        mimeType = `audio/${ext === 'mp3' ? 'mpeg' : ext === 'wav' ? 'wav' : ext === 'm4a' ? 'mp4' : ext}`;
      } else if (ext === 'pdf') {
        fileType = 'document';
        mimeType = 'application/pdf';
      } else if (['doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
        fileType = 'document';
        if (ext === 'doc') mimeType = 'application/msword';
        else if (ext === 'docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        else if (ext === 'txt') mimeType = 'text/plain';
        else if (ext === 'xls') mimeType = 'application/vnd.ms-excel';
        else if (ext === 'xlsx') mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        else if (ext === 'ppt') mimeType = 'application/vnd.ms-powerpoint';
        else if (ext === 'pptx') mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      } else {
        // Default to generic file type for any other file
        fileType = 'file';
        mimeType = 'application/octet-stream';
      }
      
      fileSize = 0; // We don't track size for local uploads yet
    }

    const asset = await Asset.create({
      user: req.user._id,
      title,
      description: description || '',
      fileUrl,
      fileType,
      mimeType,
      originalName: title,
      size: fileSize,
    });

    res.status(201).json(asset);
  } catch (error) {
    console.error('Create asset error:', error);
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
