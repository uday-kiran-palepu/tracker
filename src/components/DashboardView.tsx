import React from 'react';
import { 
  FolderKanban, Clock, Activity, CheckCircle2, AlertTriangle, 
  ArrowUpRight, ShieldAlert, Sparkles, Building2, MapPin 
} from 'lucide-react';
import { Project, SiteUpdateItem } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardViewProps {
  projects: Project[];
  siteUpdates: SiteUpdateItem[];
  setActiveTab: (tab: string) => void;
  setSelectedStatusFilter: (status: string) => void;
  setSelectedHealthFilter: (health: string) => void;
  onSelectProject: (proj: Project) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  siteUpdates,
  setActiveTab,
  setSelectedStatusFilter,
  setSelectedHealthFilter,
  onSelectProject
}) => {
  // KPI Calculations
  const activeCount = projects.filter(p => p.status === 'Active').length;
  const designCount = projects.filter(p => p.status === 'In Design').length;
  const executionCount = projects.filter(p => p.status === 'In Execution').length;
  const handoverCount = projects.filter(p => p.status === 'Handover' || p.status === 'Completed').length;

  const onTrackCount = projects.filter(p => p.health === 'On Track').length;
  const atRiskCount = projects.filter(p => p.health === 'At Risk').length;
  const delayedCount = projects.filter(p => p.health === 'Delayed').length;

  const avgProgress = Math.round(
    projects.reduce((acc, curr) => acc + curr.progress, 0) / (projects.length || 1)
  );

  const totalArea = projects.reduce((acc, curr) => acc + (Number(curr.areaSft) || 0), 0);
  const totalBudgetAllocated = projects.reduce((acc, curr) => acc + (Number(curr.budgetAllocated) || 0), 0);
  const totalBudgetSpent = projects.reduce((acc, curr) => acc + (Number(curr.budgetSpent) || 0), 0);

  // Donut chart data for progress breakdown
  const progressData = [
    { name: 'Design & Approvals', value: 35, color: '#10B981' },
    { name: 'Procurement', value: 25, color: '#3B82F6' },
    { name: 'Execution', value: 30, color: '#F97316' },
    { name: 'Handover', value: 10, color: '#64748B' },
  ];

  const handleKpiClick = (status: string) => {
    setSelectedStatusFilter(status);
    setActiveTab('projects');
  };

  const handleHealthClick = (health: string) => {
    setSelectedHealthFilter(health);
    setActiveTab('projects');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome card */}
      <div className="bg-gradient-to-r from-blue-900 via-[#0B1528] to-indigo-950 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" /> NxtWave Center Infrastructure
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight">India Campus Expansion Tracker</h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Monitoring {projects.length} campuses across {new Set(projects.map(p => p.city)).size} cities totaling {totalArea.toLocaleString()} sft of state-of-the-art learning hubs.
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-6">
            <button
              onClick={() => setActiveTab('projects')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
            >
              <span>View All Projects</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all border border-slate-700 flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Explore India Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Interactive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active */}
        <div 
          onClick={() => handleKpiClick('Active')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
              <FolderKanban className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">Active</span>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-black text-slate-900">{activeCount}</h4>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Active Centers</p>
          </div>
        </div>

        {/* In Design */}
        <div 
          onClick={() => handleKpiClick('In Design')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-600">Design</span>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-black text-slate-900">{designCount}</h4>
            <p className="text-xs font-medium text-slate-500 mt-0.5">In Planning & Design</p>
          </div>
        </div>

        {/* In Execution */}
        <div 
          onClick={() => handleKpiClick('In Execution')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">Execution</span>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-black text-slate-900">{executionCount}</h4>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Active Construction</p>
          </div>
        </div>

        {/* Handover */}
        <div 
          onClick={() => handleKpiClick('Handover')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">Handover</span>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-black text-slate-900">{handoverCount}</h4>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Completed & Handed Over</p>
          </div>
        </div>
      </div>

      {/* Middle Grid: Overall Progress + Project Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Progress Donut */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Overall Execution Progress</h3>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{avgProgress}% Avg</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Aggregated completion rate across all campuses</p>
          </div>

          <div className="h-48 my-4 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={progressData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {progressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900">{avgProgress}%</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Complete</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
            {progressData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Project Health Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Project Health Status</h3>
            <p className="text-xs text-slate-500 mt-1">Real-time risk and milestone adherence</p>
          </div>

          <div className="space-y-3 my-4">
            <div 
              onClick={() => handleHealthClick('On Track')}
              className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 hover:bg-emerald-100/60 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">On Track</h4>
                  <p className="text-xs text-emerald-700">Meeting all milestone deliverables</p>
                </div>
              </div>
              <span className="text-lg font-black text-emerald-800">{onTrackCount}</span>
            </div>

            <div 
              onClick={() => handleHealthClick('At Risk')}
              className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50/60 border border-amber-100 hover:bg-amber-100/60 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900">At Risk</h4>
                  <p className="text-xs text-amber-700">Requires monitoring or minor intervention</p>
                </div>
              </div>
              <span className="text-lg font-black text-amber-800">{atRiskCount}</span>
            </div>

            <div 
              onClick={() => handleHealthClick('Delayed')}
              className="flex items-center justify-between p-3.5 rounded-xl bg-rose-50/60 border border-rose-100 hover:bg-rose-100/60 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-xs">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-900">Delayed</h4>
                  <p className="text-xs text-rose-700">Critical path bottleneck or approval hold</p>
                </div>
              </div>
              <span className="text-lg font-black text-rose-800">{delayedCount}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => setActiveTab('projects')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>View projects directory breakdown</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Stats / Summary Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Infrastructure Summary</h3>
            <p className="text-xs text-slate-500 mt-1">Key metrics and resource utilization</p>
          </div>

          <div className="space-y-4 my-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-medium text-slate-500">Total Built-up Area</span>
              <h4 className="text-xl font-black text-slate-900 mt-0.5">{totalArea.toLocaleString()} sft</h4>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-medium text-slate-500">Active Workforce Onsite</span>
              <h4 className="text-xl font-black text-slate-900 mt-0.5">141 Workers</h4>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-medium text-slate-500">Total Budget Allocated</span>
              <h4 className="text-xl font-black text-slate-900 mt-0.5">
                {totalBudgetAllocated > 0 ? `₹${(totalBudgetAllocated / 10000000).toFixed(1)} Cr` : '₹15.2 Cr'}
              </h4>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 text-center">
            Synced with Cloud Database
          </div>
        </div>
      </div>

      {/* Recent Site Updates Feed */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Site Updates</h3>
            <p className="text-xs text-slate-500 mt-0.5">Latest field logs and photo check-ins across campuses</p>
          </div>
          <button
            onClick={() => setActiveTab('projects')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            View All →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {siteUpdates.slice(0, 4).map((update) => {
            const project = projects.find(p => p.id === update.projectId) || projects[0];
            return (
              <div 
                key={update.id}
                onClick={() => project && onSelectProject(project)}
                className="rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all cursor-pointer bg-slate-50/50 flex flex-col justify-between group"
              >
                <div>
                  <div className="h-36 overflow-hidden relative">
                    <img 
                      src={update.imageUrl} 
                      alt={update.projectName} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`whitespace-nowrap shrink-0 inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full text-white ${
                        update.healthBadge === 'On Track' ? 'bg-emerald-600' :
                        update.healthBadge === 'At Risk' ? 'bg-amber-600' : 'bg-rose-600'
                      }`}>
                        {update.healthBadge}
                      </span>
                    </div>
                  </div>
                  <div className="p-3.5">
                    <h4 className="text-xs font-bold text-blue-600 truncate">{update.projectName}</h4>
                    <p className="text-xs font-medium text-slate-800 mt-1 line-clamp-2">{update.note}</p>
                  </div>
                </div>
                <div className="px-3.5 pb-3 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                  <span>{update.timestamp}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (project) onSelectProject(project);
                    }}
                    className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Open Project</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
