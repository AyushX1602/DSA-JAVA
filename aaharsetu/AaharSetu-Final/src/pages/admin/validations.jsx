import React, { useState } from 'react';
import { ValidationTable } from '../../components/layout/validationTable';
import { Search } from 'lucide-react';

export function Validations() {
  const [activeTab, setActiveTab] = useState('donations');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'donations', label: 'Donations' },
    { id: 'ngos', label: 'NGOs' },
    { id: 'volunteers', label: 'Volunteers' },
  ];

  return (
    <div className="py-20 px-4 w-full min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Validation Dashboard</h1>
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
      
      <ValidationTable
        type={activeTab}
        searchTerm={searchTerm}
      />
    </div>
  );
}