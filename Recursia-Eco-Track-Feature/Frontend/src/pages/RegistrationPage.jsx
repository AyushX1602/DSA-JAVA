import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, User, Truck, Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { loginAtom } from '../store/authAtoms';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [selectedRole, setSelectedRole] = useState('user');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [, login] = useAtom(loginAtom);
  const navigate = useNavigate();

  const roleOptions = [
    { 
      id: 'user', 
      label: 'User', 
      icon: User, 
      description: 'Request waste pickup services',
      color: 'blue' 
    },
    { 
      id: 'driver', 
      label: 'Driver', 
      icon: Truck, 
      description: 'Collect and transport waste',
      color: 'green' 
    },
    { 
      id: 'admin', 
      label: 'Admin', 
      icon: Shield, 
      description: 'Manage system and monitor operations',
      color: 'purple' 
    }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: selectedRole
      });

      // Check if we have a successful response
      if (response.data && response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        
        if (token && user) {
          // Use login atom to set authentication state
          login({ token, user });

          toast.success('Registration successful!');
          
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
      let errorMessage = 'Registration failed';
      let validationErrors = {};

      if (error.response?.data) {
        const { message, errors } = error.response.data;
        errorMessage = message || errorMessage;

        // Handle validation errors
        if (errors && Array.isArray(errors)) {
          errors.forEach(err => {
            if (err.path) {
              validationErrors[err.path] = err.msg;
            }
          });
          setErrors(validationErrors);
        }
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
          <h1 className="text-2xl font-extra-bold text-gray-900 mb-2">Join EcoTrack</h1>
          <p className="text-gray-600 font-semibold">
            Create your account and start making a difference
          </p>
        </motion.div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div>
                <Label className="block text-sm font-bold text-gray-700 mb-3">
                  I want to join as a:
                </Label>
                <div className="grid grid-cols-1 gap-3">
                  {roleOptions.map((role) => {
                    const IconComponent = role.icon;
                    return (
                      <motion.div
                        key={role.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedRole(role.id)}
                          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                            selectedRole === role.id
                              ? `border-${role.color}-500 bg-${role.color}-50`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              selectedRole === role.id 
                                ? `bg-${role.color}-500 text-white`
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-gray-900">{role.label}</div>
                              <div className="text-sm text-gray-600 font-semibold">
                                {role.description}
                              </div>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              selectedRole === role.id
                                ? `bg-${role.color}-500 border-${role.color}-500`
                                : 'border-gray-300'
                            }`}>
                              {selectedRole === role.id && (
                                <div className="w-full h-full rounded-full bg-white scale-50"></div>
                              )}
                            </div>
                          </div>
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Name */}
              <div>
                <Label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={errors.name ? 'border-red-500' : ''}
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-sm font-semibold mt-1">{errors.name}</p>
                )}
              </div>

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

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className={errors.phone ? 'border-red-500' : ''}
                  required
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm font-semibold mt-1">{errors.phone}</p>
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
                    placeholder="Create a secure password"
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
                <p className="text-xs text-gray-500 font-semibold mt-1">
                  Must contain uppercase, lowercase, and number
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 font-bold"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center">
              <div className="text-sm">
                <span className="text-gray-600 font-semibold">Already have an account? </span>
                <Link 
                  to="/login" 
                  className="text-primary-500 hover:text-primary-600 font-bold"
                >
                  Sign in here
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

export default RegistrationPage;