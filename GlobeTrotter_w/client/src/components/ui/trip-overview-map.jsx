import GoogleMap from './google-map';

const TripOverviewMap = ({ stops = [], height = '400px', className = '' }) => {
  // Extract all places with coordinates from all stops and attach parent stop dates
  const placesWithCoords = stops
    .flatMap((stop) =>
      (stop.places || []).map((place) => ({
        ...place,
        __stopStart: stop.startDate,
        __stopEnd: stop.endDate,
      })),
    )
    .filter((place) => place.latitude && place.longitude);

  if (placesWithCoords.length === 0) {
    return (
      <div
        className={`bg-gray-50 border border-gray-200 rounded-lg p-4 text-center ${className}`}
        style={{ height }}
      >
        <p className="text-gray-500 text-sm">No locations to display</p>
        <p className="text-xs text-gray-400 mt-1">
          Add places to your trip stops to see them on the map
        </p>
      </div>
    );
  }

  // Calculate center point (average of all coordinates)
  const center = {
    lat:
      placesWithCoords.reduce((sum, place) => sum + Number(place.latitude), 0) /
      placesWithCoords.length,
    lng:
      placesWithCoords.reduce(
        (sum, place) => sum + Number(place.longitude),
        0,
      ) / placesWithCoords.length,
  };

  // Build markers showing stop-level start/end and place total expense
  const markers = placesWithCoords.map((place) => {
    const totalCost = Number(
      place.totalExpense ||
        (place.activities || []).reduce(
          (sum, a) => sum + Number(a.expense || 0),
          0,
        ),
    );
    const start = place.__stopStart ? new Date(place.__stopStart) : null;
    const end = place.__stopEnd ? new Date(place.__stopEnd) : null;

    return {
      lat: Number(place.latitude),
      lng: Number(place.longitude),
      title: place.name,
      cost: Number(totalCost.toFixed(2)),
      startTime: start ? start.toLocaleString() : null,
      endTime: end ? end.toLocaleString() : null,
    };
  });

  return (
    <div className={className}>
      <div className="mb-2">
        <h3 className="text-sm font-medium text-gray-700">Trip Overview Map</h3>
        <p className="text-xs text-gray-500">
          {placesWithCoords.length} location
          {placesWithCoords.length !== 1 ? 's' : ''} across {stops.length} stop
          {stops.length !== 1 ? 's' : ''}
        </p>
      </div>
      <GoogleMap
        center={center}
        markers={markers}
        zoom={4}
        maxFitZoom={4}
        height={height}
        className="w-full"
      />
    </div>
  );
};

export default TripOverviewMap;
