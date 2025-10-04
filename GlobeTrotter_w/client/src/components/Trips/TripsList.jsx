import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import {
  useTripsList,
  usePublicTripsList,
} from '@/hooks/react-query/use-trips';
import { useAtomValue } from 'jotai';
import { authUserAtom } from '@/lib/auth.atoms';
import TripFilters from './TripFilters';
import TripCoverImage from './TripCoverImage';

const TripsList = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState({
    name: '',
    startDate: '',
    endDate: '',
    minBudget: '',
    maxBudget: '',
  });

  const user = useAtomValue(authUserAtom);
  const navigate = useNavigate();

  // Always fetch public trips, and user trips when authenticated
  const { data: userTripsData, isLoading: userTripsLoading } = useTripsList(
    { page, limit, filters },
    { enabled: !!user },
  );
  const { data: publicTripsData, isLoading: publicTripsLoading } =
    usePublicTripsList({ page, limit, filters });

  // Combine trips when user is authenticated, or just show public trips
  let data, isLoading, trips;

  if (user) {
    // When authenticated, show both user trips and public trips
    isLoading = userTripsLoading || publicTripsLoading;
    const userTrips = userTripsData?.trips || [];
    const publicTrips = publicTripsData?.trips || [];

    // Mark user's own trips vs public trips
    const markedUserTrips = userTrips.map((trip) => ({
      ...trip,
      isOwned: true,
    }));
    const markedPublicTrips = publicTrips
      .filter((trip) => trip.ownerId !== user.userId) // Don't duplicate user's own public trips
      .map((trip) => ({ ...trip, isOwned: false }));
    const merged = [...markedUserTrips, ...markedPublicTrips];
    const seen = new Set();
    trips = merged.filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
    // Create combined pagination info
    const totalTrips = trips.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    trips = trips.slice(startIndex, endIndex);

    data = {
      trips,
      pagination: {
        page,
        limit,
        total: totalTrips,
        pages: Math.ceil(totalTrips / limit),
      },
    };
  } else {
    // When not authenticated, just show public trips
    data = publicTripsData;
    isLoading = publicTripsLoading;
    trips = data?.trips || [];
  }
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      name: '',
      startDate: '',
      endDate: '',
      minBudget: '',
      maxBudget: '',
    });
    setPage(1); // Reset to first page when filters are cleared
  };

  const formatBudget = (budget) => {
    if (!budget || budget === 0) return 'Budget: $0';
    return `Budget: $${parseFloat(budget).toLocaleString()}`;
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {user ? 'All Trips' : 'Discover Amazing Trips'}
        </h2>
        {user && (
          <Button onClick={() => navigate('/trips/new')}>New Trip</Button>
        )}
      </div>
      {user && (
        <div className="text-sm text-muted-foreground">
          Showing your trips and public trips from the community
        </div>
      )}

      <TripFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {isLoading ? (
        <div>Loading...</div>
      ) : trips.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No trips found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {Object.values(filters).some((f) => f)
                ? 'No trips match your current filters. Try adjusting your search criteria.'
                : user
                  ? 'Create your first trip.'
                  : 'Be the first to share your travel experiences with the world!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((t) => (
            <Link
              key={t.id}
              to={`/trips/${t.id}`}
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-base"
              aria-label={`Open trip ${t.name}`}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer pt-0">
                <TripCoverImage tripId={t.id} />
                <CardHeader>
                  <CardTitle className="text-base">{t.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <div>
                    {new Date(t.startDate).toLocaleDateString()} -{' '}
                    {new Date(t.endDate).toLocaleDateString()}
                  </div>
                  <div className="text-muted-foreground">
                    {formatBudget(t.budget)}
                  </div>
                  <div>
                    <span className="underline">View</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <div className="text-sm text-muted-foreground">
          Page {pagination.page} of {pagination.pages} ({pagination.total}{' '}
          total)
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={pagination.pages && page >= pagination.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TripsList;
