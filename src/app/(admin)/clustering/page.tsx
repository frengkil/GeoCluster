'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import * as XLSX from 'xlsx';
import { ClusterResult } from '../../../lib/types';
import { runKMeans } from '../../../lib/kmeans';
import { VILLAGES } from '../../../lib/constants';
import { useFacilities } from '../../../context/FacilitiesContext';
import { Play, Download, Settings, RefreshCw } from 'lucide-react';

// Dynamically import GisMap to avoid SSR issues
const GisMap = dynamic(() => import('../../../components/GisMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading Map...</div>
});

export default function ClusteringPage() {
  const { facilities } = useFacilities();
  const [kValue, setKValue] = useState<number>(3);
  const [clusters, setClusters] = useState<ClusterResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showClusters, setShowClusters] = useState(false);

  const handleRunAnalysis = () => {
    setIsCalculating(true);
    setShowClusters(false);
    
    // Simulate computation delay
    setTimeout(() => {
        const results = runKMeans(facilities, kValue);
        setClusters(results);
        setShowClusters(true);
        setIsCalculating(false);
    }, 800);
  };

  const handleExportExcel = () => {
    if (!clusters.length) return;

    const wb = XLSX.utils.book_new();

    // 1. Summary Sheet
    const summaryData = clusters.map(c => ({
      'Cluster ID': c.clusterId,
      'Centroid Latitude': c.centroid.lat,
      'Centroid Longitude': c.centroid.lng,
      'Total Facilities': c.points.length,
      'Color': c.color
    }));
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Cluster Summary");

    // 2. Detailed Sheet
    const detailedData: any[] = [];
    clusters.forEach(c => {
      c.points.forEach(p => {
        const villageName = VILLAGES.find(v => v.id === p.villageId)?.name || 'Unknown';
        detailedData.push({
          'Facility Name': p.name,
          'Category': p.category,
          'Village': villageName,
          'Cluster ID': c.clusterId,
          'Latitude': p.lat,
          'Longitude': p.lng,
          'Condition': p.condition,
          'Year Built': p.yearBuilt
        });
      });
    });
    const wsDetails = XLSX.utils.json_to_sheet(detailedData);
    XLSX.utils.book_append_sheet(wb, wsDetails, "Facility Details");

    // Save file
    XLSX.writeFile(wb, `AekKuasan_Clustering_Analysis_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6">
      {/* Controls Sidebar */}
      <div className="w-full md:w-80 bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-6 h-fit md:h-full overflow-y-auto">
        <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Settings size={20} className="text-slate-400" />
                Configuration
            </h2>
            <p className="text-sm text-slate-500 mt-1">Adjust K-Means parameters</p>
        </div>

        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Number of Clusters (K): <span className="text-blue-600 font-bold">{kValue}</span>
                </label>
                <input 
                    type="range" 
                    min="2" 
                    max="8" 
                    step="1"
                    value={kValue}
                    onChange={(e) => setKValue(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>2</span>
                    <span>8</span>
                </div>
            </div>

            <button 
                onClick={handleRunAnalysis}
                disabled={isCalculating}
                className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${
                    isCalculating 
                    ? 'bg-slate-100 text-slate-400 cursor-wait' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                }`}
            >
                {isCalculating ? (
                    <><RefreshCw className="animate-spin" size={18} /> Processing...</>
                ) : (
                    <><Play size={18} /> Run Analysis</>
                )}
            </button>
        </div>

        {showClusters && (
            <div className="flex-1">
                <h3 className="font-semibold text-slate-800 mb-3 border-b pb-2">Analysis Results</h3>
                <div className="space-y-3">
                    {clusters.map((cluster) => (
                        <div key={cluster.clusterId} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cluster.color }} />
                                    <span className="font-medium text-slate-700">Cluster {cluster.clusterId}</span>
                                </div>
                                <span className="text-xs bg-white px-2 py-1 rounded border text-slate-600 font-mono">
                                    {cluster.points.length} Items
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                
                <button 
                    onClick={handleExportExcel}
                    className="w-full mt-6 flex items-center justify-center gap-2 border border-slate-300 text-slate-700 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                >
                    <Download size={16} /> Export Report
                </button>
            </div>
        )}
      </div>

      {/* Map View */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
        <GisMap 
            facilities={facilities} 
            clusters={clusters} 
            showClusters={showClusters} 
            height="100%" 
        />
        
        {/* Legend Overlay */}
        <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur p-4 rounded-lg shadow-lg border border-slate-200 z-[400] max-w-xs">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Legend</h4>
            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border-2 border-white ring-1 ring-blue-500 bg-blue-500"></span>
                    <span>Facility Point</span>
                </div>
                {showClusters && (
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-white ring-1 ring-slate-400 bg-slate-400 opacity-50"></span>
                        <span>Cluster Area (Centroid)</span>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}