'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap, Tooltip } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Facility, ClusterResult, Coordinate } from '../lib/types';
import { MAP_CENTER, CATEGORY_COLORS, VILLAGES } from '../lib/constants';
import { School, Stethoscope, Church, Building2, Bus, ShoppingBag, MapPin } from 'lucide-react';

interface GisMapProps {
  facilities?: Facility[];
  clusters?: ClusterResult[];
  showClusters?: boolean;
  selectedVillageId?: string;
  height?: string;
  zoom?: number;
}

// Component to handle map flyTo animations when props change
const MapController: React.FC<{ center: Coordinate, zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], zoom);
  }, [center, zoom, map]);
  return null;
};

// Map categories to Lucide icons
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Pendidikan': return School;
    case 'Kesehatan': return Stethoscope;
    case 'Keagamaan': return Church;
    case 'Pemerintahan': return Building2;
    case 'Transportasi': return Bus;
    case 'Komersial': return ShoppingBag;
    default: return MapPin;
  }
};

const createCustomIcon = (category: string, color: string) => {
  const Icon = getCategoryIcon(category);
  const html = renderToStaticMarkup(
    <div style={{
      backgroundColor: color,
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
    }}>
      <Icon size={18} color="white" />
    </div>
  );
  
  return divIcon({
    html: html,
    className: 'custom-marker-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const GisMap: React.FC<GisMapProps> = ({ 
  facilities = [], 
  clusters = [], 
  showClusters = false, 
  selectedVillageId,
  height = '600px',
  zoom = 13
}) => {
  return (
    <div style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden', zIndex: 0 }}>
      <MapContainer 
        key="gis-map-container"
        center={[MAP_CENTER.lat, MAP_CENTER.lng]} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render Clusters Centroids */}
        {showClusters && clusters.map((cluster) => (
          <CircleMarker
            key={`centroid-${cluster.clusterId}`}
            center={[cluster.centroid.lat, cluster.centroid.lng]}
            radius={24}
            pathOptions={{ 
              color: 'white', 
              fillColor: cluster.color, 
              fillOpacity: 0.6, 
              weight: 3,
              dashArray: '5, 5'
            }}
          >
             <Tooltip permanent direction="center" className="bg-transparent border-0 font-bold text-white shadow-none text-xl">
               <span style={{ textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>{cluster.clusterId}</span>
             </Tooltip>
             <Popup>
               <div className="p-1">
                 <strong className="text-sm">Pusat Klaster {cluster.clusterId}</strong>
                 <p className="text-xs mt-1">Item: {cluster.points.length}</p>
               </div>
             </Popup>
          </CircleMarker>
        ))}

        {/* Render Facilities with Custom Icons */}
        {facilities.map((f) => {
            // Determine color: Cluster color if clustering is active, otherwise Category color
            let color = CATEGORY_COLORS[f.category] || '#64748b';
            
            if (showClusters && clusters.length > 0) {
               const parentCluster = clusters.find(c => c.points.find(p => p.id === f.id));
               if (parentCluster) {
                   color = parentCluster.color;
               }
            }

            const villageName = VILLAGES.find(v => v.id === f.villageId)?.name || 'Tidak Diketahui';

            return (
              <Marker
                key={f.id}
                position={[f.lat, f.lng]}
                icon={createCustomIcon(f.category, color)}
              >
                <Popup>
                  <div className="min-w-[220px]">
                    {f.photoUrl && (
                        <div className="mb-3 w-full h-32 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-sm relative group">
                            <img 
                                src={f.photoUrl} 
                                alt={f.name} 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>
                    )}
                    <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-2 text-sm">{f.name}</h3>
                    <div className="text-xs text-slate-600 space-y-1.5">
                      <div className="grid grid-cols-[80px_1fr] gap-y-1.5">
                          <div className="text-slate-400 font-medium">Kategori</div>
                          <div className="font-medium text-slate-800">{f.category}</div>
                          
                          <div className="text-slate-400 font-medium">Desa</div>
                          <div className="font-medium text-slate-800">{villageName}</div>
                          
                          <div className="text-slate-400 font-medium">Dibangun</div>
                          <div className="font-medium text-slate-800">{f.yearBuilt}</div>
                          
                          <div className="text-slate-400 font-medium">Kondisi</div>
                          <div className="font-medium">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${
                                f.condition === 'Baik' ? 'bg-green-50 text-green-700 border-green-200' : 
                                f.condition === 'Buruk' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              }`}>
                                  {f.condition}
                              </span>
                          </div>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
        })}
        
        <MapController center={MAP_CENTER} zoom={zoom} />
      </MapContainer>
    </div>
  );
};

export default GisMap;
