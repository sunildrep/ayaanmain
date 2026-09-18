export type Lang = "en" | "hi" | "te";

export type KBChunk = {
  id: string;
  category: string; // for citation
  keywords: string[]; // retrieval keywords (lowercase)
  en: string;
  hi: string;
  te: string;
  source: string;
};

export const knowledgeBase: KBChunk[] = [
  {
    id: "about",
    category: "About",
    keywords: ["ayaan", "foundation", "established", "2016", "telangana", "group of competitive institutions", "about", "institute", "institute kya hai", "సంస్థ", "स्थापना"],
    en: "Ayaan Foundation is a registered society est. 2016 in Telangana. It runs Ayaan Group of Competitive Institutions, head office at Dilsukhnagar Hyderabad, with branches at Warangal (Mayuri Mall Hanamkonda) and residential campus at Bollikunta, Warangal. Directed by Mohd. Anwar Sir (Ex-SI State Topper 2009).",
    hi: "आयान फाउंडेशन 2016 में तेलंगाना में पंजीकृत सोसायटी है। आयान ग्रुप ऑफ कॉम्पिटिटिव इंस्टीट्यूशंस का हेड ऑफिस दिलसुखनगर, हैदराबाद में है, शाखाएँ वारंगल (मयूरी मॉल, हनमकोंडा) और रेजिडेंशियल कैंपस बोल्लिकुंटा, वारंगल में हैं। निदेशक मोहम्मद अनवर सर (पूर्व SI, स्टेट टॉपर 2009) हैं।",
    te: "ఆయాన్ ఫౌండేషన్ 2016లో తెలంగాణలో రిజిస్టర్డ్ సొసైటీగా స్థాపించబడింది. ఆయాన్ గ్రూప్ ఆఫ్ కాంపిటేటివ్ ఇన్స్టిట్యూషన్స్ హెడ్ ఆఫీస్ దిల్సుఖ్‌నగర్, హైదరాబాద్‌లో ఉంది, శాఖలు వరంగల్ (మయూరి మాల్, హన్మకొండ) మరియు రెసిడెన్షియల్ క్యాంపస్ బొల్లికుంట, వరంగల్‌లో ఉన్నాయి. డైరెక్టర్ మహ్మద్ అన్వర్ సార్ (Ex-SI, స్టేట్ టాపర్ 2009).",
    source: "About → Overview",
  },
  {
    id: "director",
    category: "Director",
    keywords: ["director", "anwar", "sir", "mohd anwar", "sub inspector", "si topper", "constable topper", "international athlete", "nsg commando", "ultra marathon", "police medal", "డైరెక్టర్", "निदेशक"],
    en: "Director Mohd. Anwar Sir was Constable State Topper, then SI State Topper (2009). International sportsperson, NSG Commando Overall Champion 2013, Police Medal, Ultra-Marathoner, 25+ years experience. He personally leads physical training (High Jump, Long Jump, 100/400m, Shot-put).",
    hi: "निदेशक मोहम्मद अनवर सर कांस्टेबल स्टेट टॉपर फिर SI स्टेट टॉपर (2009) रहे। इंटरनेशनल एथलीट, NSG कमांडो ओवरऑल चैंपियन 2013, पुलिस मेडल, अल्ट्रा-मैराथनर, 25+ साल अनुभव। वे स्वयं फिजिकल ट्रेनिंग (हाई जंप, लॉन्ग जंप, 100/400m, गोला फेंक) कराते हैं।",
    te: "డైరెక్టర్ మహ్మద్ అన్వర్ సార్ కానిస్టేబుల్ స్టేట్ టాపర్, ఆపై SI స్టేట్ టాపర్ (2009). ఇంటర్నేషనల్ అథ్లెట్, NSG కమాండో ఓవరాల్ ఛాంపియన్ 2013, పోలీస్ మెడల్, అల్ట్రా-మారథానర్, 25+ ఏళ్ల అనుభవం. ఆయనే స్వయంగా ఫిజికల్ శిక్షణ (హై జంప్, లాంగ్ జంప్, 100/400మీ, షాట్-పుట్) ఇస్తారు.",
    source: "About → Director",
  },
  {
    id: "residential",
    category: "Residential Academy",
    keywords: ["residential", "academy", "hostel", "campus", "bollikunta", "15 acres", "100m", "within 100m", "boys girls hostel", "रेसिडेंशियल", "रेजिडेंशियल", "రెసిడెన్షియల్"],
    en: "Ayaan Police Academy is India's first residential campus (15 acres, Bollikunta Warangal). Classroom, 3-level grounds, hostel, library/gym within 100m. Separate boys & girls hostels, dietary food (eggs, milk, ragi malt), canteen, 24x7 study hall & library.",
    hi: "आयान पुलिस एकेडमी भारत का पहला रेजिडेंशियल कैंपस है (15 एकड़, बोल्लिकुंटा वारंगल)। क्लासरूम, 3-लेवल ग्राउंड, हॉस्टल, लाइब्रेरी/जिम 100m के अंदर। लड़के/लड़कियों के अलग हॉस्टल, डाइट फूड (अंडा, दूध, रागी माल्ट), कैंटीन, 24x7 स्टडी हॉल।",
    te: "ఆయాన్ పోలీస్ అకాడమీ భారతదేశపు తొలి రెసిడెన్షియల్ క్యాంపస్ (15 ఎకరాలు, బొల్లికుంట వరంగల్). క్లాస్‌రూం, 3-లెవల్ గ్రౌండ్‌లు, హాస్టల్, లైబ్రరీ/జిమ్ 100మీ లోపు. బాయ్స్ & గర్ల్స్ హాస్టళ్లు వేరు, డైటరీ ఫుడ్ (గుడ్లు, పాలు, రాగి మాల్ట్), క్యాంటీన్, 24x7 స్టడీ హాల్.",
    source: "Academy → Facilities",
  },
  {
    id: "grounds",
    category: "Grounds",
    keywords: ["level 1", "level 2", "level 3", "ground", "track", "100m", "200m", "400m", "high jump", "long jump", "shot put", "sand track", "mud track", "gym", "strength", "ग्राउंड", "గ్రౌండ్"],
    en: "3 grounds: Level 1 daily practice (100/200/400m track), Level 2 strength (gym/functional), Level 3 events (High Jump, Long Jump, Shot-put, Sand & Mud tracks). Director Anwar Sir is chief coach for all events.",
    hi: "3 ग्राउंड: लेवल 1 रोज़ाना प्रैक्टिस (100/200/400m ट्रैक), लेवल 2 स्ट्रेंथ (जिम), लेवल 3 इवेंट्स (हाई जंप, लॉन्ग जंप, गोला फेंक, सैंड/मड ट्रैक)। डायरेक्टर अनवर सर मुख्य कोच हैं।",
    te: "3 గ్రౌండ్‌లు: లెవల్ 1 డైలీ ప్రాక్టీస్ (100/200/400మీ ట్రాక్), లెవల్ 2 స్ట్రెంత్ (జిమ్), లెవల్ 3 ఈవెంట్స్ (హై జంప్, లాంగ్ జంప్, షాట్-పుట్, సాండ్ & మడ్ ట్రాక్). డైరెక్టర్ అన్వర్ సార్ చీఫ్ కోచ్.",
    source: "Academy → Grounds",
  },
  {
    id: "preparation",
    category: "Preparation",
    keywords: ["preparation", "study hours", "4am", "daily test", "weekly grand test", "monthly model", "explanation", "doubts", "schedule", "routine", "तैयारी", "ప్రిపరేషన్"],
    en: "Preparation strategy: 4am-6am study hours, daily evening practice test + explanation, night study + doubts, weekly grand test, monthly model test, monthly physical assessment. Students categorized by scores, extra care for low scorers.",
    hi: "तैयारी रणनीति: सुबह 4-6 बजे स्टडी, रोज़ शाम प्रैक्टिस टेस्ट + एक्सप्लेनेशन, रात में डाउट्स, साप्ताहिक ग्रैंड टेस्ट, मासिक मॉडल टेस्ट, मासिक फिजिकल असेसमेंट। कम स्कोर वालों पर विशेष ध्यान।",
    te: "ప్రిపరేషన్ వ్యూహం: ఉదయం 4-6 స్టడీ అవర్స్, రోజూ సాయంత్రం ప్రాక్టీస్ టెస్ట్ + వివరణ, రాత్రి డౌట్స్, వీక్లీ గ్రాండ్ టెస్ట్, మంత్లీ మోడల్ టెస్ట్, నెలవారీ ఫిజికల్ అసెస్‌మెంట్. తక్కువ స్కోర్ వారికి ప్రత్యేక శ్రద్ధ.",
    source: "Academy → Preparation",
  },
  {
    id: "courses-list",
    category: "Courses",
    keywords: ["courses", "si", "constable", "groups", "group 1", "group 2", "ssc gd", "army", "navy", "airforce", "defence", "offline", "online", "कोर्स", "కోర్సులు"],
    en: "Courses: SI, Constable, Groups 1/2/3/4, SSC GD, Army/Navy/Airforce. Modes: Residential (Bollikunta), Offline day-scholar (Warangal/Hyderabad with hostel option), Online (live + recorded). Medium: Telugu & English separate batches. Duration ~3 months + continuous tests.",
    hi: "कोर्स: SI, कांस्टेबल, ग्रुप 1/2/3/4, SSC GD, आर्मी/नेवी/एयरफोर्स। मोड: रेजिडेंशियल, ऑफलाइन डे-स्कॉलर (वारंगल/हैदराबाद), ऑनलाइन (लाइव + रिकॉर्डेड)। माध्यम: तेलुगु & इंग्लिश अलग बैच, अवधि ~3 महीने।",
    te: "కోర్సులు: SI, కానిస్టేబుల్, గ్రూప్స్ 1/2/3/4, SSC GD, ఆర్మీ/నేవీ/ఎయిర్‌ఫోర్స్. మోడ్‌లు: రెసిడెన్షియల్, ఆఫ్‌లైన్ డే-స్కాలర్, ఆన్‌లైన్ (లైవ్ + రికార్డెడ్). మీడియం: తెలుగు & ఇంగ్లీష్ వేరు బ్యాచ్‌లు, వ్యవధి ~3 నెలలు.",
    source: "Courses → Offline",
  },
  {
    id: "online",
    category: "Online",
    keywords: ["online", "app", "classplus", "live", "recorded", "rewatch", "download", "offline download", "pdf", "ऑनलाइन", "ఆన్‌లైన్"],
    en: "Online via Ayaan Institutions app on ClassPlus (co.classplus.ayaan) since 2018. Live by same offline faculty, unlimited rewatch with forward/reverse, offline download, PDFs. Also Pro Fitness app (com.user.ayaanprofitness) for physical training with daily plan by Anwar Sir.",
    hi: "ऑनलाइन: आयान इंस्टीट्यूशंस ऐप (ClassPlus) 2018 से। समान फैकल्टी द्वारा लाइव, अनलिमिटेड रीवॉच, ऑफलाइन डाउनलोड, PDF। प्रो फिटनेस ऐप से अनवर सर द्वारा डेली फिजिकल प्लान।",
    te: "ఆన్‌లైన్: ఆయాన్ ఇన్‌స్టిట్యూషన్స్ యాప్ (ClassPlus) 2018 నుంచి. అదే ఆఫ్‌లైన్ ఫ్యాకల్టీ లైవ్, అన్లిమిటెడ్ రీవాచ్, ఆఫ్‌లైన్ డౌన్‌లోడ్, PDFలు. ప్రో ఫిట్‌నెస్ యాప్‌లో అన్వర్ సార్ డైలీ ఫిజికల్ ప్లాన్.",
    source: "Online → Apps",
  },
  {
    id: "tests",
    category: "Tests",
    keywords: ["daily test", "quiz", "syllabus preparation", "grand test", "test series", "razorpay", "₹20", "₹30", "unlock", "टेस्ट", "టెస్ట్"],
    en: "Tests: Daily Test-Quiz (subject-wise ₹20-30 via Razorpay: History ₹30, Reasoning ₹30, Aptitude ₹30, Economy ₹20), Syllabus Preparation (chapter-wise), Grand Test Series (full syllabus). Requires login. Daily evening tests + weekly/monthly grands with explanation.",
    hi: "टेस्ट: डेली क्विज़ (₹20-30 Razorpay), सिलेबस प्रिपरेशन (चैप्टर-वाइज), ग्रैंड टेस्ट सीरीज (पूरा सिलेबस)। लॉगिन ज़रूरी। रोज़ शाम टेस्ट + साप्ताहिक/मासिक ग्रैंड, एक्सप्लेनेशन के साथ।",
    te: "టెస్టులు: డైలీ క్విజ్ (₹20-30 Razorpay), సిలబస్ ప్రిపరేషన్ (చాప్టర్ వైజ్), గ్రాండ్ టెస్ట్ సిరీస్. లాగిన్ అవసరం. రోజూ సాయంత్రం టెస్టులు + వీక్లీ/మంత్లీ గ్రాండ్స్ వివరణతో.",
    source: "Preparation → Tests",
  },
  {
    id: "store",
    category: "Store",
    keywords: ["store", "shoes", "boots", "spikes", "tshirt", "jacket", "rucksack", "flashlight", "yoga mat", "gear", "स्टोर", "స్టోర్"],
    en: "Store sells preparation kit: boots/shoes (₹800-2500), spikes for 100m, running T-shirts, windbreakers, rucksacks, med kit, flashlight, yoga mat. Add to cart requires login.",
    hi: "स्टोर में: जूते/बूट्स (₹800-2500), 100m स्पाइक्स, रनिंग टी-शर्ट, विंडब्रेकर, रकसैक, मेड किट, टॉर्च, योगा मैट। कार्ट के लिए लॉगिन ज़रूरी।",
    te: "స్టోర్‌లో: బూట్స్/షూస్ (₹800-2500), 100మీ స్పైక్స్, రన్నింగ్ టీ-షర్టులు, విండ్‌బ్రేకర్లు, రక్‌సాక్‌లు, మెడ్ కిట్, టార్చ్, యోగా మ్యాట్. కార్ట్‌కు లాగిన్ అవసరం.",
    source: "Preparation → Store",
  },
  {
    id: "contact",
    category: "Contact",
    keywords: ["contact", "phone", "address", "warangal", "hanamkonda", "hyderabad", "dilsukhnagar", "mayuri mall", "bollikunta", "vaagdevi", "kishanpura", "8886667222", "email", "संपर्क", "కాంటాక్ట్"],
    en: "Contact +91 8886667222, ayaaninstitute.wgl@gmail.com. 3 campuses: 1) Warangal Residential — Don Bosco School, Opp. Vaagdevi College, Bollikunta 506005 2) Hanamkonda — 2nd Floor Mayuri Mall, Kishanpura 506001 3) Hyderabad — Chenna Complex, Pillar 1542, Dilsukhnagar.",
    hi: "संपर्क +91 8886667222, ayaaninstitute.wgl@gmail.com। 3 कैंपस: 1) वारंगल रेजिडेंशियल — डॉन बॉस्को स्कूल, वाग्देवी कॉलेज के सामने, बोल्लिकुंटा 2) हनमकोंडा — मयूरी मॉल, किशनपुरा 3) हैदराबाद — चेन्ना कॉम्प्लेक्स, पिलर 1542, दिलसुखनगर।",
    te: "కాంటాక్ట్ +91 8886667222, ayaaninstitute.wgl@gmail.com. 3 క్యాంపస్‌లు: 1) వరంగల్ రెసిడెన్షియల్ — డాన్ బోస్కో స్కూల్, వాగ్దేవి కాలేజీ ఎదురుగా, బొల్లికుంట 2) హన్మకొండ — మయూరి మాల్, కిషన్‌పురా 3) హైదరాబాద్ — చెన్నా కాంప్లెక్స్, పిల్లర్ 1542, దిల్సుఖ్‌నగర్.",
    source: "Contact → Addresses",
  },
  {
    id: "fees",
    category: "Fees",
    keywords: ["fees", "fee", "price", "cost", "admission", "registration", "फीस", "ఫీజు"],
    en: "Fees vary by course & mode (Residential includes hostel/food). For exact fees, contact admissions at +91 8886667222 or visit Contact page. Online tests from ₹20. Demo and counselling are free.",
    hi: "फीस कोर्स और मोड पर निर्भर (रेजिडेंशियल में हॉस्टल/भोजन शामिल)। सटीक फीस के लिए +91 8886667222 पर संपर्क करें। ऑनलाइन टेस्ट ₹20 से। डेमो व काउंसलिंग फ्री।",
    te: "ఫీజులు కోర్సు & మోడ్‌ను బట్టి మారుతాయి (రెసిడెన్షియల్‌లో హాస్టల్/భోజనం కలిపి). ఖచ్చితమైన ఫీజులకు +91 8886667222కు కాల్ చేయండి. ఆన్‌లైన్ టెస్టులు ₹20 నుంచి. డెమో & కౌన్సెలింగ్ ఉచితం.",
    source: "Contact → Admissions",
  },
  {
    id: "languages",
    category: "Languages",
    keywords: ["language", "telugu", "english", "medium", "bilingual", "भाषा", "భాష"],
    en: "Medium: Telugu and English separate batches for SI/Constable and others. Ask for your preferred medium during admission.",
    hi: "माध्यम: SI/कांस्टेबल के लिए तेलुगु और इंग्लिश अलग बैच। एडमिशन पर अपना माध्यम चुनें।",
    te: "మీడియం: SI/కానిస్టేబుల్‌కు తెలుగు & ఇంగ్లీష్ వేరు బ్యాచ్‌లు. అడ్మిషన్ సమయంలో మీ మీడియం ఎంచుకోండి.",
    source: "Courses → Medium",
  },
];

export function detectLang(text: string): Lang | null {
  if (/[\u0C00-\u0C7F]/.test(text)) return "te";
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  if (/telugu|అ|ఆ|తెలుగు/.test(text.toLowerCase())) return "te";
  if (/hindi|हिंदी/.test(text.toLowerCase())) return "hi";
  return null;
}

export function retrieve(query: string, kb: KBChunk[] = knowledgeBase, topK = 3): KBChunk[] {
  // Support legacy call retrieve(query, topK) — if kb is a number, treat as topK
  if (typeof kb === "number") {
    topK = kb as unknown as number;
    kb = knowledgeBase;
  }
  const q = query.toLowerCase();
  const tokens = q.split(/[^a-z0-9\u0C00-\u0C7F\u0900-\u097F]+/).filter(Boolean);
  const scored = (kb as KBChunk[]).map((ch) => {
    const text = `${ch.category} ${ch.keywords.join(" ")} ${ch.en} ${ch.hi} ${ch.te}`.toLowerCase();
    let score = 0;
    for (const t of tokens) if (text.includes(t)) score += 2;
    for (const kw of ch.keywords) if (q.includes(kw.toLowerCase())) score += 5;
    // boost exact id/category
    if (q.includes(ch.id)) score += 3;
    if (q.includes(ch.category.toLowerCase())) score += 2;
    return { ch, score };
  });
  scored.sort((a, b) => b.score - a.score);
  if (scored[0]?.score === 0) return [];
  return scored.slice(0, topK).filter((s) => s.score > 0).map((s) => s.ch);
}

export const uiStrings: Record<Lang, any> = {
  en: {
    title: "Ayaan Assistant",
    subtitle: "Ask anything — courses, hostel, tests",
    placeholder: "Ask in English, हिंदी or తెలుగు…",
    send: "Send",
    quick: ["Residential Academy?", "SI fees?", "3 ground levels?", "Online vs Offline?", "Warangal address?"],
    fallback: "I couldn’t find that in my knowledge. Please contact admissions at +91 8886667222 or try rephrasing.",
    sources: "Sources",
    thinking: "Thinking…",
    clear: "Clear",
    langLabel: "EN",
  },
  hi: {
    title: "आयान सहायक",
    subtitle: "कोर्स, हॉस्टल, टेस्ट — कुछ भी पूछें",
    placeholder: "हिंदी, English या తెలుగు में पूछें…",
    send: "भेजें",
    quick: ["रेजिडेंशियल क्या है?", "SI फीस कितनी?", "3 ग्राउंड कौन से?", "ऑनलाइन vs ऑफलाइन?", "वारंगल पता?"],
    fallback: "मुझे इसका उत्तर नहीं मिला। कृपया +91 8886667222 पर संपर्क करें या दोबारा पूछें।",
    sources: "स्रोत",
    thinking: "सोच रहा हूँ…",
    clear: "साफ़ करें",
    langLabel: "हिंदी",
  },
  te: {
    title: "ఆయాన్ అసిస్టెంట్",
    subtitle: "కోర్సులు, హాస్టల్, టెస్టులు — ఏదైనా అడగండి",
    placeholder: "తెలుగు, हिंदी లేదా English లో అడగండి…",
    send: "పంపు",
    quick: ["రెసిడెన్షియల్ అంటే ఏమిటి?", "SI ఫీజు ఎంత?", "3 గ్రౌండ్ లెవల్స్?", "ఆన్‌లైన్ vs ఆఫ్‌లైన్?", "వరంగల్ అడ్రస్?"],
    fallback: "దీనికి సమాధానం నా దగ్గర లేదు. దయచేసి +91 8886667222కు కాల్ చేయండి లేదా మళ్లీ అడగండి.",
    sources: "మూలాలు",
    thinking: "ఆలోచిస్తున్నా…",
    clear: "క్లియర్",
    langLabel: "తెలుగు",
  },
};
