import { ApplicantProfile, DocumentRecord, QualificationAssessment, RequirementCheck, GermanyGoal, QualificationStatus } from '../types';
import { callGeminiStructured } from '../gemini';

const OFFICIAL_DISCLAIMER = 'DEMO qualification assessment using configurable sample requirements. It does not provide official German immigration, visa, legal, university admission, or government decisions.';

export async function evaluateQualification(
  applicantId: string,
  profile: ApplicantProfile,
  documents: DocumentRecord[]
): Promise<QualificationAssessment> {
  const goal: GermanyGoal = profile.goal.value;
  const verifiedDocTypes = new Set(
    documents.filter(d => d.status === 'Verified' || d.status === 'Analyzed').map(d => d.type)
  );

  const fallback = (): QualificationAssessment => {
    const matchedRequirements: RequirementCheck[] = [];
    const missingRequirements: RequirementCheck[] = [];
    const potentialIssues: RequirementCheck[] = [];

    const hasDegree = verifiedDocTypes.has('degree_certificate') || Boolean(profile.education.highestQualification.value);
    const hasDegreeDoc = verifiedDocTypes.has('degree_certificate');
    const hasLanguageDoc = verifiedDocTypes.has('german_language_certificate');
    const hasExperienceDoc = verifiedDocTypes.has('experience_letter');
    const langLevel = profile.languageLevel.value;
    const expYears = profile.experience.yearsOfExperience.value;

    if (goal === 'Work in Germany') {
      // 1. Education
      if (hasDegreeDoc) {
        matchedRequirements.push({
          id: 'req-work-degree',
          title: 'Recognized Academic Degree (Anabin H+ equivalent)',
          description: `${profile.education.highestQualification.value || 'Bachelor'} in ${profile.education.fieldOfStudy.value || 'Field'} with verified academic credentials.`,
          status: 'matched',
          category: 'Education',
          details: 'Verified by uploaded Degree Certificate'
        });
      } else {
        missingRequirements.push({
          id: 'req-work-degree-missing',
          title: 'Recognized Academic Degree Verification',
          description: 'Official degree certificate is required for the German EU Blue Card or Section 18g Skilled Worker Visa.',
          status: 'missing',
          category: 'Education'
        });
      }

      // 2. Language
      if (['B1', 'B2', 'C1', 'C2'].includes(langLevel) && hasLanguageDoc) {
        matchedRequirements.push({
          id: 'req-work-lang',
          title: `German Language Proficiency (${langLevel})`,
          description: `Certified at CEFR ${langLevel}. Meets skilled employment standard and accelerated settlement requirements.`,
          status: 'matched',
          category: 'Language',
          details: 'Verified with official test certificate'
        });
      } else if (['B1', 'B2', 'C1', 'C2'].includes(langLevel)) {
        potentialIssues.push({
          id: 'issue-work-lang-cert',
          title: 'Language Certificate Pending Formal Upload',
          description: `Profile lists ${langLevel}, but official Goethe/telc certificate is not yet verified in your document bundle.`,
          status: 'review_required',
          category: 'Language'
        });
      } else {
        missingRequirements.push({
          id: 'req-work-lang-req',
          title: 'Minimum German Language Target (A2/B1)',
          description: 'German employers strongly expect minimum A2 or B1 level proficiency for professional integration.',
          status: 'missing',
          category: 'Language'
        });
      }

      // 3. Experience
      if (expYears >= 2 && hasExperienceDoc) {
        matchedRequirements.push({
          id: 'req-work-exp',
          title: 'Verified Professional IT/Skilled Experience',
          description: `${expYears} years of verified experience confirmed via formal employer reference letter.`,
          status: 'matched',
          category: 'Experience',
          details: 'Verified by employer reference'
        });
      } else if (expYears >= 2) {
        missingRequirements.push({
          id: 'req-work-exp-doc',
          title: 'Employer Experience Verification Letter (Arbeitszeugnis / Experience Letter)',
          description: 'Official signed letter from employer verifying claimed 2 years of skilled professional IT tenure.',
          status: 'missing',
          category: 'Experience',
          details: 'Self-reported on profile without formal employer certificate'
        });
        potentialIssues.push({
          id: 'issue-exp-unverified',
          title: 'Professional Experience Verification Pending',
          description: 'Claimed 2 years of full-time employment is not yet corroborated by documentation.',
          status: 'review_required',
          category: 'Experience'
        });
      } else {
        potentialIssues.push({
          id: 'issue-exp-entry',
          title: 'Limited Prior Industry Experience',
          description: 'Entry-level applicants must target junior positions or graduate trainee pathways.',
          status: 'review_required',
          category: 'Experience'
        });
      }

      // 4. Identity
      if (verifiedDocTypes.has('passport')) {
        matchedRequirements.push({
          id: 'req-work-id',
          title: 'Valid International Passport',
          description: 'Biometric identification verified for embassy submission.',
          status: 'matched',
          category: 'Financial/Visa'
        });
      }
    } else if (goal === 'Study in Germany') {
      // Study path logic
      if (hasDegreeDoc || verifiedDocTypes.has('marks_card')) {
        matchedRequirements.push({
          id: 'req-study-hzb',
          title: 'Higher Education Entrance Qualification (HZB)',
          description: 'Academic credentials verified for German University / Uni-Assist evaluation.',
          status: 'matched',
          category: 'Education'
        });
      } else {
        missingRequirements.push({
          id: 'req-study-hzb-missing',
          title: 'Academic Transcripts and School Leaving Certificate',
          description: 'Transcripts are mandatory for Uni-Assist preliminary documentation (VPD).',
          status: 'missing',
          category: 'Education'
        });
      }

      if (['B2', 'C1', 'C2'].includes(langLevel) && hasLanguageDoc) {
        matchedRequirements.push({
          id: 'req-study-lang',
          title: 'Academic Language Proficiency',
          description: `Certified at ${langLevel}, qualifying for German-medium degree programs.`,
          status: 'matched',
          category: 'Language'
        });
      } else {
        missingRequirements.push({
          id: 'req-study-lang-target',
          title: 'Target B2/C1 Language Certificate (TestDaF / Goethe / DSH)',
          description: 'German-taught university curricula require minimum B2/C1 proficiency.',
          status: 'missing',
          category: 'Language'
        });
      }
    } else {
      // Ausbildung path logic
      if (['B1', 'B2'].includes(langLevel) && hasLanguageDoc) {
        matchedRequirements.push({
          id: 'req-ausbildung-lang',
          title: 'German Language for Vocational School (B1/B2)',
          description: 'Sufficient language level for vocational school (Berufsschule) instruction.',
          status: 'matched',
          category: 'Language'
        });
      } else {
        missingRequirements.push({
          id: 'req-ausbildung-lang-missing',
          title: 'B1/B2 German Language Requirement for Ausbildung',
          description: 'Vocational training in Germany is conducted exclusively in German.',
          status: 'missing',
          category: 'Language'
        });
      }
    }

    let overallStatus: QualificationStatus = 'Ready';
    if (missingRequirements.length > 0 && matchedRequirements.length > 0) {
      overallStatus = 'Needs Attention';
    } else if (missingRequirements.length > 2) {
      overallStatus = 'Incomplete';
    } else if (potentialIssues.length > 0) {
      overallStatus = 'Under Review';
    }

    let agentSummary = '';
    if (overallStatus === 'Ready') {
      agentSummary = `All primary criteria for ${goal} are satisfied. Document verification bundle is solid.`;
    } else if (overallStatus === 'Needs Attention') {
      agentSummary = `Key qualifications (academic, language) are verified, but ${missingRequirements[0]?.title || 'pending requirement'} needs immediate attention.`;
    } else {
      agentSummary = `Additional foundational requirements and verifications are needed for ${goal}.`;
    }

    return {
      id: `qual-${applicantId}-${Date.now()}`,
      applicantId,
      overallStatus,
      targetGoal: goal,
      matchedRequirements,
      missingRequirements,
      potentialIssues,
      evaluatedAt: new Date().toISOString(),
      agentSummary,
      disclaimer: OFFICIAL_DISCLAIMER
    };
  };

  const prompt = `
You are the Qualification Agent for GermanPath AI.
Evaluate this applicant's profile and verified documents for target path: "${goal}".

Profile:
- Qualification: ${profile.education.highestQualification.value} in ${profile.education.fieldOfStudy.value} (${profile.education.institution.value}, ${profile.education.graduationYear.value})
- Experience: ${profile.experience.yearsOfExperience.value} years as ${profile.experience.currentOrRecentRole.value}
- German Level: ${profile.languageLevel.value}
- Goal: ${goal}

Verified Uploaded Documents:
${documents.map(d => `- ${d.name} (${d.type}) [Status: ${d.status}]`).join('\n') || 'None'}

Rules for German Pathways:
1. Work in Germany (EU Blue Card / Section 18g):
   - Academic degree recognized (Anabin) -> matched if degree certificate present.
   - German language -> B1 is matched; A1/A2 or missing is missing/issue.
   - Professional experience -> Requires formal employer experience letter. If applicant claims 2+ years but no letter exists, list in missingRequirements and potentialIssues.
   - Passport -> matched if uploaded.
2. Status options: "Ready" (all core met), "Needs Attention" (good profile but 1-2 critical requirements missing), "Incomplete" (lacking basics), "Under Review" (discrepancies).
3. Do NOT make definitive legal decisions. Always include the standard disclaimer.

Return JSON adhering strictly to:
{
  "overallStatus": "Ready" | "Needs Attention" | "Incomplete" | "Under Review",
  "matchedRequirements": [
    { "id": "req-...", "title": "...", "description": "...", "status": "matched", "category": "Education" | "Language" | "Experience" | "Documents" | "Financial/Visa", "details": "..." }
  ],
  "missingRequirements": [
    { "id": "req-...", "title": "...", "description": "...", "status": "missing", "category": "...", "details": "..." }
  ],
  "potentialIssues": [
    { "id": "issue-...", "title": "...", "description": "...", "status": "review_required", "category": "...", "details": "..." }
  ],
  "agentSummary": "..."
}
`;

  const result = await callGeminiStructured<any>({
    prompt,
    systemInstruction: 'You are the Qualification Agent in an AI agentic pipeline. You perform structured qualification checks against German immigration baselines without legal overreach.',
    fallbackGenerator: fallback
  });

  const parsed = result.data;
  return {
    id: `qual-${applicantId}-${Date.now()}`,
    applicantId,
    overallStatus: parsed.overallStatus || 'Needs Attention',
    targetGoal: goal,
    matchedRequirements: parsed.matchedRequirements || [],
    missingRequirements: parsed.missingRequirements || [],
    potentialIssues: parsed.potentialIssues || [],
    evaluatedAt: new Date().toISOString(),
    agentSummary: parsed.agentSummary || 'Qualification requirements analyzed against German benchmarks.',
    disclaimer: OFFICIAL_DISCLAIMER
  };
}
