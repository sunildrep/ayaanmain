export type CourseDetail = {
  slug: string;
  title: string;
  tag: string;
  desc: string;
  duration: string;
  mode: string[];
  medium: string[];
  fee: string;
  image: string; // dummy seeded — replace via Admin → Courses
  prerequisites: string[];
  notificationDate: string; // e.g. "Expected Jan 2027"
  syllabus: { subject: string; topics: string[] }[];
  highlights: string[];
  eligibility: string;
  ageLimit: string;
};

export const courseDetails: CourseDetail[] = [
  {
    slug: "si",
    title: "Sub-Inspector (SI)",
    tag: "Most Applied",
    desc: "Telangana SI — Written + Physical (1600m, Long Jump, High Jump). Complete syllabus + daily grand tests.",
    duration: "3-4 Months + Continuous Revision",
    mode: ["Residential", "Offline", "Online"],
    medium: ["Telugu", "English"],
    fee: "₹35,000 (Residential incl. hostel/food) • ₹25,000 Offline",
    image: "https://images.unsplash.com/photo-1542395975-d6d3f2761a28?q=80&w=800&auto=format&fit=crop",
    eligibility: "Graduation (any degree) from recognized university",
    ageLimit: "21 – 25 years (relaxation SC/ST/BC as per notification)",
    prerequisites: [
      "Graduation (10+2+3) — any stream, 50%+ preferred",
      "Physical fitness — 1600m baseline 7:30 min (boys), 800m for girls",
      "Telugu reading & Arithmetic basics",
      "Medical: Eye 6/6, no flat foot, height 167.6cm (men) / 152.5cm (women) — relaxations per category",
    ],
    notificationDate: "Expected: TSLPRB SI Notification — Jan 2027 (last: Aug 2022)",
    syllabus: [
      { subject: "Arithmetic & Reasoning", topics: ["Number System", "Profit/Loss", "Time & Work", "Blood Relations", "Coding-Decoding", "Analogy", "Syllogism"] },
      { subject: "General Studies", topics: ["Indian History & Culture", "Telangana History & Movement", "Geography (India & Telangana)", "Indian Constitution", "Economy (Budget, RBI)", "Science & Tech", "Current Affairs (daily)"] },
      { subject: "English / Telugu", topics: ["Comprehension", "Grammar (Tenses, Voice)", "Vocabulary", "Precis & Essay"] },
      { subject: "Physical Events", topics: ["1600m Run (7:15 qual.)", "Long Jump (3.80m+)", "High Jump (1.20m+)", "Shot Put"] },
    ],
    highlights: ["Daily 4am study + Evening test + Explanation", "Weekly Grand + Monthly Physical Assessment", "Director-led ground training"],
  },
  {
    slug: "constable",
    title: "Constable (PC)",
    tag: "Bilingual • Highest Selections",
    desc: "TSLPRB Constable — 95% selections track. Telugu/English separate batches, daily doubts.",
    duration: "3 Months + Practice Till Exam",
    mode: ["Residential", "Offline", "Online"],
    medium: ["Telugu", "English"],
    fee: "₹28,000 (Residential) • ₹18,000 Offline",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
    eligibility: "Intermediate (10+2) pass — any group",
    ageLimit: "18 – 22 years (18-33 with reservations)",
    prerequisites: [
      "10+2 (Intermediate) with 45%+",
      "1600m/800m running ability, Long Jump practice",
      "Height 167.6cm / 152.5cm as per category",
      "No major medical disqualifications",
    ],
    notificationDate: "Expected: TSLPRB Constable — Mar 2027 (last: Apr 2022)",
    syllabus: [
      { subject: "Arithmetic", topics: ["Percentages", "Ratio & Proportion", "Mensuration", "Algebra"] },
      { subject: "Reasoning", topics: ["Direction Sense", "Non-Verbal", "Logical Venn", "Seating Arrangement"] },
      { subject: "General Studies", topics: ["Telangana History", "Indian History (Modern)", "Geography", "Polity", "Economy", "Science", "Current Affairs"] },
      { subject: "Physical", topics: ["1600m (7:15)", "Long Jump", "High Jump (1.20m)"] },
    ],
    highlights: ["Track + Strength + Events daily", "Daily explanations, categorized by score", "Hostel dietary: eggs, milk, ragi malt"],
  },
  {
    slug: "groups",
    title: "Group 1 • 2 • 3 • 4",
    tag: "State Services",
    desc: "TSPSC Groups — Prelims + Mains. Updated content, current affairs focus, answer writing.",
    duration: "4-6 Months (Mains incl.)",
    mode: ["Offline", "Online"],
    medium: ["Telugu", "English"],
    fee: "₹32,000 (Groups 1/2) • ₹22,000 (Groups 3/4)",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop",
    eligibility: "Graduation for Gr 1/2; Intermediate for Gr 4",
    ageLimit: "18 – 44 years (TSPSC general)",
    prerequisites: [
      "Graduation for Gr 1/2, 10+2 for Gr 4",
      "Telugu writing practice, Essay & Precis",
      "Current affairs daily reading habit",
      "Answer writing — 150 words in 8 min",
    ],
    notificationDate: "Expected: TSPSC Groups — Jun 2027 (Notification cycle annual)",
    syllabus: [
      { subject: "Prelims — Paper 1", topics: ["General Science", "Current Affairs (National & Telangana)", "World & Indian Geography", "History & Culture", "Polity & Governance", "Economy", "Mental Ability (Reasoning, Data Interpretation)"] },
      { subject: "Mains — Papers", topics: ["Paper I: General Essay", "Paper II: History, Culture, Geography", "Paper III: Indian Society, Constitution, Governance", "Paper IV: Economy & Development", "Paper V: Science, Tech & Data Interpretation", "Paper VI: Telangana Movement & State Formation"] },
      { subject: "Interview", topics: ["Personality Test", "Telangana Issues", "Bio-data based questions"] },
    ],
    highlights: ["Grand tests & Paper discussions", "Daily Current Affairs + Monthly Magazine", "Interview guidance by ex-officers"],
  },
  {
    slug: "ssc-gd",
    title: "SSC GD",
    tag: "Central Armed Forces",
    desc: "SSC GD Constable — CAPFs + Assam Rifles. Written + PST/PET + Medical.",
    duration: "3 Months",
    mode: ["Offline", "Online"],
    medium: ["English", "Telugu"],
    fee: "₹18,000 Offline • ₹12,000 Online",
    image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?q=80&w=800&auto=format&fit=crop",
    eligibility: "10th Pass (SSC)",
    ageLimit: "18 – 23 years",
    prerequisites: [
      "SSC (10th) pass",
      "5km run in 24 min (preparation target)",
      "Basic Hindi/English + Arithmetic",
      "Height 170cm / 157cm, Chest 80/85cm (men)",
    ],
    notificationDate: "Expected: SSC GD — Sep 2026 (Released annually Nov)",
    syllabus: [
      { subject: "General Intelligence & Reasoning", topics: ["Analogies", "Series", "Coding-Decoding", "Syllogism"] },
      { subject: "General Knowledge", topics: ["History", "Geography", "Polity", "Economy", "Science", "Current Affairs"] },
      { subject: "Elementary Mathematics", topics: ["Number System", "Mensuration", "Geometry", "Trigonometry"] },
      { subject: "English/Hindi", topics: ["Grammar", "Comprehension", "Vocabulary", "Error Spotting"] },
      { subject: "Physical", topics: ["1600m/800m", "Long Jump", "High Jump", "PET/PST Standards"] },
    ],
    highlights: ["Hindi/English support", "Full mocks + Physical at L1-L3", "Medical tips + Document verification guidance"],
  },
  {
    slug: "army",
    title: "Army / Navy / Airforce",
    tag: "Defence Entry",
    desc: "Agniveer, GD, Tradesman, Navy MR/SSR, Airforce X/Y. Written, medical, physical guidance.",
    duration: "3 Months + Physical Till Selection",
    mode: ["Residential", "Offline"],
    medium: ["Telugu", "English"],
    fee: "₹25,000 Residential • ₹18,000 Offline",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop",
    eligibility: "10th/10+2 as per post (Army GD: 10th 45%, Navy SSR: 10+2 PCM 50%)",
    ageLimit: "17.5 – 21 years (Army GD), 17-20 (Navy/Airforce)",
    prerequisites: [
      "10th/Intermediate with required %",
      "1600m in 6:30 target, Beam (6-10), 9ft Ditch, Zig-Zag",
      "Medical: No knock knee, flat foot, eye 6/6",
      "Height 166cm+ (Army), 157cm+ (Navy)",
    ],
    notificationDate: "Agniveer: Apr & Oct every year • Navy: May/Nov • Airforce: Jan/Jul",
    syllabus: [
      { subject: "General Knowledge", topics: ["History", "Geography", "Polity", "Current Affairs (Defence)"] },
      { subject: "General Science", topics: ["Physics (Mechanics, Optics)", "Chemistry", "Biology"] },
      { subject: "Maths (Agniveer GD)", topics: ["Algebra", "Geometry", "Mensuration", "Trigonometry"] },
      { subject: "Physical + Medical", topics: ["1600m (7:15→6:00)", "Pull-ups, Dips, Rope", "Medical screening tips", "Document prep"] },
    ],
    highlights: ["Ground practice 3 levels daily", "3000+ Defence placements", "Daily running + Strength + Events"],
  },
  {
    slug: "upsc",
    title: "UPSC Civil Services",
    tag: "Premium • Prelims+Mains+Interview",
    desc: "CSE Prelims + Mains + Personality Test. GS 1-4, Essay, CSAT, Optional. Daily answer writing.",
    duration: "12 Months (Foundation) + Test Series",
    mode: ["Offline", "Online"],
    medium: ["English", "Telugu"],
    fee: "₹65,000 Foundation • ₹25,000 Test Series",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop",
    eligibility: "Graduation in any discipline",
    ageLimit: "21 – 32 years (Gen), +5 SC/ST, +3 OBC",
    prerequisites: [
      "Graduation + Strong reading habit (2 Newspapers daily)",
      "NCERT 6-12 basics — History, Geography, Polity",
      "Essay & Ethics writing practice",
      "CSAT: Comprehension + Time management",
    ],
    notificationDate: "UPSC CSE 2027 — Feb 2027 Notification, Prelims May 2027",
    syllabus: [
      { subject: "Prelims — GS Paper 1", topics: ["History (Ancient/Medieval/Modern)", "Geography (World/India)", "Polity & Governance", "Economy", "Environment & Ecology", "Science & Tech", "Current Affairs (18 months)"] },
      { subject: "Prelims — CSAT Paper 2", topics: ["Comprehension", "Logical Reasoning", "Analytical Ability", "Decision Making", "Basic Numeracy", "Data Interpretation"] },
      { subject: "Mains — GS 1-4 + Essay", topics: ["GS1: History, Society, Geography", "GS2: Polity, Governance, IR", "GS3: Economy, Security, Disaster, Environment", "GS4: Ethics, Integrity, Aptitude", "Essay: 2 Topics (1000-1200 words)"] },
      { subject: "Optional (1 Subject)", topics: ["History / Geography / PSIR / Sociology / Anthropology / Telugu Literature etc. — 2 Papers × 250 marks"] },
      { subject: "Interview (275 marks)", topics: ["DAF-based questions", "Current Affairs depth", "Mock interviews with ex-bureaucrats"] },
    ],
    highlights: ["NCERT foundation + Standard books (Laxmikanth, Spectrum)", "Daily Current Affairs + Weekly Test + Monthly Revision", "Answer writing + Essay correction within 48h"],
  },
  {
    slug: "online",
    title: "Online Coaching",
    tag: "Live + Recorded",
    desc: "Same offline faculty, unlimited rewatch, offline download. Since 2018 on ClassPlus.",
    duration: "Same as Offline (3-4 Months)",
    mode: ["Online"],
    medium: ["Telugu", "English"],
    fee: "60% of Offline — e.g., SI Online ₹18,000",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
    eligibility: "Same as chosen course (10th/Intermediate/Graduation)",
    ageLimit: "Same as course",
    prerequisites: [
      "Smartphone + 2GB data/day + Earphones",
      "ClassPlus App: co.classplus.ayaan",
      "Pro Fitness App for physical: com.user.ayaanprofitness",
      "Discipline: Attend live 6am/7pm, rewatch same day",
    ],
    notificationDate: "Batches start 1st & 15th every month — immediate enrollment",
    syllabus: [
      { subject: "Live Classes", topics: ["Same offline faculty live", "Unlimited forward/reverse rewatch", "Offline download (7 days)", "PDF notes & DPPs"] },
      { subject: "Tests", topics: ["Daily Quiz (₹20-30 via Razorpay)", "Weekly Grand, Monthly Mock", "Instant explanation + Rank"] },
      { subject: "Doubts & Support", topics: ["In-app doubts chat", "Weekly Zoom doubt session with faculty", "Telegram current affairs"] },
    ],
    highlights: ["Since 2018 — 50K+ app downloads", "Forward/reverse unlimited", "Offline + Online switch allowed (pay difference)"],
  },
];
