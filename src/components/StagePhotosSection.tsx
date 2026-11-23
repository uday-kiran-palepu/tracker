import React, { useState, useEffect } from 'react';
import { 
  Camera, Eye, Plus, Trash2, X, ChevronRight, Layers, 
  Calendar, CheckCircle2, Loader2, Sparkles, AlertCircle, ZoomIn 
} from 'lucide-react';
import { StagePhoto, StageType } from '../types';
import { formatDate } from '../utils/date';
import { compressImage } from '../utils/imageCompressor';

interface StagePhotosSectionProps {
  projectId: string;
  projectName?: string;
  stagePhotos: StagePhoto[];
  isCoordinator: boolean;
  onUploadStagePhoto: (payload: {
    projectId: string;
    stageType: StageType;
    caption?: string;
    date?: string;
    fileName: string;
    mimeType: string;
    base64Data: string;
  }) => Promise<void>;
  onDeleteStagePhoto: (id: string) => Promise<void>;
}

const STAGE_CONFIG: {
  type: StageType;
  title: string;
  subtitle: string;
  badgeClass: string;
  accentBorder: string;
}[] = [
  {
    type: 'Initial Stage',
    title: 'Initial Stage',
    subtitle: 'Site handover, bare shell & pre-commencement status',
    badgeClass: 'bg-amber-500/10 text-amber-700 border-amber-200',
    accentBorder: 'hover:border-amber-400'
  },
  {
    type: 'Current Stage',
    title: 'Current Stage',
    subtitle: 'Active civil, MEP, cabling & fit-out execution in progress',
    badgeClass: 'bg-blue-500/10 text-blue-700 border-blue-200',
    accentBorder: 'hover:border-blue-400'
  },
  {
    type: 'Final Stage',
    title: 'Final Stage',
    subtitle: 'Completed labs, workstations, branding & handover ready',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
    accentBorder: 'hover:border-emerald-400'
  }
];

export const StagePhotosSection: React.FC<StagePhotosSectionProps> = ({
  projectId,
  projectName = 'Campus',
  stagePhotos,
  isCoordinator,
  onUploadStagePhoto,
  onDeleteStagePhoto
}) => {
  const [activeModalStage, setActiveModalStage] = useState<StageType | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<StagePhoto | null>(null);

  // Upload Form State inside Modal
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadDate, setUploadDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState('');

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxPhoto) {
          setLightboxPhoto(null);
        } else if (activeModalStage) {
          setActiveModalStage(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxPhoto, activeModalStage]);

  // Filter photos for project
  const projectPhotos = stagePhotos.filter(p => p.projectId === projectId);

  const getPhotosForStage = (type: StageType): StagePhoto[] => {
    return projectPhotos.filter(p => p.stageType === type);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
      setUploadError('');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalStage || selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadError('');

    try {
      for (const file of selectedFiles) {
        // High quality client-side canvas compression (1600px, 0.8 quality)
        const compressed = await compressImage(file, 1600, 1600, 0.8);
        await onUploadStagePhoto({
          projectId,
          stageType: activeModalStage,
          caption: uploadCaption.trim() || `${activeModalStage} site photo`,
          date: uploadDate,
          fileName: compressed.fileName,
          mimeType: compressed.mimeType,
          base64Data: compressed.base64Data
        });
      }
      setSelectedFiles([]);
      setUploadCaption('');
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload photo. Please retry.');
    } finally {
      setIsUploading(false);
    }
  };

  const activeStagePhotos = activeModalStage ? getPhotosForStage(activeModalStage) : [];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Camera className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Execution Stages Photographic Progression</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visual milestone journey across Initial, Current, and Final delivery phases
          </p>
        </div>

        <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
          {projectPhotos.length} Total Stage Photos
        </span>
      </div>

      {/* 3 Clickable Stage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {STAGE_CONFIG.map((stage) => {
          const photos = getPhotosForStage(stage.type);
          const latestPhoto = photos[0];

          return (
            <div
              key={stage.type}
              onClick={() => setActiveModalStage(stage.type)}
              className={`group relative bg-slate-50/70 hover:bg-white rounded-2xl p-4 border border-slate-200 ${stage.accentBorder} transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between`}
            >
              <div>
                {/* Header & Count Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${stage.badgeClass}`}>
                    {stage.title}
                  </span>
                  <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                    {photos.length} {photos.length === 1 ? 'Photo' : 'Photos'}
                  </span>
                </div>

                {/* Thumbnail Preview Area */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-200 border border-slate-200 mb-3 group-hover:scale-[1.01] transition-transform">
                  {latestPhoto ? (
                    <>
                      <img
                        src={latestPhoto.imageUrl}
                        alt={latestPhoto.caption || stage.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white bg-black/60 backdrop-blur-md px-2 py-1 rounded-md">
                        <span className="truncate">{latestPhoto.caption || 'Latest photo'}</span>
                        <span className="shrink-0">{formatDate(latestPhoto.date)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                      <Camera className="w-8 h-8 mb-1.5 opacity-40" />
                      <span className="text-[11px] font-semibold">No photos uploaded yet</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {stage.subtitle}
                </p>
              </div>

              {/* Action Pill */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                <span>View Stage Gallery</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Multi-Image Side-by-Side Gallery Popup Modal */}
      {activeModalStage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setActiveModalStage(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-mono">
                    {projectName}
                  </span>
                  <span className="text-xs text-slate-300">•</span>
                  <h3 className="text-lg font-black text-slate-900">{activeModalStage} Gallery</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  High-resolution photo documentation for this execution phase
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalStage(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                aria-label="Close Gallery"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Coordinator Upload Panel */}
              {isCoordinator && (
                <form onSubmit={handleUploadSubmit} className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-blue-600" />
                      <span>Upload Photos to {activeModalStage}</span>
                    </span>
                    <span className="text-[11px] text-slate-500">Auto-compressed & synced to Google Drive</span>
                  </div>

                  {uploadError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Select Photo(s)</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        required
                        className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer border border-slate-200 rounded-xl p-1 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Date Taken</label>
                      <input
                        type="date"
                        value={uploadDate}
                        onChange={(e) => setUploadDate(e.target.value)}
                        disabled={isUploading}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Caption / Work Description</label>
                    <input
                      type="text"
                      value={uploadCaption}
                      onChange={(e) => setUploadCaption(e.target.value)}
                      placeholder={`e.g. ${activeModalStage} civil masonry completion`}
                      disabled={isUploading}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUploading || selectedFiles.length === 0}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Compressing & Uploading to Drive...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4" />
                        <span>Upload {selectedFiles.length > 0 ? `${selectedFiles.length} Photo(s)` : 'Photos'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Side-by-Side Gallery Grid */}
              {activeStagePhotos.length === 0 ? (
                <div className="py-16 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <Camera className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">No Photos Logged for {activeModalStage}</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {isCoordinator ? 'Use the upload box above to add site photos.' : 'The coordinator has not uploaded photos for this stage yet.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeStagePhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col"
                    >
                      {/* Photo Thumbnail */}
                      <div
                        className="relative aspect-video w-full overflow-hidden cursor-pointer"
                        onClick={() => setLightboxPhoto(photo)}
                      >
                        <img
                          src={photo.imageUrl}
                          alt={photo.caption || activeModalStage}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-white/80 text-slate-900">
                            <ZoomIn className="w-5 h-5" />
                          </span>
                        </div>
                      </div>

                      {/* Photo Details */}
                      <div className="p-3 bg-white flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900 line-clamp-2">
                            {photo.caption || 'Site execution photo'}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {formatDate(photo.date)}
                          </span>
                        </div>

                        {/* Coordinator Action Buttons */}
                        {isCoordinator && (
                          <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setLightboxPhoto(photo)}
                              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                            >
                              Expand
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Delete this stage photo from Database?')) {
                                  onDeleteStagePhoto(photo.id);
                                }
                              }}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>{activeStagePhotos.length} Photos in {activeModalStage}</span>
              <button
                type="button"
                onClick={() => setActiveModalStage(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Lightbox Zoom */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <button
              onClick={() => setLightboxPhoto(null)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="max-w-5xl max-h-[80vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxPhoto.imageUrl}
              alt={lightboxPhoto.caption || 'Stage photo preview'}
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
            />
            <div className="mt-4 text-center text-white">
              <p className="text-sm font-bold">{lightboxPhoto.caption || `${lightboxPhoto.stageType} photo`}</p>
              <p className="text-xs text-slate-400 mt-1">{formatDate(lightboxPhoto.date)} • {lightboxPhoto.stageType}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
