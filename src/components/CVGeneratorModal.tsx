import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  Printer, 
  Briefcase, 
  GraduationCap, 
  Languages, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { GeneratedCV, ApplicantEntity } from '../types';
import { generateCV } from '../api';

interface CVGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: ApplicantEntity;
}

export const CVGeneratorModal: React.FC<CVGeneratorModalProps> = ({
  isOpen,
  onClose,
  applicant
}) => {
  const [cvData, setCvData] = useState<GeneratedCV | null>(applicant.cv || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await generateCV(applicant.id);
      setCvData(generated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = () => {
    if (!cvData) return;
    const text = `
LEBENSLAUF (GERMAN STANDARD CV)
=====================================
Name: ${cvData.fullName}
Target Path: ${cvData.targetGoal}
Email: ${cvData.contactEmail || ''}

PROFESSIONAL SUMMARY
${cvData.summary}

EDUCATION
${cvData.education.map(e => `- ${e.degree} in ${e.field} | ${e.institution} (${e.year}) ${e.details || ''}`).join('\n')}

EXPERIENCE
${cvData.experience.map(exp => `- ${exp.role} at ${exp.company} (${exp.years} years)\n  ${exp.highlights.join('\n  ')}`).join('\n\n')}

SKILLS
${cvData.skills.join(', ')}

LANGUAGES
${cvData.languages.map(l => `- ${l.language}: ${l.level}`).join('\n')}

VERIFIED BY GERMANPATH AI
${cvData.verifiedDocuments.join(', ')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Specialized Agent
              </span>
              <h2 className="text-lg font-extrabold text-slate-900">
                German Standard Lebenslauf (CV Agent)
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!cvData ? (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Synthesizing Profile...' : 'Generate Professional CV'}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center space-x-1 cursor-pointer"
                  title="Regenerate from updated profile"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>
                <button
                  onClick={handleCopyText}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center space-x-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {!cvData ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-xs">
                <FileText className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-base font-bold text-slate-900">
                  Ready to construct German-format Lebenslauf
                </h3>
                <p className="text-xs text-slate-600">
                  The CV Agent pulls strictly from verified educational credentials and confirmed work history. It does not invent uncorroborated experience.
                </p>
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md inline-flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isGenerating ? 'Synthesizing with Gemini...' : 'Generate Professional CV'}</span>
              </button>
            </div>
          ) : (
            /* CV Document Template */
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl space-y-6 text-slate-800 text-xs shadow-xs">
              
              {/* Header section */}
              <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-950">
                    {cvData.fullName}
                  </h1>
                  <p className="text-xs font-semibold text-blue-700 mt-0.5">
                    Target Path: {cvData.targetGoal}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    {cvData.contactEmail} • Location: Germany Mobility Track
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1.5 self-start sm:self-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>GermanPath Verified</span>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1.5">
                <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Professional Profile Summary
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  {cvData.summary}
                </p>
              </div>

              {/* Education */}
              <div className="space-y-3">
                <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                  <span>Academic Qualifications</span>
                </h2>
                <div className="space-y-2">
                  {cvData.education.map((edu, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 flex items-start justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{edu.degree} in {edu.field}</div>
                        <div className="text-[11px] text-slate-600">{edu.institution}</div>
                        {edu.details && <div className="text-[10px] text-slate-500 mt-0.5">{edu.details}</div>}
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {edu.year}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-3">
                <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                  <span>Professional Experience</span>
                </h2>
                <div className="space-y-2">
                  {cvData.experience.map((exp, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{exp.role}</div>
                          <div className="text-[11px] text-blue-700 font-medium">{exp.company}</div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {exp.years} Years Experience
                        </span>
                      </div>
                      <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                        {exp.highlights.map((h, hIdx) => (
                          <li key={hIdx}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills & Languages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Verified Competencies
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {cvData.skills.map((skill, sIdx) => (
                      <span key={sIdx} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-semibold text-slate-800">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <Languages className="w-3.5 h-3.5 text-slate-500" />
                    <span>Language Proficiencies</span>
                  </h2>
                  <div className="space-y-1">
                    {cvData.languages.map((lang, lIdx) => (
                      <div key={lIdx} className="flex items-center justify-between p-2 rounded bg-white border border-slate-200 text-[11px]">
                        <span className="font-semibold text-slate-800">{lang.language}</span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200 text-[10px]">
                          {lang.level}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Verified Documents Footnote */}
              <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Verified against {cvData.verifiedDocuments.length} authenticated source documents.</span>
                <span>Generated at {new Date(cvData.generatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">
            Strict European standard format (German Lebenslauf)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
