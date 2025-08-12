import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function VenueLocationMap({ latitude, longitude }) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return <div className="h-96 w-full bg-gray-200 flex items-center justify-center text-gray-500">Location not available</div>;
  }
  
  const position = [latitude, longitude];

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden">
        <MapContainer 
            center={position} 
            zoom={13} 
            scrollWheelZoom={false} 
            className="h-full w-full"
            dragging={false}
            zoomControl={false}
            doubleClickZoom={false}
        >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            Venue Location
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}