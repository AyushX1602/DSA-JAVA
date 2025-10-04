# 🌱 EcoTrack - Waste Management System

A modern, full-stack waste management platform built with React, Node.js, and MongoDB. EcoTrack streamlines waste collection processes with real-time tracking, smart scheduling, and comprehensive analytics.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🎯 Core Functionality
- **Real-time Waste Collection Tracking** - Live GPS tracking of collection vehicles
- **Smart Pickup Scheduling** - AI-powered route optimization
- **Multi-role Dashboard** - Separate interfaces for users, drivers, and administrators
- **Waste Analytics** - Comprehensive reporting and insights
- **Mobile-responsive Design** - Works seamlessly across all devices

### 👥 User Roles
- **👤 Citizens** - Schedule pickups, track requests, view collection history
- **🚛 Drivers** - Manage routes, update pickup status, navigation assistance
- **👨‍💼 Admins** - System oversight, user management, analytics dashboard

### 🎨 Design Features
- **Neobrutalism UI** - Bold, modern interface with high contrast
- **Animated Sidebar** - Hover-to-expand navigation with smooth transitions
- **Glassmorphism Effects** - Modern backdrop blur and transparency
- **Dark/Light Theme** - Adaptive color schemes

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Jotai** - Atomic state management
- **React Router v6** - Client-side routing
- **Recharts** - Data visualization
- **shadcn/ui** - Modern UI component library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing
- **Socket.io** - Real-time communication
- **Winston** - Logging framework

### DevTools & Utilities
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Development server auto-restart
- **dotenv** - Environment variable management

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **MongoDB** (v5.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/recursia-ecotrack.git
cd recursia-ecotrack
```

### 2. Install Backend Dependencies
```bash
cd Backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../Frontend
npm install
```

### 4. Set Up Environment Variables

#### Backend (.env)
Create a `.env` file in the `Backend` directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/ecotrack

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=24h

# Server Configuration
PORT=3000
NODE_ENV=development

# API Keys (optional)
MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

#### Frontend (.env)
Create a `.env` file in the `Frontend` directory:
```env
VITE_API_URL=http://localhost:3000/api
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

### 5. Seed the Database
```bash
cd Backend
npm run seed
```

## ⚙️ Configuration

### Database Setup
1. **Install MongoDB** following the official documentation
2. **Start MongoDB** service on your system
3. **Verify connection** by running the backend server

### Mapbox Integration (Optional)
1. Create a free account at [Mapbox](https://www.mapbox.com/)
2. Get your access token from the dashboard
3. Add the token to your environment variables

## 🎮 Usage

### Development Mode

#### Start Backend Server
```bash
cd Backend
npm run dev
```
The backend will run on `http://localhost:3000`

#### Start Frontend Development Server
```bash
cd Frontend
npm run dev
```
The frontend will run on `http://localhost:5173`

### Production Build

#### Build Frontend
```bash
cd Frontend
npm run build
```

#### Start Production Server
```bash
cd Backend
npm start
```

### Default Credentials

After seeding the database, you can use these test accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ecotrack.com | Admin123 |
| Driver | driver1@ecotrack.com | Driver123 |
| User | john.doe@example.com | Password123 |

## 📚 API Documentation

### Authentication Endpoints
```http
POST /api/auth/register  # Register new user
POST /api/auth/login     # User login
GET  /api/auth/me        # Get current user
POST /api/auth/logout    # User logout
```

### User Management
```http
GET    /api/users        # Get all users (admin only)
GET    /api/users/:id    # Get user by ID
PUT    /api/users/:id    # Update user
DELETE /api/users/:id    # Delete user (admin only)
```

### Pickup Management
```http
GET    /api/pickups      # Get pickups
POST   /api/pickups      # Create pickup request
PUT    /api/pickups/:id  # Update pickup status
DELETE /api/pickups/:id  # Cancel pickup
```

### Driver Operations
```http
GET    /api/drivers/routes     # Get assigned routes
PUT    /api/drivers/location   # Update driver location
POST   /api/drivers/status     # Update pickup status
```

## 📁 Project Structure

```
Recursia-EcoTrack/
├── Backend/                 # Backend Node.js application
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   ├── logs/              # Application logs
│   └── server.js          # Main server file
├── Frontend/               # Frontend React application
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── store/         # State management
│   │   ├── utils/         # Utility functions
│   │   ├── hooks/         # Custom React hooks
│   │   └── contexts/      # React contexts
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
├── .gitignore             # Git ignore rules
└── README.md              # Project documentation
```

## 🧪 Testing

### Run Backend Tests
```bash
cd Backend
npm test
```

### Run Frontend Tests
```bash
cd Frontend
npm test
```

### Run Linting
```bash
# Backend
cd Backend
npm run lint

# Frontend
cd Frontend
npm run lint
```

## 🚀 Deployment

### Using Docker (Recommended)
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Manual Deployment
1. Build the frontend: `npm run build`
2. Copy build files to your web server
3. Configure environment variables for production
4. Start the backend server with PM2 or similar

### Environment-specific Configurations
- **Development**: Use local MongoDB and hot reloading
- **Staging**: Use cloud database with SSL
- **Production**: Enable all security features and monitoring

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Code Style Guidelines
- Use ESLint and Prettier configurations provided
- Follow conventional commit messages
- Write unit tests for new features
- Update documentation as needed

### Reporting Issues
- Use the GitHub issue tracker
- Provide detailed reproduction steps
- Include system information and logs

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

- **Project Maintainer**: [Your Name](mailto:your.email@example.com)
- **GitHub**: [Recursia-EcoTrack](https://github.com/your-username/recursia-ecotrack)
- **Documentation**: [Wiki](https://github.com/your-username/recursia-ecotrack/wiki)

## 🙏 Acknowledgments

- Thanks to the open-source community for amazing tools
- Special thanks to contributors and testers
- Inspired by sustainable development goals

---

**Made with 💚 for a cleaner planet** 🌍