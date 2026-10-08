import { ApplicantProfile, DocumentRecord, QualificationAssessment, GapItem } from '../types';

export function detectGaps(
  applicantId: string,
  profile: ApplicantProfile,
  documents: DocumentRecord[],
  qualification: QualificationAssessment
): GapItem[] {
  const gaps: GapItem[] = [];
  const verifiedDocTypes = new Set(
    documents.filter(d => d.status === 'Verified' || d.status === 'Analyzed').map(d => d.type)
  );

  // 1. Missing Documents based on Goal
  if (profile.goal.value === 'Work in Germany') {
    if (!verifiedDocTypes.has('experience_letter')) {
      gaps.push({
        id: `gap-exp-${Date.now()}`,
        type: 'missing_document',
        title: 'Missing Official Experience Verification Letter',
        description: `Profile indicates ${profile.experience.yearsOfExperience.value} years of experience as ${profile.experience.currentOrRecentRole.value}, but no signed employer verification letter is attached to corroborate this requirement.`,
        severity: 'high',
        affectedField: 'experience.yearsOfExperience',
        detectedAt: new Date().toISOString()
      });
    }

    if (!verifiedDocTypes.has('degree_certificate')) {
      gaps.push({
        id: `gap-deg-${Date.now()}`,
        type: 'missing_document',
        title: 'Missing Degree Certificate',
        description: 'Degree certificate is required to establish equivalency under German H+ recognition databases.',
        severity: 'high',
        affectedField: 'education.highestQualification',
        detectedAt: new Date().toISOString()
      });
    }

    // Check document count against standard benchmark 9
    if (documents.length < 9 && !documents.some(d => d.name.toLowerCase().includes('anabin'))) {
      gaps.push({
        id: `gap-anabin-${Date.now()}`,
        type: 'missing_document',
        title: 'Missing Anabin KMK Recognition Statement Printout',
        description: 'Official printout from the KMK Anabin database verifying that your university has H+ status.',
        severity: 'medium',
        affectedField: 'education.institution',
        detectedAt: new Date().toISOString()
      });
    }
  }

  // 2. Conflicting information detection
  for (const doc of documents) {
    if (doc.inconsistencies && doc.inconsistencies.length > 0) {
      for (const inc of doc.inconsistencies) {
        gaps.push({
          id: `gap-incon-${doc.id}-${Math.random().toString(36).substring(7)}`,
          type: 'inconsistent_information',
          title: `Potential Inconsistency Detected: ${doc.name}`,
          description: inc,
          severity: 'high',
          detectedAt: new Date().toISOString()
        });
      }
    }

    // Cross-check experience duration discrepancy
    if (doc.type === 'experience_letter' && doc.extractedData?.yearsOfExperience) {
      const docYears = Number(doc.extractedData.yearsOfExperience);
      const profileYears = Number(profile.experience.yearsOfExperience.value);
      if (docYears !== profileYears && !isNaN(docYears) && !isNaN(profileYears)) {
        gaps.push({
          id: `gap-exp-mismatch-${doc.id}`,
          type: 'inconsistent_information',
          title: 'Potential Experience Duration Inconsistency',
          description: `Applicant profile states ${profileYears} years, but employer document states ${docYears} year(s). Please verify the exact tenure to ensure embassy compliance.`,
          severity: 'high',
          affectedField: 'experience.yearsOfExperience',
          sourceDiscrepancy: {
            profileValue: `${profileYears} years`,
            documentValue: `${docYears} year(s)`,
            documentName: doc.name
          },
          detectedAt: new Date().toISOString()
        });
      }
    }
  }

  // 3. Incomplete profile fields
  if (!profile.personal.email?.value) {
    gaps.push({
      id: `gap-email-${Date.now()}`,
      type: 'missing_information',
      title: 'Missing Contact Email Address',
      description: 'An official contact email is needed for institutional correspondence and German visa scheduling.',
      severity: 'low',
      affectedField: 'personal.email',
      detectedAt: new Date().toISOString()
    });
  }

  // 4. Missing qualifications from qualification assessment
  for (const missing of qualification.missingRequirements) {
    if (!gaps.some(g => g.title.toLowerCase().includes(missing.title.toLowerCase()))) {
      gaps.push({
        id: `gap-req-${missing.id}`,
        type: 'requirement_unmet',
        title: missing.title,
        description: missing.description,
        severity: missing.category === 'Education' || missing.category === 'Experience' ? 'high' : 'medium',
        detectedAt: new Date().toISOString()
      });
    }
  }

  return gaps;
}
