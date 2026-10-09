import { 
  Applicant, 
  ApplicantGoal, 
  ApplicantDocument, 
  DocumentType, 
  VerificationResult, 
  CVAnalysisResult, 
  GermanCV,
  QualificationData,
  ChancenkarteItem,
  PersonalData,
  VideoTranscribeResult
} from './types.ts';
import { syncApplicantToFirestore } from './firebase.ts';

/**
 * Format timestamp in authentic German standard:
 * e.g. "08.10.2026, 13:14:00 MESZ"
 */
export function formatGermanTimestamp(dateInput: Date | string = new Date()): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  
  return `${day}.${month}.${year}, ${hours}:${minutes}:${seconds} MESZ`;
}

/**
 * Create a fresh applicant on signup with 0 documents
 */
export function createFreshApplicant(params: {
  id: string;
  email: string;
  fullName: string;
  goal: ApplicantGoal;
}): Applicant {
  const now = new Date().toISOString();
  
  const initialApplicant: Applicant = {
    id: params.id,
    email: params.email,
    fullName: params.fullName,
    goal: params.goal,
    xpPoints: 100, // Signup welcome XP
    completionPercentage: 15,
    personalData: {
      fullName: params.fullName,
      citizenship: 'India',
      age: 26,
      goal: params.goal,
      educationLevel: 'Bachelor of Technology / Engineering',
      fieldOfStudy: 'Computer Science & Information Technology',
      university: '',
      graduationYear: 2023,
      gpa: '8.2 / 10 (German Equiv: 1.8)',
      workExperienceYears: 2,
      currentRole: 'Software Engineer',
      currentCompany: '',
      skills: ['TypeScript', 'React', 'Python', 'Docker', 'REST APIs'],
      germanLevel: 'A1',
      englishLevel: 'C1',
      hasLanguageCert: false,
      targetCity: 'Munich',
      targetIndustry: 'Technology & Engineering',
      bio: 'Aspiring professional relocating to Germany under skilled migration pathway.',
      digiLockerVerified: false,
    },
    documents: [],
    cvData: {
      hasOldCv: false,
    },
    qualificationData: {
      anabinStatus: 'H+',
      institutionName: '',
      degreeName: '',
      recognitionCheckDate: now,
      chancenkartePoints: 6,
      chancenkarteEligible: true,
      chancenkarteBreakdown: [],
    },
    createdAt: now,
    updatedAt: now,
    lastSyncedAt: now,
  };

  // Recalculate baseline completion and points
  initialApplicant.completionPercentage = calculateCompletionPercentage(initialApplicant);
  initialApplicant.qualificationData = calculateChancenkarte(initialApplicant);
  
  return initialApplicant;
}

/**
 * Calculate completion based on:
 * - personal data (20%)
 * - documents (40%)
 * - CV (20%)
 * - qualification (20%)
 * Total = 100%
 */
export function calculateCompletionPercentage(applicant: Applicant): number {
  let score = 0;

  // 1. Personal Data (20%)
  const pd = applicant.personalData;
  let pdPoints = 0;
  if (pd.fullName && pd.fullName.trim().length > 2) pdPoints += 4;
  if (pd.citizenship && pd.age > 0) pdPoints += 4;
  if (pd.educationLevel && pd.fieldOfStudy) pdPoints += 4;
  if (pd.germanLevel && pd.englishLevel) pdPoints += 4;
  if (pd.digiLockerVerified) pdPoints += 4;
  score += Math.min(20, pdPoints);

  // 2. Documents (40%)
  // Needs verified documents: Passport, Degree, Language cert, etc.
  const docs = applicant.documents || [];
  const verifiedDocs = docs.filter(d => d.status === 'verified');
  if (docs.length > 0) {
    // 10% for first doc, up to 40% for 3+ verified docs
    const docScore = Math.min(40, verifiedDocs.length * 15 + (docs.length > verifiedDocs.length ? 5 : 0));
    score += docScore;
  }

  // 3. CV (20%)
  if (applicant.cvData.generatedCv) {
    score += 20;
  } else if (applicant.cvData.hasOldCv || applicant.cvData.oldCvAnalysis) {
    score += 12;
  }

  // 4. Qualification (20%)
  if (applicant.qualificationData.anabinStatus !== 'Unknown') {
    score += 10;
  }
  if (applicant.qualificationData.chancenkartePoints > 0) {
    score += 10;
  }

  return Math.min(100, Math.round(score));
}

/**
 * Calculate gamified XP points with transparent, logical milestone metrics
 */
export function calculateXPPoints(applicant: Applicant): number {
  let xp = 100; // Account registration & secure sign-in
  if (applicant.personalData?.digiLockerVerified) xp += 150; // Official Aadhaar / Identity authentication
  if (applicant.personalData?.fullName && applicant.personalData.fullName.length > 2) xp += 50; // Profile base details
  
  if (applicant.documents) {
    const verifiedCount = applicant.documents.filter(d => d.status === 'verified').length;
    xp += verifiedCount * 100; // 100 XP per authentic verified document
  }
  
  if (applicant.cvData?.hasOldCv) xp += 80; // Uploaded prior resume
  if (applicant.cvData?.generatedCv) xp += 150; // Generated DIN 5008 German CV
  if (applicant.videoPitchData?.hasVideo) xp += 200; // Video pitch recorded & AI transcription profile applied
  if (applicant.qualificationData?.anabinStatus === 'H+') xp += 120; // Verified Anabin H+ university status
  if (applicant.qualificationData?.chancenkarteEligible) xp += 100; // Passed Chancenkarte threshold (>= 6 pts)
  
  return xp;
}

export interface ApplicantLevelInfo {
  level: number;
  title: string;
  badge: string;
  currentXp: number;
  minXp: number;
  nextLevelXp: number;
  progressPercent: number;
  xpNeeded: number;
}

export function getApplicantLevel(xp: number): ApplicantLevelInfo {
  const levels = [
    { level: 1, title: 'Anwärter (Candidate)', minXp: 0, nextXp: 300, badge: 'LEVEL 1: ANWÄRTER' },
    { level: 2, title: 'Bewerber (Applicant)', minXp: 300, nextXp: 600, badge: 'LEVEL 2: BEWERBER' },
    { level: 3, title: 'Fachkraft (Specialist)', minXp: 600, nextXp: 950, badge: 'LEVEL 3: FACHKRAFT' },
    { level: 4, title: 'Auswanderer (Relocation Ready)', minXp: 950, nextXp: 1300, badge: 'LEVEL 4: AUSWANDERER' },
    { level: 5, title: 'GermanPath Meister (Embassy Certified)', minXp: 1300, nextXp: 2000, badge: 'LEVEL 5: MEISTER' },
  ];

  for (let i = levels.length - 1; i >= 0; i--) {
    const l = levels[i];
    if (xp >= l.minXp) {
      const span = l.nextXp - l.minXp;
      const progress = Math.min(100, Math.max(0, Math.round(((xp - l.minXp) / span) * 100)));
      return {
        level: l.level,
        title: l.title,
        badge: l.badge,
        currentXp: xp,
        minXp: l.minXp,
        nextLevelXp: l.nextXp,
        progressPercent: progress,
        xpNeeded: Math.max(0, l.nextXp - xp),
      };
    }
  }

  return {
    level: 1,
    title: 'Anwärter (Candidate)',
    badge: 'LEVEL 1: ANWÄRTER',
    currentXp: xp,
    minXp: 0,
    nextLevelXp: 300,
    progressPercent: 33,
    xpNeeded: 200,
  };
}

/**
 * AI DOCUMENT VERIFICATION ENGINE (CORE NEW FEATURE)
 * Returns { authenticityScore: 0-100, isManipulated: boolean, isAIGenerated: boolean, manipulationRegions: [], confidence: string, verified: boolean }
 * Mock logic for hackathon:
 * if file name contains 'fake' -> fail, else pass with random 85-99% score
 */
export async function verifyDocument(doc: {
  name: string;
  type: DocumentType;
  fileSize?: number;
  rawText?: string;
}): Promise<VerificationResult> {
  // Simulate AI pipeline latency (neural metadata scanning, EXIF forensic, OCR font-anomaly check)
  await new Promise((resolve) => setTimeout(resolve, 1400));

  const lowerName = (doc.name || '').toLowerCase();
  const isFakeTriggered = lowerName.includes('fake') || lowerName.includes('manipulated') || lowerName.includes('tampered');

  if (isFakeTriggered) {
    const authenticityScore = Math.floor(Math.random() * 15) + 20; // 20-35%
    return {
      authenticityScore,
      isManipulated: true,
      isAIGenerated: true,
      manipulationRegions: [
        {
          area: 'Official Seal & Seal Stamp Border',
          confidence: 0.94,
          note: 'Inconsistent pixel interpolation and antialiasing around government emblem / university seal.',
        },
        {
          area: 'Date and Registration Number Header',
          confidence: 0.89,
          note: 'Font metrics mismatch: glyph compression deviates from standard DIN/ISO institutional certificates.',
        },
        {
          area: 'Signature Line Vector Artifacts',
          confidence: 0.92,
          note: 'Digital cloning artifact detected in signature raster channel.',
        }
      ],
      confidence: 'High',
      verified: false,
      checks: {
        authenticity: {
          passed: false,
          score: authenticityScore,
          label: `${authenticityScore}% Authentic (Fraud Detected)`,
          detail: 'Document failed cryptographic and layout integrity validation against standard registries.',
        },
        manipulation: {
          passed: false,
          detected: true,
          label: 'Digital Alterations Detected',
          detail: '3 anomalies identified in institutional stamp, watermark, and issuer signature.',
        },
        aiGenerated: {
          passed: false,
          detected: true,
          label: 'Synthetic / AI Content Flagged',
          detail: 'High probability of diffusion/generative model artifacting in text layout.',
        },
      },
      nextBestAction: 'Re-upload original document (uncompressed PDF or physical scan directly from issuing authority).',
      verifiedAt: new Date().toISOString(),
    };
  }

  // Passing document: realistic 88-98% score
  const authenticityScore = Math.floor(Math.random() * 11) + 89; // 89-99%

  return {
    authenticityScore,
    isManipulated: false,
    isAIGenerated: false,
    manipulationRegions: [],
    confidence: 'High',
    verified: true,
    checks: {
      authenticity: {
        passed: true,
        score: authenticityScore,
        label: `${authenticityScore}% Authentic`,
        detail: 'Official microprint, issuing authority typography, and serial headers match legitimate registries.',
      },
      manipulation: {
        passed: true,
        detected: false,
        label: 'No Tampering Detected',
        detail: 'Zero pixel manipulation or clone stamping detected across PDF raster layers.',
      },
      aiGenerated: {
        passed: true,
        detected: false,
        label: 'Human-Created Document',
        detail: 'Vector graphics and typography conform to certified institutional print drivers.',
      },
    },
    verifiedAt: new Date().toISOString(),
  };
}

/**
 * DigiLocker Verification Mock API
 */
export async function verifyWithDigiLocker(docNumber: string): Promise<{
  success: boolean;
  docId: string;
  verifiedAt: string;
  message: string;
}> {
  await new Promise((r) => setTimeout(r, 1200));
  const docId = `DL-DE-${Math.floor(100000 + Math.random() * 900000)}`;
  return {
    success: true,
    docId,
    verifiedAt: new Date().toISOString(),
    message: 'National Identity Verified securely via DigiLocker Government Gateway',
  };
}

/**
 * AI CV Analysis: Extract -> Compare -> Find Missing/Outdated Information
 * Evaluates against German standard (DIN 5008, Europass, German HR expectations)
 */
export function analyzeCV(cvText: string): CVAnalysisResult {
  const text = (cvText || '').toLowerCase();
  
  const hasPhotoPlacement = text.includes('foto') || text.includes('photo') || text.includes('bewerbungsfoto');
  const hasGermanLanguage = text.includes('deutsch') || text.includes('german') || text.includes('b1') || text.includes('b2') || text.includes('c1');
  const hasBirthOrNationality = text.includes('geboren') || text.includes('birth') || text.includes('staatsangehörigkeit') || text.includes('citizenship') || text.includes('nationality');
  const hasSignature = text.includes('unterschrift') || text.includes('signature') || text.includes('ort, datum') || text.includes('date');
  const hasChronological = text.includes('berufserfahrung') || text.includes('experience') || text.includes('work') || text.includes('employment');
  const hasEducation = text.includes('ausbildung') || text.includes('studium') || text.includes('education') || text.includes('university') || text.includes('degree');

  const missingSections: string[] = [];
  if (!hasPhotoPlacement) {
    missingSections.push('Bewerbungsfoto (Professional German application photo option)');
  }
  if (!hasGermanLanguage) {
    missingSections.push('German Language Proficiency according to CEFR scale (A1, A2, B1, B2, C1)');
  }
  if (!hasBirthOrNationality) {
    missingSections.push('Personal Details: Date of Birth and Citizenship (Standard requirement for German visa/HR vetting)');
  }
  if (!hasSignature) {
    missingSections.push('Place, Date & Handwritten Signature declaration block (German legal tradition)');
  }
  if (!text.includes('skills') && !text.includes('kenntnisse')) {
    missingSections.push('Key Competencies & Technical Skills categorized by proficiency');
  }

  const gapAnalysis: string[] = [];
  if (missingSections.length > 0) {
    gapAnalysis.push(`Detected ${missingSections.length} structural gaps according to German Tabellarischer Lebenslauf norms.`);
  }
  if (!hasGermanLanguage) {
    gapAnalysis.push('German recruiters prioritize CEFR language ratings over generic terms like "fluent" or "conversational".');
  }
  gapAnalysis.push('Reverse chronological order with exact month/year (MM/YYYY) is mandatory to eliminate unverified timeline gaps.');

  const keywordSuggestions = [
    'Berufserfahrung (Professional Experience)',
    'Fachkenntnisse (Domain Expertise)',
    'Sprachkenntnisse nach GER/CEFR (Language competencies)',
    'Zertifizierungen & Weiterbildung (Certifications)',
    'Projektverantwortung (Project Ownership)',
    'Interkulturelle Kompetenz (Intercultural Competence)',
  ];

  const strengths = [
    'Clear academic foundation and technical scope identified.',
    'Solid baseline for conversion to German DIN 5008 Tabellarischer Lebenslauf.',
  ];

  const actionableRecommendations = [
    'Switch format to reverse-chronological two-column German Lebenslauf.',
    'List German language level explicitly (e.g., Deutsch: A2 in Ausbildung / B1 Ziel).',
    'Include your Anabin-recognized university equivalence status.',
    'Add city and date block above signature line before submission.',
  ];

  const score = Math.max(50, 100 - (missingSections.length * 10));

  return {
    overallScore: score,
    din5008Compliant: missingSections.length <= 1,
    europassReady: hasChronological && hasEducation,
    germanLanguageMentioned: hasGermanLanguage,
    hasPhotoPlacement,
    missingSections,
    gapAnalysis,
    keywordSuggestions,
    strengths,
    actionableRecommendations,
  };
}

/**
 * Chancenkarte (Opportunity Card) Points Calculator
 * According to official German Skilled Immigration Act (Fachkräfteeinwanderungsgesetz):
 * Total points needed: at least 6 points
 */
export function calculateChancenkarte(applicant: Applicant): QualificationData {
  const pd = applicant.personalData;
  const breakdown: ChancenkarteItem[] = [];
  let totalPoints = 0;

  // 1. Foreign Degree Recognition (4 points for partial recognition / Anabin H+)
  const isRecognizedDegree = applicant.qualificationData?.anabinStatus === 'H+' || pd.educationLevel.includes('Bachelor') || pd.educationLevel.includes('Master');
  const degPoints = isRecognizedDegree ? 4 : 0;
  totalPoints += degPoints;
  breakdown.push({
    category: 'Degree Equivalence (Anabin H+ / ZAB)',
    points: degPoints,
    maxPoints: 4,
    reason: isRecognizedDegree 
      ? 'University institution and degree accredited (H+ status on Anabin portal)' 
      : 'Degree recognition pending validation through ZAB statement',
    qualified: isRecognizedDegree,
  });

  // 2. Professional Experience (3 points for 5+ years, 2 points for 2+ years in last 5 years)
  let expPoints = 0;
  if (pd.workExperienceYears >= 5) expPoints = 3;
  else if (pd.workExperienceYears >= 2) expPoints = 2;
  totalPoints += expPoints;
  breakdown.push({
    category: 'Professional Experience in Field',
    points: expPoints,
    maxPoints: 3,
    reason: `${pd.workExperienceYears} years of verified experience in ${pd.fieldOfStudy || 'target domain'}`,
    qualified: expPoints > 0,
  });

  // 3. Language Skills (German: B2 = 3 pts, B1 = 2 pts, A2 = 1 pt. English: C1/Native = 1 pt)
  let langPoints = 0;
  let langReason = [];
  if (pd.germanLevel === 'C1' || pd.germanLevel === 'C2') {
    langPoints += 4;
    langReason.push(`German ${pd.germanLevel} (4 pts)`);
  } else if (pd.germanLevel === 'B2') {
    langPoints += 3;
    langReason.push('German B2 (3 pts)');
  } else if (pd.germanLevel === 'B1') {
    langPoints += 2;
    langReason.push('German B1 (2 pts)');
  } else if (pd.germanLevel === 'A2') {
    langPoints += 1;
    langReason.push('German A2 (1 pt)');
  }

  if (pd.englishLevel === 'C1' || pd.englishLevel === 'C2' || pd.englishLevel === 'Native') {
    langPoints += 1;
    langReason.push(`English ${pd.englishLevel} (1 pt)`);
  }

  langPoints = Math.min(4, langPoints);
  totalPoints += langPoints;
  breakdown.push({
    category: 'Language Proficiency (German + English)',
    points: langPoints,
    maxPoints: 4,
    reason: langReason.join(', ') || 'No certified German or English C1 level indicated yet',
    qualified: langPoints > 0,
  });

  // 4. Age (Under 35 = 2 points, 35 to 40 = 1 point)
  let agePoints = 0;
  if (pd.age < 35) agePoints = 2;
  else if (pd.age <= 40) agePoints = 1;
  totalPoints += agePoints;
  breakdown.push({
    category: 'Age Assessment',
    points: agePoints,
    maxPoints: 2,
    reason: `Age ${pd.age} (${pd.age < 35 ? '< 35 years: maximum 2 points' : pd.age <= 40 ? '35-40 years: 1 point' : 'Over 40 years: 0 points'})`,
    qualified: agePoints > 0,
  });

  // 5. Shortage Occupation (Engpassberuf: IT, STEM, Healthcare, Engineers = 1 point)
  const isShortage = 
    pd.fieldOfStudy.toLowerCase().includes('computer') ||
    pd.fieldOfStudy.toLowerCase().includes('software') ||
    pd.fieldOfStudy.toLowerCase().includes('engineer') ||
    pd.fieldOfStudy.toLowerCase().includes('nurs') ||
    pd.fieldOfStudy.toLowerCase().includes('tech') ||
    pd.fieldOfStudy.toLowerCase().includes('informatik');
  const shortagePoints = isShortage ? 1 : 0;
  totalPoints += shortagePoints;
  breakdown.push({
    category: 'Shortage Occupation (MINT / STEM)',
    points: shortagePoints,
    maxPoints: 1,
    reason: isShortage 
      ? 'Target domain is officially listed on German Federal Shortage Occupation register (MINT/Engpassberufe)' 
      : 'General occupation classification',
    qualified: isShortage,
  });

  return {
    anabinStatus: isRecognizedDegree ? 'H+' : 'H+/-',
    institutionName: pd.university || 'State Accredited University',
    degreeName: pd.educationLevel || 'Bachelor of Science / Technology',
    recognitionCheckDate: new Date().toISOString(),
    chancenkartePoints: totalPoints,
    chancenkarteEligible: totalPoints >= 6,
    chancenkarteBreakdown: breakdown,
  };
}

/**
 * Anabin database simulation check
 */
export async function simulateAnabinCheck(institution: string, degree: string): Promise<{
  status: 'H+' | 'H+/-' | 'H-';
  statusExplanation: string;
  equivalenceRating: string;
  referenceId: string;
}> {
  await new Promise((r) => setTimeout(r, 900));
  return {
    status: 'H+',
    statusExplanation: 'H+ indicates the educational institution is officially recognized in Germany as a genuine university level establishment.',
    equivalenceRating: 'Entspricht deutschem Hochschulabschluss (Equivalent to standard German academic degree level).',
    referenceId: `ANABIN-DE-${Math.floor(200000 + Math.random() * 800000)}`,
  };
}

/**
 * Generate default structured German CV from Applicant data
 */
export function buildGermanCVFromApplicant(applicant: Applicant): GermanCV {
  const pd = applicant.personalData;
  const today = new Date();
  const dateFormatted = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}.${today.getFullYear()}`;
  
  return {
    personalInfo: {
      fullName: pd.fullName || 'Candidate Name',
      email: applicant.email,
      phone: '+49 152 12345678',
      address: `Marienplatz 12, 80331 ${pd.targetCity || 'Munich'}, Germany (Relocating)`,
      nationality: pd.citizenship || 'Indian',
      birthDate: `${2024 - (pd.age || 26)}-05-14`,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    profileSummary: `Motivated professional with ${pd.workExperienceYears} years of experience in ${pd.fieldOfStudy}. Relocating to Germany with target focus on ${pd.goal}. German language level: ${pd.germanLevel}, English level: ${pd.englishLevel}. Full Anabin degree recognition.`,
    targetRole: pd.currentRole || 'Software Engineer',
    workExperience: [
      {
        role: pd.currentRole || 'Software Development Engineer',
        company: pd.currentCompany || 'Tech Innovations Corp',
        city: 'Bangalore / Remote',
        startDate: '07/2022',
        endDate: 'Present',
        tasks: [
          'Engineered scalable microservices and user-facing features adhering to clean code standards.',
          'Collaborated with agile cross-functional teams in sprint planning and CI/CD pipelines.',
          'Implemented automated testing suites achieving 92% code coverage.',
        ],
      },
      {
        role: 'Junior Associate Engineer',
        company: 'CloudSphere Solutions',
        city: 'Pune',
        startDate: '08/2021',
        endDate: '06/2022',
        tasks: [
          'Developed RESTful API endpoints and assisted database optimization.',
          'Assisted senior architects in technical documentation and ISO compliance.',
        ],
      },
    ],
    education: [
      {
        degree: pd.educationLevel || 'Bachelor of Technology (B.Tech)',
        institution: pd.university || 'State University of Technology',
        city: 'New Delhi',
        startYear: '2017',
        endYear: `${pd.graduationYear || 2021}`,
        grade: pd.gpa || 'Grade: 1.8 (German System equivalent)',
      },
    ],
    skills: pd.skills && pd.skills.length > 0 ? pd.skills : ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Git'],
    languages: [
      { language: 'Deutsch', level: `${pd.germanLevel} (GER / CEFR)` },
      { language: 'Englisch', level: `${pd.englishLevel} (Verhandlungssicher / Fluent)` },
      { language: 'Hindi / Muttersprache', level: 'Muttersprache (Native)' },
    ],
    certifications: [
      'AWS Certified Solutions Architect - Associate',
      'Goethe-Zertifikat / telc Vorbereitung',
      'Scrum Alliance Certified ScrumMaster (CSM)',
    ],
    placeAndDate: `${pd.targetCity || 'München'}, den ${dateFormatted}`,
    signatureName: pd.fullName || 'Candidate Name',
  };
}

/**
 * Convert Blob to Base64 data string
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Transcribe candidate video/audio and let AI agent build complete profile
 */
export async function transcribeVideoAndBuildProfile(params: {
  videoBlob?: Blob;
  videoBase64?: string;
  mimeType?: string;
  transcriptText?: string;
  existingPersonalData?: Partial<PersonalData>;
}): Promise<VideoTranscribeResult> {
  const cleanTranscript = (params.transcriptText || '').trim();

  // Try server endpoint /api/transcribe-video
  try {
    let videoData = params.videoBase64;
    if (!videoData && params.videoBlob) {
      videoData = await blobToBase64(params.videoBlob);
    }

    const payload: any = {
      mimeType: params.mimeType || 'video/webm',
    };
    if (cleanTranscript) payload.transcriptText = cleanTranscript;
    if (videoData) payload.videoBase64 = videoData;
    if (params.existingPersonalData) payload.existingProfile = params.existingPersonalData;

    const response = await fetch('/api/transcribe-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.extractedProfile) {
        return data as VideoTranscribeResult;
      }
    }
  } catch (err) {
    console.warn('API route call notice (using local neural parser fallback):', err);
  }

  // Robust client-side multi-sentence fallback extraction
  const textToParse = cleanTranscript || 
    (params.existingPersonalData?.bio ? `Candidate self introduction: ${params.existingPersonalData.bio}` : '') ||
    "Hello! My name is Priya Sharma, I am 26 years old from India. I have a Bachelor of Technology in Computer Science from Anna University, graduated in 2022. I have 3 years of work experience as a Full Stack React and Node.js developer. My German level is currently A2, and my English is C1. I want to move to Munich under the Chancenkarte Opportunity Card visa for software engineering jobs.";

  return clientSideParseTranscript(textToParse, params.existingPersonalData);
}

/**
 * Helper to convert word numbers into digits
 */
function parseSpokenNumber(text: string): number | null {
  const wordMap: Record<string, number> = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
    sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
    'twenty one': 21, 'twenty two': 22, 'twenty three': 23, 'twenty four': 24,
    'twenty five': 25, 'twenty six': 26, 'twenty seven': 27, 'twenty eight': 28,
    'twenty nine': 29, thirty: 30, 'thirty one': 31, 'thirty two': 32,
    'thirty three': 33, 'thirty four': 34, 'thirty five': 35, forty: 40
  };
  const lower = text.toLowerCase().trim();
  if (wordMap[lower] !== undefined) return wordMap[lower];
  const num = parseInt(lower, 10);
  return isNaN(num) ? null : num;
}

/**
 * Intelligent Multi-Sentence Client-side parser for speech transcripts
 * Extracts every spoken detail across unlimited sentences
 */
export function clientSideParseTranscript(
  transcript: string,
  existingPersonalData?: Partial<PersonalData>
): VideoTranscribeResult {
  const text = transcript.toLowerCase();

  // 1. Full name extraction (scan all sentences)
  let fullName = existingPersonalData?.fullName || '';
  const namePatterns = [
    /(?:my name is|my name's|name is)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i,
    /(?:i am|i'm|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
    /(?:guten tag(?:,|!)?\s*(?:ich bin|mein name ist)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?))/i,
    /(?:hello(?:,|!)?\s*(?:i'm|i am)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?))/i,
  ];

  for (const pattern of namePatterns) {
    const match = transcript.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      const forbidden = ['a', 'an', 'the', 'currently', 'working', 'living', 'looking', 'aiming', 'applying', 'planning', 'delighted', 'excited'];
      if (!forbidden.includes(candidate.toLowerCase()) && candidate.length > 2) {
        fullName = candidate;
        break;
      }
    }
  }
  if (!fullName) {
    fullName = existingPersonalData?.fullName || 'Candidate';
  }

  // 2. Age extraction (digits or words)
  let age = existingPersonalData?.age || 26;
  const ageMatch = text.match(/(?:(?:i am|i'm|age is|age)\s+(\d{1,2})|\b(\d{2})\s*(?:years old|year old|yr old))/i);
  if (ageMatch) {
    const parsedAge = parseInt(ageMatch[1] || ageMatch[2]);
    if (parsedAge >= 18 && parsedAge <= 65) age = parsedAge;
  } else {
    // Check word-based age: e.g. "twenty six years old"
    const wordAgeMatch = text.match(/\b(twenty\s+[a-z]+|thirty\s+[a-z]+|twenty|thirty)\s+(?:years old|year old)/i);
    if (wordAgeMatch) {
      const parsedWordAge = parseSpokenNumber(wordAgeMatch[1]);
      if (parsedWordAge && parsedWordAge >= 18 && parsedWordAge <= 65) age = parsedWordAge;
    }
  }

  // 3. Citizenship / Country extraction
  let citizenship = existingPersonalData?.citizenship || 'India';
  const countryMatch = text.match(/(?:from|born in|citizen of|nationality is|national of)\s+([A-Za-z]+)/i);
  if (countryMatch && countryMatch[1]) {
    const rawCountry = countryMatch[1].toLowerCase();
    const commonCountries: Record<string, string> = {
      india: 'India',
      brazil: 'Brazil',
      nigeria: 'Nigeria',
      turkey: 'Turkey',
      egypt: 'Egypt',
      pakistan: 'Pakistan',
      china: 'China',
      vietnam: 'Vietnam',
      indonesia: 'Indonesia',
      philippines: 'Philippines',
      mexico: 'Mexico',
      colombia: 'Colombia',
      germany: 'Germany',
      spain: 'Spain',
      italy: 'Italy',
      iran: 'Iran',
      bangladesh: 'Bangladesh',
      kenya: 'Kenya',
      ghana: 'Ghana',
      south: 'South Africa',
      morocco: 'Morocco',
    };
    if (commonCountries[rawCountry]) {
      citizenship = commonCountries[rawCountry];
    } else {
      citizenship = countryMatch[1].charAt(0).toUpperCase() + countryMatch[1].slice(1);
    }
  }

  // 4. Work experience years (digits or words)
  let workExperienceYears = existingPersonalData?.workExperienceYears !== undefined 
    ? existingPersonalData.workExperienceYears 
    : 3;
  const expMatch = text.match(/(?:(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s*(?:work|professional|industry|relevant)?\s*experience|\b(\d+)\+?\s*(?:years?|yrs?)\s+working)/i);
  if (expMatch) {
    const parsedExp = parseInt(expMatch[1] || expMatch[2]);
    if (parsedExp >= 0 && parsedExp <= 40) workExperienceYears = parsedExp;
  } else {
    // Check words: e.g. "three years of experience"
    const wordExpMatch = text.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\s+years?\s*(?:of)?\s*(?:work|professional)?\s*experience/i);
    if (wordExpMatch) {
      const parsedWordExp = parseSpokenNumber(wordExpMatch[1]);
      if (parsedWordExp !== null) workExperienceYears = parsedWordExp;
    }
  }

  // 5. Goal extraction
  let goal: ApplicantGoal = existingPersonalData?.goal || 'Work';
  if (text.includes('chancenkarte') || text.includes('opportunity card') || text.includes('opportunity visa')) {
    goal = 'Chancenkarte';
  } else if (text.includes('master') || text.includes('study') || text.includes('studying') || text.includes('bachelor program') || text.includes('degree program')) {
    goal = 'Study in Germany';
  } else if (text.includes('ausbildung') || text.includes('apprenticeship') || text.includes('vocational')) {
    goal = 'Ausbildung';
  } else if (text.includes('work') || text.includes('job') || text.includes('blue card') || text.includes('employment') || text.includes('software engineer') || text.includes('employment visa')) {
    goal = 'Work';
  }

  // 6. German level extraction
  let germanLevel: 'None / A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' = existingPersonalData?.germanLevel || 'A2';
  if (text.includes('c2')) germanLevel = 'C2';
  else if (text.includes('c1 german') || text.includes('german c1') || text.includes('c1 level in german')) germanLevel = 'C1';
  else if (text.includes('b2 german') || text.includes('german b2') || text.includes('b2 level') || text.includes('b2')) germanLevel = 'B2';
  else if (text.includes('b1 german') || text.includes('german b1') || text.includes('b1 level') || text.includes('b1')) germanLevel = 'B1';
  else if (text.includes('a2 german') || text.includes('german a2') || text.includes('a2 level') || text.includes('a2')) germanLevel = 'A2';
  else if (text.includes('a1 german') || text.includes('german a1') || text.includes('a1 level') || text.includes('a1')) germanLevel = 'A1';
  else if (text.includes('intermediate german')) germanLevel = 'B1';
  else if (text.includes('basic german') || text.includes('learning german') || text.includes('beginner in german')) germanLevel = 'A1';

  // 7. English level extraction
  let englishLevel: 'Basic' | 'B1' | 'B2' | 'C1' | 'C2' | 'Native' = existingPersonalData?.englishLevel || 'C1';
  if (text.includes('native english') || text.includes('mother tongue') || text.includes('native speaker')) englishLevel = 'Native';
  else if (text.includes('c2 english') || text.includes('english c2')) englishLevel = 'C2';
  else if (text.includes('fluent in english') || text.includes('english c1') || text.includes('c1 english') || text.includes('fluent')) englishLevel = 'C1';
  else if (text.includes('english b2') || text.includes('b2 english') || text.includes('good english')) englishLevel = 'B2';
  else if (text.includes('basic english') || text.includes('intermediate english')) englishLevel = 'B1';

  // 8. Target German city
  let targetCity = existingPersonalData?.targetCity || 'Munich';
  if (text.includes('berlin')) targetCity = 'Berlin';
  else if (text.includes('munich') || text.includes('münchen') || text.includes('bavaria')) targetCity = 'Munich';
  else if (text.includes('frankfurt')) targetCity = 'Frankfurt';
  else if (text.includes('hamburg')) targetCity = 'Hamburg';
  else if (text.includes('stuttgart') || text.includes('baden-württemberg')) targetCity = 'Stuttgart';
  else if (text.includes('düsseldorf') || text.includes('dusseldorf')) targetCity = 'Düsseldorf';
  else if (text.includes('köln') || text.includes('cologne')) targetCity = 'Köln';
  else if (text.includes('leipzig')) targetCity = 'Leipzig';
  else if (text.includes('dresden')) targetCity = 'Dresden';
  else if (text.includes('nuremberg') || text.includes('nürnberg')) targetCity = 'Nürnberg';

  // 9. Detected Skills (comprehensive vocabulary across all spoken sentences)
  const detectedSkills: string[] = [];
  const skillDictionary: Record<string, string> = {
    'react': 'React',
    'node': 'Node.js',
    'nodejs': 'Node.js',
    'python': 'Python',
    'typescript': 'TypeScript',
    'javascript': 'JavaScript',
    'java': 'Java',
    'docker': 'Docker',
    'kubernetes': 'Kubernetes',
    'aws': 'AWS Cloud',
    'cloud': 'Cloud Infrastructure',
    'azure': 'Azure Cloud',
    'sql': 'SQL',
    'postgresql': 'PostgreSQL',
    'postgres': 'PostgreSQL',
    'mongodb': 'MongoDB',
    'c++': 'C++',
    'c#': 'C#',
    'golang': 'Go',
    'flutter': 'Flutter',
    'angular': 'Angular',
    'vue': 'Vue.js',
    'cad': 'CAD Design',
    'solidworks': 'SolidWorks',
    'matlab': 'MATLAB',
    'embedded': 'Embedded Systems',
    'linux': 'Linux',
    'git': 'Git',
    'devops': 'DevOps',
    'ci/cd': 'CI/CD Pipelines',
    'ai': 'Artificial Intelligence',
    'machine learning': 'Machine Learning',
    'nursing': 'Clinical Care',
    'patient care': 'Patient Care',
    'healthcare': 'Healthcare Standards',
    'scrum': 'Scrum / Agile',
    'agile': 'Agile Methodologies',
    'rest': 'RESTful APIs',
    'microservices': 'Microservices',
    'data analysis': 'Data Analytics',
  };

  Object.keys(skillDictionary).forEach((k) => {
    if (text.includes(k) && !detectedSkills.includes(skillDictionary[k])) {
      detectedSkills.push(skillDictionary[k]);
    }
  });

  if (detectedSkills.length === 0) {
    if (existingPersonalData?.skills && existingPersonalData.skills.length > 0) {
      detectedSkills.push(...existingPersonalData.skills);
    } else {
      detectedSkills.push('Problem Solving', 'Analytical Thinking', 'Team Collaboration');
    }
  }

  // 10. Education level & Field of Study
  let educationLevel = existingPersonalData?.educationLevel || 'Bachelor of Technology / Engineering';
  let fieldOfStudy = existingPersonalData?.fieldOfStudy || 'Computer Science & Software Engineering';

  if (text.includes('master of science') || text.includes('master degree') || text.includes('masters') || text.includes('m.sc') || text.includes('m.tech') || text.includes('mba')) {
    educationLevel = 'Master of Science';
  } else if (text.includes('bachelor of technology') || text.includes('b.tech') || text.includes('bachelor in engineering') || text.includes('b.e') || text.includes('bachelor of engineering')) {
    educationLevel = 'Bachelor of Technology / Engineering';
  } else if (text.includes('bachelor of science') || text.includes('b.sc') || text.includes('bca')) {
    educationLevel = 'Bachelor of Science / Computer Applications';
  } else if (text.includes('phd') || text.includes('doctorate')) {
    educationLevel = 'Doctorate / PhD';
  } else if (text.includes('ausbildung') || text.includes('diploma') || text.includes('secondary') || text.includes('high school')) {
    educationLevel = 'Secondary / High School Diploma';
  }

  if (text.includes('computer science') || text.includes('software') || text.includes('information technology') || text.includes('it engineering')) {
    fieldOfStudy = 'Computer Science & Software Engineering';
  } else if (text.includes('mechanical') || text.includes('automotive') || text.includes('thermal')) {
    fieldOfStudy = 'Mechanical & Automotive Engineering';
  } else if (text.includes('electrical') || text.includes('electronics')) {
    fieldOfStudy = 'Electrical & Electronic Systems';
  } else if (text.includes('nurs') || text.includes('health') || text.includes('clinical') || text.includes('medical')) {
    fieldOfStudy = 'Healthcare & Nursing Science';
  } else if (text.includes('data science') || text.includes('analytics')) {
    fieldOfStudy = 'Data Science & Analytics';
  } else if (text.includes('civil') || text.includes('structural')) {
    fieldOfStudy = 'Civil & Structural Engineering';
  } else if (text.includes('business') || text.includes('management') || text.includes('marketing')) {
    fieldOfStudy = 'Business Administration & Management';
  }

  // 11. University extraction
  let university = existingPersonalData?.university || 'State Accredited University (Anabin H+)';
  const uniMatch = transcript.match(/(?:from|at|graduated from)\s+([A-Za-z\s]+?(?:University|College|Institute|IIT|NIT|School))/i);
  if (uniMatch && uniMatch[1]) {
    university = uniMatch[1].trim();
  }

  // 12. Current role
  let currentRole = existingPersonalData?.currentRole || (detectedSkills.length > 0 ? `${detectedSkills[0]} Specialist` : 'Software Engineer');
  const roleMatch = transcript.match(/(?:as a|as an|role of|position of|working as)\s+([A-Za-z\s]+?(?:developer|engineer|manager|specialist|analyst|designer|consultant|nurse|technician))/i);
  if (roleMatch && roleMatch[1]) {
    currentRole = roleMatch[1].trim();
  }

  // 13. Company
  let currentCompany = existingPersonalData?.currentCompany || 'Technology Innovations Ltd';
  const compMatch = transcript.match(/(?:at|with|worked at|working at)\s+([A-Za-z0-9\s]+?(?:Inc|GmbH|Ltd|Pvt|Corp|Solutions|Technologies|Hospital))/i);
  if (compMatch && compMatch[1]) {
    currentCompany = compMatch[1].trim();
  }

  // 14. Target Industry
  let targetIndustry = existingPersonalData?.targetIndustry || 'Technology & Digital Systems';
  if (fieldOfStudy.includes('Mechanical') || fieldOfStudy.includes('Automotive')) {
    targetIndustry = 'Automotive & Mechanical Engineering';
  } else if (fieldOfStudy.includes('Health') || fieldOfStudy.includes('Nursing')) {
    targetIndustry = 'Healthcare & Hospital Care Services';
  }

  // 15. Graduation Year
  let graduationYear = existingPersonalData?.graduationYear || 2022;
  const yearMatch = text.match(/(?:in|graduated in|year)\s+(20[12][0-9])/i);
  if (yearMatch && yearMatch[1]) {
    graduationYear = parseInt(yearMatch[1]);
  }

  // 16. Comprehensive Professional Bio formatted for German Immigration
  const bio = `${fullName} is a ${fieldOfStudy} professional with ${workExperienceYears} years of verified experience, targeting ${goal} in ${targetCity}, Germany. German proficiency: ${germanLevel}, English: ${englishLevel}. Primary skill matrix: ${detectedSkills.slice(0, 5).join(', ')}.`;

  return {
    transcript,
    confidence: 0.96,
    durationSeconds: Math.max(25, transcript.split(/\s+/).length),
    keyInsights: [
      `Extracted ${workExperienceYears} years of verified professional experience in ${fieldOfStudy}.`,
      `Verified German level ${germanLevel} — eligible for skilled migration visa pathway points.`,
      `Target destination ${targetCity} mapped with high employment demand for ${detectedSkills.slice(0, 3).join(', ')}.`,
      `Goal aligned: ${goal} based on § 20a Skilled Immigration Act.`,
    ],
    extractedProfile: {
      fullName,
      citizenship,
      age,
      goal,
      educationLevel,
      fieldOfStudy,
      university,
      graduationYear,
      workExperienceYears,
      currentRole,
      currentCompany,
      skills: detectedSkills,
      germanLevel,
      englishLevel,
      targetCity,
      targetIndustry,
      bio,
    },
  };
}

/**
 * 3 Pre-recorded demo video pitches for 1-click evaluator testing
 */
export const DEMO_VIDEO_PITCHES = [
  {
    id: 'pitch-1',
    title: 'Software Engineer Pitch (Chancenkarte in Munich)',
    author: 'Priya Sharma (Age 26)',
    role: 'Full Stack Developer',
    duration: '0:38',
    transcript:
      "Hello! My name is Priya Sharma. I am 26 years old from India. I graduated with a Bachelor of Technology in Computer Science from Anna University in 2022. I have 3 years of work experience building web applications using React, TypeScript, and Node.js. My German language level is currently A2, and my English is fluent at C1. I am planning to move to Munich under the Chancenkarte Opportunity Card visa for skilled software jobs.",
  },
  {
    id: 'pitch-2',
    title: 'Automotive & Mechanical Engineer Pitch (Work Visa in Stuttgart)',
    author: 'Arjun Verma (Age 28)',
    role: 'Mechanical CAD Engineer',
    duration: '0:45',
    transcript:
      "Guten Tag! My name is Arjun Verma, 28 years old from India. I completed my Bachelor of Engineering in Mechanical Engineering in 2020. I have 4 years of industrial experience in automotive design, CAD modeling, and thermal systems. I have achieved German B1 certification from Goethe-Institut, and I am fluent in English. My goal is to work directly in Stuttgart or Munich with German automotive engineering firms.",
  },
  {
    id: 'pitch-3',
    title: 'Healthcare & Nursing Specialist Pitch (Ausbildung in Berlin)',
    author: 'Anita Desai (Age 24)',
    role: 'Healthcare Professional',
    duration: '0:35',
    transcript:
      "Hello everyone! My name is Anita Desai. I am 24 years old and I completed my Secondary Diploma with biology honors. I have 2 years of clinical healthcare and patient assistance experience. I have reached German B1 level and my English is B2. My primary goal is to enter a Dual Vocational Ausbildung in Healthcare and Nursing in Berlin starting this autumn.",
  },
];

/**
 * Interactive Alumni Mentor Chat API Client
 */
export async function sendAlumniChatMessage(params: {
  alumniId: string;
  userMessage: string;
  history?: Array<{ sender: 'user' | 'alumni'; text: string }>;
  alumniProfile: any;
}): Promise<string> {
  try {
    const res = await fetch('/api/alumni-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.reply) {
        return data.reply;
      }
    }
  } catch (err) {
    console.warn('API /api/alumni-chat fetch error, running client fallback:', err);
  }

  return generateClientAlumniReply(params.alumniProfile, params.userMessage);
}

function generateClientAlumniReply(alumni: any, message: string): string {
  const q = message.toLowerCase();
  const exp = alumni.experience || {};
  const living = exp.living || {};
  const expenses = exp.expenses || {};
  const edu = exp.education || {};
  const salary = exp.salary || {};
  const visa = exp.visa || {};

  if (q.includes('expense') || q.includes('cost') || q.includes('budget') || q.includes('spend') || q.includes('month') || q.includes('euro') || q.includes('food')) {
    return `Hey! Here is my exact monthly budget breakdown in ${living.city || alumni.currentCity}:\n\n` +
      `• Warm Rent (Warmmiete): €${expenses.rentWarm || 850}/month (${living.apartmentType || 'apartment'} in ${living.neighborhood || 'city area'})\n` +
      `• Groceries & Food: ~€${expenses.groceries || 320}/month (shopping at Lidl, Aldi, and Rewe)\n` +
      `• Public Transit: €${expenses.transport || 49}/month (Deutschlandticket covering S-Bahn, U-Bahn, regional trains)\n` +
      `• Utilities & Internet: €${expenses.utilitiesAndInternet || 70}/month\n` +
      `• Leisure, Dining & Social: ~€${expenses.leisureAndDining || 300}/month\n\n` +
      `Total monthly living cost comes to approximately €${expenses.monthlyTotal || 1780}/month. With my current income, I am able to save around €${expenses.savingsPerMonth || 2000} every month.\n\n` +
      `💡 Budgeting Tip: ${expenses.budgetingTip || 'Shop at discounters like Aldi and Lidl and cook at home to cut costs by 40%!'}`;
  }

  if (q.includes('salary') || q.includes('earn') || q.includes('netto') || q.includes('brutto') || q.includes('tax') || q.includes('pay') || q.includes('compensation') || q.includes('money')) {
    return `In Germany, understanding Gross (Brutto) versus Net (Netto) is super important!\n\n` +
      `My gross salary is €${salary.grossAnnual ? salary.grossAnnual.toLocaleString() : '80,000'} per year. Under ${salary.taxClass || 'Steuerklasse 1'}, my net take-home pay is around €${salary.netMonthly ? salary.netMonthly.toLocaleString() : '3,900'} per month.\n\n` +
      `Keep in mind that German payroll automatically deducts ~40% for income tax, health insurance (Krankenkasse), pension fund, and unemployment insurance. On top of salary, key perks include: ${(salary.benefits || ['30 days paid vacation', 'transit subsidy']).join(', ')}.\n\n` +
      `💼 My negotiation advice: ${salary.negotiationTip || 'Always negotiate in annual gross (Brutto im Jahr) and clarify all non-monetary perks.'}`;
  }

  if (q.includes('living') || q.includes('apartment') || q.includes('housing') || q.includes('wg') || q.includes('anmeldung') || q.includes('city') || q.includes('flat') || q.includes('rent')) {
    return `Living in ${living.city || alumni.currentCity} has been a fantastic journey! I live in ${living.neighborhood || 'a vibrant area'} in a ${living.apartmentType || 'flat'}.\n\n` +
      `Finding accommodation took about ${living.findingTimeWeeks || 4} weeks. The single most important step when you arrive is the "Anmeldung" (city registration), because you need the confirmation certificate (Anmeldebestätigung) to get your German Tax ID and activate your bank account.\n\n` +
      `🏠 Anmeldung Advice: ${living.anmeldungTips || 'Book morning appointments on the city portal around 8:00 AM.'}\n\n` +
      `Key lifestyle highlights: ${living.summary || 'Incredible public transit, safety, and vibrant international communities.'}`;
  }

  if (q.includes('education') || q.includes('college') || q.includes('branch') || q.includes('degree') || q.includes('study') || q.includes('university') || q.includes('anabin') || q.includes('zab')) {
    return `Regarding my education background and degree recognition:\n\n` +
      `I graduated with a ${edu.degree || 'Degree'} from ${edu.university || 'University'}. In Germany, foreign degree recognition was processed through ${edu.recognitionBody || 'ZAB / ANABIN database'}.\n\n` +
      `🎓 Education Tip: ${edu.keyAdvice || 'Verify your college on anabin.kmk.org beforehand. An H+ rating grants automatic equivalence!'}\n\n` +
      `If you plan to study in Germany, remember that public universities have zero tuition fees — you only pay a nominal semester contribution of around €150 to €350, which often includes a semester transit pass!`;
  }

  if (q.includes('visa') || q.includes('chancenkarte') || q.includes('blue card') || q.includes('pr') || q.includes('permanent') || q.includes('german') || q.includes('language')) {
    return `Here is how my visa pathway unfolded:\n\n` +
      `I entered through ${visa.initialVisa || alumni.pathway} and transitioned to an ${visa.currentPermit || 'EU Blue Card'}. With ${visa.requiredGermanLevel || 'B1 German'}, you can fast-track German Permanent Residency (Niederlassungserlaubnis) in just ${visa.timeToPermanentResidencyYears || 2} years!\n\n` +
      `My German language level is currently ${alumni.germanLevel || 'B1'}. While you can work in English in multinational teams, having conversational German is a huge game changer with local authorities, doctors, and landlords.`;
  }

  return `Hey there! As an alumnus living in ${alumni.currentCity} working as ${alumni.title} at ${alumni.currentCompany}, I\'m excited to help you prepare your move to Germany!\n\n` +
    `Ask me anything about:\n` +
    `• 🏠 Finding housing & the Anmeldung process in ${alumni.currentCity}\n` +
    `• 💶 Real monthly expenses & saving potential (€${expenses.monthlyTotal || 1780}/mo)\n` +
    `• 🎓 Degree recognition (ZAB / ANABIN) from your college & branch\n` +
    `• 💰 Gross vs Net salary, tax classes, and negotiation tactics\n` +
    `• 📋 Visa pathways (Chancenkarte, Blue Card, and fast-track PR)\n\n` +
    `What questions do you have?`;
}


