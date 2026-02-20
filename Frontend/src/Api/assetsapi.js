import axiosInstance from './axiosinstance';

// Get Cloudinary signature for unsigned upload
export const getCloudinarySignature = async () => {
  try {
    const response = await axiosInstance.post('/assets/signature');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create asset
export const createAsset = async (title, description, fileUrl, fileType) => {
  try {
    const response = await axiosInstance.post('/assets', {
      title,
      description,
      fileUrl,
      fileType,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get user's assets
export const getMyAssets = async () => {
  try {
    const response = await axiosInstance.get('/assets/my');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete asset
export const deleteAsset = async (assetId) => {
  try {
    const response = await axiosInstance.delete(`/assets/${assetId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update asset
export const updateAsset = async (assetId, title, description) => {
  try {
    const response = await axiosInstance.patch(`/assets/${assetId}`, {
      title,
      description,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  getCloudinarySignature,
  createAsset,
  getMyAssets,
  deleteAsset,
  updateAsset,
};
