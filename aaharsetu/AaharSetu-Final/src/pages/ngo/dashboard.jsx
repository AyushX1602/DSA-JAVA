import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, CheckCircle2, X, Plus, Users2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NgoDashboard() {
  const [donationRequests, setDonationRequests] = useState([]); // Pending donations
  const [approvedDonations, setApprovedDonations] = useState([]); // Approved by NGO
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [NgoRequestedDonations, setNgoRequestedDonations] = useState([])
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false); // Corrected setter name  const [loading, setLoading] = useState(true);
  const [requestForm, setRequestForm] = React.useState({
    title: '',
    description: '',
    quantity: 1,
    requiredBy: '',
    dietaryRequirements: []
  });

  // ✅ Fetch pending, approved, and NGO requested donations separately
  useEffect(() => {
    const fetchDonationRequests = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/ngos/requests", { credentials: "include" });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        console.log("Fetched Pending Donation Requests:", data);
        setDonationRequests(data);
      } catch (error) {
        console.error("Error fetching donation requests:", error);
      }
    };

    const fetchApprovedDonations = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/ngos/approved", { credentials: "include" });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        console.log("Fetched Approved Donations:", data);
        setApprovedDonations(data);
      } catch (error) {
        console.error("Error fetching approved donations:", error);
      }
    };

    const fetchNgoRequestedDonations = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/ngos/my-requests", { credentials: "include" });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        console.log("Fetched NGO Requested Donations:", data);
        setNgoRequestedDonations(data);
      } catch (error) {
        console.error("Error fetching NGO requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonationRequests();
    fetchApprovedDonations();
    fetchNgoRequestedDonations();
  }, []);

  // ✅ Handle approving a donation request
  const handleApproveDonation = async (donationId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/ngos/requests/${donationId}/accept`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const approvedDonation = donationRequests.find(d => d._id === donationId);
      setApprovedDonations(prev => [...prev, { ...approvedDonation, ngoApproved: true }]);
      setDonationRequests(prevRequests => prevRequests.filter(d => d._id !== donationId));
      setSelectedDonation(null);
      console.log("Donation approved:", donationId);
    } catch (error) {
      console.error("Error approving donation:", error);
    }
  };

  // ✅ Handle submitting a new donation request
  const handleRequestSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/ngos/request-donation", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: requestForm.title,
          description: requestForm.description,
          quantity: requestForm.quantity,
          requiredBy: requestForm.requiredBy,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const newRequest = await response.json();
      setNgoRequestedDonations(prev => [...prev, newRequest]);
      setShowRequestForm(false);
      console.log("Request submitted successfully:", newRequest);
    } catch (error) {
      console.error("Error submitting request:", error);
    }
  };


  const getDonationStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Pending Approval</span>;
      case 'ngo_approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Approved</span>;
      case 'claimed':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Claimed by Volunteer</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Delivered</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold">NGO Dashboard</h1>
            <p className="text-neutral-600">Review donations and manage requests</p>
          </div>

          <div className='flex space-x-4'>
            <Link to="/prediction">
              <Button>
                Surplus Prediction
              </Button>
            </Link>

            <Link to="/ml">
              <Button>
                ML Recommendations
              </Button>
            </Link>

            <Button onClick={() => setShowRequestForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Request Donation
            </Button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Available Donations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 rounded-2xl relative"
          >
            <div className='gradient' />
            <h2 className="text-xl font-semibold mb-4">Available Donations</h2>
            {donationRequests.length > 0 ? (
              <div className="space-y-4">
                {[...donationRequests].reverse().map((donation) => (
                  <div key={donation._id} className="bg-gray-100/50 p-4 rounded-lg">
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
                    <Button
                      onClick={() => setSelectedDonation(donation)}
                      className="w-full mt-3"
                    >
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            ) : <p className="text-neutral-600">No pending donation requests.</p>}
          </motion.div>

          {/* Approved Donations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 rounded-2xl relative"
          >
            <div className='gradient' />
            <h2 className="text-xl font-semibold mb-4">Approved Donations</h2>
            {approvedDonations.length > 0 ? (
              <div className="space-y-4">
                {[...approvedDonations].reverse().map((donation) => (
                  <div key={donation.id} className="bg-gray-100/50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{donation.title}</h3>
                      <span className="text-sm text-neutral-600">
                        {donation.quantity} servings
                      </span>
                    </div>
                    <div className="text-sm text-neutral-600 mb-3">
                      <p className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {donation.pickupAddress}
                      </p>
                      <p className="flex items-center mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        Pickup at {donation.pickupTime}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      {getDonationStatusBadge(donation.status)}
                      {donation.claimedBy ? (
                        <span className="text-sm text-blue-600">Claimed by volunteer</span>
                      ) : (
                        <span className="text-sm text-neutral-600">Awaiting volunteer</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-600">No approved donations</p>
            )}
          </motion.div>

          {/* My Requests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 rounded-2xl relative"
          >
            <div className='gradient' />
            <h2 className="text-xl font-semibold mb-4">My Requests</h2>
            {NgoRequestedDonations.length > 0 ? (
              <div className="space-y-4">
                {[...NgoRequestedDonations].reverse().map((request) => (
                  <div key={request._id} className="bg-gray-100/50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{request.title}</h3>
                      <span className={`text-sm px-2 py-1 rounded-full ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-neutral-600">
                      <p>{request.quantity} servings needed</p>
                      <p>Required by: {new Date(request.requiredBy).toLocaleDateString()}</p>
                      {request.dietaryRequirements.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {request.dietaryRequirements.map((req, index) => (
                            <span key={index} className="text-xs bg-neutral-100 px-2 py-1 rounded-full">
                              {req}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-600">No requests made yet</p>
            )}
          </motion.div>
        </div>

        {/* Donation Details Modal */}
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
                  onClick={() => handleApproveDonation(selectedDonation._id)}
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

        {/* Request Form Modal */}
        {showRequestForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[101]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-semibold mb-4">Request Donation</h3>
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title*</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white/50"
                    value={requestForm.title}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Need food for 100 people"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description*</label>
                  <textarea
                    required
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white/50 h-24"
                    value={requestForm.description}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your requirements..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Quantity (servings)*</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white/50"
                    value={requestForm.quantity}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Required By*</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white/50"
                    value={requestForm.requiredBy}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, requiredBy: e.target.value }))}
                  />
                </div>

                {/* <div>
                  <label className="block text-sm font-medium mb-2">Dietary Requirements</label>
                  <div className="space-y-2">
                    {requestForm.dietaryRequirements ?.map((type) => (
                      <label key={type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={requestForm.dietaryRequirements.includes(type)}
                          onChange={(e) => {
                            const updatedReqs = e.target.checked
                              ? [...requestForm.dietaryRequirements, type]
                              : requestForm.dietaryRequirements.filter(t => t !== type);
                            setRequestForm(prev => ({ ...prev, dietaryRequirements: updatedReqs }));
                          }}
                          className="rounded border-neutral-300"
                        />
                        <span className="text-sm">{type}</span>
                      </label>
                    ))}
                  </div>
                </div> */}

                <div>
                  <label className="block text-sm font-medium mb-2">Dietary Requirements</label>
                  <div className="space-y-2">
                    {['Vegetarian', 'Non-Vegetarian'].map((type) => (
                      <label key={type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={requestForm.dietaryRequirements.includes(type)}
                          onChange={(e) => {
                            const updatedReqs = e.target.checked
                              ? [...requestForm.dietaryRequirements, type]
                              : requestForm.dietaryRequirements.filter(t => t !== type);
                            setRequestForm(prev => ({
                              ...prev,
                              dietaryRequirements: updatedReqs
                            }));
                          }}
                          className="rounded border-neutral-300"
                        />
                        <span className="text-sm">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    Submit Request
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRequestForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

