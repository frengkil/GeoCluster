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
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#eab308', // yellow
  '#a855f7', // purple
  '#ec4899', // pink
  '#f97316', // orange
  '#06b6d4', // cyan
];

export const CATEGORY_COLORS: Record<string, string> = {
  Education: '#3b82f6', // blue
  Health: '#ef4444', // red
  Religious: '#a855f7', // purple
  Government: '#64748b', // slate
  Transport: '#f97316', // orange
  Commercial: '#22c55e', // green
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
      
      const conditions = ['Good', 'Fair', 'Poor'] as const;

      facilities.push({
        id: `f${idCounter++}`,
        name: `${category} Unit ${idCounter} - ${village.name}`,
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