import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Check, X, Eye,CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';


export function ValidationTable({ type, searchTerm}) {
    const [data, setData] = useState([]);
    const [donationValidation, setDonationValidation] = useState([]);
    const [ngoValidation, setNgoValidation] = useState([]);
    const [volunteerValidation, setVolunteerValidation] = useState([]);
    const [loading, setLoading] = useState(true);
     const [selectedDonation, setSelectedDonation] = useState(null);


    useEffect(() => {
        const fetchNgoForm = async () => {
            try {
                const response = await fetch("http://localhost:5000/admin/ngo", {
                    credentials: "include", // Ensure authentication if using sessions
                });
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();

                // Update the correct state with fetched data
                setNgoValidation(data); // Assuming the fetched data is for donation validation
            } catch (error) {
                console.error("Error fetching donations:", error);
            } finally {
                setLoading(false); // Update loading state
            }
        };

        fetchNgoForm();
    }, []);


    useEffect(() => {
        const fetchDonationForm = async () => {
            try {
                const response = await fetch("http://localhost:5000/admin/donation", {
                    credentials: "include", // Ensure authentication if using sessions
                });
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();
                console.log("Fetched Donations:", data);

                // Update the correct state with fetched data
                console.log(data)
                setDonationValidation(data); // Assuming the fetched data is for donation validation
                setSelectedDonation(null)
            } catch (error) {
                console.error("Error fetching donations:", error);
            } finally {
                setLoading(false); // Update loading state
            }
        };

        fetchDonationForm();
    }, []);


    useEffect(() => {
        const fetchVolunteerForm = async () => {
            try {
                const response = await fetch("http://localhost:5000/admin/volunteer", {
                    credentials: "include", // Ensure authentication if using sessions
                });
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();
                console.log("Fetched Donations:", data);

                // Update the correct state with fetched data
                setVolunteerValidation(data); // Assuming the fetched data is for donation validation
            } catch (error) {
                console.error("Error fetching donations:", error);
            } finally {
                setLoading(false); // Update loading state
            }
        };

        fetchVolunteerForm();
    }, []);


    const getStatusClass = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };


    const handleApprove = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/admin/donation/${id}/approve`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: "approved" }),
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            // Update state to reflect the change
            setDonationValidation(prevData =>
                prevData.map(item =>
                    item._id === id ? { ...item, status: 'approved' } : item
                )
            );
    
            toast.success("Donation approved successfully");
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to approve donation");
        }
    };
    
    const handleReject = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/admin/donation/${id}/reject`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: "rejected" }),
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            // Update state to reflect the change
            setDonationValidation(prevData =>
                prevData.map(item =>
                    item._id === id ? { ...item, status: 'rejected' } : item
                )
            );
    
            toast.error("Donation rejected");
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to reject donation");
        }
    };
    
    



    const renderTableContent = () => {
        switch (type) {
            case 'donations':
                return (
                    <>
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">Donation ID</th>
                                <th className="px-6 py-3 text-left">Donor Name</th>
                                <th className="px-6 py-3 text-left">Food Type</th>
                                <th className="px-6 py-3 text-left">Expiry Date</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {donationValidation.map((item) => {
                                const donation = item;
                                return (
                                    <tr key={donation.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">{donation._id}</td>
                                        <td className="px-6 py-4">{donation.donorName}</td>
                                        <td className="px-6 py-4">{donation.foodType}</td>
                                        <td className="px-6 py-4">{donation.expiryDate}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(donation.status)}`}>
                                                {donation.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleApprove(donation._id)}
                                                    className="p-1 rounded-full hover:bg-green-100"
                                                    disabled={donation.status !== 'pending'}
                                                >
                                                    <Check className="w-5 h-5 text-green-600" />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(donation._id)}
                                                    className="p-1 rounded-full hover:bg-red-100"
                                                    disabled={donation.status !== 'pending'}
                                                >
                                                    <X className="w-5 h-5 text-red-600" />
                                                </button>
                                                <button
                                                    onClick={() => setSelectedDonation(donation)}
                                                    className="p-1 rounded-full hover:bg-blue-100"
                                                >
                                                    <Eye className="w-5 h-5 text-blue-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </>
                );

            case 'ngos':
                return (
                    <>
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">NGO ID</th>
                                <th className="px-6 py-3 text-left">Name</th>
                                <th className="px-6 py-3 text-left">Registration Number</th>
                                <th className="px-6 py-3 text-left">Contact</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {ngoValidation.map((item) => {
                                const ngo = item;
                                return (
                                    <tr key={ngo.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">{ngo._id}</td>
                                        <td className="px-6 py-4">{ngo.name}</td>
                                        <td className="px-6 py-4">{ngo.registrationNumber}</td>
                                        <td className="px-6 py-4">{ngo.phone}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(ngo.status)}`}>
                                                {ngo.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleApprove(ngo.id)}
                                                    className="p-1 rounded-full hover:bg-green-100"
                                                    disabled={ngo.status !== 'pending'}
                                                >
                                                    <Check className="w-5 h-5 text-green-600" />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(ngo.id)}
                                                    className="p-1 rounded-full hover:bg-red-100"
                                                    disabled={ngo.status !== 'pending'}
                                                >
                                                    <X className="w-5 h-5 text-red-600" />
                                                </button>
                                                <button
                                                    onClick={() => handleViewDetails(ngo.id)}
                                                    className="p-1 rounded-full hover:bg-blue-100"
                                                >
                                                    <Eye className="w-5 h-5 text-blue-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </>
                );

            case 'volunteers':
                return (
                    <>
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">Volunteer ID</th>
                                <th className="px-6 py-3 text-left">Name</th>
                                <th className="px-6 py-3 text-left">Gender</th>
                                <th className="px-6 py-3 text-left">Has Vehicle</th>
                                <th className="px-6 py-3 text-left">Contact</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {volunteerValidation.map((item) => {
                                const volunteer = item;
                                return (
                                    <tr key={volunteer.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">{volunteer._id}</td>
                                        <td className="px-6 py-4">{volunteer.fullName}</td>
                                        <td className="px-6 py-4">{volunteer.gender}</td>
                                        <td className="px-6 py-4">{volunteer.hasVehicle}</td>
                                        <td className="px-6 py-4">{volunteer.phone}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(volunteer.status)}`}>
                                                {volunteer.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleApprove(volunteer._id)}
                                                    className="p-1 rounded-full hover:bg-green-100"
                                                    disabled={volunteer.status !== 'pending'}
                                                >
                                                    <Check className="w-5 h-5 text-green-600" />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(volunteer._id)}
                                                    className="p-1 rounded-full hover:bg-red-100"
                                                    disabled={volunteer.status !== 'pending'}
                                                >
                                                    <X className="w-5 h-5 text-red-600" />
                                                </button>
                                                <button
                                                    onClick={() => handleViewDetails(volunteer._id)}
                                                    className="p-1 rounded-full hover:bg-blue-100"
                                                >
                                                    <Eye className="w-5 h-5 text-blue-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </>
                );
        }
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
                {renderTableContent()}
            </table>

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
                                onClick={() => setSelectedDonation(null)}
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
    );
}

