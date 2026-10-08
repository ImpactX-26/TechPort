import { ApplicantProfile, DocumentRecord, QualificationAssessment, GapItem, NextBestAction } from '../types';

export function determineNextBestAction(
  applicantId: string,
  profile: ApplicantProfile,
  documents: DocumentRecord[],
  qualification: QualificationAssessment,
  gaps: GapItem[]
): NextBestAction {
  // Check if Alumni expectation gap detected >= 40%
  if (profile.alumniNetwork?.expectationGapScore && profile.alumniNetwork.expectationGapScore >= 40) {
    const college = profile.alumniNetwork.targetCollege || 'target institution';
    return {
      id: `nba-${Date.now()}`,
      applicantId,
      title: `Action: Talk to 2 seniors from ${college} before paying fees`,
      actionType: 'provide_additional_info',
      priority: 'High',
      reason: `Expectation reality check showed a ${profile.alumniNetwork.expectationGapScore}% gap. 68% of candidates struggle if reality mismatch is not resolved before paying fees.`,
      suggestedActionLabel: 'Connect With Verified Seniors',
      createdAt: new Date().toISOString(),
      completed: false
    };
  }

  // Check for inconsistencies first (requires verification)
  const inconsistencyGap = gaps.find(g => g.type === 'inconsistent_information');
  if (inconsistencyGap) {
    return {
      id: `nba-${Date.now()}`,
      applicantId,
      title: 'Verify flagged discrepancy in your profile',
      actionType: 'verify_information',
      priority: 'High',
      reason: inconsistencyGap.description,
      suggestedActionLabel: 'Review & Verify Information',
      createdAt: new Date().toISOString(),
      completed: false
    };
  }

  // Check for missing experience document (the specific key hackathon requirement)
  const experienceGap = gaps.find(g => g.title.toLowerCase().includes('experience'));
  if (experienceGap) {
    return {
      id: `nba-${Date.now()}`,
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
  }

  // Check for missing degree document
  const degreeGap = gaps.find(g => g.title.toLowerCase().includes('degree'));
  if (degreeGap) {
    return {
      id: `nba-${Date.now()}`,
      applicantId,
      title: 'Upload your official degree certificate',
      actionType: 'upload_missing_document',
      priority: 'High',
      reason: 'Academic verification is prerequisite to establishing German equivalence.',
      targetDocumentType: 'degree_certificate',
      suggestedActionLabel: 'Upload Degree Certificate',
      createdAt: new Date().toISOString(),
      completed: false
    };
  }

  // Check for other missing documents (like Anabin)
  const docGap = gaps.find(g => g.type === 'missing_document');
  if (docGap) {
    return {
      id: `nba-${Date.now()}`,
      applicantId,
      title: `Upload missing document: ${docGap.title}`,
      actionType: 'upload_missing_document',
      priority: 'Medium',
      reason: docGap.description,
      suggestedActionLabel: 'Upload Document',
      createdAt: new Date().toISOString(),
      completed: false
    };
  }

  // If qualification is Ready and no CV generated yet
  if (qualification.overallStatus === 'Ready') {
    return {
      id: `nba-${Date.now()}`,
      applicantId,
      title: 'Generate German-standard Lebenslauf (CV)',
      actionType: 'generate_cv',
      priority: 'Medium',
      reason: 'Your qualifications and documents are verified! Generate an aligned German CV to begin applying.',
      suggestedActionLabel: 'Generate German CV',
      createdAt: new Date().toISOString(),
      completed: false
    };
  }

  // If profile completion is below 85%
  if (profile.completionPercentage < 85) {
    return {
      id: `nba-${Date.now()}`,
      applicantId,
      title: 'Complete additional profile fields',
      actionType: 'complete_profile',
      priority: 'Medium',
      reason: 'Enriching your verified skills and certifications enhances qualification matching.',
      suggestedActionLabel: 'Edit Profile Information',
      createdAt: new Date().toISOString(),
      completed: false
    };
  }

  // Fallback next best action: Review Qualification
  return {
    id: `nba-${Date.now()}`,
    applicantId,
    title: 'Review qualification assessment results',
    actionType: 'review_qualification',
    priority: 'Low',
    reason: 'Review matched requirements and next institutional application steps.',
    suggestedActionLabel: 'Review Assessment Details',
    createdAt: new Date().toISOString(),
    completed: false
  };
}
