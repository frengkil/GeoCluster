'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Facility, FacilityCategory } from '../../../lib/types';
import { VILLAGES } from '../../../lib/constants';
import { useFacilities } from '../../../context/FacilitiesContext';
import { Search, Plus, Trash2, Edit2, Filter, MapPin, Image as ImageIcon, X } from 'lucide-react';

// Lazy load LocationPicker to avoid SSR issues with Leaflet
const LocationPicker = dynamic(() => import('../../../components/LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400">Loading Map...</div>
});

export default function FacilitiesPage() {
  const { facilities, addFacility, deleteFacility, updateFacility } = useFacilities();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVillage, setFilterVillage] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: Object.values(FacilityCategory)[0] as string,
    villageId: VILLAGES[0].id,
    year: new Date().getFullYear(),
    condition: 'Good' as string,
    lat: VILLAGES[0].center.lat,
    lng: VILLAGES[0].center.lng,
    photo: ''
  });

  // Filter Logic
  const filteredFacilities = facilities.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVillage = filterVillage === 'all' || f.villageId === filterVillage;
    return matchesSearch && matchesVillage;
  });

  const getVillageName = (id: string) => VILLAGES.find(v => v.id === id)?.name || 'Unknown';
  
  const getFacilityCount = (villageId: string) => facilities.filter(f => f.villageId === villageId).length;

  // Handle opening modal for adding new facility
  const openAddModal = () => {
    setEditingId(null);
    setFormData({
        name: '',
        category: Object.values(FacilityCategory)[0],
        villageId: VILLAGES[0].id,
        year: new Date().getFullYear(),
        condition: 'Good',
        lat: VILLAGES[0].center.lat,
        lng: VILLAGES[0].center.lng,
        photo: ''
    });
    setIsModalOpen(true);
  };

  // Handle opening modal for editing existing facility
  const handleEditClick = (facility: Facility) => {
    setEditingId(facility.id);
    setFormData({
        name: facility.name,
        category: facility.category,
        villageId: facility.villageId,
        year: facility.yearBuilt,
        condition: facility.condition,
        lat: facility.lat,
        lng: facility.lng,
        photo: facility.photoUrl || ''
    });
    setIsModalOpen(true);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        alert("File size exceeds 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle coordinate changes from map
  const handleMapLocationChange = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, lat, lng }));
  };

  // Handle village change specifically to update coordinates defaults
  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVillageId = e.target.value;
    const village = VILLAGES.find(v => v.id === newVillageId);
    
    setFormData(prev => ({
        ...prev,
        villageId: newVillageId,
        // Only auto-update coordinates if we are adding a new facility (not editing),
        // or if the user hasn't manually moved the marker far from the previous village center.
        lat: village ? village.center.lat : prev.lat,
        lng: village ? village.center.lng : prev.lng
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const facilityData: Facility = {
        id: editingId || `new_${Date.now()}`,
        name: formData.name,
        category: formData.category as FacilityCategory,
        condition: formData.condition as 'Good' | 'Fair' | 'Poor',
        yearBuilt: Number(formData.year),
        villageId: formData.villageId,
        lat: Number(formData.lat),
        lng: Number(formData.lng),
        photoUrl: formData.photo
    };

    if (editingId) {
        updateFacility(facilityData);
    } else {
        addFacility(facilityData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Facility Management</h1>
            <p className="text-slate-500">Manage database of infrastructure in Aek Kuasan.</p>
        </div>
        <button 
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
            <Plus size={18} /> Add Facility
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
                type="text" 
                placeholder="Search facility name..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="w-full md:w-64 relative">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <select 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                value={filterVillage}
                onChange={(e) => setFilterVillage(e.target.value)}
             >
                 <option value="all">All Villages ({facilities.length})</option>
                 {VILLAGES.map(v => (
                    <option key={v.id} value={v.id}>
                        {v.name} ({getFacilityCount(v.id)})
                    </option>
                 ))}
             </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                        <th className="p-4 pl-6">Photo</th>
                        <th className="p-4">Facility Name</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Location (Village)</th>
                        <th className="p-4">Condition</th>
                        <th className="p-4">Year</th>
                        <th className="p-4 text-right pr-6">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredFacilities.length > 0 ? filteredFacilities.map((facility) => (
                        <tr key={facility.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 pl-6">
                                {facility.photoUrl ? (
                                    <img 
                                        src={facility.photoUrl} 
                                        alt={facility.name} 
                                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-sm"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                        <ImageIcon size={20} />
                                    </div>
                                )}
                            </td>
                            <td className="p-4 font-medium text-slate-800">{facility.name}</td>
                            <td className="p-4">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                    {facility.category}
                                </span>
                            </td>
                            <td className="p-4 text-slate-600 flex items-center gap-1">
                                <MapPin size={14} className="text-slate-400" />
                                {getVillageName(facility.villageId)}
                            </td>
                            <td className="p-4">
                                <span className={`inline-flex items-center gap-1.5 ${
                                    facility.condition === 'Good' ? 'text-green-600' : 
                                    facility.condition === 'Poor' ? 'text-red-600' : 'text-yellow-600'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                        facility.condition === 'Good' ? 'bg-green-600' : 
                                        facility.condition === 'Poor' ? 'bg-red-600' : 'bg-yellow-600'
                                    }`}></span>
                                    {facility.condition}
                                </span>
                            </td>
                            <td className="p-4 text-slate-600">{facility.yearBuilt}</td>
                            <td className="p-4 text-right pr-6 space-x-2">
                                <button 
                                    onClick={() => handleEditClick(facility)}
                                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                                    title="Edit Facility"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button 
                                    onClick={() => deleteFacility(facility.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
                                    title="Delete Facility"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-500">
                                No facilities found matching your criteria.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex justify-between items-center">
            <span>Showing {filteredFacilities.length} of {facilities.length} entries</span>
            <div className="flex gap-1">
                <button className="px-3 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50" disabled>Prev</button>
                <button className="px-3 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50">Next</button>
            </div>
        </div>
      </div>

      {/* Modal (Shared for Add and Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-lg font-bold text-slate-800">
                        {editingId ? 'Edit Facility' : 'New Facility'}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)}><span className="text-2xl text-slate-400">&times;</span></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    {/* Photo Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Facility Photo</label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-lg bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative shrink-0 group">
                                {formData.photo ? (
                                    <>
                                        <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                                        <button 
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, photo: '' }))}
                                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                            title="Remove photo"
                                        >
                                            <X size={20} />
                                        </button>
                                    </>
                                ) : (
                                    <ImageIcon className="text-slate-400" />
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="block w-full">
                                    <span className="sr-only">Choose profile photo</span>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-slate-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100 cursor-pointer"
                                    />
                                </label>
                                <p className="text-xs text-slate-400 mt-1">Supported formats: JPG, PNG. Max size: 5MB</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                        <input 
                            name="name" 
                            required 
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="e.g., SD Negeri 1" 
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <select 
                            name="category" 
                            className="w-full border rounded-lg px-3 py-2"
                            value={formData.category}
                            onChange={handleInputChange}
                        >
                            {Object.values(FacilityCategory).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Village</label>
                        <select 
                            name="villageId" 
                            className="w-full border rounded-lg px-3 py-2"
                            value={formData.villageId}
                            onChange={handleVillageChange}
                        >
                            {VILLAGES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                    </div>

                    {/* Map Picker */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Location (Drag marker to adjust)</label>
                        <div className="h-48 w-full rounded-lg overflow-hidden border border-slate-300 relative z-0">
                            {isModalOpen && (
                                <LocationPicker 
                                    lat={Number(formData.lat)} 
                                    lng={Number(formData.lng)} 
                                    onChange={handleMapLocationChange} 
                                    facilities={facilities}
                                    editingId={editingId}
                                    formData={{
                                        name: formData.name,
                                        villageId: formData.villageId,
                                        photo: formData.photo
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                            <input 
                                name="lat" 
                                type="number" 
                                step="any"
                                required
                                className="w-full border rounded-lg px-3 py-2 bg-slate-50 font-mono text-sm" 
                                value={formData.lat}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                            <input 
                                name="lng" 
                                type="number" 
                                step="any"
                                required
                                className="w-full border rounded-lg px-3 py-2 bg-slate-50 font-mono text-sm" 
                                value={formData.lng}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Year Built</label>
                             <input 
                                name="year" 
                                type="number" 
                                className="w-full border rounded-lg px-3 py-2"
                                value={formData.year}
                                onChange={handleInputChange}
                             />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Condition</label>
                             <select 
                                name="condition" 
                                className="w-full border rounded-lg px-3 py-2"
                                value={formData.condition}
                                onChange={handleInputChange}
                             >
                                <option value="Good">Good</option>
                                <option value="Fair">Fair</option>
                                <option value="Poor">Poor</option>
                             </select>
                        </div>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            {editingId ? 'Update Record' : 'Save Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}