import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  CalendarIcon,
  EllipsisVerticalIcon,
  UserIcon,
  PhotoIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useApp } from '../../context/AppContext';
import Button from '../common/Button';
import Navbar from '../common/Navbar';

const PostCard = ({ post, index, user, onLike, onComment, getCategoryColor, formatDate }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(
    Array.isArray(post.likes) ? post.likes.some(like => like.userId === user?.id) : false
  );

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike();
  };

  const handleComment = () => {
    if (newComment.trim()) {
      onComment(post.id, newComment);
      setNewComment('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Post Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{post.author?.name || 'Anonymous'}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{formatDate(post.createdAt)}</span>
                {post.destination && (
                  <>
                    <span>•</span>
                    <span className="flex items-center">
                      <MapPinIcon className="h-3 w-3 mr-1" />
                      {post.destination}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 bg-${getCategoryColor(post.category)}-100 text-${getCategoryColor(post.category)}-800 text-xs rounded-full`}>
              {post.category}
            </span>
            <button className="p-1 hover:bg-gray-100 rounded">
              <EllipsisVerticalIcon className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-6 pb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded"
              >
                <TagIcon className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              {isLiked ? (
                <HeartSolidIcon className="h-5 w-5 text-red-600" />
              ) : (
                <HeartIcon className="h-5 w-5" />
              )}
              <span className="text-sm">
                {Array.isArray(post.likes) ? post.likes.length : (post.likes || 0)}
              </span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ChatBubbleLeftIcon className="h-5 w-5" />
              <span className="text-sm">{post.comments?.length || 0}</span>
            </button>
            
            <button className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors">
              <ShareIcon className="h-5 w-5" />
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-6 pb-6 border-t border-gray-200">
          <div className="mt-4">
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <UserIcon className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <div className="flex justify-end mt-2">
                  <Button size="sm" onClick={handleComment} disabled={!newComment.trim()}>
                    Comment
                  </Button>
                </div>
              </div>
            </div>
            
            {post.comments && post.comments.length > 0 && (
              <div className="mt-4 space-y-3">
                {post.comments.map((comment, commentIndex) => (
                  <div key={comment.id || commentIndex} className="flex space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserIcon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="font-medium text-sm text-gray-900">{comment.author?.name || 'Anonymous'}</p>
                        <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(comment.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PostCard;