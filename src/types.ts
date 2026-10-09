/**
 * GermanPath AI - Core Types
 */

export type ApplicantGoal = 
  | 'Study in Germany'
  | 'Ausbildung'
  | 'Work'
  | 'Chancenkarte';

export type DocumentType = 
  | 'PASSPORT'
  | 'DEGREE'
  | 'TRANSCRIPT'
  | 'EXPERIENCE_LETTER'
  | 'LANGUAGE_CERT'
  | 'CV'
  | 'ID';

export interface ManipulationRegion {
  area: string;
  confidence: number;
  note: string;
}

export interface VerificationCheck {
  passed: boolean;
  score?: number;
  detected?: boolean;
  label: string;
  detail: string;
}

export interface VerificationResult {
  authenticityScore: number; // 0-100
  isManipulated: boolean;
  isAIGenerated: boolean;
  manipulationRegions: ManipulationRegion[];
  confidence: 'High' | 'Medium' | 'Low';
  verified: boolean;
  checks: {
    authenticity: VerificationCheck;
    manipulation: VerificationCheck;
    aiGenerated: VerificationCheck;
  };
  nextBestAction?: string;
  verifiedAt: string;
}

export interface ApplicantDocument {
  id: string;
  name: string;
  type: DocumentType;
  fileSize: number;
  uploadedAt: string;
  status: 'pending' | 'verifying' | 'verified' | 'failed';
  rawText: string;
  verification?: VerificationResult;
}

export interface PersonalData {
  fullName: string;
  citizenship: string;
  age: number;
  goal: ApplicantGoal;
  // Step 2: Education
  educationLevel: string;
  fieldOfStudy: string;
  university: string;
  graduationYear: number;
  gpa: string;
  // Step 3: Work Experience
  workExperienceYears: number;
  currentRole: string;
  currentCompany: string;
  skills: string[];
  // Step 4: Language
  germanLevel: 'None / A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  englishLevel: 'Basic' | 'B1' | 'B2' | 'C1' | 'C2' | 'Native';
  hasLanguageCert: boolean;
  // Step 5: Preferences
  targetCity: string;
  targetIndustry: string;
  bio: string;
  // DigiLocker
  digiLockerVerified: boolean;
  digiLockerVerifiedAt?: string;
  digiLockerDocId?: string;
}

export interface CVAnalysisResult {
  overallScore: number;
  din5008Compliant: boolean;
  europassReady: boolean;
  germanLanguageMentioned: boolean;
  hasPhotoPlacement: boolean;
  missingSections: string[];
  gapAnalysis: string[];
  keywordSuggestions: string[];
  strengths: string[];
  actionableRecommendations: string[];
}

export interface GermanCVWorkExp {
  role: string;
  company: string;
  city: string;
  startDate: string;
  endDate: string;
  tasks: string[];
}

export interface GermanCVEducation {
  degree: string;
  institution: string;
  city: string;
  startYear: string;
  endYear: string;
  grade: string;
}

export interface GermanCV {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    nationality: string;
    birthDate: string;
    photoUrl?: string;
  };
  profileSummary: string;
  targetRole: string;
  workExperience: GermanCVWorkExp[];
  education: GermanCVEducation[];
  skills: string[];
  languages: { language: string; level: string }[];
  certifications: string[];
  placeAndDate: string;
  signatureName: string;
}

export interface ChancenkarteItem {
  category: string;
  points: number;
  maxPoints: number;
  reason: string;
  qualified: boolean;
}

export interface QualificationData {
  anabinStatus: 'H+' | 'H+/-' | 'H-' | 'Unknown';
  institutionName: string;
  degreeName: string;
  recognitionCheckDate: string;
  chancenkartePoints: number;
  chancenkarteEligible: boolean;
  chancenkarteBreakdown: ChancenkarteItem[];
}

export interface VideoTranscribeResult {
  transcript: string;
  confidence: number;
  durationSeconds: number;
  extractedProfile: Partial<PersonalData>;
  keyInsights: string[];
}

export interface VideoPitchData {
  hasVideo: boolean;
  videoUrl?: string;
  videoFileName?: string;
  recordedAt?: string;
  transcript?: string;
  confidence?: number;
  keyInsights?: string[];
  extractedProfile?: Partial<PersonalData>;
  profileApplied?: boolean;
}

export interface Applicant {
  id: string;
  email: string;
  fullName: string;
  goal: ApplicantGoal;
  xpPoints: number;
  completionPercentage: number;
  personalData: PersonalData;
  documents: ApplicantDocument[];
  cvData: {
    hasOldCv: boolean;
    oldCvFileName?: string;
    oldCvAnalysis?: CVAnalysisResult;
    generatedCv?: GermanCV;
  };
  videoPitchData?: VideoPitchData;
  qualificationData: QualificationData;
  createdAt: string;
  updatedAt: string;
  lastSyncedAt: string;
}

export type AlumniTopicCategory = 'living' | 'expense' | 'education' | 'salary' | 'visa' | 'general';

export interface AlumniExperience {
  living: {
    city: string;
    neighborhood: string;
    apartmentType: string;
    findingTimeWeeks: number;
    anmeldungTips: string;
    summary: string;
    lifestylePros: string[];
    lifestyleChallenges: string[];
  };
  expenses: {
    monthlyTotal: number;
    rentWarm: number;
    groceries: number;
    healthInsurance: number;
    transport: number;
    utilitiesAndInternet: number;
    leisureAndDining: number;
    savingsPerMonth: number;
    budgetingTip: string;
  };
  education: {
    degree: string;
    university: string;
    recognitionBody: string; // e.g. ZAB Statement of Comparability / ANABIN H+
    durationYears: number;
    languageMedium: string;
    tuitionPerSemester: number;
    keyAdvice: string;
  };
  salary: {
    grossAnnual: number;
    netMonthly: number;
    taxClass: string;
    tariffGroup?: string;
    bonusPercent?: number;
    benefits: string[];
    negotiationTip: string;
  };
  visa: {
    initialVisa: string;
    currentPermit: string;
    timeToPermanentResidencyYears: number;
    requiredGermanLevel: string;
  };
}

export interface AlumniVideoData {
  videoUrl: string;
  youtubeId?: string;
  previewThumbnail: string;
  duration: string;
  title: string;
  summary: string;
  chapters: {
    title: string;
    time: string;
    topic: AlumniTopicCategory;
    summary?: string;
  }[];
}

export interface AlumniProfile {
  id: string;
  name: string;
  title: string;
  collegeName: string;
  branchName: string;
  currentCompany: string;
  currentCity: string;
  countryOfOrigin: string;
  avatarUrl: string;
  badge: string;
  pathway: string;
  yearsInGermany: number;
  germanLevel: string;
  englishLevel: string;
  shortBio: string;
  quote: string;
  experience: AlumniExperience;
  video: AlumniVideoData;
  sampleQuestions: {
    category: AlumniTopicCategory;
    question: string;
  }[];
}

export interface AlumniChatMessage {
  id: string;
  alumniId: string;
  sender: 'user' | 'alumni';
  text: string;
  timestamp: string;
  category?: AlumniTopicCategory;
}

