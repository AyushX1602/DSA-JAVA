const CommunityPost = require('../models/Community');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Get all community posts with pagination and filtering
exports.getCommunityPosts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      destination, 
      search, 
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isPublished: true };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (destination) {
      filter.destination = { $regex: destination, $options: 'i' };
    }
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      filter.tags = { $in: tagArray };
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    console.log('Fetching community posts with filter:', filter);

    const posts = await CommunityPost.find(filter)
      .populate('author', 'name email')
      .populate('comments.author', 'name')
      .populate('likes.user', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const totalPosts = await CommunityPost.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / limit);

    console.log(`Found ${posts.length} community posts`);

    res.json({
      posts: posts.map(post => ({
        id: post._id,
        _id: post._id,
        author: post.author,
        title: post.title,
        content: post.content,
        category: post.category,
        destination: post.destination,
        tags: post.tags,
        image: post.image,
        likes: post.likes?.map(like => ({
          userId: like.user._id,
          userName: like.user.name
        })) || [],
        comments: post.comments?.map(comment => ({
          id: comment._id,
          author: comment.author,
          content: comment.content,
          createdAt: comment.createdAt
        })) || [],
        views: post.views,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        likeCount: post.likes?.length || 0,
        commentCount: post.comments?.length || 0
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalPosts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching community posts:', error);
    res.status(500).json({ error: 'Failed to fetch community posts' });
  }
};

// Get a single community post by ID
exports.getCommunityPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Fetching community post by ID: ${id}`);

    const post = await CommunityPost.findById(id)
      .populate('author', 'name email')
      .populate('comments.author', 'name')
      .populate('likes.user', 'name');

    if (!post) {
      return res.status(404).json({ error: 'Community post not found' });
    }

    // Increment view count
    post.views = (post.views || 0) + 1;
    await post.save();

    console.log('Community post found successfully');

    res.json({
      id: post._id,
      _id: post._id,
      author: post.author,
      title: post.title,
      content: post.content,
      category: post.category,
      destination: post.destination,
      tags: post.tags,
      image: post.image,
      likes: post.likes?.map(like => ({
        userId: like.user._id,
        userName: like.user.name
      })) || [],
      comments: post.comments?.map(comment => ({
        id: comment._id,
        author: comment.author,
        content: comment.content,
        createdAt: comment.createdAt
      })) || [],
      views: post.views,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      likeCount: post.likes?.length || 0,
      commentCount: post.comments?.length || 0
    });
  } catch (error) {
    console.error('Error fetching community post:', error);
    res.status(500).json({ error: 'Failed to fetch community post' });
  }
};

// Create a new community post
exports.createCommunityPost = async (req, res) => {
  try {
    const { title, content, category, destination, tags, image } = req.body;
    const userId = req.user.id;

    console.log('Creating community post - Request body:', { title, content, category, destination, tags, image });
    console.log('Creating community post - User ID:', userId);

    // Validation
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    if (title.length > 200) {
      return res.status(400).json({ error: 'Title must be 200 characters or less' });
    }

    if (content.length > 5000) {
      return res.status(400).json({ error: 'Content must be 5000 characters or less' });
    }

    // Process tags
    let processedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = tags.map(tag => tag.toLowerCase().trim()).filter(tag => tag);
      } else if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.toLowerCase().trim()).filter(tag => tag);
      }
    }

    const post = new CommunityPost({
      author: userId,
      title: title.trim(),
      content: content.trim(),
      category: category || 'general',
      destination: destination?.trim(),
      tags: processedTags,
      image: image?.trim(),
      likes: [],
      comments: [],
      views: 0
    });

    const savedPost = await post.save();
    
    // Populate the author field
    await savedPost.populate('author', 'name email');

    console.log('Community post created successfully:', savedPost._id);

    res.status(201).json({
      id: savedPost._id,
      _id: savedPost._id,
      author: savedPost.author,
      title: savedPost.title,
      content: savedPost.content,
      category: savedPost.category,
      destination: savedPost.destination,
      tags: savedPost.tags,
      image: savedPost.image,
      likes: [],
      comments: [],
      views: savedPost.views,
      createdAt: savedPost.createdAt,
      updatedAt: savedPost.updatedAt,
      likeCount: 0,
      commentCount: 0
    });
  } catch (error) {
    console.error('Error creating community post:', error);
    res.status(500).json({ error: 'Failed to create community post', details: error.message });
  }
};

// Update a community post
exports.updateCommunityPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, destination, tags, image } = req.body;
    const userId = req.user.id;

    console.log(`Updating community post with ID: ${id}`);

    const post = await CommunityPost.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Community post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== userId) {
      return res.status(403).json({ error: 'You can only update your own posts' });
    }

    // Validation
    if (title && title.length > 200) {
      return res.status(400).json({ error: 'Title must be 200 characters or less' });
    }

    if (content && content.length > 5000) {
      return res.status(400).json({ error: 'Content must be 5000 characters or less' });
    }

    // Process tags
    let processedTags = post.tags;
    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        processedTags = tags.map(tag => tag.toLowerCase().trim()).filter(tag => tag);
      } else if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.toLowerCase().trim()).filter(tag => tag);
      }
    }

    // Update fields
    if (title !== undefined) post.title = title.trim();
    if (content !== undefined) post.content = content.trim();
    if (category !== undefined) post.category = category;
    if (destination !== undefined) post.destination = destination?.trim();
    if (tags !== undefined) post.tags = processedTags;
    if (image !== undefined) post.image = image?.trim();

    const updatedPost = await post.save();
    await updatedPost.populate('author', 'name email');
    await updatedPost.populate('comments.author', 'name');
    await updatedPost.populate('likes.user', 'name');

    console.log('Community post updated successfully');

    res.json({
      id: updatedPost._id,
      _id: updatedPost._id,
      author: updatedPost.author,
      title: updatedPost.title,
      content: updatedPost.content,
      category: updatedPost.category,
      destination: updatedPost.destination,
      tags: updatedPost.tags,
      image: updatedPost.image,
      likes: updatedPost.likes?.map(like => ({
        userId: like.user._id,
        userName: like.user.name
      })) || [],
      comments: updatedPost.comments?.map(comment => ({
        id: comment._id,
        author: comment.author,
        content: comment.content,
        createdAt: comment.createdAt
      })) || [],
      views: updatedPost.views,
      createdAt: updatedPost.createdAt,
      updatedAt: updatedPost.updatedAt,
      likeCount: updatedPost.likes?.length || 0,
      commentCount: updatedPost.comments?.length || 0
    });
  } catch (error) {
    console.error('Error updating community post:', error);
    res.status(500).json({ error: 'Failed to update community post' });
  }
};

// Delete a community post
exports.deleteCommunityPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`Deleting community post with ID: ${id}`);

    const post = await CommunityPost.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Community post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== userId) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    await CommunityPost.findByIdAndDelete(id);

    console.log('Community post deleted successfully');

    res.json({ message: 'Community post deleted successfully' });
  } catch (error) {
    console.error('Error deleting community post:', error);
    res.status(500).json({ error: 'Failed to delete community post' });
  }
};

// Toggle like on a community post
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`Toggling like on post ${id} for user ${userId}`);

    const post = await CommunityPost.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Community post not found' });
    }

    // Check if user already liked the post
    const existingLikeIndex = post.likes.findIndex(like => like.user.toString() === userId);

    if (existingLikeIndex !== -1) {
      // Remove like
      post.likes.splice(existingLikeIndex, 1);
      console.log('Like removed');
    } else {
      // Add like
      post.likes.push({ user: userId });
      console.log('Like added');
    }

    const updatedPost = await post.save();
    await updatedPost.populate('likes.user', 'name');

    res.json({
      likes: updatedPost.likes?.map(like => ({
        userId: like.user._id,
        userName: like.user.name
      })) || [],
      likeCount: updatedPost.likes?.length || 0
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
};

// Add comment to a community post
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    console.log(`Adding comment to post ${id} for user ${userId}`);

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    if (content.trim().length > 1000) {
      return res.status(400).json({ error: 'Comment must be 1000 characters or less' });
    }

    const post = await CommunityPost.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Community post not found' });
    }

    const newComment = {
      author: userId,
      content: content.trim()
    };

    post.comments.push(newComment);
    const updatedPost = await post.save();
    
    await updatedPost.populate('comments.author', 'name');

    const addedComment = updatedPost.comments[updatedPost.comments.length - 1];

    console.log('Comment added successfully');

    res.status(201).json({
      comment: {
        id: addedComment._id,
        author: addedComment.author,
        content: addedComment.content,
        createdAt: addedComment.createdAt
      },
      commentCount: updatedPost.comments?.length || 0
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Get user's own community posts
exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    console.log(`Fetching posts for user: ${userId}`);

    const posts = await CommunityPost.find({ author: userId })
      .populate('author', 'name email')
      .populate('comments.author', 'name')
      .populate('likes.user', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const totalPosts = await CommunityPost.countDocuments({ author: userId });
    const totalPages = Math.ceil(totalPosts / limit);

    console.log(`Found ${posts.length} posts for user`);

    res.json({
      posts: posts.map(post => ({
        id: post._id,
        _id: post._id,
        author: post.author,
        title: post.title,
        content: post.content,
        category: post.category,
        destination: post.destination,
        tags: post.tags,
        image: post.image,
        likes: post.likes?.map(like => ({
          userId: like.user._id,
          userName: like.user.name
        })) || [],
        comments: post.comments?.map(comment => ({
          id: comment._id,
          author: comment.author,
          content: comment.content,
          createdAt: comment.createdAt
        })) || [],
        views: post.views,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        likeCount: post.likes?.length || 0,
        commentCount: post.comments?.length || 0
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalPosts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
};
