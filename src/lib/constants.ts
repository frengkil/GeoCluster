import { Facility, FacilityCategory, Village } from './types';

// Approximate center of Aek Kuasan, Asahan, North Sumatra
export const MAP_CENTER = { lat: 2.6833, lng: 99.6167 }; 

export const VILLAGES: Village[] = [
  { id: 'v1', name: 'Aek Loba', center: { lat: 2.6500, lng: 99.6000 } },
  { id: 'v2', name: 'Aek Loba Afdeling I', center: { lat: 2.6600, lng: 99.6200 } },
  { id: 'v3', name: 'Sengon Sari', center: { lat: 2.6900, lng: 99.6300 } },
  { id: 'v4', name: 'Alang Bonbon', center: { lat: 2.7000, lng: 99.5900 } },
  { id: 'v5', name: 'Lob Jiur', center: { lat: 2.6700, lng: 99.6500 } },
];

export const CLUSTER_COLORS = [
  '#2563eb', // Blue 600 - Primary
  '#ea580c', // Orange 600 - Distinct from Blue
  '#16a34a', // Green 600 - Distinct from Red/Orange
  '#9333ea', // Purple 600 - Distinct
  '#dc2626', // Red 600 - High alert
  '#0891b2', // Cyan 600 - Distinct from Blue/Green
  '#db2777', // Pink 600 - Distinct from Red/Purple
  '#ca8a04', // Yellow 600 - Distinct
  '#4f46e5', // Indigo 600 - Deep Blue/Purple
  '#059669', // Emerald 600 - Deep Green
];

export const CATEGORY_COLORS: Record<string, string> = {
  Pendidikan: '#3b82f6', // blue
  Kesehatan: '#ef4444', // red
  Keagamaan: '#a855f7', // purple
  Pemerintahan: '#64748b', // slate
  Transportasi: '#f97316', // orange
  Komersial: '#22c55e', // green
};

// Helper to generate random facilities around villages
const generateMockFacilities = (): Facility[] => {
  const facilities: Facility[] = [];
  let idCounter = 1;

  VILLAGES.forEach((village) => {
    // Generate 5-10 facilities per village
    const count = Math.floor(Math.random() * 5) + 5;
    
    for (let i = 0; i < count; i++) {
      // Random offset from village center
      const latOffset = (Math.random() - 0.5) * 0.03;
      const lngOffset = (Math.random() - 0.5) * 0.03;
      
      const categoryKeys = Object.values(FacilityCategory);
      const category = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
      
      const conditions = ['Baik', 'Cukup', 'Buruk'] as const;

      facilities.push({
        id: `f${idCounter++}`,
        name: `Unit ${category} ${idCounter} - ${village.name}`,
        category: category,
        lat: village.center.lat + latOffset,
        lng: village.center.lng + lngOffset,
        villageId: village.id,
        yearBuilt: 2000 + Math.floor(Math.random() * 24),
        condition: conditions[Math.floor(Math.random() * conditions.length)],
      });
    }
  });

  return facilities;
};

export const INITIAL_FACILITIES = generateMockFacilities();