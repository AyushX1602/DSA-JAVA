import React, { useState, useEffect } from 'react';
import { History, Trash2, MapPin, Calendar, BarChart3, Filter, RefreshCw } from 'lucide-react';
import { classificationAPI } from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const ClassificationHistory = () => {
  const [classifications, setClassifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWasteType, setSelectedWasteType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Waste type colors for badges
  const wasteTypeColors = {
    'plastic': 'bg-blue-100 text-blue-800',
    'paper': 'bg-green-100 text-green-800',
    'metal': 'bg-gray-100 text-gray-800',
    'organic': 'bg-amber-100 text-amber-800',
    'e-waste': 'bg-purple-100 text-purple-800',
    'trash': 'bg-red-100 text-red-800'
  };

  const fetchHistory = async (page = 1, wasteType = null) => {
    try {
      const params = { page, limit: 12 };
      if (wasteType && wasteType !== 'all') {
        params.waste_type = wasteType;
      }

      const response = await classificationAPI.getHistory(params);
      if (response.data.success) {
        setClassifications(response.data.data.classifications);
        setTotalPages(Math.ceil(response.data.data.pagination.total_results / 12));
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      setError('Failed to load classification history');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await classificationAPI.getStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDelete = async (publicId) => {
    if (!window.confirm('Are you sure you want to delete this classification?')) {
      return;
    }

    try {
      await classificationAPI.deleteClassification(publicId);
      // Refresh the list
      await fetchHistory(currentPage, selectedWasteType);
      await fetchStats();
    } catch (error) {
      console.error('Error deleting classification:', error);
      setError('Failed to delete classification');
    }
  };

  const handleFilterChange = (wasteType) => {
    setSelectedWasteType(wasteType);
    setCurrentPage(1);
    fetchHistory(1, wasteType);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchHistory(page, selectedWasteType);
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([
      fetchHistory(currentPage, selectedWasteType),
      fetchStats()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchHistory(),
        fetchStats()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Classifications</p>
                  <p className="text-2xl font-bold">{stats.total_classifications}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold">{stats.recent_activity.this_week}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Confidence</p>
                  <p className="text-2xl font-bold">{stats.confidence_distribution.high}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Most Common</p>
                  <p className="text-lg font-bold capitalize">
                    {Object.entries(stats.waste_types).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">#1</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Classification History
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedWasteType} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="plastic">Plastic</SelectItem>
                  <SelectItem value="paper">Paper</SelectItem>
                  <SelectItem value="metal">Metal</SelectItem>
                  <SelectItem value="organic">Organic</SelectItem>
                  <SelectItem value="e-waste">E-Waste</SelectItem>
                  <SelectItem value="trash">Trash</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={refreshData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {classifications.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No classifications found</p>
              <p className="text-sm text-gray-400">
                Start classifying waste images to see them here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Classifications Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classifications.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={item.thumbnail_url}
                        alt={`${item.waste_type} waste`}
                        className="w-full h-48 object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="absolute top-2 right-2 opacity-80 hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge 
                            className={wasteTypeColors[item.waste_type] || 'bg-gray-100 text-gray-800'}
                          >
                            {item.waste_type.toUpperCase()}
                          </Badge>
                          <span className={`text-sm font-semibold ${getConfidenceColor(item.confidence)}`}>
                            {(item.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        
                        {item.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        
                        {item.location && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{item.location}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(item.created_at)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                      const page = idx + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassificationHistory;