import { 
  ApplicantEntity, 
  ApplicantProfile, 
  DocumentRecord, 
  QualificationAssessment, 
  GapItem, 
  NextBestAction, 
  JourneyStep, 
  AgentActivityLog 
} from './types';

export const POSTGRES_DDL_SCHEMA = `
-- ==========================================================
-- GermanPath AI: PostgreSQL Enterprise Relational Schema
-- ==========================================================

CREATE TABLE IF NOT EXISTS applicants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL,
    goal VARCHAR(100) NOT NULL, -- 'Study in Germany', 'Ausbildung in Germany', 'Work in Germany'
    german_level VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applicant_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    highest_qualification VARCHAR(255) NOT NULL,
    field_of_study VARCHAR(255) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    graduation_year INTEGER NOT NULL,
    years_of_experience NUMERIC(4, 1) DEFAULT 0,
    recent_role VARCHAR(255),
    skills JSONB DEFAULT '[]'::jsonb,
    provenance_metadata JSONB NOT NULL,
    completion_percentage INTEGER NOT NULL DEFAULT 0,
    last_agent_review TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'Uploaded', 'Analyzing', 'Analyzed', 'Verified', 'Needs Review', 'Potential Inconsistency'
    file_size VARCHAR(50),
    extracted_data JSONB,
    inconsistencies JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS qualifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    overall_status VARCHAR(50) NOT NULL, -- 'Ready', 'Needs Attention', 'Incomplete', 'Under Review'
    target_goal VARCHAR(100) NOT NULL,
    agent_summary TEXT NOT NULL,
    disclaimer TEXT NOT NULL,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qualification_id UUID NOT NULL REFERENCES qualifications(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'matched', 'missing', 'review_required'
    description TEXT NOT NULL,
    details TEXT
);

CREATE TABLE IF NOT EXISTS gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    affected_field VARCHAR(100),
    source_discrepancy JSONB,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS next_best_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    reason TEXT NOT NULL,
    target_document_type VARCHAR(100),
    suggested_action_label VARCHAR(100) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    agent_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    headline VARCHAR(255) NOT NULL,
    detail TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cvs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    target_goal VARCHAR(100) NOT NULL,
    summary TEXT NOT NULL,
    education JSONB NOT NULL,
    experience JSONB NOT NULL,
    skills JSONB NOT NULL,
    languages JSONB NOT NULL,
    verified_documents JSONB NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS journey_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

export function getInitialJourneySteps(qualificationStatus: string = 'Needs Attention', hasGaps: boolean = true): JourneyStep[] {
  return [
    { stepNumber: 1, id: 'profile_created', name: 'Profile Created', status: 'completed', description: 'Personal, education, experience and language profile registered' },
    { stepNumber: 2, id: 'documents_added', name: 'Documents Added', status: 'completed', description: 'Academic transcripts, degree certificate & identity files uploaded' },
    { stepNumber: 3, id: 'documents_analyzed', name: 'Documents Analyzed', status: 'completed', description: 'Document Agent OCR and structured metadata extraction completed' },
    { stepNumber: 4, id: 'profile_structured', name: 'Profile Structured', status: 'completed', description: 'Profile Agent integrated records with provenance confidence levels' },
    { stepNumber: 5, id: 'qualification_assessment', name: 'Qualification Assessment', status: qualificationStatus === 'Ready' ? 'completed' : 'warning', description: 'Evaluated against German Work / Blue Card criteria baseline' },
    { stepNumber: 6, id: 'missing_requirements', name: 'Missing Requirements', status: hasGaps ? 'warning' : 'completed', description: hasGaps ? 'Experience letter verification gap detected' : 'All critical requirements fulfilled' },
    { stepNumber: 7, id: 'next_best_action', name: 'Next Best Action', status: 'current', description: 'Routing Agent prioritized immediate next step to advance journey' },
    { stepNumber: 8, id: 'journey_completion', name: 'Journey Completion', status: qualificationStatus === 'Ready' && !hasGaps ? 'completed' : 'locked', description: 'Locked until experience verification and final checklist are resolved' }
  ];
}

export function createDemoApplicant(): ApplicantEntity {
  const applicantId = 'demo-rahul-sharma';
  
  const initialDocuments: DocumentRecord[] = [
    {
      id: 'doc-1',
      applicantId,
      name: 'Degree_Certificate_BTech.pdf',
      type: 'degree_certificate',
      fileSize: '1.8 MB',
      uploadedAt: '2026-10-06T14:30:00Z',
      status: 'Verified',
      extractedData: {
        documentType: 'degree_certificate',
        name: 'Rahul Sharma',
        degree: 'Bachelor of Technology (B.Tech)',
        field: 'Computer Science & Engineering',
        institution: 'National Institute of Technology',
        graduationYear: 2024,
        grade: 'First Class with Distinction (8.6 CGPA)',
        anabinEquivalent: 'Entspricht (H+ Recognized)'
      },
      rawTextPreview: 'Bachelor of Technology in Computer Science awarded to Rahul Sharma with Distinction, graduation year 2024.'
    },
    {
      id: 'doc-2',
      applicantId,
      name: 'Academic_Transcripts_Marks_Card.pdf',
      type: 'marks_card',
      fileSize: '2.4 MB',
      uploadedAt: '2026-10-06T14:32:00Z',
      status: 'Verified',
      extractedData: {
        documentType: 'marks_card',
        institution: 'National Institute of Technology',
        semesters: 8,
        totalCredits: 160,
        majorSubjects: ['Algorithms', 'Software Architecture', 'Databases', 'Cloud Systems']
      },
      rawTextPreview: 'Consolidated Academic Marks Card: Cumulative GPA 8.6/10.0 across 8 semesters.'
    },
    {
      id: 'doc-3',
      applicantId,
      name: 'Goethe_Zertifikat_B1.pdf',
      type: 'german_language_certificate',
      fileSize: '950 KB',
      uploadedAt: '2026-10-06T14:35:00Z',
      status: 'Verified',
      extractedData: {
        documentType: 'german_language_certificate',
        certifyingBody: 'Goethe-Institut',
        cefrLevel: 'B1',
        modules: { Lesen: 84, Horen: 78, Schreiben: 82, Sprechen: 80 },
        issueDate: '2025-11-15'
      },
      rawTextPreview: 'Goethe-Zertifikat B1 verliehen an Rahul Sharma. Gesamtergebnis: Gut.'
    },
    {
      id: 'doc-4',
      applicantId,
      name: 'Comprehensive_Resume_Rahul_Sharma.pdf',
      type: 'cv',
      fileSize: '420 KB',
      uploadedAt: '2026-10-06T14:40:00Z',
      status: 'Analyzed',
      extractedData: {
        documentType: 'cv',
        yearsOfExperience: 2,
        roles: ['Junior Full-Stack Software Engineer', 'Software Engineering Intern'],
        technologies: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS']
      },
      rawTextPreview: 'Software engineer with 2 years of practical experience building distributed web apps.'
    },
    {
      id: 'doc-5',
      applicantId,
      name: 'Passport_Scan_Biometric.pdf',
      type: 'passport',
      fileSize: '1.2 MB',
      uploadedAt: '2026-10-06T14:42:00Z',
      status: 'Verified',
      extractedData: {
        documentType: 'passport',
        nationality: 'India',
        validity: 'Valid until 2033',
        machineReadableZoneVerified: true
      },
      rawTextPreview: 'Republic of India Passport. Expiry: 2033.'
    },
    {
      id: 'doc-6',
      applicantId,
      name: 'Internship_Completion_Certificate.pdf',
      type: 'other',
      fileSize: '650 KB',
      uploadedAt: '2026-10-06T14:45:00Z',
      status: 'Verified',
      extractedData: {
        documentType: 'other',
        title: '6-Month Software Engineering Internship Certificate',
        organization: 'Apex Cloud Solutions',
        duration: 'Jan 2024 - Jun 2024'
      },
      rawTextPreview: 'Successfully completed 6-month full-time internship working on microservices architecture.'
    },
    {
      id: 'doc-7',
      applicantId,
      name: 'Statement_of_Purpose_Germany.pdf',
      type: 'statement_of_purpose',
      fileSize: '310 KB',
      uploadedAt: '2026-10-06T14:48:00Z',
      status: 'Analyzed',
      extractedData: {
        documentType: 'statement_of_purpose',
        targetLocation: 'Berlin / Munich',
        careerAspiration: 'Qualified ICT Specialist under EU Blue Card regulations'
      },
      rawTextPreview: 'Statement of Purpose outlining engineering track in Germany and commitment to integration.'
    }
    // Note: Documents 8 & 9 (Official Work Experience Verification Letter and Anabin University Statement) are missing!
  ];

  const profile: ApplicantProfile = {
    personal: {
      fullName: { value: 'Rahul Sharma', source: 'user_provided' },
      country: { value: 'India', source: 'user_provided' },
      age: { value: 25, source: 'user_provided' },
      email: { value: 'rahul.sharma.dev@example.com', source: 'user_provided' }
    },
    education: {
      highestQualification: { value: 'B.Tech', source: 'document_extracted', sourceDocId: 'doc-1' },
      fieldOfStudy: { value: 'Computer Science', source: 'document_extracted', sourceDocId: 'doc-1' },
      institution: { value: 'National Institute of Technology', source: 'document_extracted', sourceDocId: 'doc-1' },
      graduationYear: { value: 2024, source: 'document_extracted', sourceDocId: 'doc-1' },
      gradeOrGpa: { value: '8.6 CGPA / 1st Class', source: 'document_extracted', sourceDocId: 'doc-2' }
    },
    experience: {
      yearsOfExperience: { value: 2, source: 'user_provided' }, // User stated 2 years; but formal work experience letter is pending!
      currentOrRecentRole: { value: 'Full-Stack Software Engineer', source: 'user_provided' },
      skills: { value: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'REST APIs'], source: 'document_extracted', sourceDocId: 'doc-4' },
      company: { value: 'Apex Cloud Solutions', source: 'ai_inferred' }
    },
    languageLevel: { value: 'B1', source: 'document_extracted', sourceDocId: 'doc-3' },
    goal: { value: 'Work in Germany', source: 'user_provided' },
    completionPercentage: 82, // Requested 82%
    lastAgentReview: new Date().toISOString()
  };

  const qualification: QualificationAssessment = {
    id: 'qual-rahul-1',
    applicantId,
    overallStatus: 'Needs Attention',
    targetGoal: 'Work in Germany',
    matchedRequirements: [
      {
        id: 'req-edu',
        title: 'Recognized Academic Degree (Anabin H+ equivalent)',
        description: 'B.Tech in Computer Science matches German university standard (Anabin database comparability).',
        status: 'matched',
        category: 'Education',
        details: 'Verified against Degree Certificate & Transcript'
      },
      {
        id: 'req-lang',
        title: 'German Language Proficiency (CEFR B1)',
        description: 'B1 Goethe-Zertifikat verified. Sufficient for skilled employment and accelerated residence permits.',
        status: 'matched',
        category: 'Language',
        details: 'Goethe-Zertifikat B1 validly authenticated'
      },
      {
        id: 'req-id',
        title: 'Valid Biometric Identity Document',
        description: 'Passport valid with > 12 months validity beyond expected visa application.',
        status: 'matched',
        category: 'Financial/Visa',
        details: 'Biometric passport verified'
      }
    ],
    missingRequirements: [
      {
        id: 'req-exp-doc',
        title: 'Employer Experience Verification Letter (Arbeitszeugnis / Experience Letter)',
        description: 'Official signed letter from employer verifying claimed 2 years of skilled professional IT tenure.',
        status: 'missing',
        category: 'Experience',
        details: 'Self-reported 2 years on profile without formal employer certificate'
      },
      {
        id: 'req-anabin-printout',
        title: 'Official Anabin KMK Database Printout',
        description: 'Official printout confirming H+ status for your awarding university.',
        status: 'missing',
        category: 'Documents',
        details: 'Recommended for German embassy visa filing'
      }
    ],
    potentialIssues: [
      {
        id: 'issue-exp-proof',
        title: 'Professional Experience Verification Pending',
        description: 'Experience duration is uncorroborated by formal employment records. German consular checklist mandates proof of tenure.',
        status: 'review_required',
        category: 'Experience',
        details: 'Required for EU Blue Card or Section 18g Skilled Worker Visa'
      }
    ],
    evaluatedAt: new Date().toISOString(),
    agentSummary: 'Academic degree and language requirements are satisfied. Formal experience verification is currently missing and blocks readiness.',
    disclaimer: 'DEMO qualification assessment using configurable sample requirements. It does not provide official German immigration, visa, legal, university admission, or government decisions.'
  };

  const gaps: GapItem[] = [
    {
      id: 'gap-exp-1',
      type: 'missing_document',
      title: 'Missing Official Experience Verification Letter',
      description: 'You indicated 2 years of full-time professional experience, but no formal employer reference or experience certificate has been uploaded to verify this requirement.',
      severity: 'high',
      affectedField: 'experience.yearsOfExperience',
      detectedAt: new Date().toISOString()
    },
    {
      id: 'gap-doc-anabin',
      type: 'missing_document',
      title: 'Missing Anabin Statement Printout',
      description: 'University recognition screenshot or KMK statement printout is missing for your document bundle (7 of 9 standard documents uploaded).',
      severity: 'medium',
      affectedField: 'education.institution',
      detectedAt: new Date().toISOString()
    }
  ];

  const nextBestAction: NextBestAction = {
    id: 'nba-rahul-1',
    applicantId,
    title: 'Upload your experience verification document',
    actionType: 'upload_missing_document',
    priority: 'High',
    reason: 'This requirement is currently preventing the qualification assessment from being completed.',
    targetDocumentType: 'experience_letter',
    suggestedActionLabel: 'Upload Experience Verification Document',
    createdAt: new Date().toISOString(),
    completed: false
  };

  const activityLogs: AgentActivityLog[] = [
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      agentName: 'Document Agent',
      status: 'completed',
      headline: 'Degree and Academic Transcripts Extracted',
      detail: 'Recognized B.Tech Computer Science from National Institute of Technology (Grade: 8.6 CGPA).'
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 240000).toISOString(),
      agentName: 'Profile Agent',
      status: 'completed',
      headline: 'Applicant Profile Structured',
      detail: 'Aggregated 14 data fields. Confidence: 94%. Profile completion calculated at 82%.'
    },
    {
      id: 'log-3',
      timestamp: new Date(Date.now() - 180000).toISOString(),
      agentName: 'Qualification Agent',
      status: 'warning',
      headline: 'Requirements Checked: 3 Matched, 2 Missing',
      detail: 'Met: Academic recognition, B1 German language, Passport. Status flagged as "Needs Attention".'
    },
    {
      id: 'log-4',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      agentName: 'Gap Agent',
      status: 'warning',
      headline: 'Missing Experience Document Detected',
      detail: 'Experience letter unverified. Claimed 2 years IT experience requires formal employer attestation.'
    },
    {
      id: 'log-5',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      agentName: 'Orchestrator',
      status: 'completed',
      headline: 'Orchestrator Evaluated State',
      detail: 'Observe -> Reason -> Select Agent/Tool. Handing decision off to Routing Agent for next action.'
    },
    {
      id: 'log-6',
      timestamp: new Date().toISOString(),
      agentName: 'Routing Agent',
      status: 'completed',
      headline: 'Next Best Action Generated: High Priority',
      detail: 'Action: "Upload your experience verification document." Priority: High.'
    }
  ];

  return {
    id: applicantId,
    name: 'Rahul Sharma',
    country: 'India',
    age: 25,
    goal: 'Work in Germany',
    germanLevel: 'B1',
    createdAt: '2026-10-06T14:20:00Z',
    updatedAt: new Date().toISOString(),
    profile,
    documents: initialDocuments,
    qualification,
    gaps,
    nextBestAction,
    journeySteps: getInitialJourneySteps('Needs Attention', true),
    activityLogs
  };
}

export function createMalavikaApplicant(): ApplicantEntity {
  const applicantId = 'demo-malavika-j-dev';
  
  const initialDocuments: DocumentRecord[] = [
    {
      id: 'doc-m-1',
      applicantId,
      name: 'Sapthagiri_Academic_Transcripts_Sem1_8.pdf',
      type: 'marks_card',
      fileSize: '2.1 MB',
      uploadedAt: '2026-10-06T15:10:00Z',
      status: 'Verified',
      extractedData: {
        documentType: 'marks_card',
        institution: 'Sapthagiri NPS University',
        studentName: 'Malavika J Dev',
        rollNo: '21SNPSU042',
        cgpa: 8.8,
        totalCredits: 160,
        semesters: 8,
        majorSubjects: ['Algorithms', 'Artificial Intelligence', 'Database Systems', 'Cloud Computing']
      },
      rawTextPreview: 'Sapthagiri NPS University Consolidated Grade Card: Malavika J Dev (Roll: 21SNPSU042), CGPA: 8.8/10.0.',
      forensics: {
        isAuthentic: true,
        finalStatus: 'VERIFIED',
        confidence: 96,
        aiGeneratedProbability: 2,
        manipulationScore: 5,
        isSampleDemo: false,
        extractedData: {
          institution: 'Sapthagiri NPS University',
          studentName: 'Malavika J Dev',
          rollNo: '21SNPSU042',
          cgpa: 8.8
        },
        forensicFlags: [],
        inconsistencies: [],
        externalVerification: {
          source: 'University Academic Registrar Portal',
          status: 'found',
          verified: true,
          verificationId: 'UAR-2025-TRANS-88'
        },
        verificationSummary: 'Layer 1-3 audit passed: High-fidelity university transcript. CGPA 8.8 corroborated by university registrar portal.'
      }
    },
    {
      id: 'doc-m-2',
      applicantId,
      name: 'Goethe_Zertifikat_B1_Malavika.pdf',
      type: 'german_language_certificate',
      fileSize: '1.2 MB',
      uploadedAt: '2026-10-06T15:15:00Z',
      status: 'Verified',
      extractedData: {
        documentType: 'german_language_certificate',
        certifyingBody: 'Goethe-Institut',
        cefrLevel: 'B1',
        certificateCode: 'GLI-B1-2024-8842',
        modules: { Lesen: 86, Horen: 80, Schreiben: 84, Sprechen: 82 },
        issueDate: '2024-11-20'
      },
      rawTextPreview: 'Goethe-Zertifikat B1 verliehen an Malavika J Dev. Prüfungsnummer: GLI-B1-2024-8842.',
      forensics: {
        isAuthentic: true,
        finalStatus: 'VERIFIED',
        confidence: 98,
        aiGeneratedProbability: 1,
        manipulationScore: 4,
        isSampleDemo: false,
        extractedData: {
          certifyingBody: 'Goethe-Institut',
          cefrLevel: 'B1',
          certificateCode: 'GLI-B1-2024-8842'
        },
        forensicFlags: [],
        inconsistencies: [],
        externalVerification: {
          source: 'Goethe-Institut Central Verification Service',
          status: 'found',
          verified: true,
          verificationId: 'GLI-B1-2024-8842'
        },
        verificationSummary: 'Authentic Goethe CEFR B1 certificate. Format GLI-B1-2024-8842 authenticated in official registry.'
      }
    },
    {
      id: 'doc-m-3',
      applicantId,
      name: 'Passport_Malavika_J_Dev.pdf',
      type: 'passport',
      fileSize: '1.1 MB',
      uploadedAt: '2026-10-06T15:20:00Z',
      status: 'Verified',
      extractedData: {
        documentType: 'passport',
        nationality: 'India',
        validity: 'Valid until 2034',
        machineReadableZoneVerified: true
      },
      rawTextPreview: 'Republic of India Biometric Passport: Malavika J Dev. Expiry 2034.',
      forensics: {
        isAuthentic: true,
        finalStatus: 'VERIFIED',
        confidence: 97,
        aiGeneratedProbability: 2,
        manipulationScore: 3,
        isSampleDemo: false,
        extractedData: { nationality: 'India', mrzValid: true },
        forensicFlags: [],
        inconsistencies: [],
        externalVerification: {
          source: 'Passport Authority ICAO Portal',
          status: 'found',
          verified: true,
          verificationId: 'ICAO-IN-2024-912'
        },
        verificationSummary: 'Biometric MRZ verified. Authentic government identity passport.'
      }
    },
    {
      id: 'doc-m-4',
      applicantId,
      name: 'CV_Malavika_J_Dev.pdf',
      type: 'cv',
      fileSize: '380 KB',
      uploadedAt: '2026-10-06T15:25:00Z',
      status: 'Analyzed',
      extractedData: {
        documentType: 'cv',
        roles: ['AI Engineering Intern', 'Undergraduate Researcher'],
        skills: ['Python', 'Machine Learning', 'TypeScript', 'React', 'PyTorch']
      },
      rawTextPreview: 'Malavika J Dev - B.Tech CSE at Sapthagiri NPS University (2025), CGPA 8.8.'
    },
    {
      id: 'doc-m-5',
      applicantId,
      name: 'Statement_of_Purpose_Germany.pdf',
      type: 'statement_of_purpose',
      fileSize: '290 KB',
      uploadedAt: '2026-10-06T15:30:00Z',
      status: 'Analyzed',
      extractedData: {
        documentType: 'statement_of_purpose',
        targetLocation: 'Munich / Berlin',
        aspiration: 'M.Sc in Computer Science / Artificial Intelligence in Germany'
      },
      rawTextPreview: 'Statement of Purpose for German Higher Education & Skilled Mobility.'
    }
  ];

  const profile: ApplicantProfile = {
    personal: {
      fullName: { value: 'Malavika J Dev', source: 'user_provided' },
      country: { value: 'India', source: 'user_provided' },
      age: { value: 22, source: 'user_provided' },
      email: { value: 'malavika.jdev@example.com', source: 'user_provided' }
    },
    education: {
      highestQualification: { value: 'B.Tech', source: 'user_provided' },
      fieldOfStudy: { value: 'Computer Science & Engineering', source: 'user_provided' },
      institution: { value: 'Sapthagiri NPS University', source: 'user_provided' },
      graduationYear: { value: 2025, source: 'user_provided' },
      gradeOrGpa: { value: '8.8 CGPA', source: 'document_extracted', sourceDocId: 'doc-m-1' }
    },
    experience: {
      yearsOfExperience: { value: 1, source: 'user_provided' },
      currentOrRecentRole: { value: 'AI Engineering Intern', source: 'user_provided' },
      skills: { value: ['Python', 'Machine Learning', 'TypeScript', 'React', 'PyTorch', 'Data Structures'], source: 'document_extracted', sourceDocId: 'doc-m-4' },
      company: { value: 'TechNova Solutions Pvt Ltd', source: 'ai_inferred' }
    },
    languageLevel: { value: 'B1', source: 'document_extracted', sourceDocId: 'doc-m-2' },
    goal: { value: 'Study in Germany', source: 'user_provided' },
    completionPercentage: 84,
    lastAgentReview: new Date().toISOString()
  };

  const qualification: QualificationAssessment = {
    id: 'qual-malavika-1',
    applicantId,
    overallStatus: 'Needs Attention',
    targetGoal: 'Study in Germany',
    matchedRequirements: [
      {
        id: 'req-m-trans',
        title: 'Higher Education Transcripts (HZB / VPD Prep)',
        description: 'Sapthagiri NPS University transcripts verified with 8.8 CGPA and 160 credits.',
        status: 'matched',
        category: 'Education',
        details: 'Verified by transcript document doc-m-1'
      },
      {
        id: 'req-m-lang',
        title: 'German Language Proficiency (CEFR B1)',
        description: 'Goethe-Zertifikat B1 authenticated with GLI-B1-2024-8842 registry record.',
        status: 'matched',
        category: 'Language',
        details: 'Goethe-Zertifikat B1 confirmed'
      },
      {
        id: 'req-m-pass',
        title: 'Valid Biometric Passport',
        description: 'Biometric international passport verified with validity through 2034.',
        status: 'matched',
        category: 'Financial/Visa'
      }
    ],
    missingRequirements: [
      {
        id: 'req-m-deg',
        title: 'Official Degree Certificate with Forensic Verification',
        description: 'Degree certificate has not yet been submitted for 3-layer forensic verification (visual integrity, profile cross-check, and DigiLocker/NAD registry lookup).',
        status: 'missing',
        category: 'Education',
        details: 'Mandatory for Uni-Assist VPD and German university admission'
      }
    ],
    potentialIssues: [
      {
        id: 'issue-m-deg-audit',
        title: 'Academic Degree Authentication Pending',
        description: 'Submission required to run Document Forensic Agent 3-layer inspection.',
        status: 'review_required',
        category: 'Education'
      }
    ],
    evaluatedAt: new Date().toISOString(),
    agentSummary: 'Transcripts (CGPA 8.8) and B1 German language are verified. Degree certificate is required for 3-layer forensic verification.',
    disclaimer: 'DEMO qualification assessment using configurable sample requirements. It does not provide official German immigration, visa, legal, university admission, or government decisions.'
  };

  const gaps: GapItem[] = [
    {
      id: 'gap-deg-malavika',
      type: 'missing_document',
      title: 'Missing Degree Certificate for Forensic Verification',
      description: 'Upload your Sapthagiri NPS University Degree Certificate PDF to execute 3-layer visual forensics, CGPA cross-check, and DigiLocker/NAD registry lookup.',
      severity: 'high',
      affectedField: 'education.highestQualification',
      detectedAt: new Date().toISOString()
    }
  ];

  const nextBestAction: NextBestAction = {
    id: 'nba-malavika-1',
    applicantId,
    title: 'Upload your degree certificate for 3-layer forensic verification',
    actionType: 'upload_missing_document',
    priority: 'High',
    reason: 'Layer 1-3 forensic audit is required to confirm degree authenticity, CGPA consistency with transcript (8.8), and NAD registry match.',
    targetDocumentType: 'degree_certificate',
    suggestedActionLabel: 'Upload Degree Certificate (PDF Only)',
    createdAt: new Date().toISOString(),
    completed: false
  };

  const activityLogs: AgentActivityLog[] = [
    {
      id: 'log-m-1',
      timestamp: new Date(Date.now() - 360000).toISOString(),
      agentName: 'Document Agent',
      status: 'completed',
      headline: 'Transcripts Forensically Verified: CGPA 8.8',
      detail: 'Sapthagiri NPS University transcripts verified. Student: Malavika J Dev (Roll: 21SNPSU042).'
    },
    {
      id: 'log-m-2',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      agentName: 'Document Agent',
      status: 'completed',
      headline: 'Language Certificate Verified: Goethe B1',
      detail: 'CEFR B1 verified via Goethe Registry Portal (GLI-B1-2024-8842).'
    },
    {
      id: 'log-m-3',
      timestamp: new Date(Date.now() - 240000).toISOString(),
      agentName: 'Profile Agent',
      status: 'completed',
      headline: 'Applicant Profile Structured with Provenance',
      detail: 'Profile completion: 84%. Academic benchmark: Sapthagiri NPS University (2025).'
    },
    {
      id: 'log-m-4',
      timestamp: new Date(Date.now() - 180000).toISOString(),
      agentName: 'Gap Agent',
      status: 'warning',
      headline: 'Degree Certificate Verification Gap Detected',
      detail: 'Degree Certificate pending 3-layer forensic audit (Visual Forensics, Consistency Cross-Check, NAD Trust Anchor).'
    },
    {
      id: 'log-m-5',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      agentName: 'Orchestrator',
      status: 'completed',
      headline: 'Orchestrator Evaluated State',
      detail: 'Observe -> Reason -> Select Agent/Tool. Handing decision off to Routing Agent.'
    },
    {
      id: 'log-m-6',
      timestamp: new Date().toISOString(),
      agentName: 'Routing Agent',
      status: 'completed',
      headline: 'Next Best Action: Degree Forensic Verification',
      detail: 'Action: "Upload your degree certificate for 3-layer forensic verification". Priority: High.'
    }
  ];

  return {
    id: applicantId,
    name: 'Malavika J Dev',
    country: 'India',
    age: 22,
    goal: 'Study in Germany',
    germanLevel: 'B1',
    createdAt: '2026-10-06T15:00:00Z',
    updatedAt: new Date().toISOString(),
    profile,
    documents: initialDocuments,
    qualification,
    gaps,
    nextBestAction,
    journeySteps: getInitialJourneySteps('Needs Attention', true),
    activityLogs
  };
}

export function createAusbildungApplicant(): ApplicantEntity {
  const applicantId = 'demo-elena-rostova';
  const now = new Date().toISOString();

  const initialDocuments: DocumentRecord[] = [
    {
      id: 'doc-e-1',
      applicantId,
      name: 'High_School_Leaving_Certificate_ZAB_Recognition.pdf',
      type: 'degree_certificate',
      fileSize: '1.9 MB',
      uploadedAt: '2026-10-06T16:00:00Z',
      status: 'Verified',
      extractedData: {
        documentType: 'degree_certificate',
        institution: 'Central Gymnasium Academy',
        studentName: 'Elena Rostova',
        graduationYear: 2024,
        averageGrade: '1.4 (German System Conversion)'
      },
      rawTextPreview: 'Certificate of Secondary Education converted to German Fachhochschulreife equivalence.',
      forensics: {
        isAuthentic: true,
        finalStatus: 'VERIFIED',
        confidence: 97,
        aiGeneratedProbability: 1,
        manipulationScore: 3,
        isSampleDemo: false,
        extractedData: {
          institution: 'Central Gymnasium Academy',
          studentName: 'Elena Rostova'
        },
        forensicFlags: [],
        inconsistencies: [],
        externalVerification: {
          source: 'ZAB Statement of Equivalence Registry',
          status: 'found',
          verified: true,
          verificationId: 'ZAB-2025-AUSB-412'
        },
        verificationSummary: 'Layer 1-3 audit passed: High school credentials authenticated with German qualification equivalence.'
      }
    },
    {
      id: 'doc-e-2',
      applicantId,
      name: 'Goethe_Zertifikat_B2_Elena.pdf',
      type: 'german_language_certificate',
      fileSize: '1.3 MB',
      uploadedAt: '2026-10-06T16:10:00Z',
      status: 'Verified',
      extractedData: {
        documentType: 'german_language_certificate',
        certifyingBody: 'Goethe-Institut',
        cefrLevel: 'B2',
        certificateCode: 'GLI-B2-2025-9011'
      },
      rawTextPreview: 'Goethe-Zertifikat B2: Elena Rostova. Overall grade: Gut (85/100). Valid for vocational training.',
      forensics: {
        isAuthentic: true,
        finalStatus: 'VERIFIED',
        confidence: 99,
        aiGeneratedProbability: 0,
        manipulationScore: 2,
        isSampleDemo: false,
        extractedData: {
          certifyingBody: 'Goethe-Institut',
          cefrLevel: 'B2'
        },
        forensicFlags: [],
        inconsistencies: [],
        externalVerification: {
          source: 'Goethe-Institut Central Verification Service',
          status: 'found',
          verified: true,
          verificationId: 'GLI-B2-2025-9011'
        },
        verificationSummary: 'Layer 1-3 audit passed: CEFR B2 authenticated. Meets German dual Ausbildung requirements.'
      }
    }
  ];

  const profile: ApplicantProfile = {
    personal: {
      fullName: { value: 'Elena Rostova', source: 'document_extracted' },
      country: { value: 'Ukraine', source: 'user_provided' },
      age: { value: 20, source: 'user_provided' }
    },
    education: {
      highestQualification: { value: 'Higher Secondary School Diploma', source: 'document_extracted' },
      fieldOfStudy: { value: 'IT & Mechatronics Foundation', source: 'user_provided' },
      institution: { value: 'Central Gymnasium Academy', source: 'document_extracted' },
      graduationYear: { value: 2024, source: 'document_extracted' },
      gradeOrGpa: { value: '1.4 (German Equivalent)', source: 'document_extracted' }
    },
    experience: {
      yearsOfExperience: { value: 1, source: 'user_provided' },
      currentOrRecentRole: { value: 'Technical Apprentice Candidate', source: 'user_provided' },
      skills: { value: ['Python', 'Electronics', 'German B2', 'CAD Modeling', 'Team Collaboration'], source: 'user_provided' }
    },
    languageLevel: { value: 'B2', source: 'document_extracted' },
    goal: { value: 'Ausbildung in Germany', source: 'user_provided' },
    completionPercentage: 86,
    lastAgentReview: now
  };

  const qualification: QualificationAssessment = {
    id: 'qual-elena',
    applicantId,
    overallStatus: 'Needs Attention',
    targetGoal: 'Ausbildung in Germany',
    matchedRequirements: [
      {
        id: 'req-e-lang',
        title: 'German Language Level B2 Certified',
        description: 'Mandatory B1/B2 satisfied by Goethe-Institut B2 verified certificate.',
        status: 'matched',
        category: 'Language'
      },
      {
        id: 'req-e-school',
        title: 'Secondary School Leaving Certificate Recognized',
        description: 'Equivalent to German Fachhochschulreife / Realschulabschluss.',
        status: 'matched',
        category: 'Education'
      }
    ],
    missingRequirements: [
      {
        id: 'req-e-contract',
        title: 'Signed Ausbildungsvertrag (Apprenticeship Contract)',
        description: 'Dual training contract signed with accredited German employer registered with IHK / HWK.',
        status: 'missing',
        category: 'Experience'
      }
    ],
    potentialIssues: [],
    evaluatedAt: now,
    agentSummary: 'Academic qualifications and B2 German level meet vocational training admission rules. Final Ausbildungsvertrag upload needed.',
    disclaimer: 'DEMO qualification assessment using configurable sample requirements. It does not provide official German immigration, visa, legal, university admission, or government decisions.'
  };

  const gaps: GapItem[] = [
    {
      id: 'gap-elena-1',
      type: 'missing_document',
      title: 'Missing Official Ausbildungsvertrag (Training Contract)',
      description: 'Upload your verified Ausbildung training contract draft to complete your German visa authorization file.',
      severity: 'high',
      affectedField: 'experience.company',
      detectedAt: now
    }
  ];

  const nextBestAction: NextBestAction = {
    id: 'nba-elena-1',
    applicantId,
    title: 'Upload your Dual Ausbildung Training Contract (Ausbildungsvertrag)',
    actionType: 'upload_missing_document',
    priority: 'High',
    reason: 'The Ausbildungsvertrag is the essential legal requirement for Section 16a German Vocational Training Visa approval.',
    targetDocumentType: 'experience_letter',
    suggestedActionLabel: 'Upload Ausbildung Contract (PDF)',
    createdAt: now,
    completed: false
  };

  const activityLogs: AgentActivityLog[] = [
    {
      id: 'log-e-1',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      agentName: 'Document Agent',
      status: 'completed',
      headline: 'Goethe B2 Certificate Verified',
      detail: 'Validated CEFR B2 certificate against central registry. Language criterion satisfied.'
    },
    {
      id: 'log-e-2',
      timestamp: new Date(Date.now() - 200000).toISOString(),
      agentName: 'Qualification Agent',
      status: 'completed',
      headline: 'Ausbildung Equivalence Check: Ready for Contract Matching',
      detail: 'Secondary education converted successfully to German school system standard.'
    },
    {
      id: 'log-e-3',
      timestamp: now,
      agentName: 'Routing Agent',
      status: 'completed',
      headline: 'Next Best Action Generated: Ausbildungsvertrag',
      detail: 'Assigned high-priority task to upload training contract.'
    }
  ];

  return {
    id: applicantId,
    name: 'Elena Rostova',
    country: 'Ukraine',
    age: 20,
    goal: 'Ausbildung in Germany',
    germanLevel: 'B2',
    createdAt: '2026-10-06T16:00:00Z',
    updatedAt: now,
    profile,
    documents: initialDocuments,
    qualification,
    gaps,
    nextBestAction,
    journeySteps: getInitialJourneySteps('Needs Attention', true),
    activityLogs
  };
}

class InMemoryDataStore {
  private applicants: Map<string, ApplicantEntity> = new Map();

  constructor() {
    this.resetDemo('malavika');
  }

  public resetDemo(type: 'rahul' | 'malavika' | 'elena' = 'malavika'): ApplicantEntity {
    let demo: ApplicantEntity;
    if (type === 'rahul') {
      demo = createDemoApplicant();
    } else if (type === 'elena') {
      demo = createAusbildungApplicant();
    } else {
      demo = createMalavikaApplicant();
    }

    this.applicants.set(demo.id, demo);
    // Keep others stored as well
    const malavika = createMalavikaApplicant();
    const rahul = createDemoApplicant();
    const elena = createAusbildungApplicant();
    this.applicants.set(malavika.id, malavika);
    this.applicants.set(rahul.id, rahul);
    this.applicants.set(elena.id, elena);

    return demo;
  }

  public getApplicant(id: string): ApplicantEntity | undefined {
    return this.applicants.get(id);
  }

  public getAllApplicants(): ApplicantEntity[] {
    return Array.from(this.applicants.values());
  }

  public saveApplicant(applicant: ApplicantEntity): ApplicantEntity {
    applicant.updatedAt = new Date().toISOString();
    this.applicants.set(applicant.id, applicant);
    return applicant;
  }

  public createApplicant(initialData: {
    fullName: string;
    country: string;
    age: number;
    highestQualification: string;
    fieldOfStudy: string;
    institution: string;
    graduationYear: number;
    yearsOfExperience: number;
    recentRole: string;
    skills: string[];
    germanLevel: any;
    goal: any;
  }): ApplicantEntity {
    const id = `applicant-${Date.now()}`;
    const now = new Date().toISOString();

    const profile: ApplicantProfile = {
      personal: {
        fullName: { value: initialData.fullName, source: 'user_provided' },
        country: { value: initialData.country, source: 'user_provided' },
        age: { value: initialData.age, source: 'user_provided' }
      },
      education: {
        highestQualification: { value: initialData.highestQualification, source: 'user_provided' },
        fieldOfStudy: { value: initialData.fieldOfStudy, source: 'user_provided' },
        institution: { value: initialData.institution, source: 'user_provided' },
        graduationYear: { value: initialData.graduationYear, source: 'user_provided' }
      },
      experience: {
        yearsOfExperience: { value: initialData.yearsOfExperience, source: 'user_provided' },
        currentOrRecentRole: { value: initialData.recentRole, source: 'user_provided' },
        skills: { value: initialData.skills, source: 'user_provided' }
      },
      languageLevel: { value: initialData.germanLevel, source: 'user_provided' },
      goal: { value: initialData.goal, source: 'user_provided' },
      completionPercentage: 65,
      lastAgentReview: now
    };

    const initialDocs: DocumentRecord[] = [];

    const qualification: QualificationAssessment = {
      id: `qual-${id}`,
      applicantId: id,
      overallStatus: 'Incomplete',
      targetGoal: initialData.goal,
      matchedRequirements: [
        {
          id: 'req-onboard-1',
          title: 'Initial Self-Reported Academic Background',
          description: `Self-reported ${initialData.highestQualification} in ${initialData.fieldOfStudy}.`,
          status: 'matched',
          category: 'Education'
        }
      ],
      missingRequirements: [
        {
          id: 'req-doc-deg',
          title: 'Official Degree Certificate / Certificate of Enrollment',
          description: 'Documentary proof is required to verify your declared qualification.',
          status: 'missing',
          category: 'Documents'
        },
        {
          id: 'req-doc-lang',
          title: 'Recognized German Language Certificate',
          description: 'Official test score (Goethe, telc, TestDaF, or ÖSD) matching your German level.',
          status: 'missing',
          category: 'Language'
        }
      ],
      potentialIssues: [
        {
          id: 'issue-unverified-profile',
          title: 'Unverified Self-Reported Profile',
          description: 'Uploaded documents are required to corroborate education and experience.',
          status: 'review_required',
          category: 'Documents'
        }
      ],
      evaluatedAt: now,
      agentSummary: 'Applicant profile initialized via onboarding. Document verification is required.',
      disclaimer: 'DEMO qualification assessment using configurable sample requirements. It does not provide official German immigration, visa, legal, university admission, or government decisions.'
    };

    const gaps: GapItem[] = [
      {
        id: `gap-${Date.now()}-1`,
        type: 'missing_document',
        title: 'Missing Degree Certificate',
        description: 'Upload your official degree or high school certificate to verify your education.',
        severity: 'high',
        affectedField: 'education.highestQualification',
        detectedAt: now
      }
    ];

    const nextBestAction: NextBestAction = {
      id: `nba-${id}`,
      applicantId: id,
      title: 'Upload your highest qualification degree certificate',
      actionType: 'upload_missing_document',
      priority: 'High',
      reason: 'Your education credentials must be authenticated before German qualification assessment can proceed.',
      targetDocumentType: 'degree_certificate',
      suggestedActionLabel: 'Upload Degree Certificate',
      createdAt: now,
      completed: false
    };

    const entity: ApplicantEntity = {
      id,
      name: initialData.fullName,
      country: initialData.country,
      age: initialData.age,
      goal: initialData.goal,
      germanLevel: initialData.germanLevel,
      createdAt: now,
      updatedAt: now,
      profile,
      documents: initialDocs,
      qualification,
      gaps,
      nextBestAction,
      journeySteps: getInitialJourneySteps('Incomplete', true),
      activityLogs: [
        {
          id: `log-${Date.now()}-1`,
          timestamp: now,
          agentName: 'Profile Agent',
          status: 'completed',
          headline: 'Applicant Onboarding Initialized',
          detail: `Profile created for ${initialData.fullName} aiming for ${initialData.goal}.`
        },
        {
          id: `log-${Date.now()}-2`,
          timestamp: now,
          agentName: 'Routing Agent',
          status: 'completed',
          headline: 'Initial Next Best Action Assigned',
          detail: 'Prioritized uploading primary educational credentials.'
        }
      ]
    };

    this.applicants.set(id, entity);
    return entity;
  }
}

export const dbStore = new InMemoryDataStore();
