import React, { useState } from 'react';
import { FolderOpen, Search, ExternalLink, Plus, Filter, Trash2, Upload, FileText } from 'lucide-react';
import { DocumentItem, User } from '../types';
import { formatDate } from '../utils/date';
import { sanitizeExternalUrl } from '../utils/security';

interface DocumentsViewProps {
  documents: DocumentItem[];
  currentUser: User;
  onOpenAddDoc: () => void;
  onDeleteDocument?: (id: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  currentUser,
  onOpenAddDoc,
  onDeleteDocument
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const isCoordinator = currentUser.role === 'Project Coordinator';

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.projectName && d.projectName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'All' || d.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Cloud Document Repository</h2>
          <p className="text-xs text-slate-500 mt-0.5">Centralized cloud storage for architectural drawings, BOQs, agreements, and NOC certificates</p>
        </div>

        <div className="flex items-center gap-3">
          {isCoordinator && (
            <button
              type="button"
              onClick={onOpenAddDoc}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all whitespace-nowrap shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>+ Upload Document / Drawing</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search document title or campus name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full md:w-48 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
        >
          <option value="All">All Categories</option>
          <option value="Drawings">Drawings</option>
          <option value="BOQ">BOQ</option>
          <option value="Contracts">Contracts</option>
          <option value="Permits">Permits</option>
          <option value="Reports">Reports</option>
          <option value="NOC">NOC</option>
        </select>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <th className="p-4">Document Title</th>
                <th className="p-4">Campus / Project</th>
                <th className="p-4">Category</th>
                <th className="p-4">Upload Date</th>
                <th className="p-4 text-right">Access Link & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No documents found matching your search.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>{doc.title}</span>
                    </td>
                    <td className="p-4 text-blue-600 font-semibold">{doc.projectName || 'Campus Document'}</td>
                    <td className="p-4">
                      <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-bold text-[10px]">
                        {doc.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-medium">{formatDate(doc.uploadDate)}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={sanitizeExternalUrl(doc.documentUrl || doc.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold text-xs transition-all whitespace-nowrap shrink-0"
                        >
                          <span>Open File</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        {isCoordinator && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete document "${doc.title}" from Database?`)) {
                                onDeleteDocument?.(doc.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Delete document"
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
