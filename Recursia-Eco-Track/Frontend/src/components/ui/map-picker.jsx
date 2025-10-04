import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom draggable marker component
const DraggableMarker = ({ position, onLocationChange }) => {
  const [draggable, setDraggable] = useState(true);
  const markerRef = useRef(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        onLocationChange([newPos.lng, newPos.lat]);
      }
    },
  };

  return (
    <Marker
      draggable={draggable}
      eventHandlers={eventHandlers}
      position={[position[1], position[0]]} // Leaflet uses [lat, lng]
      ref={markerRef}
    />
  );
};

// Component to handle map clicks
const MapClickHandler = ({ onLocationChange }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationChange([lng, lat]);
    },
  });
  return null;
};

// Component to handle map centering
const MapCenter = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.length === 2) {
      map.setView([center[1], center[0]], zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

const MapPicker = ({ 
  coordinates = [-74.006, 40.7128], // Default to NYC
  onLocationChange, 
  height = 240,
  zoom = 13,
  className = ""
}) => {
  const [mapKey, setMapKey] = useState(0);

  // Force re-render when coordinates change significantly (for GPS location)
  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [coordinates[0]?.toFixed(3), coordinates[1]?.toFixed(3)]);

  const handleLocationChange = (newCoords) => {
    if (onLocationChange) {
      onLocationChange(newCoords);
    }
  };

  return (
    <div className={`relative rounded-lg overflow-hidden border-2 border-gray-200 ${className}`}>
      <MapContainer
        key={mapKey}
        center={[coordinates[1], coordinates[0]]} // Leaflet uses [lat, lng]
        zoom={zoom}
        style={{ height: `${height}px`, width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <DraggableMarker 
          position={coordinates} 
          onLocationChange={handleLocationChange}
        />
        
        <MapClickHandler onLocationChange={handleLocationChange} />
        
        <MapCenter center={coordinates} zoom={zoom} />
      </MapContainer>
      
      {/* Overlay instructions */}
      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-gray-200">
        <p className="text-xs font-semibold text-gray-700">
          📍 Click or drag to select location
        </p>
      </div>
      
      {/* Zoom controls info */}
      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-md border border-gray-200">
        <p className="text-xs font-medium text-gray-600">
          Use mouse wheel to zoom
        </p>
      </div>
    </div>
  );
};

export default MapPicker;
