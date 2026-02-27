'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="text-blue-600" size={28} />
          <span className="text-xl font-bold text-slate-900 tracking-tight">GeoCluster <span className="text-blue-600 font-light">Aek Kuasan</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link href="/dashboard" className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-full text-sm font-medium transition-colors">
              <User size={16} />
              <span>Dashboard ({user?.name})</span>
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors">
                Masuk
              </Link>
              <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors shadow-lg shadow-blue-600/20">
                Mulai Sekarang
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
