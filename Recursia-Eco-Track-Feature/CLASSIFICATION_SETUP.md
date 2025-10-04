# EcoTrack Waste Classification Setup Guide

## Overview
This guide will help you set up the complete waste classification system that integrates:
- **ML Service**: PyTorch-based waste classification API
- **Backend**: Node.js API with Cloudinary image storage
- **Frontend**: React app with classification UI

## Prerequisites
- Node.js 18+
- Python 3.8+
- MongoDB
- Cloudinary account
- PyTorch and required ML packages

## Setup Instructions

### 1. ML Service Setup

```bash
cd ml-service

# Install Python dependencies
pip install -r requirements.txt

# Ensure your trained model exists
# The app.py expects: saved_model/waste_classifier.pth
# The class names file: saved_model/class_names.json

# Start the ML service
python app.py
```

The ML service will run on `http://localhost:5000`

### 2. Backend Setup

```bash
cd Backend

# Install Node.js dependencies
npm install

# Install the new form-data dependency
npm install form-data@^4.0.0

# Copy environment variables template
cp .env.example .env

# Edit .env file with your configurations:
# - CLOUDINARY_CLOUD_NAME=your_cloud_name
# - CLOUDINARY_API_KEY=your_api_key  
# - CLOUDINARY_API_SECRET=your_api_secret
# - MONGODB_URI=your_mongodb_uri
# - ML_SERVICE_URL=http://localhost:5000

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd Frontend

# Install dependencies (if not already done)
npm install

# Make sure these UI components exist:
# - All required shadcn/ui components are already created
# - New Select component has been added

# Start the frontend development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
ML_SERVICE_URL=http://localhost:5000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## API Endpoints

### Classification Endpoints
- `POST /api/classification/classify` - Classify waste image
- `GET /api/classification/history` - Get classification history
- `GET /api/classification/stats` - Get classification statistics
- `DELETE /api/classification/:public_id` - Delete classification

### Request Example
```javascript
// Classify an image
const formData = new FormData();
formData.append('image', imageFile);
formData.append('location', 'Optional location');
formData.append('description', 'Optional description');

const response = await fetch('/api/classification/classify', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_jwt_token'
  },
  body: formData
});
```

## Features

### 1. Waste Classification
- Upload or capture waste images
- AI-powered classification using trained PyTorch model
- Confidence scores and top-3 predictions
- Automatic image storage in Cloudinary
- Location and description metadata

### 2. Classification History
- View all previous classifications
- Filter by waste type
- Pagination support
- Delete classifications
- Thumbnail previews

### 3. Statistics Dashboard
- Total classifications count
- Waste type distribution
- Confidence level analytics
- Recent activity tracking

## Frontend Components

### New Components Added:
1. **WasteClassifier.jsx** - Main classification interface
2. **ClassificationHistory.jsx** - History and statistics view
3. **ClassificationPage.jsx** - Complete classification page
4. **ui/select.jsx** - Select dropdown component

### Usage in Your App:
```jsx
import WasteClassifier from './components/WasteClassifier';
import ClassificationHistory from './components/ClassificationHistory';
import ClassificationPage from './pages/ClassificationPage';

// Add to your routing
<Route path="/classify" element={<ClassificationPage />} />
```

## Testing

### Test ML Service
```bash
cd ml-service
python test_setup.py  # Verify all files exist
python test_api.py     # Test API endpoints (after starting the service)
```

### Test Backend API
```bash
# Test classification endpoint
curl -X POST -F "image=@test_image.jpg" \
  -H "Authorization: Bearer your_token" \
  http://localhost:3000/api/classification/classify
```

## Troubleshooting

### Common Issues:

1. **ML Service not starting**
   - Check if PyTorch is installed: `python -c "import torch; print(torch.__version__)"`
   - Verify model file exists: `saved_model/waste_classifier.pth`
   - Check Flask dependencies: `pip install flask flask-cors`

2. **Backend classification fails**
   - Ensure ML service is running on port 5000
   - Check environment variables are set
   - Verify Cloudinary credentials

3. **Frontend classification not working**
   - Check browser console for errors
   - Verify API_URL is correct in .env
   - Ensure authentication token is valid

4. **Image upload issues**
   - Check Cloudinary configuration
   - Verify upload preset is set correctly
   - Check image file size (max 10MB)

## Production Deployment

### Additional Steps:
1. Use production MongoDB URI
2. Set up proper Cloudinary upload presets
3. Configure CORS for production domains
4. Use environment-specific ML service URL
5. Enable HTTPS for all services
6. Set up proper logging and monitoring

## Support
- Check logs in `Backend/logs/` directory
- ML service logs appear in terminal
- Frontend errors visible in browser console

This setup provides a complete waste classification system with AI-powered image recognition, cloud storage, and a user-friendly interface.