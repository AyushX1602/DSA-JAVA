import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';


export function VolunteerRegister() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: 18,
    gender: '',
    address: '',
    city: '',
    pincode: '',
    availability: '',
    volunteeringTypes: [],
    hasVehicle: false,
    foodPreference: '',
    idProof: '',
    termsAccepted: false
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number';
    
    if (!formData.age) newErrors.age = 'Age is required';
    else if (formData.age < 18) newErrors.age = 'Must be 18 or older';
    
    if (!formData.gender) newErrors.gender = 'Please select gender';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.pincode) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Invalid pincode';
    
    if (!formData.availability) newErrors.availability = 'Please select availability';
    if (formData.volunteeringTypes.length === 0) newErrors.volunteeringTypes = 'Please select at least one volunteering type';
    if (!formData.foodPreference) newErrors.foodPreference = 'Please select food preference';
    if (!formData.idProof) newErrors.idProof = 'ID proof is required';
    if (!formData.termsAccepted) newErrors.terms = 'You must accept the terms and conditions';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
  
    console.log('Form Data:', formData);
  
    try {
      const response = await fetch('http://localhost:5000/api/volunteers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit registration.');
      }
  
      const data = await response.json();
      console.log('Success:', data);
  
      // addVolunteer({
      //   name: formData.fullName,
      //   email: formData.email,
      //   phone: formData.phone,
      //   availability: [formData.availability],
      //   vehicle: formData.hasVehicle ? 'Yes' : 'No',
      //   experience: formData.volunteeringTypes.join(', '),
      //   areas: [formData.city]
      // });
  
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/volunteer-dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting registration:', error);
      setErrors({ submit: 'Failed to submit registration. Please try again.' });
    }
  };
  

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, idProof: 'File size should be less than 5MB' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, idProof: reader.result }));
        setErrors({ ...errors, idProof: '' });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 rounded-2xl relative"
        >
          <div className='gradient'/>
          <h1 className="text-2xl font-bold mb-6">Volunteer Registration</h1>

          {Object.keys(errors).length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Please correct the following errors:</span>
              </div>
              <ul className="list-disc list-inside text-sm text-red-700">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Personal Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name*</label>
                  <input
                    type="text"
                    required
                    className={`w-full px-3 py-2 rounded-lg border ${errors.fullName ? 'border-red-500' : 'border-neutral-200'} bg-white/50`}
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email*</label>
                  <input
                    type="email"
                    required
                    className={`w-full px-3 py-2 rounded-lg border ${errors.email ? 'border-red-500' : 'border-neutral-200'} bg-white/50`}
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number*</label>
                  <input
                    type="tel"
                    required
                    className={`w-full px-3 py-2 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-neutral-200'} bg-white/50`}
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Age*</label>
                  <input
                    type="number"
                    required
                    min="18"
                    className={`w-full px-3 py-2 rounded-lg border ${errors.age ? 'border-red-500' : 'border-neutral-200'} bg-white/50`}
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 18 }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender*</label>
                  <select
                    required
                    className={`w-full px-3 py-2 rounded-lg border ${errors.gender ? 'border-red-500' : 'border-neutral-200'} bg-white/50`}
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location & Availability */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Location & Availability</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Address*</label>
                <input
                  type="text"
                  required
                  className={`w-full px-3 py-2 rounded-lg border ${errors.address ? 'border-red-500' : 'border-neutral-200'} bg-white/50`}
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City*</label>
                  <input
                    type="text"
                    required
                    className={`w-full px-3 py-2 rounded-lg border ${errors.city ? 'border-red-500' : 'border-neutral-200'} bg-white/50`}
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pincode*</label>
                  <input
                    type="text"
                    required
                    className={`w-full px-3 py-2 rounded-lg border ${errors.pincode ? 'border-red-500' : 'border-neutral-200'} bg-white/50`}
                    value={formData.pincode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Availability*</label>
                <select
                  required
                  className={`w-full px-3 py-2 rounded-lg border ${errors.availability ? 'border-red-500' : 'border-neutral-200'} bg-white/50`}
                  value={formData.availability}
                  onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                >
                  <option value="">Select availability</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>

            {/* Volunteer Preferences */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Volunteer Preferences</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">Preferred Volunteering Type*</label>
                <div className="space-y-2">
                  {['Pickup & Delivery', 'Sorting & Packing', 'Coordination'].map((type) => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.volunteeringTypes.includes(type)}
                        onChange={(e) => {
                          const updatedTypes = e.target.checked
                            ? [...formData.volunteeringTypes, type]
                            : formData.volunteeringTypes.filter(t => t !== type);
                          setFormData(prev => ({ ...prev, volunteeringTypes: updatedTypes }));
                        }}
                        className="rounded border-neutral-300"
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Vehicle Availability*</label>
                <div className="space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={formData.hasVehicle}
                      onChange={() => setFormData(prev => ({ ...prev, hasVehicle: true }))}
                      className="rounded-full border-neutral-300"
                    />
                    <span className="ml-2 text-sm">Yes</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={!formData.hasVehicle}
                      onChange={() => setFormData(prev => ({ ...prev, hasVehicle: false }))}
                      className="rounded-full border-neutral-300"
                    />
                    <span className="ml-2 text-sm">No</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Preferred Food Type*</label>
                <select
                  required
                  className={`w-full px-3 py-2 rounded-lg border ${errors.foodPreference ? 'border-red-500' : 'border-neutral-200'} bg-white/50`}
                  value={formData.foodPreference}
                  onChange={(e) => setFormData(prev => ({ ...prev, foodPreference: e.target.value }))}
                >
                  <option value="">Select preference</option>
                  <option value="no_preference">No Preference</option>
                  <option value="vegetarian">Vegetarian Only</option>
                  <option value="halal">Halal</option>
                  <option value="jain">Jain</option>
                </select>
              </div>
            </div>

            {/* Authentication & Agreement */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Authentication & Agreement</h2>
              
              <div>
                <label className="block text-sm font-medium mb-1">ID Proof*</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className={`w-full px-3 py-2 rounded-lg border ${errors.idProof ? 'border-red-500' : 'border-neutral-200'} bg-white/50`}
                />
                <p className="text-xs text-neutral-500 mt-1">Max size: 5MB. Accepted formats: Images, PDF</p>
              </div>

              <div className={`p-4 rounded-lg border ${errors.terms ? 'border-red-500' : 'border-neutral-200'}`}>
                <label className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                    className="mt-1 rounded border-neutral-300"
                  />
                  <span className="text-sm">
                    I agree to the terms and conditions, including proper food handling practices,
                    maintaining hygiene standards, and following all local food safety regulations.
                    I understand that any violation may result in immediate termination of partnership.
                  </span>
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Register as Volunteer
            </Button>
          </form>
        </motion.div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 1000 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Registration Successful!</h3>
            <p className="text-neutral-600 mb-4">Thank you for registering as a volunteer.</p>
            <Button
              onClick={() => setShowSuccess(false)}
              className="w-full"
            >
              Continue
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
