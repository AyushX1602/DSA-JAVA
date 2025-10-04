const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const communityPostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'tips', 'photos', 'destinations', 'budget', 'solo', 'family', 'other'],
    default: 'general'
  },
  destination: {
    type: String,
    trim: true,
    maxlength: 100
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  image: {
    type: String, // URL to image
    trim: true
  },
  likes: [likeSchema],
  comments: [commentSchema],
  isPublished: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
communityPostSchema.index({ author: 1, createdAt: -1 });
communityPostSchema.index({ category: 1, createdAt: -1 });
communityPostSchema.index({ tags: 1 });
communityPostSchema.index({ destination: 1 });
communityPostSchema.index({ createdAt: -1 });

// Virtual for like count
communityPostSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comment count
communityPostSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

// Ensure virtual fields are included in JSON output
communityPostSchema.set('toJSON', { virtuals: true });
communityPostSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('CommunityPost', communityPostSchema);
