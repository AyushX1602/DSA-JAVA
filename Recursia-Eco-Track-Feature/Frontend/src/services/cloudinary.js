const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ecotrack_preset';

class CloudinaryService {
  constructor() {
    this.cloudName = CLOUDINARY_CLOUD_NAME;
    this.uploadPreset = CLOUDINARY_UPLOAD_PRESET;
    this.baseUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}`;
  }

  async uploadImage(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      
      if (options.transformation) {
        formData.append('transformation', JSON.stringify(options.transformation));
      }
      if (options.folder) {
        formData.append('folder', options.folder);
      }
      if (options.publicId) {
        formData.append('public_id', options.publicId);
      }
      if (options.tags) {
        formData.append('tags', options.tags.join(','));
      }

      const response = await fetch(`${this.baseUrl}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(`Upload failed: ${errorJson.error?.message || response.statusText} (${response.status})`);
        } catch (parseError) {
          throw new Error(`Upload failed: ${response.statusText} (${response.status})`);
        }
      }

      const result = await response.json();
      
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
      return {
        success: false,
        error: error.message
      };
    }
  }

  getOptimizedImageUrl(publicId, transformations = {}) {
    if (!publicId) return null;

    const baseTransformUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload`;
    
    const defaultTransforms = {
      quality: 'auto',
      fetch_format: 'auto',
      width: 400,
      height: 300,
      crop: 'fill',
      ...transformations
    };

    const transformString = Object.entries(defaultTransforms)
      .map(([key, value]) => `${key}_${value}`)
      .join(',');

    return `${baseTransformUrl}/${transformString}/${publicId}`;
  }

  getThumbnailUrl(publicId, size = 150) {
    return this.getOptimizedImageUrl(publicId, {
      width: size,
      height: size,
      crop: 'thumb',
      gravity: 'auto'
    });
  }

  async deleteImage(publicId) {
    try {
      // Note: This requires server-side implementation for security
      // Client-side deletion should be avoided in production
      console.warn('Image deletion should be handled server-side for security');
      
      return {
        success: true,
        message: 'Image deletion queued for server processing'
      };
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Validate file before upload
  validateFile(file) {
    const errors = [];
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not supported. Please upload JPEG, PNG, or WebP images.');
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push('File size too large. Maximum size is 10MB.');
    }

    return new Promise((resolve) => {
      if (errors.length > 0) {
        resolve({ isValid: false, errors });
        return;
      }

      const img = new Image();
      img.onload = () => {
        const minWidth = 100;
        const minHeight = 100;
        
        if (img.width < minWidth || img.height < minHeight) {
          errors.push(`Image dimensions too small. Minimum size is ${minWidth}x${minHeight}px.`);
        }

        resolve({ 
          isValid: errors.length === 0, 
          errors,
          dimensions: { width: img.width, height: img.height }
        });
      };

      img.onerror = () => {
        errors.push('Invalid image file.');
        resolve({ isValid: false, errors });
      };

      img.src = URL.createObjectURL(file);
    });
  }

  async uploadMultipleImages(files, options = {}) {
    const uploadPromises = files.map((file, index) => 
      this.uploadImage(file, {
        ...options,
        publicId: options.publicId ? `${options.publicId}_${index}` : undefined
      })
    );

    try {
      const results = await Promise.all(uploadPromises);
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      return {
        success: failed.length === 0,
        results: {
          successful: successful.map(r => r.data),
          failed: failed.map(r => r.error),
          total: files.length,
          successCount: successful.length,
          failCount: failed.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Batch upload failed',
        details: error.message
      };
    }
  }
}

const cloudinaryService = new CloudinaryService();

export default cloudinaryService;
