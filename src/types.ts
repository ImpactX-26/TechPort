export type GermanyGoal = 'Study in Germany' | 'Ausbildung in Germany' | 'Work in Germany';

export type GermanLevel = 'Not yet started' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type QualificationStatus = 'Ready' | 'Needs Attention' | 'Incomplete' | 'Under Review';

export type DocumentType = 
  | 'degree_certificate' 
  | 'marks_card' 
  | 'german_language_certificate' 
  | 'cv' 
  | 'experience_letter' 
  | 'passport' 
  | 'statement_of_purpose' 
  | 'video_intro'
  | 'other';

export type DocumentStatus = 
  | 'Uploaded' 
  | 'Analyzing' 
  | 'Analyzed' 
  | 'Verified' 
  | 'Needs Review' 
  | 'Potential Inconsistency';

export type FieldProvenance = 
  | 'user_provided' 
  | 'document_extracted' 
  | 'ai_inferred' 
  | 'needs_verification';

export interface ProvenanceField<T> {
  value: T;
  source: FieldProvenance;
  sourceDocId?: string;
  confidence?: number;
  lastUpdated?: string;
}

export interface ApplicantPersonalInfo {
  fullName: ProvenanceField<string>;
  country: ProvenanceField<string>;
  age: ProvenanceField<number>;
  email?: ProvenanceField<string>;
}

export interface ApplicantEducationInfo {
  highestQualification: ProvenanceField<string>;
  fieldOfStudy: ProvenanceField<string>;
  institution: ProvenanceField<string>;
  graduationYear: ProvenanceField<number>;
  gradeOrGpa?: ProvenanceField<string>;
}

export interface ApplicantExperienceInfo {
  yearsOfExperience: ProvenanceField<number>;
  currentOrRecentRole: ProvenanceField<string>;
  skills: ProvenanceField<string[]>;
  company?: ProvenanceField<string>;
}

export interface AlumniProfile {
  id: string;
  name: string;
  photoUrl: string;
  batch: string;
  currentRole: string;
  college: string;
  course: string;
  field: string;
  origin: string;
  originState: string;
  experienceTags: string[];
  rating: {
    teaching: number;
    hostel: number;
    partTime: number;
    overall: number;
  };
  expectationVsReality: {
    expected: string;
    reality: string;
    tip: string;
  };
  isVerifiedAlumni: boolean;
  availableForChat: boolean;
  responseTime: string;
  languages: string[];
  videoRealityUrl?: string;
  quote: string;
  matchReason?: string;
}

export interface AlumniNetworkData {
  targetCollege: string;
  targetCourse: string;
  targetField?: string;
  originState?: string;
  matchedAlumni: AlumniProfile[];
  expectationCheckCompleted?: boolean;
  expectationGapScore?: number;
  gapAnalysis?: {
    expenses: { expected: string; reality: string; gapDetected: boolean };
    jobs: { expected: string; reality: string; gapDetected: boolean };
    language: { expected: string; reality: string; gapDetected: boolean };
  };
}

export interface ApplicantProfile {
  personal: ApplicantPersonalInfo;
  education: ApplicantEducationInfo;
  experience: ApplicantExperienceInfo;
  languageLevel: ProvenanceField<GermanLevel>;
  goal: ProvenanceField<GermanyGoal>;
  completionPercentage: number;
  lastAgentReview?: string;
  alumniNetwork?: AlumniNetworkData;
}

export type ForensicFinalStatus = 'VERIFIED' | 'NEEDS_MANUAL_REVIEW' | 'SUSPECTED_FAKE' | 'SAMPLE_DEMO';

export interface ForensicVerificationResult {
  isAuthentic: boolean;
  finalStatus: ForensicFinalStatus;
  confidence: number;
  aiGeneratedProbability: number;
  manipulationScore: number;
  isSampleDemo: boolean;
  extractedData: Record<string, any>;
  forensicFlags: string[];
  inconsistencies: string[];
  externalVerification: {
    source: string;
    status: string;
    verified: boolean;
    verificationId?: string;
  };
  verificationSummary: string;
  layer1VisualForensics?: {
    aiArtifactsDetected: boolean;
    manipulationDetected: boolean;
    metadataSoftware?: string;
    details: string;
  };
  layer2Consistency?: {
    profileMatch: boolean;
    transcriptMatch: boolean;
    certificateIdValid: boolean;
    details: string;
  };
  layer3TrustAnchor?: {
    registryChecked: string;
    registryResponse: string;
    verified: boolean;
  };
}

export interface DocumentRecord {
  id: string;
  applicantId: string;
  name: string;
  type: DocumentType;
  fileSize?: string;
  uploadedAt: string;
  status: DocumentStatus;
  extractedData?: Record<string, any>;
  inconsistencies?: string[];
  notes?: string;
  rawTextPreview?: string;
  rawText?: string;
  forensics?: ForensicVerificationResult;
  pdfBase64?: string;
}

export interface RequirementCheck {
  id: string;
  title: string;
  description: string;
  status: 'matched' | 'missing' | 'review_required';
  category: 'Education' | 'Language' | 'Experience' | 'Documents' | 'Financial/Visa';
  details?: string;
}

export interface QualificationAssessment {
  id: string;
  applicantId: string;
  overallStatus: QualificationStatus;
  targetGoal: GermanyGoal;
  matchedRequirements: RequirementCheck[];
  missingRequirements: RequirementCheck[];
  potentialIssues: RequirementCheck[];
  evaluatedAt: string;
  agentSummary: string;
  disclaimer: string;
}

export interface GapItem {
  id: string;
  type: 'missing_document' | 'missing_information' | 'inconsistent_information' | 'requirement_unmet';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  affectedField?: string;
  sourceDiscrepancy?: {
    profileValue: string;
    documentValue: string;
    documentName: string;
  };
  detectedAt: string;
}

export interface NextBestAction {
  id: string;
  applicantId: string;
  title: string;
  actionType: 
    | 'upload_missing_document' 
    | 'verify_information' 
    | 'complete_profile' 
    | 'improve_language' 
    | 'review_qualification' 
    | 'generate_cv' 
    | 'provide_additional_info'
    | 'journey_complete';
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
  targetDocumentType?: DocumentType;
  suggestedActionLabel: string;
  createdAt: string;
  completed: boolean;
}

export interface AgentActivityLog {
  id: string;
  timestamp: string;
  agentName: 'Document Agent' | 'Profile Agent' | 'Qualification Agent' | 'Gap Agent' | 'Routing Agent' | 'Orchestrator' | 'CV Agent' | 'Multimodal Agent' | 'Alumni Agent';
  status: 'running' | 'completed' | 'warning' | 'error';
  headline: string;
  detail: string;
  metadata?: Record<string, any>;
}

export interface JourneyStep {
  stepNumber: number;
  id: string;
  name: string;
  status: 'completed' | 'current' | 'warning' | 'pending' | 'locked';
  description: string;
}

export interface GeneratedCV {
  id: string;
  applicantId: string;
  fullName: string;
  targetGoal: string;
  contactEmail?: string;
  summary: string;
  education: Array<{
    degree: string;
    field: string;
    institution: string;
    year: number;
    details?: string;
  }>;
  experience: Array<{
    role: string;
    company: string;
    years: number;
    highlights: string[];
  }>;
  skills: string[];
  languages: Array<{
    language: string;
    level: string;
  }>;
  verifiedDocuments: string[];
  generatedAt: string;
}

export interface ApplicantEntity {
  id: string;
  name: string;
  country: string;
  age: number;
  goal: GermanyGoal;
  germanLevel: GermanLevel;
  createdAt: string;
  updatedAt: string;
  profile: ApplicantProfile;
  documents: DocumentRecord[];
  qualification: QualificationAssessment;
  gaps: GapItem[];
  nextBestAction: NextBestAction;
  journeySteps: JourneyStep[];
  activityLogs: AgentActivityLog[];
  cv?: GeneratedCV;
  alumniNetwork?: AlumniNetworkData;
}
