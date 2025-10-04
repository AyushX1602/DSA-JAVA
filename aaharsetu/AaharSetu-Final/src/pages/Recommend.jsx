import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Utensils, Users, Navigation, Phone, Search, CheckCircle2, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const recommendedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Map center update component
function MapCenter({ latitude, longitude }) {
  const map = useMap();
  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom());
  }, [latitude, longitude, map]);
  return null;
}

export function Recommend() {
  
  const [recommendations, setRecommendations] = useState([]);
  const [donationRequests, setDonationRequests] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [approvedDonations, setApprovedDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  // const [latitude, setLatitude] = useState("0");
  // const [longitude, setLongitude] = useState("0");
  // const [foodType, setFoodType] = useState("veg");
  // const [quantity, setQuantity] = useState(1);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [foodType, setFoodType] = useState("veg");
  const [quantity, setQuantity] = useState(1);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatitude(lat.toString());
          setLongitude(lng.toString());
          setMapCenter({ lat, lng });
          setError(null);
        },
        (error) => {
          setError("Failed to get location. Please enter manually.");
          console.error("Error getting location:", error);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  };

  useEffect(() => {
    handleGetLocation();
  }, []);

  const handleRecommend = async () => {
    if (!latitude || !longitude || !foodType || quantity <= 0) {
      setError("Please fill all fields correctly.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5002/recommend", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: Number(latitude),
          longitude: Number(longitude),
          foodType: foodType,
          quantity: Number(quantity),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        if (data.length === 0) {
          setError("No recommendations available.");
        } else {
          setRecommendations(data);
          setError(null);
        }
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch (err) {
      setError("Failed to fetch recommendations. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  const getFoodTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'veg':
        return 'bg-green-100 text-green-800';
      case 'non-veg':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };
  
  const handleApproveDonation = async (donationId) => {
    if (!donationId) {
      console.error("Error: Invalid donation ID:", donationId);
      alert("Error: Invalid donation ID.");
      return;
    }
  
    try {
      console.log("Sending approval request for donation:", donationId);
  
      const response = await fetch(`http://localhost:5000/api/ngos/requests/${donationId}/accept`, {
        method: "POST",
        credentials: "include",
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Approved Donation Data:", data);
  
      // ✅ Move approved donation from pending to approved list
      setDonationRequests((prevRequests) => prevRequests.filter(d => d._id !== donationId));
      setApprovedDonations((prev) => [...prev, data.donation]);
  
      setSelectedDonation(null);
      alert("Donation approved successfully!");
    } catch (error) {
      console.error("Error approving donation:", error);
      alert("Failed to approve donation. Please try again.");
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold">Recommended Donations</h1>
          <p className="text-neutral-600">
            Find the best matches based on your preferences and location
          </p>
        </motion.div>

        {/* Map Section */}
        <div className="mb-8 rounded-2xl overflow-hidden shadow-lg h-[400px]">
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapCenter latitude={mapCenter.lat} longitude={mapCenter.lng} />

            {/* Current location marker */}
            <Marker
              position={[Number(latitude), Number(longitude)]}
              icon={selectedIcon}
            >
              <Popup>Your Location</Popup>
            </Marker>

            {/* Recommendation markers */}
            {recommendations.map((rec) => (
              <Marker
                key={rec._id}
                position={[rec.latitude, rec.longitude]}
                icon={recommendedIcon}
                eventHandlers={{
                  click: () => setSelectedDonation(rec),
                }}
              >
                <Popup>
                  <div className="font-semibold">{rec.title}</div>
                  <div className="text-sm">{formatDistance(rec.distance_km)} away</div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Search Filters</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Latitude</label>
              <input
                type="text"
                value={latitude}
                onChange={(e) => {
                  setLatitude(e.target.value);
                  setMapCenter({ ...mapCenter, lat: Number(e.target.value) });
                }}
                placeholder="Enter latitude"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Longitude</label>
              <input
                type="text"
                value={longitude}
                onChange={(e) => {
                  setLongitude(e.target.value);
                  setMapCenter({ ...mapCenter, lng: Number(e.target.value) });
                }}
                placeholder="Enter longitude"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Food Type</label>
              <select
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white/50"
              >
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-Vegetarian</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min. Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white/50"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleGetLocation}
              variant="outline"
              className="flex items-center"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Use Current Location
            </Button>
            <Button
              onClick={handleRecommend}
              className="flex items-center"
              disabled={loading}
            >
              <Search className="w-4 h-4 mr-2" />
              {loading ? 'Searching...' : 'Search Donations'}
            </Button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}
        </motion.div>

        {/* Results Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-800 rounded-full animate-spin"></div>
            <p className="mt-4 text-neutral-600">Searching for donations...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-600">
              {error ? error : "Use the filters above to search for donations"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((recommendation) => (
              <motion.div
                key={recommendation._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 rounded-2xl hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">
                    {recommendation.title.substring(0, 30)}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-sm ${getFoodTypeColor(recommendation.foodType)}`}>
                    {recommendation.foodType.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-neutral-600">
                    <Utensils className="w-4 h-4 mr-2" />
                    <span>{recommendation.quantity} servings</span>
                  </div>

                  <div className="flex items-center text-sm text-neutral-600">
                    <Navigation className="w-4 h-4 mr-2" />
                    <span>{formatDistance(recommendation.distance_km)} away</span>
                  </div>

                  <div className="flex items-center text-sm text-neutral-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Expires: {new Date(recommendation.expiryDate).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center text-sm text-neutral-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{recommendation.donorName}</span>
                  </div>

                  <div className="flex items-center text-sm text-neutral-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{recommendation.donorPhone}</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setSelectedDonation(recommendation);
                    setMapCenter({
                      lat: recommendation.latitude,
                      lng: recommendation.longitude
                    });
                  }}
                  className="w-full"
                >
                  View Details
                </Button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Donation Details Modal */}
        {selectedDonation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1000]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-semibold">{selectedDonation.description}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm ${getFoodTypeColor(selectedDonation.foodType)}`}>
                    {selectedDonation.foodType.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center">
                      <Utensils className="w-5 h-5 text-neutral-600 mr-3" />
                      <div>
                        <p className="font-medium">Quantity</p>
                        <p className="text-sm text-neutral-600">{selectedDonation.quantity} servings</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center">
                      <Navigation className="w-5 h-5 text-neutral-600 mr-3" />
                      <div>
                        <p className="font-medium">Distance</p>
                        <p className="text-sm text-neutral-600">{formatDistance(selectedDonation.distance_km)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-neutral-600 mr-3" />
                      <div>
                        <p className="font-medium">Expiry</p>
                        <p className="text-sm text-neutral-600">
                          {new Date(selectedDonation.expiryDate).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-neutral-600 mr-3" />
                      <div>
                        <p className="font-medium">Donor Details</p>
                        <p className="text-sm text-neutral-600">{selectedDonation.donorName}</p>
                        <p className="text-sm text-neutral-600 flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {selectedDonation.donorPhone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white pt-4 flex gap-3">
              <Button
                  onClick={() => {
                  console.log("Approving Donation ID:", selectedDonation?._id); // Debugging
                  handleApproveDonation(selectedDonation?._id);
                  
                }}
                  className="flex-1"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve Donation
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedDonation(null)}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Recommend;
