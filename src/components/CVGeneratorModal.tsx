import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Sparkles, 
  Check, 
  Edit3, 
  Eye, 
  Plus, 
  Trash2,
  FileText,
  User,
  GraduationCap,
  Briefcase,
  Languages
} from 'lucide-react';
import { Applicant, GermanCV, GermanCVWorkExp, GermanCVEducation } from '../types.ts';
import { buildGermanCVFromApplicant, calculateCompletionPercentage } from '../api.ts';

interface CVGeneratorModalProps {
  applicant: Applicant;
  isOpen: boolean;
  onClose: () => void;
  onSaveCV: (updatedApplicant: Applicant) => void;
}

export const CVGeneratorModal: React.FC<CVGeneratorModalProps> = ({
  applicant,
  isOpen,
  onClose,
  onSaveCV,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
  const [cv, setCv] = useState<GermanCV>(() => {
    return applicant.cvData.generatedCv || buildGermanCVFromApplicant(applicant);
  });
  const [showPhoto, setShowPhoto] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    const updated: Applicant = {
      ...applicant,
      cvData: {
        ...applicant.cvData,
        generatedCv: cv,
      },
      updatedAt: new Date().toISOString(),
    };
    updated.completionPercentage = calculateCompletionPercentage(updated);
    onSaveCV(updated);
    onClose();
  };

  const addWorkExp = () => {
    const newExp: GermanCVWorkExp = {
      role: 'Software Developer',
      company: 'Tech Enterprise GmbH',
      city: 'Berlin',
      startDate: '01/2023',
      endDate: 'Present',
      tasks: ['Responsible for feature implementation and system architecture.'],
    };
    setCv(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, newExp]
    }));
  };

  const removeWorkExp = (index: number) => {
    setCv(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                German Standard Lebenslauf Generator (DIN 5008)
              </h2>
              <p className="text-xs text-slate-400">
                Official reverse-chronological format preferred by German employers & universities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-slate-800 p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'preview' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Vorschau (Preview)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'edit' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Bearbeiten (Edit)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Print / Save as PDF"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/60">
          {activeTab === 'preview' ? (
            /* PRINTABLE / PREVIEW GERMAN LEBENSLAUF STYLING */
            <div className="max-w-3xl mx-auto bg-white text-slate-900 rounded-xl shadow-2xl p-8 sm:p-12 font-sans border border-slate-200" id="printable-cv">
              {/* Header with Photo & Personal Data */}
              <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-6 mb-6 gap-6">
                <div className="space-y-1">
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 uppercase">
                    {cv.personalInfo.fullName}
                  </h1>
                  <p className="text-base font-semibold text-red-700 tracking-wide">
                    {cv.targetRole}
                  </p>
                  <div className="text-xs text-slate-600 space-y-0.5 pt-2">
                    <p>{cv.personalInfo.address}</p>
                    <p>E-Mail: {cv.personalInfo.email} &bull; Tel: {cv.personalInfo.phone}</p>
                    <p>Staatsangehörigkeit: {cv.personalInfo.nationality} &bull; Geburtsdatum: {cv.personalInfo.birthDate}</p>
                  </div>
                </div>

                {showPhoto && cv.personalInfo.photoUrl && (
                  <div className="shrink-0 w-28 h-36 rounded border border-slate-300 overflow-hidden shadow-sm bg-slate-100">
                    <img
                      src={cv.personalInfo.photoUrl}
                      alt="Bewerbungsfoto"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Kursprofil / Professional Summary */}
              <div className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
                  Profil & Zielsetzung
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {cv.profileSummary}
                </p>
              </div>

              {/* Berufserfahrung (Work Experience) */}
              <div className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3">
                  Berufserfahrung
                </h2>
                <div className="space-y-4">
                  {cv.workExperience.map((exp, idx) => (
                    <div key={idx} className="grid grid-cols-4 gap-4 text-xs">
                      <div className="col-span-1 font-semibold text-slate-600">
                        {exp.startDate} – {exp.endDate}
                      </div>
                      <div className="col-span-3 space-y-1">
                        <div className="font-bold text-slate-900 text-sm">
                          {exp.role} &bull; <span className="font-medium text-slate-700">{exp.company}, {exp.city}</span>
                        </div>
                        <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-1">
                          {exp.tasks.map((task, tIdx) => (
                            <li key={tIdx} className="leading-snug">{task}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ausbildung / Studium (Education) */}
              <div className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3">
                  Ausbildung & Akademischer Werdegang
                </h2>
                <div className="space-y-3">
                  {cv.education.map((edu, idx) => (
                    <div key={idx} className="grid grid-cols-4 gap-4 text-xs">
                      <div className="col-span-1 font-semibold text-slate-600">
                        {edu.startYear} – {edu.endYear}
                      </div>
                      <div className="col-span-3">
                        <div className="font-bold text-slate-900 text-sm">{edu.degree}</div>
                        <div className="text-slate-700">{edu.institution}, {edu.city}</div>
                        <div className="text-slate-500 font-medium mt-0.5">{edu.grade} &bull; Anabin H+ Akzeptiert</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sprachkenntnisse (Languages) & Fachkenntnisse (Skills) */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
                    Sprachkenntnisse (GER / CEFR)
                  </h2>
                  <div className="space-y-1 text-xs">
                    {cv.languages.map((lang, idx) => (
                      <div key={idx} className="flex justify-between py-0.5">
                        <span className="font-semibold text-slate-800">{lang.language}</span>
                        <span className="text-slate-600">{lang.level}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
                    Fachkenntnisse & IT
                  </h2>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {cv.skills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* German Date & Signature Line */}
              <div className="pt-8 border-t border-slate-300 flex justify-between items-end text-xs">
                <div>
                  <p className="text-slate-600">{cv.placeAndDate}</p>
                </div>
                <div className="text-right">
                  <div className="h-8 font-serif italic text-slate-500 flex items-center justify-end">
                    {cv.signatureName}
                  </div>
                  <p className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                    {cv.signatureName}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* EDIT MODE */
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>Personal Data & Contact</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      value={cv.personalInfo.fullName}
                      onChange={(e) => setCv({
                        ...cv,
                        personalInfo: { ...cv.personalInfo, fullName: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-lg bg-white text-black placeholder:text-gray-400 border border-gray-300 text-xs shadow-sm"
                      style={{ color: '#000000' }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Target Role</label>
                    <input
                      type="text"
                      value={cv.targetRole}
                      onChange={(e) => setCv({ ...cv, targetRole: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white text-black placeholder:text-gray-400 border border-gray-300 text-xs shadow-sm"
                      style={{ color: '#000000' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">German Address Format</label>
                  <input
                    type="text"
                    value={cv.personalInfo.address}
                    onChange={(e) => setCv({
                      ...cv,
                      personalInfo: { ...cv.personalInfo, address: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-lg bg-white text-black placeholder:text-gray-400 border border-gray-300 text-xs shadow-sm"
                    style={{ color: '#000000' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Profile Summary</label>
                  <textarea
                    rows={3}
                    value={cv.profileSummary}
                    onChange={(e) => setCv({ ...cv, profileSummary: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white text-black placeholder:text-gray-400 border border-gray-300 text-xs shadow-sm"
                    style={{ color: '#000000' }}
                  />
                </div>
              </div>

              {/* Work Experience Editor */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-amber-400" />
                    <span>Work Experience (Berufserfahrung)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={addWorkExp}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs flex items-center gap-1 border border-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Role</span>
                  </button>
                </div>

                {cv.workExperience.map((exp, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-amber-400">Entry #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeWorkExp(idx)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => {
                          const updatedExp = [...cv.workExperience];
                          updatedExp[idx].role = e.target.value;
                          setCv({ ...cv, workExperience: updatedExp });
                        }}
                        placeholder="Job Title"
                        className="px-2.5 py-1.5 rounded bg-white text-black border border-gray-300 text-xs"
                        style={{ color: '#000000' }}
                      />
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updatedExp = [...cv.workExperience];
                          updatedExp[idx].company = e.target.value;
                          setCv({ ...cv, workExperience: updatedExp });
                        }}
                        placeholder="Company"
                        className="px-2.5 py-1.5 rounded bg-white text-black border border-gray-300 text-xs"
                        style={{ color: '#000000' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Adding German CV boosts Profile Completion by +20%</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs font-semibold shadow-md shadow-red-600/30 transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save & Apply to Dossier</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
