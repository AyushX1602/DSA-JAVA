import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { LatLng, Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
const icon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function LocationMarker({ position, setPosition }) {
  const map = useMap();

  useEffect(() => {
    if (!position) {
      map.locate().on("locationfound", function (e) {
        setPosition(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
      });
    }
  }, [map, position, setPosition]);

  const handleMapClick = useCallback((e) => {
    setPosition(e.latlng);
  }, [setPosition]);

  useEffect(() => {
    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, handleMapClick]);

  return position === null ? null : (
    <Marker position={position} icon={icon} />
  );
}

export function MapPicker({ onLocationSelect, initialLocation }) {
  const [position, setPosition] = useState(
    initialLocation 
      ? new LatLng(initialLocation.lat, initialLocation.lng)
      : null
  );

  useEffect(() => {
    if (position) {
      // Reverse geocoding using OpenStreetMap Nominatim
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`)
        .then(response => response.json())
        .then(data => {
          const address = data.display_name;
          onLocationSelect(position.lat, position.lng, address);
        })
        .catch(error => {
          console.error('Error getting address:', error);
          onLocationSelect(position.lat, position.lng, '');
        });
    }
  }, [position, onLocationSelect]);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          const newPosition = new LatLng(
            location.coords.latitude,
            location.coords.longitude
          );
          setPosition(newPosition);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="h-[300px] rounded-lg overflow-hidden border border-neutral-200">
        <MapContainer
          center={position || [20.5937, 78.9629]} // Default to India's center
          zoom={position ? 13 : 4}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
      >
        📍 Use current location
      </button>
    </div>
  );
}
