# 🌱 EcoTrack Environment Setup Guide

This guide will help you set up the environment variables for both the Backend and Frontend of the EcoTrack waste management system.

## 📋 Prerequisites

Before setting up the environment variables, make sure you have accounts for:

- **MongoDB** (local or cloud instance)
- **Cloudinary** (for image storage)
- **Mapbox** (optional, for mapping features)
- **Twilio** (optional, for SMS notifications)
- **Sentry** (optional, for error tracking)

## 🔧 Backend Environment Setup

### 1. Create Backend Environment File

```bash
cd Backend
cp env.template .env
```

### 2. Configure Backend Variables

Edit the `Backend/.env` file with your actual values:

#### **Required Variables:**

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ecotrack
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecotrack

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=24h

# Cloudinary Configuration (Required for image storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# ML Service Configuration
ML_SERVICE_URL=http://localhost:5000
```

#### **Optional Variables:**

```env
# Mapbox Configuration (for mapping features)
MAPBOX_ACCESS_TOKEN=your_mapbox_token_here

# Socket.io Configuration
SOCKET_CORS_ORIGIN=http://localhost:5173

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# SMS Configuration (for notifications)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## 🎨 Frontend Environment Setup

### 1. Create Frontend Environment File

```bash
cd Frontend
cp env.template .env
```

### 2. Configure Frontend Variables

Edit the `Frontend/.env` file with your actual values:

#### **Required Variables:**

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Cloudinary Configuration (Required for image uploads)
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
VITE_CLOUDINARY_API_KEY=your_cloudinary_api_key

# Socket.io Configuration
VITE_SOCKET_URL=http://localhost:3000
```

#### **Optional Variables:**

```env
# Mapbox Configuration (for mapping features)
VITE_MAPBOX_TOKEN=your_mapbox_token_here

# App Configuration
VITE_APP_NAME=EcoTrack
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_AI_CLASSIFICATION=true
VITE_ENABLE_REAL_TIME_TRACKING=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=true

# ML Service Configuration
VITE_ML_SERVICE_URL=http://localhost:5000

# Analytics Configuration (Optional)
VITE_GOOGLE_ANALYTICS_ID=your_google_analytics_id

# Theme Configuration
VITE_DEFAULT_THEME=light
VITE_ENABLE_DARK_MODE=true
```

## 🔑 Getting API Keys

### **Cloudinary Setup:**

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Go to Dashboard → Settings → API Keys
4. Copy your Cloud Name, API Key, and API Secret
5. Create an upload preset:
   - Go to Settings → Upload
   - Create a new upload preset
   - Set signing mode to "Unsigned" for frontend uploads

### **MongoDB Setup:**

#### **Local MongoDB:**
```bash
# Install MongoDB locally
# Start MongoDB service
# Default connection: mongodb://localhost:27017/ecotrack
```

#### **MongoDB Atlas (Cloud):**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/ecotrack`

### **Mapbox Setup (Optional):**

1. Go to [Mapbox](https://www.mapbox.com/)
2. Sign up for a free account
3. Go to Account → Access Tokens
4. Copy your default public token

### **Twilio Setup (Optional):**

1. Go to [Twilio](https://www.twilio.com/)
2. Sign up for a free account
3. Go to Console → Account Info
4. Copy Account SID and Auth Token
5. Get a phone number from Phone Numbers → Manage → Buy a number

## 🚀 Quick Start Commands

### **Backend Setup:**
```bash
cd Backend
cp env.template .env
# Edit .env with your values
npm install
npm run dev
```

### **Frontend Setup:**
```bash
cd Frontend
cp env.template .env
# Edit .env with your values
npm install
npm run dev
```

### **ML Service Setup:**
```bash
cd ml-service
pip install -r requirements.txt
python app.py
```

## 🔒 Security Notes

### **Production Environment:**

1. **Change JWT Secret:**
   ```env
   JWT_SECRET=your_very_secure_random_string_here
   ```

2. **Use Environment-Specific URLs:**
   ```env
   # Production
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecotrack
   VITE_API_URL=https://api.ecotrack.com/api
   ```

3. **Enable HTTPS:**
   ```env
   VITE_ENABLE_HTTPS_REDIRECT=true
   ```

4. **Set Production CORS:**
   ```env
   CORS_ORIGINS=https://ecotrack.com,https://www.ecotrack.com
   ```

## 🐛 Troubleshooting

### **Common Issues:**

1. **Backend won't start:**
   - Check if MongoDB is running
   - Verify MONGODB_URI is correct
   - Check if PORT 3000 is available

2. **Frontend can't connect to backend:**
   - Verify VITE_API_URL is correct
   - Check if backend is running on the correct port
   - Check CORS configuration

3. **Image upload fails:**
   - Verify Cloudinary credentials
   - Check upload preset configuration
   - Verify file size limits

4. **ML Service not working:**
   - Check if ML service is running on port 5000
   - Verify ML_SERVICE_URL is correct
   - Check if model files exist

### **Environment Validation:**

Create a simple validation script to check your environment:

```bash
# Backend validation
cd Backend
node -e "
require('dotenv').config();
console.log('✅ Backend Environment Check:');
console.log('MongoDB URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
console.log('JWT Secret:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('Cloudinary:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
"
```

```bash
# Frontend validation
cd Frontend
node -e "
console.log('✅ Frontend Environment Check:');
console.log('API URL:', process.env.VITE_API_URL || '❌ Missing');
console.log('Cloudinary:', process.env.VITE_CLOUDINARY_CLOUD_NAME || '❌ Missing');
"
```

## 📝 Environment File Structure

```
EcoTrack/
├── Backend/
│   ├── .env                 # Your actual environment variables
│   ├── env.template         # Template for reference
│   └── env.example         # Example with all variables
├── Frontend/
│   ├── .env                # Your actual environment variables
│   ├── env.template        # Template for reference
│   └── env.example         # Example with all variables
└── ml-service/
    └── requirements.txt    # Python dependencies
```

## 🎯 Next Steps

After setting up your environment variables:

1. **Start the ML Service:** `cd ml-service && python app.py`
2. **Start the Backend:** `cd Backend && npm run dev`
3. **Start the Frontend:** `cd Frontend && npm run dev`
4. **Test the system:** Open `http://localhost:5173`

Your EcoTrack waste management system should now be running with all the necessary environment configurations! 🌱
