import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TripFilters = ({ filters, onFiltersChange, onClearFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleInputChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      name: '',
      startDate: '',
      endDate: '',
      minBudget: '',
      maxBudget: '',
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">Filter Trips</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Trip Name</Label>
            <Input
              id="name"
              placeholder="Search by name..."
              value={localFilters.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={localFilters.startDate || ''}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={localFilters.endDate || ''}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minBudget">Min Budget</Label>
            <Input
              id="minBudget"
              type="number"
              placeholder="0"
              min="0"
              step="0.01"
              value={localFilters.minBudget || ''}
              onChange={(e) => handleInputChange('minBudget', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxBudget">Max Budget</Label>
            <Input
              id="maxBudget"
              type="number"
              placeholder="10000"
              min="0"
              step="0.01"
              value={localFilters.maxBudget || ''}
              onChange={(e) => handleInputChange('maxBudget', e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
          <Button onClick={handleApplyFilters}>Apply Filters</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripFilters;
