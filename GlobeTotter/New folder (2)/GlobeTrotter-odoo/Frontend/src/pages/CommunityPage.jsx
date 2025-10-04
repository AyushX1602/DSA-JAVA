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
import { useApp } from '../context/AppContext';
import Button from '../components/common/Button';
import TopBar from '../components/common/TopBar';
import Sidebar from '../components/common/Sidebar';
import PostCard from '../components/common/PostCard';

const CommunityPage = () => {
  const { user, communityPosts, createCommunityPost, addCommunityComment, togglePostLike } = useApp();
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general',
    destination: '',
    tags: ''
  });

  const categories = [
    { id: 'all', name: 'All Posts', color: 'gray' },
    { id: 'general', name: 'General', color: 'blue' },
    { id: 'tips', name: 'Travel Tips', color: 'green' },
    { id: 'photos', name: 'Photo Sharing', color: 'purple' },
    { id: 'destinations', name: 'Destinations', color: 'orange' },
    { id: 'budget', name: 'Budget Travel', color: 'yellow' },
    { id: 'solo', name: 'Solo Travel', color: 'pink' },
    { id: 'family', name: 'Family Travel', color: 'indigo' }
  ];

  useEffect(() => {
    let filteredPosts = [...communityPosts];
    
    if (selectedCategory !== 'all') {
      filteredPosts = filteredPosts.filter(post => post.category === selectedCategory);
    }
    
    if (searchQuery) {
      filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    setPosts(filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }, [communityPosts, selectedCategory, searchQuery]);

  const handleCreatePost = () => {
    if (newPost.title.trim() && newPost.content.trim()) {
      const tags = newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      createCommunityPost({
        ...newPost,
        tags
      });
      setNewPost({
        title: '',
        content: '',
        category: 'general',
        destination: '',
        tags: ''
      });
      setShowCreatePost(false);
    }
  };

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat?.color || 'gray';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <Sidebar />
      
      <div className="ml-16 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Travel Community</h1>
              <p className="text-gray-600">Share your experiences and connect with fellow travelers</p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Button
                onClick={() => setShowCreatePost(true)}
                className="flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Create Post</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          {/* Search Bar */}
          <div className="relative mb-6">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts, destinations, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? `bg-${category.color}-100 text-${category.color}-800 ring-2 ring-${category.color}-500`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {posts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}
                  index={index}
                  user={user}
                  onLike={() => togglePostLike(post.id)}
                  onComment={addCommunityComment}
                  getCategoryColor={getCategoryColor}
                  formatDate={formatDate}
                />
              ))}
              
              {posts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center"
                >
                  <ChatBubbleLeftIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                  <p className="text-gray-600">
                    {searchQuery || selectedCategory !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'Be the first to share your travel experience!'
                    }
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Posts</span>
                  <span className="font-semibold">{communityPosts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Members</span>
                  <span className="font-semibold">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Countries Discussed</span>
                  <span className="font-semibold">67</span>
                </div>
              </div>
            </motion.div>

            {/* Trending Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Tags</h3>
              <div className="flex flex-wrap gap-2">
                {['#backpacking', '#photography', '#foodie', '#adventure', '#beach', '#culture', '#budget', '#solo'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag.substring(1))}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Featured Destinations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Destinations</h3>
              <div className="space-y-3">
                {['Tokyo, Japan', 'Paris, France', 'Bali, Indonesia', 'New York, USA', 'Barcelona, Spain'].map((destination, index) => (
                  <button
                    key={destination}
                    onClick={() => setSearchQuery(destination)}
                    className="flex items-center w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    <MapPinIcon className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-700">{destination}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Post</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What's your post about?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.slice(1).map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination (Optional)</label>
                  <input
                    type="text"
                    value={newPost.destination}
                    onChange={(e) => setNewPost({ ...newPost, destination: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Where did you travel?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Share your travel story, tips, or experience..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Optional)</label>
                  <input
                    type="text"
                    value={newPost.tags}
                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="adventure, backpacking, photography (comma separated)"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setShowCreatePost(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreatePost}>
                  Create Post
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </div>
    </div>
  );
};



export default CommunityPage;
