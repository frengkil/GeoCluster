'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import { FacilitiesProvider } from '../../context/FacilitiesContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and not authenticated, redirect immediately
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-slate-400 text-sm animate-pulse">Verifying Access...</p>
      </div>
    );
  }

  // Strictly do not render children if not authenticated
  if (!isAuthenticated) {
    return null; 
  }

  return (
    <FacilitiesProvider>
      <Sidebar>
        {children}
      </Sidebar>
    </FacilitiesProvider>
  );
}