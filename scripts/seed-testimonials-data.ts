/**
 * Seed script to populate CMS testimonials with 20 realistic construction testimonials.
 * Mix: 60% English, 40% Hindi (Devanagari script)
 *
 * Usage: npx tsx -r dotenv/config scripts/seed-testimonials.ts dotenv_config_path=.env.local
 */

import { createClient } from "@supabase/supabase-js";

const SITE_ID = "00000000-0000-0000-0000-000000000001";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const adminEmail = process.env.ADMIN_EMAIL || "admin@sbbt.com";
const adminPassword = process.env.ADMIN_PASSWORD;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials.");
  process.exit(1);
}

interface TestimonialData {
  client_name: string;
  initials: string;
  designation: string;
  project_name: string;
  project_type: string;
  location: string;
  rating: number;
  testimonial: string;
  completion_year: number;
  is_featured: boolean;
  display_order: number;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  og_title: string;
  og_description: string;
  robots: string;
  canonical: string;
}

export const testimonials: TestimonialData[] = [
  // ===== ENGLISH TESTIMONIALS (12) =====
  {
    client_name: "Deepak Sharma",
    initials: "DS",
    designation: "Homeowner",
    project_name: "SBBT Premium Villa Project",
    project_type: "Luxury Villa",
    location: "Noida",
    rating: 5,
    testimonial: "SBBT built our dream home in Noida and the experience was exceptional. From the initial consultation to the final handover, every step was transparent. The team used premium materials like UltraTech cement and TATA steel, and the quality of construction is evident in every corner of our villa. The project was completed within the promised timeline of 14 months. What impressed me most was their attention to detail and willingness to accommodate design changes without hidden charges. Highly recommended for anyone looking for quality construction in Delhi NCR.",
    completion_year: 2024,
    is_featured: true,
    display_order: 1,
    seo_title: "Deepak Sharma Review - SBBT Luxury Villa Construction Noida",
    seo_description: "Read how SBBT delivered a premium luxury villa in Noida with UltraTech cement and TATA steel. Transparent pricing, on-time delivery, and exceptional quality.",
    seo_keywords: "luxury villa construction noida, sbbt review, premium construction delhi ncr, turnkey villa builder",
    og_title: "SBBT Luxury Villa Construction Review - Noida",
    og_description: "Exceptional quality construction with premium materials. Completed in 14 months with full transparency.",
    robots: "index, follow",
    canonical: "/testimonials/deepak-sharma-noida-villa",
  },
  {
    client_name: "Amit Kumar",
    initials: "AK",
    designation: "Business Owner",
    project_name: "Independent Floor Construction",
    project_type: "Independent Floor",
    location: "Delhi",
    rating: 5,
    testimonial: "I was skeptical about hiring a construction company for my independent floor project in Delhi, but SBBT exceeded all expectations. Their turnkey approach meant I didn't have to worry about anything - from approvals to finishing. The structural quality is outstanding, and they used M25 grade RMC concrete throughout. The team was always available to answer my questions and provided weekly progress updates. The project was completed 2 weeks ahead of schedule. Truly professional service!",
    completion_year: 2024,
    is_featured: true,
    display_order: 2,
    seo_title: "Amit Kumar Review - Independent Floor Construction Delhi",
    seo_description: "SBBT delivered an independent floor project in Delhi ahead of schedule with M25 RMC concrete. Professional turnkey construction service.",
    seo_keywords: "independent floor construction delhi, turnkey construction, sbbt review delhi",
    og_title: "Independent Floor Construction Review - Delhi",
    og_description: "Turnkey construction completed ahead of schedule with premium materials and weekly updates.",
    robots: "index, follow",
    canonical: "/testimonials/amit-kumar-delhi-floor",
  },
  {
    client_name: "Rajesh Singh",
    initials: "RS",
    designation: "Government Employee",
    project_name: "Turnkey House Construction",
    project_type: "Turnkey House",
    location: "Greater Noida",
    rating: 5,
    testimonial: "Building a home is a once-in-a-lifetime experience, and SBBT made it memorable for all the right reasons. Their transparent pricing model meant no surprises. The Essential package we chose included everything from foundation to painting. The Kajaria tiles, Jaquar fittings, and Asian Paints finish gave our home a premium look. The site supervisor was knowledgeable and kept the labor team disciplined. After 10 months, we moved into a home that exceeded our expectations.",
    completion_year: 2023,
    is_featured: true,
    display_order: 3,
    seo_title: "Rajesh Singh Review - Turnkey House Construction Greater Noida",
    seo_description: "SBBT's Essential package delivered a complete turnkey home in Greater Noida with Kajaria tiles, Jaquar fittings, and Asian Paints.",
    seo_keywords: "turnkey house construction greater noida, essential package, sbbt review",
    og_title: "Turnkey House Construction Review - Greater Noida",
    og_description: "Complete home with premium brands, transparent pricing, and exceptional finish quality.",
    robots: "index, follow",
    canonical: "/testimonials/rajesh-singh-greater-noida-house",
  },
  {
    client_name: "Sunita Prajapati",
    initials: "SP",
    designation: "Homemaker",
    project_name: "Home Renovation Project",
    project_type: "Home Renovation",
    location: "Gurgaon",
    rating: 5,
    testimonial: "We renovated our 15-year-old home in Gurgaon with SBBT, and the transformation is unbelievable. They handled everything - demolition, new flooring, modular kitchen, bathroom upgrades, and complete repainting. The team was respectful of our living space and maintained cleanliness throughout. The false ceiling work in the living room is stunning, and the modular kitchen with quartz countertop is a dream. The project stayed within budget and was completed in 4 months. Thank you SBBT for giving our home a new life!",
    completion_year: 2024,
    is_featured: false,
    display_order: 4,
    seo_title: "Sunita Prajapati Review - Home Renovation Gurgaon",
    seo_description: "Complete home renovation in Gurgaon including modular kitchen, false ceiling, and bathroom upgrades. Within budget and on time.",
    seo_keywords: "home renovation gurgaon, modular kitchen, false ceiling, sbbt renovation review",
    og_title: "Home Renovation Review - Gurgaon",
    og_description: "Stunning home transformation with modular kitchen, quartz countertops, and premium finishes.",
    robots: "index, follow",
    canonical: "/testimonials/sunita-prajapati-gurgaon-renovation",
  },
  {
    client_name: "Vikram Khanna",
    initials: "VK",
    designation: "IT Professional",
    project_name: "Duplex Construction",
    project_type: "Duplex",
    location: "Ghaziabad",
    rating: 5,
    testimonial: "As an IT professional, I wanted a modern duplex with smart home features. SBBT understood my vision perfectly. They integrated smart locks, video door phone, and home automation seamlessly. The Premium package with Havells + Legrand electricals and imported premium tiles gave my home a luxury feel. The structural engineer verified foundation design gave me peace of mind. Communication was excellent - I received daily site photos and weekly progress reports. Worth every rupee!",
    completion_year: 2024,
    is_featured: true,
    display_order: 5,
    seo_title: "Vikram Khanna Review - Duplex Construction Ghaziabad",
    seo_description: "Modern duplex with smart home features, Havells electricals, and home automation in Ghaziabad. Premium construction by SBBT.",
    seo_keywords: "duplex construction ghaziabad, smart home, home automation, premium construction",
    og_title: "Modern Duplex Construction Review - Ghaziabad",
    og_description: "Smart home duplex with automation, premium electricals, and engineer-verified foundation.",
    robots: "index, follow",
    canonical: "/testimonials/vikram-khanna-ghaziabad-duplex",
  },
  {
    client_name: "Priya Agarwal",
    initials: "PA",
    designation: "Doctor",
    project_name: "Interior Design Project",
    project_type: "Interior Design",
    location: "Noida",
    rating: 5,
    testimonial: "SBBT's interior design team transformed our empty rooms into a beautiful, functional living space. They understood our aesthetic preferences and budget constraints perfectly. The POP false ceiling designs are elegant, the lighting plan is well-thought-out, and the wardrobes in every bedroom are both stylish and spacious. The team used CenturyPly for all woodwork and the finish is impeccable. The project was completed in 3 months without any hassle. I would definitely recommend SBBT for interior work.",
    completion_year: 2023,
    is_featured: false,
    display_order: 6,
    seo_title: "Priya Agarwal Review - Interior Design Noida",
    seo_description: "Complete interior design project in Noida with POP false ceiling, CenturyPly wardrobes, and elegant lighting. Stylish and functional.",
    seo_keywords: "interior design noida, false ceiling, centuryply wardrobes, sbbt interior review",
    og_title: "Interior Design Project Review - Noida",
    og_description: "Elegant interiors with premium materials and impeccable finish quality.",
    robots: "index, follow",
    canonical: "/testimonials/priya-agarwal-noida-interior",
  },
  {
    client_name: "Manoj Gupta",
    initials: "MG",
    designation: "Shop Owner",
    project_name: "Commercial Office Construction",
    project_type: "Commercial Office",
    location: "Faridabad",
    rating: 4,
    testimonial: "We hired SBBT for our commercial office space in Faridabad. The structural work was solid, and they completed the RCC framework efficiently. The ACP sheet elevation looks professional and modern. There were minor delays due to material supply issues, but the team communicated proactively. The final result is a well-constructed office space that meets all our business needs. Good value for money for commercial projects.",
    completion_year: 2023,
    is_featured: false,
    display_order: 7,
    seo_title: "Manoj Gupta Review - Commercial Office Construction Faridabad",
    seo_description: "Commercial office construction in Faridabad with RCC framework and ACP sheet elevation. Professional and reliable service.",
    seo_keywords: "commercial construction faridabad, office construction, acp sheet elevation, sbbt commercial review",
    og_title: "Commercial Office Construction Review - Faridabad",
    og_description: "Professional office space with solid structure and modern elevation.",
    robots: "index, follow",
    canonical: "/testimonials/manoj-gupta-faridabad-office",
  },
  {
    client_name: "Anjali Mehta",
    initials: "AM",
    designation: "Architect",
    project_name: "Builder Floor Project",
    project_type: "Builder Floor",
    location: "Delhi",
    rating: 5,
    testimonial: "As an architect, I have high standards for construction quality. SBBT met and exceeded them. Their understanding of structural details, waterproofing techniques, and material specifications was impressive. The Fosroc waterproofing for toilets and terrace has been leak-free for 2 years now. The team followed my drawings precisely and offered valuable suggestions for cost optimization without compromising quality. A reliable construction partner for professionals.",
    completion_year: 2022,
    is_featured: false,
    display_order: 8,
    seo_title: "Anjali Mehta Review - Builder Floor Construction Delhi",
    seo_description: "Architect's review of SBBT builder floor construction in Delhi. Precise execution, excellent waterproofing, and cost optimization.",
    seo_keywords: "builder floor delhi, construction quality, fosroc waterproofing, architect review sbbt",
    og_title: "Builder Floor Construction Review - Delhi",
    og_description: "Architect-approved construction with precise execution and leak-free waterproofing.",
    robots: "index, follow",
    canonical: "/testimonials/anjali-mehta-delhi-builder-floor",
  },
  {
    client_name: "Suresh Yadav",
    initials: "SY",
    designation: "Retired Officer",
    project_name: "Retirement Home Construction",
    project_type: "Turnkey House",
    location: "Greater Noida",
    rating: 5,
    testimonial: "After retirement, I wanted a peaceful home in Greater Noida. SBBT made this dream come true within my pension budget. Their Solid Structure package was perfect - strong foundation, quality RCC, and basic finishes. The team was patient with my questions and never pressured me into upgrades. The 10-year structural warranty gives me peace of mind. Honest, reliable, and budget-friendly construction service.",
    completion_year: 2023,
    is_featured: false,
    display_order: 9,
    seo_title: "Suresh Yadav Review - Budget Home Construction Greater Noida",
    seo_description: "Affordable retirement home in Greater Noida with SBBT's Solid Structure package. 10-year warranty and honest service.",
    seo_keywords: "budget home construction greater noida, solid structure package, retirement home, sbbt review",
    og_title: "Budget Home Construction Review - Greater Noida",
    og_description: "Honest, reliable construction within pension budget with 10-year structural warranty.",
    robots: "index, follow",
    canonical: "/testimonials/suresh-yadav-greater-noida-retirement-home",
  },
  {
    client_name: "Kavita Reddy",
    initials: "KR",
    designation: "Teacher",
    project_name: "Premium Luxury Villa",
    project_type: "Luxury Villa",
    location: "Gurgaon",
    rating: 5,
    testimonial: "Our Premium Luxury villa in Gurgaon is a masterpiece, thanks to SBBT. The imported premium vitrified tiles, Jaquar/Kohler sanitary ware, and full modular kitchen with quartz countertops make it feel like a 5-star hotel. The SS304 railings, designer main gate, and HPL front elevation are stunning. The Hi-Bon MRL elevator with ARD was installed flawlessly. Every detail was executed to perfection. The 15-year structural warranty and 2-year AMC show their confidence in quality.",
    completion_year: 2024,
    is_featured: true,
    display_order: 10,
    seo_title: "Kavita Reddy Review - Premium Luxury Villa Gurgaon",
    seo_description: "Luxury villa in Gurgaon with imported tiles, Kohler fittings, modular kitchen, and Hi-Bon elevator. Premium construction by SBBT.",
    seo_keywords: "luxury villa gurgaon, premium construction, kohler fittings, modular kitchen, elevator installation",
    og_title: "Premium Luxury Villa Review - Gurgaon",
    og_description: "5-star quality villa with imported materials, modular kitchen, and private elevator.",
    robots: "index, follow",
    canonical: "/testimonials/kavita-reddy-gurgaon-luxury-villa",
  },
  {
    client_name: "Rahul Verma",
    initials: "RV",
    designation: "Entrepreneur",
    project_name: "Custom Build Home",
    project_type: "Custom Build",
    location: "Noida",
    rating: 5,
    testimonial: "I wanted a completely customized home with specific requirements - home theatre, open kitchen, and rooftop garden. SBBT's Custom Build package was exactly what I needed. They worked closely with my architect and accommodated every custom requirement. The flexibility in material selection meant I could choose exactly what I wanted. The rainwater harvesting system and solar provisions were integrated seamlessly. A truly personalized construction experience.",
    completion_year: 2024,
    is_featured: false,
    display_order: 11,
    seo_title: "Rahul Verma Review - Custom Build Home Noida",
    seo_description: "Fully customized home in Noida with home theatre, rooftop garden, rainwater harvesting, and solar provisions. Flexible construction by SBBT.",
    seo_keywords: "custom build home noida, personalized construction, rainwater harvesting, solar provision, sbbt custom review",
    og_title: "Custom Build Home Review - Noida",
    og_description: "Personalized construction with unique features and sustainable provisions.",
    robots: "index, follow",
    canonical: "/testimonials/rahul-verma-noida-custom-build",
  },
  {
    client_name: "Geeta Nair",
    initials: "GN",
    designation: "Bank Manager",
    project_name: "Independent House Construction",
    project_type: "Turnkey House",
    location: "Delhi",
    rating: 5,
    testimonial: "Being in banking, I appreciate transparency and documentation. SBBT provided detailed cost breakdowns, material specifications, and payment milestones before starting. There were no hidden charges. The quality of construction - from the M20 RMC foundation to the final Asian Paints Apex exterior - was exactly as promised. The after-sales support has been excellent. They fixed minor touch-ups promptly even 6 months after handover. A trustworthy construction company.",
    completion_year: 2023,
    is_featured: false,
    display_order: 12,
    seo_title: "Geeta Nair Review - Transparent House Construction Delhi",
    seo_description: "Transparent construction with detailed cost breakdowns and no hidden charges. Excellent after-sales support from SBBT in Delhi.",
    seo_keywords: "transparent construction delhi, no hidden charges, after sales support, sbbt review delhi",
    og_title: "Transparent Construction Review - Delhi",
    og_description: "Detailed documentation, no hidden costs, and excellent after-sales service.",
    robots: "index, follow",
    canonical: "/testimonials/geeta-nair-delhi-transparent-construction",
  },

  // ===== HINDI TESTIMONIALS (8) =====
  {
    client_name: "राजेश मिश्रा",
    initials: "RM",
    designation: "व्यवसायी",
    project_name: "SBBT प्रीमियम हाउस प्रोजेक्ट",
    project_type: "Turnkey House",
    location: "नोएडा",
    rating: 5,
    testimonial: "SBBT ने हमारे सपनों का घर बनाया। शुरुआत से लेकर आखिरी फिनिशिंग तक हर चीज़ बेहतरीन थी। टीम ने UltraTech सीमेंट और Rathi स्टील का इस्तेमाल किया, जिससे घर की मज़बूती साफ दिखती है। प्रोजेक्ट समय पर पूरा हुआ और कोई छिपी हुई लागत नहीं थी। साइट सुपरवाइजर ने हर छोटी बात का ध्यान रखा। दिल्ली NCR में घर बनवाने के लिए SBBT सबसे अच्छा विकल्प है।",
    completion_year: 2024,
    is_featured: true,
    display_order: 13,
    seo_title: "राजेश मिश्रा समीक्षा - SBBT टर्नकी हाउस निर्माण नोएडा",
    seo_description: "SBBT ने नोएडा में UltraTech सीमेंट और Rathi स्टील से मज़बूत घर बनाया। समय पर पूरा और कोई छिपी लागत नहीं।",
    seo_keywords: "घर निर्माण नोएडा, टर्नकी कंस्ट्रक्शन, sbbt समीक्षा, दिल्ली ncr निर्माण",
    og_title: "SBBT टर्नकी हाउस समीक्षा - नोएडा",
    og_description: "मज़बूत निर्माण, समय पर डिलीवरी, और पारदर्शी लागत।",
    robots: "index, follow",
    canonical: "/testimonials/rajesh-mishra-noida-house-hindi",
  },
  {
    client_name: "अनिल कुमार सिंह",
    initials: "AS",
    designation: "सरकारी कर्मचारी",
    project_name: "लक्ज़री विला निर्माण",
    project_type: "Luxury Villa",
    location: "गुड़गांव",
    rating: 5,
    testimonial: "हमारी लक्ज़री विला गुड़गांव में SBBT ने बनाई। इम्पोर्टेड टाइल्स, Jaquar फिटिंग्स, और क्वार्ट्ज काउंटरटॉप किचन ने घर को होटल जैसा लुक दिया। SS304 रेलिंग और डिज़ाइनर मेन गेट बहुत खूबसूरत हैं। टीम ने हर डिटेल पर ध्यान दिया। 15 साल की स्ट्रक्चरल वारंटी और 2 साल की AMC उनकी गुणवत्ता पर भरोसा दिखाती है। बहुत बढ़िया काम!",
    completion_year: 2024,
    is_featured: false,
    display_order: 14,
    seo_title: "अनिल कुमार सिंह समीक्षा - लक्ज़री विला गुड़गांव",
    seo_description: "गुड़गांव में लक्ज़री विला इम्पोर्टेड टाइल्स और Jaquar फिटिंग्स के साथ। 15 साल वारंटी और बेहतरीन फिनिशिंग।",
    seo_keywords: "लक्ज़री विला गुड़गांव, jaquar फिटिंग्स, क्वार्ट्ज किचन, sbbt समीक्षा",
    og_title: "लक्ज़री विला समीक्षा - गुड़गांव",
    og_description: "होटल जैसा लुक, प्रीमियम सामग्री, और 15 साल वारंटी।",
    robots: "index, follow",
    canonical: "/testimonials/anil-singh-gurgaon-villa-hindi",
  },
  {
    client_name: "सुनीता देवी",
    initials: "SD",
    designation: "गृहणी",
    project_name: "घर रेनोवेशन",
    project_type: "Home Renovation",
    location: "दिल्ली",
    rating: 5,
    testimonial: "हमारे 20 साल पुराने घर को SBBT ने नया रूप दिया। पुरानी फर्श हटाकर नई Kajaria टाइल्स लगाईं, मॉड्यूलर किचन बनाया, और बाथरूम अपग्रेड किए। टीम ने हमारी प्राइवेसी का ध्यान रखा और काम के दौरान साफ-सफाई बनाए रखी। लिविंग रूम में फॉल्स सीलिंग बहुत सुंदर बनी है। बजट के भीतर 4 महीने में काम पूरा हुआ। SBBT को धन्यवाद!",
    completion_year: 2023,
    is_featured: false,
    display_order: 15,
    seo_title: "सुनीता देवी समीक्षा - घर रेनोवेशन दिल्ली",
    seo_description: "दिल्ली में पुराने घर का रेनोवेशन - मॉड्यूलर किचन, फॉल्स सीलिंग, और Kajaria टाइल्स। बजट के भीतर।",
    seo_keywords: "घर रेनोवेशन दिल्ली, मॉड्यूलर किचन, फॉल्स सीलिंग, sbbt रेनोवेशन",
    og_title: "घर रेनोवेशन समीक्षा - दिल्ली",
    og_description: "पुराने घर का नया रूप - मॉड्यूलर किचन और सुंदर फॉल्स सीलिंग।",
    robots: "index, follow",
    canonical: "/testimonials/sunita-devi-delhi-renovation-hindi",
  },
  {
    client_name: "महेश शर्मा",
    initials: "MS",
    designation: "दुकानदार",
    project_name: "कमर्शियल ऑफिस निर्माण",
    project_type: "Commercial Office",
    location: "फरीदाबाद",
    rating: 4,
    testimonial: "फरीदाबाद में अपना ऑफिस बनवाने के लिए SBBT को चुना। RCC फ्रेमवर्क मज़बूत है और ACP शीट एलिवेशन प्रोफेशनल लुक देता है। कुछ सामग्री सप्लाई में देरी हुई थी, लेकिन टीम ने समय-समय पर जानकारी दी। अंत में एक अच्छा ऑफिस स्पेस मिला। कमर्शियल प्रोजेक्ट के लिए अच्छा विकल्प है।",
    completion_year: 2023,
    is_featured: false,
    display_order: 16,
    seo_title: "महेश शर्मा समीक्षा - कमर्शियल ऑफिस फरीदाबाद",
    seo_description: "फरीदाबाद में कमर्शियल ऑफिस निर्माण - मज़बूत RCC और ACP एलिवेशन। प्रोफेशनल सेवा।",
    seo_keywords: "कमर्शियल ऑफिस फरीदाबाद, rcc निर्माण, acp एलिवेशन, sbbt कमर्शियल",
    og_title: "कमर्शियल ऑफिस समीक्षा - फरीदाबाद",
    og_description: "मज़बूत संरचना और प्रोफेशनल एलिवेशन के साथ ऑफिस।",
    robots: "index, follow",
    canonical: "/testimonials/mahesh-sharma-faridabad-office-hindi",
  },
  {
    client_name: "प्रीति अग्रवाल",
    initials: "PA",
    designation: "डॉक्टर",
    project_name: "इंटीरियर डिज़ाइन प्रोजेक्ट",
    project_type: "Interior Design",
    location: "नोएडा",
    rating: 5,
    testimonial: "SBBT की इंटीरियर टीम ने हमारे खाली कमरों को खूबसूरत बना दिया। POP फॉल्स सीलिंग डिज़ाइन सुंदर हैं, लाइटिंग प्लान सोचा-समझा है, और हर बेडरूम में CenturyPly वार्डरोब स्टाइलिश और जगह वाले हैं। टीम ने हमारी पसंद और बजट को समझा। 3 महीने में बिना किसी परेशानी के काम पूरा हुआ। इंटीरियर काम के लिए SBBT को ज़रूर चुनें।",
    completion_year: 2024,
    is_featured: false,
    display_order: 17,
    seo_title: "प्रीति अग्रवाल समीक्षा - इंटीरियर डिज़ाइन नोएडा",
    seo_description: "नोएडा में इंटीरियर डिज़ाइन - POP फॉल्स सीलिंग, CenturyPly वार्डरोब, और सुंदर लाइटिंग।",
    seo_keywords: "इंटीरियर डिज़ाइन नोएडा, फॉल्स सीलिंग, centuryply वार्डरोब, sbbt इंटीरियर",
    og_title: "इंटीरियर डिज़ाइन समीक्षा - नोएडा",
    og_description: "सुंदर इंटीरियर प्रीमियम सामग्री और बेहतरीन फिनिश के साथ।",
    robots: "index, follow",
    canonical: "/testimonials/preeti-agrawal-noida-interior-hindi",
  },
  {
    client_name: "विजय पाल",
    initials: "VP",
    designation: "किसान",
    project_name: "टर्नकी हाउस निर्माण",
    project_type: "Turnkey House",
    location: "गाज़ियाबाद",
    rating: 5,
    testimonial: "गाज़ियाबाद में अपना पहला घर बनवाया। SBBT का Essential पैकेज चुना जिसमें नींव से पेंटिंग तक सब कुछ शामिल था। Kajaria टाइल्स, Jaquar फिटिंग्स, और Asian Paints ने घर को प्रीमियम लुक दिया। साइट सुपरवाइजर ने लेबर टीम को डिसिप्लिन में रखा। 10 महीने में हम अपने सपनों के घर में आ गए। ईमानदार और भरोसेमंद कंस्ट्रक्शन कंपनी।",
    completion_year: 2023,
    is_featured: false,
    display_order: 18,
    seo_title: "विजय पाल समीक्षा - टर्नकी हाउस गाज़ियाबाद",
    seo_description: "गाज़ियाबाद में Essential पैकेज से घर निर्माण। Kajaria टाइल्स, Jaquar फिटिंग्स, 10 महीने में पूरा।",
    seo_keywords: "टर्नकी हाउस गाज़ियाबाद, essential पैकेज, kajaria टाइल्स, sbbt समीक्षा",
    og_title: "टर्नकी हाउस समीक्षा - गाज़ियाबाद",
    og_description: "नींव से पेंटिंग तक सब कुछ, 10 महीने में सपनों का घर।",
    robots: "index, follow",
    canonical: "/testimonials/vijay-pal-ghaziabad-house-hindi",
  },
  {
    client_name: "कमला नायडू",
    initials: "KN",
    designation: "शिक्षिका",
    project_name: "डुप्लेक्स निर्माण",
    project_type: "Duplex",
    location: "ग्रेटर नोएडा",
    rating: 5,
    testimonial: "हमारा डुप्लेक्स ग्रेटर नोएडा में SBBT ने बनाया। Havells इलेक्ट्रिकल्स, uPVC विंडोज़, और प्रीमियम फिनिशिंग ने घर को मॉडर्न लुक दिया। स्ट्रक्चरल इंजीनियर ने फाउंडेशन डिज़ाइन वेरिफाई किया जिससे हमें सुकून मिला। टीम ने रोज़ साइट की फोटो भेजीं और हफ्ते में एक बार प्रोग्रेस रिपोर्ट दी। हर रुपये की कीमत थी!",
    completion_year: 2024,
    is_featured: false,
    display_order: 19,
    seo_title: "कमला नायडू समीक्षा - डुप्लेक्स ग्रेटर नोएडा",
    seo_description: "ग्रेटर नोएडा में डुप्लेक्स - Havells इलेक्ट्रिकल्स, uPVC विंडोज़, इंजीनियर वेरिफाइड फाउंडेशन।",
    seo_keywords: "डुप्लेक्स ग्रेटर नोएडा, havells इलेक्ट्रिकल्स, upvc विंडोज़, sbbt डुप्लेक्स",
    og_title: "डुप्लेक्स समीक्षा - ग्रेटर नोएडा",
    og_description: "मॉडर्न डुप्लेक्स प्रीमियम इलेक्ट्रिकल्स और इंजीनियर वेरिफाइड संरचना के साथ।",
    robots: "index, follow",
    canonical: "/testimonials/kamla-naidu-greater-noida-duplex-hindi",
  },
  {
    client_name: "रोहित सक्सेना",
    initials: "RS",
    designation: "आईटी प्रोफेशनल",
    project_name: "कस्टम बिल्ड होम",
    project_type: "Custom Build",
    location: "नोएडा",
    rating: 5,
    testimonial: "मुझे एक कस्टमाइज्ड होम चाहिए था - होम थिएटर, ओपन किचन, और रूफटॉप गार्डन के साथ। SBBT का Custom Build पैकेज बिल्कुल सही था। उन्होंने मेरे आर्किटेक्ट के साथ मिलकर हर ज़रूरत को पूरा किया। रेनवाटर हार्वेस्टिंग और सोलर प्रोविज़न भी शानदार तरीके से लगाए। सामग्री चुनने में पूरी आज़ादी मिली। एक सच्चा पर्सनलाइज्ड कंस्ट्रक्शन अनुभव!",
    completion_year: 2024,
    is_featured: false,
    display_order: 20,
    seo_title: "रोहित सक्सेना समीक्षा - कस्टम बिल्ड होम नोएडा",
    seo_description: "नोएडा में कस्टम होम - होम थिएटर, रूफटॉप गार्डन, रेनवाटर हार्वेस्टिंग, सोलर प्रोविज़न। फ्लेक्सिबल कंस्ट्रक्शन।",
    seo_keywords: "कस्टम बिल्ड नोएडा, होम थिएटर, रेनवाटर हार्वेस्टिंग, सोलर, sbbt कस्टम",
    og_title: "कस्टम बिल्ड होम समीक्षा - नोएडा",
    og_description: "पर्सनलाइज्ड निर्माण यूनिक फीचर्स और सस्टेनेबल प्रोविज़न के साथ।",
    robots: "index, follow",
    canonical: "/testimonials/rohit-saxena-noida-custom-hindi",
  },
];

async function seed() {
  console.log("🔨 Starting testimonials seed...\n");

  const supabase = createClient(supabaseUrl!, supabaseKey!);

  if (adminPassword) {
    console.log("🔑 Signing in as admin...");
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });
    if (signInError) {
      console.error("❌ Admin sign-in failed:", signInError.message);
      process.exit(1);
    }
    console.log("✅ Admin signed in successfully.");
  }

  console.log("🗑️  Clearing existing testimonials...");
  const { error: deleteError } = await supabase
    .from("cms_testimonials")
    .delete()
    .neq("id", 0);

  if (deleteError) {
    console.error("❌ Error clearing testimonials:", deleteError.message);
    process.exit(1);
  }
  console.log("✅ Existing testimonials cleared.\n");

  let successCount = 0;
  let errorCount = 0;

  for (const t of testimonials) {
    const { error } = await supabase
      .from("cms_testimonials")
      .insert({
        site_id: SITE_ID,
        client_name: t.client_name,
        initials: t.initials,
        designation: t.designation,
        project_name: t.project_name,
        project_type: t.project_type,
        location: t.location,
        rating: t.rating,
        testimonial: t.testimonial,
        image_url: "",
        is_featured: t.is_featured,
        display_order: t.display_order,
        completion_year: t.completion_year,
        seo_title: t.seo_title,
        seo_description: t.seo_description,
        seo_keywords: t.seo_keywords,
        og_title: t.og_title,
        og_description: t.og_description,
        robots: t.robots,
        canonical: t.canonical,
      });

    if (error) {
      console.error(`❌ Error inserting testimonial for ${t.client_name}:`, error.message);
      errorCount++;
    } else {
      console.log(`✅ Inserted: ${t.client_name} (${t.location}) - ${t.rating}★`);
      successCount++;
    }
  }

  console.log(`\n📊 Summary: ${successCount} testimonials inserted, ${errorCount} errors`);

  if (errorCount > 0) {
    console.log("\n⚠️  Some testimonials failed. This may be because the migration 073 hasn't been applied yet.");
    console.log("   Please run supabase_v2/073_cms_testimonials_blogs_seo.sql in the Supabase SQL Editor.");
  }

  console.log("\n🎉 Testimonials seed complete!");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});