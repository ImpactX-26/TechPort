import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Star, 
  Send, 
  Calendar, 
  Video, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  AlertTriangle, 
  MessageSquare, 
  ThumbsUp, 
  ChevronRight, 
  MapPin, 
  Languages, 
  Check, 
  X,
  Play
} from 'lucide-react';
import { AlumniProfile } from '../types';
import { MOCK_ALUMNI_DATABASE } from '../data/alumniData';
import { sendAlumniChatMessage } from '../api';

interface AlumniConnectPageProps {
  initialAlumniId?: string;
  applicantTargetCollege?: string;
  applicantName?: string;
  onClose?: () => void;
}

export const AlumniConnectPage: React.FC<AlumniConnectPageProps> = ({
  initialAlumniId,
  applicantTargetCollege,
  applicantName = 'Junior Applicant',
  onClose
}) => {
  const [selectedAlumniId, setSelectedAlumniId] = useState<string>(
    initialAlumniId || MOCK_ALUMNI_DATABASE[0].id
  );
  
  const currentAlumni = MOCK_ALUMNI_DATABASE.find(a => a.id === selectedAlumniId) || MOCK_ALUMNI_DATABASE[0];

  // Chat state
  const [messages, setMessages] = useState<Array<{
    id: string;
    sender: 'junior' | 'senior';
    text: string;
    timestamp: string;
  }>>([
    {
      id: 'm1',
      sender: 'senior',
      text: `Hallo ${applicantName}! I am ${currentAlumni.name} from ${currentAlumni.originState}. I am currently doing ${currentAlumni.course} at ${currentAlumni.college}. Ask me anything about ground realities, hostel rents, or German language struggles before you spend money on applications!`,
      timestamp: 'Just now'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Calendly Video Call Booking Modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookedDate, setBookedDate] = useState('Tomorrow, 18:30 CET (23:00 IST)');
  const [callTopic, setCallTopic] = useState('Hostel, Part-time jobs & German reality check');
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);

  // Reality Score Rating state
  const [realityRating, setRealityRating] = useState<number | null>(null);
  const [realityFeedback, setRealityFeedback] = useState<string | null>(null);
  const [hasRated, setHasRated] = useState(false);

  // Reality Video Modal state
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Handle Senior Switch
  const handleSelectSenior = (alumni: AlumniProfile) => {
    setSelectedAlumniId(alumni.id);
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'senior',
        text: `Namaskara / Hallo! I am ${alumni.name} (${alumni.batch}) at ${alumni.college}. Here to share unfiltered ground facts so you avoid common traps. What is on your mind?`,
        timestamp: 'Just now'
      }
    ]);
    setHasRated(false);
    setRealityRating(null);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const juniorMsg = {
      id: `msg-${Date.now()}`,
      sender: 'junior' as const,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, juniorMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const history = messages.map(m => ({
        sender: m.sender === 'junior' ? applicantName : currentAlumni.name,
        text: m.text
      }));

      const res = await sendAlumniChatMessage({
        seniorId: currentAlumni.id,
        seniorName: currentAlumni.name,
        seniorCollege: currentAlumni.college,
        seniorRole: currentAlumni.currentRole,
        message: text,
        chatHistory: history
      });

      const seniorReply = {
        id: `reply-${Date.now()}`,
        sender: 'senior' as const,
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, seniorReply]);
    } catch (err) {
      console.warn('Chat request failed, using instant persona fallback:', err);
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: `reply-${Date.now()}`,
            sender: 'senior' as const,
            text: `Regarding that: ${currentAlumni.expectationVsReality.reality} My biggest tip: ${currentAlumni.expectationVsReality.tip}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 500);
    } finally {
      setIsSending(false);
    }
  };

  const quickQuestions = [
    'Anna, how is the hostel and rent situation in reality?',
    'Is the monthly stipend or blocked account truly enough?',
    'How hard is the German language during daily hospital/lectures?',
    'How many months did it take to get a part-time job?'
  ];

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBookingSuccess(true);
    setTimeout(() => {
      setShowBookingModal(false);
      setIsBookingSuccess(false);
      setMessages(prev => [
        ...prev,
        {
          id: `book-${Date.now()}`,
          sender: 'senior',
          text: `Awesome! I just confirmed our 15-minute 1-on-1 video call for ${bookedDate}. Google Meet invitation sent to your email. See you then!`,
          timestamp: 'Just now'
        }
      ]);
    }, 1500);
  };

  const handleRateReality = (stars: number, feedback: string) => {
    setRealityRating(stars);
    setRealityFeedback(feedback);
    setHasRated(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-100">
      
      {/* Top Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Senior-Junior Connect & Reality Engine</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                <span>Verified via DigiLocker + College ID</span>
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
              Talk to Seniors In Germany — <span className="text-amber-400">Zero Expectation Mismatch</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mt-1">
              Connect directly with seniors who came from your state and are studying or working at your target German institution. Get uncensored facts on rents, stipends, and exams before you pay agent fees.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setShowBookingModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-400/20 flex items-center space-x-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book 15-Min Video Call (Free)</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Senior List (35%), Right Chat & Reality Hub (65%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Seniors Carousel / Directory (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center space-x-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Verified German Seniors</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              10 Verified Seniors Active
            </span>
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {MOCK_ALUMNI_DATABASE.map(alumni => {
              const isSelected = alumni.id === selectedAlumniId;
              return (
                <div
                  key={alumni.id}
                  onClick={() => handleSelectSenior(alumni)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900/90 border-amber-400/80 shadow-lg shadow-amber-400/10 ring-1 ring-amber-400/30'
                      : 'glass-card border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <img 
                      src={alumni.photoUrl} 
                      alt={alumni.name} 
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-white truncate flex items-center space-x-1">
                          <span>{alumni.name}</span>
                          <span title="Verified Alumni via DigiLocker + College ID">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 inline" />
                          </span>
                        </h3>
                        <span className="text-[10px] font-bold text-amber-400 flex items-center">
                          <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                          {alumni.rating.overall}
                        </span>
                      </div>
                      
                      <div className="text-[11px] text-amber-300 font-medium truncate mt-0.5">
                        {alumni.course}
                      </div>

                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {alumni.college}
                      </div>

                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1.5">
                        <span className="flex items-center">
                          <MapPin className="w-2.5 h-2.5 mr-0.5 text-slate-500" />
                          {alumni.originState}
                        </span>
                        <span>•</span>
                        <span className="text-slate-400 truncate">
                          Speaks: {alumni.languages[0]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quote preview */}
                  <div className="mt-2.5 p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[10px] text-slate-300 italic line-clamp-2">
                    "{alumni.quote}"
                  </div>

                  {/* Active indicator bar */}
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Senior Chat & Reality Dossier (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Senior Profile Summary Card */}
          <div className="glass-card rounded-3xl p-5 border border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <img 
                  src={currentAlumni.photoUrl} 
                  alt={currentAlumni.name} 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400/40 shadow-md shrink-0" 
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-black text-white">
                      {currentAlumni.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30 flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3 text-blue-400" />
                      <span>Verified Alumni ✓</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30">
                      {currentAlumni.batch}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-200 mt-0.5">
                    {currentAlumni.currentRole}
                  </p>

                  <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>{currentAlumni.college}</span>
                    <span>•</span>
                    <span className="text-amber-300 font-medium">{currentAlumni.origin}</span>
                    <span>•</span>
                    <span className="flex items-center text-emerald-400">
                      <Clock className="w-3 h-3 mr-1" />
                      {currentAlumni.responseTime}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>2-Min Reality Video</span>
                </button>
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-400/20 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Call</span>
                </button>
              </div>
            </div>

            {/* Reality vs Expectation Snapshot Accordion / Card */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/20">
                <div className="text-[10px] font-black uppercase tracking-wider text-rose-400 font-mono">
                  ❌ What I Expected Before Flying
                </div>
                <p className="text-slate-300 text-[11px] mt-1">
                  "{currentAlumni.expectationVsReality.expected}"
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
                <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400 font-mono">
                  ✓ Ground Reality in Germany
                </div>
                <p className="text-slate-300 text-[11px] mt-1">
                  "{currentAlumni.expectationVsReality.reality}"
                </p>
              </div>
            </div>

            {/* Practical Senior Tip Banner */}
            <div className="mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-2 text-xs">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-amber-200 text-[11px]">
                <strong className="text-white">Senior Tip from {currentAlumni.name}:</strong> {currentAlumni.expectationVsReality.tip}
              </p>
            </div>
          </div>

          {/* Interactive Chat Window */}
          <div className="glass-card rounded-3xl border border-slate-800 flex flex-col h-[460px] overflow-hidden shadow-2xl">
            
            {/* Chat Header */}
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white">
                  Direct Q&A with {currentAlumni.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  (Simulated Persona AI / Ground Verified)
                </span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center space-x-2">
                <span>Languages: {currentAlumni.languages.join(', ')}</span>
              </div>
            </div>

            {/* Chat Messages Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {messages.map(m => {
                const isSenior = m.sender === 'senior';
                return (
                  <div 
                    key={m.id} 
                    className={`flex items-start space-x-2.5 ${isSenior ? 'justify-start' : 'justify-end'}`}
                  >
                    {isSenior && (
                      <img 
                        src={currentAlumni.photoUrl} 
                        alt={currentAlumni.name} 
                        className="w-7 h-7 rounded-xl object-cover shrink-0 mt-0.5 border border-slate-700" 
                      />
                    )}
                    <div 
                      className={`p-3.5 rounded-2xl max-w-md ${
                        isSenior 
                          ? 'bg-slate-900 border border-slate-800 text-slate-200' 
                          : 'bg-amber-400 text-slate-950 font-medium rounded-tr-none'
                      }`}
                    >
                      <div className="text-[10px] font-bold opacity-60 mb-0.5">
                        {isSenior ? currentAlumni.name : applicantName} • {m.timestamp}
                      </div>
                      <p className="text-[12px] leading-relaxed">
                        {m.text}
                      </p>
                    </div>
                  </div>
                );
              })}

              {isSending && (
                <div className="flex items-center space-x-2 text-slate-400 text-xs pl-9">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span>{currentAlumni.name} is typing senior guidance...</span>
                </div>
              )}
            </div>

            {/* Quick Prompts For Judges/Users */}
            <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40 flex items-center space-x-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">
                Quick Ask:
              </span>
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] border border-slate-800 whitespace-nowrap transition-colors cursor-pointer shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask ${currentAlumni.name} about hostels, exams, fees, language...`}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-400/20 disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>

          {/* Reality Score Rating Widget */}
          <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-bold text-white flex items-center space-x-1.5">
                <ThumbsUp className="w-4 h-4 text-amber-400" />
                <span>Rate This Senior's Reality Check</span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Did this reality check prevent an expectation mismatch? Your rating guides future students.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {!hasRated ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleRateReality(5, 'Eye-opener! Saved me from making costly mistakes.')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition-colors cursor-pointer"
                  >
                    ⭐ Eye-Opener (5/5)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRateReality(4, 'Very helpful and realistic ground advice.')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    👍 Helpful (4/5)
                  </button>
                </>
              ) : (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-1.5">
                  <Check className="w-4 h-4" />
                  <span>Reality Score Recorded ({realityRating}/5 Stars)!</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 15-Minute Video Call Modal (Calendly Mock) */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl max-w-lg w-full p-6 border-2 border-slate-800 shadow-2xl text-xs space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    Book 15-Min Reality Call with {currentAlumni.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Free for first call · 1-on-1 via Google Meet
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isBookingSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <div className="font-black text-white text-base">Video Call Confirmed!</div>
                <p className="text-slate-300 text-xs max-w-xs mx-auto">
                  Invitation and Google Meet link sent. {currentAlumni.name} will meet you at {bookedDate}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Select Convenient Time Slot (Germany & India friendly)
                  </label>
                  <select
                    value={bookedDate}
                    onChange={(e) => setBookedDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Tomorrow, 18:30 CET (23:00 IST)">Tomorrow, 18:30 CET (23:00 IST) - 1 Slot Left</option>
                    <option value="Saturday, 14:00 CET (18:30 IST)">Saturday, 14:00 CET (18:30 IST) - Available</option>
                    <option value="Sunday, 16:00 CET (20:30 IST)">Sunday, 16:00 CET (20:30 IST) - Available</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Primary Discussion Focus
                  </label>
                  <input
                    type="text"
                    value={callTopic}
                    onChange={(e) => setCallTopic(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div className="font-bold text-white flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Honor Code Guarantee:</span>
                  </div>
                  <p>
                    Verified seniors do not sell admissions or charge consulting fees. They provide ground honesty to prevent dropouts and financial struggle.
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md shadow-amber-400/20"
                  >
                    Confirm Booking (Free)
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2-Minute Reality Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl max-w-2xl w-full p-6 border-2 border-slate-800 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-white flex items-center space-x-2">
                  <span>2-Min Unfiltered Reality Video · {currentAlumni.name}</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {currentAlumni.college} · {currentAlumni.course}
                </p>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              <video 
                src={currentAlumni.videoRealityUrl || 'https://assets.mixkit.co/videos/preview/mixkit-young-intern-in-a-lab-41712-large.mp4'} 
                controls 
                autoPlay 
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <strong className="text-amber-400">Key takeaway from video:</strong> "{currentAlumni.expectationVsReality.reality}"
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
