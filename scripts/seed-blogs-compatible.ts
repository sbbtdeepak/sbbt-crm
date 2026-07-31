/**
 * Seed script to populate CMS blogs with 30 construction blogs.
 * Uses ONLY base columns from migration 063 (no category, seo, etc. - those need migration 073).
 * 20 English + 10 Hinglish (Hindi-English mix).
 *
 * Usage: npx tsx -r dotenv/config Scripts/seed-blogs-compatible.ts dotenv_config_path=.env.local
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

// Blog data stripped to base columns (migration 063 compatible)
const blogs: Record<string, unknown>[] = [
  // ========================================================================
  // ENGLISH BLOGS (20)
  // ========================================================================
  {
    title: "How Much Does It Cost to Build a House in Noida in 2026?",
    slug: "cost-to-build-house-noida-2026",
    excerpt: "Complete per-square-foot cost breakdown for constructing house in Noida in 2026, covering materials, labour, approvals, and hidden charges.",
    content: `Building house in Noida in 2026 can cost anywhere between ₹1,800 to ₹3,500 per square foot depending on quality of construction, type of materials, and scope of work.

Let's break down numbers.

For a 1,500 sq ft house, here is realistic cost estimate:

1. Basic Construction (M20 RCC frame, brick walls, plaster) – ₹1,200 to ₹1,500/sq ft
This includes foundation work, column-beam structure, slab casting, brickwork, internal and external plaster. Uses UltraTech cement, TATA steel, and standard river sand.

2. Flooring and Tiling – ₹150 to ₹300/sq ft
Kajaria or Somany vitrified tiles are standard. If you want imported Italian marble or large-format tiles, cost goes up.

3. Electrical and Plumbing – ₹100 to ₹200/sq ft
Havells or Legrand switches and fittings. For plumbing, Jaguar or Hindware are most common choices.

4. Painting – ₹50 to ₹100/sq ft
Asian Paints interior (Royale Play) and exterior (Apex) are preferred brands.

5. Woodwork and Carpentry – ₹100 to ₹200/sq ft
CenturyPly or Greenply for wardrobes, kitchen cabinets, and doors.

6. Kitchen and Bathroom – ₹100 to ₹150/sq ft
Modular kitchen with quartz countertop, stainless steel sink, and branded fittings.

7. Overheads – 10% to 15% over above cost
Includes architectural fees, municipal approvals, scaffolding, labour welfare, and contingencies.

Hidden costs to watch out for:
- Soil testing (₹10,000 to ₹20,000)
- Architect fees (₹20 to ₹40 per sq ft)
- Noida Authority building plan approval (₹2 to ₹5 per sq ft)
- Temporary electricity and water connection
- Labour insurance and safety equipment

Tips to save cost without compromising quality:
- Start construction in dry season (October to March) — fewer labour delays.
- Buy materials in bulk from wholesale markets like Bhangel or Atta.
- Use M20 grade concrete for foundations and M25 for columns — do not overspec.
- Avoid frequent design changes once casting starts.
- Get at least three contractor quotes and check previous work.

At SBBT, we provide transparent cost estimates with line-item breakdowns. No hidden charges, no surprises. Our packages start from ₹1,799/sq ft and go up to ₹3,299/sq ft for premium luxury.

If you are planning to build in Noida, Greater Noida, or surrounding areas, get in touch with our team for free site visit and quote.`,
    featured_image_url: "",
    author: "SBBT Construction Team",
    tags: "construction cost, budget, Noida, home building guide",
    meta_title: "House Construction Cost in Noida 2026 - Per Sq Ft Breakdown | SBBT",
    meta_description: "Complete cost breakdown for building house in Noida in 2026. Per square foot rates, hidden charges, and money-saving tips from SBBT construction experts.",
    is_published: true,
    display_order: 1,
  },
  {
    title: "10 Vastu Tips for Your New Home Construction in Delhi NCR",
    slug: "vastu-tips-new-home-construction-delhi-ncr",
    excerpt: "Essential Vastu Shastra guidelines for home construction in Delhi NCR. Learn about plot selection, room placement, and directions for positive energy.",
    content: `Vastu Shastra is not just about beliefs — it is about aligning your home with natural elements for better health, prosperity, and peace. Here are 10 practical Vastu tips to follow when constructing your home in Delhi NCR.

1. Plot Shape Matters
Square or rectangular plots are considered best. Avoid irregular shapes like L-shaped or triangular plots. If you have irregular plot, consult a Vastu expert before starting construction.

2. Main Entrance Direction
North-east facing entrance is considered most auspicious. East and north entrances are also good. Avoid south-west and south-east as main entrances.

3. Living Room Placement
Living room should be in north-east or north-west direction. Ensure it receives maximum sunlight during day. Heavy furniture should be placed in south or west side.

4. Kitchen Direction
Kitchen should ideally be in south-east corner (Agni corner). Person cooking should face east. Avoid placing kitchen in north-east or directly under bathroom.

5. Master Bedroom Position
Master bedroom should be in south-west corner of house. This corner is associated with stability and strength. Avoid master bedroom in north-east.

6. Children's Room
Children's rooms are best in west or north-west direction. Study desks should face east or north for better concentration.

7. Pooja Room
Pooja room should be in north-east direction. It should never be adjacent to bathroom or kitchen. Keep it clean and well-ventilated.

8. Staircase Location
Stairs should ideally be in south, west, or south-west portion. Avoid stairs in north-east or centre of house.

9. Toilet and Bathroom Placement
Bathrooms should be in west or north-west direction. Never place toilet in north-east, centre, or near pooja room. Ensure proper ventilation.

10. Open Space and Garden
Keep north and east sides relatively open with less construction. This allows positive energy to flow into house. Garden or plants in north-east enhance positivity.

Remember, Vastu is about harmony. At SBBT, our expert team can guide you on Vastu-compliant construction without compromising on modern design and functionality. We have built hundreds of Vastu-compliant homes across Delhi NCR.`,
    featured_image_url: "",
    author: "Ar. Priya Sharma",
    tags: "vastu, home construction, Delhi NCR, interior design, Vastu Shastra",
    meta_title: "10 Vastu Tips for New Home Construction in Delhi NCR | SBBT",
    meta_description: "Essential Vastu Shastra guidelines for your new home in Delhi NCR. Plot selection, room placement, kitchen direction, and more from SBBT experts.",
    is_published: true,
    display_order: 2,
  },
  {
    title: "Turnkey vs Custom Construction: Which is Better for Your Gurgaon Home?",
    slug: "turnkey-vs-custom-construction-gurgaon",
    excerpt: "Confused between turnkey and custom construction in Gurgaon? Compare costs, timelines, flexibility, and quality to make right choice.",
    content: `If you are planning to build home in Gurgaon, first big decision is: turnkey or custom construction? Each approach has its merits, and right choice depends on your priorities, budget, and involvement level.

What is Turnkey Construction?
Turnkey means you hand over entire project to single contractor or company like SBBT. They handle everything from design and approvals to construction and finishing. You get keys when it is done — just move in.

Pros of Turnkey:
- Single point of contact — no need to manage multiple vendors
- Fixed price contract — no budget surprises
- Faster completion — experienced team handles everything
- Quality assurance — one team responsible for end-to-end quality

Cons of Turnkey:
- Less flexibility in material and design choices
- Premium pricing compared to self-managed projects
- You rely entirely on contractor's expertise

What is Custom Construction?
Custom construction means you hire individual contractors for each stage — one for structural work, another for plumbing, third for finishing, etc. You manage everything yourself.

Pros of Custom:
- Full control over every material and design decision
- Potentially lower cost if managed well
- You can choose specialists for each trade

Cons of Custom:
- Time consuming — you need to be available daily
- Coordination between contractors is your headache
- Delays and quality issues common without proper supervision
- No single warranty — if something fails, who do you call?

Which One for Gurgaon?
In Gurgaon, we recommend turnkey for most homeowners because:
1. Gurgaon has strict building bylaws — turnkey companies know local rules
2. Labour management is complex — turnkey teams have established relationships
3. Material sourcing is easier with bulk purchasing power
4. Most homeowners do not have time or expertise to manage multiple contractors

At SBBT, we offer both turnkey packages (Essential, Premium, Luxury) and semi-custom options. Our custom build package lets you choose materials while we manage construction. Best of both worlds.

Final suggestion: If this is your first construction project, go turnkey. If you have experience and time, custom can work. Either way, get everything in writing.`,
    featured_image_url: "",
    author: "SBBT Construction Team",
    tags: "turnkey construction, custom construction, Gurgaon, home building guide",
    meta_title: "Turnkey vs Custom Construction in Gurgaon - Which is Better? | SBBT",
    meta_description: "Compare turnkey and custom construction for your Gurgaon home. Costs, timelines, flexibility, and quality — make right choice.",
    is_published: true,
    display_order: 3,
  },
  {
    title: "Essential Guide to RERA Registration for Home Buyers in UP",
    slug: "rera-registration-guide-up-home-buyers",
    excerpt: "Everything home buyers in Uttar Pradesh need to know about RERA registration. How to verify, what to check, and why it matters for your construction project.",
    content: `RERA (Real Estate Regulatory Authority) was established to protect home buyers. If you are building home in Uttar Pradesh (Noida, Greater Noida, Ghaziabad, etc.), understanding RERA is essential.

What is RERA?
RERA is regulatory act that ensures transparency in real estate transactions. Builders must register their projects with RERA before advertising or selling. For individual home construction, rules work differently.

Do You Need RERA for Individual House Construction?
If you are building house on your own plot (not buying from a developer), RERA registration is not required for construction itself. However, your builder or contractor should be RERA-compliant if they are in business of constructing multiple units.

Why RERA Matters for Your Home Construction
1. Project Registration - Any real estate project with more than 8 units or land area over 500 sq m must be RERA registered.
2. Escrow Account - Builders must deposit 70% of money into separate escrow account.
3. Timely Possession - RERA mandates timely possession with interest for delays.
4. Standardized Agreement - Builder cannot include unfair terms.
5. Defect Liability - Builders must fix structural defects for 5 years.

How to Verify RERA Registration in UP
1. Visit UP RERA website: up-rera.in
2. Click on 'Registered Projects'
3. Search by builder name, project name, or RERA number
4. Check project status and any complaints

Red Flags to Watch
- Builder refusing to share RERA number
- Multiple complaints on RERA portal
- Delayed possession without valid reasons

At SBBT, we are RERA-compliant for all registered projects. For individual home construction, we follow RERA principles of transparency, timely completion, and quality assurance.`,
    featured_image_url: "",
    author: "Legal Team at SBBT",
    tags: "RERA, legal, UP, home buyer, property registration",
    meta_title: "RERA Registration Guide for Home Buyers in UP | SBBT",
    meta_description: "Complete guide to RERA registration for home buyers in Uttar Pradesh. How to verify, what to check, and why it matters for your construction.",
    is_published: true,
    display_order: 4,
  },
  {
    title: "Best Construction Materials for Delhi NCR Weather Conditions",
    slug: "best-construction-materials-delhi-ncr-weather",
    excerpt: "From extreme summers to chilly winters, Delhi NCR demands specific construction materials. Expert recommendations for durable, weather-resistant homes.",
    content: `Delhi NCR experiences extreme weather — scorching summers up to 45°C, chilly winters dropping to 4°C, and monsoon humidity. Your home construction materials must withstand all this.

1. Cement — UltraTech or Ambuja OPC 53 grade for columns and beams, PPC for general construction.
2. Steel — TATA Tiscon Fe-550D for earthquake resistance, JSW as alternative.
3. Bricks — Fly ash bricks (8x4x16 inches) superior to traditional clay bricks.
4. Concrete — Ready-mix concrete (RMC) from UltraTech, ACC, or L&T.
5. Waterproofing — Fosroc or Dr. Fixit for terrace and bathroom.
6. Paint — Asian Paints Apex Ultima or Berger WeatherCoat for exteriors.
7. Tiles — Kajaria vitrified tiles for flooring, Somany for walls.
8. Windows — uPVC profiles from Fenesta or AIS Window.
9. Sanitaryware — Jaquar or Hindware, CPVC pipes from Astral or Supreme.
10. Electrical — Havells or Legrand modular switches and MCBs.

Using right materials for each component ensures your home stays comfortable in all seasons. At SBBT, we use only branded materials from authorized dealers with detailed specification sheet.`,
    featured_image_url: "",
    author: "SBBT Construction Team",
    tags: "construction materials, Delhi NCR, building tips, weather resistant, home construction",
    meta_title: "Best Construction Materials for Delhi NCR Weather | SBBT Guide",
    meta_description: "Expert recommendations for construction materials that withstand Delhi NCR extreme weather. Cement, steel, bricks, paint, tiles, and more.",
    is_published: true,
    display_order: 5,
  },
  {
    title: "Step-by-Step Home Construction Process in Ghaziabad",
    slug: "home-construction-process-ghaziabad-step-by-step",
    excerpt: "Complete step-by-step guide to building home in Ghaziabad. From plot selection to handover, understand each phase with timelines and costs.",
    content: `Building home in Ghaziabad involves multiple stages. Here is complete step-by-step process from plot to possession.

Phase 1: Planning and Design (1-2 months)
- Site visit and soil testing
- Architectural design and floor plan
- Structural engineering and GDA approval
- Cost estimation and material selection

Phase 2: Foundation Work (1-1.5 months)
- Excavation for footings, PCC laying, reinforcement, and column casting

Phase 3: Superstructure (3-4 months)
- Column and beam casting, slab work, brickwork, door/window frames

Phase 4: Roof and Terrace (2-3 weeks)
- Waterproofing, insulation, parapet walls, drainage slope

Phase 5: Electrical and Plumbing (1-2 months)
- Concealed wiring, plumbing pipes, drainage connections

Phase 6: Finishing Work (2-3 months)
- Plastering, flooring, tiling, POP ceiling, painting, woodwork

Phase 7: Fixtures and Handover (2-4 weeks)
- Sanitary fittings, electrical fixtures, kitchen, cleaning

Total Timeline: 10-14 months for standard 2-3 floor house in Ghaziabad.

Key permissions: GDA building plan approval, fire NOC (for higher floors), water/sewer connections.

At SBBT, we handle all approvals and coordinate with GDA on your behalf. Completed over 50 projects in Ghaziabad.`,
    featured_image_url: "",
    author: "SBBT Construction Team",
    tags: "home construction process, Ghaziabad, step by step guide, construction timeline",
    meta_title: "Step-by-Step Home Construction Process in Ghaziabad | SBBT",
    meta_description: "Complete guide to building home in Ghaziabad from plot to handover. Timelines, costs, permissions, and quality checks for each phase.",
    is_published: true,
    display_order: 6,
  },
  {
    title: "Rooftop Garden Design Ideas for Your Faridabad Home",
    slug: "rooftop-garden-design-ideas-faridabad",
    excerpt: "Transform your Faridabad home's rooftop into beautiful garden. Design tips, plant selection, waterproofing, and cost guidelines.",
    content: `Faridabad homes often have spacious rooftops that remain unused. Transform yours into a beautiful, functional garden.

Why a Rooftop Garden?
- Reduces heat absorption (cooler home)
- Improves air quality
- Provides fresh vegetables and herbs
- Creates relaxing outdoor space
- Increases property value

Step 1: Check structural load capacity (150-300 kg per sq m)
Step 2: Waterproofing with Fosroc or Dr. Fixit, root barrier membrane
Step 3: Choose plants for Faridabad climate — Bougainvillea, Hibiscus, Tomato, Chilli, Mint, Tulsi
Step 4: Layout — container garden, raised beds, vertical garden, or mixed
Step 5: Drip irrigation with proper drainage slope
Step 6: Weather-resistant furniture — teak wood, wrought iron

Cost for 500 sq ft garden in Faridabad: ₹1,05,000 to ₹2,20,000 depending on materials and plants.

Maintenance: Water early morning, use organic fertilizers, prune regularly, check waterproofing annually before monsoon.

SBBT can handle complete rooftop garden setup including waterproofing, planters, and irrigation.`,
    featured_image_url: "",
    author: "SBBT Design Team",
    tags: "rooftop garden, Faridabad, garden design, home improvement, landscaping",
    meta_title: "Rooftop Garden Design Ideas for Faridabad Home | SBBT",
    meta_description: "Beautiful rooftop garden designs for Faridabad homes. Plant selection, waterproofing, cost breakdown, and maintenance tips.",
    is_published: true,
    display_order: 7,
  },
  {
    title: "Why Home Inspections Matter Before Buying a Resale Property in Delhi",
    slug: "home-inspection-resale-property-delhi",
    excerpt: "Don't buy resale property in Delhi without professional home inspection. Hidden defects can cost lakhs. Here is what to check before investing.",
    content: `Buying resale property in Delhi can be a great deal — or costly mistake. Professional home inspection can save you from hidden defects.

What a Professional Home Inspection Covers:
1. Structural Integrity — cracks, column/beam condition, slab sagging
2. Water Damage — terrace waterproofing, bathroom leakage, damp patches
3. Electrical Systems — wiring age, load capacity, earthing
4. Plumbing — pipe material, water pressure, drainage
5. Termite Damage — woodwork, wall cavities, roof structure
6. Legal — sale deed, property tax, encumbrance certificate

Cost of Home Inspection in Delhi: ₹5,000 to ₹15,000

Common issues found:
- Damp walls (60% occurrence, ₹20k-50k repair)
- Old wiring (45%, ₹30k-80k)
- Plumbing leaks (40%, ₹15k-40k)
- Roof seepage (35%, ₹25k-60k)
- Termite damage (20%, ₹30k-1L)

SBBT Tip: Before final payment, get structural engineer's report for properties over 15 years old. Verify all renovation approvals from DDA or MCD.`,
    featured_image_url: "",
    author: "SBBT Technical Team",
    tags: "home inspection, resale property, Delhi, property buying, renovation",
    meta_title: "Home Inspection Guide for Resale Property in Delhi | SBBT",
    meta_description: "Professional home inspection checklist for resale properties in Delhi. Hidden defects, costs, and what to check before buying.",
    is_published: true,
    display_order: 8,
  },
  {
    title: "Modular Kitchen Design Trends 2026 for Indian Homes",
    slug: "modular-kitchen-design-trends-2026",
    excerpt: "Latest modular kitchen design trends for Indian homes in 2026. Smart storage, handleless designs, multi-tasking islands, and budget-friendly ideas.",
    content: `Heart of every Indian home is kitchen. In 2026, modular kitchens are more popular than ever.

1. Handleless Kitchens — Push-to-open mechanisms, J-pull profiles, cleaner look
2. Smart Storage — Magic corners, tall pantry units, pull-out baskets, cutlery organizers
3. Multi-Tasking Islands — Built-in sink, hob, and breakfast counter
4. Two-Tone Combinations — White + wood, navy + brass, sage + white
5. Quartz Countertops — Non-porous, stain-resistant, matte or leathered finish
6. Integrated Appliances — Built-in ovens, dishwashers, mandatory chimneys
7. Open Shelving — Glass-front cabinets for display
8. Easy-Clean Materials — Waterproof MDF/HDF, stainless steel backsplash

Cost Guide for Delhi NCR (2026):
- Straight kitchen (6 ft): ₹60k-1L
- L-shaped (8x8 ft): ₹1.2L-2L
- U-shaped (10x10 ft): ₹2L-3.5L
- Island kitchen: ₹3L-6L

At SBBT, we include modular kitchen in Premium and Luxury packages. Upgrade options available for any package.`,
    featured_image_url: "",
    author: "SBBT Design Team",
    tags: "modular kitchen, kitchen design, 2026 trends, Indian home, interior design",
    meta_title: "Modular Kitchen Design Trends 2026 for Indian Homes | SBBT",
    meta_description: "Top modular kitchen trends for Indian homes in 2026. Handleless designs, smart storage, quartz countertops, and budget-friendly ideas.",
    is_published: true,
    display_order: 9,
  },
  {
    title: "Plumbing and Electrical Layout Guide for Greater Noida Homes",
    slug: "plumbing-electrical-layout-guide-greater-noida",
    excerpt: "Get your plumbing and electrical layout right in Greater Noida. Expert tips on concealed wiring, pipe grade, switch placement, and load calculation.",
    content: `Plumbing and electrical are nervous system of your home. Here is comprehensive guide for Greater Noida homes.

Electrical Layout:
1. Load Calculation — 5-8 kW for standard 3 BHK
2. Wire Gauge — 1.5 sq mm for lighting, 2.5 sq mm for sockets, 4 sq mm for AC/geyser, 6 sq mm for main supply
3. Switch Placement — Main switch near entrance, bedroom switches both sides of bed, kitchen above counter
4. Points per Room — Living: 8-10, Bedroom: 6-8, Kitchen: 10-12, Bathroom: 2-3
5. Safety — ELCB or RCCB mandatory

Plumbing Layout:
1. Pipe Material — CPVC for hot water, UPVC/CPVC for cold, SWR for drainage. Never use GI pipes.
2. Bathroom — Concealed tanks, 45° slope for drainage, floor trap with water seal
3. Kitchen — Hot/cold water, separate drain, RO provision, grease trap
4. Terrace — Rainwater downpipe, overflow pipe, garden tap
5. Water Tank — 500-750L for 2-3 members, 1000-1500L for 4-5 members

Common Mistakes: Running electrical and plumbing in same chase, substandard MCBs, insufficient drainage slope.`,
    featured_image_url: "",
    author: "SBBT Technical Team",
    tags: "plumbing, electrical, wiring, Greater Noida, home construction",
    meta_title: "Plumbing and Electrical Layout Guide for Greater Noida | SBBT",
    meta_description: "Expert guide for plumbing and electrical layout in Greater Noida homes. Wire gauge, switch placement, pipe material, and common mistakes.",
    is_published: true,
    display_order: 10,
  },
  {
    title: "Vastu Compliant Home Office Design for Work from Home in Noida",
    slug: "vastu-home-office-design-noida-work-from-home",
    excerpt: "Design a Vastu-compliant home office in Noida for productivity and positive energy. Desk placement, colours, lighting, and furniture tips.",
    content: `With work from home becoming permanent for many, a dedicated home office is essential.

Vastu Guidelines:
1. Best direction — North-east (Ishan) corner, or north for career growth
2. Desk placement — Face east or north, never sit with back to door
3. Colours — White/cream for walls, light green/blue for creativity
4. Lighting — Natural light from east/north windows, warm LED task lamp
5. Furniture — Wooden desk (rectangular), ergonomic chair, organized workspace

For Noida 3 BHK (1200-1400 sq ft): Convert one bedroom or use living room corner with sliding partition.

Essential Furniture: Ergonomic chair (₹8k-15k), desk (₹5k-12k), bookshelf (₹3k-8k), task lamp (₹2k-5k)

Tech: High-speed fibre broadband (Airtel/Jio), UPS backup, 4+ power points near desk.

Plants: Bamboo or snake plant in north-east for positive energy. Avoid cactus.

SBBT can help design and build your home office during construction with proper power, data cabling, and lighting.`,
    featured_image_url: "",
    author: "SBBT Design Team",
    tags: "home office, vastu, work from home, Noida, interior design",
    meta_title: "Vastu Compliant Home Office Design for Noida | SBBT",
    meta_description: "Design productive home office in Noida with Vastu guidelines. Desk placement, colours, lighting, furniture, and budget guide.",
    is_published: true,
    display_order: 11,
  },
  {
    title: "Renovation vs Demolition: What Should You Do with Your Old Delhi Property?",
    slug: "renovation-vs-demolition-old-delhi-property",
    excerpt: "Deciding between renovation and demolition for your old Delhi property? Compare costs, structural condition, approvals, and long-term value.",
    content: `If you own old property in Delhi, you face a tough decision: renovate or demolish and rebuild?

When to Renovate:
- Structure is sound (no major cracks in columns/beams/foundation)
- Layout works for your needs
- Budget is limited and you want faster results
- Property has heritage or sentimental value
Average renovation cost: ₹800-₹1,200 per sq ft

When to Demolish and Rebuild:
- Structure over 30-40 years with weak foundation
- Want completely different layout or additional floors
- Existing building doesn't meet current codes
- Long-term maintenance cost is high
New construction cost: ₹1,800-₹3,500 per sq ft

Key Factors:
1. Structural Assessment — Most important. Test column/beam condition, foundation quality, concrete carbonation.
2. Approvals — Renovation needs MCD approval for major changes. Demolition permit takes 2-3 months.
3. Long-Term Value — Rebuilding in prime Delhi locations adds 30-50% higher resale value.

Our Recommendation: Good location + sound structure = Renovate. Prime location + old building = Rebuild.`,
    featured_image_url: "",
    author: "SBBT Construction Team",
    tags: "renovation, demolition, Delhi, property, old house, rebuild",
    meta_title: "Renovation vs Demolition for Old Delhi Properties | SBBT",
    meta_description: "Should you renovate or demolish your old Delhi property? Compare costs, structural condition, approvals, and long-term value.",
    is_published: true,
    display_order: 12,
  },
  {
    title: "Smart Home Automation Guide for Independent Houses in Noida",
    slug: "smart-home-automation-independent-houses-noida",
    excerpt: "Complete guide to home automation for Noida independent houses. Smart lighting, security, climate control, and voice control systems explained.",
    content: `Smart home automation is becoming standard in new homes. Here is how to automate your independent house in Noida.

1. Smart Lighting — Motion sensors, dimming controls, remote/app control, scheduling. Brands: Philips Hue, Wipro Smart.
2. Smart Security — Video door phone, motion sensors, smart locks (fingerprint/code), CCTV, smoke/gas detectors. Brands: Godrej, Yale, CP Plus.
3. Climate Control — AC control via app, smart fans, automated curtains, temperature sensors. Brands: Sensibo.
4. Voice Control — Amazon Alexa or Google Home for lights, fans, AC, curtains.
5. Smart Entertainment — Multi-room audio, home theatre automation.

Cost for Independent House:
- Smart lighting: ₹50k-1L (basic), ₹2L-5L (premium)
- Security: ₹30k-60k (basic), ₹1L-2.5L (premium)
- Climate control: ₹20k-40k (basic), ₹60k-1.5L (premium)
- Voice control: ₹5k-15k (basic), ₹30k-60k (premium)

Important Tips: Plan during construction (concealed wiring). Choose open protocol devices. Reliable mesh WiFi. Run extra CAT6 cables. Start simple.

SBBT Premium and Luxury packages include home automation provision.`,
    featured_image_url: "",
    author: "SBBT Construction Team",
    tags: "home automation, smart home, Noida, independent house, technology",
    meta_title: "Smart Home Automation Guide for Independent Houses in Noida | SBBT",
    meta_description: "Complete guide to home automation for Noida independent houses. Smart lighting, security, climate control, and voice control systems.",
    is_published: true,
    display_order: 13,
  },
  {
    title: "How to Choose the Right Paint Colours for Your Home in Delhi NCR",
    slug: "choose-right-paint-colours-home-delhi-ncr",
    excerpt: "Expert guide to choosing paint colours for your Delhi NCR home. Consider lighting, room size, and climate for perfect colour palette.",
    content: `Paint colours can transform your home. Here is how to choose right colours for Delhi NCR homes.

Consider Delhi NCR Climate:
- Hot summers (up to 45°C): Light colours reflect heat. Whites, creams, pastels keep rooms cooler.
- Dust: Avoid very light colours that show dust easily. Eggshell and satin finishes are practical.
- Monsoon humidity: Use mould-resistant paints in bathrooms and kitchens.

Room-by-Room Guide:
Living Room — Warm neutrals (beige, warm grey, off-white) with accent wall in deep blue or terracotta.
Bedroom — Calming colours: Light blue, sage green, lavender. Avoid reds and bright oranges.
Kitchen — Bright and clean: White, pale yellow, light grey. Easy-clean matt finish.
Bathroom — Cool colours: Aqua, light grey, white. Use waterproof paint.
Kids Room — Fun colours: Mint green, peach, light yellow with chalkboard accent wall.

Popular Brands: Asian Paints (Royale Play for texture, Apcolite for exteriors), Berger (WeatherCoat for exteriors, Luxor for interiors).
Budget: ₹15-₹30 per sq ft for good quality paint with primer.

Colour Psychology:
- Blue: Calming, good for bedrooms
- Green: Natural, good for living areas
- Yellow: Energetic, good for kitchen/dining
- Grey: Modern, good for contemporary homes

SBBT provides colour consultation as part of our interior design service.`,
    featured_image_url: "",
    author: "SBBT Design Team",
    tags: "paint colours, interior design, Delhi NCR, home decoration, colour guide",
    meta_title: "How to Choose Paint Colours for Your Delhi NCR Home | SBBT",
    meta_description: "Expert guide to choosing paint colours for Delhi NCR homes. Room-by-room recommendations, climate considerations, and colour psychology tips.",
    is_published: true,
    display_order: 14,
  },
  {
    title: "Waterproofing Guide for Delhi NCR Homes: Protect Your Investment",
    slug: "waterproofing-guide-delhi-ncr-homes",
    excerpt: "Essential waterproofing guide for Delhi NCR homes. Terrace, bathroom, basement, and wall waterproofing solutions to protect your property.",
    content: `Waterproofing is critical for Delhi NCR homes due to extreme weather conditions. Here is complete guide.

Why Waterproofing Matters:
- Delhi NCR receives 800mm annual rainfall
- Temperature swings cause expansion and contraction
- Groundwater seepage in many areas
- Protects structural integrity and prevents health issues (dampness, mould)

Terrace Waterproofing:
Best method: Liquid applied polyurethane (PU) membrane or cementitious waterproofing.
Brands: Fosroc Nitocote, Dr. Fixit LW+, Sika.
Cost: ₹60-₹120 per sq ft.
Tip: Apply root barrier if planning rooftop garden.

Bathroom Waterproofing:
Best method: Polymer-modified cementitious coating with waterstop at joints.
Minimum height: 6 feet on all walls, full floor coverage.
Cost: ₹50-₹80 per sq ft.
Tip: Test with water ponding for 48 hours before tiling.

Basement Waterproofing:
Best method: External tanking with bentonite membrane or internal cementitious coating.
Cost: ₹100-₹200 per sq ft.
Critical: Proper drainage system around foundation.

Wall Waterproofing:
Exterior walls: Silicone-based water repellent or cementitious coating.
Cost: ₹30-₹60 per sq ft.
Tip: Fix any cracks in walls before applying waterproofing.

SBBT ensures all waterproofing meets IS standards with minimum 5-year warranty.`,
    featured_image_url: "",
    author: "SBBT Technical Team",
    tags: "waterproofing, Delhi NCR, terrace, bathroom, basement, home protection",
    meta_title: "Waterproofing Guide for Delhi NCR Homes | SBBT",
    meta_description: "Essential waterproofing guide for Delhi NCR homes. Terrace, bathroom, basement, and wall solutions to protect your property investment.",
    is_published: true,
    display_order: 15,
  },
  {
    title: "Bathroom Renovation Cost Guide for Delhi Homes in 2026",
    slug: "bathroom-renovation-cost-guide-delhi-2026",
    excerpt: "Complete bathroom renovation cost guide for Delhi homes in 2026. Budget breakdown, material choices, and design trends for modern bathrooms.",
    content: `Bathroom renovation can transform your daily experience. Here is cost guide for Delhi homes in 2026.

Standard Bathroom (4x6 ft, approx 24 sq ft):
Basic renovation (tiles, fittings, paint): ₹40,000-₹60,000
Moderate upgrade (new fixtures, vanity, lighting): ₹60,000-₹1,00,000
Premium renovation (designer tiles, premium fittings, glass enclosure): ₹1,00,000-₹2,00,000

Cost Breakdown (for moderate upgrade):
- Tiles (wall and floor): ₹15,000-₹25,000
- Sanitaryware (WC, basin, faucets): ₹12,000-₹25,000
- Plumbing fittings and labour: ₹10,000-₹15,000
- Electrical (lights, fan, geyser point): ₹5,000-₹10,000
- Painting and waterproofing: ₹5,000-₹10,000
- Vanity and storage: ₹8,000-₹15,000
- Miscellaneous (grout, sealants, hardware): ₹5,000-₹10,000

2026 Design Trends:
- Large format tiles (600x1200mm) with fewer grout lines
- Matte finish tiles (easier to maintain)
- Wall-mounted WC and vanity (easier cleaning)
- Rainfall showerheads with hand shower
- LED mirrors with anti-fog feature
- Heated towel rails (gaining popularity)

Popular Brands: Hindware, Jaquar, Kajaria, Somany, Cera.

SBBT can handle complete bathroom renovation within 2-3 weeks with warranty.`,
    featured_image_url: "",
    author: "SBBT Design Team",
    tags: "bathroom renovation, cost guide, Delhi, home renovation, interior design",
    meta_title: "Bathroom Renovation Cost Guide for Delhi Homes 2026 | SBBT",
    meta_description: "Complete bathroom renovation cost guide for Delhi homes in 2026. Budget breakdown, design trends, and material recommendations.",
    is_published: true,
    display_order: 16,
  },
  {
    title: "Top 10 Questions to Ask Your Builder Before Starting Construction",
    slug: "questions-ask-builder-before-construction",
    excerpt: "Essential questions to ask your builder in Delhi NCR before construction begins. Protect yourself from delays, hidden costs, and quality issues.",
    content: `Choosing the right builder is critical for your home construction. Here are 10 essential questions to ask.

1. Are you registered and RERA-compliant?
Verify company registration, GST, and RERA registration for projects. Ask for registration numbers.

2. Can I see your previous projects?
Visit at least 3 completed projects and 1 ongoing site. Talk to previous clients independently.

3. What is your estimated timeline and have you completed projects on time?
Ask for timeline with milestones. Check if previous projects were delivered on time.

4. What is included in your quotation?
Get detailed line-item quotation. Ask what is NOT included (extras add up fast).

5. What brands and specifications do you use?
Insist on brand names and specifications for cement, steel, tiles, paint, plumbing, electrical.

6. How do you handle changes during construction?
The Change Order process should be in writing. Get rate card for common changes.

7. What warranty do you offer?
Industry standard: 5 years for structural defects, 2 years for finishing work.

8. Who manages my project daily?
Meet your project manager. How often will you get updates? Weekly meetings?

9. What is your payment schedule?
Standard: Linked to milestones (foundation, slab, brickwork, finishing). Never pay more than 20% upfront.

10. What happens if there are delays?
Liquidated damages clause in contract. Typically 0.5% of contract value per week of delay.

At SBBT, we provide transparent answers to all questions, detailed contracts, and regular project updates through our dashboard.`,
    featured_image_url: "",
    author: "SBBT Construction Team",
    tags: "builder questions, construction guide, home building, contractor, Delhi NCR",
    meta_title: "10 Questions to Ask Your Builder Before Construction | SBBT",
    meta_description: "Essential questions to ask your builder in Delhi NCR before starting home construction. Protect from delays, hidden costs, and quality issues.",
    is_published: true,
    display_order: 17,
  },
  {
    title: "Home Loan Guide for Construction in Noida: Interest Rates and Tips 2026",
    slug: "home-loan-construction-noida-2026",
    excerpt: "Complete guide to home construction loans in Noida for 2026. Interest rates, eligibility, documents, and tips to get best deal.",
    content: `Building your home in Noida? Here is complete guide to construction loans in 2026.

Types of Construction Loans:
1. Home Construction Loan — Disbursed in stages as construction progresses
2. Home Improvement Loan — For renovation or extension
3. Home Extension Loan — For adding floors or rooms

Current Interest Rates (2026):
- SBI: 8.50% - 9.50%
- HDFC: 8.65% - 9.75%
- ICICI: 8.75% - 9.85%
- Axis Bank: 8.70% - 9.80%
- LIC Housing: 8.60% - 9.70%

Eligibility Criteria:
- Age: 21-65 years
- Income: Minimum ₹25,000/month for salaried, ₹3 Lakh/year for self-employed
- Credit Score: 700+ preferred
- Property: Clear title in Noida/Greater Noida
- DTI Ratio: Maximum 50% of monthly income

Documents Required:
- Identity proof (Aadhaar, PAN)
- Address proof
- Income proof (salary slips, IT returns, bank statements)
- Property documents (sale deed, approved plan, NOC)
- Construction cost estimate from builder/contractor

Tips to Get Best Deal:
1. Compare interest rates from 4-5 banks
2. Negotiate processing fees (can be waived)
3. Choose floating rate for current falling rate cycle
4. Link loan to savings account for 0.05% discount
5. Opt for longer tenure (lower EMI) with prepayment option

Important: Noida loans require approved building plan from Noida Authority. SBBT can help with plan approval process.`,
    featured_image_url: "",
    author: "SBBT Financial Team",
    tags: "home loan, construction loan, Noida, interest rates, finance, 2026",
    meta_title: "Home Loan Guide for Construction in Noida 2026 | SBBT",
    meta_description: "Complete guide to home construction loans in Noida for 2026. Interest rates, eligibility, documents, and tips to get the best deal.",
    is_published: true,
    display_order: 18,
  },
  {
    title: "Monsoon Construction Tips: How to Build in Rainy Season in Delhi NCR",
    slug: "monsoon-construction-tips-delhi-ncr",
    excerpt: "Expert tips for continuing construction during monsoon in Delhi NCR. Protect materials, manage timelines, and ensure quality during rainy season.",
    content: `Monsoon in Delhi NCR (July-September) brings construction challenges. Here are expert tips to continue building safely.

Can You Build During Monsoon?
Yes, but with precautions. Some work (like concreting and painting) needs careful planning. Earthwork and foundation are best done in dry season.

Tips for Each Phase:
1. Foundation Work — Avoid if possible. If must do, use dewatering pumps for groundwater. Compact soil properly before casting.

2. Concreting — Use plasticizers to reduce water. Cover fresh concrete with plastic sheets for 7 days curing. Use quick-setting cement if needed.

3. Brickwork — Cover walls with plastic at end of day. Use fly ash bricks (less water absorption). Allow proper drying before plaster.

4. Plastering — Avoid external plaster during rain. Internal plaster is fine if building is covered. Use waterproof plaster additives.

5. Electrical Work — Keep all materials indoors. Use weatherproof junction boxes. Ensure proper earthing for lightning protection.

6. Painting — Avoid exterior painting in monsoon. For interior, ensure walls are completely dry (moisture meter reading below 12%).

Material Protection:
- Cement: Store on raised platform, cover with plastic
- Steel: Cover with tarpaulin, use slightly rusted bars (after cleaning)
- Wood: Store in ventilated covered area
- Paint/chemicals: Keep in original sealed containers

Timeline Adjustment: Expect 30-50% slower progress during monsoon months.

SBBT plans for monsoon delays in project timeline. Our monsoon-ready protocols ensure quality isn't compromised.`,
    featured_image_url: "",
    author: "SBBT Construction Team",
    tags: "monsoon construction, rainy season, Delhi NCR, building tips, project management",
    meta_title: "Monsoon Construction Tips for Delhi NCR | SBBT Guide",
    meta_description: "Expert tips for continuing construction during monsoon in Delhi NCR. Protect materials, manage timelines, and ensure quality during rainy season.",
    is_published: true,
    display_order: 19,
  },
  {
    title: "Construction Safety Checklist for Independent House Projects in UP",
    slug: "construction-safety-checklist-independent-house-up",
    excerpt: "Essential safety checklist for independent house construction in Uttar Pradesh. Worker safety, site security, and compliance with UP building regulations.",
    content: `Safety on construction site is non-negotiable. Here is comprehensive safety checklist for UP home construction.

Personal Protective Equipment (PPE):
- Helmets for all workers and visitors
- Safety shoes with steel toe
- Reflective vests for visibility
- Gloves for material handling
- Safety harness for work above 10 feet

Site Safety Measures:
1. Site perimeter fencing and warning signage
2. Covered walkways near buildings
3. Debris netting on scaffolding
4. Fire extinguishers near electrical panels
5. First aid kit with trained person
6. Adequate lighting for night work
7. Safe storage of flammable materials

Scaffolding Safety:
- Use MS pipes (not bamboo) for structures above 2 floors
- Cross-bracing at every level
- Guardrails on all open sides
- Base plates on firm ground
- Daily inspection before use

Electrical Safety:
- All wiring by licensed electrician
- RCCB/ELCB for all circuits
- Earth leakage protection for power tools
- Weatherproof connections outdoors
- No loose or dangling wires

Worker Welfare (UP Labour Laws):
- Weekly rest day
- Minimum wages as per UP government
- Accident insurance coverage
- Clean drinking water and toilets
- Proper accommodation for migrant workers

Legal Compliance:
- Building plan approval from development authority
- NOC from fire department (for higher floors)
- Labour license if workers > 50
- Form A and Form B registers

At SBBT, safety is our priority. We conduct weekly safety meetings and random site inspections.`,
    featured_image_url: "",
    author: "SBBT Safety Team",
    tags: "construction safety, checklist, UP, independent house, worker safety",
    meta_title: "Construction Safety Checklist for UP House Projects | SBBT",
    meta_description: "Essential safety checklist for independent house construction in Uttar Pradesh. PPE, scaffolding, electrical safety, and legal compliance.",
    is_published: true,
    display_order: 20,
  },
  // ========================================================================
  // HINGLISH BLOGS (10)
  // ========================================================================
  {
    title: "घर बनाने से पहले ज़रूर जान लें ये 5 बातें (Home Building Tips in Hinglish)",
    slug: "home-building-tips-hinglish",
    excerpt: "घर बनाने से पहले ये 5 ज़रूरी बातें जान लें। Budget, builder selection, material quality, और timeline के बारे में practical tips हिंग्लिश में।",
    content: `अपना घर बनाना एक बड़ा dream होता है। लेकिन इससे पहले कि आप construction शुरू करें, ये 5 बातें ज़रूर जान लें।

1. Budget तय करें और 15% extra रखें
जितना budget आपने सोचा है, उसमें 15% extra जोड़ें। हमेशा कुछ unexpected expenses आते हैं — municipal fees, soil testing, architect charges, temporary electricity. Better safe than sorry.

2. Builder को background check करें
किसी भी builder को hire करने से पहले उनके previous projects ज़रूर देखें। उनके पिछले clients से बात करें। Check their RERA registration. एक अच्छा builder आपको समय पर और quality के साथ project deliver करेगा।

3. Material quality पर समझौता न करें
Cement, steel, bricks — ये चीज़ें आपके घर की foundation हैं। UltraTech ya Ambuja cement लें। TATA Tiscon steel लें। Sasta material later में बहुत महंगा पड़ सकता है।

4. Written contract करें
Mouth agreement कभी काम नहीं करता। हर चीज़ written contract में होनी चाहिए — payment schedule, timeline, material specifications, warranty. और एक lawyer से contract check ज़रूर करवाएं।

5. Timeline में थोड़ा buffer रखें
Construction में हमेशा delays आते हैं — monsoon, labour issues, material supply. 10-12 month के project के लिए 14-15 month का buffer रखें।

ये 5 बातें ध्यान में रखेंगे तो आपका home building experience smooth रहेगा। SBBT आपके dream home को reality बनाने में मदद कर सकता है।`,
    featured_image_url: "",
    author: "SBBT Construction Team",
    tags: "home building tips, construction guide, Hinglish, budget, builder selection",
    meta_title: "5 Home Building Tips in Hinglish | SBBT",
    meta_description: "घर बनाने से पहले ये 5 important tips ज़रूर जानें। Budget, material, builder selection के बारे में practical advice हिंग्लिश में।",
    is_published: true,
    display_order: 21,
  },
  {
    title: "टर्नकी कंस्ट्रक्शन क्या है? और क्यों है ये आपके लिए बेस्ट? (Turnkey Construction Explained)",
    slug: "turnkey-construction-explained-hinglish",
    excerpt: "टर्नकी कंस्ट्रक्शन का मतलब क्या है? कैसे काम करता है और क्यों ये आम आदमी के लिए सबसे अच्छा option है। Hinglish में समझिए।",
    content: `टर्नकी कंस्ट्रक्शन एक ऐसा construction model है जिसमें आप सारी ज़िम्मेदारी एक कंपनी को दे देते हैं। वो कंपनी आपके लिए सब कुछ करती है — design से लेकर handover तक। आपको बस keys लेनी होती हैं।

कैसे काम करता है?
1. आप कंपनी को अपनी requirements बताते हैं
2. कंपनी design बनाती है और आपको approve करवाती है
3. Construction शुरू होता है — foundation से लेकर finishing तक
4. सारी permissions, material management, labour — कंपनी handle करती है
5. आपको समय पर quality home मिलता है

टर्नकी के फायदे:
- Single point of contact — एक ही कंपनी से बात करनी होती है
- Fixed price — budget में कोई surprise नहीं
- Time saving — एक्सपीरियंस्ड team तेज़ी से काम करती है
- Quality assurance — एक ही team पूरी quality की ज़िम्मेदार है
- No headache — आपको daily site पर जाने की ज़रूरत नहीं

टर्नकी के नुकसान:
- Material selection में कम flexibility
- थोड़ा premium pricing हो सकता है
- आपको contractor पर trust करना होता है

कब लेना चाहिए टर्नकी?
अगर आप पहली बार घर बना रहे हैं, या आपके पास time नहीं है daily site पर जाने का, या आप construction की बारीकियां नहीं जानते — तो टर्नकी आपके लिए best option है।

SBBT तीन टर्नकी packages offer करता है : Essential (₹1,799/sq ft), Premium (₹2,499/sq ft), और Luxury (₹3,299/sq ft). `,
    featured_image_url: "",
    author: "SBBT Construction Team",
    tags: "turnkey construction, Hinglish, construction guide, home building, contractor",
    meta_title: "Turnkey Construction Explained in Hinglish | SBBT",
    meta_description: "टर्नकी कंस्ट्रक्शन क्या है और कैसे काम करता है? समझिए हिंग्लिश में। फायदे, नुकसान, और किसके लिए है सबसे अच्छा।",
    is_published: true,
    display_order: 22,
  },
  {
    title: "नोएडा में घर बनवाने में कितना खर्च आता है 2026 में? (Noida Construction Cost)",
    slug: "noida-construction-cost-hinglish",
    excerpt: "नोएडा में 2026 में घर बनवाने में कितना खर्च आता है? Per sq ft rate, material cost, labour charges और hidden costs के बारे में पूरी जानकारी हिंग्लिश में।",
    content: `अगर आप नोएडा में घर बनवाने का सोच रहे हैं, तो 2026 में cost कुछ इस तरह है।

Basic construction (RCC frame, brickwork, plaster): ₹1,200-₹1,500/sq ft
Flooring और tiling: ₹150-₹300/sq ft
Electrical और plumbing: ₹100-₹200/sq ft
Painting: ₹50-₹100/sq ft
Woodwork और carpentry: ₹100-₹200/sq ft
Kitchen और bathroom: ₹100-₹150/sq ft
Overheads (10-15%): extra

1500 sq ft के घर का total cost: ₹27 lakh से ₹45 lakh तक

Hidden costs जो अक्सर भूल जाते हैं:
- Soil testing: ₹10,000-₹20,000
- Architect fees: ₹20-₹40/sq ft
- Noida Authority approval: ₹2-₹5/sq ft
- Temporary electricity और water connection
- Labour insurance

पैसे बचाने के tips:
1. Oct-March में construction शुरू करें (less labour issues)
2. सामान bulk में खरीदें (Atta, Bhangel market से)
3. तीन contractors से quote लें और compare करें
4. Design बार-बार न बदलें — क्योंकि change expensive होता है

SBBT के packages ₹1,799/sq ft से शुरू हैं। Free site visit और quote के लिए contact करें।`,
    featured_image_url: "",
    author: "SBBT Construction Team",
    tags: "construction cost, Noida, Hinglish, budget, home building 2026",
    meta_title: "Noida Construction Cost 2026 in Hinglish | SBBT",
    meta_description: "नोएडा में 2026 में घर बनवाने में कितना खर्च आता है? Per sq ft rate, hidden costs, और money-saving tips हिंग्लिश में।",
    is_published: true,
    display_order: 23,
  },
  {
    title: "वास्तु शास्त्र के हिसाब से घर का डिज़ाइन कैसे बनवाएं? (Vastu Compliant Home Design)",
    slug: "vastu-compliant-home-design-hinglish",
    excerpt: "वास्तु शास्त्र के rules के according घर का design कैसे बनवाएं। Kitchen, bedroom, pooja room की direction के बारे में complete guide हिंग्लिश में।",
    content: `वास्तु शास्त्र सिर्फ अंधविश्वास नहीं है। ये आपके घर को प्राकृतिक elements के साथ align करता है ताकि आपको health, prosperity और peace मिले।

5 Important Vastu Rules:

1. Main Entrance — North-East face सबसे अच्छा होता है। East और North entry भी good है।

2. Kitchen — South-East corner में होना चाहिए (Agni corner). खाना बनाते समय face East की तरफ होना चाहिए।

3. Master Bedroom — South-West corner में बनाएं। ये corner stability के लिए जाना जाता है।

4. Pooja Room — North-East direction में बनाएं। Bathroom या kitchen के adjacent न हो।

5. Stairs — South, West या South-West में होनी चाहिए। North-East या घर के बीच में stairs न बनाएं।

Colours:
- Living Room: Light colours like beige, cream, light yellow
- Bedroom: Light blue, green, pink
- Avoid dark colours like black या deep red in bedrooms

Tips for Noida/Ghaziabad homes:
- North और East side को relatively open रखें
- Proper ventilation और natural light के लिए windows की सही placement करें
- Plants और garden North-East में positivity बढ़ाते हैं

SBBT के expert team Vastu-compliant construction में guide कर सकते हैं। आधुनिक design और Vastu दोनों को balance करना हमारी specialty है।`,
    featured_image_url: "",
    author: "Ar. Priya Sharma",
    tags: "vastu shastra, home design, Hinglish, architecture, Vastu tips",
    meta_title: "Vastu Compliant Home Design in Hinglish | SBBT",
    meta_description: "वास्तु शास्त्र के हिसाब से घर का design कैसे होना चाहिए? Kitchen, bedroom, pooja room की direction के बारे में complete guide हिंग्लिश में।",
    is_published: true,
    display_order: 24,
  },
  {
    title: "अपने घर के लिए सही कंस्ट्रक्शन कंपनी कैसे चुनें? (How to Choose Construction Company)",
    slug: "choose-construction-company-hinglish",
    excerpt: "सही कंस्ट्रक्शन कंपनी चुनना आपके dream home के लिए सबसे important decision है। कैसे चुनें, क्या check करें — पूरी guide हिंग्लिश में।",
    content: `सही construction company चुनना आपके dream home के लिए सबसे important फैसला है। यहां बताए गए steps follow करेंगे तो आपको सही कंपनी मिलेगी।

1. Experience Check करें
कितने सालों से business में हैं। कितने projects complete किए हैं। कम से कम 5 साल का experience होना चाहिए।

2. Previous Projects देखें
कम से कम 3 completed projects ज़रूर देखें। Ongoing site पर visit करें। Previous clients से बात करें।

3. RERA Registration Verify करें
RERA registration है या नहीं। Registration number लेकर UP RERA website पर verify करें।

4. Quotation Compare करें
कम से कम 3 companies से quotation लें। सिर्फ total cost न देखें — line items compare करें। क्या included है और क्या excluded — ये ज़रूर check करें।

5. Contract ध्यान से पढ़ें
Payment schedule, timeline, material specifications, warranty — सब contract में होना चाहिए। एक lawyer से contract check करवाएं।

Red Flags जिनसे बचें:
- बहुत कम price quote करने वाली company (quality से समझौता होगा)
- कोई written contract न देने वाली company
- Previous clients के references न देने वाली company
- RERA registration न हो

6. Warranty और After-Sales Service
कम से कम 5 years structural warranty और 2 years finishing warranty होनी चाहिए। After-sales service कैसे मिलेगी — ये भी पता करें।

SBBT में हम transparent pricing, written contract, और regular project updates देते हैं। 10+ years का experience और 100+ happy customers।`,
    featured_image_url: "",
    author: "SBBT Construction Team",
    tags: "construction company, Hinglish, how to choose, contractor, home building",
    meta_title: "How to Choose Construction Company in Hinglish | SBBT",
    meta_description: "सही कंस्ट्रक्शन कंपनी कैसे चुनें? Experience, RERA, quotation, contract — पूरी guide हिंग्लिश में। Red flags से बचने के tips।",
    is_published: true,
    display_order: 25,
  },
  {
    title: "गर्मियों में घर को ठंडा रखने के 10 आसान तरीके (Summer Home Cooling Tips)",
    slug: "summer-home-cooling-tips-hinglish",
    excerpt: "Delhi NCR की गर्मियों में घर को ठंडा रखने के 10 effective और affordable तरीके। बिना AC के भी घर को cool कैसे रखें — practical tips हिंग्लिश में।",
    content: `Delhi NCR में गर्मियों में temperature 45°C तक पहुंच जाता है। यहां 10 तरीके बताए गए हैं जिनसे आप अपने घर को ठंडा रख सकते हैं — बिना ज़्यादा बिजली खर्च किए।

1. Windows पर sun control film लगवाएं
ये 70% तक heat reflect करती है। AC का load कम होता है और बिजली का bill भी कम आता है।

2. Light coloured paint use करें
White, cream, light yellow — ये colors heat reflect करते हैं। Dark colors heat absorb करते हैं।

3. Terrace को cool करें
Terrace पर white reflective paint लगवाएं। या फिर terrace garden बनाएं — plants से natural cooling मिलती है।

4. Cross ventilation बनाए रखें
Opposite walls पर windows हों तो air flow अच्छा रहता है। Night time में windows खोलकर रखें।

5. Curtains और blinds use करें
Heavy curtains दिन में heat को अंदर आने से रोकते हैं। Blackout curtains सबसे effective हैं।

6. Indoor plants रखें
Snake plant, aloe vera, areca palm — ये plants air purify करते हैं और room को cool रखते हैं।

7. Cool roof technology
Terrace पर cool roof tiles या reflective paint लगवाएं। इससे indoor temperature 3-5°C तक कम हो सकता है।

8. Proper insulation
Walls और roof में insulation से heat transfer कम होता है। ये construction के समय करवाना सबसे अच्छा है।

9. Exhaust fans use करें
Kitchen और bathroom से hot air बाहर निकालने के लिए exhaust fans लगाएं।

10. Trees और plants लगाएं
घर के आसपास पेड़ लगाने से natural shade मिलती है। West side पर लगाए गए पेड़ सबसे effective हैं।

SBBT अपने Premium और Luxury packages में thermal insulation और cool roof features include करता है।`,
    featured_image_url: "",
    author: "SBBT Design Team",
    tags: "summer cooling, home tips, Hinglish, Delhi NCR, energy saving",
    meta_title: "10 Summer Home Cooling Tips in Hinglish | SBBT",
    meta_description: "Delhi NCR गर्मियों में घर को ठंडा रखने के 10 affordable तरीके। बिना AC के भी cooling के practical tips हिंग्लिश में।",
    is_published: true,
    display_order: 26,
  },
  {
    title: "प्लॉट खरीदने से पहले ये 8 documents ज़रूर चेक करें (Plot Buying Documents Guide)",
    slug: "plot-buying-documents-hinglish",
    excerpt: "प्लॉट खरीदने से पहले ये 8 ज़रूरी documents check करें। Sale deed, mutation, khata, Encumbrance certificate — समझिए हिंग्लिश में क्या होते हैं ये।",
    content: `प्लॉट खरीदना एक बड़ा investment है। लेकिन सही documents check कर लें तो future में legal problems से बच सकते हैं। यहां 8 ज़रूरी documents हैं जो आपको check करने चाहिए।

1. Sale Deed
सबसे important document। Original sale deed देखें। Seller का नाम इसी deed में होना चाहिए। Registry कहां हुई — sub-registrar office में।

2. Mutation
जमीन revenue records में किसके नाम पर है — ये mutation से पता चलता है। Tehsildar के office से mutation certificate लें।

3. Khata Certificate
ये document बताता है कि प्लॉट किस revenue village में आता है और कितनी area है।

4. Encumbrance Certificate (EC)
पिछले 30 साल का EC लें। ये बताता है कि property पर कोई loan, mortgage, या legal dispute तो नहीं है।

5. Approved Layout Plan
Development authority (Noida Authority, GDA, etc.) से approved layout plan होना चाहिए। Plot का use residential या commercial — ये check करें।

6. Land Use Certificate
Zoning plan के according plot residential zone में है या नहीं। गलत zone में घर बनाने पर demolition का risk होता है।

7. Tax Receipts
Property tax के latest receipts देखें। बकाया tax seller को clear करना होगा।

8. NOC से Society या Cooperative
अगर plot किसी society या cooperative में है तो उनसे NOC लें। Transfer fee और other charges के बारे में पता करें।

Additional Check:
- Aadhaar और PAN card seller का match करें
- Property photos लें और site visit करें
- एक अच्छे lawyer से documents check करवाएं

SBBT legal team आपके plot documents की free check कर सकती है।`,
    featured_image_url: "",
    author: "SBBT Legal Team",
    tags: "plot buying, documents, Hinglish, property, legal, land purchase",
    meta_title: "8 Plot Buying Documents in Hinglish | SBBT",
    meta_description: "प्लॉट खरीदने से पहले ये 8 documents check करें। Sale deed, mutation, khata, EC — समझिए हिंग्लिश में। Legal problems से बचें।",
    is_published: true,
    display_order: 27,
  },
  {
    title: "गाज़ियाबाद में घर बनवाने का स्टेप-बाय-स्टेप प्रोसेस (Ghaziabad Home Building Process)",
    slug: "ghaziabad-home-building-process-hinglish",
    excerpt: "गाज़ियाबाद में घर बनवाने का complete process — plot selection से handover तक। Permissions, approvals, और timelines के बारे में practical guide हिंग्लिश में।",
    content: `गाज़ियाबाद में घर बनवाने का complete process यहां step-by-step समझिए।

Phase 1: Planning (1-2 months)
- Plot की papers check करें
- Soil testing करवाएं
- Architect से design बनवाएं
- GDA (Ghaziabad Development Authority) से plan approval लें
- Construction cost estimate बनवाएं

Phase 2: Foundation (1-1.5 months)
- Site clearing और marking
- Excavation और PCC laying
- Reinforcement और column casting
- Foundation filling

Phase 3: Superstructure (3-4 months)
- Column और beam casting
- Slab work floor by floor
- Brickwork
- Doors और windows frames

Phase 4: Roof & Terrace (2-3 weeks)
- Waterproofing
- Parapet wall
- Drainage slope

Phase 5: Electrical & Plumbing (1-2 months)
- Concealed wiring
- Plumbing pipes
- Drainage connection

Phase 6: Finishing (2-3 months)
- Plaster, flooring, tiling
- POP ceiling, painting
- Woodwork, kitchen

Phase 7: Handover (2-4 weeks)
- Sanitary fittings, lights
- Final cleaning
- All documents handover

Total time: 10-14 months

Permissions for Ghaziabad:
- GDA building plan approval (ज़रूरी)
- Fire NOC (higher floors के लिए)
- Water और sewer connection approval

SBBT सभी approvals GDA से करवाती है और आपको regular project updates देती है।`,
    featured_image_url: "",
    author: "SBBT Construction Team",
    tags: "Ghaziabad, home building, Hinglish, construction process, GDA approval",
    meta_title: "Ghaziabad Home Building Process in Hinglish | SBBT",
    meta_description: "गाज़ियाबाद में घर बनवाने का step-by-step process। Permissions, timelines, और costs के बारे में practical guide हिंग्लिश में।",
    is_published: true,
    display_order: 28,
  },
  {
    title: "गुड़गांव में फ्लैट vs इंडिपेंडेंट हाउस — क्या है बेहतर? (Flat vs Independent House Gurgaon)",
    slug: "flat-vs-independent-house-gurgaon-hinglish",
    excerpt: "गुड़गांव में रहने के लिए फ्लैट बेहतर या इंडिपेंडेंट हाउस? Cost, maintenance, security, और lifestyle के हिसाब से compare — समझिए हिंग्लिश में।",
    content: `गुड़गांव में घर लेने का सोच रहे हैं तो सबसे पहला सवाल — फ्लैट लें या इंडिपेंडेंट हाउस? दोनों के अपने फायदे और नुकसान हैं। यहां compare किया गया है।

Flat के फायदे:
- सस्ता (₹50-80 लाख for 2-3 BHK)
- Maintenance free — society handle करती है
- Security — gated society, 24/7 security
- Amenities — pool, gym, park, clubhouse
- Easy loan availability

Flat के नुकसान:
- Limited space (आप अपने हिसाब से design नहीं कर सकते)
- Monthly maintenance fees (₹3,000-₹8,000)
- Parking issues
- Neighbour issues (noise, etc.)

Independent House के फायदे:
- ज़्यादा space और privacy
- अपने हिसाब से design कर सकते हैं
- कोई monthly maintenance नहीं
- Parking की कोई problem नहीं
- Future में floors add कर सकते हैं

Independent House के नुकसान:
- महंगा (₹1-3 crore for 1500-2500 sq ft plot)
- खुद maintenance करना होता है
- Security खुद arrange करनी होती है
- Approvals खुद लेने होते हैं

Cost Comparison in Gurgaon 2026:
- 3 BHK flat (1500 sq ft): ₹75 lakh - ₹1.2 crore
- 3 BHK independent house (200 sq yd plot): ₹1.5 - ₹2.5 crore

किसके लिए क्या बेहतर:
- Young professionals और small family: Flat better
- Joint family या growing family: Independent house better
- Low maintenance चाहिए: Flat
- Privacy और freedom चाहिए: Independent house

SBBT गुड़गांव में independent house construction करती है। हमारे turnkey packages में सब कुछ शामिल है — design, approvals, construction।`,
    featured_image_url: "",
    author: "SBBT Construction Team",
    tags: "flat vs house, Gurgaon, Hinglish, property comparison, real estate",
    meta_title: "Flat vs Independent House Gurgaon in Hinglish | SBBT",
    meta_description: "गुड़गांव में फ्लैट या इंडिपेंडेंट हाउस — क्या है बेहतर? Cost, maintenance, privacy, और lifestyle के हिसाब से complete comparison हिंग्लिश में।",
    is_published: true,
    display_order: 29,
  },
  {
    title: "दिल्ली में पुराने घर की रेनोवेशन — कितना खर्च और कितना समय? (Delhi Home Renovation Cost)",
    slug: "delhi-home-renovation-cost-hinglish",
    excerpt: "दिल्ली में पुराने घर की renovation में कितना खर्च आता है? Kitchen, bathroom, flooring, painting के costs और timeline के बारे में practical guide हिंग्लिश में।",
    content: `दिल्ली में पुराने घर की renovation कराना एक smart decision हो सकता है — बशर्ते structure मज़बूत हो। यहां renovation costs और timelines के बारे में detail में बताया गया है।

Complete Home Renovation Costs (per sq ft):
- Basic (painting, flooring, minor fixes): ₹800-₹1,000/sq ft
- Moderate (kitchen, bathroom, electrical upgrade): ₹1,000-₹1,500/sq ft
- Premium (structural changes, new design, premium materials): ₹1,500-₹2,500/sq ft

Room-wise Costs (for 1000 sq ft home):
- Painting (whole house): ₹40,000-₹70,000
- Flooring replacement (tiles/wood): ₹50,000-₹1,00,000
- Kitchen renovation (modular): ₹60,000-₹1,50,000
- Bathroom renovation (2 bathrooms): ₹80,000-₹1,50,000
- Electrical upgrade: ₹30,000-₹60,000
- Plumbing upgrade: ₹25,000-₹50,000
- Wardrobes and storage: ₹40,000-₹1,00,000

Timelines:
- Basic renovation: 4-6 weeks
- Moderate renovation: 8-12 weeks
- Full home renovation: 12-16 weeks

परमिट की ज़रूरत:
- Minor changes (painting, flooring): कोई permit नहीं
- Structural changes (wall removal, extension): MCD से approval लेना होगा

Tips for Delhi Home Renovation:
1. Asbestos sheets को हटाने से पहले expert से सलाह लें
2. Old wiring को पूरी तरह बदलें (fire risk)
3. Waterproofing पर ध्यान दें (Delhi की monsoon के लिए)
4. Vastu को ध्यान में रखकर ही design बदलें
5. Budget में 15% contingency रखें

SBBT दिल्ली में renovation services provide करती है। Free site inspection और quotation के लिए contact करें।`,
    featured_image_url: "",
    author: "SBBT Construction Team",
    tags: "home renovation, Delhi, Hinglish, cost guide, renovation tips",
    meta_title: "Delhi Home Renovation Cost in Hinglish | SBBT",
    meta_description: "दिल्ली में पुराने घर की renovation में कितना खर्च और समय लगता है? Kitchen, bathroom, flooring, painting के costs हिंग्लिश में।",
    is_published: true,
    display_order: 30,
  },
];

async function seed() {
  console.log("🔨 Starting blogs seed (base columns only — compatible with migration 063).\n");

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
    console.log("✅ Admin signed in successfully.\n");
  }

  console.log("🗑️ Clearing existing blogs...");
  const { error: deleteError } = await supabase
    .from("cms_blogs")
    .delete()
    .neq("id", 0);

  if (deleteError) {
    console.error("❌ Error clearing blogs:", deleteError.message);
    process.exit(1);
  }
  console.log("✅ Existing blogs cleared.\n");

  let successCount = 0;
  let errorCount = 0;

  for (const blog of blogs) {
    const { error } = await supabase
      .from("cms_blogs")
      .insert({
        site_id: SITE_ID,
        ...blog,
      });

    if (error) {
      console.error(`❌ Error inserting blog "${blog.title}":`, error.message);
      errorCount++;
    } else {
      console.log(`✅ Inserted: ${(blog.title as string).substring(0, 60)}...`);
      successCount++;
    }
  }

  console.log(`\n📊 Summary: ${successCount} blogs inserted, ${errorCount} errors`);

  if (errorCount > 0) {
    console.log("\n⚠️ Some blogs failed to insert. Check errors above.");
  }

  console.log("\n🎉 Blogs seed complete!");

  // Show count
  const { count } = await supabase
    .from("cms_blogs")
    .select("*", { count: "exact", head: true });
  console.log(`\n📊 Total blogs in database: ${count}`);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});