import React, { useState } from 'react';
import { 
  Activity, CheckCircle2, Clock, ChevronRight, Building2, 
  MapPin, ShieldCheck, Check, Plus, Edit3, Trash2 
} from 'lucide-react';
import { Project, ExecutionStageItem, User } from '../types';

interface ExecutionViewProps {
  projects: Project[];
  executionStages: ExecutionStageItem[];
  currentUser: User;
  onUpdateStageStatus: (stageId: string, status: 'Pending' | 'In Progress' | 'Completed') => void;
  onToggleSubTask?: (stageId: string, subTaskId: string) => void;
  onOpenAddStage?: () => void;
  onOpenEditStage?: (stage: ExecutionStageItem) => void;
  onDeleteStage?: (id: string) => void;
}

export const ExecutionView: React.FC<ExecutionViewProps> = ({
  projects,
  executionStages,
  currentUser,
  onUpdateStageStatus,
  onToggleSubTask,
  onOpenAddStage,
  onOpenEditStage,
  onDeleteStage
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const projStages = executionStages.filter(s => s.projectId === selectedProjectId);

  const [selectedStageId, setSelectedStageId] = useState<string>(projStages[0]?.id || '');
  const selectedStage = projStages.find(s => s.id === selectedStageId) || projStages[0];

  const isCoordinator = currentUser.role === 'Project Coordinator';
  const phases = ['Site Audit', 'Design', 'Procurement', 'Execution', 'Inspection', 'Handover'];

  return (
    <div className="space-y-6">
      {/* Header & Center Selector */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Project Execution Lifecycle</h2>
          <p className="text-xs text-slate-500 mt-0.5">Granular 15-stage milestone progression and quality control</p>
        </div>

        <div className="flex items-center gap-3">
          <Building2 className="w-4 h-4 text-blue-600" />
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              const firstStage = executionStages.find(s => s.projectId === e.target.value);
              if (firstStage) setSelectedStageId(firstStage.id);
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
            ))}
          </select>

          {isCoordinator && onOpenAddStage && (
            <button
              onClick={onOpenAddStage}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Stage</span>
            </button>
          )}
        </div>
      </div>

      {selectedProject && (
        <>
          {/* 6-Phase Horizontal Stepper */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">6-Phase Lifecycle Stepper</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {phases.map((phase, idx) => {
                const isCompleted = selectedProject.progress >= (idx + 1) * 16;
                const isActive = selectedProject.progress >= idx * 16 && selectedProject.progress < (idx + 1) * 16;
                return (
                  <div key={phase} className={`p-4 rounded-xl border flex flex-col justify-between ${
                    isCompleted ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' :
                    isActive ? 'bg-blue-50 border-blue-200 text-blue-950 shadow-sm' :
                    'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCompleted ? 'bg-emerald-600 text-white' :
                        isActive ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-700'
                      }`}>
                        {idx + 1}
                      </span>
                      {isCompleted && <Check className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <span className="text-xs font-bold">{phase}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Left Column: Stages List | Right Column: Stage Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stages List */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">Execution Stages ({projStages.length})</h3>
                {isCoordinator && onOpenAddStage && (
                  <button
                    onClick={onOpenAddStage}
                    className="p-1 rounded-lg text-blue-600 hover:bg-blue-50"
                    title="Add Stage"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {projStages.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No stages configured.</p>
                ) : (
                  projStages.map((stage) => {
                    const isSelected = stage.id === selectedStageId;
                    return (
                      <button
                        key={stage.id}
                        onClick={() => setSelectedStageId(stage.id)}
                        className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all ${
                          isSelected ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            isSelected ? 'bg-blue-700 text-white' : 
                            stage.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {stage.stageNumber}
                          </span>
                          <span className="text-xs font-semibold truncate">{stage.stageName}</span>
                        </div>
                        <span className={`whitespace-nowrap shrink-0 inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-blue-700 text-white' :
                          stage.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {stage.status}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Stage Detail Panel */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              {selectedStage ? (
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                        Stage {selectedStage.stageNumber} • {selectedStage.phase}
                      </span>
                      <h3 className="text-xl font-black text-slate-900 mt-1">{selectedStage.stageName}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCoordinator && (
                        <>
                          <select
                            value={selectedStage.status}
                            onChange={(e) => onUpdateStageStatus(selectedStage.id, e.target.value as any)}
                            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                          {onOpenEditStage && (
                            <button
                              onClick={() => onOpenEditStage(selectedStage)}
                              className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-blue-50"
                              title="Edit Stage"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          {onDeleteStage && (
                            <button
                              onClick={() => {
                                if (confirm(`Delete stage "${selectedStage.stageName}"?`)) {
                                  onDeleteStage(selectedStage.id);
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50"
                              title="Delete Stage"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="my-6">
                    <div className="flex items-center justify-between text-xs font-semibold mb-2">
                      <span className="text-slate-600">Stage Completion</span>
                      <span className="text-blue-600">{selectedStage.progress}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${selectedStage.progress}%` }} />
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Granular Sub-tasks</h4>
                  <div className="space-y-3">
                    {(selectedStage.subTasks || []).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No checklist sub-tasks assigned.</p>
                    ) : (
                      selectedStage.subTasks.map(sub => (
                        <div 
                          key={sub.id} 
                          onClick={() => isCoordinator && onToggleSubTask?.(selectedStage.id, sub.id)}
                          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all ${
                            isCoordinator ? 'cursor-pointer hover:bg-slate-100/80' : ''
                          } ${sub.completed ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-slate-100 text-slate-800'}`}
                        >
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              checked={sub.completed}
                              onChange={() => {}}
                              disabled={!isCoordinator}
                              className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className={sub.completed ? 'line-through text-slate-500' : ''}>{sub.name}</span>
                          </div>
                          <span className={`whitespace-nowrap shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] ${
                            sub.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {sub.completed ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-12">Select an execution stage from the list.</p>
              )}

              <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between text-xs text-slate-400">
                <span>Center: {selectedProject.name}</span>
                <span className="text-blue-600 font-semibold">Syncs to Cloud Database</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
