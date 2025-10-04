import React, { useState, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Upload, CheckCircle, Loader2 } from 'lucide-react';
import cloudinaryService from '../services/cloudinary';

const PickupRequest = () => {
  // State variables
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Get logged in user ID (replace with your auth logic)
  const currentUser = { id: '12345' }; // Replace with actual auth implementation

  // Create a ref for the hidden file input
  const fileInputRef = useRef(null);

  // Handle choose image button click
  const handleChooseImage = () => {
    console.log('Choose Image button clicked!'); // Debug log
    console.log('File input ref:', fileInputRef.current); // Debug log
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error('File input ref is null');
    }
  };

  // Handle file selection - opens file chooser
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageUrl(''); // Clear previous upload
      setUploadStatus('idle');
      setErrorMessage('');
    }
  };

  // Upload image to Cloudinary
  const uploadImage = async () => {
    if (!imageFile) {
      setErrorMessage('Please select an image file first');
      return;
    }

    setUploadStatus('uploading');
    setErrorMessage('');

    try {
      // Call uploadImage(file) from src/services/cloudinary.js
      const result = await cloudinaryService.uploadImage(imageFile, {
        folder: 'ecotrack/pickup-requests',
        tags: ['waste', 'pickup-request']
      });

      if (result.success) {
        // Save the returned secure_url to imageUrl state variable
        setImageUrl(result.data.url);
        setUploadStatus('success');
      } else {
        setErrorMessage(result.error || 'Failed to upload image');
        setUploadStatus('error');
      }
    } catch (error) {
      setErrorMessage(`Upload failed: ${error.message}`);
      setUploadStatus('error');
    }
  };

  // Submit pickup request
  const handleSubmitRequest = async () => {
    if (!imageUrl) {
      setErrorMessage('Please upload an image before submitting');
      return;
    }

    if (!pickupLocation.trim()) {
      setErrorMessage('Please provide a pickup location');
      return;
    }

    setSubmitStatus('loading');
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Send POST request to /api/pickup with JSON body as per requirements
      const requestBody = {
        userId: currentUser.id, // logged in user ID
        pickupLocation: pickupLocation, // string or coordinates from user
        imageUrl: imageUrl, // Cloudinary secure_url
        status: 'pending'
      };

      const response = await fetch('/api/pickup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Adjust based on your auth
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Show success message after request submission
        setSuccessMessage('Pickup request submitted successfully! You will receive a notification when a driver is assigned.');
        setSubmitStatus('success');
        
        // Reset form
        setImageFile(null);
        setImageUrl('');
        setPickupLocation('');
        setUploadStatus('idle');
      } else {
        setErrorMessage(result.message || 'Failed to submit pickup request');
        setSubmitStatus('error');
      }
    } catch (error) {
      setErrorMessage(`Network error: ${error.message}`);
      setSubmitStatus('error');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Request Waste Pickup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Display */}
          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {successMessage && (
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Upload Image Section */}
          <div className="space-y-3">
            <Label>Upload Waste Image</Label>
            
            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
            
            {/* Choose Image Button */}
            {!imageFile && (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleChooseImage();
                }}
                variant="outline"
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Image
              </Button>
            )}

            {/* Show selected file name */}
            {imageFile && uploadStatus === 'idle' && (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  Selected: {imageFile.name}
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    onClick={uploadImage}
                    disabled={uploadStatus === 'uploading'}
                    className="flex-1"
                  >
                    {uploadStatus === 'uploading' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleChooseImage}
                    variant="outline"
                  >
                    Change
                  </Button>
                </div>
              </div>
            )}
            
            {/* Upload Image button */}
            {imageFile && uploadStatus === 'uploading' && (
              <Button
                disabled={true}
                className="w-full"
              >
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </Button>
            )}

            {/* Show uploaded image */}
            {imageUrl && uploadStatus === 'success' && (
              <div className="space-y-2">
                <div className="text-sm text-green-600 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Image uploaded successfully
                </div>
                <Button
                  type="button"
                  onClick={handleChooseImage}
                  variant="outline"
                  size="sm"
                >
                  Upload Different Image
                </Button>
              </div>
            )}
          </div>

          {/* Pickup Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Pickup Location</Label>
            <Input
              id="location"
              placeholder="Enter pickup address (e.g., Ward 12, Near Market)"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              required
            />
          </div>

          {/* Submit Request Button - disabled until imageUrl is available */}
          <Button
            onClick={handleSubmitRequest}
            disabled={!imageUrl || submitStatus === 'loading'}
            className="w-full"
          >
            {submitStatus === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PickupRequest;