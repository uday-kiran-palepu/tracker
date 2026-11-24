import React, { useState } from 'react';
import { FileCheck2, Plus, ExternalLink, ShieldCheck, Filter, Trash2 } from 'lucide-react';
import { ApprovalItem, User } from '../types';
import { formatDate } from '../utils/date';
import { sanitizeExternalUrl } from '../utils/security';

interface ApprovalsViewProps {
  approvals: ApprovalItem[];
  currentUser: User;
  onOpenAddApproval: () => void;
  onUpdateApprovalStatus: (id: string, status: 'Pending' | 'Approved' | 'Rejected' | 'Under Review') => void;
  onDeleteApproval?: (id: string) => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  approvals,
  currentUser,
  onOpenAddApproval,
  onUpdateApprovalStatus,
  onDeleteApproval
}) => {
  const [statusFilter, setStatusFilter] = useState('All');
  const isCoordinator = currentUser.role === 'Project Coordinator';

  const filteredApprovals = approvals.filter(a => {
    return statusFilter === 'All' || a.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Approvals & Compliance</h2>
          <p className="text-xs text-slate-500 mt-0.5">Centralized tracking for NOCs, municipal permissions, and statutory clearances</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Under Review">Under Review</option>
            <option value="Rejected">Rejected</option>
          </select>

          {isCoordinator && (
            <button
              type="button"
              onClick={onOpenAddApproval}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Approval</span>
            </button>
          )}
        </div>
      </div>

      {/* Approvals Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <th className="p-4">Approval Item</th>
                <th className="p-4">Campus / Project</th>
                <th className="p-4">Approver Authority</th>
                <th className="p-4">Requested Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Reference & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredApprovals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No approval records found matching your filter.
                  </td>
                </tr>
              ) : (
                filteredApprovals.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">{app.approvalName || app.name}</td>
                    <td className="p-4 text-blue-600 font-semibold">{app.projectName || 'Campus Project'}</td>
                    <td className="p-4 text-slate-600">{app.approver}</td>
                    <td className="p-4 text-slate-500">{formatDate(app.requestedDate)}</td>
                    <td className="p-4">
                      {isCoordinator ? (
                        <select
                          value={app.status}
                          onChange={(e) => onUpdateApprovalStatus(app.id, e.target.value as any)}
                          className={`whitespace-nowrap shrink-0 inline-flex items-center px-3 py-1.5 rounded-lg border text-xs font-bold ${
                            app.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            app.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            app.status === 'Under Review' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      ) : (
                        <span className={`whitespace-nowrap shrink-0 inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${
                          app.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          app.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {app.status}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={sanitizeExternalUrl(app.documentUrl || app.link)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold text-xs transition-all whitespace-nowrap shrink-0"
                        >
                          <span>View Doc</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        {isCoordinator && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete approval "${app.approvalName || app.name}"?`)) {
                                onDeleteApproval?.(app.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Delete approval"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
