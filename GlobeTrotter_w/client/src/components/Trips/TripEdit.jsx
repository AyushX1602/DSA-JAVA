import { useParams } from 'react-router-dom';
import TripForm from '@/components/Trips/TripForm';
import { useTrip, useUpdateTrip } from '@/hooks/react-query/use-trips';

const TripEdit = () => {
  const { id } = useParams();
  const { data: trip, isLoading } = useTrip(id);

  const { mutateAsync, isPending } = useUpdateTrip();

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (!trip) return <div className="p-4">Not found</div>;

  return (
    <div className="flex justify-center p-4">
      <TripForm
        initial={trip}
        onSubmit={(data) => mutateAsync({ id, data })}
        submitting={isPending}
        submitLabel="Update Trip"
      />
    </div>
  );
};

export default TripEdit;
