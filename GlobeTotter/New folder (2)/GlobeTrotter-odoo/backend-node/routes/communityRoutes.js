const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getCommunityPosts,
  getCommunityPostById,
  createCommunityPost,
  updateCommunityPost,
  deleteCommunityPost,
  toggleLike,
  addComment,
  getUserPosts
} = require('../controller/communityController');

// Public routes
router.get('/', getCommunityPosts);
router.get('/posts/:id', getCommunityPostById);

// Protected routes (require authentication)
router.use(protect);

// Post management
router.post('/', createCommunityPost);
router.put('/posts/:id', updateCommunityPost);
router.delete('/posts/:id', deleteCommunityPost);
router.get('/my-posts', getUserPosts);

// Interaction routes
router.post('/posts/:id/like', toggleLike);
router.post('/posts/:id/comments', addComment);

module.exports = router;
