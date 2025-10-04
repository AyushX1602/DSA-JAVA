import GoogleMap from './google-map';

const LocationMap = ({ place, height = '200px', className = '' }) => {
  if (!place.latitude || !place.longitude) {
    return (
      <div
        className={`bg-gray-50 border border-gray-200 rounded-lg p-4 text-center ${className}`}
        style={{ height }}
      >
        <p className="text-gray-500 text-sm">No location data available</p>
        <p className="text-xs text-gray-400 mt-1">
          This place doesn't have coordinates yet
        </p>
      </div>
    );
  }

  const center = {
    lat: Number(place.latitude),
    lng: Number(place.longitude),
  };

  const markers = [
    {
      lat: Number(place.latitude),
      lng: Number(place.longitude),
      title: place.name,
      description: `Location: ${place.name}`,
      label: place.name.charAt(0).toUpperCase(),
    },
  ];

  return (
    <GoogleMap
      center={center}
      markers={markers}
      zoom={14}
      height={height}
      className={className}
    />
  );
};

export default LocationMap;
