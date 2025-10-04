import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MapPin, Trophy, Clock, CheckCircle2, Truck, X } from 'lucide-react';
import WhatsAppChat from '@/components/layout/WhatsApp';



export function VolunteerDashboard() {
  const [approvedDonations, setApprovedDonations] = useState([]); 
  const [activeDeliveries, setActiveDeliveries] = useState([]);  // ✅ Track active deliveries// ✅ Store NGO-approved donations
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [completedDeliveries, setCompletedDeliveries] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch NGO-approved donations (available for volunteers)
  useEffect(() => {
    const fetchApprovedDonations = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/volunteers/approved-donations", {
                credentials: "include",
            });

            if (!response.ok) throw new Error("Failed to fetch donations");

            const data = await response.json();
            console.log("Fetched Donations:", data);

            setApprovedDonations(data.availableDonations); // Available Pickups
            setActiveDeliveries(data.activeDeliveries);   // Active Deliveries
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };


    fetchApprovedDonations();
  }, []);

  useEffect(() => {
    const fetchActiveDeliveries = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/volunteers/active-deliveries", {
                credentials: "include",
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            console.log("Fetched Active Deliveries:", data);
            setActiveDeliveries(data);
        } catch (error) {
            console.error("Error fetching active deliveries:", error);
        }
    };

    fetchActiveDeliveries();
}, []);


  // ✅ Handle accepting a delivery
  const handleAcceptDelivery = async (donationId) => {
    try {
        const response = await fetch(`http://localhost:5000/api/volunteers/claim/${donationId}`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "claimed" }),
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        // ✅ Find the claimed donation in `approvedDonations`
        const claimedDonation = approvedDonations.find(d => d._id === donationId);

        if (!claimedDonation) {
            console.error("Claimed donation not found in state.");
            return;
        }

        // ✅ Move from Available Pickups → Active Deliveries
        setApprovedDonations(prev => prev.filter(d => d._id !== donationId));
        setActiveDeliveries(prev => [...prev, { ...claimedDonation, status: "claimed" }]);

        setSelectedDonation(null);
        console.log("Donation successfully claimed:", claimedDonation);
    } catch (error) {
        console.error("Error accepting delivery:", error);
        alert("Failed to claim donation. Please try again.");
    }
};


  // ✅ Handle marking a delivery as completed
  const handleCompleteDelivery = async (donationId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/volunteers/complete/${donationId}`, {
        method: "POST",
        credentials: "include",
      });
  
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
      // ✅ Remove the completed donation from Active Deliveries
      setActiveDeliveries(prev => prev.filter(d => d._id !== donationId));
  
      // ✅ Increase Completed Deliveries Count
      setCompletedDeliveries(prev => prev + 1);
  
      console.log("Donation marked as completed:", donationId);
    } catch (error) {
      console.error("Error completing delivery:", error);
    }
  };
  

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Volunteer Dashboard</h1>
            <p className="text-neutral-600">Find nearby pickup requests and track your impact</p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Available Pickups */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 rounded-2xl relative"
          >
            <div className='gradient'/>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-500" />
              Available Pickups
            </h2>
            {loading ? (
              <p>Loading...</p>
            ) : approvedDonations.length > 0 ? (
              <div className="space-y-4">
                {[...approvedDonations].reverse().map((donation) => (
                  <div key={donation._id} className="bg-white/50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{donation.title}</h3>
                      <span className="text-sm text-neutral-600">{donation.quantity} servings</span>
                    </div>
                    <div className="text-sm text-neutral-600 mb-3">
                      <p className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" /> {donation.pickupAddress}
                      </p>
                      <p className="flex items-center mt-1">
                        <Clock className="w-4 h-4 mr-1" /> Pickup at {donation.pickupTime}
                      </p>
                    </div>
                    <Button onClick={() => setSelectedDonation(donation)} className="w-full">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-600">No available pickups at the moment</p>
            )}
          </motion.div>

          {/* ✅ Active Deliveries Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-2xl relative">
              <div className="gradient"/>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-green-500" />
                  Active Deliveries
              </h2>

              {activeDeliveries.length > 0 ? (
                  <div className="space-y-4">
                      {[...activeDeliveries].reverse().map((donation) => (
                          <div key={donation._id} className="bg-white/50 p-4 rounded-lg">
                              <h3 className="font-medium">{donation.title}</h3>
                              <p className="text-sm text-neutral-600">{donation.quantity} servings</p>
                              <Button onClick={() => handleCompleteDelivery(donation._id)} className="w-full" variant="outline">
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Mark as Delivered
                              </Button>
                          </div>
                      ))}
                  </div>
              ) : (
                  <p className="text-neutral-600">No active deliveries</p>
              )}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 rounded-2xl relative"
          >
            <div className='gradient'/>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
              Your Stats
            </h2>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg">
                <p className="text-neutral-600 flex justify-between">
                  <span>Deliveries Completed:</span>
                  <span className="font-medium">{completedDeliveries}</span>
                </p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg">
                <p className="text-neutral-600 flex justify-between">
                  <span>Points Earned:</span>
                  <span className="font-medium">{completedDeliveries * 100}</span>
                </p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg">
                <p className="text-neutral-600 flex justify-between">
                  <span>Current Rank:</span>
                  <span className="font-medium">{
                    completedDeliveries.length >= 10 ? 'Expert' :
                    completedDeliveries.length >= 5 ? 'Intermediate' :
                    'Rookie'
                  }</span>
                </p>
              </div>
            </div>
          </motion.div>
      </div>

        {/* ✅ Donation Details Modal */}
        {/* {selectedDonation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 1000 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white pb-4">
                <h3 className="text-xl font-semibold">{selectedDonation.title}</h3>
              </div>
              <div className="space-y-4 mb-6">
                <p className="text-neutral-600">{selectedDonation.description}</p>
                <p className="text-neutral-600">Quantity: {selectedDonation.quantity} servings</p>
                <p className="text-neutral-600">Pickup Time: {selectedDonation.pickupTime}</p>
              </div>
              <div className="sticky bottom-0 bg-white pt-4 flex gap-3">
                <Button onClick={() => handleAcceptDelivery(selectedDonation._id)} className="flex-1">
                  Accept Delivery
                </Button>
                <Button variant="outline" onClick={() => setSelectedDonation(null)} className="flex-1">
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )} */}

{selectedDonation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[101]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white pb-4">
                <h3 className="text-xl font-semibold">{selectedDonation.title}</h3>
              </div>
              <div className="space-y-4 mb-6">
                <p className="text-neutral-600">{selectedDonation.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Quantity</p>
                    <p className="text-neutral-600">{selectedDonation.quantity} servings</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pickup Time</p>
                    <p className="text-neutral-600">{selectedDonation.pickupTime}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-neutral-600">{selectedDonation.pickupAddress}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Contact</p>
                  <p className="text-neutral-600">{selectedDonation.donorName} - {selectedDonation.donorPhone}</p>
                </div>
                {selectedDonation.photo && (
                  <img
                    src={selectedDonation.photo}
                    alt="Food"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
              </div>
              <div className="sticky bottom-0 bg-white pt-4 flex gap-3">
                <Button
                  onClick={() => handleAcceptDelivery(selectedDonation._id)}
                  className="flex-1"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Accept Delivery
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
      <WhatsAppChat />
    </div>
  );
}

