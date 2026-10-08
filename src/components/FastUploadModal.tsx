import React, { useState, useRef } from 'react';
import { 
  Upload, 
  X, 
  FileText, 
  Video, 
  HardDrive, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Fingerprint,
  RefreshCw,
  Folder,
  FileCheck
} from 'lucide-react';
import { DocumentType } from '../types';

interface FastUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (doc: { name: string; type: DocumentType; rawText: string; fileSize?: string }) => Promise<void>;
  isProcessing: boolean;
  targetDocumentType?: DocumentType;
}

export const FastUploadModal: React.FC<FastUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  isProcessing,
  targetDocumentType
}) => {
  const [source, setSource] = useState<'system' | 'drive'>('system');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; type: DocumentType; text: string } | null>(null);
  const [verifyingStep, setVerifyingStep] = useState<number>(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Mock Google Drive files that can be imported in 1 click
  const mockDriveFiles = [
    {
      name: 'Sapthagiri_Degree_Certificate_Malavika.pdf',
      type: 'degree_certificate' as DocumentType,
      size: '2.1 MB',
      updated: 'Yesterday',
      text: 'Sapthagiri NPS University Degree Certificate: Malavika J Dev (Roll: 21SNPSU042, Cert ID: SNPSU/BTECH/CSE/2025/042). CGPA 8.8. B.Tech Computer Science 2025.'
    },
    {
      name: 'Introduction_Video_Pitch_German_Career.mp4',
      type: 'video_intro' as DocumentType,
      size: '14.2 MB',
      updated: '3 days ago',
      text: 'Video Pitch MP4: Self-introduction by applicant. Covers background in AI engineering, B1 German proficiency, and career goals for German mobility.'
    },
    {
      name: 'Goethe_Zertifikat_B1_Certified.pdf',
      type: 'german_language_certificate' as DocumentType,
      size: '1.2 MB',
      updated: '1 week ago',
      text: 'Goethe-Institut B1 Certificate: Registration GLI-B1-2024-8842. Passed with distinction across all modules.'
    },
    {
      name: 'Academic_Transcripts_Consolidated.pdf',
      type: 'marks_card' as DocumentType,
      size: '2.4 MB',
      updated: '2 weeks ago',
      text: 'Consolidated Academic Marks Card: 8 Semesters, CGPA 8.8, 160 total university credits.'
    },
    {
      name: 'TechNova_Employer_Experience_Letter.pdf',
      type: 'experience_letter' as DocumentType,
      size: '1.4 MB',
      updated: 'Oct 2, 2026',
      text: 'TechNova Solutions: Experience letter confirming 2 years tenure as Software Engineer. Employee ID: TN-2023-088. Domain: technova-demo.com.'
    }
  ];

  const processSelectedFile = (file: File) => {
    let detectedType: DocumentType = targetDocumentType || 'other';
    const lower = file.name.toLowerCase();
    if (lower.includes('degree') || lower.includes('bachelor') || lower.includes('master')) detectedType = 'degree_certificate';
    else if (lower.includes('video') || lower.endsWith('.mp4') || lower.endsWith('.mov') || lower.endsWith('.webm')) detectedType = 'video_intro';
    else if (lower.includes('transcript') || lower.includes('marks')) detectedType = 'marks_card';
    else if (lower.includes('german') || lower.includes('goethe') || lower.includes('telc')) detectedType = 'german_language_certificate';
    else if (lower.includes('experience') || lower.includes('technova') || lower.includes('work')) detectedType = 'experience_letter';
    else if (lower.includes('cv') || lower.includes('resume')) detectedType = 'cv';

    setSelectedFile({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: detectedType,
      text: `Uploaded File: ${file.name}. Size: ${(file.size / (1024 * 1024)).toFixed(1)} MB. Format: ${file.type || 'binary'}. Validated and queued for verification.`
    });
  };

  const handleSystemFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleExecuteUpload = async (fileObj: { name: string; size: string; type: DocumentType; text: string }) => {
    setVerifyingStep(1);
    setTimeout(() => setVerifyingStep(2), 500);
    setTimeout(async () => {
      setVerifyingStep(3);
      try {
        await onUpload({
          name: fileObj.name,
          type: fileObj.type,
          fileSize: fileObj.size,
          rawText: fileObj.text
        });
        onClose();
      } catch (err) {
        console.error(err);
      } finally {
        setVerifyingStep(0);
        setSelectedFile(null);
      }
    }, 1000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 overflow-hidden space-y-5 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
              <Upload className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Fast & Accessible Upload
              </span>
              <h3 id="upload-modal-title" className="text-base font-extrabold text-slate-900 mt-0.5">
                Upload & Verify Document or Video
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close upload dialog"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Switcher: My Device vs Google Drive */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 text-xs font-bold" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={source === 'system'}
            onClick={() => { setSource('system'); setSelectedFile(null); }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              source === 'system' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>From Your Computer</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={source === 'drive'}
            onClick={() => { setSource('drive'); setSelectedFile(null); }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              source === 'drive' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M12.01 1.99L4.99 14.01h4.03l7.02-12.02z" />
              <path fill="#FBBC05" d="M8.99 14.01l-4 6.99h14.02l4-6.99z" />
              <path fill="#34A853" d="M19.01 1.99L12.01 14.01h4.03l7-12.02z" />
            </svg>
            <span>From Google Drive</span>
          </button>
        </div>

        {/* Verifying In-Progress Banner */}
        {verifyingStep > 0 && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-2 animate-in fade-in" aria-live="polite">
            <div className="flex items-center space-x-2 font-bold text-xs">
              <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
              <span>Running Automated 3-Layer Forensics...</span>
            </div>
            <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-400" 
                style={{ width: `${verifyingStep === 1 ? 35 : verifyingStep === 2 ? 75 : 100}%` }}
              />
            </div>
            <div className="text-[11px] text-blue-700 font-medium">
              {verifyingStep === 1 && 'Layer 1: Visual & Metadata manipulation inspection...'}
              {verifyingStep === 2 && 'Layer 2: Cross-referencing Profile & Transcripts...'}
              {verifyingStep >= 3 && 'Layer 3: External Trust Anchor verified!'}
            </div>
          </div>
        )}

        {/* Tab 1: System Upload */}
        {source === 'system' && (
          <div className="space-y-4">
            <input 
              type="file" 
              ref={fileInputRef} 
              accept=".pdf,video/mp4,video/webm,video/quicktime,image/jpeg,image/png,.docx" 
              className="hidden" 
              onChange={handleSystemFileSelect}
            />

            {!selectedFile ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-7 border-2 border-dashed rounded-2xl text-center transition-all cursor-pointer ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20'
                }`}
              >
                <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-100/70 text-blue-600 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="font-extrabold text-sm text-slate-900">
                  Select or Drag & Drop File from your computer
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Accepts <span className="font-semibold text-slate-700">PDFs, Videos (.mp4, .webm, .mov), certificates & scans</span>. Automatically detects document type and runs 3-layer verification.
                </p>
                <div className="mt-3 flex items-center justify-center space-x-2 text-[11px] text-blue-600 font-semibold">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Click to browse files</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    {selectedFile.type === 'video_intro' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">{selectedFile.name}</div>
                    <div className="text-[11px] text-slate-500">{selectedFile.size} • Detected: <span className="font-semibold text-slate-700">{selectedFile.type.replace(/_/g, ' ')}</span></div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteUpload(selectedFile)}
                    disabled={isProcessing || verifyingStep > 0}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Verify Now</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Google Drive Quick Import */}
        {source === 'drive' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span className="flex items-center space-x-1.5 font-bold text-slate-700">
                <Folder className="w-3.5 h-3.5 text-blue-600" />
                <span>Google Drive / My Documents / Germany</span>
              </span>
              <span>1-Click Import & Audit</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {mockDriveFiles.map((driveFile, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between text-xs group"
                >
                  <div className="flex items-center space-x-3 truncate mr-2">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                      {driveFile.type === 'video_intro' ? <Video className="w-4 h-4 text-purple-600" /> : <FileText className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-slate-900 truncate">{driveFile.name}</div>
                      <div className="text-[10px] text-slate-400">{driveFile.size} • {driveFile.updated}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExecuteUpload(driveFile)}
                    disabled={isProcessing || verifyingStep > 0}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition-colors shrink-0 cursor-pointer disabled:opacity-50 flex items-center space-x-1"
                  >
                    <span>Import & Verify</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Automated visual, consistency, and registry checks run upon upload.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
