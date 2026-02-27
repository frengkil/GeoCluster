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
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Memuat Peta...</div>
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
      'ID Klaster': c.clusterId,
      'Lintang Titik Pusat': c.centroid.lat,
      'Bujur Titik Pusat': c.centroid.lng,
      'Total Fasilitas': c.points.length,
      'Warna': c.color
    }));
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Klaster");

    // 2. Detailed Sheet
    const detailedData: any[] = [];
    clusters.forEach(c => {
      c.points.forEach(p => {
        const villageName = VILLAGES.find(v => v.id === p.villageId)?.name || 'Tidak Diketahui';
        detailedData.push({
          'Nama Fasilitas': p.name,
          'Kategori': p.category,
          'Desa': villageName,
          'ID Klaster': c.clusterId,
          'Lintang': p.lat,
          'Bujur': p.lng,
          'Kondisi': p.condition,
          'Tahun Dibangun': p.yearBuilt
        });
      });
    });
    const wsDetails = XLSX.utils.json_to_sheet(detailedData);
    XLSX.utils.book_append_sheet(wb, wsDetails, "Detail Fasilitas");

    // Save file
    XLSX.writeFile(wb, `Analisis_Klasterisasi_AekKuasan_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6">
      {/* Controls Sidebar */}
      <div className="w-full md:w-80 bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-6 h-fit md:h-full overflow-y-auto">
        <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Settings size={20} className="text-slate-400" />
                Konfigurasi
            </h2>
            <p className="text-sm text-slate-500 mt-1">Sesuaikan parameter K-Means</p>
        </div>

        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Jumlah Klaster (K): <span className="text-blue-600 font-bold">{kValue}</span>
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
                    <><RefreshCw className="animate-spin" size={18} /> Memproses...</>
                ) : (
                    <><Play size={18} /> Jalankan Analisis</>
                )}
            </button>
        </div>

        {showClusters && (
            <div className="flex-1">
                <h3 className="font-semibold text-slate-800 mb-3 border-b pb-2 flex justify-between items-center">
                    <span>Hasil Analisis</span>
                    <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{clusters.length} Klaster</span>
                </h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                    {clusters.map((cluster) => (
                        <div key={cluster.clusterId} className="bg-slate-50 p-3 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors group">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: cluster.color }} />
                                    <span className="font-bold text-slate-700 text-sm">Klaster {cluster.clusterId}</span>
                                </div>
                                <span className="text-xs bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600 font-mono font-medium shadow-sm">
                                    {cluster.points.length} Item
                                </span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono bg-white/50 p-1.5 rounded border border-slate-100 flex justify-between items-center">
                                <span>Titik Pusat:</span>
                                <span className="text-slate-700">{cluster.centroid.lat.toFixed(4)}, {cluster.centroid.lng.toFixed(4)}</span>
                            </div>
                        </div>
                    ))}
                </div>
                
                <button 
                    onClick={handleExportExcel}
                    className="w-full mt-6 flex items-center justify-center gap-2 border border-slate-300 text-slate-700 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                >
                    <Download size={16} /> Ekspor Laporan
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
        

      </div>
    </div>
  );
}