import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { Toaster } from 'react-hot-toast';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import UserDashboard from './pages/UserDashboard';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';

// Auth atoms
import { userAtom, isAuthenticatedAtom, refreshAuthAtom, isTokenExpiredAtom } from './store/authAtoms';

// Component to handle authenticated user redirects
const AuthenticatedRedirect = () => {
  const [user] = useAtom(userAtom);
  
  // Redirect based on user role
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'driver':
      return <Navigate to="/driver" replace />;
    case 'user':
    default:
      return <Navigate to="/dashboard" replace />;
  }
};

// Protected landing page component - only for unauthenticated users
const ProtectedLandingPage = () => {
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [isTokenExpired] = useAtom(isTokenExpiredAtom);
  
  // If authenticated and token is not expired, redirect to dashboard
  if (isAuthenticated && !isTokenExpired) {
    return <AuthenticatedRedirect />;
  }
  
  return <LandingPage />;
};

function AppRoutes() {
  const [user] = useAtom(userAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [isTokenExpired] = useAtom(isTokenExpiredAtom);

  // If token is expired, treat as not authenticated
  const actuallyAuthenticated = isAuthenticated && !isTokenExpired;

  return (
    <Routes>
      {/* Landing page is now the default route - only accessible by unauthenticated users */}
      <Route path="/" element={<ProtectedLandingPage />} />
      
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      
      {/* Protected dashboard routes */}
      <Route 
        path="/dashboard" 
        element={
          actuallyAuthenticated && user && user.role === 'user' ? (
            <UserDashboard />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          actuallyAuthenticated && user ? (
            <UserProfile />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      <Route 
        path="/driver" 
        element={
          actuallyAuthenticated && user && user.role === 'driver' ? (
            <DriverDashboard />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      <Route 
        path="/admin" 
        element={
          actuallyAuthenticated && user && user.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      {/* Catch all route - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const [, refreshAuth] = useAtom(refreshAuthAtom);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Refresh auth state on app start - only once
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing authentication...');
        refreshAuth();
        setAuthInitialized(true);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthInitialized(true);
      }
    };

    initializeAuth();
  }, []); // Remove refreshAuth dependency to prevent loops

  // Show loading screen while auth is initializing
  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen">
        <AppRoutes />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontWeight: '600',
              fontSize: '14px'
            },
            success: {
              style: {
                border: '2px solid #2ecc71',
                background: '#fff'
              }
            },
            error: {
              style: {
                border: '2px solid #e74c3c',
                background: '#fff'
              }
            }
          }}
        />
      </div>
    </Router>
  );
}

export default App;
