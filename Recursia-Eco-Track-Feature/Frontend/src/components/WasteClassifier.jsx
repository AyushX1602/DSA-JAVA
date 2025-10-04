import React, { useState, useRef } from 'react';
import { Camera, Upload, MapPin, FileText, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { classificationAPI } from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';

const WasteClassifier = ({ onClassificationComplete }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classification, setClassification] = useState(null);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Waste type colors for badges
  const wasteTypeColors = {
    'plastic': 'bg-blue-100 text-blue-800',
    'paper': 'bg-green-100 text-green-800',
    'metal': 'bg-gray-100 text-gray-800',
    'organic': 'bg-amber-100 text-amber-800',
    'e-waste': 'bg-purple-100 text-purple-800',
    'trash': 'bg-red-100 text-red-800'
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setClassification(null);
      setError(null);
    }
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          setGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get current location');
          setGettingLocation(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
      setGettingLocation(false);
    }
  };

  const handleClassify = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setIsClassifying(true);
    setError(null);

    try {
      const metadata = {};
      if (location.trim()) metadata.location = location.trim();
      if (description.trim()) metadata.description = description.trim();

      const response = await classificationAPI.classifyImage(selectedImage, metadata);
      
      if (response.data.success) {
        setClassification(response.data.data);
        if (onClassificationComplete) {
          onClassificationComplete(response.data.data);
        }
      } else {
        setError(response.data.message || 'Classification failed');
      }
    } catch (error) {
      console.error('Classification error:', error);
      setError(
        error.response?.data?.message || 
        'Failed to classify image. Please try again.'
      );
    } finally {
      setIsClassifying(false);
    }
  };

  const resetClassifier = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setClassification(null);
    setLocation('');
    setDescription('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Waste Classification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image Upload Section */}
          {!imagePreview ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-32 flex flex-col items-center justify-center space-y-2"
                >
                  <Upload className="h-8 w-8" />
                  <span>Upload Image</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => cameraInputRef.current?.click()}
                  className="h-32 flex flex-col items-center justify-center space-y-2"
                >
                  <Camera className="h-8 w-8" />
                  <span>Take Photo</span>
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Selected waste"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={resetClassifier}
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Metadata Inputs */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Location (optional)"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                  >
                    {gettingLocation ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <Textarea
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Classify Button */}
              <Button
                onClick={handleClassify}
                disabled={isClassifying}
                className="w-full"
                size="lg"
              >
                {isClassifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Classifying...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Classify Waste
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Classification Results */}
          {classification && (
            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">
                  Classification Complete!
                </h3>
              </div>

              {/* Main Prediction */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Detected Waste Type:</span>
                  <Badge 
                    className={wasteTypeColors[classification.classification.predicted_class] || 'bg-gray-100 text-gray-800'}
                  >
                    {classification.classification.predicted_class.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Confidence:</span>
                  <span className={`text-sm font-semibold ${getConfidenceColor(classification.classification.confidence)}`}>
                    {(classification.classification.confidence * 100).toFixed(1)}% 
                    ({getConfidenceLabel(classification.classification.confidence)})
                  </span>
                </div>
              </div>

              {/* Top 3 Predictions */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">All Predictions:</h4>
                <div className="space-y-1">
                  {classification.classification.top3_predictions.map((pred, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="capitalize">{pred.class}</span>
                      <span className="font-mono">
                        {(pred.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Info */}
              <div className="pt-2 border-t border-green-200">
                <p className="text-xs text-green-700">
                  ✅ Image stored successfully in cloud storage
                </p>
                {classification.metadata.location && (
                  <p className="text-xs text-green-700">
                    📍 Location: {classification.metadata.location}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WasteClassifier;