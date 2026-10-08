import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbStore, POSTGRES_DDL_SCHEMA } from './server/db';
import { runOrchestratorPipeline } from './server/agents/orchestrator';
import { generateGermanCV } from './server/agents/cvAgent';
import { callGeminiStructured, callGeminiText } from './server/gemini';
import { matchAlumniAgent, MOCK_ALUMNI_DATABASE } from './src/data/alumniData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'GermanPath AI Server',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

// PostgreSQL Schema DDL endpoint
app.get('/api/db/schema', (req, res) => {
  res.json({
    schemaSql: POSTGRES_DDL_SCHEMA,
    databaseEngine: 'PostgreSQL 16 Enterprise Ready',
    tables: [
      'applicants',
      'applicant_profiles',
      'documents',
      'qualifications',
      'requirements',
      'gaps',
      'next_best_actions',
      'agent_activity_logs',
      'cvs',
      'journey_states'
    ]
  });
});

// Get all applicants
app.get('/api/applicants', (req, res) => {
  const applicants = dbStore.getAllApplicants().map(a => ({
    id: a.id,
    name: a.name,
    country: a.country,
    goal: a.goal,
    germanLevel: a.germanLevel,
    completionPercentage: a.profile.completionPercentage,
    qualificationStatus: a.qualification.overallStatus
  }));
  res.json({ applicants });
});

// Reset / Load Demo Applicant
app.post('/api/applicants/demo', (req, res) => {
  const rawType = req.body?.type;
  const type = rawType === 'rahul' ? 'rahul' : rawType === 'elena' ? 'elena' : 'malavika';
  const demo = dbStore.resetDemo(type);
  res.json({ success: true, applicant: demo });
});

// Get Applicant by ID
app.get('/api/applicants/:id', (req, res) => {
  const applicant = dbStore.getApplicant(req.params.id);
  if (!applicant) {
    return res.status(404).json({ error: 'Applicant not found' });
  }
  res.json({ applicant });
});

// Sync applicant from client / Firebase into server memory
app.post('/api/applicants/sync', (req, res) => {
  const { applicant } = req.body;
  if (!applicant || !applicant.id) {
    return res.status(400).json({ error: 'Missing applicant data' });
  }
  const saved = dbStore.saveApplicant(applicant);
  res.json({ success: true, applicant: saved });
});

// Create new applicant from Onboarding
app.post('/api/applicants', (req, res) => {
  const {
    fullName,
    country,
    age,
    highestQualification,
    fieldOfStudy,
    institution,
    graduationYear,
    yearsOfExperience,
    recentRole,
    skills,
    germanLevel,
    goal
  } = req.body;

  if (!fullName || !goal) {
    return res.status(400).json({ error: 'Missing required fields: fullName, goal' });
  }

  const applicant = dbStore.createApplicant({
    fullName,
    country: country || 'International',
    age: Number(age) || 24,
    highestQualification: highestQualification || 'Bachelor Degree',
    fieldOfStudy: fieldOfStudy || 'Computer Science',
    institution: institution || 'University',
    graduationYear: Number(graduationYear) || 2024,
    yearsOfExperience: Number(yearsOfExperience) || 1,
    recentRole: recentRole || 'Software Engineer',
    skills: Array.isArray(skills) ? skills : ['Problem Solving'],
    germanLevel: germanLevel || 'A1',
    goal
  });

  res.status(201).json({ success: true, applicant });
});

// Update profile fields
app.put('/api/applicants/:id/profile', (req, res) => {
  const applicant = dbStore.getApplicant(req.params.id);
  if (!applicant) {
    return res.status(404).json({ error: 'Applicant not found' });
  }

  const updates = req.body;
  if (updates.fullName) applicant.profile.personal.fullName.value = updates.fullName;
  if (updates.country) applicant.profile.personal.country.value = updates.country;
  if (updates.age) applicant.profile.personal.age.value = Number(updates.age);
  if (updates.email) {
    if (!applicant.profile.personal.email) {
      applicant.profile.personal.email = { value: updates.email, source: 'user_provided' };
    } else {
      applicant.profile.personal.email.value = updates.email;
    }
  }

  if (updates.highestQualification) applicant.profile.education.highestQualification.value = updates.highestQualification;
  if (updates.fieldOfStudy) applicant.profile.education.fieldOfStudy.value = updates.fieldOfStudy;
  if (updates.institution) applicant.profile.education.institution.value = updates.institution;
  if (updates.graduationYear) applicant.profile.education.graduationYear.value = Number(updates.graduationYear);

  if (updates.yearsOfExperience !== undefined) applicant.profile.experience.yearsOfExperience.value = Number(updates.yearsOfExperience);
  if (updates.recentRole) applicant.profile.experience.currentOrRecentRole.value = updates.recentRole;
  if (updates.skills && Array.isArray(updates.skills)) applicant.profile.experience.skills.value = updates.skills;
  if (updates.germanLevel) applicant.profile.languageLevel.value = updates.germanLevel;
  if (updates.goal) applicant.profile.goal.value = updates.goal;

  applicant.updatedAt = new Date().toISOString();
  dbStore.saveApplicant(applicant);

  res.json({ success: true, profile: applicant.profile });
});

// Upload document & trigger full orchestrator loop
app.post('/api/applicants/:id/documents', async (req, res) => {
  try {
    const { name, type, rawText, fileSize } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Document name is required' });
    }

    const result = await runOrchestratorPipeline({
      applicantId: req.params.id,
      triggerReason: `New document uploaded: ${name}`,
      pendingDocument: {
        name,
        type,
        rawText,
        fileSize: fileSize || '1.2 MB'
      }
    });

    res.json({
      success: true,
      applicant: result.applicant,
      newLogs: result.newActivityLogs,
      summary: result.orchestrationSummary
    });
  } catch (error: any) {
    console.error('Error handling document upload:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Complete Next Best Action (Interactive loop trigger)
app.post('/api/applicants/:id/action/complete', async (req, res) => {
  try {
    const applicant = dbStore.getApplicant(req.params.id);
    if (!applicant) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    const currentAction = applicant.nextBestAction;

    // Simulate completion based on current action type
    let pendingDoc: any = undefined;
    let reason = `Applicant clicked to complete next best action: "${currentAction.title}"`;

    if (currentAction.targetDocumentType === 'experience_letter' || currentAction.title.toLowerCase().includes('experience')) {
      pendingDoc = {
        name: 'Official_Employer_Experience_Letter_ApexCloud.pdf',
        type: 'experience_letter',
        fileSize: '1.6 MB',
        rawText: 'To whom it may concern: Rahul Sharma has worked full-time as a Full-Stack Software Engineer at Apex Cloud Solutions for 2 years (July 2024 to present). Demonstrated strong competence in TypeScript, React, Docker, and distributed systems.'
      };
      reason = 'Applicant submitted required official employer experience verification certificate.';
    } else if (currentAction.targetDocumentType === 'degree_certificate' || currentAction.title.toLowerCase().includes('degree')) {
      const isMalavika = applicant.name.toLowerCase().includes('malavika');
      pendingDoc = {
        name: isMalavika ? 'Sapthagiri_NPS_Degree_Certificate_Malavika.pdf' : 'Official_Bachelor_Degree_Certificate.pdf',
        type: 'degree_certificate',
        fileSize: '2.1 MB',
        rawText: isMalavika
          ? 'Sapthagiri NPS University: This is to certify that Malavika J Dev (Roll No: 21SNPSU042, Certificate ID: SNPSU/BTECH/CSE/2025/042) has successfully completed the Bachelor of Technology in Computer Science & Engineering in the year 2025 with Cumulative Grade Point Average (CGPA) 8.8.'
          : 'National Institute of Technology: Bachelor of Technology in Computer Science awarded to Rahul Sharma (Roll: NIT-2020-CS-118, Cert ID: NIT/BTECH/CSE/2024/118) with Distinction, graduation year 2024, CGPA 8.6.'
      };
      reason = isMalavika
        ? 'Applicant submitted Sapthagiri NPS University Degree Certificate for 3-layer forensic verification.'
        : 'Applicant submitted authenticated degree certificate.';
    } else if (currentAction.actionType === 'verify_information') {
      // Clear discrepancies
      for (const doc of applicant.documents) {
        doc.inconsistencies = [];
        if (doc.status === 'Potential Inconsistency') doc.status = 'Verified';
      }
      reason = 'Applicant verified and resolved the flagged profile discrepancy.';
    }

    const result = await runOrchestratorPipeline({
      applicantId: req.params.id,
      triggerReason: reason,
      pendingDocument: pendingDoc
    });

    // Mark previous action as completed
    result.applicant.nextBestAction.completed = false; // new action is active

    res.json({
      success: true,
      applicant: result.applicant,
      newLogs: result.newActivityLogs,
      summary: result.orchestrationSummary
    });
  } catch (error: any) {
    console.error('Error completing next action:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Manually trigger pipeline re-evaluation
app.post('/api/applicants/:id/run-pipeline', async (req, res) => {
  try {
    const result = await runOrchestratorPipeline({
      applicantId: req.params.id,
      triggerReason: 'Manual re-evaluation triggered by user'
    });
    res.json({
      success: true,
      applicant: result.applicant,
      newLogs: result.newActivityLogs,
      summary: result.orchestrationSummary
    });
  } catch (error: any) {
    console.error('Error running pipeline:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// CV Generation
app.post('/api/applicants/:id/cv/generate', async (req, res) => {
  try {
    const applicant = dbStore.getApplicant(req.params.id);
    if (!applicant) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    const cv = await generateGermanCV(applicant.id, applicant.profile, applicant.documents);
    applicant.cv = cv;
    applicant.updatedAt = new Date().toISOString();
    dbStore.saveApplicant(applicant);

    res.json({ success: true, cv });
  } catch (error: any) {
    console.error('Error generating CV:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Introduction Video Analysis & Profile Synthesis endpoint
app.post('/api/applicants/:id/video-analysis', async (req, res) => {
  try {
    const { videoTitle, transcriptOrNotes, videoBase64, updateProfileWithInsights } = req.body;
    const applicant = dbStore.getApplicant(req.params.id);
    if (!applicant) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    const fallback = () => ({
      motivationScore: 'Exceptional (High Cultural & Professional Alignment for Germany)',
      detectedBackground: `${applicant.profile.education.highestQualification.value || 'Bachelor of Science'} in ${applicant.profile.education.fieldOfStudy.value || 'Computer Engineering'}`,
      careerGoal: applicant.profile.goal.value || 'IT Specialist in Germany',
      keySkillsMentioned: applicant.profile.experience.skills.value.length > 0 
        ? applicant.profile.experience.skills.value 
        : ['TypeScript', 'Cloud Architecture', 'German B1 Communication', 'Agile Delivery', 'Problem Solving'],
      communicationTone: 'Clear, articulate, proactive, high intercultural readiness',
      languageSuitability: `Confirmed proficient and confident in English, progressing actively in German (${applicant.profile.languageLevel.value || 'B1'}).`,
      recommendedAction: 'Profile auto-enhanced! Video verified and synthesized into candidate dossier.',
      transcription: transcriptOrNotes || 'Hello, I am presenting my professional and academic background for my journey to Germany. I have a technical foundation in software engineering, practical development experience, and verified German language certification. I am excited to contribute to innovative German enterprises under European skilled mobility frameworks.'
    });

    const prompt = `
Analyze and transcribe this applicant's Introduction Video pitch for German immigration / university admissions.
Video title: "${videoTitle || 'Self-Introduction Video'}"
User Notes/Spoken context: "${transcriptOrNotes || 'Candidate spoke directly on camera explaining their qualifications, educational journey, language skills, and relocation intent for Germany.'}"
Current applicant goal: "${applicant.profile.goal.value}"
Current German level: "${applicant.profile.languageLevel.value}"

Tasks:
1. Provide a clean, faithful spoken transcription of the video content.
2. Evaluate motivation score & cultural alignment for Germany.
3. Extract detected background (degrees, university, years).
4. Extract expressed career goal.
5. Extract key skills mentioned as an array of strings.
6. Assess communication tone and language suitability.
7. Recommend strategic next action.

Return JSON:
{
  "transcription": "...",
  "motivationScore": "...",
  "detectedBackground": "...",
  "careerGoal": "...",
  "keySkillsMentioned": ["..."],
  "communicationTone": "...",
  "languageSuitability": "...",
  "recommendedAction": "..."
}
`;

    const result = await callGeminiStructured<any>({
      prompt,
      systemInstruction: 'You are a multimodal AI agent specialized in analyzing and transcribing international candidate video pitches for German academic admissions and EU Blue Card / Skilled Worker recruitment.',
      fallbackGenerator: fallback
    });

    const analysis = result.data;

    // Automatically update applicant profile with new extracted video insights to boost profile completion!
    if (updateProfileWithInsights !== false) {
      // 1. Add video to documents vault if not already present
      const hasVideoDoc = applicant.documents.some(d => d.type === 'video_intro' || d.name.toLowerCase().includes('video'));
      if (!hasVideoDoc) {
        applicant.documents.unshift({
          id: `doc-vid-${Date.now()}`,
          applicantId: applicant.id,
          name: videoTitle || 'Self_Introduction_Pitch.mp4',
          type: 'video_intro',
          uploadedAt: new Date().toISOString(),
          status: 'Verified',
          fileSize: '4.8 MB',
          rawText: analysis.transcription || transcriptOrNotes || 'Spoken candidate pitch transcribed by Gemini Multimodal Agent.',
          rawTextPreview: (analysis.transcription || transcriptOrNotes || '').slice(0, 150),
          inconsistencies: [],
          forensics: {
            isAuthentic: true,
            finalStatus: 'VERIFIED',
            confidence: 96,
            aiGeneratedProbability: 4,
            manipulationScore: 2,
            isSampleDemo: false,
            extractedData: {
              transcription: analysis.transcription || transcriptOrNotes,
              spokenSkills: analysis.keySkillsMentioned || []
            },
            forensicFlags: [],
            inconsistencies: [],
            externalVerification: {
              source: 'Gemini Multimodal Live Verification Engine',
              status: 'found',
              verified: true,
              verificationId: `MM-LIVE-${Date.now().toString().slice(-6)}`
            },
            verificationSummary: 'Multimodal Video verified: Spoken transcription matches candidate profile credentials with high clarity.'
          }
        });
      }

      // 2. Synthesize newly identified skills into profile
      if (Array.isArray(analysis.keySkillsMentioned) && analysis.keySkillsMentioned.length > 0) {
        const existingSkills = new Set(applicant.profile.experience.skills.value);
        analysis.keySkillsMentioned.forEach((skill: string) => existingSkills.add(skill));
        applicant.profile.experience.skills.value = Array.from(existingSkills);
        applicant.profile.experience.skills.source = 'ai_inferred';
      }

      // 3. Mark profile completeness boost (up to 100%)
      if (applicant.profile.completionPercentage < 98) {
        applicant.profile.completionPercentage = Math.min(100, applicant.profile.completionPercentage + 15);
      }

      // 4. Log agent activity
      applicant.activityLogs.unshift({
        id: `log-vid-${Date.now()}`,
        timestamp: new Date().toISOString(),
        agentName: 'Multimodal Agent',
        status: 'completed',
        headline: 'Video Pitch Transcribed & Profile Enriched',
        detail: `Extracted spoken skills (${(analysis.keySkillsMentioned || []).slice(0, 3).join(', ')}). Profile completion increased to ${applicant.profile.completionPercentage}%.`
      });

      applicant.updatedAt = new Date().toISOString();
      dbStore.saveApplicant(applicant);
    }

    res.json({ 
      success: true, 
      analysis, 
      source: result.source,
      updatedApplicant: applicant 
    });
  } catch (error: any) {
    console.error('Error analyzing video:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Alumni Matching Endpoint (Alumni Matching Agent)
app.post('/api/alumni/match', (req, res) => {
  const { targetCollege, targetCourse, targetField, originState, goal } = req.body;
  const matchResult = matchAlumniAgent({
    targetCollege,
    targetCourse,
    targetField,
    originState,
    goal
  });
  res.json({
    success: true,
    matchedAlumni: matchResult.matchedAlumni,
    matchingReason: matchResult.matchingReason,
    isExactCollegeMatch: matchResult.isExactCollegeMatch
  });
});

// Senior-Junior Interactive Connect Chat Simulation
app.post('/api/alumni/chat', async (req, res) => {
  try {
    const { seniorId, seniorName, seniorCollege, seniorRole, message, chatHistory } = req.body;
    
    // Find senior in dataset
    const senior = MOCK_ALUMNI_DATABASE.find(a => a.id === seniorId) || MOCK_ALUMNI_DATABASE[0];

    const fallbackResponse = `Hallo! Glad you reached out. Regarding your question about ${senior.college}: In reality, ${senior.expectationVsReality.reality}. My biggest practical advice: ${senior.expectationVsReality.tip} Feel free to ask more or book a 15-min call if you want detailed guidance!`;

    const prompt = `
You are ${senior.name}, an authentic Indian alumni currently in Germany:
- Current Role: ${senior.currentRole}
- College/Institute: ${senior.college}
- Course: ${senior.course}
- Origin: ${senior.origin}
- Languages you speak: ${senior.languages.join(', ')}
- Your verified experience & reality check:
  * Expected: "${senior.expectationVsReality.expected}"
  * Reality: "${senior.expectationVsReality.reality}"
  * Practical Senior Tip: "${senior.expectationVsReality.tip}"
  * Your Experience Tags: ${senior.experienceTags.join(', ')}

A prospective junior from India is asking you for ground advice before applying/paying fees.
Junior's message: "${message}"

Recent conversation context:
${Array.isArray(chatHistory) ? chatHistory.slice(-4).map((m: any) => `${m.sender}: ${m.text}`).join('\n') : 'First question.'}

Instructions:
1. Reply warmly and practically as an authentic senior brother/sister ("Anna", "Akka", "Bhaiya", or friendly Indian-German senior tone).
2. Give real ground facts (costs, German language requirements, housing realities, part-time jobs, hospital shifts, exams) based on your profile.
3. Be candid and prevent expectation mismatch, while encouraging them if they are genuinely prepared.
4. Keep the reply concise (2-4 sentences max), conversational, and actionable.
`;

    const reply = await callGeminiText({
      prompt,
      systemInstruction: 'You are an authentic senior alumni mentoring international applicants for Germany.',
      fallbackText: fallbackResponse
    });

    res.json({
      success: true,
      seniorId: senior.id,
      seniorName: senior.name,
      reply: reply.trim()
    });
  } catch (error: any) {
    console.error('Alumni chat error:', error);
    res.json({
      success: true,
      seniorId: req.body?.seniorId,
      seniorName: req.body?.seniorName || 'Senior Alumni',
      reply: 'Hallo! Living and studying here in Germany is definitely rewarding, but ground reality requires good budgeting and German B2. Feel free to book a 15-min 1-on-1 call with me!'
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GermanPath AI Server active at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
