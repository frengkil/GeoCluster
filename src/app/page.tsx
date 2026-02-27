import Link from 'next/link';
import { Map, BarChart3, ShieldCheck, ArrowRight, Layers } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50 to-transparent -z-10" />
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Sistem Analisis GIS v1.0
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight">
              Perencanaan Infrastruktur Cerdas untuk <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Aek Kuasan</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
              Manfaatkan kekuatan klasterisasi K-Means dan analisis spasial untuk mengoptimalkan distribusi fasilitas di seluruh distrik. Visualisasikan, analisis, dan laporkan dengan presisi.
            </p>
            <div className="flex gap-4 pt-4">
              <Link href="/dashboard" className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl hover:bg-slate-800 transition-all hover:scale-105 shadow-lg shadow-slate-200">
                Buka Dashboard <ArrowRight size={18} />
              </Link>
              <button className="px-8 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 transition-colors text-slate-700 font-medium">
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>
          <div className="relative">
             <div className="relative bg-white p-2 rounded-2xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700">
                <img 
                    src="https://picsum.photos/800/600" 
                    alt="Map Preview" 
                    className="rounded-xl w-full h-[400px] object-cover filter brightness-90 contrast-125"
                />
                <div className="absolute inset-0 bg-blue-900/10 rounded-xl pointer-events-none"></div>
                {/* Floating Stats Card Mockup */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 animate-bounce" style={{ animationDuration: '3s' }}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg text-green-600"><BarChart3 size={20} /></div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Total Fasilitas</p>
                            <p className="text-xl font-bold text-slate-900">124 Unit</p>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Analisis Spasial yang Kuat</h2>
            <p className="text-slate-600">Dibangun dengan teknologi web modern untuk mendukung pengambilan keputusan dalam pengembangan daerah.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Map, title: "Pemetaan Interaktif", desc: "Visualisasi detail desa dan fasilitas menggunakan peta vektor canggih." },
              { icon: Layers, title: "Klasterisasi K-Means", desc: "Algoritma pembelajaran mesin untuk mengelompokkan fasilitas dan mengidentifikasi kesenjangan cakupan." },
              { icon: ShieldCheck, title: "Integritas Data", desc: "Manajemen data yang kuat untuk melacak kondisi dan riwayat fasilitas." }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <Layers className="text-white" size={24} />
                <span className="text-white font-bold text-lg">GeoCluster</span>
              </div>
              <p className="text-sm">© 2024 Analisis Infrastruktur Aek Kuasan. Hak cipta dilindungi.</p>
          </div>
      </footer>
    </div>
  );
}