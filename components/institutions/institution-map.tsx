'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { School } from '@/lib/types';

function MapController({ selectedSchool }: { selectedSchool: School | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedSchool?.latitude && selectedSchool?.longitude) {
      map.flyTo([selectedSchool.latitude, selectedSchool.longitude], 14, {
        duration: 2,
      });
    }
  }, [selectedSchool, map]);

  return null;
}

interface InstitutionMapProps {
  schools: School[];
  selectedSchool: School | null;
  onSchoolSelect: (school: School) => void;
}

export default function InstitutionMap({ schools, selectedSchool, onSchoolSelect }: InstitutionMapProps) {
  // Center map on East Africa by default (where most DIY Hub activity is)
  const defaultCenter = useMemo((): [number, number] => [0.3476, 32.5825], []);

  const customIcon = useMemo(() => L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute h-10 w-10 bg-primary/20 rounded-full animate-pulse"></div>
        <div class="h-6 w-6 bg-primary rounded-full border-2 border-white shadow-[0_0_15px_rgba(var(--primary),0.8)] flex items-center justify-center">
          <div class="h-2 w-2 bg-white rounded-full"></div>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  }), []);

  const selectedIcon = useMemo(() => L.divIcon({
    className: 'custom-div-icon-selected',
    html: `
      <div class="relative flex items-center justify-center scale-125">
        <div class="absolute h-12 w-12 bg-accent/30 rounded-full animate-ping"></div>
        <div class="h-8 w-8 bg-accent rounded-full border-2 border-white shadow-[0_0_20px_rgba(var(--accent),1)] flex items-center justify-center">
          <div class="h-3 w-3 bg-white rounded-full"></div>
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  }), []);

  return (
    <div className="h-full w-full relative">
      <MapContainer 
        key="innovation-hub-world-map-stable"
        center={defaultCenter} 
        zoom={7} 
        className="h-full w-full" 
        zoomControl={false}
        scrollWheelZoom={true}
        style={{ background: '#020617' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {schools.map((school) => {
          if (!school.latitude || !school.longitude) return null;
          
          return (
            <Marker
              key={school.id}
              position={[school.latitude, school.longitude]}
              icon={selectedSchool?.id === school.id ? selectedIcon : customIcon}
              eventHandlers={{
                click: () => onSchoolSelect(school),
              }}
            >
              <Popup className="custom-map-popup">
                <div className="p-2 text-center">
                  <p className="font-headline font-bold text-sm leading-tight mb-1">{school.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{school.city}, {school.country}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapController selectedSchool={selectedSchool} />
      </MapContainer>
    </div>
  );
}
