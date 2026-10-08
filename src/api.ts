import { ApplicantEntity, ApplicantProfile, DocumentRecord, GeneratedCV } from './types';

export async function fetchHealth(): Promise<{ status: string; geminiConfigured: boolean }> {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchApplicant(id: string): Promise<ApplicantEntity> {
  const res = await fetch(`/api/applicants/${id}`);
  if (!res.ok) throw new Error('Failed to fetch applicant');
  const data = await res.json();
  return data.applicant;
}

export async function loadDemoApplicant(type: 'malavika' | 'rahul' | 'elena' = 'malavika'): Promise<ApplicantEntity> {
  const res = await fetch('/api/applicants/demo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type })
  });
  if (!res.ok) throw new Error('Failed to load demo applicant');
  const data = await res.json();
  return data.applicant;
}

export async function createApplicant(formData: {
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
  germanLevel: string;
  goal: string;
}): Promise<ApplicantEntity> {
  const res = await fetch('/api/applicants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  if (!res.ok) throw new Error('Failed to create applicant');
  const data = await res.json();
  return data.applicant;
}

export async function syncApplicantToServer(applicant: ApplicantEntity): Promise<ApplicantEntity> {
  const res = await fetch('/api/applicants/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ applicant })
  });
  if (!res.ok) throw new Error('Failed to sync applicant');
  const data = await res.json();
  return data.applicant;
}

export async function updateProfile(id: string, updates: Partial<{
  fullName: string;
  country: string;
  age: number;
  email: string;
  highestQualification: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: number;
  yearsOfExperience: number;
  recentRole: string;
  skills: string[];
  germanLevel: string;
  goal: string;
}>): Promise<ApplicantProfile> {
  const res = await fetch(`/api/applicants/${id}/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update profile');
  const data = await res.json();
  return data.profile;
}

export async function uploadDocument(id: string, doc: {
  name: string;
  type?: string;
  rawText?: string;
  fileSize?: string;
}): Promise<{ applicant: ApplicantEntity; summary: string }> {
  const res = await fetch(`/api/applicants/${id}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doc)
  });
  if (!res.ok) throw new Error('Failed to upload document and run pipeline');
  return res.json();
}

export async function completeNextAction(id: string): Promise<{ applicant: ApplicantEntity; summary: string }> {
  const res = await fetch(`/api/applicants/${id}/action/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('Failed to complete action');
  return res.json();
}

export async function runPipeline(id: string): Promise<{ applicant: ApplicantEntity; summary: string }> {
  const res = await fetch(`/api/applicants/${id}/run-pipeline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('Failed to re-run pipeline');
  return res.json();
}

export async function generateCV(id: string): Promise<GeneratedCV> {
  const res = await fetch(`/api/applicants/${id}/cv/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('Failed to generate CV');
  const data = await res.json();
  return data.cv;
}

export async function analyzeVideoIntro(id: string, payload: {
  videoTitle?: string;
  transcriptOrNotes?: string;
  videoBase64?: string;
  updateProfileWithInsights?: boolean;
}): Promise<any> {
  const res = await fetch(`/api/applicants/${id}/video-analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to analyze video');
  return res.json();
}

export async function fetchDbSchema(): Promise<{ schemaSql: string; tables: string[] }> {
  const res = await fetch('/api/db/schema');
  if (!res.ok) throw new Error('Failed to fetch schema');
  return res.json();
}

export async function fetchAlumniMatches(payload: {
  targetCollege?: string;
  targetCourse?: string;
  targetField?: string;
  originState?: string;
  goal?: string;
}): Promise<{ matchedAlumni: any[]; matchingReason: string; isExactCollegeMatch: boolean }> {
  const res = await fetch('/api/alumni/match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to match alumni');
  return res.json();
}

export async function sendAlumniChatMessage(payload: {
  seniorId: string;
  seniorName: string;
  seniorCollege: string;
  seniorRole: string;
  message: string;
  chatHistory: Array<{ sender: string; text: string }>;
}): Promise<{ reply: string; seniorName: string }> {
  const res = await fetch('/api/alumni/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to send alumni message');
  return res.json();
}

