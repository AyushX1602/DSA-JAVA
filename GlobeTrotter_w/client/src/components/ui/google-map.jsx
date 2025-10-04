import { useEffect, useMemo, useRef, useState } from 'react';
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
} from '@vis.gl/react-google-maps';

const MINIMAL_STYLE = [
  { elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text',
    stylers: [{ visibility: 'on' }, { color: '#b76b8a' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#f7cade' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry.fill',
    stylers: [{ color: '#fcedf6' }],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.fill',
    stylers: [{ color: '#fff1f7' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#f3b4cf' }, { visibility: 'simplified' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#e88bb5' }, { weight: 0.5 }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#f3a7c7' }, { weight: 1 }],
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#f7b6cf' }, { weight: 0.8 }],
  },
];

const GoogleMap = ({
  center,
  markers = [],
  zoom = 12,
  height = '300px',
  className = '',
  onMarkerClick,
  maxFitZoom = 4,
}) => {
  const mapRef = useRef(null);
  const [hoverIdx, setHoverIdx] = useState(null);
  const markerRefs = useRef([]);
  const [mapReady, setMapReady] = useState(false);
  const initialCenter = useMemo(() => center || { lat: 0, lng: 0 }, [center]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !markers?.length) return;
    if (markers.length === 1) {
      map.setCenter({ lat: markers[0].lat, lng: markers[0].lng });
      map.setZoom(maxFitZoom);
      return;
    }
    const bounds = new window.google.maps.LatLngBounds();
    markers.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));
    map.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 });
    window.google.maps.event.addListenerOnce(map, 'idle', () => {
      const z = map.getZoom();
      if (z && z > maxFitZoom) map.setZoom(maxFitZoom);
    });
  }, [markers, zoom, mapReady]);

  useEffect(() => {
    if (!mapReady || !markers?.length) return;
    const g = window.google;
    const map = mapRef.current;
    if (!g || !map) return;

    const fit = () => {
      if (!map || !markers?.length) return;
      if (markers.length === 1) {
        map.setCenter({ lat: markers[0].lat, lng: markers[0].lng });
        map.setZoom(maxFitZoom);
        return;
      }
      const bounds = new g.maps.LatLngBounds();
      markers.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));
      map.fitBounds(bounds, { top: 64, right: 64, bottom: 64, left: 64 });
      g.maps.event.addListenerOnce(map, 'idle', () => {
        const z = map.getZoom();
        if (z && z > maxFitZoom) map.setZoom(maxFitZoom);
      });
    };

    const onceIdle = g.maps.event.addListenerOnce(map, 'idle', fit);
    const timeoutId = setTimeout(fit, 200);

    let resizeTimer = null;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fit, 200);
    };
    window.addEventListener('resize', onResize);

    return () => {
      if (onceIdle) g.maps.event.removeListener(onceIdle);
      clearTimeout(timeoutId);
      window.removeEventListener('resize', onResize);
    };
  }, [mapReady, markers, zoom, maxFitZoom]);

  useEffect(() => {
    markerRefs.current = new Array(markers?.length || 0);
  }, [markers?.length]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const buildSvgPin = (hex = '#3b82f6', stroke = '#000', scale = 1) => {
    const w = 36 * scale;
    const h = 36 * scale;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 24 24'>
      <path d='M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z' fill='${hex}' stroke='${stroke}' stroke-width='1.5'/>
      <circle cx='12' cy='9' r='3' fill='white' stroke='${stroke}' stroke-width='1.2'/>
    </svg>`;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  };

  const palette = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  const current = hoverIdx !== null ? markers[hoverIdx] : null;

  return (
    <div className={className} style={{ height, backgroundColor: '#fcedf6' }}>
      <APIProvider
        apiKey={apiKey}
        onLoad={() => {
          /* API ready */
        }}
      >
        <Map
          defaultZoom={maxFitZoom}
          defaultCenter={initialCenter}
          gestureHandling="greedy"
          disableDefaultUI={true}
          zoomControl={false}
          streetViewControl={false}
          mapTypeControl={false}
          fullscreenControl={false}
          styles={MINIMAL_STYLE}
          onMapLoad={(map) => {
            mapRef.current = map;
            setMapReady(true);
          }}
          onClick={() => setHoverIdx(null)}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
          }}
        >
          {markers?.map((m, idx) => (
            <Marker
              key={`${m.lat}-${m.lng}-${idx}`}
              ref={(mk) => {
                markerRefs.current[idx] = mk;
              }}
              position={{ lat: m.lat, lng: m.lng }}
              onClick={() => onMarkerClick && onMarkerClick(m, idx)}
              onMouseOver={() => setHoverIdx(idx)}
              zIndex={hoverIdx === idx ? 999 : 1}
              icon={buildSvgPin(
                palette[idx % palette.length],
                '#000',
                hoverIdx === idx ? 1.25 : 1,
              )}
            />
          ))}

          {current && (
            <InfoWindow
              position={{ lat: current.lat, lng: current.lng }}
              onCloseClick={() => setHoverIdx(null)}
            >
              <div style={{ minWidth: 180 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  {current.title || 'Location'}
                </div>
                {current.cost !== undefined && (
                  <div>
                    Estimated cost:{' '}
                    <b>${Number(current.cost || 0).toFixed(2)}</b>
                  </div>
                )}
                {current.startTime && <div>Start: {current.startTime}</div>}
                {current.endTime && <div>End: {current.endTime}</div>}
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
};

export default GoogleMap;
