import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenerateAITrip } from '@/hooks/react-query/use-ai-trip-generation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AITripGenerationForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    city: '',
    duration: 3,
    budget: '500',
    interests: [],
  });
  const [newInterest, setNewInterest] = useState('');

  const { mutateAsync: generateTrip, isPending } = useGenerateAITrip({
    onSuccess: (data) => {
      navigate(`/trips/${data.tripId}/planner`);
    },
    onError: (error) => {
      console.error('Failed to generate trip:', error);
      alert('Failed to generate trip. Please try again.');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.city.trim()) {
      alert('Please enter a city name');
      return;
    }

    try {
      await generateTrip({
        city: form.city.trim(),
        duration: parseInt(form.duration),
        budget: form.budget,
        interests: form.interests,
      });
    } catch (error) {
      console.error('Error generating trip:', error);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !form.interests.includes(newInterest.trim())) {
      setForm((prev) => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()],
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interestToRemove) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.filter(
        (interest) => interest !== interestToRemove,
      ),
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addInterest();
    }
  };

  return (
    <div className="flex justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            AI-Powered Trip Generator
          </CardTitle>
          <p className="text-center text-gray-600">
            Let AI create a personalized travel itinerary for you!
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="city">Destination City *</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, city: e.target.value }))
                }
                placeholder="e.g., Paris, Tokyo, New York"
                required
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Trip Duration (Days) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="30"
                value={form.duration}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    duration: parseInt(e.target.value) || 1,
                  }))
                }
                required
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget *</Label>
              <Input
                id="budget"
                value={form.budget}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, budget: e.target.value }))
                }
                placeholder="e.g., 1000 USD, 500 EUR"
                required
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label>Interests & Preferences</Label>
              <div className="flex gap-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., Museums, Food, Nature"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addInterest}
                  variant="outline"
                  disabled={!newInterest.trim()}
                >
                  Add
                </Button>
              </div>

              {form.interests.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.interests.map((interest, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => removeInterest(interest)}
                    >
                      {interest} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <CardFooter className="px-0">
              <Button
                type="submit"
                disabled={isPending || !form.city.trim()}
                className="w-full text-lg py-3"
              >
                {isPending ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Generating Your Trip...
                  </>
                ) : (
                  <>
                    <span className="mr-2">✨</span>
                    Generate AI Trip
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AITripGenerationForm;
