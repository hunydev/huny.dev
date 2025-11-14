import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface GeoVisionMapProps {
  latitude: number;
  longitude: number;
  zoom: number;
}

const GeoVisionMap: React.FC<GeoVisionMapProps> = ({ latitude, longitude, zoom }) => {
  return (
    <div className="rounded border border-white/10 overflow-hidden bg-black/60">
      <MapContainer
        center={[latitude, longitude]}
        zoom={zoom}
        minZoom={1}
        maxZoom={18}
        scrollWheelZoom
        className="w-full h-80 md:h-96"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <Marker position={[latitude, longitude]} />
      </MapContainer>
    </div>
  );
};

export default GeoVisionMap;
