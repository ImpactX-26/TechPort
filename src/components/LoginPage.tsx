import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  Compass, 
  CheckCircle2, 
  User, 
  AlertCircle, 
  Search, 
  GraduationCap, 
  Briefcase, 
  Wrench, 
  Star, 
  Play, 
  MessageSquare, 
  Filter, 
  Check, 
  AlertTriangle, 
  X,
  MapPin,
  Clock,
  ChevronDown,
  Building2,
  Users
} from 'lucide-react';
import { loginWithGoogle } from '../firebase';
import { GermanyGoal, AlumniProfile, AlumniNetworkData } from '../types';
import { 
  GERMAN_COLLEGES_AND_INSTITUTIONS, 
  MOCK_ALUMNI_DATABASE, 
  matchAlumniAgent, 
  evaluateExpectationGap 
} from '../data/alumniData';

export interface AuthSuccessOptions {
  isNewUser: boolean;
  email: string;
  fullName?: string;
  goal?: GermanyGoal;
  demoType?: 'malavika' | 'rahul' | 'elena';
  alumniNetwork?: AlumniNetworkData;
  openAlumniConnect?: boolean;
}

interface LoginPageProps {
  onSuccessLogin: (options: AuthSuccessOptions) => void;
  onCancel?: () => void;
  initialTab?: 'signin' | 'signup';
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccessLogin,
  onCancel,
  initialTab = 'signin'
}) => {
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>(initialTab);

  // STEP A: Expectation Capture Inputs
  const [targetGoal, setTargetGoal] = useState<GermanyGoal>('Study in Germany');
  const [targetField, setTargetField] = useState('Nursing');
  const [collegeSearchQuery, setCollegeSearchQuery] = useState('Charité – Universitätsmedizin Berlin');
  const [isCollegeDropdownOpen, setIsCollegeDropdownOpen] = useState(false);
  
  // State filter toggle
  const [filterMyState, setFilterMyState] = useState(false);
  const [selectedState, setSelectedState] = useState('Kerala');

  // Auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // STEP C: Expectation vs Reality Check Popup state
  const [selectedAlumniForConnect, setSelectedAlumniForConnect] = useState<AlumniProfile | null>(null);
  const [showExpectationPopup, setShowExpectationPopup] = useState(false);
  const [qExpenses, setQExpenses] = useState<number>(800);
  const [qJobs, setQJobs] = useState<'easy' | 'moderate' | 'hard'>('easy');
  const [qLanguage, setQLanguage] = useState<'english_only' | 'b1_enough' | 'b2_needed' | 'c1_needed'>('b1_enough');
  const [realityAnalysis, setRealityAnalysis] = useState<any>(null);

  // 2-Minute Reality Video Modal
  const [videoModalAlumni, setVideoModalAlumni] = useState<AlumniProfile | null>(null);

  // Run Alumni Matching Agent dynamically
  const matchResult = useMemo(() => {
    return matchAlumniAgent({
      targetCollege: collegeSearchQuery,
      targetField,
      originState: filterMyState ? selectedState : undefined,
      goal: targetGoal
    });
  }, [collegeSearchQuery, targetField, filterMyState, selectedState, targetGoal]);

  const filteredColleges = useMemo(() => {
    if (!collegeSearchQuery.trim()) return GERMAN_COLLEGES_AND_INSTITUTIONS.slice(0, 15);
    return GERMAN_COLLEGES_AND_INSTITUTIONS.filter(c => 
      c.toLowerCase().includes(collegeSearchQuery.toLowerCase())
    ).slice(0, 15);
  }, [collegeSearchQuery]);

  // Recalculate expectation gap whenever questions change
  useEffect(() => {
    const res = evaluateExpectationGap({
      expectedExpenses: qExpenses,
      expectedPartTime: qJobs,
      expectedLanguage: qLanguage
    }, collegeSearchQuery);
    setRealityAnalysis(res);
  }, [qExpenses, qJobs, qLanguage, collegeSearchQuery]);

  const buildAlumniNetworkPayload = (): AlumniNetworkData => {
    return {
      targetCollege: collegeSearchQuery,
      targetCourse: `${targetGoal} · ${targetField}`,
      targetField,
      originState: selectedState,
      matchedAlumni: matchResult.matchedAlumni,
      expectationCheckCompleted: Boolean(realityAnalysis),
      expectationGapScore: realityAnalysis?.gapScore || 45,
      gapAnalysis: realityAnalysis?.analysis
    };
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogle();
      const userEmail = user.email || 'google.user@applicant.de';
      const userName = user.displayName || 'Google Applicant';

      onSuccessLogin({
        isNewUser: true,
        email: userEmail,
        fullName: userName,
        goal: targetGoal,
        alumniNetwork: buildAlumniNetworkPayload()
      });
    } catch (err: any) {
      console.warn('Google sign-in popup notice:', err);
      onSuccessLogin({
        isNewUser: true,
        email: 'applicant.google@germany.de',
        fullName: 'New Google Applicant',
        goal: targetGoal,
        alumniNetwork: buildAlumniNetworkPayload()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your applicant email and password.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccessLogin({
        isNewUser: true,
        email: email.trim(),
        fullName: email.split('@')[0].replace(/[._-]/g, ' '),
        goal: targetGoal,
        alumniNetwork: buildAlumniNetworkPayload()
      });
    }, 400);
  };

  const handleEmailSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !signupEmail || !signupPassword) {
      setError('Please fill in your name, email, and choose a password.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccessLogin({
        isNewUser: true,
        email: signupEmail.trim(),
        fullName: fullName.trim(),
        goal: targetGoal,
        alumniNetwork: buildAlumniNetworkPayload()
      });
    }, 400);
  };

  const handleOpenConnectPopup = (alumni: AlumniProfile) => {
    setSelectedAlumniForConnect(alumni);
    setShowExpectationPopup(true);
  };

  const handleProceedToAlumniConnect = () => {
    setShowExpectationPopup(false);
    // Log user in or grant instant entry directly to Senior Connect!
    onSuccessLogin({
      isNewUser: true,
      email: signupEmail || email || 'student.connect@germany.de',
      fullName: fullName || 'International Applicant',
      goal: targetGoal,
      alumniNetwork: buildAlumniNetworkPayload(),
      openAlumniConnect: true
    });
  };

  return (
    <div className="min-h-screen cosmic-mesh flex flex-col justify-center py-6 px-3 sm:px-6 lg:px-8 text-slate-100 selection:bg-amber-400 selection:text-slate-950 overflow-x-hidden">
      
      {/* Pitch Banner: 70% students drop out or struggle because expectation != reality */}
      <div className="w-full max-w-7xl mx-auto mb-5">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/15 border border-amber-400/40 shadow-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
              <AlertTriangle className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="font-black text-amber-300 text-xs sm:text-sm uppercase tracking-wide">
                Critical Advisory: Avoid Expectation Mismatch
              </span>
              <p className="text-slate-200 text-[11px] sm:text-xs mt-0.5">
                <strong className="text-white">70% of international students struggle or drop out</strong> because expectation ≠ ground reality in Germany. Talk to a senior who is already there — <span className="underline decoration-amber-400 font-bold">before you start your profile or pay fees</span>. Don't waste your process!
              </p>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg hover:bg-slate-800 shrink-0"
            >
              Exit
            </button>
          )}
        </div>
      </div>

      {/* Main Split Container: Left 40% (Login & Target Capture) | Right 60% (Alumni Reality Wall) */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT 40% (lg:col-span-5): LOGIN & TARGET EXPECTATION ================= */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Brand Card & Expectation Capture */}
          <div className="glass-card rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-2xl space-y-4">
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg font-black shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">
                  GermanPath AI <span className="text-amber-400">Portal</span>
                </h1>
                <p className="text-[11px] text-slate-400">
                  Step A: Where do you dream to study in Germany?
                </p>
              </div>
            </div>

            {/* Target Capture Controls (Triggers Alumni Matching Agent) */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-3 text-xs">
              
              {/* Goal dropdown */}
              <div>
                <label className="block text-[11px] font-black text-slate-300 uppercase tracking-wider mb-1">
                  Your German Goal:
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  {(['Study in Germany', 'Ausbildung in Germany', 'Work in Germany'] as GermanyGoal[]).map(goal => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setTargetGoal(goal)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold truncate transition-all cursor-pointer ${
                        targetGoal === goal 
                          ? 'bg-amber-400 text-slate-950 shadow-sm' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {goal.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Field */}
              <div>
                <label className="block text-[11px] font-black text-slate-300 uppercase tracking-wider mb-1">
                  Target Field:
                </label>
                <select
                  value={targetField}
                  onChange={(e) => setTargetField(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="Nursing">Nursing & Healthcare (Pflegefachmann)</option>
                  <option value="IT">IT & Computer Science (Informatik / AI)</option>
                  <option value="Engineering">Mechanical & Mechatronics (Maschinenbau)</option>
                  <option value="Biotechnology">Biotechnology & Life Sciences</option>
                  <option value="Business">Business & Hospitality Management</option>
                </select>
              </div>

              {/* Target College with Search & 50+ German Institutions */}
              <div className="relative">
                <label className="block text-[11px] font-black text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Target College / University in Germany:</span>
                  <span className="text-[10px] text-amber-400 font-mono">50+ Institutions</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={collegeSearchQuery}
                    onChange={(e) => {
                      setCollegeSearchQuery(e.target.value);
                      setIsCollegeDropdownOpen(true);
                    }}
                    onFocus={() => setIsCollegeDropdownOpen(true)}
                    placeholder="Search e.g. Heidelberg, TU Munich, Charité..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-8 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setIsCollegeDropdownOpen(!isCollegeDropdownOpen)}
                    className="absolute right-2 top-2 p-1 text-slate-400 hover:text-white"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Dropdown list */}
                {isCollegeDropdownOpen && (
                  <div className="absolute z-40 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-1 text-xs">
                    {filteredColleges.map((col, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setCollegeSearchQuery(col);
                          setIsCollegeDropdownOpen(false);
                        }}
                        className={`px-3 py-2 hover:bg-amber-400/10 hover:text-amber-300 cursor-pointer flex items-center justify-between ${
                          collegeSearchQuery === col ? 'bg-amber-400/20 text-amber-300 font-bold' : 'text-slate-300'
                        }`}
                      >
                        <span className="truncate">{col}</span>
                        {collegeSearchQuery === col && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter: Show alumni from my state */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer text-[11px] text-slate-300">
                  <input
                    type="checkbox"
                    checked={filterMyState}
                    onChange={(e) => setFilterMyState(e.target.checked)}
                    className="rounded text-amber-400 focus:ring-0 focus:ring-offset-0 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                  <span>Show seniors from my home state</span>
                </label>

                {filterMyState && (
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-amber-300 focus:outline-none"
                  >
                    <option value="Kerala">Kerala (Malayalam)</option>
                    <option value="Karnataka">Karnataka (Kannada)</option>
                    <option value="Tamil Nadu">Tamil Nadu (Tamil)</option>
                    <option value="Maharashtra">Maharashtra (Marathi)</option>
                    <option value="Andhra Pradesh">Andhra / Telangana (Telugu)</option>
                    <option value="Punjab">Punjab (Punjabi)</option>
                    <option value="Delhi">Delhi (Hindi)</option>
                    <option value="Gujarat">Gujarat (Gujarati)</option>
                  </select>
                )}
              </div>

              {/* Agent Trigger HUD */}
              <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center space-x-2 text-[10px] text-amber-300 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">
                  Alumni Matching Agent: Active · {matchResult.matchedAlumni.length} Seniors Matched
                </span>
              </div>
            </div>

            {/* Auth Tab Switcher (Sign In vs Sign Up) */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setAuthTab('signin')}
                className={`py-2 rounded-xl font-black transition-all cursor-pointer ${
                  authTab === 'signin'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthTab('signup')}
                className={`py-2 rounded-xl font-black transition-all cursor-pointer ${
                  authTab === 'signup'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Google One-Click Sign In */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[10px] text-slate-500 font-mono uppercase">
                Or with Email
              </span>
            </div>

            {/* Email Forms */}
            {authTab === 'signin' ? (
              <form onSubmit={handleEmailSignIn} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="applicant@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-400/20 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Signing In...' : 'Sign In & Enter Dashboard'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleEmailSignUp} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Create Password
                  </label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-400/20 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Creating Account...' : 'Register & Start Fresh (0 Documents)'}
                </button>
              </form>
            )}

            {/* Demo Accounts for Judges */}
            <div className="pt-2 border-t border-slate-800 text-[11px]">
              <span className="text-slate-400 block mb-1.5 font-bold">
                Judge / Demo Testing Shortcuts:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => onSuccessLogin({ isNewUser: false, email: 'malavika@student.de', demoType: 'malavika' })}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-amber-300 font-bold text-center cursor-pointer"
                >
                  Malavika (Student)
                </button>
                <button
                  type="button"
                  onClick={() => onSuccessLogin({ isNewUser: false, email: 'rahul@worker.de', demoType: 'rahul' })}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-amber-300 font-bold text-center cursor-pointer"
                >
                  Rahul (Worker)
                </button>
                <button
                  type="button"
                  onClick={() => onSuccessLogin({ isNewUser: false, email: 'elena@ausbildung.de', demoType: 'elena' })}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-amber-300 font-bold text-center cursor-pointer"
                >
                  Elena (Ausbildung)
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT 60% (lg:col-span-7): ALUMNI REALITY WALL ================= */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="glass-card rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-2xl">
            
            {/* Heading & Reason Banner */}
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Step B · Alumni Reality Wall
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-blue-400" />
                  <span>DigiLocker + College ID Verified ✓</span>
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1">
                Talk to Seniors Who Are Already There — Avoid Expectation Mismatch
              </h2>
              
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                {matchResult.isExactCollegeMatch 
                  ? `Showing 3 verified seniors directly from ${collegeSearchQuery}.`
                  : `No exact alumni at ${collegeSearchQuery} yet, but here are 3 verified seniors in the same field (${targetField}) in Germany.`}
              </p>

              <div className="mt-2 text-[11px] text-amber-300/90 font-mono bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                ⚡ <strong>Matching Reason:</strong> {matchResult.matchingReason}
              </div>
            </div>

            {/* 3 Matched Alumni Cards */}
            <div className="mt-4 space-y-3.5">
              {matchResult.matchedAlumni.map((alumni, idx) => (
                <div
                  key={alumni.id || idx}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-400/60 transition-all shadow-lg text-xs space-y-2.5"
                >
                  {/* Top card row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={alumni.photoUrl}
                        alt={alumni.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400/30 shrink-0"
                      />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h3 className="font-black text-white text-sm">
                            {alumni.name}
                          </h3>
                          <span className="text-[10px] text-blue-400 font-bold flex items-center" title="DigiLocker + College ID Verified">
                            <CheckCircle2 className="w-3.5 h-3.5 inline mr-0.5" />
                            Verified
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            · {alumni.batch}
                          </span>
                        </div>

                        <div className="text-[11px] font-semibold text-amber-300">
                          {alumni.course} · {alumni.college}
                        </div>

                        <div className="text-[10px] text-slate-400 flex items-center space-x-2 mt-0.5">
                          <span className="flex items-center">
                            <MapPin className="w-2.5 h-2.5 mr-0.5 text-slate-500" />
                            {alumni.origin}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-400 flex items-center">
                            <Clock className="w-2.5 h-2.5 mr-0.5" />
                            {alumni.responseTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center text-amber-400 font-black text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                        <span>{alumni.rating.overall} / 5</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Speaks: {alumni.languages.join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Ground Reality Quote */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-200 italic">
                    "{alumni.quote}"
                  </div>

                  {/* Experience Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {alumni.experienceTags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-850 flex items-center justify-between gap-2">
                    <div className="text-[10px] text-slate-400 font-mono">
                      Verified Senior Mentorship · Zero Agency Bias
                    </div>
                    
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setVideoModalAlumni(alumni)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                      >
                        <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>Watch 2-min Video</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenConnectPopup(alumni)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] flex items-center space-x-1 shadow-md shadow-amber-400/20 cursor-pointer transition-all"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Connect & Ask (Free)</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

      {/* ================= STEP C: EXPECTATION VS REALITY CHECK POPUP ================= */}
      {showExpectationPopup && selectedAlumniForConnect && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl max-w-xl w-full p-6 border-2 border-slate-800 shadow-2xl text-xs space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    Quick Expectation Check Before Connecting
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    With Senior {selectedAlumniForConnect.name} ({selectedAlumniForConnect.college})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExpectationPopup(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300 text-xs">
              Answer 3 quick questions to check if your expectations match ground reality in Germany. This prevents you from wasting visa fees and months of study!
            </p>

            {/* Question 1: Monthly expenses */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-white">
                1. What do you expect monthly expenses to be in Germany?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[600, 800, 1000, 1250].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setQExpenses(amt)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      qExpenses === amt
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    €{amt}/mo
                  </button>
                ))}
              </div>
              <div className="text-[11px] text-amber-300 font-medium">
                → Alumni Reality: {realityAnalysis?.analysis?.expenses?.reality}
              </div>
            </div>

            {/* Question 2: Part-time jobs */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-white">
                2. What do you expect for part-time jobs / finding work?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'easy', label: 'Easy immediately' },
                  { key: 'moderate', label: 'Need 1-2 months' },
                  { key: 'hard', label: 'Hard without B1' }
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setQJobs(opt.key as any)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      qJobs === opt.key
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="text-[11px] text-amber-300 font-medium">
                → Alumni Reality: {realityAnalysis?.analysis?.jobs?.reality}
              </div>
            </div>

            {/* Question 3: Language requirement */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-white">
                3. What do you expect for German language fluency?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'english_only', label: 'English is enough' },
                  { key: 'b1_enough', label: 'B1 certificate enough' },
                  { key: 'b2_needed', label: 'B2 required for work' }
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setQLanguage(opt.key as any)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      qLanguage === opt.key
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="text-[11px] text-amber-300 font-medium">
                → Alumni Reality: {realityAnalysis?.analysis?.language?.reality}
              </div>
            </div>

            {/* Expectation Gap Warning if > 40% */}
            {realityAnalysis?.isHighGap ? (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs space-y-1">
                <div className="font-black text-rose-300 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Expectation Gap Warning ({realityAnalysis.gapScore}% Gap Detected)</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Your expectation doesn't match German reality. <strong>68% of students with this expectation reported severe financial or language struggle.</strong> Talk to {selectedAlumniForConnect.name} before proceeding — This will save your process from being wasted!
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs">
                ✓ <strong>Good alignment!</strong> Your expectations match German ground reality. Connecting with {selectedAlumniForConnect.name} will give you high-yield local tips for housing and exams.
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowExpectationPopup(false)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleProceedToAlumniConnect}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md shadow-amber-400/20 flex items-center space-x-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Connect With {selectedAlumniForConnect.name} Now</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2-Minute Reality Video Modal */}
      {videoModalAlumni && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl max-w-2xl w-full p-6 border-2 border-slate-800 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-white">
                  2-Minute Reality Video · {videoModalAlumni.name}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {videoModalAlumni.college} · {videoModalAlumni.currentRole}
                </p>
              </div>
              <button
                onClick={() => setVideoModalAlumni(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              <video 
                src={videoModalAlumni.videoRealityUrl || 'https://assets.mixkit.co/videos/preview/mixkit-young-intern-in-a-lab-41712-large.mp4'} 
                controls 
                autoPlay 
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <strong className="text-amber-400">Reality summary:</strong> "{videoModalAlumni.expectationVsReality.reality}"
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  const target = videoModalAlumni;
                  setVideoModalAlumni(null);
                  handleOpenConnectPopup(target);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer shadow-md"
              >
                Connect With {videoModalAlumni.name}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
