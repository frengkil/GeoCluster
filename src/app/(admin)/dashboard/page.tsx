'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { FacilityCategory } from '../../../lib/types';
import { useFacilities } from '../../../context/FacilitiesContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Building2, AlertTriangle, CheckCircle } from 'lucide-react';

// Dynamically import GisMap to avoid SSR issues with Leaflet
const GisMap = dynamic(() => import('../../../components/GisMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading Map...</div>
});

const StatCard: React.FC<{ title: string; value: string | number; icon: any; color: string }> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>
       <Icon size={24} className={color.replace('bg-', 'text-')} />
    </div>
  </div>
);

export default function DashboardPage() {
  const { facilities } = useFacilities();

  // Compute Stats
  const total = facilities.length;
  const goodCondition = facilities.filter(f => f.condition === 'Good').length;
  const poorCondition = facilities.filter(f => f.condition === 'Poor').length;
  
  // Data for Charts
  const categoryData = Object.values(FacilityCategory).map(cat => ({
    name: cat,
    value: facilities.filter(f => f.category === cat).length
  })).filter(d => d.value > 0);

  const conditionData = [
    { name: 'Good', value: goodCondition, color: '#22c55e' },
    { name: 'Fair', value: facilities.length - goodCondition - poorCondition, color: '#eab308' },
    { name: 'Poor', value: poorCondition, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500">Real-time statistics of infrastructure in Aek Kuasan.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Facilities" value={total} icon={Building2} color="bg-blue-500" />
        <StatCard title="In Good Condition" value={goodCondition} icon={CheckCircle} color="bg-green-500" />
        <StatCard title="Requires Attention" value={poorCondition} icon={AlertTriangle} color="bg-red-500" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map Preview */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[400px] lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-800">Geographic Distribution</h3>
                <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-500">Live Map</span>
            </div>
            <div className="h-[320px]">
                <GisMap facilities={facilities} zoom={12} />
            </div>
        </div>

        {/* Charts */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[350px]">
          <h3 className="font-semibold text-slate-800 mb-4">Facilities by Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ top: 0, right: 0, left: -20, bottom: 20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[350px]">
          <h3 className="font-semibold text-slate-800 mb-4">Condition Status</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={conditionData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {conditionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-sm mt-2">
              {conditionData.map(c => (
                  <div key={c.name} className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                      <span>{c.name}</span>
                  </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}