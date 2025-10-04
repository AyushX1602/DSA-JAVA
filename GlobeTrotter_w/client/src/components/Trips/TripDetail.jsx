import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTrip, useDeleteTrip } from '@/hooks/react-query/use-trips';
import { useAtomValue } from 'jotai';
import { authUserAtom } from '@/lib/auth.atoms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Eye, Lock } from 'lucide-react';
import TripCoverImage from '@/components/Trips/TripCoverImage';

const TripDetail = () => {
  const { id } = useParams();
  const user = useAtomValue(authUserAtom);
  const { data: trip, isLoading } = useTrip(id);
  const navigate = useNavigate();
  const { mutateAsync: remove, isPending } = useDeleteTrip({
    onSuccess: () => navigate('/'),
  });

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (!trip) return <div className="p-4">Not found</div>;

  const onDelete = async () => {
    if (!confirm('Delete this trip?')) return;
    await remove(id);
    navigate('/');
  };

  const isOwned = trip.isOwned;
  const canEdit = user && isOwned;

  return (
    <div className="p-4 space-y-4">
      <TripCoverImage tripId={id} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Trip Details</h2>
          <div className="flex items-center gap-2">
            {isOwned && (
              <Badge variant="default" className="text-xs bg-green-600">
                <User className="w-3 h-3 mr-1" />
                Your Trip
              </Badge>
            )}
            {user && isOwned && (
              <Badge
                variant={trip.isPublic ? 'default' : 'secondary'}
                className="text-xs"
              >
                {trip.isPublic ? (
                  <>
                    <Eye className="w-3 h-3 mr-1" />
                    Public
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 mr-1" />
                    Private
                  </>
                )}
              </Badge>
            )}
            {user && !isOwned && (
              <Badge variant="outline" className="text-xs">
                <Eye className="w-3 h-3 mr-1" />
                Community
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {canEdit && (
            <>
              <Button variant="outline" asChild>
                <Link to={`/trips/${id}/planner`}>Planner</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/trips/${id}/edit`}>Edit</Link>
              </Button>
              <Button
                variant="destructive"
                onClick={onDelete}
                disabled={isPending}
              >
                {isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </>
          )}
          {!user && (
            <div className="text-sm text-muted-foreground">
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>{' '}
              to create your own trips
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{trip.name}</CardTitle>
            {!isOwned && trip.ownerName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>by {trip.ownerName}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {trip.description && <div>{trip.description}</div>}
          <div>
            <strong>Duration:</strong>{' '}
            {new Date(trip.startDate).toLocaleDateString()} -{' '}
            {new Date(trip.endDate).toLocaleDateString()}
          </div>
          {trip.budget && parseFloat(trip.budget) > 0 && (
            <div>
              <strong>Budget:</strong> $
              {parseFloat(trip.budget).toLocaleString()}
            </div>
          )}
          <div className="text-muted-foreground">
            Created: {new Date(trip.createdAt).toLocaleString()}
          </div>
          {trip.updatedAt && (
            <div className="text-muted-foreground">
              Updated: {new Date(trip.updatedAt).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TripDetail;
