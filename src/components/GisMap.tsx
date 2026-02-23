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
    case 'Education': return School;
    case 'Health': return Stethoscope;
    case 'Religious': return Church;
    case 'Government': return Building2;
    case 'Transport': return Bus;
    case 'Commercial': return ShoppingBag;
    default: return MapPin;
  }
};

// Create a custom Leaflet DivIcon with the Lucide SVG embedded
const createCustomIcon = (category: string, color: string) => {
  const IconComponent = getCategoryIcon(category);
  
  const iconMarkup = renderToStaticMarkup(
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      backgroundColor: 'white',
      borderRadius: '50%',
      border: `2px solid ${color}`,
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      transition: 'all 0.3s ease'
    }}>
      <IconComponent size={16} color={color} fill={color} fillOpacity={0.15} />
    </div>
  );

  return divIcon({
    html: iconMarkup,
    className: 'custom-div-icon', // Use a custom class if needed, or leave empty to avoid defaults
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

const GisMap: React.FC<GisMapProps> = ({ 
  facilities = [], 
  clusters = [], 
  showClusters = false,
  height = '100%' 
}) => {

  return (
    <div className="rounded-xl overflow-hidden shadow-inner border border-slate-200" style={{ height }}>
      <MapContainer
        center={[MAP_CENTER.lat, MAP_CENTER.lng]}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render Clusters Centroids (keep as abstract circles) */}
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
               {cluster.clusterId}
             </Tooltip>
             <Popup>
               <div className="p-1">
                 <strong className="text-sm">Cluster {cluster.clusterId} Center</strong>
                 <p className="text-xs mt-1">Items: {cluster.points.length}</p>
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

            const villageName = VILLAGES.find(v => v.id === f.villageId)?.name || 'Unknown';

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
                          <div className="text-slate-400 font-medium">Category</div>
                          <div className="font-medium text-slate-800">{f.category}</div>
                          
                          <div className="text-slate-400 font-medium">Village</div>
                          <div className="font-medium text-slate-800">{villageName}</div>
                          
                          <div className="text-slate-400 font-medium">Built</div>
                          <div className="font-medium text-slate-800">{f.yearBuilt}</div>
                          
                          <div className="text-slate-400 font-medium">Condition</div>
                          <div className="font-medium">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${
                                f.condition === 'Good' ? 'bg-green-50 text-green-700 border-green-200' : 
                                f.condition === 'Poor' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
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
        
        <MapController center={MAP_CENTER} zoom={13} />
      </MapContainer>
    </div>
  );
};

export default GisMap;