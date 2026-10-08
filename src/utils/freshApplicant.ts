import { ApplicantEntity, GermanyGoal } from '../types';
import { sanitizeFirestoreId } from '../firebase';

export function createFreshApplicant(options: {
  fullName?: string;
  email: string;
  goal?: GermanyGoal;
  customId?: string;
}): ApplicantEntity {
  const { fullName, email, goal = 'Study in Germany', customId } = options;
  
  // Clean unique applicant identifier safe for Firestore (^[a-zA-Z0-9_\-]+$)
  const baseId = customId || `applicant_${email.split('@')[0]}_${Date.now()}`;
  const id = sanitizeFirestoreId(baseId);
  const now = new Date().toISOString();

  const displayName = fullName && fullName.trim().length > 0 
    ? fullName.trim() 
    : email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return {
    id,
    name: displayName,
    country: 'International',
    age: 24,
    goal,
    germanLevel: 'Not yet started',
    createdAt: now,
    updatedAt: now,
    profile: {
      personal: {
        fullName: { value: displayName, source: 'user_provided' },
        email: { value: email, source: 'user_provided' },
        country: { value: 'International', source: 'user_provided' },
        age: { value: 24, source: 'user_provided' }
      },
      education: {
        highestQualification: { value: 'Pending Document Upload', source: 'user_provided' },
        fieldOfStudy: { value: 'Not specified yet', source: 'user_provided' },
        institution: { value: 'Not specified yet', source: 'user_provided' },
        graduationYear: { value: new Date().getFullYear(), source: 'user_provided' },
        gradeOrGpa: { value: 'Pending', source: 'user_provided' }
      },
      experience: {
        yearsOfExperience: { value: 0, source: 'user_provided' },
        currentOrRecentRole: { value: 'Candidate', source: 'user_provided' },
        skills: { value: ['Communication', 'Motivation to study/work in Germany'], source: 'user_provided' }
      },
      languageLevel: { value: 'Not yet started', source: 'user_provided' },
      goal: { value: goal, source: 'user_provided' },
      completionPercentage: 10, // Starts from beginning!
      lastAgentReview: now
    },
    // CRITICAL REQUIREMENT: NO SAMPLE DOCUMENTS BY DEFAULT!
    documents: [],
    qualification: {
      id: `qual_${id}`,
      applicantId: id,
      overallStatus: 'Incomplete',
      targetGoal: goal,
      matchedRequirements: [
        {
          id: 'req-acc-active',
          title: 'Account Registered & Verified',
          description: `Applicant profile created under email ${email}. Ready to upload documents.`,
          status: 'matched',
          category: 'Documents'
        }
      ],
      missingRequirements: [
        {
          id: 'req-missing-degree',
          title: 'Official Educational Degree Certificate',
          description: 'Required by German universities and employers to check equivalence in the official Anabin database.',
          status: 'missing',
          category: 'Education'
        },
        {
          id: 'req-missing-id',
          title: 'Valid Passport or National ID',
          description: 'Required for German visa applications, Uni-assist, and APS verification.',
          status: 'missing',
          category: 'Documents'
        },
        {
          id: 'req-missing-lang',
          title: 'Language Proficiency Proof (German or English)',
          description: 'Certification (e.g. Goethe, telc, IELTS, TOEFL) corresponding to your program requirements.',
          status: 'missing',
          category: 'Language'
        }
      ],
      potentialIssues: [],
      evaluatedAt: now,
      agentSummary: `Welcome ${displayName}! Your Germany journey has started. Upload your certificates to begin qualification and visa analysis.`,
      disclaimer: 'This evaluation helps guide your path to Germany. Official decisions are made by German universities and diplomatic authorities.'
    },
    gaps: [
      {
        id: `gap_first_step`,
        type: 'missing_document',
        title: 'Upload Your Primary Document',
        description: 'To evaluate your Germany visa and admission criteria, upload your Degree Certificate or Passport.',
        severity: 'high',
        affectedField: 'education.highestQualification',
        detectedAt: now
      }
    ],
    nextBestAction: {
      id: `nba_${id}`,
      applicantId: id,
      title: 'Upload your Degree Certificate or Passport to get started',
      actionType: 'upload_missing_document',
      priority: 'High',
      reason: 'German universities and embassies require verified documents to check your equivalence and eligibility.',
      targetDocumentType: 'degree_certificate',
      suggestedActionLabel: 'Upload Document Now',
      createdAt: now,
      completed: false
    },
    journeySteps: [
      {
        id: 'step-1',
        stepNumber: 1,
        name: 'Account & Goal',
        description: 'Account created with chosen Germany track.',
        status: 'completed'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        name: 'Upload Documents',
        description: 'Upload your certificates & passport.',
        status: 'current'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        name: 'Eligibility Check',
        description: 'Automatic verification against German criteria.',
        status: 'locked'
      },
      {
        id: 'step-4',
        stepNumber: 4,
        name: 'Embassy & Visa Ready',
        description: 'Complete dossier ready for Germany submission.',
        status: 'locked'
      }
    ],
    activityLogs: [
      {
        id: `log_init_${Date.now()}`,
        timestamp: now,
        agentName: 'Profile Agent',
        status: 'completed',
        headline: 'Profile Initialized From Scratch',
        detail: `New profile created for ${displayName} (${goal}). All sample documents cleared.`
      }
    ]
  };
}
