import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { loginAtom } from '../store/authAtoms';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [, login] = useAtom(loginAtom);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await authAPI.login(formData.email, formData.password);

      // Check if we have a successful response
      if (response.data && response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        
        if (token && user) {
          // Use login atom to set authentication state
          login({ token, user });

          toast.success('Login successful!');
          
          // Redirect based on actual user role from backend response
          const userRole = user.role;
          const redirectPath = userRole === 'admin' ? '/admin' : 
                             userRole === 'driver' ? '/driver' : '/dashboard';
          navigate(redirectPath);
        } else {
          throw new Error('Missing token or user data');
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      let errorMessage = 'Login failed';

      if (error.response?.data) {
        const { message } = error.response.data;
        errorMessage = message || errorMessage;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/50 to-transparent flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Leaf className="w-10 h-10 text-primary-500" />
            <span className="text-2xl font-extra-bold text-primary-500">EcoTrack</span>
          </div>
          <h1 className="text-2xl font-extra-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-600 font-semibold">
            Sign in to your account to continue
          </p>
        </motion.div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <Label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={errors.email ? 'border-red-500' : ''}
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-sm font-semibold mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className={errors.password ? 'border-red-500 pr-12' : 'pr-12'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm font-semibold mt-1">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 font-bold"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center space-y-4">
              <div className="text-sm">
                <a href="#" className="text-primary-500 hover:text-primary-600 font-semibold">
                  Forgot your password?
                </a>
              </div>
              
              <div className="flex items-center">
                <div className="flex-1 border-t border-gray-300"></div>
                <div className="px-4 text-sm text-gray-500 font-semibold">or</div>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              <div className="text-sm">
                <span className="text-gray-600 font-semibold">Don't have an account? </span>
                <Link 
                  to="/register" 
                  className="text-primary-500 hover:text-primary-600 font-bold"
                >
                  Sign up here
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Landing */}
        <div className="text-center mt-6">
          <Link 
            to="/landing" 
            className="text-gray-500 hover:text-gray-700 font-semibold text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;