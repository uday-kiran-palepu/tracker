import React, { useState, useMemo } from 'react';
import { 
  FolderKanban, Plus, Search, Filter, MapPin, Building, 
  Calendar, ArrowRight, Trash2, Edit3, ShieldAlert, CheckCircle2 
} from 'lucide-react';
import { Project, User } from '../types';
import { formatDate } from '../utils/date';
import { getReliableImageUrl, handleImageFallback } from '../utils/image';

interface ProjectsViewProps {
  projects: Project[];
  currentUser: User;
  onSelectProject: (proj: Project) => void;
  onOpenAddProject: () => void;
  onDeleteProject: (id: string) => void;
  onOpenEditProject?: (proj: Project) => void;
  selectedStatusFilter: string;
  setSelectedStatusFilter: (status: string) => void;
  selectedHealthFilter: string;
  setSelectedHealthFilter: (health: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  currentUser,
  onSelectProject,
  onOpenAddProject,
  onDeleteProject,
  onOpenEditProject,
  selectedStatusFilter,
  setSelectedStatusFilter,
  selectedHealthFilter,
  setSelectedHealthFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const isCoordinator = currentUser.role === 'Project Coordinator';

  const filteredProjects = useMemo(() => {
    return projects.filter(proj => {
      const codeStr = proj.labCode || proj.code || proj.id || '';
      const matchesSearch = proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            proj.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            codeStr.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatusFilter === 'All' || proj.status === selectedStatusFilter;
      const matchesHealth = selectedHealthFilter === 'All' || proj.health === selectedHealthFilter;
      return matchesSearch && matchesStatus && matchesHealth;
    });
  }, [projects, searchQuery, selectedStatusFilter, selectedHealthFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Projects Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {filteredProjects.length} of {projects.length} NxtWave campuses & centers
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isCoordinator && (
            <button
              onClick={onOpenAddProject}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Project</span>
            </button>
          )}

          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search project name, city, or center code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Status & Health Filters */}
        <div className="grid grid-cols-2 gap-2 w-full md:flex md:items-center md:w-auto">
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full md:w-44 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="In Design">In Design</option>
            <option value="In Execution">In Execution</option>
            <option value="Handover">Handover</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={selectedHealthFilter}
            onChange={(e) => setSelectedHealthFilter(e.target.value)}
            className="w-full md:w-40 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Health</option>
            <option value="On Track">On Track</option>
            <option value="At Risk">At Risk</option>
            <option value="Delayed">Delayed</option>
          </select>
        </div>
      </div>

      {/* Projects Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Hero Image Header */}
                <div className="h-48 relative overflow-hidden bg-slate-100">
                  <img
                    src={getReliableImageUrl(proj.heroImageUrl || proj.heroImage)}
                    alt={proj.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageFallback(e, proj.heroImageUrl || proj.heroImage)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className={`whitespace-nowrap shrink-0 inline-flex items-center text-[10px] font-bold px-3 py-1 rounded-full text-white shadow-sm ${
                      proj.status === 'Active' ? 'bg-blue-600' :
                      proj.status === 'In Design' ? 'bg-purple-600' :
                      proj.status === 'In Execution' ? 'bg-amber-600' : 'bg-emerald-600'
                    }`}>
                      {proj.status}
                    </span>
                  </div>

                  {/* Code & City */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-black/40 backdrop-blur-md">
                      {proj.labCode || proj.code || proj.id}
                    </span>
                    <span className="text-xs font-medium flex items-center gap-1 drop-shadow">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" /> {proj.city}, {proj.state}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 
                      onClick={() => onSelectProject(proj)}
                      className="text-base font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      {proj.name}
                    </h3>
                    <span className={`whitespace-nowrap shrink-0 inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      proj.health === 'On Track' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                      proj.health === 'At Risk' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                      'bg-rose-50 text-rose-600 border border-rose-200'
                    }`}>
                      {proj.health}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {proj.description || `${proj.name} in ${proj.city}, ${proj.state}`}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Built-up Area</span>
                      <span className="font-bold text-slate-800">{Number(proj.areaSft || 0).toLocaleString()} sft</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Target Handover</span>
                      <span className="font-bold text-slate-800">{formatDate(proj.targetDate || proj.targetHandover)}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-600">Progress</span>
                      <span className="text-blue-600">{proj.progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                <span className="text-[11px] text-slate-400 font-medium">Coord: {proj.coordinatorName || 'Assigned'}</span>
                <div className="flex items-center gap-2">
                  {isCoordinator && (
                    <>
                      <button
                        onClick={() => onOpenEditProject?.(proj)}
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit Project"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteProject(proj.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onSelectProject(proj)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-semibold transition-all"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="p-4">Center / Code</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Area (sft)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Health</th>
                  <th className="p-4">Progress</th>
                  <th className="p-4">Coordinator</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredProjects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img 
                        src={getReliableImageUrl(proj.heroImageUrl || proj.heroImage)} 
                        alt="" 
                        className="w-10 h-10 rounded-lg object-cover" 
                        loading="lazy" 
                        decoding="async" 
                        referrerPolicy="no-referrer"
                        onError={(e) => handleImageFallback(e, proj.heroImageUrl || proj.heroImage)}
                      />
                      <div>
                        <p 
                          onClick={() => onSelectProject(proj)}
                          className="font-bold text-slate-950 hover:text-blue-600 cursor-pointer"
                        >
                          {proj.name}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">{proj.labCode || proj.code || proj.id}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{proj.city}</td>
                    <td className="p-4 font-semibold">{proj.areaSft.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`whitespace-nowrap shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold text-white ${
                        proj.status === 'Active' ? 'bg-blue-600' :
                        proj.status === 'In Design' ? 'bg-purple-600' :
                        proj.status === 'In Execution' ? 'bg-amber-600' : 'bg-emerald-600'
                      }`}>
                        {proj.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`whitespace-nowrap shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        proj.health === 'On Track' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        proj.health === 'At Risk' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                        'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}>
                        {proj.health}
                      </span>
                    </td>
                    <td className="p-4 w-36">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${proj.progress}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-600">{proj.progress}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{proj.coordinatorName || 'Assigned'}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectProject(proj)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold text-xs transition-all"
                        >
                          View
                        </button>
                        {isCoordinator && (
                          <>
                            <button
                              onClick={() => onOpenEditProject?.(proj)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit Project"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteProject(proj.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
