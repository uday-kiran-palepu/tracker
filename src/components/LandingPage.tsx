import React, { useState, useEffect } from 'react';
import { 
  Building2, ArrowRight, ShieldCheck, MapPin, Sparkles, 
  Activity, Layers, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { Project } from '../types';

interface LandingPageProps {
  appName: string;
  projects: Project[];
  isConnected: boolean;
  onEnterDashboard: () => void;
  onOpenLogin: () => void;
  onOpenMap: () => void;
}

const SLIDESHOW_IMAGES = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&auto=format&fit=crop&q=80', // Modern workspace / lab
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&auto=format&fit=crop&q=80', // University campus exterior
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&auto=format&fit=crop&q=80', // Students & lab collaboration
  'https://images.unsplash.com/photo-1562774053-701939374585?w=1920&auto=format&fit=crop&q=80', // Academic hall / modern building
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1920&auto=format&fit=crop&q=80', // Sleek boardroom & auditorium
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&auto=format&fit=crop&q=80', // Contemporary learning lab
  'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=1920&auto=format&fit=crop&q=80'  // Tech lab workspace
];

export const LandingPage: React.FC<LandingPageProps> = ({
  appName,
  projects,
  isConnected,
  onEnterDashboard,
  onOpenLogin,
  onOpenMap
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 1-second (1000ms) interval dynamic background slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDESHOW_IMAGES.length);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalArea = projects.reduce((acc, curr) => acc + (Number(curr.areaSft) || 0), 0);
  const citiesCount = new Set(projects.map(p => p.city).filter(Boolean)).size || 5;

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Dynamic Background Slideshow with 1-Second Smooth Crossfade */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {SLIDESHOW_IMAGES.map((imgUrl, index) => (
          <div
            key={imgUrl}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-105 transition-transform duration-[1200ms]' : 'opacity-0 scale-100'
            }`}
            style={{ backgroundImage: `url(${imgUrl})` }}
          />
        ))}

        {/* Cinematic Multi-layered Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-950/50 to-slate-950" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-slate-950/30">
        {/* Left Logo: KHK / Pen Group */}
        <div className="flex items-center gap-3">
          <img
            src="https://raw.githubusercontent.com/uday-kiran-palepu/Website-Images/refs/heads/main/Pen-group-%20photos/KHK.jpeg"
            alt="Pen Group"
            className="h-10 sm:h-12 w-auto max-w-[180px] sm:max-w-[260px] object-contain rounded bg-white/10 backdrop-blur-md p-1 shadow-md border border-white/10"
          />
        </div>

        {/* Center/Status Badge: Live vs Offline */}
        <div className="hidden md:flex items-center gap-2">
          {isConnected ? (
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-slate-800/80 text-slate-400 border border-slate-700 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span>Offline</span>
            </span>
          )}
        </div>

        {/* Right Logo: NxtWave in subtle light backdrop pill */}
        <div className="flex items-center gap-3">
          <div className="bg-white/90 backdrop-blur-md px-3 sm:px-4 py-1.5 rounded-xl shadow-md border border-white/40 flex items-center justify-center">
            <img
              src="https://imgs.search.brave.com/eDbJ6hzoYURa_bEw0nnJ6WkHAJ-EwrK2qVzU9p0jmus/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/cHJvZC53ZWJzaXRl/LWZpbGVzLmNvbS81/ZmE2MWNiYmYwZDQz/MmIzMjMwZjYyYjEv/NjY4YjYzYWIxZjI5/ZDBkZmQ1YTU3NTI1/X254dHdhdmUtbG9n/by5zdmc"
              alt="NxtWave"
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </div>
        </div>
      </header>

      {/* Center Hero Overlay */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-12 max-w-5xl mx-auto">
        {/* Top Tagline Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-md mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Real-Time Campus Lab Infrastructure & Execution Portal</span>
        </div>

        {/* Dynamic App Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white drop-shadow-xl leading-tight">
          {appName || 'Uni Tracker'}
        </h1>

        <p className="mt-4 text-lg sm:text-xl font-medium text-blue-200 max-w-3xl drop-shadow leading-relaxed">
          Empowering Next-Gen University Labs & Campuses Across India
        </p>

        <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Unified multi-campus execution monitoring, live contractor coordination, real-time stage milestones, day-wise photo logs, and asset deployment analytics.
        </p>

        {/* Primary CTA Button: "View More" */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={onEnterDashboard}
            className="group px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base shadow-2xl shadow-blue-600/50 hover:shadow-blue-500/70 transition-all duration-300 flex items-center gap-3 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>View More</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenMap}
            className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
          >
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>Explore India Campus Map</span>
          </button>
        </div>

        {/* Slideshow Indicator Dots */}
        <div className="flex items-center gap-1.5 mt-8">
          {SLIDESHOW_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentSlide ? 'w-8 bg-blue-500' : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </main>

      {/* Footer KPI Preview Bar */}
      <footer className="relative z-20 w-full px-4 sm:px-8 py-5 border-t border-white/10 backdrop-blur-md bg-slate-950/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 w-full md:w-auto text-center md:text-left">
            <div>
              <span className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider block">Campuses Tracked</span>
              <span className="text-xl sm:text-2xl font-black text-white">{projects.length || 6}</span>
            </div>
            <div>
              <span className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider block">Indian Cities</span>
              <span className="text-xl sm:text-2xl font-black text-blue-400">{citiesCount} Cities</span>
            </div>
            <div>
              <span className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider block">Total Built-up Area</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400">{totalArea ? totalArea.toLocaleString() : '142,000'} sft</span>
            </div>
            <div>
              <span className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider block">Live Cloud Database</span>
              <span className="text-xl sm:text-2xl font-black text-purple-400">8 Tables</span>
            </div>
          </div>

          {/* Coordinator Login Quick Link */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLogin}
              className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Coordinator Sign In</span>
            </button>
            <span className="text-xs text-slate-500 hidden sm:inline">•</span>
            <span className="text-xs text-slate-400 hidden sm:inline">© 2026 {appName || 'Uni Tracker'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
