import { ApplicantProfile, DocumentRecord, ProvenanceField } from '../types';

export function calculateProfileCompletion(profile: ApplicantProfile, documents: DocumentRecord[]): number {
  let score = 0;
  const maxScore = 100;

  // Personal info weights (20%)
  if (profile.personal.fullName.value) score += 5;
  if (profile.personal.country.value) score += 5;
  if (profile.personal.age.value > 0) score += 5;
  if (profile.personal.email?.value) score += 5;

  // Education info weights (25%)
  if (profile.education.highestQualification.value) score += 8;
  if (profile.education.fieldOfStudy.value) score += 7;
  if (profile.education.institution.value) score += 5;
  if (profile.education.graduationYear.value > 1900) score += 5;

  // Experience info weights (20%)
  if (profile.experience.yearsOfExperience.value >= 0) score += 5;
  if (profile.experience.currentOrRecentRole.value) score += 5;
  if (profile.experience.skills.value.length > 0) score += 10;

  // Language & Goal weights (15%)
  if (profile.languageLevel.value && profile.languageLevel.value !== 'Not yet started') score += 10;
  else if (profile.languageLevel.value === 'Not yet started') score += 4;
  if (profile.goal.value) score += 5;

  // Document verification bonus (20%)
  const verifiedDocsCount = documents.filter(d => d.status === 'Verified' || d.status === 'Analyzed').length;
  const docBonus = Math.min(20, verifiedDocsCount * 2.5);
  score += docBonus;

  return Math.min(100, Math.round(score));
}

export function updateProfileWithDocumentData(
  currentProfile: ApplicantProfile,
  doc: DocumentRecord
): { updatedProfile: ApplicantProfile; changedFields: string[] } {
  const profile = JSON.parse(JSON.stringify(currentProfile)) as ApplicantProfile;
  const changedFields: string[] = [];

  if (!doc.extractedData) {
    profile.completionPercentage = calculateProfileCompletion(profile, [doc]);
    return { updatedProfile: profile, changedFields };
  }

  const data = doc.extractedData;

  // Only update or enrich provenance if the document extracted confirmed data
  if (doc.type === 'degree_certificate') {
    if (data.degree && profile.education.highestQualification.source !== 'document_extracted') {
      profile.education.highestQualification = {
        value: data.degree,
        source: 'document_extracted',
        sourceDocId: doc.id,
        confidence: 0.98,
        lastUpdated: new Date().toISOString()
      };
      changedFields.push('education.highestQualification (Verified from Degree Certificate)');
    }
    if (data.institution && profile.education.institution.source !== 'document_extracted') {
      profile.education.institution = {
        value: data.institution,
        source: 'document_extracted',
        sourceDocId: doc.id,
        confidence: 0.98,
        lastUpdated: new Date().toISOString()
      };
      changedFields.push('education.institution (Verified from Degree Certificate)');
    }
  }

  if (doc.type === 'german_language_certificate' && data.cefrLevel) {
    if (profile.languageLevel.value !== data.cefrLevel || profile.languageLevel.source !== 'document_extracted') {
      profile.languageLevel = {
        value: data.cefrLevel,
        source: 'document_extracted',
        sourceDocId: doc.id,
        confidence: 0.99,
        lastUpdated: new Date().toISOString()
      };
      changedFields.push(`languageLevel (Verified ${data.cefrLevel} with official score)`);
    }
  }

  if (doc.type === 'experience_letter') {
    if (data.company) {
      profile.experience.company = {
        value: data.company,
        source: 'document_extracted',
        sourceDocId: doc.id,
        confidence: 0.95,
        lastUpdated: new Date().toISOString()
      };
      changedFields.push(`experience.company (${data.company})`);
    }
    if (data.yearsOfExperience) {
      profile.experience.yearsOfExperience = {
        value: Number(data.yearsOfExperience),
        source: 'document_extracted',
        sourceDocId: doc.id,
        confidence: 0.97,
        lastUpdated: new Date().toISOString()
      };
      changedFields.push(`experience.yearsOfExperience (${data.yearsOfExperience} years verified)`);
    }
    if (data.verifiedSkills && Array.isArray(data.verifiedSkills)) {
      const mergedSkills = Array.from(new Set([...profile.experience.skills.value, ...data.verifiedSkills]));
      profile.experience.skills = {
        value: mergedSkills,
        source: 'document_extracted',
        sourceDocId: doc.id,
        confidence: 0.94,
        lastUpdated: new Date().toISOString()
      };
      changedFields.push('experience.skills (Enriched with verified employment skills)');
    }
  }

  profile.lastAgentReview = new Date().toISOString();
  return { updatedProfile: profile, changedFields };
}
