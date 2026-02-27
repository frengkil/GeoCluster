'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Layers, Lock, Mail, ArrowRight, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const success = await login(email, password);
    
    if (success) {
      // The useEffect above or this line will handle the redirect. 
      // explicitly replacing here ensures immediate feedback.
      router.replace('/dashboard');
    } else {
      setError('Email atau kata sandi salah');
      setIsSubmitting(false);
    }
  };

  // If loading or already authenticated (and waiting for redirect), show minimal state or nothing
  if (isLoading || isAuthenticated) {
     return null; 
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side - Visual (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative flex-col justify-between overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-blue-600/10 z-10" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity" />
        
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-10" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-10" />

        <div className="relative z-20 p-12">
            <div className="flex items-center gap-2 mb-8">
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <Layers className="text-blue-400" size={24} />
                </div>
                <span className="text-white font-bold text-xl tracking-tight">GeoCluster</span>
            </div>
            
            <div className="space-y-6 max-w-lg mt-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                    Kecerdasan Spasial untuk <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Infrastruktur</span>
                </h1>
                <p className="text-slate-400 text-lg leading-relaxed">
                    Akses platform GIS Aek Kuasan untuk memvisualisasikan distribusi fasilitas, menjalankan analisis klasterisasi K-Means, dan menghasilkan wawasan berbasis data.
                </p>
            </div>
        </div>

        <div className="relative z-20 p-12 text-xs text-slate-500 flex justify-between">
             <p>© 2024 GeoCluster System</p>
             <p>v1.0.0 Stable</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center gap-2 mb-8">
                <Layers className="text-blue-600" size={32} />
                <span className="text-2xl font-bold text-slate-900">GeoCluster <span className="text-blue-600 font-light">App</span></span>
            </div>

            <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-slate-900">Selamat Datang Kembali</h2>
                <p className="text-slate-500 mt-2">Silakan masukkan kredensial Anda untuk mengakses dashboard.</p>
            </div>

            {/* Demo Credentials Hint */}
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                <Info className="text-blue-600 shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Akses Demo:</p>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-1 font-mono text-xs opacity-80">
                        <span>User: admin@geocluster.com</span>
                        <span>Pass: admin123</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-sm text-red-600 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">Alamat Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input 
                            type="email" 
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-slate-700">Kata Sandi</label>
                        <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-700">Lupa kata sandi?</a>
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input 
                            type="password" 
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {isSubmitting ? 'Mengautentikasi...' : (
                            <>Masuk <ArrowRight size={18} /></>
                        )}
                    </button>
                </div>
            </form>

            <div className="text-center pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                    Belum punya akun? <Link href="/signup" className="text-blue-600 font-medium hover:underline">Buat Akun</Link>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}