# AaharSetu - RealTime Food Redistribution Platform To Reduce Food Waste

AaharSetu is a full-stack web application that helps redistribute surplus food to reduce food waste. The platform connects donors, NGOs, and volunteers to efficiently manage food donations.

## 🏗️ Architecture

- **Frontend**: React + Vite (Port: 5173)
- **Backend**: Node.js + Express (Port: 5000)
- **Database**: MongoDB (Local or Cloud)
- **ML Service**: Python + Flask (Port: 5002)

## 🚀 Quick Start (Run on Localhost)

### Prerequisites

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** - Choose one:
   - [MongoDB Community Server](https://www.mongodb.com/try/download/community) (Local)
   - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Cloud - Free tier available)
3. **Python** (v3.8 or higher) - [Download here](https://www.python.org/downloads/)
4. **wkhtmltopdf** - [Download here](https://wkhtmltopdf.org/downloads.html) (Required for certificate generation)

### 📦 Installation

1. **Clone and navigate to the project:**
   ```bash
   git clone <your-repo-url>
   cd AaharSetu-Final
   ```

2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

3. **Set up Python dependencies:**
   ```bash
   cd ml
   pip install -r requirements.txt
   cd ..
   ```

4. **Configure Environment Variables:**
   Create a `.env` file in the `backend` directory:
   ```bash
   cd backend
   copy .env.example .env    # Windows
   # OR
   cp .env.example .env      # Linux/Mac
   ```
   
   Edit `backend/.env` with your configurations:
   ```env
   # Database Configuration
   MONGO_URI=mongodb://127.0.0.1:27017/AaharSetu
   # For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/AaharSetu
   
   # Session Configuration
   SESSION_SECRET=your-super-secret-key-here
   
   # Server Configuration
   PORT=5000
   
   # Environment
   NODE_ENV=development
   ```

### 🚀 Running the Application

#### Option 1: Run All Services Together (Recommended)
```bash
npm run start:all
```

#### Option 2: Run Services Individually

1. **Start MongoDB** (if using local installation):
   ```bash
   mongod
   ```

2. **Start the Frontend** (Terminal 1):
   ```bash
   npm run dev
   ```
   Frontend will be available at: http://localhost:5173

3. **Start the Backend** (Terminal 2):
   ```bash
   npm run backend
   ```
   Backend API will be available at: http://localhost:5000

4. **Start the ML Service** (Terminal 3):
   ```bash
   npm run ml
   ```
   ML Service will be available at: http://localhost:5002

### 🌐 Access the Application

- **Main Application**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **ML Service**: http://localhost:5002

### 📋 Available Scripts

- `npm run dev` - Start frontend development server
- `npm run backend` - Start backend server
- `npm run ml` - Start ML service
- `npm run start:all` - Start all services concurrently
- `npm run install:all` - Install all dependencies
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build

### 🛠️ Troubleshooting

#### MongoDB Connection Issues
- **Local MongoDB**: Ensure MongoDB service is running
- **MongoDB Atlas**: Check connection string and network access

#### Port Conflicts
- Frontend (5173): Change in `vite.config.js`
- Backend (5000): Change PORT in `backend/.env`
- ML Service (5002): Change port in `ml/app.py`

#### Python Dependencies
```bash
cd ml
pip install --upgrade pip
pip install -r requirements.txt
```

#### wkhtmltopdf Issues
- Ensure wkhtmltopdf is installed and path is correct in `ml/app.py`
- Windows: Update `WKHTMLTOPDF_PATH` in `ml/app.py`

### 🔧 Development

#### Project Structure
```
AaharSetu-Final/
├── src/                 # React frontend
├── backend/             # Node.js API server
├── ml/                  # Python ML service
├── public/              # Static assets
└── package.json         # Frontend dependencies
```

#### Key Features
- User authentication (Donors, NGOs, Volunteers, Admins)
- Real-time food donation tracking
- Interactive maps for location picking
- ML-powered recommendations
- Certificate generation
- Admin dashboard for validation

### 🚀 Production Deployment

1. Set `NODE_ENV=production` in backend/.env
2. Configure MongoDB Atlas for production
3. Update CORS origins in backend/app.js
4. Build frontend: `npm run build`
5. Deploy to your preferred hosting platform

## 📱 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, React Router, Zustand
- **Backend**: Node.js, Express, MongoDB, Passport.js
- **ML**: Python, Flask, scikit-learn
- **Maps**: Leaflet, React-Leaflet
- **PDF**: wkhtmltopdf, pdfkit

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Happy Coding! 🎉**
