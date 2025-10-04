const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudinaryService {
  // Upload image from file path
  async uploadImage(filePath, options = {}) {
    try {
      const defaultOptions = {
        folder: 'ecotrack/pickup-requests',
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
        tags: ['waste', 'pickup-request'],
        ...options
      };

      const result = await cloudinary.uploader.upload(filePath, defaultOptions);
      
      return {
        success: true,
        data: {
          publicId: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          createdAt: result.created_at
        }
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload image from buffer (useful for multer uploads)
  async uploadImageFromBuffer(buffer, options = {}) {
    try {
      const defaultOptions = {
        folder: 'ecotrack/pickup-requests',
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
        tags: ['waste', 'pickup-request'],
        ...options
      };

      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          defaultOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve({
                success: true,
                data: {
                  publicId: result.public_id,
                  url: result.secure_url,
                  width: result.width,
                  height: result.height,
                  format: result.format,
                  bytes: result.bytes,
                  createdAt: result.created_at
                }
              });
            }
          }
        ).end(buffer);
      });
    } catch (error) {
      console.error('Cloudinary buffer upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete image from Cloudinary
  async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return {
        success: result.result === 'ok',
        message: result.result === 'ok' ? 'Image deleted successfully' : 'Failed to delete image'
      };
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get optimized image URL with transformations
  getOptimizedImageUrl(publicId, transformations = {}) {
    if (!publicId) return null;

    const defaultTransforms = {
      quality: 'auto',
      fetch_format: 'auto',
      width: 400,
      height: 300,
      crop: 'fill',
      ...transformations
    };

    return cloudinary.url(publicId, defaultTransforms);
  }

  // Get thumbnail URL
  getThumbnailUrl(publicId, size = 150) {
    return cloudinary.url(publicId, {
      width: size,
      height: size,
      crop: 'thumb',
      quality: 'auto',
      fetch_format: 'auto'
    });
  }

  // Validate Cloudinary configuration
  validateConfig() {
    const { cloud_name, api_key, api_secret } = cloudinary.config();
    return {
      isValid: !!(cloud_name && api_key && api_secret),
      config: {
        cloud_name: cloud_name || 'Not set',
        api_key: api_key ? '***' + api_key.slice(-4) : 'Not set',
        api_secret: api_secret ? '***' + api_secret.slice(-4) : 'Not set'
      }
    };
  }
}

// Create singleton instance
const cloudinaryService = new CloudinaryService();

module.exports = cloudinaryService;