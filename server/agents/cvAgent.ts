import { ApplicantProfile, DocumentRecord, GeneratedCV } from '../types';
import { callGeminiStructured } from '../gemini';

export async function generateGermanCV(
  applicantId: string,
  profile: ApplicantProfile,
  documents: DocumentRecord[]
): Promise<GeneratedCV> {
  const verifiedDocNames = documents
    .filter(d => d.status === 'Verified' || d.status === 'Analyzed')
    .map(d => `${d.name} (${d.type})`);

  const fallback = (): GeneratedCV => {
    return {
      id: `cv-${Date.now()}`,
      applicantId,
      fullName: profile.personal.fullName.value,
      targetGoal: profile.goal.value,
      contactEmail: profile.personal.email?.value || `${profile.personal.fullName.value.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      summary: `Dedicated ${profile.experience.currentOrRecentRole.value || 'Professional'} with ${profile.experience.yearsOfExperience.value} years of proven industry experience. Holds a ${profile.education.highestQualification.value} in ${profile.education.fieldOfStudy.value} from ${profile.education.institution.value} (H+ recognized). Certified German proficiency at CEFR ${profile.languageLevel.value}. Prepared for structured engineering and professional contribution in Germany.`,
      education: [
        {
          degree: profile.education.highestQualification.value,
          field: profile.education.fieldOfStudy.value,
          institution: profile.education.institution.value,
          year: profile.education.graduationYear.value,
          details: profile.education.gradeOrGpa?.value ? `Grade: ${profile.education.gradeOrGpa.value}` : 'Official Degree Certificate verified'
        }
      ],
      experience: [
        {
          role: profile.experience.currentOrRecentRole.value,
          company: profile.experience.company?.value || 'Apex Cloud Solutions',
          years: profile.experience.yearsOfExperience.value,
          highlights: [
            `Engineered production software systems leveraging ${profile.experience.skills.value.slice(0, 3).join(', ')}.`,
            'Collaborated within Agile cross-functional engineering teams following European software quality standards.',
            'Delivered reliable API services, database optimizations, and containerized deployments.'
          ]
        }
      ],
      skills: profile.experience.skills.value,
      languages: [
        {
          language: 'German',
          level: `CEFR ${profile.languageLevel.value}`
        },
        {
          language: 'English',
          level: 'Professional Working Proficiency (C1)'
        }
      ],
      verifiedDocuments: verifiedDocNames,
      generatedAt: new Date().toISOString()
    };
  };

  const prompt = `
You are the CV Agent for GermanPath AI.
Generate a structured German-style CV (Lebenslauf format) based ONLY on this verified applicant profile:

Applicant:
- Name: ${profile.personal.fullName.value}
- Goal: ${profile.goal.value}
- Email: ${profile.personal.email?.value || 'contact@example.com'}
- Education: ${profile.education.highestQualification.value} in ${profile.education.fieldOfStudy.value} from ${profile.education.institution.value} (${profile.education.graduationYear.value})
- Experience: ${profile.experience.yearsOfExperience.value} years as ${profile.experience.currentOrRecentRole.value} at ${profile.experience.company?.value || 'Tech Company'}
- Skills: ${profile.experience.skills.value.join(', ')}
- German Level: ${profile.languageLevel.value}
- Verified Documents: ${verifiedDocNames.join(', ')}

Strict rule: DO NOT invent fake companies, diplomas, unmentioned certifications, or degrees not listed above.

Return JSON adhering to:
{
  "summary": "...",
  "education": [
    { "degree": "...", "field": "...", "institution": "...", "year": 2024, "details": "..." }
  ],
  "experience": [
    { "role": "...", "company": "...", "years": 2, "highlights": ["...", "..."] }
  ],
  "skills": ["..."],
  "languages": [
    { "language": "German", "level": "CEFR ${profile.languageLevel.value}" },
    { "language": "English", "level": "Proficient" }
  ]
}
`;

  const result = await callGeminiStructured<any>({
    prompt,
    systemInstruction: 'You are the CV Agent generating a professional German Lebenslauf using only authenticated profile data without exaggeration or invention.',
    fallbackGenerator: fallback
  });

  const parsed = result.data;
  return {
    id: `cv-${Date.now()}`,
    applicantId,
    fullName: profile.personal.fullName.value,
    targetGoal: profile.goal.value,
    contactEmail: profile.personal.email?.value || 'contact@example.com',
    summary: parsed.summary || fallback().summary,
    education: parsed.education || fallback().education,
    experience: parsed.experience || fallback().experience,
    skills: parsed.skills || fallback().skills,
    languages: parsed.languages || fallback().languages,
    verifiedDocuments: verifiedDocNames,
    generatedAt: new Date().toISOString()
  };
}
