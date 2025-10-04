import { useState, useEffect } from 'react';
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
import { useTripSuggestions } from '@/hooks/react-query/use-trips';
import { Lightbulb, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
};

const fromLocalInput = (val) => (val ? new Date(val).toISOString() : '');

const TripForm = ({
  initial = null,
  onSubmit,
  submitting = false,
  submitLabel = 'Save',
}) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    isPublic: false,
  });

  // Debounce search terms to avoid too many API calls
  const [debouncedName, setDebouncedName] = useState('');
  const [debouncedDescription, setDebouncedDescription] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedName(form.name);
    }, 500);
    return () => clearTimeout(timer);
  }, [form.name]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDescription(form.description);
    }, 500);
    return () => clearTimeout(timer);
  }, [form.description]);

  // Get trip suggestions based on current form values
  const { data: suggestions = { trips: [] }, isLoading: loadingSuggestions } =
    useTripSuggestions(debouncedName, debouncedDescription, {
      enabled: !initial && (!!debouncedName || !!debouncedDescription), // Only suggest for new trips
      limit: 5,
    });

  // Show suggestions section when creating a new trip and user has typed something meaningful
  const showSuggestionsSection =
    !initial && (!!debouncedName || !!debouncedDescription);
  const hasSuggestions = suggestions.trips && suggestions.trips.length > 0;

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        description: initial.description || '',
        startDate: toLocalInput(initial.startDate),
        endDate: toLocalInput(initial.endDate),
        isPublic: initial.isPublic || false,
      });
    }
  }, [initial]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description || undefined,
      startDate: fromLocalInput(form.startDate),
      endDate: fromLocalInput(form.endDate),
      isPublic: form.isPublic,
    };
    onSubmit?.(payload);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Trip</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={handleChange}
              required
              maxLength={120}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={form.description}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={form.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              id="isPublic"
              type="checkbox"
              checked={form.isPublic}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <Label htmlFor="isPublic" className="text-sm">
              Make this trip public (visible to everyone)
            </Label>
          </div>
          <CardFooter className="px-0">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : submitLabel}
            </Button>
          </CardFooter>
        </form>
      </CardContent>

      {/* Trip Suggestions Section */}
      {showSuggestionsSection && (
        <CardContent className="pt-0">
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <Label className="text-sm font-medium text-gray-700">
                Similar public trips you might find interesting
              </Label>
            </div>

            {loadingSuggestions && (
              <div className="text-xs text-gray-500 text-center py-3">
                Finding similar trips...
              </div>
            )}

            {!loadingSuggestions && hasSuggestions && (
              <div className="space-y-2">
                {suggestions.trips.map((trip) => (
                  <Card
                    key={trip.id}
                    className="p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {trip.name}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            Public
                          </Badge>
                        </div>
                        {trip.description && (
                          <p className="text-xs text-gray-600 line-clamp-1 mb-1">
                            {trip.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>
                            {new Date(trip.startDate).toLocaleDateString()} -{' '}
                            {new Date(trip.endDate).toLocaleDateString()}
                          </span>
                          {trip.ownerName && <span>by {trip.ownerName}</span>}
                          {trip.budget && parseFloat(trip.budget) > 0 && (
                            <span>
                              ${parseFloat(trip.budget).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        to={`/trips/${trip.id}`}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap"
                      >
                        View
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {!loadingSuggestions &&
              !hasSuggestions &&
              (debouncedName || debouncedDescription) && (
                <div className="text-xs text-gray-500 text-center py-3">
                  No similar public trips found. Your trip idea seems unique! 🌟
                </div>
              )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default TripForm;
