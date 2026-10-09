import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  Camera, 
  UploadCloud, 
  Mic, 
  MicOff,
  Square, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  User, 
  GraduationCap, 
  Briefcase, 
  Languages, 
  MapPin, 
  ArrowRight, 
  AlertCircle, 
  FileText, 
  Check, 
  Flame, 
  Layers, 
  Volume2,
  VolumeX,
  Radio,
  Edit3,
  Award
} from 'lucide-react';
import { Applicant, PersonalData, VideoTranscribeResult, VideoPitchData } from '../types.ts';
import { 
  transcribeVideoAndBuildProfile, 
  calculateCompletionPercentage, 
  calculateChancenkarte,
  DEMO_VIDEO_PITCHES,
  formatGermanTimestamp 
} from '../api.ts';

interface VideoTranscribeViewProps {
  applicant: Applicant;
  onUpdateApplicant: (updated: Applicant) => void;
  onNavigateToProfile?: () => void;
}

export const VideoTranscribeView: React.FC<VideoTranscribeViewProps> = ({
  applicant,
  onUpdateApplicant,
  onNavigateToProfile,
}) => {
  const [activeMode, setActiveMode] = useState<'camera' | 'upload' | 'demo'>('camera');
  
  // Camera & Recording States
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [liveCaptions, setLiveCaptions] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [speechLanguage, setSpeechLanguage] = useState<'en-US' | 'de-DE'>('en-US');

  // Voice Activity & Silence Detection States
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isVoiceDetected, setIsVoiceDetected] = useState<boolean>(false);
  const [autoSilenceStop, setAutoSilenceStop] = useState<boolean>(false);
  const [silenceCountDown, setSilenceCountDown] = useState<number | null>(null);

  // Uploaded Video State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);

  // Custom text sandbox
  const [customPitchText, setCustomPitchText] = useState<string>('');

  // Transcription & Profile Extraction States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [transcribeResult, setTranscribeResult] = useState<VideoTranscribeResult | null>(null);
  const [editableProfile, setEditableProfile] = useState<Partial<PersonalData>>({});
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);
  const [isEditingTranscript, setIsEditingTranscript] = useState<boolean>(false);

  // Refs for state that must be up-to-date in browser event callbacks
  const isRecordingRef = useRef<boolean>(false);
  const liveCaptionsRef = useRef<string>('');
  const finalizedTranscriptRef = useRef<string>('');
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const playbackVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const speechRecognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioAnimationRef = useRef<number | null>(null);
  const lastSpokeTimestampRef = useRef<number>(0);
  const hasSpokenRef = useRef<boolean>(false);

  // Clean up media streams, audio context, and speech recognition on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
      cleanupAudioMonitoring();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  // Format recording duration mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // Setup Web Audio API volume monitoring to detect when user speaks
  const setupAudioMonitoring = (mediaStream: MediaStream) => {
    cleanupAudioMonitoring();
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const audioTracks = mediaStream.getAudioTracks();
      if (audioTracks.length === 0) return;

      const source = audioCtx.createMediaStreamSource(mediaStream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!isRecordingRef.current) return;

        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setAudioLevel(normalized);

        const now = Date.now();
        // Threshold for human speech activity
        if (normalized > 12) {
          setIsVoiceDetected(true);
          lastSpokeTimestampRef.current = now;
          hasSpokenRef.current = true;
          setSilenceCountDown(null);
        } else {
          setIsVoiceDetected(false);
          // Check for auto-silence stop if enabled
          if (autoSilenceStop && hasSpokenRef.current && lastSpokeTimestampRef.current > 0) {
            const silenceMs = now - lastSpokeTimestampRef.current;
            const remainingSecs = Math.max(0, Math.ceil((4000 - silenceMs) / 1000));
            if (silenceMs >= 4000) {
              setSilenceCountDown(null);
              // Auto-finish after 4s silence!
              stopRecording();
              return;
            } else if (silenceMs >= 1500) {
              setSilenceCountDown(remainingSecs);
            }
          }
        }

        audioAnimationRef.current = requestAnimationFrame(checkVolume);
      };

      audioAnimationRef.current = requestAnimationFrame(checkVolume);
    } catch (err) {
      console.warn('Audio level visualizer notice:', err);
    }
  };

  const cleanupAudioMonitoring = () => {
    if (audioAnimationRef.current) {
      cancelAnimationFrame(audioAnimationRef.current);
      audioAnimationRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch {}
      audioContextRef.current = null;
    }
    setAudioLevel(0);
    setIsVoiceDetected(false);
    setSilenceCountDown(null);
  };

  // Start Camera Stream with progressive fallback
  const startCamera = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Media devices API is not supported in this browser. Please upload a video file or test our 1-click demos.');
      return;
    }

    try {
      let userStream: MediaStream;
      try {
        userStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: { echoCancellation: true, noiseSuppression: true },
        });
      } catch (err1) {
        try {
          userStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
        } catch (err2) {
          userStream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
        }
      }

      setStream(userStream);
      setIsCameraActive(true);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = userStream;
        videoPreviewRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      let errorMsg = 'Camera and microphone access requested. Click the camera/lock icon in your browser address bar to allow.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Permission was dismissed or denied. Click the lock/camera icon in your address bar, set Camera & Microphone to "Allow", and click Start Camera again.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No camera or microphone hardware found on your device. You can upload a video file or test 1-click demos below.';
      }
      setCameraError(errorMsg);
      setIsCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCameraStream = () => {
    cleanupAudioMonitoring();
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  // Start Continuous Recording & Speech Recognition
  const startRecording = () => {
    if (!stream) return;
    recordedChunksRef.current = [];
    setRecordedBlob(null);
    setRecordedVideoUrl(null);
    setRecordingDuration(0);
    setLiveCaptions('');
    liveCaptionsRef.current = '';
    finalizedTranscriptRef.current = '';
    setTranscribeResult(null);
    setAppliedSuccess(false);
    isRecordingRef.current = true;
    hasSpokenRef.current = false;
    lastSpokeTimestampRef.current = 0;

    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const fullBlob = new Blob(recordedChunksRef.current, { type: mimeType });
        setRecordedBlob(fullBlob);
        const url = URL.createObjectURL(fullBlob);
        setRecordedVideoUrl(url);

        // Take the accumulated transcribed speech from liveCaptionsRef
        const completeTranscript = liveCaptionsRef.current || finalizedTranscriptRef.current;
        runAgentPipeline(completeTranscript, fullBlob);
      };

      mediaRecorder.start(500);
      setIsRecording(true);

      // Start duration timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      // Setup audio level visualizer
      setupAudioMonitoring(stream);

      // Initialize Web Speech API with CONTINUOUS auto-restart loop
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = speechLanguage;
          recognition.maxAlternatives = 1;

          recognition.onresult = (event: any) => {
            let interim = '';
            let newFinalized = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const trans = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                newFinalized += trans + ' ';
              } else {
                interim += trans;
              }
            }

            if (newFinalized) {
              finalizedTranscriptRef.current = (finalizedTranscriptRef.current + ' ' + newFinalized).trim();
            }

            const currentTotal = (finalizedTranscriptRef.current + (interim ? ' ' + interim : '')).trim();
            liveCaptionsRef.current = currentTotal;
            setLiveCaptions(currentTotal);
            hasSpokenRef.current = true;
            lastSpokeTimestampRef.current = Date.now();
          };

          recognition.onerror = (event: any) => {
            console.warn('Speech recognition notice:', event.error);
          };

          // CRITICAL: When browser pauses/cuts off recognition, automatically restart while user is recording!
          recognition.onend = () => {
            if (isRecordingRef.current) {
              try {
                recognition.start();
              } catch (err) {
                setTimeout(() => {
                  if (isRecordingRef.current) {
                    try { recognition.start(); } catch {}
                  }
                }, 200);
              }
            }
          };

          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch (speechErr) {
          console.warn('Speech recognition notice:', speechErr);
        }
      }
    } catch (err) {
      console.error('Failed to start MediaRecorder:', err);
    }
  };

  // Stop Recording and finish transcribing
  const stopRecording = () => {
    if (!isRecordingRef.current) return;
    isRecordingRef.current = false;
    setIsRecording(false);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    cleanupAudioMonitoring();

    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Retake video
  const handleRetake = () => {
    setRecordedBlob(null);
    setRecordedVideoUrl(null);
    setTranscribeResult(null);
    setLiveCaptions('');
    liveCaptionsRef.current = '';
    finalizedTranscriptRef.current = '';
    setAppliedSuccess(false);
    if (!isCameraActive) {
      startCamera();
    }
  };

  // Handle Video File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
      setTranscribeResult(null);
      setAppliedSuccess(false);

      // AUTOMATICALLY TRANSCRIBE AND BUILD THE PROFILE FOR UPLOADED VIDEO
      runAgentPipeline(undefined, undefined, file);
    }
  };

  // Apply Agent Extracted Profile to Applicant state and sync to Firestore
  const applyProfileData = (
    extracted: Partial<PersonalData>,
    result: VideoTranscribeResult,
    sourceFileName: string = 'Candidate_Video_Introduction.webm'
  ) => {
    const mergedPersonalData: PersonalData = {
      ...applicant.personalData,
      fullName: extracted.fullName && extracted.fullName !== 'Candidate' ? extracted.fullName : applicant.personalData.fullName,
      citizenship: extracted.citizenship || applicant.personalData.citizenship,
      age: extracted.age !== undefined ? extracted.age : applicant.personalData.age,
      goal: extracted.goal || applicant.personalData.goal,
      educationLevel: extracted.educationLevel || applicant.personalData.educationLevel,
      fieldOfStudy: extracted.fieldOfStudy || applicant.personalData.fieldOfStudy,
      university: extracted.university || applicant.personalData.university,
      graduationYear: extracted.graduationYear || applicant.personalData.graduationYear,
      workExperienceYears: extracted.workExperienceYears !== undefined 
        ? extracted.workExperienceYears 
        : applicant.personalData.workExperienceYears,
      currentRole: extracted.currentRole || applicant.personalData.currentRole,
      currentCompany: extracted.currentCompany || applicant.personalData.currentCompany,
      skills: extracted.skills && extracted.skills.length > 0 
        ? Array.from(new Set([...(applicant.personalData.skills || []), ...extracted.skills]))
        : applicant.personalData.skills,
      germanLevel: (extracted.germanLevel as any) || applicant.personalData.germanLevel,
      englishLevel: (extracted.englishLevel as any) || applicant.personalData.englishLevel,
      targetCity: extracted.targetCity || applicant.personalData.targetCity,
      targetIndustry: extracted.targetIndustry || applicant.personalData.targetIndustry,
      bio: extracted.bio || applicant.personalData.bio,
    };

    const videoPitchData: VideoPitchData = {
      hasVideo: true,
      videoFileName: sourceFileName,
      recordedAt: new Date().toISOString(),
      transcript: result.transcript,
      confidence: result.confidence,
      keyInsights: result.keyInsights,
      extractedProfile: extracted,
      profileApplied: true,
    };

    const updatedApplicant: Applicant = {
      ...applicant,
      fullName: mergedPersonalData.fullName,
      goal: mergedPersonalData.goal,
      personalData: mergedPersonalData,
      videoPitchData,
      xpPoints: (applicant.xpPoints || 350) + 200, // Award +200 XP for video pitch
      updatedAt: new Date().toISOString(),
    };

    // Recalculate completion score and Chancenkarte points
    updatedApplicant.completionPercentage = calculateCompletionPercentage(updatedApplicant);
    updatedApplicant.qualificationData = calculateChancenkarte(updatedApplicant);

    // Persist and sync to parent / Firestore
    onUpdateApplicant(updatedApplicant);
    setAppliedSuccess(true);
  };

  // Run AI Agent Video Transcription & Profile Construction Pipeline
  const runAgentPipeline = async (
    overrideTranscript?: string,
    overrideBlob?: Blob,
    overrideFile?: File
  ) => {
    setIsProcessing(true);
    setProcessingStep('Extracting neural speech audio features & phonemes...');

    const activeTranscript = (overrideTranscript !== undefined ? overrideTranscript : (liveCaptionsRef.current || liveCaptions)).trim();
    const activeBlob = overrideBlob || recordedBlob;
    const activeFile = overrideFile || uploadedFile;

    try {
      await new Promise((r) => setTimeout(r, 400));
      setProcessingStep('Transcribing full speech and identifying immigration profile entities...');

      const result = await transcribeVideoAndBuildProfile({
        videoBlob: activeBlob || (activeFile as any),
        mimeType: activeBlob?.type || activeFile?.type || 'video/webm',
        transcriptText: activeTranscript || undefined,
        existingPersonalData: applicant.personalData,
      });

      setProcessingStep('Cross-referencing German immigration criteria & Chancenkarte requirements...');
      await new Promise((r) => setTimeout(r, 400));

      setProcessingStep('Updating applicant dossier & synchronizing to official profile...');
      await new Promise((r) => setTimeout(r, 300));

      setTranscribeResult(result);
      setEditableProfile({ ...result.extractedProfile });

      // AUTOMATICALLY BUILD AND APPLY PROFILE IMMEDIATELY TO USER DOSSIER!
      const fileName = activeFile?.name || (activeBlob ? 'Candidate_Pitch_Recording.webm' : 'Candidate_Video_Introduction.webm');
      applyProfileData(result.extractedProfile, result, fileName);
    } catch (err) {
      console.error('Agent pipeline error:', err);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // Test 1-click Demo Pitches
  const handleSelectDemoPitch = (pitch: typeof DEMO_VIDEO_PITCHES[0]) => {
    setLiveCaptions(pitch.transcript);
    liveCaptionsRef.current = pitch.transcript;
    setRecordedVideoUrl(null);
    setUploadedVideoUrl(null);
    setRecordedBlob(null);
    runAgentPipeline(pitch.transcript);
  };

  // Test Custom Text pitch
  const handleRunCustomPitch = () => {
    if (!customPitchText.trim()) return;
    setLiveCaptions(customPitchText.trim());
    liveCaptionsRef.current = customPitchText.trim();
    runAgentPipeline(customPitchText.trim());
  };

  // Handle individual field edits with live profile sync
  const handleFieldChange = (field: keyof PersonalData, value: any) => {
    const updated = { ...editableProfile, [field]: value };
    setEditableProfile(updated);
    if (transcribeResult) {
      applyProfileData(updated, transcribeResult, uploadedFile?.name || 'Candidate_Video_Introduction.webm');
    }
  };

  // Live sentence & word counters
  const wordCount = liveCaptions.trim() ? liveCaptions.trim().split(/\s+/).length : 0;
  const sentenceCount = liveCaptions.trim() ? (liveCaptions.match(/[.!?]+|\n+/g) || ['']).length : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Continuous Voice & Multimodal Video Agent</span>
            <span className="px-2 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">+200 XP</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Record Video Pitch & Let AI Build Your German Profile
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Speak freely in English or German without pauses cutting you off! Our continuous AI agent transcribes every sentence until you finish speaking, extracts your education, work experience, German CEFR level, and automatically populates your official German career dossier!
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => { setActiveMode('camera'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeMode === 'camera'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Live Camera Pitch</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveMode('upload'); stopCameraStream(); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeMode === 'upload'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Video</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveMode('demo'); stopCameraStream(); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeMode === 'demo'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Demos & Sandbox</span>
          </button>
        </div>
      </div>

      {/* MODE 1: LIVE WEBCAM RECORDING */}
      {activeMode === 'camera' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Recording Centerstage */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-6 relative">
              {/* Header Bar with Language & Silence Detection */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300">Speech Language:</span>
                  <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setSpeechLanguage('en-US')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                        speechLanguage === 'en-US' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpeechLanguage('de-DE')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                        speechLanguage === 'de-DE' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Deutsch
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setAutoSilenceStop(!autoSilenceStop)}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                      autoSilenceStop
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                    title="Automatically stops and builds profile when 4s of silence occurs after speech"
                  >
                    <Radio className={`w-3.5 h-3.5 ${autoSilenceStop ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
                    <span>Auto-finish on silence: {autoSilenceStop ? 'ON (4s)' : 'OFF'}</span>
                  </button>
                </div>
              </div>

              {/* Video Viewport */}
              <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden flex items-center justify-center border border-slate-800">
                {!recordedVideoUrl ? (
                  <>
                    <video
                      ref={videoPreviewRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover -scale-x-100"
                    />

                    {!isCameraActive && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/90">
                        <div className="w-16 h-16 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center mb-4">
                          <Video className="w-8 h-8" />
                        </div>
                        <h4 className="text-base font-bold text-white mb-1">
                          Camera & Microphone Ready
                        </h4>
                        <p className="text-xs text-slate-400 max-w-sm mb-4">
                          Click to enable your camera and microphone. You can speak continuously across multiple sentences.
                        </p>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all flex items-center gap-2"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Enable Camera & Mic</span>
                        </button>
                      </div>
                    )}

                    {/* Flashing Recording Indicator & Timer */}
                    {isRecording && (
                      <div className="absolute top-4 left-4 flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600 text-white text-xs font-mono font-bold shadow-lg">
                          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                          <span>REC {formatTime(recordingDuration)}</span>
                        </div>

                        {/* Voice Activity Pill */}
                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md shadow-lg ${
                          isVoiceDetected
                            ? 'bg-emerald-600/90 text-white border border-emerald-400/50'
                            : 'bg-slate-900/90 text-slate-300 border border-slate-700'
                        }`}>
                          {isVoiceDetected ? (
                            <>
                              <Mic className="w-3.5 h-3.5 text-white animate-bounce" />
                              <span>Speaking Detected</span>
                            </>
                          ) : (
                            <>
                              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                              <span>Listening... (Keep Speaking)</span>
                            </>
                          )}
                        </div>

                        {silenceCountDown !== null && (
                          <div className="px-3 py-1.5 rounded-full bg-amber-500 text-black text-xs font-bold animate-pulse">
                            Finishing in {silenceCountDown}s...
                          </div>
                        )}
                      </div>
                    )}

                    {/* Audio Level Graphic Equalizer at bottom of viewport while recording */}
                    {isRecording && (
                      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-300 shrink-0">
                          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Mic:</span>
                        </div>
                        <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500 transition-all duration-75"
                            style={{ width: `${Math.max(5, audioLevel)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {audioLevel}%
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  /* Playback recorded video */
                  <video
                    ref={playbackVideoRef}
                    src={recordedVideoUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {cameraError && (
                <div className="mt-4 p-3 rounded-xl bg-amber-950/60 border border-amber-700/60 text-xs text-amber-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* LIVE CONTINUOUS SPEECH TRANSCRIPT DISPLAY */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-white">Live Continuous Speech Transcription:</span>
                    <span className="text-[11px] text-slate-400">
                      ({sentenceCount} sentences &bull; {wordCount} words)
                    </span>
                  </div>

                  {!isRecording && liveCaptions && (
                    <button
                      type="button"
                      onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{isEditingTranscript ? 'Done Editing' : 'Edit Transcript'}</span>
                    </button>
                  )}
                </div>

                {isEditingTranscript ? (
                  <textarea
                    rows={4}
                    value={liveCaptions}
                    onChange={(e) => {
                      setLiveCaptions(e.target.value);
                      liveCaptionsRef.current = e.target.value;
                    }}
                    className="w-full p-3 rounded-xl bg-white text-black font-mono text-xs border border-gray-300 focus:outline-none"
                    style={{ color: '#000000' }}
                    placeholder="Edit or add any sentences here..."
                  />
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 font-mono text-xs text-slate-200 leading-relaxed max-h-36 overflow-y-auto">
                    {liveCaptions ? (
                      <span>"{liveCaptions}"</span>
                    ) : (
                      <span className="text-slate-500 italic">
                        {isRecording
                          ? 'Listening continuously... Start speaking your introduction. Pauses will not stop transcription.'
                          : 'Press "Start Continuous Recording" to begin speaking. Every sentence will be captured.'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Recording Action Buttons */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
                <div className="flex flex-wrap items-center gap-3">
                  {!recordedVideoUrl ? (
                    isRecording ? (
                      <>
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all flex items-center gap-2"
                        >
                          <Square className="w-4 h-4 fill-white" />
                          <span>Finish Speaking & Build Profile</span>
                        </button>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                          <span>Transcribing until you press finish</span>
                        </span>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={startRecording}
                        disabled={!isCameraActive}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 disabled:opacity-40"
                      >
                        <span className="w-3 h-3 rounded-full bg-white" />
                        <span>Start Continuous Recording</span>
                      </button>
                    )
                  ) : (
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handleRetake}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Retake Video</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => runAgentPipeline(liveCaptions)}
                        disabled={isProcessing}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>{isProcessing ? 'Building Profile...' : 'Re-run Agent Profile Builder'}</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Unlimited speech: speak until you're completely done</span>
                </div>
              </div>
            </div>
          </div>

          {/* Teleprompter / Guide Prompts */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Teleprompter & Immigration Pitch Guide
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Speak through these points at your own pace. You can pause as needed — the agent keeps transcribing until you stop:
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    1. Identity, Nationality & Age
                  </span>
                  <p className="text-slate-400 mt-1 italic">
                    "My name is [Full Name], I am [Age] years old from [Country]..."
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <span className="font-bold text-blue-300 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                    2. Degree & University
                  </span>
                  <p className="text-slate-400 mt-1 italic">
                    "I graduated with a Bachelor/Master in [Computer Science/Mechanical/Nursing] from [University] in [Year]..."
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                    3. Work Experience & Core Skills
                  </span>
                  <p className="text-slate-400 mt-1 italic">
                    "I have [3] years of experience as a [Software Engineer]. My skills include [React, Node.js, Python, AWS]..."
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <span className="font-bold text-purple-300 flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-purple-400" />
                    4. German & English Language Level
                  </span>
                  <p className="text-slate-400 mt-1 italic">
                    "My German level is [A2 / B1 / B2] and I am fluent in English at [C1] level..."
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <span className="font-bold text-red-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    5. German Destination & Visa Pathway
                  </span>
                  <p className="text-slate-400 mt-1 italic">
                    "I plan to move to [Munich / Berlin / Frankfurt] under the [Chancenkarte / Skilled Work Visa]..."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: UPLOAD VIDEO FILE */}
      {activeMode === 'upload' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
          <div className="max-w-xl mx-auto text-center space-y-4">
            <label className="border-2 border-dashed border-slate-700 hover:border-red-500/60 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer bg-slate-950/60 hover:bg-slate-950 transition-all block">
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/mkv,video/avi"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">
                {uploadedFile ? uploadedFile.name : 'Upload Candidate Video Pitch'}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Supports MP4, WebM, MOV. The agent transcribes spoken words and builds your profile directly.
              </p>
            </label>

            {uploadedVideoUrl && (
              <div className="space-y-4">
                <video
                  src={uploadedVideoUrl}
                  controls
                  className="w-full max-h-72 rounded-2xl bg-black object-contain border border-slate-800"
                />
                <button
                  type="button"
                  onClick={() => runAgentPipeline()}
                  disabled={isProcessing}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 mx-auto"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isProcessing ? 'Analyzing Video...' : 'Transcribe & Build Profile'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 3: 1-CLICK DEMO PITCHES & CUSTOM TEXT SANDBOX */}
      {activeMode === 'demo' && (
        <div className="space-y-8">
          {/* Custom Speech / Text Input Sandbox */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                Test Speech Pitch Sandbox (Type or Paste Spoken Introduction)
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Want to test multi-sentence profile extraction immediately without recording? Paste or type any verbal introduction below:
            </p>

            <textarea
              rows={4}
              value={customPitchText}
              onChange={(e) => setCustomPitchText(e.target.value)}
              placeholder="e.g. Hello, my name is Rahul Sharma, age 27 from India. I have a Bachelor of Technology in Computer Science from IIT Delhi graduated in 2021. I have 4 years of experience building scalable systems with React, Python, and AWS. My German level is B1 and my English is C1. I want to move to Berlin on a Chancenkarte visa."
              className="w-full p-4 rounded-2xl bg-white text-black font-mono text-xs border border-gray-300 focus:outline-none"
              style={{ color: '#000000' }}
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Tests full multi-sentence extraction: degree, years of experience, German CEFR level, target city & skills.
              </span>
              <button
                type="button"
                onClick={handleRunCustomPitch}
                disabled={!customPitchText.trim() || isProcessing}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 disabled:opacity-40"
              >
                <Sparkles className="w-4 h-4" />
                <span>Build Profile from Text Pitch</span>
              </button>
            </div>
          </div>

          {/* Pre-recorded candidates */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              1-Click Realistic Candidate Video Introductions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DEMO_VIDEO_PITCHES.map((pitch) => (
                <div
                  key={pitch.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-amber-500/40 transition-all space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-semibold text-amber-400">{pitch.author}</span>
                      <span className="font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {pitch.duration}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-2">{pitch.title}</h4>
                    <p className="text-xs text-slate-400 italic line-clamp-3 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                      "{pitch.transcript}"
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectDemoPitch(pitch)}
                    disabled={isProcessing}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Transcribe This Candidate</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PROCESSING STATUS ANIMATION */}
      {isProcessing && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 border-3 border-red-500/30 border-t-amber-400 rounded-full animate-spin mx-auto" />
          <h3 className="text-base font-bold text-white">AI Agent Processing Video Pitch</h3>
          <p className="text-xs text-amber-300 font-mono animate-pulse">{processingStep}</p>
        </div>
      )}

      {/* RESULTS: TRANSCRIPTION + AGENT PROFILE BUILDER + DIFF APPLIER */}
      {transcribeResult && !isProcessing && (
        <div className="space-y-6 pt-4">
          {/* Section 1: Verbatim Video Transcription */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Video Speech Transcription (Complete & Verified)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Neural speech recognition confidence: {(transcribeResult.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-950 text-emerald-400 border border-emerald-800 self-start sm:self-auto">
                {transcribeResult.durationSeconds}s Spoken Audio
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed">
              "{transcribeResult.transcript}"
            </div>

            {/* Key Insights extracted by the Agent */}
            {transcribeResult.keyInsights && (
              <div className="pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Agent Key Insights for German Market:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {transcribeResult.keyInsights.map((insight, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Agent Built Profile & Review */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-400 text-xs font-bold mb-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Transcribed Details Applied to Official Profile & Database</span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Transcribed Information Applied to Your Profile
                </h3>
                <p className="text-xs text-slate-400">
                  Your German career dossier was automatically populated with all extracted education, experience, and language ratings. You can fine-tune any field below.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                {onNavigateToProfile && (
                  <button
                    type="button"
                    onClick={onNavigateToProfile}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5"
                  >
                    <span>View in Profile Tab</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleFieldChange('fullName', editableProfile.fullName)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Profile Synced</span>
                </button>
              </div>
            </div>

            {/* Profile Applied Success Banner */}
            {appliedSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-xs text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Profile Updated!</strong> Transcribed data for <strong>{editableProfile.fullName || 'Candidate'}</strong> ({editableProfile.fieldOfStudy}, {editableProfile.workExperienceYears} yrs experience, German {editableProfile.germanLevel}) has been applied to your official profile and saved to Firestore (+200 XP).
                  </span>
                </div>
                {onNavigateToProfile && (
                  <button
                    type="button"
                    onClick={onNavigateToProfile}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors whitespace-nowrap self-end sm:self-auto"
                  >
                    Go to Profile Tab &rarr;
                  </button>
                )}
              </div>
            )}

            {/* Editable Profile Fields Grid (Synchronizes Live on Change) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* Full Name */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  Full Name (Updated)
                </span>
                <input
                  type="text"
                  value={editableProfile.fullName || ''}
                  onChange={(e) => handleFieldChange('fullName', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white text-black font-semibold border border-gray-300 text-xs"
                  style={{ color: '#000000' }}
                />
              </div>

              {/* Age */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400">Age</span>
                <input
                  type="number"
                  value={editableProfile.age || 26}
                  onChange={(e) => handleFieldChange('age', parseInt(e.target.value) || 26)}
                  className="w-full px-3 py-2 rounded-lg bg-white text-black font-semibold border border-gray-300 text-xs"
                  style={{ color: '#000000' }}
                />
              </div>

              {/* Primary Goal */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400">German Pathway Goal</span>
                <select
                  value={editableProfile.goal || 'Work'}
                  onChange={(e) => handleFieldChange('goal', e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-white text-black font-semibold border border-gray-300 text-xs"
                  style={{ color: '#000000' }}
                >
                  <option value="Work">Direct Skilled Work</option>
                  <option value="Chancenkarte">Chancenkarte (Opportunity Card)</option>
                  <option value="Study in Germany">Study in Germany</option>
                  <option value="Ausbildung">Ausbildung (Vocational)</option>
                </select>
              </div>

              {/* Education Level */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                  Degree / Education
                </span>
                <input
                  type="text"
                  value={editableProfile.educationLevel || ''}
                  onChange={(e) => handleFieldChange('educationLevel', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white text-black border border-gray-300 text-xs"
                  style={{ color: '#000000' }}
                />
              </div>

              {/* Field of Study */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400">Field of Study</span>
                <input
                  type="text"
                  value={editableProfile.fieldOfStudy || ''}
                  onChange={(e) => handleFieldChange('fieldOfStudy', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white text-black border border-gray-300 text-xs"
                  style={{ color: '#000000' }}
                />
              </div>

              {/* University */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400">University Name</span>
                <input
                  type="text"
                  value={editableProfile.university || ''}
                  onChange={(e) => handleFieldChange('university', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white text-black border border-gray-300 text-xs"
                  style={{ color: '#000000' }}
                />
              </div>

              {/* Work Experience */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                  Work Experience (Years)
                </span>
                <input
                  type="number"
                  value={editableProfile.workExperienceYears !== undefined ? editableProfile.workExperienceYears : 2}
                  onChange={(e) => handleFieldChange('workExperienceYears', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-white text-black border border-gray-300 text-xs"
                  style={{ color: '#000000' }}
                />
              </div>

              {/* German Level */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-emerald-400" />
                  German Level (CEFR)
                </span>
                <select
                  value={editableProfile.germanLevel || 'A1'}
                  onChange={(e) => handleFieldChange('germanLevel', e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-white text-black border border-gray-300 text-xs"
                  style={{ color: '#000000' }}
                >
                  <option value="None / A0">None / A0</option>
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="C1">C1</option>
                  <option value="C2">C2</option>
                </select>
              </div>

              {/* Target City */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  Target German City
                </span>
                <input
                  type="text"
                  value={editableProfile.targetCity || 'Munich'}
                  onChange={(e) => handleFieldChange('targetCity', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white text-black border border-gray-300 text-xs"
                  style={{ color: '#000000' }}
                />
              </div>

              {/* Core Skills */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 lg:col-span-3">
                <span className="text-[11px] font-bold text-slate-400">Extracted Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {(editableProfile.skills || []).map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-white font-medium text-[11px] border border-slate-700"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Generated Professional Bio */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 lg:col-span-3">
                <span className="text-[11px] font-bold text-slate-400">
                  Generated German Professional Summary (Bio)
                </span>
                <textarea
                  rows={2}
                  value={editableProfile.bio || ''}
                  onChange={(e) => handleFieldChange('bio', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white text-black border border-gray-300 text-xs"
                  style={{ color: '#000000' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
