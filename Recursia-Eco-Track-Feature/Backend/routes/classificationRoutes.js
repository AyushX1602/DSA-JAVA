const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cloudinary = require('cloudinary').v2;
const { auth } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// ML Service configuration
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

/**
 * @route POST /api/classification/classify
 * @desc Classify waste image and store in Cloudinary
 * @access Private
 */
router.post('/classify', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const userId = req.user.id;
    const { location, description } = req.body;

    logger.info(`Classification request from user ${userId}`);

    // Step 1: Get classification from ML service
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    let classificationResult;
    try {
      const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000, // 30 seconds timeout
      });

      classificationResult = mlResponse.data;
      
      if (!classificationResult.success) {
        throw new Error('Classification failed');
      }
    } catch (mlError) {
      logger.error('ML Service error:', mlError.message);
      return res.status(503).json({
        success: false,
        message: 'Waste classification service unavailable',
        error: process.env.NODE_ENV === 'development' ? mlError.message : undefined
      });
    }

    // Step 2: Upload image to Cloudinary with classification metadata
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'ecotrack/waste-classifications',
          resource_type: 'image',
          public_id: `classification_${userId}_${Date.now()}`,
          tags: [
            'waste-classification',
            classificationResult.prediction.class,
            `user_${userId}`,
            `confidence_${Math.round(classificationResult.prediction.confidence * 100)}`
          ],
          context: {
            user_id: userId,
            waste_type: classificationResult.prediction.class,
            confidence: classificationResult.prediction.confidence.toString(),
            timestamp: new Date().toISOString(),
            location: location || '',
            description: description || ''
          }
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    // Step 3: Prepare response data
    const responseData = {
      success: true,
      message: 'Image classified and stored successfully',
      data: {
        classification: {
          predicted_class: classificationResult.prediction.class,
          confidence: classificationResult.prediction.confidence,
          class_index: classificationResult.prediction.class_index,
          top3_predictions: classificationResult.top3_predictions
        },
        image: {
          cloudinary_id: uploadResult.public_id,
          url: uploadResult.secure_url,
          thumbnail_url: uploadResult.secure_url.replace('/upload/', '/upload/c_thumb,w_300,h_300/'),
          created_at: uploadResult.created_at
        },
        metadata: {
          user_id: userId,
          location: location || null,
          description: description || null,
          timestamp: new Date().toISOString()
        }
      }
    };

    logger.info(`Classification successful for user ${userId}: ${classificationResult.prediction.class} (${(classificationResult.prediction.confidence * 100).toFixed(2)}%)`);

    res.status(200).json(responseData);

  } catch (error) {
    logger.error('Classification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during classification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/classification/history
 * @desc Get user's classification history
 * @access Private
 */
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, waste_type } = req.query;

    // Build search query for Cloudinary
    let searchQuery = `folder:ecotrack/waste-classifications AND tags:user_${userId}`;
    
    if (waste_type) {
      searchQuery += ` AND tags:${waste_type}`;
    }

    // Get images from Cloudinary
    const searchResult = await cloudinary.search
      .expression(searchQuery)
      .sort_by([['created_at', 'desc']])
      .max_results(parseInt(limit))
      .with_field('context')
      .with_field('tags')
      .execute();

    const classifications = searchResult.resources.map(resource => ({
      id: resource.public_id,
      url: resource.secure_url,
      thumbnail_url: resource.secure_url.replace('/upload/', '/upload/c_thumb,w_300,h_300/'),
      waste_type: resource.context?.waste_type || 'unknown',
      confidence: parseFloat(resource.context?.confidence || '0'),
      location: resource.context?.location || null,
      description: resource.context?.description || null,
      created_at: resource.created_at,
      tags: resource.tags
    }));

    res.status(200).json({
      success: true,
      data: {
        classifications,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total_results: searchResult.total_count
        }
      }
    });

  } catch (error) {
    logger.error('History retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve classification history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/classification/stats
 * @desc Get user's classification statistics
 * @access Private
 */
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all user classifications
    const searchResult = await cloudinary.search
      .expression(`folder:ecotrack/waste-classifications AND tags:user_${userId}`)
      .with_field('context')
      .with_field('tags')
      .max_results(500) // Adjust based on your needs
      .execute();

    // Calculate statistics
    const stats = {
      total_classifications: searchResult.total_count,
      waste_types: {},
      confidence_distribution: {
        high: 0, // > 80%
        medium: 0, // 50-80%
        low: 0 // < 50%
      },
      recent_activity: {
        this_week: 0,
        this_month: 0
      }
    };

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    searchResult.resources.forEach(resource => {
      const wasteType = resource.context?.waste_type || 'unknown';
      const confidence = parseFloat(resource.context?.confidence || '0');
      const createdAt = new Date(resource.created_at);

      // Count by waste type
      stats.waste_types[wasteType] = (stats.waste_types[wasteType] || 0) + 1;

      // Confidence distribution
      if (confidence > 0.8) stats.confidence_distribution.high++;
      else if (confidence > 0.5) stats.confidence_distribution.medium++;
      else stats.confidence_distribution.low++;

      // Recent activity
      if (createdAt > weekAgo) stats.recent_activity.this_week++;
      if (createdAt > monthAgo) stats.recent_activity.this_month++;
    });

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Stats retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve classification statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route DELETE /api/classification/:public_id
 * @desc Delete a classification image
 * @access Private
 */
router.delete('/:public_id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { public_id } = req.params;

    // Verify ownership by checking if the image has the user tag
    const searchResult = await cloudinary.search
      .expression(`public_id:${public_id} AND tags:user_${userId}`)
      .execute();

    if (searchResult.resources.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Classification not found or access denied'
      });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(public_id);

    res.status(200).json({
      success: true,
      message: 'Classification deleted successfully'
    });

  } catch (error) {
    logger.error('Delete classification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete classification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;