'use client';

import React, { useState } from 'react';
import { LayoutDashboard, Database, Home, Menu, X, PieChart, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ to, icon: Icon, label, active }: { to: string; icon: any; label: string; active: boolean }) => (
  <Link
    href={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active
        ? 'bg-blue-600 text-white shadow-md'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

export default function Sidebar({ children }: { children?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const UserAvatar = ({ size = "md" }: { size?: "sm" | "md" }) => {
    const sizeClasses = size === "sm" ? "w-8 h-8 text-sm" : "w-10 h-10 text-base";
    
    if (user?.avatar) {
        return <img src={user.avatar} alt={user.name} className={`${sizeClasses} rounded-full object-cover border border-slate-200 bg-slate-100`} />;
    }
    
    return (
        <div className={`${sizeClasses} rounded-full bg-blue-500 flex items-center justify-center text-white font-bold`}>
            {user?.name?.charAt(0) || 'U'}
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-white shadow-xl z-20">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            GeoCluster
          </h1>
          <p className="text-xs text-slate-400 mt-1">Analisis Aek Kuasan</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavItem to="/" icon={Home} label="Beranda" active={pathname === '/'} />
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={pathname === '/dashboard'} />
          <NavItem to="/clustering" icon={PieChart} label="Analisis K-Means" active={pathname === '/clustering'} />
          <NavItem to="/data" icon={Database} label="Data Fasilitas" active={pathname === '/data'} />
        </nav>
        <div className="p-4 border-t border-slate-700">
          <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-400 flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <div className="shrink-0">
                    <UserAvatar size="sm" />
                </div>
                <div className="overflow-hidden">
                    <p className="text-white font-medium truncate">{user?.name}</p>
                    <p className="truncate text-[10px]">{user?.email}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
                <Link href="/profile" className="text-center py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 transition-colors">
                    Profil
                </Link>
                <button onClick={logout} className="text-center py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded transition-colors">
                    Keluar
                </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={toggleSidebar} />
      )}
      
      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out z-40 md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex justify-between items-center border-b border-slate-700">
          <span className="font-bold text-xl">GeoCluster</span>
          <button onClick={toggleSidebar} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <NavItem to="/" icon={Home} label="Beranda" active={pathname === '/'} />
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={pathname === '/dashboard'} />
          <NavItem to="/clustering" icon={PieChart} label="Analisis K-Means" active={pathname === '/clustering'} />
          <NavItem to="/data" icon={Database} label="Data Fasilitas" active={pathname === '/data'} />
          <NavItem to="/profile" icon={User} label="Profil" active={pathname === '/profile'} />
        </nav>
        <div className="p-4 border-t border-slate-700">
             <div className="flex items-center gap-3 px-2 mb-4">
                 <UserAvatar size="sm" />
                 <div className="overflow-hidden">
                    <p className="text-white font-medium truncate text-sm">{user?.name}</p>
                 </div>
             </div>
             <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-red-400 w-full hover:bg-slate-800 rounded-lg">
                <LogOut size={20} /> Keluar
             </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b h-16 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="md:hidden text-slate-600">
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-slate-800">
              {(() => {
                if (pathname === '/') return 'Selamat Datang';
                if (pathname.includes('/dashboard')) return 'Dashboard';
                if (pathname.includes('/clustering')) return 'Analisis Klaster';
                if (pathname.includes('/data')) return 'Data Fasilitas';
                if (pathname.includes('/profile')) return 'Profil Pengguna';
                return 'Halaman';
              })()}
            </h2>
          </div>
          <div className="flex items-center gap-3 relative">
             <div 
                className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
             >
                <UserAvatar size="sm" />
                <span className="text-sm font-medium text-slate-600 hidden sm:block">{user?.name}</span>
             </div>
             
             {/* Header Dropdown */}
             {userMenuOpen && (
                 <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute top-12 right-0 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-4 py-2 border-b border-slate-50">
                            <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                        <Link href="/profile" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600">
                            Pengaturan Akun
                        </Link>
                        <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                            Keluar
                        </button>
                    </div>
                 </>
             )}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 bg-slate-50 relative">
          {children}
        </main>
      </div>
    </div>
  );
}