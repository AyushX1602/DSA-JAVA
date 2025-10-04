import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TripForm from '@/components/Trips/TripForm';
import AITripGenerationForm from '@/components/AI/AITripGenerationForm';
import { useCreateTrip } from '@/hooks/react-query/use-trips';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TripCreate = () => {
  const navigate = useNavigate();
  const [creationMode, setCreationMode] = useState('manual'); // "manual" or "ai"

  const { mutateAsync, isPending } = useCreateTrip({
    onSuccess: (trip) => navigate(`/trips/${trip.id}/planner`),
  });

  if (creationMode === 'ai') {
    return <AITripGenerationForm />;
  }

  return (
    <div className="flex justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Choose Trip Creation Method
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 justify-center">
            <Button
              variant={creationMode === 'manual' ? 'default' : 'outline'}
              onClick={() => setCreationMode('manual')}
              className="flex-1 max-w-xs"
            >
              ✏️ Manual Creation
            </Button>
            <Button
              variant={creationMode === 'ai' ? 'default' : 'outline'}
              onClick={() => setCreationMode('ai')}
              className="flex-1 max-w-xs"
            >
              AI Generation
            </Button>
          </CardContent>
        </Card>

        {/* Manual Trip Form */}
        <TripForm
          onSubmit={(payload) => mutateAsync(payload)}
          submitting={isPending}
          submitLabel="Create Trip"
        />
      </div>
    </div>
  );
};

export default TripCreate;
