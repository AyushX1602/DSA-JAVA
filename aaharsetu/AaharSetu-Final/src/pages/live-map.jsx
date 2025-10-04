import React from 'react';
import { motion } from 'framer-motion';

export function LiveMap() {
  return (
    <div className="min-h-screen pt-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-[calc(100vh-5rem)]"
      >
        <div className="h-full glass-card m-4 rounded-2xl flex items-center justify-center">
          <p className="text-neutral-600">Map integration coming soon</p>
        </div>
      </motion.div>
    </div>
  );
}