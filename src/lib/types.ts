
export interface Coordinate {
  lat: number;
  lng: number;
}

export enum FacilityCategory {
  EDUCATION = 'Education',
  HEALTH = 'Health',
  RELIGIOUS = 'Religious',
  GOVERNMENT = 'Government',
  TRANSPORT = 'Transport',
  COMMERCIAL = 'Commercial'
}

export interface Village {
  id: string;
  name: string;
  center: Coordinate;
}

export interface Facility {
  id: string;
  name: string;
  category: FacilityCategory;
  lat: number;
  lng: number;
  villageId: string;
  yearBuilt: number;
  condition: 'Good' | 'Fair' | 'Poor';
  clusterId?: number; // Assigned after K-Means
  photoUrl?: string;
}

export interface ClusterResult {
  clusterId: number;
  centroid: Coordinate;
  color: string;
  points: Facility[];
}

export interface Stats {
  totalFacilities: number;
  byCategory: { name: string; value: number }[];
  byCondition: { name: string; value: number }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'viewer';
  avatar?: string;
}
