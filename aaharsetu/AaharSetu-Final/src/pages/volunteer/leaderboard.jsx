import React from 'react';
import { motion } from 'framer-motion';
import { Medal, Trophy, Crown, Star, Package, Truck } from 'lucide-react';

const topVolunteers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    deliveries: 156,
    rating: 4.9,
    points: 15600,
    areas: ['North', 'Central'],
    joinedAt: '2024-01-15',
  },
  {
    id: 2,
    name: 'Michael Chen',
    deliveries: 142,
    rating: 4.8,
    points: 14200,
    areas: ['South', 'West'],
    joinedAt: '2024-01-20',
  },
  {
    id: 3,
    name: 'Priya Patel',
    deliveries: 128,
    rating: 4.9,
    points: 12800,
    areas: ['East', 'Central'],
    joinedAt: '2024-02-01',
  },
  {
    id: 4,
    name: 'David Wilson',
    deliveries: 115,
    rating: 4.7,
    points: 11500,
    areas: ['North', 'West'],
    joinedAt: '2024-02-10',
  },
  {
    id: 5,
    name: 'Emma Thompson',
    deliveries: 98,
    rating: 4.8,
    points: 9800,
    areas: ['South', 'Central'],
    joinedAt: '2024-02-15',
  },
];

const topDonors = [
  {
    id: 1,
    name: 'Grand Plaza Hotel',
    donations: 245,
    rating: 4.9,
    impact: '24,500 meals',
    type: 'hotel',
    joinedAt: '2024-01-10',
  },
  {
    id: 2,
    name: 'Fresh Feast Restaurant',
    donations: 198,
    rating: 4.8,
    impact: '19,800 meals',
    type: 'restaurant',
    joinedAt: '2024-01-25',
  },
  {
    id: 3,
    name: 'City Catering Co.',
    donations: 167,
    rating: 4.7,
    impact: '16,700 meals',
    type: 'catering',
    joinedAt: '2024-02-05',
  },
  {
    id: 4,
    name: 'Green Garden Bistro',
    donations: 134,
    rating: 4.8,
    impact: '13,400 meals',
    type: 'restaurant',
    joinedAt: '2024-02-12',
  },
  {
    id: 5,
    name: 'Royal Events',
    donations: 112,
    rating: 4.6,
    impact: '11,200 meals',
    type: 'catering',
    joinedAt: '2024-02-20',
  },
];

export function Leaderboard() {
  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold">Community Leaderboard</h1>
          <p className="text-neutral-600">Recognizing our top contributors making a difference</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Top Volunteers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 rounded-2xl relative"
          >
            <div className='gradient'/>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Top Volunteers
              </h2>
              <span className="text-sm text-neutral-600">Last 30 days</span>
            </div>

            <div className="space-y-4">
              {topVolunteers.map((volunteer, index) => (
                <div
                  key={volunteer.id}
                  className="bg-white/50 p-4 rounded-lg flex items-center gap-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    {index === 0 ? (
                      <Crown className="w-6 h-6 text-yellow-500" />
                    ) : index === 1 ? (
                      <Medal className="w-6 h-6 text-gray-400" />
                    ) : index === 2 ? (
                      <Medal className="w-6 h-6 text-amber-600" />
                    ) : (
                      <span className="text-lg font-semibold text-neutral-600">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">{volunteer.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      <span className="flex items-center gap-1">
                        <Truck className="w-4 h-4" />
                        {volunteer.deliveries} deliveries
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        {volunteer.rating}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{volunteer.points.toLocaleString()} pts</p>
                    <p className="text-sm text-neutral-600">
                      {volunteer.areas.join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Donors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 rounded-2xl relative"
          >
            <div className='gradient'/>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-500" />
                Top Donors
              </h2>
              <span className="text-sm text-neutral-600">Last 30 days</span>
            </div>

            <div className="space-y-4">
              {topDonors.map((donor, index) => (
                <div
                  key={donor.id}
                  className="bg-white/50 p-4 rounded-lg flex items-center gap-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    {index === 0 ? (
                      <Crown className="w-6 h-6 text-yellow-500" />
                    ) : index === 1 ? (
                      <Medal className="w-6 h-6 text-gray-400" />
                    ) : index === 2 ? (
                      <Medal className="w-6 h-6 text-amber-600" />
                    ) : (
                      <span className="text-lg font-semibold text-neutral-600">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">{donor.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {donor.donations} donations
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        {donor.rating}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{donor.impact}</p>
                    <p className="text-sm text-neutral-600 capitalize">
                      {donor.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}