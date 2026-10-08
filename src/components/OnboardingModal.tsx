import React, { useState } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  User, 
  GraduationCap, 
  Briefcase, 
  Languages, 
  Target, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { GermanyGoal, GermanLevel } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  isLoading: boolean;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Personal
    fullName: '',
    country: '',
    age: 24,
    // Step 2: Education
    highestQualification: 'Bachelor Degree',
    fieldOfStudy: 'Computer Science',
    institution: '',
    graduationYear: 2024,
    // Step 3: Experience
    yearsOfExperience: 1,
    recentRole: 'Software Developer',
    skillsInput: 'TypeScript, React, Python',
    // Step 4: German Language
    germanLevel: 'A2' as GermanLevel,
    // Step 5: Goal
    goal: 'Work in Germany' as GermanyGoal
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const skills = formData.skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    await onSubmit({
      ...formData,
      skills,
      age: Number(formData.age),
      graduationYear: Number(formData.graduationYear),
      yearsOfExperience: Number(formData.yearsOfExperience)
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Applicant Onboarding</div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Step {step} of 5: {
                step === 1 ? 'Personal Information' :
                step === 2 ? 'Education Background' :
                step === 3 ? 'Professional Experience' :
                step === 4 ? 'German Language Level' :
                'Your Germany Goal'
              }
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div 
            className="bg-blue-600 h-1.5 transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* STEP 1: PERSONAL INFO */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Maria Gonzalez"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Country of Citizenship *
                  </label>
                  <input
                    type="text"
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="e.g. India, Brazil, Turkey"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    min="16"
                    max="65"
                    required
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: EDUCATION */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Highest Qualification *
                  </label>
                  <select
                    name="highestQualification"
                    value={formData.highestQualification}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="High School Diploma">High School Diploma</option>
                    <option value="Associate Degree / Diploma">Associate Degree / Diploma</option>
                    <option value="Bachelor Degree (B.Tech / B.Sc / B.A)">Bachelor Degree</option>
                    <option value="Master Degree (M.Tech / M.Sc / M.A)">Master Degree</option>
                    <option value="Doctorate / PhD">Doctorate / PhD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Field of Study *
                  </label>
                  <input
                    type="text"
                    name="fieldOfStudy"
                    required
                    value={formData.fieldOfStudy}
                    onChange={handleChange}
                    placeholder="e.g. Mechanical Engineering"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Institution / University *
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="institution"
                    required
                    value={formData.institution}
                    onChange={handleChange}
                    placeholder="e.g. University of São Paulo"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Graduation Year *
                </label>
                <input
                  type="number"
                  name="graduationYear"
                  min="1990"
                  max="2030"
                  required
                  value={formData.graduationYear}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: EXPERIENCE */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    min="0"
                    max="40"
                    required
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Job / Role *
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="recentRole"
                      required
                      value={formData.recentRole}
                      onChange={handleChange}
                      placeholder="e.g. Data Analyst"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Key Skills (comma separated)
                </label>
                <input
                  type="text"
                  name="skillsInput"
                  value={formData.skillsInput}
                  onChange={handleChange}
                  placeholder="e.g. Python, SQL, Tableau, Cloud"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Skills will be cross-checked by the CV and Qualification Agents.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: GERMAN LANGUAGE */}
          {step === 4 && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                German Language Level (CEFR) *
              </label>
              
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  { level: 'Not yet started', desc: 'Zero or beginner' },
                  { level: 'A1', desc: 'Basic phrases' },
                  { level: 'A2', desc: 'Elementary' },
                  { level: 'B1', desc: 'Intermediate' },
                  { level: 'B2', desc: 'Vantage / Fluent' },
                  { level: 'C1', desc: 'Advanced academic' },
                  { level: 'C2', desc: 'Mastery' }
                ].map(item => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, germanLevel: item.level as GermanLevel }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formData.germanLevel === item.level
                        ? 'bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-600 font-semibold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="text-sm font-bold">{item.level}</div>
                    <div className="text-[10px] text-slate-500">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: GOAL */}
          {step === 5 && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Primary Goal in Germany *
              </label>

              {[
                { 
                  id: 'Work in Germany', 
                  title: 'Work in Germany', 
                  desc: 'EU Blue Card, Section 18g Skilled Worker Visa, or Opportunity Card (Chancenkarte)',
                  badge: 'Skilled Employment'
                },
                { 
                  id: 'Study in Germany', 
                  title: 'Study in Germany', 
                  desc: 'Bachelor, Master, or PhD degrees at public & private universities (Uni-Assist & VPD)',
                  badge: 'Higher Education'
                },
                { 
                  id: 'Ausbildung in Germany', 
                  title: 'Ausbildung in Germany', 
                  desc: 'Dual vocational training programs with paid stipends and practical workplace training',
                  badge: 'Vocational Training'
                }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, goal: opt.id as GermanyGoal }))}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-start justify-between ${
                    formData.goal === opt.id
                      ? 'bg-blue-50 border-blue-600 text-blue-950 ring-2 ring-blue-600/30 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-800 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">{opt.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-600">
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{opt.desc}</p>
                  </div>
                  {formData.goal === opt.id && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : <div />}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={step === 1 && !formData.fullName.trim()}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Initializing Agents...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Create Profile & Launch Journey</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
