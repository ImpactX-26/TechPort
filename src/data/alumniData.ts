import { AlumniProfile } from '../types.ts';

export const ALUMNI_DATA: AlumniProfile[] = [
  {
    id: 'aarav-sharma',
    name: 'Aarav Sharma',
    title: 'Senior Full Stack Software Engineer',
    collegeName: 'Visvesvaraya Technological University (VTU), Karnataka',
    branchName: 'Computer Science & Software Engineering',
    currentCompany: 'Delivery Hero SE',
    currentCity: 'Berlin',
    countryOfOrigin: 'India (Bengaluru)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
    badge: 'Featured Video • Chancenkarte to Blue Card',
    pathway: 'Chancenkarte (Opportunity Card) to §18b Blue Card',
    yearsInGermany: 2.5,
    germanLevel: 'B1 (Goethe-Zertifikat)',
    englishLevel: 'C1 (Fluent)',
    shortBio: 'Moved to Berlin with 3 years of Indian tech experience. Landed multiple software offers within 7 weeks using a localized German Lebenslauf and targeted portfolio.',
    quote: 'The biggest shock wasn\'t the cold weather, but learning that Warmmiete includes heating while Strom (electricity) is always separate!',
    video: {
      videoUrl: 'https://youtu.be/lel85Ym6xJY?si=k3-BxsUufFNGS1Cd',
      youtubeId: 'lel85Ym6xJY',
      previewThumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
      duration: '14:20',
      title: 'Real Experience Moving to Germany: Living, Costs, Degree & Salary',
      summary: 'Watch this comprehensive guide breaking down real living expenses in Berlin (€1,780/mo), the WG-Gesucht apartment hunt, ZAB degree comparability from Indian universities, and negotiating gross vs net tech salaries.',
      chapters: [
        { title: 'Arriving in Germany & First Impressions', time: '0:00', topic: 'living', summary: 'Arrival, temporary lodging, and initial shock of winter and German language.' },
        { title: 'The Dreaded WG Hunt & Anmeldung', time: '2:15', topic: 'living', summary: 'How to land a flatshare on WG-Gesucht and get your official city registration.' },
        { title: 'Monthly Living Expenses (€1,780 Breakdown)', time: '5:40', topic: 'expense', summary: 'Rent, groceries at Aldi/Lidl, public transport, health insurance, and phone plans.' },
        { title: 'Degree Recognition from Indian Colleges (ZAB & Anabin)', time: '8:30', topic: 'education', summary: 'How VTU B.Tech is recognized on ANABIN with H+ status and ZAB evaluation.' },
        { title: 'Software Developer Salary & Netto Realities', time: '11:10', topic: 'salary', summary: 'Gross €78,000 translates to €3,880 net under Steuerklasse 1 after taxes and TK health fund.' },
      ],
    },
    experience: {
      living: {
        city: 'Berlin',
        neighborhood: 'Friedrichshain / Boxhagener Kiez',
        apartmentType: '2-Room WG Flatshare (Shared with another expat)',
        findingTimeWeeks: 4,
        anmeldungTips: 'Book appointments at ALL Berlin Bürgerämter across the city, not just your district. Slots open every weekday morning at 8:00 AM on service.berlin.de.',
        summary: 'Berlin is exceptionally vibrant, multi-cultural, and English-friendly in tech. However, finding long-term housing is competitive. Make sure you get a Wohnungsgeberbestätigung (landlord confirmation) for your Anmeldung immediately.',
        lifestylePros: [
          'Vibrant international startup ecosystem',
          'World-class public transit (S-Bahn, U-Bahn, Trams)',
          'High English proficiency in central tech hubs',
          'Huge variety of international cuisine and green parks'
        ],
        lifestyleChallenges: [
          'Competitive rental market; beware of sublet scammers without Anmeldung',
          'Grey winter months from November to February',
          'Bureaucratic delays at Berlin LEA (Landesamt für Einwanderung)'
        ]
      },
      expenses: {
        monthlyTotal: 1780,
        rentWarm: 820,
        groceries: 320,
        healthInsurance: 0, // Deducted automatically from gross payroll by Techniker Krankenkasse (TK)
        transport: 49, // Deutschlandticket
        utilitiesAndInternet: 65, // Electricity & Vodafone fiber
        leisureAndDining: 320,
        savingsPerMonth: 2100,
        budgetingTip: 'Shopping at Lidl and Aldi will cut your grocery bill in half compared to Rewe or Bio-Company. Cooking at home 5 days a week saves ~€400/month.'
      },
      education: {
        degree: 'Bachelor of Technology in Computer Science',
        university: 'Visvesvaraya Technological University (VTU), India',
        recognitionBody: 'ZAB Statement of Comparability / ANABIN H+ Certified',
        durationYears: 4,
        languageMedium: 'English',
        tuitionPerSemester: 0,
        keyAdvice: 'Check your university and degree match on anabin.kmk.org. If your university is H+ and your degree is listed, you have automatic equivalence for the EU Blue Card!'
      },
      salary: {
        grossAnnual: 78000,
        netMonthly: 3880,
        taxClass: 'Steuerklasse 1 (Single, no children)',
        tariffGroup: 'Non-tariff Startup package + 15% ESOP equity allocation',
        bonusPercent: 10,
        benefits: ['Deutschlandticket subsidy', 'Urban Sports Club gym', '€1,500 annual learning budget', '30 paid vacation days'],
        negotiationTip: 'Always negotiate in GROSS ANNUAL (Brutto im Jahr). Never give a net figure, because German HR calculates strictly from gross with automatic social security splits.'
      },
      visa: {
        initialVisa: 'Chancenkarte (1 Year Opportunity Card)',
        currentPermit: 'EU Blue Card (§18b Abs. 2 AufenthG)',
        timeToPermanentResidencyYears: 1.75, // 21 months with B1 German!
        requiredGermanLevel: 'B1 for Niederlassungserlaubnis in 21 months (otherwise 27 months with A1)'
      }
    },
    sampleQuestions: [
      { category: 'living', question: 'How did you find your first apartment with Anmeldung in Berlin?' },
      { category: 'expense', question: 'Can you break down your exact monthly expenses in Berlin?' },
      { category: 'salary', question: 'What is the gross vs net salary for a 3-year experienced software engineer?' },
      { category: 'education', question: 'Did you need German language to land your first tech job?' },
      { category: 'visa', question: 'How was the transition from Chancenkarte to EU Blue Card?' }
    ]
  },
  {
    id: 'priya-nair',
    name: 'Dr. Priya Nair',
    title: 'Automotive Simulation & FEM Specialist',
    collegeName: 'Technical University of Munich (TUM) / IIT Madras',
    branchName: 'Mechanical & Automotive Engineering',
    currentCompany: 'BMW Group',
    currentCity: 'Munich',
    countryOfOrigin: 'India (Chennai)',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80',
    badge: 'TUM Masters • IG Metall Tariff',
    pathway: 'TU Munich M.Sc. -> Graduate Job Seeking Visa -> EU Blue Card',
    yearsInGermany: 4.0,
    germanLevel: 'B2 / C1 (Professional German)',
    englishLevel: 'C2 (Bilingual)',
    shortBio: 'Completed her M.Sc. in Computational Mechanics at TU Munich with zero tuition fees. Transitioned from working student (Werkstudent) at BMW into a full-time core engineering role.',
    quote: 'Munich is expensive, but the quality of life, proximity to the Alps, and IG Metall salary tariffs are completely unmatched in Europe.',
    video: {
      videoUrl: 'https://www.youtube.com/watch?v=0h9bQW-iY_s',
      youtubeId: '0h9bQW-iY_s',
      previewThumbnail: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      duration: '11:45',
      title: 'Priya\'s Path: TUM Masters to Core Engineering at BMW Munich',
      summary: 'Priya discusses student living costs, working student contracts (Werkstudent), Munich rent realities, and the high-paying IG Metall tariff system.',
      chapters: [
        { title: 'TUM Admission & Sperrkonto (Blocked Account)', time: '0:00', topic: 'education', summary: 'Application process via uni-assist and opening a blocked account.' },
        { title: 'Munich Cost of Living vs Student Budget', time: '2:10', topic: 'expense', summary: 'Student living costs compared to full-time engineering income.' },
        { title: 'Finding Housing via Studentenwerk & ImmoScout', time: '4:50', topic: 'living', summary: 'Navigating Munich rental market and landlord requirements.' },
        { title: 'Werkstudent to Full-Time IG Metall Conversion', time: '7:30', topic: 'salary', summary: 'Working 20 hours/week as student and transitioning to ERA Band 10.' },
        { title: 'German Language for Non-Tech Collaboration', time: '9:40', topic: 'visa', summary: 'Why B2 German was key for working with shop floor engineers.' },
      ],
    },
    experience: {
      living: {
        city: 'Munich',
        neighborhood: 'Maxvorstadt / Schwabing-West',
        apartmentType: '1-Room Studio Apartment (Einzelapartment)',
        findingTimeWeeks: 6,
        anmeldungTips: 'Book your Kreisverwaltungsreferat (KVR) appointment at Ruppertstraße. Munich is strict about landlord confirmation (Wohnungsgeberbestätigung).',
        summary: 'Munich is exceptionally safe, immaculate, and has unmatched nature with the English Garden, Isar river, and Bavarian Alps. Rent is high, but salaries in automotive and engineering compensate.',
        lifestylePros: [
          'High safety index and pristine public infrastructure',
          'Proximity to Austrian Alps, Italy, and Swiss border',
          'World-leading engineering and automotive clusters',
          'Strong labor protections under Bavarian tariffs'
        ],
        lifestyleChallenges: [
          'Highest rental prices in Germany (€22-€26 per square meter)',
          'Landlords require 3 recent payslips (Gehaltsnachweise) and SCHUFA credit report',
          'Traditional Bavarian bureaucracy requires basic German'
        ]
      },
      expenses: {
        monthlyTotal: 2150,
        rentWarm: 1150,
        groceries: 380,
        healthInsurance: 0, // Employer pays 50%, rest deducted automatically
        transport: 49, // Deutschlandticket
        utilitiesAndInternet: 85, // M-Net Fiber + GEZ broadcast fee (€18.36)
        leisureAndDining: 380,
        savingsPerMonth: 2350,
        budgetingTip: 'During your studies, apply for Studentenwerk student dorms immediately. They cost €350-€450 warm, saving you over €700 monthly compared to the private market.'
      },
      education: {
        degree: 'Master of Science (Computational Mechanics & Simulation)',
        university: 'Technical University of Munich (TUM)',
        recognitionBody: 'German State University Degree (Excellence University)',
        durationYears: 2,
        languageMedium: 'English',
        tuitionPerSemester: 152, // Semester administrative fee only
        keyAdvice: 'German public universities have zero tuition fees! You only pay the semester contribution. Work as a Werkstudent (up to 20 hrs/week) to fund 100% of your living expenses tax-free.'
      },
      salary: {
        grossAnnual: 86500,
        netMonthly: 4220,
        taxClass: 'Steuerklasse 1',
        tariffGroup: 'IG Metall Bayern ERA Entgeltgruppe 10',
        bonusPercent: 12,
        benefits: ['35-hour standard work week', 'Christmas bonus (Weihnachtsgeld)', 'Vacation pay (Urlaubsgeld)', 'BMW company car lease discount'],
        negotiationTip: 'In IG Metall companies, your salary is locked into ERA tariff bands based on role responsibility, not your negotiation charm. Negotiate your job description level!'
      },
      visa: {
        initialVisa: 'Student Visa (§16b AufenthG)',
        currentPermit: 'Permanent Residence (Niederlassungserlaubnis für Absolventen deutscher Hochschulen)',
        timeToPermanentResidencyYears: 2.0, // Only 2 years for graduates of German universities!
        requiredGermanLevel: 'B1 reached during M.Sc. studies'
      }
    },
    sampleQuestions: [
      { category: 'education', question: 'How hard was it to get into TUM without tuition fees?' },
      { category: 'expense', question: 'Is Munich really too expensive for fresh graduates?' },
      { category: 'salary', question: 'How does the 35-hour work week and IG Metall tariff work?' },
      { category: 'living', question: 'What is the best strategy to find accommodation in Munich?' },
      { category: 'visa', question: 'Can graduates of German universities get Permanent Residency in 2 years?' }
    ]
  },
  {
    id: 'mateo-fernandez',
    name: 'Mateo Fernandez',
    title: 'Principal Data Architect & Cloud Lead',
    collegeName: 'Frankfurt School of Finance & Management / Univ. of Buenos Aires',
    branchName: 'Information Systems & Financial Data Science',
    currentCompany: 'Siemens Energy / Deutsche Bank FinTech',
    currentCity: 'Frankfurt am Main',
    countryOfOrigin: 'Argentina (Buenos Aires)',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80',
    badge: 'Direct Relocation • Family Visa',
    pathway: 'Direct Hire Skilled Worker Visa (§18a/b) via LinkedIn',
    yearsInGermany: 3.2,
    germanLevel: 'A2 (Elementary)',
    englishLevel: 'C2 (Fluent)',
    shortBio: 'Received a direct job offer from abroad with complete visa relocation package. Settled in Frankfurt with his spouse, who received an immediate unrestricted work permit under German family reunification rules.',
    quote: 'Frankfurt has Germany’s highest expat ratio and highest average finance/IT salaries. It feels like Manhattan combined with cozy traditional Hessian cider pubs.',
    video: {
      videoUrl: 'https://www.youtube.com/watch?v=hB7CD_u1mvg',
      youtubeId: 'hB7CD_u1mvg',
      previewThumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      duration: '09:50',
      title: 'Mateo\'s Direct Visa: Relocating to Frankfurt Financial Hub',
      summary: 'Mateo explains direct overseas hiring, employer visa sponsorship, bringing his spouse, banking salaries, and tax optimization under Steuerklasse 3 & 5.',
      chapters: [
        { title: 'Getting Hired Directly From Abroad', time: '0:00', topic: 'visa', summary: 'LinkedIn search filters and direct German employer sponsorship.' },
        { title: 'Employer Relocation Package & Kaution', time: '1:45', topic: 'living', summary: 'Negotiating flight, temporary apartment, and deposit coverage.' },
        { title: 'Tax Classes (Steuerklasse 3 & 5 for Couples)', time: '3:30', topic: 'salary', summary: 'Optimizing taxes when one partner earns more in Germany.' },
        { title: 'Frankfurt Living Cost & Banking Atmosphere', time: '5:50', topic: 'expense', summary: 'Apartment rent in Bornheim vs Westend and general lifestyle.' },
        { title: 'Degree Equivalency without German Language', time: '7:40', topic: 'education', summary: 'Validating Latin American degree on ANABIN database.' },
      ],
    },
    experience: {
      living: {
        city: 'Frankfurt am Main',
        neighborhood: 'Bornheim / Nordend-Ost',
        apartmentType: '3-Room Apartment with Balcony (Family Home)',
        findingTimeWeeks: 3,
        anmeldungTips: 'Used relocation agency provided by employer for priority appointment at Bürgeramt Frankfurt Zeil. Very quick process.',
        summary: 'Frankfurt is the financial engine of Europe. The airport connects you to the entire world in hours. The city is walkable, compact, and English is standard in corporate settings.',
        lifestylePros: [
          'High concentration of multinational headquarters and banks',
          'Direct flights to 300+ destinations worldwide via FRA airport',
          'Spouse gets immediate unrestricted work rights under family visa',
          'Vibrant culinary and café culture on Berger Straße'
        ],
        lifestyleChallenges: [
          'Bahnhofsviertel (central station area) is gritty at night',
          'Summer can get humid in the Rhine-Main valley',
          'Commercial lease prices near bank towers are steep'
        ]
      },
      expenses: {
        monthlyTotal: 2380,
        rentWarm: 1350,
        groceries: 450,
        healthInsurance: 0, // High earners can choose TK Public or Private (PKV)
        transport: 49, // Subsidized by employer Jobticket
        utilitiesAndInternet: 95,
        leisureAndDining: 420,
        savingsPerMonth: 2900,
        budgetingTip: 'If your spouse is also working or not working, changing from Steuerklasse 4/4 to 3/5 can increase your monthly net take-home by €400 to €700!'
      },
      education: {
        degree: 'Licenciatura en Ciencias de la Computación (5 Years)',
        university: 'Universidad de Buenos Aires (UBA) / Frankfurt School',
        recognitionBody: 'ANABIN Database H+ Listed (Directly Equivalent to German Diplom/Master)',
        durationYears: 5,
        languageMedium: 'Spanish & English',
        tuitionPerSemester: 0,
        keyAdvice: 'Always print the PDF screenshot of both your university and degree from the ANABIN database. Attach this directly to your visa appointment at the embassy.'
      },
      salary: {
        grossAnnual: 95000,
        netMonthly: 4950,
        taxClass: 'Steuerklasse 3 (Married sole-earner advantage)',
        tariffGroup: 'Executive Cloud Consultant Scale',
        bonusPercent: 15,
        benefits: ['Full relocation budget (€6,000 relocation lump sum)', 'Gym subsidy', 'Remote work in EU for 30 days/yr', 'Company pension plan (bAV) with 20% match'],
        negotiationTip: 'In Frankfurt banking/cloud roles, push for relocation reimbursement (Umzugskostenpauschale), sign-on bonus, and company pension top-up.'
      },
      visa: {
        initialVisa: 'Skilled Worker Visa (§18b Abs. 1 AufenthG)',
        currentPermit: 'EU Blue Card',
        timeToPermanentResidencyYears: 2.25,
        requiredGermanLevel: 'A1 attained; studying for B1 to fast-track Niederlassungserlaubnis'
      }
    },
    sampleQuestions: [
      { category: 'salary', question: 'How much higher is net income with Steuerklasse 3 for married couples?' },
      { category: 'visa', question: 'How did you get a direct job offer from outside the European Union?' },
      { category: 'living', question: 'Is Frankfurt good for families and international expats?' },
      { category: 'expense', question: 'What is the real breakdown of family expenses in Frankfurt?' },
      { category: 'education', question: 'How did you verify your university degree on ANABIN?' }
    ]
  },
  {
    id: 'fatima-al-mansoor',
    name: 'Fatima Al-Mansoor',
    title: 'Intensive Care Nurse Specialist & Mentor',
    collegeName: 'Cairo University Faculty of Nursing / RWTH Aachen Medical Partner',
    branchName: 'Biomedical Science & Clinical Healthcare',
    currentCompany: 'Charité – Universitätsmedizin Berlin',
    currentCity: 'Berlin',
    countryOfOrigin: 'Egypt (Cairo)',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813583-82ff35b54203?auto=format&fit=crop&w=500&q=80',
    badge: 'State License • Hospital Housing',
    pathway: 'Fast-Track Healthcare Recognition (Anerkennungslehrgang & B2 Pflege)',
    yearsInGermany: 2.0,
    germanLevel: 'B2 Pflege (Medical Certified)',
    englishLevel: 'B2 (Intermediate)',
    shortBio: 'Completed the German nursing credential adaptation program with Charité hospital. Received subsidized hospital accommodation, eliminating housing search stress completely.',
    quote: 'Germany has a huge shortage of healthcare professionals. With B2 German and credential recognition, your job security here is 100% guaranteed for life.',
    video: {
      videoUrl: 'https://www.youtube.com/watch?v=kYI4xQk48oQ',
      youtubeId: 'kYI4xQk48oQ',
      previewThumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
      duration: '08:15',
      title: 'Fatima\'s Story: Healthcare Recognition at Charité Berlin',
      summary: 'Fatima shares the step-by-step process of nursing license recognition (Anerkennung), hospital housing, shift allowances (Schichtzulagen), and B2 medical German.',
      chapters: [
        { title: 'Nursing Degree Recognition & Defizitbescheid', time: '0:00', topic: 'education', summary: 'State evaluation of clinical hours and theory curriculum.' },
        { title: 'Subsidized Hospital Housing (Personalwohnheim)', time: '1:30', topic: 'living', summary: 'How hospital housing solves the Berlin flat crisis.' },
        { title: 'Monthly Budget & Sending Money Home', time: '3:10', topic: 'expense', summary: 'Managing living expenses at €1,390/mo and saving €1,600+.' },
        { title: 'Nurse Salaries: TVöD Tariff & Night Shift Premiums', time: '5:00', topic: 'salary', summary: 'Tax-free shift premiums adding €400+ to net take-home.' },
        { title: 'Fast Path to German Citizenship (§10 StAG)', time: '6:45', topic: 'visa', summary: 'Permanent status and new German citizenship laws.' },
      ],
    },
    experience: {
      living: {
        city: 'Berlin',
        neighborhood: 'Wedding / Mitte',
        apartmentType: 'Subsidized Hospital Apartment (Personalwohnheim)',
        findingTimeWeeks: 1, // Hospital provided
        anmeldungTips: 'Charité HR provided a pre-approved Wohnungsgeberbestätigung on my first day, so my registration at the Bürgeramt took 10 minutes!',
        summary: 'Living in hospital-backed housing was the biggest blessing. It gave me peace of mind to focus on my adaptation training and clinical examinations without worrying about German landlords.',
        lifestylePros: [
          'Hospital staff housing costs 50% less than market rate',
          'Extremely diverse, welcoming healthcare colleagues',
          'Free German language courses offered at hospital premises',
          'Unrivaled job stability under public collective agreements'
        ],
        lifestyleChallenges: [
          'Rotational 3-shift schedules (Früh-, Spät-, Nachtdienst)',
          'Requires strong clinical German (B2 Telc Deutsch Pflege)',
          'Emotional adjustment during the initial 6 months'
        ]
      },
      expenses: {
        monthlyTotal: 1390,
        rentWarm: 520, // Subsidized staff flat
        groceries: 260,
        healthInsurance: 0, // Deducted via AOK Nordost from gross
        transport: 34, // Subsidized Berlin firmenticket
        utilitiesAndInternet: 50,
        leisureAndDining: 210,
        savingsPerMonth: 1650,
        budgetingTip: 'Hospital cafeterias provide full hot lunches for staff at €3.50. Taking advantage of this saved me €150 every month on meals.'
      },
      education: {
        degree: 'Bachelor of Science in Nursing',
        university: 'Cairo University Faculty of Nursing / RWTH Aachen',
        recognitionBody: 'Landesamt für Gesundheit und Soziales (LAGeSo Berlin)',
        durationYears: 4,
        languageMedium: 'Arabic & English',
        tuitionPerSemester: 0,
        keyAdvice: 'Do not wait to learn German! Pass B1 in your home country. Hospitals like Charité or Vivantes will then pay for your B2 Pflege course and flight to Germany.'
      },
      salary: {
        grossAnnual: 48500,
        netMonthly: 2980,
        taxClass: 'Steuerklasse 1',
        tariffGroup: 'TVöD-P (Entgeltgruppe P 8 Stufe 2) + Schichtzulagen',
        bonusPercent: 8,
        benefits: ['Tax-free night & Sunday shift bonuses (€350-€500 extra net/month)', 'Hospital accommodation', 'VBL supplementary state pension', '30 vacation days + 4 shift recovery days'],
        negotiationTip: 'In public hospitals, salary is bound by TVöD. Make sure your previous years of clinical experience abroad are recognized on your contract to jump to Stufe 2 or 3 directly!'
      },
      visa: {
        initialVisa: 'Visa for Recognition of Professional Qualifications (§16d AufenthG)',
        currentPermit: 'Residence Permit for Skilled Workers (§18a AufenthG)',
        timeToPermanentResidencyYears: 3.0,
        requiredGermanLevel: 'B2 Telc Deutsch Pflege'
      }
    },
    sampleQuestions: [
      { category: 'education', question: 'How did you get your non-EU degree recognized in Germany?' },
      { category: 'living', question: 'How did you get subsidized hospital housing?' },
      { category: 'salary', question: 'How much do nurses really earn in Germany with shift allowances?' },
      { category: 'expense', question: 'How much can you save each month on a healthcare salary?' },
      { category: 'visa', question: 'What is the visa pathway under §16d for professional credentials?' }
    ]
  }
];
