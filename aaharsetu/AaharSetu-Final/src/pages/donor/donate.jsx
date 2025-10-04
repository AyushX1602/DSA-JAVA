import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Camera, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const markerIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export function DonateForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(true);
  const [agreed, setAgreed] = useState(false);

  const handleAgree = () => {
    if (agreed) {
      setShowModal(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/sign-in');
    } else if (user.role !== 'donor') {
      alert('You do not have permission to access this page.');
      navigate('/');
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: 1,
    expiryDate: '',
    pickupAddress: '',
    pickupTime: '',
    photo: '',
    donorName: user?.name || '',
    donorPhone: user?.phone || '',
    latitude: null,
    longitude: null,
    foodType: 'veg',
  });

  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default to India

  // Fetch user's geolocation
  // useEffect(() => {
  //   if ('geolocation' in navigator) {
  //     navigator.geolocation.getCurrentPosition(
  //       (pos) => setMapCenter([pos.coords.latitude, pos.coords.longitude]),
  //       (err) => console.warn('Geolocation error:', err.message)
  //     );
  //   }
  // }, []);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));

        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.display_name) {
              setFormData((prev) => ({ ...prev, pickupAddress: data.display_name }));
            }
          })
          .catch((err) => console.error('Error fetching address:', err));
      },
    });

    return formData.latitude && formData.longitude ? (
      <Marker position={[formData.latitude, formData.longitude]} icon={markerIcon} />
    ) : null;
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData((prev) => ({ ...prev, photo: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.pickupAddress || !formData.pickupTime ||
        !formData.donorName || !formData.donorPhone || formData.latitude === null || formData.longitude === null) {
      alert('Please fill in all required fields and select a pickup location on the map.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/donations/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        navigate('/donor-dashboard');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error submitting donation:', error);
      alert('There was an error submitting your donation. Please try again.');
    }
  };


  if (!user || user.role !== 'donor') return null;

  return (
    <div className="min-h-screen pt-20 px-4">
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl relative">
        <div className='gradient' />
        <h1 className="text-2xl font-bold mb-6">List Food Donation</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Title*</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 rounded-lg border bg-white/50"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Fresh Vegetables from Restaurant"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description*</label>
            <textarea
              required
              className="w-full px-3 py-2 rounded-lg border bg-white/50 h-24"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the food items, quantity, and any special handling requirements..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm font-medium mb-1">Food Type*</label>
            <select
              className="w-full px-3 py-2 rounded-lg border bg-white/50"
              value={formData.foodType}
              onChange={(e) => setFormData((prev) => ({ ...prev, foodType: e.target.value }))}
            >
              <option value="veg">Veg</option>
              <option value="non-veg">Non-Veg</option>
            </select>
          </div>

            <div>
              <label className="block text-sm font-medium mb-1">Expiry Date</label>
              <input
                type="datetime-local"
                required
                className="w-full px-3 py-2 rounded-lg border bg-white/50"
                value={formData.expiryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Pickup Address*</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 rounded-lg border bg-white/50"
              value={formData.pickupAddress}
              onChange={(e) => setFormData((prev) => ({ ...prev, pickupAddress: e.target.value }))}
              placeholder="Select location on the map or enter manually"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Select Pickup Location</label>
            <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '300px', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker />
            </MapContainer>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Pickup Time*</label>
            <input
              type="time"
              required
              className="w-full px-3 py-2 rounded-lg border bg-white/50"
              value={formData.pickupTime}
              onChange={(e) => setFormData((prev) => ({ ...prev, pickupTime: e.target.value }))}
            />
          </div>
          <div>
             <label className="block text-sm font-medium mb-1">Photo</label>
             <div className="mt-1 flex items-center">
               {formData.photo ? (
                <div className="relative w-32 h-32">
                  <img
                    src={formData.photo}
                    alt="Food preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, photo: '' }))}
                    className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-lg hover:bg-neutral-50 cursor-pointer">
                  <Camera className="w-8 h-8 text-neutral-400" />
                  <span className="mt-2 text-sm text-neutral-500">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Contact Name</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 rounded-lg border bg-white/50"
                value={formData.donorName}
                onChange={(e) => setFormData(prev => ({ ...prev, donorName: e.target.value }))}
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Contact Phone</label>
              <input
                type="tel"
                required
                className="w-full px-3 py-2 rounded-lg border bg-white/50"
                value={formData.donorPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, donorPhone: e.target.value }))}
                placeholder="Your phone number"
              />
            </div>
          </div>

          <Button type="submit" className="w-full">Submit Donation</Button>
        </form>
      </motion.div>
    </div>

    {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[101]">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">🍽 Food Hygiene & Safety Guidelines</h2>
              </div>

              <div className="space-y-4 text-gray-700">
                <section>
                  <h3 className="font-semibold mb-2">✅ Donate Fresh & Edible Food</h3>
                  <p>Ensure food is not expired, spoiled, or contaminated.</p>
                </section>

                <section>
                  <h3 className="font-semibold mb-2">✅ Proper Packaging</h3>
                  <p>Use sealed containers, food-grade bags, or hygienic wraps to maintain freshness.</p>
                </section>

                <section>
                  <h3 className="font-semibold mb-2">✅ Labeling</h3>
                  <p>Clearly mention food type, ingredients, preparation date, and expiry date.</p>
                </section>

                <section>
                  <h3 className="font-semibold mb-2">✅ Food Storage</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Perishable Items:</strong> Keep refrigerated until pickup.</li>
                    <li><strong>Dry & Packaged Foods:</strong> Must be unopened and within expiry.</li>
                    <li><strong>Cooked Food:</strong> Only freshly prepared, hygienically stored food is accepted.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold mb-2">✅ Avoid Cross-Contamination</h3>
                  <p>Separate Vegetarian 🥦, Non-Vegetarian 🍗, and Dairy 🥛 products properly.</p>
                </section>

                <section>
                  <h3 className="font-semibold mb-2">❌ Food We Do Not Accept</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Expired or spoiled food</li>
                    <li>Opened or partially used items</li>
                    <li>Leftovers from personal plates</li>
                    <li>Highly processed or unhealthy junk food</li>
                  </ul>
                </section>

                <div className="border-t pt-4 mt-6">
                  <p className="text-sm text-gray-600">📞 Need Assistance? Contact our team for donation guidelines.</p>
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    id="agreement"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                  />
                  <label htmlFor="agreement" className="text-sm text-gray-700">
                    I have read and agree to follow these guidelines
                  </label>
                </div>

                <Button
                  onClick={handleAgree}
                  className={`w-full py-2 px-4 rounded-lg font-medium ${
                    agreed
                      ? ''
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  OK
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

  </div>
  );
}








// import React, { useState } from 'react';

// function App() {
  

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Main Content */}
//       <div className="container mx-auto px-4 py-8">
//         <div className="flex items-center gap-3 mb-6">
//           <ClipboardList className="w-8 h-8 text-green-600" />
//           <h1 className="text-3xl font-bold text-gray-800">Food Donation Guidelines</h1>
//         </div>
//         <p className="text-gray-600 mb-4">Please review our food donation guidelines to ensure food safety and quality.</p>
//       </div>

//       {/* Modal */}
      
//     </div>
//   );
// }

