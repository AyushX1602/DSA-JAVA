import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';

export function AdminPanel() {

  const [donationRequests, setDonationRequests] = useState([]);
  const [donations, setDonations] = useState([])

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 flex justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-neutral-600">Monitor and manage platform activity</p>
          </div>

          <Link to='/validations'>
            <Button>
              Validations
            </Button>
          </Link>

        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 rounded-2xl relative"
          >
            <div className='gradient'/>
            <h2 className="text-xl font-semibold mb-4">Users</h2>
            <p className="text-4xl font-bold">0</p>
            <p className="text-neutral-600">Total Users</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 rounded-2xl relative"
          >
            <div className='gradient'/>
            <h2 className="text-xl font-semibold mb-4">Donations</h2>
            <p className="text-4xl font-bold"></p>
            <p className="text-neutral-600">Active Donations</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 rounded-2xl relative"
          >
            <div className='gradient'/>
            <h2 className="text-xl font-semibold mb-4">Deliveries</h2>
            <p className="text-4xl font-bold"></p>
            <p className="text-neutral-600">Completed Deliveries</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl relative"
        >
          <div className='gradient'/>
          <h2 className="text-xl font-semibold mb-4">Recent Donations</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Title</th>
                  <th className="text-left py-3 px-4">Donor</th>
                  <th className="text-left py-3 px-4">Quantity</th>
                  <th className="text-left py-3 px-4">Pickup Time</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {donations.length > 0 ? (
                  donations.map((donation) => (
                    <tr key={donation.id} className="border-b">
                      <td className="py-3 px-4">{donation.title}</td>
                      <td className="py-3 px-4">{donation.donorName}</td>
                      <td className="py-3 px-4">{donation.quantity} servings</td>
                      <td className="py-3 px-4">{donation.pickupTime}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          donation.status === 'claimed' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-neutral-600">
                      No donations yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}