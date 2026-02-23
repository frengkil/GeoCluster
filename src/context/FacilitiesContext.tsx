'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Facility } from '../lib/types';
import { INITIAL_FACILITIES } from '../lib/constants';

interface FacilitiesContextType {
  facilities: Facility[];
  addFacility: (facility: Facility) => void;
  deleteFacility: (id: string) => void;
  updateFacility: (facility: Facility) => void;
}

const FacilitiesContext = createContext<FacilitiesContextType | undefined>(undefined);

export function FacilitiesProvider({ children }: { children?: ReactNode }) {
  const [facilities, setFacilities] = useState<Facility[]>(INITIAL_FACILITIES);

  const addFacility = (facility: Facility) => {
    setFacilities(prev => [...prev, facility]);
  };

  const deleteFacility = (id: string) => {
    setFacilities(prev => prev.filter(f => f.id !== id));
  };

  const updateFacility = (updatedFacility: Facility) => {
    setFacilities(prev => prev.map(f => f.id === updatedFacility.id ? updatedFacility : f));
  };

  return (
    <FacilitiesContext.Provider value={{ facilities, addFacility, deleteFacility, updateFacility }}>
      {children}
    </FacilitiesContext.Provider>
  );
}

export const useFacilities = () => {
  const context = useContext(FacilitiesContext);
  if (context === undefined) {
    throw new Error('useFacilities must be used within a FacilitiesProvider');
  }
  return context;
};