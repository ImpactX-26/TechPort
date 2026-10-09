import React, { useState, useRef, useEffect } from 'react';
import { 
  GraduationCap, 
  MapPin, 
  Building2, 
  Briefcase, 
  Clock, 
  Euro, 
  Home, 
  BookOpen, 
  DollarSign, 
  ShieldCheck, 
  Send, 
  Sparkles, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  CheckCircle2, 
  MessageSquare, 
  User, 
  Flame, 
  Video, 
  Maximize2,
  ChevronRight,
  Layers,
  HelpCircle,
  Award
} from 'lucide-react';
import { AlumniProfile, AlumniTopicCategory, AlumniChatMessage, Applicant } from '../types.ts';
import { ALUMNI_DATA } from '../data/alumniData.ts';
import { sendAlumniChatMessage } from '../api.ts';

interface AlumniViewProps {
  applicant: Applicant;
  onUpdateApplicant: (updated: Applicant) => void;
}

export const AlumniView: React.FC<AlumniViewProps> = ({
  applicant,
  onUpdateApplicant,
}) => {
  const [selectedAlumniId, setSelectedAlumniId] = useState<string>('aarav-sharma');
  const [activeExperienceTab, setActiveExperienceTab] = useState<AlumniTopicCategory>('living');
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenMessageId, setSpokenMessageId] = useState<string | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<Record<string, AlumniChatMessage[]>>({
    'aarav-sharma': [
      {
        id: 'msg-aarav-init',
        alumniId: 'aarav-sharma',
        sender: 'alumni',
        text: "Hi there! I'm Aarav. I graduated in Computer Science from VTU in India and moved to Berlin on the Opportunity Card (Chancenkarte). I now work as a Senior Full Stack Engineer at Delivery Hero. Click the video above to watch my full journey, or ask me anything about finding a WG flat, real monthly expenses, degree evaluation with ZAB, or tech salaries!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'general',
      },
    ],
    'priya-nair': [
      {
        id: 'msg-priya-init',
        alumniId: 'priya-nair',
        sender: 'alumni',
        text: "Servus! I'm Dr. Priya Nair. I completed my Mechanical Engineering at IIT Madras, then earned my Master's at TU Munich (TUM) with zero tuition fees. Today I'm an Automotive Simulation Specialist at BMW Group under the IG Metall tariff. Feel free to ask me about studying for free at German universities, Munich rent, or student job contracts (Werkstudent)!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'general',
      },
    ],
    'mateo-fernandez': [
      {
        id: 'msg-mateo-init',
        alumniId: 'mateo-fernandez',
        sender: 'alumni',
        text: "Hola! I'm Mateo. I relocated from Buenos Aires directly to Frankfurt with my wife on a skilled worker visa as a Cloud Data Architect. Frankfurt is an incredible financial hub with top expat salaries. Let's chat about direct overseas hiring, family visas with immediate work rights, or tax optimization under Steuerklasse 3 & 5!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'general',
      },
    ],
    'fatima-al-mansoor': [
      {
        id: 'msg-fatima-init',
        alumniId: 'fatima-al-mansoor',
        sender: 'alumni',
        text: "Marhaban! I'm Fatima. I came to Berlin from Cairo as a healthcare nurse and completed my clinical adaptation training at Charité hospital. Living in subsidized hospital accommodation solved the flat hunt completely! Ask me about B2 medical German, license recognition (Anerkennung), or nursing salaries with shift premiums.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'general',
      },
    ],
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const selectedAlumni = ALUMNI_DATA.find((a) => a.id === selectedAlumniId) || ALUMNI_DATA[0];
  const currentAlumniMessages = chatMessages[selectedAlumni.id] || [];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentAlumniMessages]);

  // Handle Speech Synthesis
  const handleToggleSpeak = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking && spokenMessageId === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpokenMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#•]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => {
      setIsSpeaking(false);
      setSpokenMessageId(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpokenMessageId(null);
    };

    setIsSpeaking(true);
    setSpokenMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

    const userMsg: AlumniChatMessage = {
      id: `user-${Date.now()}`,
      alumniId: selectedAlumni.id,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update message state
    setChatMessages((prev) => ({
      ...prev,
      [selectedAlumni.id]: [...(prev[selectedAlumni.id] || []), userMsg],
    }));

    if (!textToSend) {
      setInputMessage('');
    }

    setIsSending(true);

    try {
      const history = (chatMessages[selectedAlumni.id] || []).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const replyText = await sendAlumniChatMessage({
        alumniId: selectedAlumni.id,
        userMessage: text,
        history,
        alumniProfile: selectedAlumni,
      });

      const replyMsg: AlumniChatMessage = {
        id: `alumni-${Date.now()}`,
        alumniId: selectedAlumni.id,
        sender: 'alumni',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => ({
        ...prev,
        [selectedAlumni.id]: [...(prev[selectedAlumni.id] || []), replyMsg],
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>GermanPath Alumni Experience & Mentors</span>
              <span className="px-2 py-0.2 rounded bg-red-600/30 text-red-300 text-[10px] font-extrabold uppercase">
                Interactive Videos & Chat
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Real Alumni Journeys: Living, Costs, Education & Salary
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Watch authentic video stories from successful international professionals who relocated to Germany from diverse college backgrounds and academic branches. Chat with each individual mentor in real time about rent, university admissions, and gross vs. net salaries!
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 shrink-0">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Verified Mentors</div>
              <div className="text-lg font-black text-white">4 Diverse Branches</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Avg. Take-Home</div>
              <div className="text-lg font-black text-emerald-400">€3,900+ Netto/mo</div>
            </div>
          </div>
        </div>
      </div>

      {/* Alumni Selection Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ALUMNI_DATA.map((alumni) => {
          const isSelected = alumni.id === selectedAlumniId;
          const isUserVideoCandidate = alumni.video.youtubeId === 'lel85Ym6xJY';

          return (
            <button
              key={alumni.id}
              type="button"
              onClick={() => setSelectedAlumniId(alumni.id)}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-red-500 shadow-xl shadow-red-950/30 ring-1 ring-red-500'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {isUserVideoCandidate && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-red-600/30 border border-red-500/50 text-red-300 text-[9px] font-black uppercase flex items-center gap-1">
                  <Play className="w-2.5 h-2.5 fill-red-400" />
                  <span>Featured Video</span>
                </div>
              )}

              <div>
                {/* Avatar and basic info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <img
                      src={alumni.avatarUrl}
                      alt={alumni.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 group-hover:border-amber-400 transition-colors"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    </div>
                  </div>

                  <div className="overflow-hidden">
                    <h3 className="text-sm font-bold text-white truncate">{alumni.name}</h3>
                    <p className="text-[11px] text-amber-400 font-semibold truncate">{alumni.title}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-500" />
                      <span className="truncate">{alumni.currentCompany}</span>
                    </p>
                  </div>
                </div>

                {/* Branch & College */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div className="flex items-start gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300 font-medium line-clamp-1">{alumni.branchName}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 pl-5 line-clamp-1">
                    {alumni.collegeName}
                  </div>
                  <div className="flex items-center gap-1.5 pl-5 text-[10px] text-slate-400">
                    <MapPin className="w-3 h-3 text-red-400" />
                    <span>{alumni.currentCity}, Germany &bull; {alumni.yearsInGermany} yrs</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Video className="w-3 h-3 text-amber-400" />
                  <span>{alumni.video.duration} Story</span>
                </span>
                <span className={`text-[11px] font-bold flex items-center gap-0.5 ${
                  isSelected ? 'text-red-400' : 'text-slate-500 group-hover:text-white'
                }`}>
                  <span>{isSelected ? 'Active Profile' : 'Select Mentor'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Mentor Hub: Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: VIDEO PLAYER & EXPERIENCES (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Video Spotlight Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Mentor Video Interview
                </span>
                <h2 className="text-base font-bold text-white mt-0.5">
                  {selectedAlumni.video.title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-semibold">
                  {selectedAlumni.video.duration}
                </span>
              </div>
            </div>

            {/* Video Player Container */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
              {selectedAlumni.video.youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${selectedAlumni.video.youtubeId}?autoplay=${isPlayingVideo ? 1 : 0}&rel=0&modestbranding=1`}
                  title={selectedAlumni.video.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={selectedAlumni.video.previewThumbnail}
                    alt={selectedAlumni.video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6 text-center">
                    <button
                      type="button"
                      onClick={() => setIsVideoModalOpen(true)}
                      className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-xl shadow-red-600/50 hover:scale-105 transition-transform mb-3"
                    >
                      <Play className="w-7 h-7 fill-white ml-1" />
                    </button>
                    <p className="text-xs text-white font-semibold">Click to watch full experience breakdown</p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Chapters & Clickable Topics */}
            <div className="p-5 bg-slate-950/70 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Interactive Video Chapters (Click to explore & ask)</span>
                </div>
                <span className="text-[10px] text-slate-500">Jump to topic</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedAlumni.video.chapters.map((ch, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveExperienceTab(ch.topic);
                      handleSendMessage(`Can you explain more about ${ch.title}?`);
                    }}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all group flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded">
                          {ch.time}
                        </span>
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-white line-clamp-1">
                          {ch.title}
                        </span>
                      </div>
                      {ch.summary && (
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                          {ch.summary}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 shrink-0 mt-1 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Deep-Dive Experience Breakdown Tabs */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            {/* Tabs Header */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{selectedAlumni.name}'s Experience Breakdown</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  {selectedAlumni.currentCity} &bull; {selectedAlumni.pathway}
                </span>
              </div>

              <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveExperienceTab('living')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    activeExperienceTab === 'living'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>🏠 Living & Housing</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveExperienceTab('expense')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    activeExperienceTab === 'expense'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Euro className="w-3.5 h-3.5" />
                  <span>💶 Monthly Expenses</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveExperienceTab('education')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    activeExperienceTab === 'education'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>🎓 Education & ZAB</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveExperienceTab('salary')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    activeExperienceTab === 'salary'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>💰 Salary & Taxes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveExperienceTab('visa')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    activeExperienceTab === 'visa'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>📋 Visa & PR</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT: LIVING */}
            {activeExperienceTab === 'living' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400">Neighborhood & Flat Type</span>
                    <span className="text-amber-400 font-bold">{selectedAlumni.experience.living.neighborhood}</span>
                  </div>
                  <p className="text-xs text-white font-medium">
                    {selectedAlumni.experience.living.apartmentType}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Time to secure accommodation: ~{selectedAlumni.experience.living.findingTimeWeeks} weeks</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Official Registration (Anmeldung) Advice</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedAlumni.experience.living.anmeldungTips}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="font-bold text-emerald-400 flex items-center gap-1">
                      <span>✓ Lifestyle Highlights</span>
                    </div>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      {selectedAlumni.experience.living.lifestylePros.map((pro, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 shrink-0">&bull;</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="font-bold text-red-400 flex items-center gap-1">
                      <span>! Real Challenges</span>
                    </div>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      {selectedAlumni.experience.living.lifestyleChallenges.map((ch, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-red-400 shrink-0">&bull;</span>
                          <span>{ch}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: EXPENSES */}
            {activeExperienceTab === 'expense' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400">Warm Rent</div>
                    <div className="text-base font-black text-amber-400">€{selectedAlumni.experience.expenses.rentWarm}</div>
                    <div className="text-[9px] text-slate-500">Heating included</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400">Groceries</div>
                    <div className="text-base font-black text-white">€{selectedAlumni.experience.expenses.groceries}</div>
                    <div className="text-[9px] text-slate-500">Lidl & Rewe</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400">Deutschlandticket</div>
                    <div className="text-base font-black text-blue-400">€{selectedAlumni.experience.expenses.transport}</div>
                    <div className="text-[9px] text-slate-500">All local transit</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400">Total Monthly</div>
                    <div className="text-base font-black text-red-400">€{selectedAlumni.experience.expenses.monthlyTotal}</div>
                    <div className="text-[9px] text-slate-500">Cost of living</div>
                  </div>
                </div>

                {/* Savings Banner */}
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-emerald-300">Estimated Monthly Savings Potential</div>
                    <div className="text-xl font-black text-emerald-400">
                      ~€{selectedAlumni.experience.expenses.savingsPerMonth.toLocaleString()} / month
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    High Net Savings
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-amber-400">💡 Practical Budgeting Tip</div>
                  <p>{selectedAlumni.experience.expenses.budgetingTip}</p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: EDUCATION */}
            {activeExperienceTab === 'education' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-slate-400 uppercase font-semibold">Degree & Institution</div>
                      <h4 className="text-sm font-bold text-white mt-0.5">
                        {selectedAlumni.experience.education.degree}
                      </h4>
                      <p className="text-xs text-amber-400 font-medium">
                        {selectedAlumni.experience.education.university}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-950 border border-blue-800 text-blue-300 text-[10px] font-bold shrink-0">
                      {selectedAlumni.experience.education.recognitionBody}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-400">Tuition Fee: </span>
                      <span className="font-bold text-emerald-400">
                        {selectedAlumni.experience.education.tuitionPerSemester === 0
                          ? '€0 (No Tuition at State Unis)'
                          : `€${selectedAlumni.experience.education.tuitionPerSemester}/semester`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Medium: </span>
                      <span className="font-bold text-white">{selectedAlumni.experience.education.languageMedium}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 text-xs text-slate-200 space-y-1">
                  <div className="font-bold text-blue-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Degree Recognition Advice (ZAB & Anabin)</span>
                  </div>
                  <p className="leading-relaxed">{selectedAlumni.experience.education.keyAdvice}</p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SALARY */}
            {activeExperienceTab === 'salary' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="text-xs text-slate-400 font-semibold">Gross Annual (Brutto im Jahr)</div>
                    <div className="text-2xl font-black text-amber-400 mt-1">
                      €{selectedAlumni.experience.salary.grossAnnual.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {selectedAlumni.experience.salary.tariffGroup || 'Standard contract'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="text-xs text-slate-400 font-semibold">Monthly Net Take-Home (Netto)</div>
                    <div className="text-2xl font-black text-emerald-400 mt-1">
                      €{selectedAlumni.experience.salary.netMonthly.toLocaleString()} / mo
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Under {selectedAlumni.experience.salary.taxClass}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-white">Contract Benefits & Perks</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAlumni.experience.salary.benefits.map((b, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-medium">
                        ✓ {b}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                  <div className="font-bold text-amber-300">💼 Negotiation Golden Rule</div>
                  <p>{selectedAlumni.experience.salary.negotiationTip}</p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: VISA */}
            {activeExperienceTab === 'visa' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-slate-400">Entry Visa</div>
                    <div className="font-bold text-white">{selectedAlumni.experience.visa.initialVisa}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-slate-400">Current Residence Title</div>
                    <div className="font-bold text-emerald-400">{selectedAlumni.experience.visa.currentPermit}</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Timeline to Permanent Residency (PR)</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {selectedAlumni.experience.visa.timeToPermanentResidencyYears} Years
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {selectedAlumni.experience.visa.requiredGermanLevel}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE CHAT WITH ALUMNI (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col h-full space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl flex-1 flex flex-col shadow-2xl overflow-hidden min-h-[640px]">
            {/* Chat Header with Mentor Status */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={selectedAlumni.avatarUrl}
                    alt={selectedAlumni.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-amber-400/50"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{selectedAlumni.name}</h3>
                    <span className="px-2 py-0.2 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-bold">
                      Online Mentor
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {selectedAlumni.title} &bull; {selectedAlumni.currentCity}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-amber-400 font-bold">
                  DE {selectedAlumni.germanLevel}
                </span>
              </div>
            </div>

            {/* Quick Suggested Prompt Pills */}
            <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto flex gap-1.5 scrollbar-none">
              {selectedAlumni.sampleQuestions.map((sq, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(sq.question)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3 h-3 text-amber-400" />
                  <span>{sq.question}</span>
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 space-y-3.5 overflow-y-auto max-h-[460px]">
              {currentAlumniMessages.map((msg) => {
                const isAlumni = msg.sender === 'alumni';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAlumni ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-500">
                      <span>{isAlumni ? selectedAlumni.name : 'You'}</span>
                      <span>&bull;</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed relative group ${
                        isAlumni
                          ? 'bg-slate-950 border border-slate-800/90 text-slate-200 rounded-tl-sm'
                          : 'bg-red-600 text-white rounded-tr-sm shadow-md'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>

                      {/* Text-To-Speech Button on Alumni Messages */}
                      {isAlumni && (
                        <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                          <button
                            type="button"
                            onClick={() => handleToggleSpeak(msg.text, msg.id)}
                            className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors"
                          >
                            {isSpeaking && spokenMessageId === msg.id ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                                <span className="text-amber-400 font-semibold">Stop Speaking</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Listen to Voice</span>
                              </>
                            )}
                          </button>
                          <span className="text-[9px] text-slate-500 font-mono">
                            {selectedAlumni.currentCity} Mentor
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isSending && (
                <div className="flex items-start gap-2 text-xs text-slate-400">
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 flex items-center gap-2">
                    <span className="animate-pulse">{selectedAlumni.name} is typing...</span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask ${selectedAlumni.name.split(' ')[0]} about living, expenses, education, or salary...`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
              />
              <button
                type="submit"
                disabled={isSending || !inputMessage.trim()}
                className="p-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold transition-all shadow-md shadow-red-600/30 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
