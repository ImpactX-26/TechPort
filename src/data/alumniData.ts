import { AlumniProfile } from '../types';

export const GERMAN_COLLEGES_AND_INSTITUTIONS: string[] = [
  'Heidelberg University',
  'TU Munich (Technical University of Munich)',
  'Charité – Universitätsmedizin Berlin',
  'Ludwigshafen University of Business and Society',
  'RWTH Aachen University',
  'Karlsruhe Institute of Technology (KIT)',
  'TU Berlin (Technical University of Berlin)',
  'LMU Munich (Ludwig Maximilian University)',
  'University of Freiburg',
  'University of Tübingen',
  'University of Bonn',
  'University of Göttingen',
  'Humboldt University of Berlin',
  'Free University of Berlin (FU Berlin)',
  'University of Hamburg',
  'TU Dresden (Technical University Dresden)',
  'University of Stuttgart',
  'TU Darmstadt (Technical University of Darmstadt)',
  'FAU Erlangen-Nürnberg',
  'University of Cologne',
  'University of Münster',
  'Goethe University Frankfurt',
  'University of Leipzig',
  'Vivantes Klinikum Nursing Ausbildung Berlin',
  'Universitätsklinikum Heidelberg Ausbildung',
  'Klinikum Stuttgart Nursing Ausbildung',
  'Siemens Professional Education Berlin',
  'Bosch Duale Ausbildung Stuttgart',
  'BMW Duales Studium Munich',
  'SAP Duales Studium Walldorf',
  'Frankfurt School of Finance & Management',
  'Mannheim Business School',
  'Ulm University',
  'University of Bremen',
  'Leibniz University Hannover',
  'TU Dortmund University',
  'University of Duisburg-Essen',
  'University of Würzburg',
  'University of Jena',
  'University of Potsdam',
  'Augsburg University',
  'University of Konstanz',
  'University of Passau',
  'University of Bayreuth',
  'Otto von Guericke University Magdeburg',
  'University of Rostock',
  'Kiel University (CAU)',
  'Hochschule München (HM)',
  'TH Köln (Cologne University of Applied Sciences)',
  'Esslingen University of Applied Sciences',
  'Offenburg University of Applied Sciences',
  'Not decided yet'
];

export const MOCK_ALUMNI_DATABASE: AlumniProfile[] = [
  {
    id: 'alumni-rahul-m',
    name: 'Rahul M.',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    batch: '2023 Batch',
    currentRole: 'Registered Nurse at Charité Campus Virchow-Klinikum, Berlin',
    college: 'Charité – Universitätsmedizin Berlin',
    course: 'Ausbildung Nursing (Pflegefachmann)',
    field: 'Nursing',
    origin: 'From Kerala, India - 2023 Batch',
    originState: 'Kerala',
    experienceTags: ['Hostel Reality', 'Part-time Jobs', 'German B2 Struggle', 'Ausbildung Stipend'],
    rating: { teaching: 4.4, hostel: 3.2, partTime: 5.0, overall: 4.2 },
    expectationVsReality: {
      expected: 'Expected a private single room in student dorm and living costs around €800/month.',
      reality: 'Shared 3-bed flat in Berlin-Wedding. Rent is €550, total monthly cost €1,200. But the €1,240 net stipend is 100% real and paid strictly on the 28th!',
      tip: 'Do Goethe B2 in India before boarding the flight. B1 only gets your visa stamped; patient handovers happen in rapid German.'
    },
    isVerifiedAlumni: true,
    availableForChat: true,
    responseTime: 'Replies in 2 hours',
    languages: ['Malayalam', 'English', 'German B2'],
    videoRealityUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-intern-in-a-lab-41712-large.mp4',
    quote: 'Hostel Reality: Expected private room, got shared 3-bed. But stipend €1200 is real and covers everything if you budget well.'
  },
  {
    id: 'alumni-priya-s',
    name: 'Priya S.',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    batch: '2022 Batch',
    currentRole: 'Junior Cloud Engineer at BMW Tech Hub, Munich',
    college: 'TU Munich (Technical University of Munich)',
    course: 'M.Sc. Informatics (Computer Science)',
    field: 'IT',
    origin: 'From Karnataka, India - 2022 Batch',
    originState: 'Karnataka',
    experienceTags: ['Munich Rent Crisis', 'Werkstudent Jobs', 'Blocked Account Reality', 'English vs German'],
    rating: { teaching: 4.8, hostel: 2.9, partTime: 4.6, overall: 4.4 },
    expectationVsReality: {
      expected: 'Expected €934 blocked account to cover Munich life and finding a flat within 2 weeks.',
      reality: 'Munich rent is minimum €750-900. Total expenses €1,350/mo. Took 45 applications over 2.5 months to find a WG room.',
      tip: 'Register on Studentenwerk München dormitory waitlist 12 months ahead. Apply for Werkstudent tech jobs in your 2nd semester.'
    },
    isVerifiedAlumni: true,
    availableForChat: true,
    responseTime: 'Replies in 1 hour',
    languages: ['Kannada', 'English', 'German B1'],
    videoRealityUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42352-large.mp4',
    quote: 'Munich is tech heaven, but dorm queues take 2 semesters. Start your WG search before landing!'
  },
  {
    id: 'alumni-arjun-k',
    name: 'Arjun K.',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    batch: '2024 Batch',
    currentRole: 'Industrial Mechatronics Trainee at ABB Ausbildung Center',
    college: 'Heidelberg University',
    course: 'Duale Ausbildung Mechatronik',
    field: 'Engineering',
    origin: 'From Tamil Nadu, India - 2024 Batch',
    originState: 'Tamil Nadu',
    experienceTags: ['Shift Work Reality', 'German Dialect', 'Safety Standards', 'Ausbildung Contract'],
    rating: { teaching: 4.5, hostel: 4.0, partTime: 3.5, overall: 4.3 },
    expectationVsReality: {
      expected: 'Assumed Ausbildung was mostly classroom lectures with occasional plant tours.',
      reality: 'Starts 6:30 AM sharp in protective gear. Real factory floor tooling 3 days/week with strict DIN industrial safety.',
      tip: 'Learn German technical vocabulary (Werkzeuge, Drehmoment, Stromlaufplan) prior to your first week.'
    },
    isVerifiedAlumni: true,
    availableForChat: true,
    responseTime: 'Replies in 3 hours',
    languages: ['Tamil', 'English', 'German B2'],
    videoRealityUrl: 'https://assets.mixkit.co/videos/preview/mixkit-engineer-working-on-a-machine-42410-large.mp4',
    quote: 'Factory starts 6:30 AM sharp. Real hands-on work from day 1, no textbook fluff.'
  },
  {
    id: 'alumni-ananya-r',
    name: 'Ananya R.',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    batch: '2022 Batch',
    currentRole: 'Data Scientist at Delivery Hero, Berlin',
    college: 'RWTH Aachen University',
    course: 'M.Sc. Data Science & Machine Learning',
    field: 'IT',
    origin: 'From Maharashtra, India - 2022 Batch',
    originState: 'Maharashtra',
    experienceTags: ['Rigorous Exams', 'HiWi Research Jobs', 'Aachen Border Life', 'Math Heavy'],
    rating: { teaching: 4.9, hostel: 4.1, partTime: 4.5, overall: 4.6 },
    expectationVsReality: {
      expected: 'Expected semester grades based on continuous assignments, quizzes, and group projects.',
      reality: '100% of course grade decided in a single brutal 120-minute written exam with 40-50% first-attempt failure rates.',
      tip: 'Join student Lerngruppen (study circles) in week 1. Solving past 5 years of Altklausuren (exam papers) is non-negotiable.'
    },
    isVerifiedAlumni: true,
    availableForChat: true,
    responseTime: 'Replies in 2 hours',
    languages: ['Marathi', 'Hindi', 'English', 'German A2'],
    quote: 'RWTH Aachen exams don’t forgive cramming. But the RWTH engineering degree commands instant respect across the EU.'
  },
  {
    id: 'alumni-kavita-p',
    name: 'Kavita P.',
    photoUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=400&q=80',
    batch: '2023 Batch',
    currentRole: 'ICU Nursing Trainee at Vivantes Klinikum Neukölln',
    college: 'Vivantes Klinikum Nursing Ausbildung Berlin',
    course: 'Ausbildung Pflegefachfrau (Healthcare & Nursing)',
    field: 'Nursing',
    origin: 'From Andhra Pradesh, India - 2023 Batch',
    originState: 'Andhra Pradesh',
    experienceTags: ['Hospital Shifts', 'Berlin Slang', 'Overtime Pay', 'Patient Empathy'],
    rating: { teaching: 4.3, hostel: 3.8, partTime: 4.0, overall: 4.1 },
    expectationVsReality: {
      expected: 'Believed textbook B1 German was enough for bedside patient conversations.',
      reality: 'Senior patients talk in Berliner dialect and rapid medical acronyms. The first 60 days were an intense ear workout.',
      tip: 'Watch German hospital TV shows like "Charité" and practice regional pronunciation before arriving.'
    },
    isVerifiedAlumni: true,
    availableForChat: true,
    responseTime: 'Replies in 1 hour',
    languages: ['Telugu', 'English', 'German B2'],
    quote: 'Berliner dialect was a shock! But nurses are respected, night shifts have premium pay, and you are never alone on ward.'
  },
  {
    id: 'alumni-rohan-d',
    name: 'Rohan D.',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    batch: '2023 Batch',
    currentRole: 'Automotive Engineering Student & Formula Student Member',
    college: 'TU Berlin (Technical University of Berlin)',
    course: 'B.Sc. Automotive Engineering',
    field: 'Engineering',
    origin: 'From Delhi, India - 2023 Batch',
    originState: 'Delhi',
    experienceTags: ['City Registration Bureaucracy', 'Tax ID Delay', 'Public Transport', 'TU Berlin Pace'],
    rating: { teaching: 4.1, hostel: 3.5, partTime: 4.6, overall: 4.0 },
    expectationVsReality: {
      expected: 'Expected to start part-time student work within 10 days of landing in Berlin.',
      reality: 'Bürgeramt appointment for City Registration (Anmeldung) took 6 weeks alone. Without it, no Tax ID and no work contract!',
      tip: 'Book your Bürgeramt registration slot online 3 weeks BEFORE your flight departure. Bring 2 months living emergency cash.'
    },
    isVerifiedAlumni: true,
    availableForChat: true,
    responseTime: 'Replies in 3 hours',
    languages: ['Hindi', 'English', 'German B1'],
    quote: 'German bureaucracy is real: no Anmeldung = no Tax ID = no salary payout. Book appointments before landing!'
  },
  {
    id: 'alumni-deepak-n',
    name: 'Deepak N.',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    batch: '2022 Batch',
    currentRole: 'Automation Specialist at Siemens Mobility, Berlin',
    college: 'Siemens Professional Education Berlin',
    course: 'Ausbildung Elektroniker für Betriebstechnik',
    field: 'Engineering',
    origin: 'From Punjab, India - 2022 Batch',
    originState: 'Punjab',
    experienceTags: ['Corporate Ausbildung', 'Permanent Job Offer', 'Indian Food & Gurdwara', 'Winter Adaptation'],
    rating: { teaching: 4.7, hostel: 4.2, partTime: 4.0, overall: 4.5 },
    expectationVsReality: {
      expected: 'Feared social isolation and harsh European winters with no familiar food.',
      reality: 'Huge community in Berlin, great Siemens subsidised cafeteria, and 95% guaranteed employment upon passing IHK exams.',
      tip: 'Siemens Ausbildung pays €1,150 first year rising to €1,300 in third year. Pass your IHK exams and you have a lifetime career.'
    },
    isVerifiedAlumni: true,
    availableForChat: true,
    responseTime: 'Replies in 2 hours',
    languages: ['Punjabi', 'Hindi', 'English', 'German B2'],
    quote: 'Siemens training is world-class. If you pass your IHK exam, 95% chance of a permanent German contract.'
  },
  {
    id: 'alumni-sneha-v',
    name: 'Sneha V.',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    batch: '2023 Batch',
    currentRole: 'Bioinformatics Research Intern at BASF SE, Ludwigshafen',
    college: 'Ludwigshafen University of Business and Society',
    course: 'M.Sc. Life Sciences & International Management',
    field: 'Biotechnology',
    origin: 'From Gujarat, India - 2023 Batch',
    originState: 'Gujarat',
    experienceTags: ['Chemical Capital BASF', 'Affordable Rent €380', 'Quiet Rhine Valley', 'Direct Industry Access'],
    rating: { teaching: 4.3, hostel: 4.5, partTime: 4.2, overall: 4.3 },
    expectationVsReality: {
      expected: 'Worried Ludwigshafen is a small industrial town with fewer opportunities than Munich.',
      reality: 'Living costs are half of Munich! Rent is only €380 for a modern room, and BASF chemical headquarters is right across the bridge.',
      tip: 'Do not ignore non-metro German cities. You save €500/month on rent while big corporate headquarters hire students continuously.'
    },
    isVerifiedAlumni: true,
    availableForChat: true,
    responseTime: 'Replies in 1 hour',
    languages: ['Gujarati', 'Hindi', 'English', 'German B1'],
    quote: 'Ludwigshafen is peaceful and rent is €380 instead of €850 in Munich, with BASF research labs right next door.'
  },
  {
    id: 'alumni-girish-m',
    name: 'Girish M.',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    batch: '2021 Batch',
    currentRole: 'Senior Powertrain Simulation Engineer at Bosch, Karlsruhe',
    college: 'Karlsruhe Institute of Technology (KIT)',
    course: 'M.Sc. Mechanical Engineering',
    field: 'Engineering',
    origin: 'From Karnataka, India - 2021 Batch',
    originState: 'Karnataka',
    experienceTags: ['KIT Excellence', 'Bosch R&D Roles', 'German C1 Fluency Secret', 'Permanent Residence'],
    rating: { teaching: 4.9, hostel: 3.9, partTime: 4.7, overall: 4.7 },
    expectationVsReality: {
      expected: 'Believed English was sufficient for top-tier automotive engineering R&D jobs.',
      reality: 'English works for master thesis, but German C1 fluency resulted in 5x more interview calls and landed a €74k permanent Bosch role.',
      tip: 'Dedicate 45 minutes every morning to German newspaper podcast (DW Langsam gesprochene Nachrichten). It pays 10x ROI.'
    },
    isVerifiedAlumni: true,
    availableForChat: true,
    responseTime: 'Replies in 2 hours',
    languages: ['Kannada', 'English', 'German C1'],
    quote: 'English gets you through master classes, but German C1 fluency got me the €74k Bosch permanent engineering offer.'
  },
  {
    id: 'alumni-meera-j',
    name: 'Meera J.',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    batch: '2024 Batch',
    currentRole: 'Hotel Front Office Trainee at Steigenberger Icon Frankfurter Hof',
    college: 'Frankfurt School of Finance & Management',
    course: 'Duale Ausbildung Hotelfachfrau',
    field: 'Business',
    origin: 'From Kerala, India - 2024 Batch',
    originState: 'Kerala',
    experienceTags: ['Frankfurt Messe Tips', 'Shift Duty', 'Free Staff Meals', 'Professional Etiquette'],
    rating: { teaching: 4.2, hostel: 4.0, partTime: 4.3, overall: 4.2 },
    expectationVsReality: {
      expected: 'Expected low net savings and high food bills in Germany’s financial capital Frankfurt.',
      reality: 'Hotel provides free gourmet staff meals 7 days/week, uniform laundry, and €1,100 monthly stipend. During Messe fairs, tips are massive.',
      tip: 'During Frankfurt trade fair weeks, guests tip generously. Practice formal "Sie" business German and etiquette.'
    },
    isVerifiedAlumni: true,
    availableForChat: true,
    responseTime: 'Replies in 1 hour',
    languages: ['Malayalam', 'English', 'German B2'],
    quote: 'Frankfurt trade fair season is busy, but free staff meals, €1,100 stipend, and hospitality tips make it worthwhile!'
  }
];

export interface AlumniMatchQuery {
  targetCollege?: string;
  targetCourse?: string;
  targetField?: string;
  originState?: string;
  goal?: string;
}

export function matchAlumniAgent(query: AlumniMatchQuery): {
  matchedAlumni: AlumniProfile[];
  matchingReason: string;
  isExactCollegeMatch: boolean;
} {
  const { targetCollege, targetField, originState, goal } = query;
  const db = MOCK_ALUMNI_DATABASE;

  // 1. Check exact college match
  let candidates: AlumniProfile[] = [];
  let isExact = false;

  if (targetCollege && targetCollege !== 'Not decided yet') {
    const cleanCollege = targetCollege.toLowerCase();
    candidates = db.filter(a => 
      a.college.toLowerCase().includes(cleanCollege) || 
      cleanCollege.includes(a.college.toLowerCase().slice(0, 10))
    );
    if (candidates.length > 0) {
      isExact = true;
    }
  }

  // 2. If no exact college match, match by field and goal
  if (candidates.length < 3) {
    const fieldFiltered = db.filter(a => {
      if (targetField && a.field.toLowerCase() === targetField.toLowerCase()) return true;
      if (goal?.includes('Ausbildung') && a.course.toLowerCase().includes('ausbildung')) return true;
      if (goal?.includes('Study') && a.course.toLowerCase().includes('m.sc')) return true;
      return false;
    });

    candidates = Array.from(new Set([...candidates, ...fieldFiltered]));
  }

  // 3. Fallback to top rated alumni if still < 3
  if (candidates.length < 3) {
    candidates = Array.from(new Set([...candidates, ...db]));
  }

  // 4. Sort with priority on same origin state (regional connect: Kannada, Malayalam, Tamil, etc.)
  const scored = candidates.map(alumni => {
    let score = 0;
    let reasons: string[] = [];

    if (targetCollege && alumni.college.toLowerCase().includes(targetCollege.toLowerCase())) {
      score += 50;
      reasons.push(`Exact college match at ${alumni.college}`);
    }

    if (targetField && alumni.field.toLowerCase() === targetField.toLowerCase()) {
      score += 25;
      reasons.push(`Same field (${alumni.field})`);
    }

    if (originState && alumni.originState.toLowerCase() === originState.toLowerCase()) {
      score += 35;
      reasons.push(`Same home state (${alumni.originState}) - speaks ${alumni.languages[0]}`);
    }

    if (goal?.includes('Ausbildung') && alumni.course.toLowerCase().includes('ausbildung')) {
      score += 20;
      reasons.push(`Undergoing Ausbildung`);
    }

    return {
      alumni,
      score,
      reason: reasons.length > 0 ? reasons.join(' · ') : `Top rated senior in Germany (${alumni.currentRole})`
    };
  });

  scored.sort((a, b) => b.score - a.score);

  const top3 = scored.slice(0, 3).map(item => ({
    ...item.alumni,
    matchReason: item.reason
  }));

  const primary = top3[0];
  const matchingReason = primary
    ? `Matched ${primary.name} (${primary.origin}) because ${primary.matchReason}. Senior has verified experience in Germany and can explain ground realities directly.`
    : `Matched 3 verified seniors currently in Germany to avoid expectation mismatch.`;

  return {
    matchedAlumni: top3,
    matchingReason,
    isExactCollegeMatch: isExact
  };
}

export interface ExpectationAnswers {
  expectedExpenses: number; // e.g. 800
  expectedPartTime: 'easy' | 'moderate' | 'hard';
  expectedLanguage: 'english_only' | 'b1_enough' | 'b2_needed' | 'c1_needed';
}

export function evaluateExpectationGap(answers: ExpectationAnswers, targetCityOrCollege: string = 'Berlin') {
  let gapPoints = 0;
  const analysis: {
    expenses: { expected: string; reality: string; gapDetected: boolean };
    jobs: { expected: string; reality: string; gapDetected: boolean };
    language: { expected: string; reality: string; gapDetected: boolean };
  } = {
    expenses: {
      expected: `€${answers.expectedExpenses}/month`,
      reality: 'Actual €1,100 – €1,350/month in German metros. Senior Rahul says: "My expenses are €1,200/mo."',
      gapDetected: answers.expectedExpenses < 1000
    },
    jobs: {
      expected: answers.expectedPartTime === 'easy' ? 'Easy to get immediately' : answers.expectedPartTime === 'moderate' ? 'Moderate' : 'Difficult',
      reality: 'Need B1 minimum; first 3 months are hard. Senior Priya says: "Took me 2 months and 40 applications to get a student job."',
      gapDetected: answers.expectedPartTime === 'easy'
    },
    language: {
      expected: answers.expectedLanguage === 'english_only' ? 'English is enough' : answers.expectedLanguage === 'b1_enough' ? 'B1 is enough' : 'B2 or C1 needed',
      reality: 'B1 gets you through the visa, but B2 is required for lectures & patient shifts. Senior tip: "Finish B2 before boarding flight."',
      gapDetected: answers.expectedLanguage === 'english_only' || answers.expectedLanguage === 'b1_enough'
    }
  };

  if (analysis.expenses.gapDetected) gapPoints += 35;
  if (analysis.jobs.gapDetected) gapPoints += 30;
  if (analysis.language.gapDetected) gapPoints += 35;

  const gapScore = Math.min(100, gapPoints);
  const isHighGap = gapScore >= 40;

  const warningMessage = isHighGap
    ? `Your expectation has a ${gapScore}% gap from German ground reality. 68% of international applicants with this expectation report severe financial or language struggle in month 1-3. Talk to a verified senior before proceeding to prevent your process and fees from being wasted.`
    : `Your expectations are well-aligned with reality in Germany (${100 - gapScore}% realistic score). Connecting with seniors will give you practical lodging and exam tips.`;

  return {
    gapScore,
    isHighGap,
    warningMessage,
    analysis
  };
}
