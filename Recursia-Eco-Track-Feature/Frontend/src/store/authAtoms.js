import { atom } from 'jotai';
import Cookies from 'js-cookie';

// Helper function to get initial token value
const getInitialToken = () => {
  if (typeof window === 'undefined') return null;
  return Cookies.get('auth-token') || localStorage.getItem('auth-token') || null;
};

// Helper function to get initial user value
const getInitialUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const userData = localStorage.getItem('auth-user');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

// Atom for storing JWT token
export const tokenAtom = atom(getInitialToken());

// Atom for storing user data
export const userAtom = atom(getInitialUser());

// Derived atom for authentication status
export const isAuthenticatedAtom = atom((get) => {
  const token = get(tokenAtom);
  const user = get(userAtom);
  return !!(token && user);
});

// Derived atom for user role
export const userRoleAtom = atom((get) => {
  const user = get(userAtom);
  return user?.role || null;
});

// Derived atom for checking if user is driver
export const isDriverAtom = atom((get) => {
  const role = get(userRoleAtom);
  return role === 'driver';
});

// Derived atom for checking if user is admin
export const isAdminAtom = atom((get) => {
  const role = get(userRoleAtom);
  return role === 'admin';
});

// Derived atom for checking if user is regular user
export const isUserAtom = atom((get) => {
  const role = get(userRoleAtom);
  return role === 'user';
});

// Write-only atom for login action
export const loginAtom = atom(
  null,
  (get, set, { token, user }) => {
    // Set atoms first
    set(tokenAtom, token);
    set(userAtom, user);
    
    // Persist to storage
    localStorage.setItem('auth-token', token);
    localStorage.setItem('auth-user', JSON.stringify(user));
    
    // Store token in HTTP-only cookie for security
    Cookies.set('auth-token', token, { 
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    console.log('✅ Login successful - auth state persisted');
  }
);

// Write-only atom for logout action
export const logoutAtom = atom(
  null,
  (get, set) => {
    // Clear atoms
    set(tokenAtom, null);
    set(userAtom, null);
    
    // Remove token from cookies
    Cookies.remove('auth-token');
    
    // Clear storage
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
    
    console.log('✅ Logout successful - auth state cleared');
  }
);

// Atom for checking token expiration
export const isTokenExpiredAtom = atom((get) => {
  const token = get(tokenAtom);
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
});

// Atom for refreshing authentication state from cookies/storage
export const refreshAuthAtom = atom(
  null,
  (get, set) => {
    try {
      console.log('🔄 Refreshing auth state...');
      
      // Don't refresh if we already have valid data
      const currentToken = get(tokenAtom);
      const currentUser = get(userAtom);
      
      if (currentToken && currentUser) {
        console.log('✅ Auth already valid, skipping refresh');
        return;
      }
      
      // Check storage for auth data
      const cookieToken = Cookies.get('auth-token');
      const storageToken = localStorage.getItem('auth-token');
      const storageUserStr = localStorage.getItem('auth-user');
      
      const token = cookieToken || storageToken;
      
      if (token && storageUserStr) {
        try {
          const user = JSON.parse(storageUserStr);
          
          // Basic token validation
          if (token.split('.').length === 3) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            
            if (payload.exp > currentTime) {
              console.log('✅ Restoring valid authentication');
              set(tokenAtom, token);
              set(userAtom, user);
              return;
            }
          }
        } catch (error) {
          console.error('Error parsing auth data:', error);
        }
      }
      
      console.log('ℹ️ No valid auth data found');
      
    } catch (error) {
      console.error('❌ Error in auth refresh:', error);
    }
  }
);

// Atom for loading state during authentication operations
export const authLoadingAtom = atom(false);

// Atom for authentication errors
export const authErrorAtom = atom(null);

// Helper atom to get auth headers for API requests
export const authHeadersAtom = atom((get) => {
  const token = get(tokenAtom);
  return token ? { Authorization: `Bearer ${token}` } : {};
});