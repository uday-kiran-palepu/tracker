import React, { useState, useMemo } from 'react';
import {
  BarChart3, Download, Printer, FileCheck2, TrendingUp, Building2, ShieldCheck
} from 'lucide-react';
import { Project, MaterialItem, ManpowerItem, ApprovalItem } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ReportsViewProps {
  projects: Project[];
  materials?: MaterialItem[];
  manpower?: ManpowerItem[];
  approvals: ApprovalItem[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  projects,
  materials,
  manpower,
  approvals
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

  const filteredProjects = useMemo(() => {
    return selectedProjectId === 'all'
      ? projects
      : projects.filter(p => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);

  const approvedNOCs = useMemo(() => {
    return approvals.filter(a => a.status === 'Approved').length;
  }, [approvals]);

  const totalArea = useMemo(() => {
    return filteredProjects.reduce((acc, curr) => acc + curr.areaSft, 0);
  }, [filteredProjects]);

  const chartData = useMemo(() => {
    return projects.map(p => ({
      name: p.code || p.id,
      progress: p.progress,
      area: p.areaSft / 1000
    }));
  }, [projects]);

  const handleExportCSV = () => {
    const headers = ['Project Name', 'Code', 'City', 'Area (sft)', 'Status', 'Health', 'Progress (%)'];
    const rows = filteredProjects.map(p => [
      `"${p.name}"`, p.code || p.id, p.city, p.areaSft, p.status, p.health, p.progress
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'unitracker_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Analytics & Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">Comprehensive audit reports and project analytics across NxtWave campuses</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
          >
            <option value="all">All Campuses (Overall)</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all border border-slate-200"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Filtered Campuses</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{filteredProjects.length}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Total Built-up Area</span>
          <h3 className="text-2xl font-black text-blue-600 mt-1">{totalArea.toLocaleString()} sft</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Approved Statutory NOCs</span>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{approvedNOCs} Approved</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Pending Approvals</span>
          <h3 className="text-2xl font-black text-amber-600 mt-1">{approvals.filter(a => a.status === 'Pending' || a.status === 'Under Review').length}</h3>
        </div>
      </div>

      {/* Comparative Progress Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">Project Progress Comparison (% Complete)</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip />
              <Bar dataKey="progress" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
