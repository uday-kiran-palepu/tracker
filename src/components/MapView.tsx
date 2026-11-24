import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { 
  Search, ArrowRight, Layers, MapPin, Building2, CheckCircle2, 
  Clock, Activity, ExternalLink, Globe, Compass 
} from 'lucide-react';
import { Project } from '../types';
import { deOverlapProjectPins } from '../utils/location';
import { sanitizeExternalUrl } from '../utils/security';

interface MapViewProps {
  projects: Project[];
  onSelectProject: (proj: Project) => void;
}

type TileMode = 'google-street' | 'google-satellite' | 'osm';

export const MapView: React.FC<MapViewProps> = ({ projects, onSelectProject }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const [tileMode, setTileMode] = useState<TileMode>('google-street');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const codeStr = p.labCode || p.code || p.id || '';
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            codeStr.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchesCity = !selectedCity || p.city === selectedCity;
      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [projects, searchQuery, statusFilter, selectedCity]);

  const cities = useMemo(() => {
    return Array.from(new Set(projects.map(p => p.city).filter(Boolean)));
  }, [projects]);

  const totalArea = useMemo(() => {
    return projects.reduce((acc, curr) => acc + (Number(curr.areaSft) || 0), 0);
  }, [projects]);

  /**
   * Status Colors per specification:
   * Green = Active
   * Blue = In Progress / In Execution
   * Silver = Completed / Handover
   * Slate / Orange = Not Started / In Design
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return '#10B981'; // Green
      case 'In Execution':
        return '#2563EB'; // Blue
      case 'Handover':
      case 'Completed':
        return '#94A3B8'; // Silver
      case 'In Design':
      default:
        return '#F97316'; // Slate / Orange
    }
  };

  const selectedProj = useMemo(() => {
    return projects.find(p => p.id === activeMarkerId);
  }, [projects, activeMarkerId]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      if ((mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [21.7679, 78.8718],
        zoom: 5,
        scrollWheelZoom: true,
        zoomControl: true,
      });

      // Default tile: Google Maps Street
      const tileLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google Maps',
        maxZoom: 20,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Tile Switching
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    let newUrl = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
    let attribution = '&copy; Google Maps';

    if (tileMode === 'google-satellite') {
      newUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'; // Google Hybrid / Satellite
      attribution = '&copy; Google Satellite Imagery';
    } else if (tileMode === 'osm') {
      newUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    }

    const newLayer = L.tileLayer(newUrl, { attribution, maxZoom: 20 });
    newLayer.addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
  }, [tileMode]);

  // Calculate de-overlapped pins for ALL projects (Priority coords + Circular offset for close pins)
  const plottedPins = useMemo(() => {
    return deOverlapProjectPins(filteredProjects, 0.06);
  }, [filteredProjects]);

  // Update Markers and Auto-fit Bounds when plottedPins or activeMarkerId change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const bounds = L.latLngBounds([]);

    plottedPins.forEach(pin => {
      const proj = pin.project;
      const lat = pin.lat;
      const lng = pin.lng;

      bounds.extend([lat, lng]);

      const color = getStatusColor(proj.status);
      const isSelected = proj.id === activeMarkerId;
      const labCode = proj.labCode || proj.code || proj.id;
      const rawMapsUrl = proj.mapsUrl && proj.mapsUrl.trim()
        ? proj.mapsUrl.trim()
        : `https://www.google.com/maps?q=${pin.baseLat},${pin.baseLng}`;
      const safeMapsUrl = sanitizeExternalUrl(rawMapsUrl);

      const markerHtml = `
        <div style="
          background-color: ${color};
          width: ${isSelected ? '38px' : '30px'};
          height: ${isSelected ? '38px' : '30px'};
          border-radius: 50%;
          border: 2.5px solid white;
          box-shadow: 0 4px 14px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: ${isSelected ? '13px' : '11px'};
          cursor: pointer;
          transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
          transition: transform 0.2s ease;
        ">
          U
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-campus-marker',
        html: markerHtml,
        iconSize: [isSelected ? 38 : 30, isSelected ? 38 : 30],
        iconAnchor: [isSelected ? 19 : 15, isSelected ? 19 : 15],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Crisp popup content
      const popupHtml = `
        <div style="min-width: 220px; font-family: system-ui, -apple-system, sans-serif; padding: 4px;">
          <div style="font-size: 10px; font-weight: 800; color: #2563EB; text-transform: uppercase; letter-spacing: 0.05em;">
            ${labCode}
          </div>
          <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin-top: 2px;">
            ${proj.name}
          </div>
          <div style="font-size: 11px; color: #64748B; margin-top: 2px;">
            📍 ${proj.city}, ${proj.state} ${pin.clusterSize > 1 ? `<span style="color:#2563EB; font-weight:700;">(${pin.clusterSize} in ${proj.city})</span>` : ''}
          </div>
          <div style="margin-top: 8px; display: flex; align-items: center; justify-content: space-between; font-size: 11px;">
            <span style="font-weight: 700; color: ${color};">${proj.status}</span>
            <span style="font-weight: 800; color: #2563EB;">${proj.progress}%</span>
          </div>
          <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 6px;">
            <button id="btn-open-proj-${proj.id}" style="
              width: 100%; padding: 6px 12px; background: #2563EB; color: white;
              font-size: 11px; font-weight: 700; border-radius: 8px; border: none; cursor: pointer;
            ">
              Open Project Details →
            </button>
            <a href="${safeMapsUrl}" target="_blank" rel="noopener noreferrer" style="
              text-align: center; font-size: 10px; font-weight: 600; color: #2563EB; text-decoration: none; padding: 2px;
            ">
              Open in Google Maps ↗
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: true,
        className: 'custom-google-popup'
      });

      marker.on('click', () => {
        setActiveMarkerId(proj.id);
        mapInstanceRef.current?.setView([lat, lng], 10, { animate: true });
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-open-proj-${proj.id}`);
        if (btn) {
          btn.onclick = () => onSelectProject(proj);
        }
      });

      markersLayerRef.current?.addLayer(marker);
    });

    // Auto-fit bounds if we have plotted points
    if (bounds.isValid() && plottedPins.length > 0) {
      if (plottedPins.length === 1) {
        mapInstanceRef.current.setView(bounds.getCenter(), 10, { animate: true });
      } else {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [plottedPins, activeMarkerId]);

  // If city is selected, zoom into it
  useEffect(() => {
    if (selectedCity && mapInstanceRef.current) {
      const cityPins = plottedPins.filter(p => p.project.city === selectedCity);
      if (cityPins.length > 0) {
        if (cityPins.length === 1) {
          mapInstanceRef.current.setView([cityPins[0].lat, cityPins[0].lng], 10, { animate: true });
        } else {
          const cityBounds = L.latLngBounds(cityPins.map(p => [p.lat, p.lng]));
          mapInstanceRef.current.fitBounds(cityBounds, { padding: [40, 40], maxZoom: 11 });
        }
      }
    }
  }, [selectedCity, plottedPins]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-950 tracking-tight">India Campus & Center Map View</h2>
            <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Google Maps Style
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Real-time geographic distribution across Indian states and cities</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Tile Layer Switcher */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setTileMode('google-street')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                tileMode === 'google-street' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
              }`}
            >
              Street
            </button>
            <button
              onClick={() => setTileMode('google-satellite')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                tileMode === 'google-satellite' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setTileMode('osm')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                tileMode === 'osm' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
              }`}
            >
              OSM
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search location, code or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 w-52 sm:w-60"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="In Execution">In Execution</option>
            <option value="In Design">In Design</option>
            <option value="Handover">Handover / Completed</option>
          </select>
        </div>
      </div>

      {/* Google-Style Legend Bar */}
      <div className="bg-white px-4 sm:px-6 py-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-700">
        <span className="text-slate-400 uppercase tracking-wider text-[10px]">Campus Status Pin Legend:</span>
        <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block shadow-sm" />
            <span>Green = Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-600 inline-block shadow-sm" />
            <span>Blue = In Execution</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-400 inline-block shadow-sm" />
            <span>Silver = Completed / Handover</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-orange-500 inline-block shadow-sm" />
            <span>Slate / Orange = In Design</span>
          </div>
        </div>
      </div>

      {/* Map + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Interactive Map Container */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[420px] sm:h-[500px] md:h-[580px] relative">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Floating Selected Project Card Overlay */}
          {selectedProj && (
            <div className="absolute top-3 left-3 right-3 sm:left-auto sm:right-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-200 max-w-xs animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider font-mono">
                    {selectedProj.labCode || selectedProj.code || selectedProj.id}
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-0.5 leading-snug">{selectedProj.name}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-blue-500" />
                    <span>{selectedProj.city}, {selectedProj.state}</span>
                  </p>
                </div>
                <button
                  onClick={() => setActiveMarkerId(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                  aria-label="Close project info"
                >
                  &times;
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="whitespace-nowrap shrink-0 inline-flex items-center font-bold" style={{ color: getStatusColor(selectedProj.status) }}>
                    {selectedProj.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Built-up Area</span>
                  <span className="font-bold text-slate-800">{Number(selectedProj.areaSft || 0).toLocaleString()} sft</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Progress</span>
                  <span className="font-bold text-blue-600">{selectedProj.progress}%</span>
                </div>
              </div>

              <div className="mt-3 pt-2 space-y-2">
                <button
                  onClick={() => onSelectProject(selectedProj)}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Open Project Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <a
                  href={sanitizeExternalUrl(
                    selectedProj.mapsUrl && selectedProj.mapsUrl.trim()
                      ? selectedProj.mapsUrl.trim()
                      : `https://www.google.com/maps?q=${selectedProj.lat},${selectedProj.lng}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-200"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right Summary Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Geographic Summary</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500">Filtered Campuses</span>
                <span className="font-black text-slate-900">{filteredProjects.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500">Total Cities</span>
                <span className="font-black text-blue-600">{cities.length} Cities</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500">Total Built-up Area</span>
                <span className="font-black text-slate-900">{totalArea.toLocaleString()} sft</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Projects by City</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <button
                onClick={() => setSelectedCity(null)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all ${
                  !selectedCity ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>All India Centers</span>
                <span>{projects.length}</span>
              </button>
              {cities.map(city => {
                const count = projects.filter(p => p.city === city).length;
                const isSelected = selectedCity === city;
                return (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(isSelected ? null : city);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{city}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
