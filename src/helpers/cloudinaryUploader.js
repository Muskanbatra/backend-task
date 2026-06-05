const cloudinary = require('../utils/cloudinaryConfig');

/**
 * Uploads an image to Cloudinary
 * @param {String} filePath - The local path of the image file
 * @param {Object} options - Additional options for the Cloudinary upload
 * @returns {Object} - Returns the result of the Cloudinary upload
 */
const uploadImage = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      overwrite: true,
      invalidate: true,
      resource_type: 'auto',
      ...options,
    });
    return result;
  } catch (error) {
    console.log(error)
    throw new Error(error.message);
  }
};

/**
 * Deletes an image from Cloudinary
 * @param {String} publicId - The public ID of the image to delete
 * @returns {Object} - Returns the result of the Cloudinary deletion
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  deleteImage,
  uploadImage
}