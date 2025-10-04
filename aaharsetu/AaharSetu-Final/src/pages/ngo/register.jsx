import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const markerIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export function NGORegister() {
  const navigate = useNavigate();
  // const addNGO = useStore((state) => state.addNGO);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    contactPersonName: '',
    email: '',
    phone: '',
    address: '',
    latitude: null,
    longitude: null,
    areasServed: [],
    beneficiariesCount: 0,
    quantity: '',
    foodType: [],
    registrationCertificate: '',
    fssaiCompliance: '',
    pickupTiming: [],
    location: null,
    termsAccepted: false,
  });

  function LocationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.display_name) {
              setFormData((prev) => ({ ...prev, address: data.display_name })); // Fix the key name
            }
          })
          .catch((err) => console.error('Error fetching address:', err));
      },
    });
  
    return formData.latitude && formData.longitude ? (
      <Marker position={[formData.latitude, formData.longitude]} icon={markerIcon} />
    ) : null;
  }
  




  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf' && file.size <= 5 * 1024 * 1024) {
      // 5MB limit
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setErrors((prev) => ({ ...prev, [field]: 'Please upload a valid PDF file (max 5MB).' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'NGO name is required';
    if (!formData.registrationNumber) newErrors.registrationNumber = 'Registration number is required';
    if (!formData.contactPersonName) newErrors.contactPersonName = 'Contact person name is required';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.phone || !/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Valid 10-digit phone number is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.latitude || !formData.longitude) {
      newErrors.location = 'Pickup location must be selected on the map';
    }    
    if (formData.areasServed.length === 0) newErrors.areasServed = 'At least one area must be selected';
    if (!formData.quantity) newErrors.quantity = 'Storage capacity is required';
    if (!formData.registrationCertificate) newErrors.registrationCertificate = 'Upload registration certificate (PDF)';
    if (!formData.fssaiCompliance) newErrors.fssaiCompliance = 'Upload FSSAI compliance document (PDF)';
    if (formData.pickupTiming.length === 0) newErrors.pickupTiming = 'Select at least one pickup timing';
    if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const response = await fetch('http://localhost:5000/api/ngos/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Ensures cookies are sent
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert('NGO registered successfully!');
        navigate('/ngo/dashboard');
      } else {
        setErrors({ submit: 'Failed to register NGO. Try again.' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again later.' });
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl relative">
          <div className='gradient'/>
          <h1 className="text-2xl font-bold mb-6">NGO Registration</h1>
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
            {/* NGO Name and Registration Number */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">NGO Name*</label>
                <input
                  type="text"
                  required
                  className={`w-full px-3 py-2 rounded-lg border ${errors.name ? 'border-red-500' : 'border-neutral-200'} bg-white/50`}
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Registration Number*</label>
                <input
                  type="text"
                  required
                  className={`w-full px-3 py-2 rounded-lg border ${errors.registrationNumber ? 'border-red-500' : 'border-neutral-200'} bg-white/50`}
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, registrationNumber: e.target.value }))}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Contact Person Name*</label>
                <input
                  type="text"
                  required
                  className={`w-full px-3 py-2 rounded-lg border ${errors.contactPersonName ? 'border-red-500' : 'border-neutral-200'} bg-white/50`}
                  value={formData.contactPersonName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contactPersonName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email*</label>
                <input
                  type="email"
                  required
                  className={`w-full px-3 py-2 rounded-lg border ${errors.email ? 'border-red-500' : 'border-neutral-200'} bg-white/50`}
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            {/* Phone Number and Address */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number*</label>
                <input
                  type="tel"
                  required
                  className={`w-full px-3 py-2 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-neutral-200'} bg-white/50`}
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address*</label>
                <input
                  type="text"
                  required
                  className={`w-full px-3 py-2 rounded-lg border ${errors.address ? 'border-red-500' : 'border-neutral-200'} bg-white/50`}
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter complete address"
                />
              </div>
            </div>

            {/* Pickup Location */}
            <div>
              <label className="block text-sm font-medium mb-1">Select Pickup Location*</label>
              <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '300px', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker setLocation={(latlng) => setFormData((prev) => ({ ...prev, location: latlng }))} />
              </MapContainer>
            </div>

            {/* Areas Served */}
            <div>
              <label className="block text-sm font-medium mb-2">Areas Served*</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['North', 'South', 'East', 'West', 'Central', 'Suburbs'].map((area) => (
                  <label key={area} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.areasServed.includes(area)}
                      onChange={(e) => {
                        const updatedAreas = e.target.checked
                          ? [...formData.areasServed, area]
                          : formData.areasServed.filter((a) => a !== area);
                        setFormData((prev) => ({ ...prev, areasServed: updatedAreas }));
                      }}
                      className="rounded border-neutral-300"
                    />
                    <span className="text-sm">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Number of Volunteers and Storage Capacity */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Number of Volunteers</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white/50"
                  value={formData.beneficiariesCount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, beneficiariesCount: parseInt(e.target.value) || 0 }))}
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium mb-1">Food Storage Capacity*</label>
                <select
                  required
                  className={`w-full px-3 py-2 rounded-lg border ${errors.storageCapacity ? 'border-red-500' : 'border-neutral-200'} bg-white/50`}
                  value={formData.storageCapacity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, storageCapacity: e.target.value }))}
                >
                  <option value="">Select capacity</option>
                  <option value="small">Small (Up to 100 meals)</option>
                  <option value="medium">Medium (100-500 meals)</option>
                  <option value="large">Large (500+ meals)</option>
                </select>
              </div> */}

                <div>
                 <label className="block text-sm font-medium mb-1">Quantity (servings)</label>
                 <input
                  type="number"
                  required
                  min="1"
                  className="w-full px-3 py-2 rounded-lg border bg-white/50"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>

            {/* Dietary Preferences */}
            <div>
              <label className="block text-sm font-medium mb-2">Dietary Preferences</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['Veg', 'Non-Veg', 'No Restrictions'].map((pref) => (
                  <label key={pref} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.foodType.includes(pref)}
                      onChange={(e) => {
                        const updatedPrefs = e.target.checked
                          ? [...formData.foodType, pref]
                          : formData.foodType.filter((p) => p !== pref);
                        setFormData((prev) => ({ ...prev, foodType: updatedPrefs }));
                      }}
                      className="rounded border-neutral-300"
                    />
                    <span className="text-sm">{pref}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* <div>
              <label className="block text-sm font-medium mb-1">Food Type*</label>
              <select
                className="w-full px-3 py-2 rounded-lg border bg-white/50"
                value={formData.foodType}
                onChange={(e) => setFormData((prev) => ({ ...prev, foodType: e.target.value }))}
              >
                <option value="veg">Veg</option>
                <option value="non-veg">Non-Veg</option>
              </select>
            </div> */}


            {/* Document Upload */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Registration Certificate (PDF)*</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e, 'registrationCertificate')}
                  className={`w-full px-3 py-2 rounded-lg border ${errors.registrationCertificate ? 'border-red-500' : 'border-neutral-200'} bg-white/50`}
                />
                <p className="text-xs text-neutral-500 mt-1">Max size: 5MB</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">FSSAI Compliance (PDF)*</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e, 'fssaiCompliance')}
                  className={`w-full px-3 py-2 rounded-lg border ${errors.fssaiCompliance ? 'border-red-500' : 'border-neutral-200'} bg-white/50`}
                />
                <p className="text-xs text-neutral-500 mt-1">Max size: 5MB</p>
              </div>
            </div>

            {/* Preferred Pickup Timing */}
            <div>
              <label className="block text-sm font-medium mb-2">Preferred Pickup Timing*</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  'Morning (6-9 AM)',
                  'Mid-Morning (9-12 PM)',
                  'Afternoon (12-3 PM)',
                  'Evening (3-6 PM)',
                  'Night (6-9 PM)',
                  'Late Night (9-12 AM)',
                ].map((time) => (
                  <label key={time} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.pickupTiming.includes(time)}
                      onChange={(e) => {
                        const updatedTiming = e.target.checked
                          ? [...formData.pickupTiming, time]
                          : formData.pickupTiming.filter((t) => t !== time);
                        setFormData((prev) => ({ ...prev, pickupTiming: updatedTiming }));
                      }}
                      className="rounded border-neutral-300"
                    />
                    <span className="text-sm">{time}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className={`p-4 rounded-lg border ${errors.terms ? 'border-red-500' : 'border-neutral-200'}`}>
              <label className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData((prev) => ({ ...prev, termsAccepted: e.target.checked }))}
                  className="mt-1 rounded border-neutral-300"
                />
                <span className="text-sm">
                  I agree to the terms and conditions, including proper food handling practices,
                  maintaining hygiene standards, and following all local food safety regulations.
                  I understand that any violation may result in immediate termination of partnership.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full">
              Register NGO
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

