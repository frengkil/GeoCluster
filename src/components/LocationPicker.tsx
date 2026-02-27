'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, LayersControl, LayerGroup, CircleMarker, Tooltip } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapPin } from 'lucide-react';
import { Facility, Village } from '../lib/types';
import { VILLAGES } from '../lib/constants';

// Helper to center map when coordinates change significantly
const MapRecenter = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 14);
  }, [lat, lng, map]);
  return null;
};

// Draggable Marker Component
const DraggableMarker = ({ 
  lat, 
  lng, 
  onChange,
  facilityName,
  villageName,
  facilityPhoto
}: { 
  lat: number; 
  lng: number; 
  onChange: (lat: number, lng: number) => void;
  facilityName: string;
  villageName: string;
  facilityPhoto?: string;
}) => {
  const markerRef = useRef<any>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          onChange(lat, lng);
        }
      },
    }),
    [onChange],
  );

  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  const customIcon = useMemo(() => {
     const iconMarkup = renderToStaticMarkup(
        <div style={{ transform: 'translate(-50%, -100%)' }}>
           <MapPin size={40} className="text-blue-600 drop-shadow-lg" fill="currentColor" />
        </div>
     );
     return divIcon({
        html: iconMarkup,
        className: '', 
        iconSize: [0, 0], // Handled by SVG
     });
  }, []);

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={[lat, lng]}
      ref={markerRef}
      icon={customIcon}
    >
      <Popup>
        <div className="p-1 w-[200px] text-center">
            {facilityPhoto && (
                <div className="mb-3 w-full h-32 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-sm relative">
                    <img 
                        src={facilityPhoto} 
                        alt={facilityName} 
                        className="w-full h-full object-cover" 
                    />
                </div>
            )}
            <h4 className="font-bold text-slate-800 text-sm mb-1">{facilityName || "Fasilitas Baru"}</h4>
            <p className="text-xs text-slate-600">Desa: <span className="font-semibold">{villageName}</span></p>
            <p className="text-[10px] text-slate-400 mt-1">({lat.toFixed(5)}, {lng.toFixed(5)})</p>
        </div>
      </Popup>
    </Marker>
  );
};

interface LocationPickerProps {
    lat: number;
    lng: number;
    onChange: (lat: number, lng: number) => void;
    facilities: Facility[];
    editingId: string | null;
    formData: {
        name: string;
        villageId: string;
        photo: string;
    };
}

const getVillageName = (id: string) => VILLAGES.find(v => v.id === id)?.name || 'Tidak Diketahui';

export default function LocationPicker({ lat, lng, onChange, facilities, editingId, formData }: LocationPickerProps) {
    return (
        <MapContainer 
            key="location-picker-map"
            center={[lat, lng]} 
            zoom={14} 
            style={{ height: '100%', width: '100%' }}
        >
            <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="OpenStreetMap">
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                </LayersControl.BaseLayer>

                <LayersControl.Overlay checked name="Fasilitas Lain">
                    <LayerGroup>
                        {facilities.filter(f => f.id !== editingId).map(f => (
                            <CircleMarker 
                                key={f.id} 
                                center={[f.lat, f.lng]} 
                                radius={4} 
                                pathOptions={{ color: '#64748b', fillColor: '#64748b', fillOpacity: 0.5, stroke: false }}
                            >
                                <Popup>
                                    <div className="text-xs">
                                        <strong>{f.name}</strong><br/>
                                        {f.category}
                                    </div>
                                </Popup>
                            </CircleMarker>
                        ))}
                    </LayerGroup>
                </LayersControl.Overlay>

                <LayersControl.Overlay name="Pusat Desa">
                    <LayerGroup>
                        {VILLAGES.map(v => (
                            <CircleMarker 
                                key={v.id} 
                                center={[v.center.lat, v.center.lng]} 
                                radius={8}
                                pathOptions={{ color: '#3b82f6', fillColor: 'transparent', weight: 2, dashArray: '4,4' }}
                            >
                                <Tooltip direction="center" permanent className="bg-transparent border-0 text-blue-600 font-bold text-xs shadow-none">
                                    {v.name}
                                </Tooltip>
                            </CircleMarker>
                        ))}
                    </LayerGroup>
                </LayersControl.Overlay>
            </LayersControl>

            <MapRecenter lat={lat} lng={lng} />
            <DraggableMarker 
                lat={lat} 
                lng={lng} 
                onChange={onChange} 
                facilityName={formData.name}
                villageName={getVillageName(formData.villageId)}
                facilityPhoto={formData.photo}
            />
        </MapContainer>
    );
}
