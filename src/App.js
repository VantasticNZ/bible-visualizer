import React, { useEffect, useMemo, useRef, useState } from "react";
// Single-file React app (CRA compatible)
// Professional visualizer for contradictions, scientific issues, world religions, global counts, legal cases.
// New in this update:
// • Religions view: expandable subgroups + **core tenets** shown per tradition (incl. LDS, FLDS, Satanism, etc.)
// • World map with a **year slider** to visualize distribution over time (minimal d3-geo grid + country centroids)
// • Science view: added **History & Policy Impacts** where religion slowed or opposed scientific/humanist progress (historical summaries)
// • Legal cases: seed dataset structure included (generic examples) + import/export remains
// • Network: nodes clamped, zoom/pan; Matrix: rich filters; All views read-only (non-editable)
// Tip: run `npm install d3` for network and `npm install d3-geo` (already part of d3 v7) no extra needed.

/* ============================== APP ============================== */
export default function App() {
  const [view, setView] = useState("network");
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <TopBar view={view} setView={setView} />
      <main className="max-w-7xl mx-auto p-4 space-y-4">
        {view === "network" && <NetworkView />}
        {view === "matrix" && <MatrixView />}
        {view === "immorality" && <ImmoralityView />}
        {view === "science" && <ScienceView />}
        {view === "religions" && <ReligionsView />}
        {view === "global" && <GlobalCountsView />}
        {view === "legal" && <LegalCasesView />}
      </main>
      <Footer />
    </div>
  );
}

function TopBar({ view, setView }) {
  const tabs = [
    { id: "network", label: "Contradictions Network" },
    { id: "matrix", label: "Matrix" },
    { id: "immorality", label: "Immorality" },
    { id: "science", label: "Science" },
    { id: "religions", label: "Religions" },
    { id: "global", label: "Global Counts" },
    { id: "legal", label: "Legal Cases" }
  ];
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Religious Text Visualizer</h1>
        <nav className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={
                "px-3 py-1.5 rounded-full text-sm border transition " +
                (view === t.id
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white hover:bg-slate-100 border-slate-300")
              }
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Card({ title, children, right }) {
  return (
    <section className="bg-white border rounded-xl shadow-sm">
      <div className="px-4 py-3 border-b flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="text-xs text-slate-500 max-w-7xl mx-auto px-4 pb-6">
      <div className="mt-2">
        Import/Export buttons accept JSON or CSV where noted. Network view requires d3 (npm install d3).
      </div>
    </footer>
  );
}

/* ============================== DATA ============================== */
// Contradictions schema:
// { id, topic, verseA:{ref,book,canon}, verseB:{ref,book,canon}, summary, detail }
const CONTRADICTIONS_SEED = [
  {
    id: "c1",
    topic: "Creation order",
    verseA: { ref: "Genesis 1:24-27", book: "Genesis", canon: "Bible" },
    verseB: { ref: "Genesis 2:18-19", book: "Genesis", canon: "Bible" },
    summary: "Genesis 1 places humans after animals, Genesis 2 reads as man before animals.",
    detail:
      "Genesis 1 presents a structured sequence culminating in mankind after animals. Genesis 2 narrates man formed, then animals formed and brought to him. Harmonizations appeal to Hebrew aspect (had formed), but the plain order differs."
  },
  {
    id: "c2",
    topic: "Seeing God",
    verseA: { ref: "Exodus 33:20", book: "Exodus", canon: "Bible" },
    verseB: { ref: "Genesis 32:30", book: "Genesis", canon: "Bible" },
    summary: "No one can see God and live vs Jacob says he saw God face to face.",
    detail:
      "Exodus 33:20 says no man can see God's face and live; Genesis 32:30 has Jacob naming the place Peniel because he saw God face to face and lived. Explanations cite theophany vs unveiled glory; read literally, there is tension."
  },
  {
    id: "c3",
    topic: "Death of Judas",
    verseA: { ref: "Matthew 27:5", book: "Matthew", canon: "Bible" },
    verseB: { ref: "Acts 1:18", book: "Acts", canon: "Bible" },
    summary: "Judas hanged himself vs he fell and burst open; field bought by priests vs by Judas.",
    detail:
      "Matthew says Judas hanged himself and the priests bought the field. Acts says Judas bought a field and fell headlong, bursting open. Harmonizations point to rope breaking or legal title; the accounts diverge."
  },
  {
    id: "c4",
    topic: "Resurrection witnesses",
    verseA: { ref: "Mark 16:1-8", book: "Mark", canon: "Bible" },
    verseB: { ref: "Matthew 28:1-10", book: "Matthew", canon: "Bible" },
    summary: "Who came, what they saw, and whether they told anyone differ.",
    detail:
      "Mark (earliest mss) ends with the women fleeing and telling no one for fear; Matthew has appearances and different angel scene. Harmonizations order events differently; summaries still differ."
  },
  {
    id: "c5",
    topic: "Census numbers",
    verseA: { ref: "2 Samuel 24:9", book: "2 Samuel", canon: "Bible" },
    verseB: { ref: "1 Chronicles 21:5", book: "1 Chronicles", canon: "Bible" },
    summary: "Different totals for Israel and Judah.",
    detail:
      "Samuel gives ~800k Israel + 500k Judah; Chronicles gives 1.1M Israel + 470k Judah. Some cite rounding or exclusions; raw totals don't match."
  },
  {
    id: "c6",
    topic: "God's nature: change or no change",
    verseA: { ref: "Malachi 3:6", book: "Malachi", canon: "Bible" },
    verseB: { ref: "Exodus 32:14", book: "Exodus", canon: "Bible" },
    summary: "God does not change vs God relents.",
    detail:
      "Malachi states God does not change; Exodus depicts God relenting after Moses intercedes. Some argue anthropopathic language; narratives differ."
  },
  {
    id: "c7",
    topic: "Faith vs works",
    verseA: { ref: "James 2:24", book: "James", canon: "Bible" },
    verseB: { ref: "Romans 3:28", book: "Romans", canon: "Bible" },
    summary: "Justified by works and not by faith alone vs justified by faith apart from works.",
    detail:
      "James emphasizes living faith evidenced by works; Paul stresses justification apart from works of the Law. Harmonizations distinguish kinds of works; wording pulls in opposite directions."
  },
  {
    id: "c8",
    topic: "BoM vs Bible: salvation and law",
    verseA: { ref: "2 Nephi 25:23", book: "2 Nephi", canon: "BoM" },
    verseB: { ref: "Ephesians 2:8-9", book: "Ephesians", canon: "Bible" },
    summary: "By grace... after all we can do vs by grace through faith, not of works.",
    detail:
      "2 Nephi is read by some as adding a works component; Ephesians stresses grace through faith not by works. LDS exegesis sees reliance on Christ after our efforts; critics see tension with Paul."
  }
];

function getExtendedSampleContradictions() {
  const more = [
    { id: "c9", topic: "Who incited David?", verseA: { ref: "2 Samuel 24:1", book: "2 Samuel", canon: "Bible" }, verseB: { ref: "1 Chronicles 21:1", book: "1 Chronicles", canon: "Bible" }, summary: "The LORD vs Satan incited David to number Israel.", detail: "Parallel accounts attribute incitement differently. Chronicles reinterprets earlier text." },
    { id: "c10", topic: "Women at the tomb", verseA: { ref: "John 20:1-2", book: "John", canon: "Bible" }, verseB: { ref: "Mark 16:1", book: "Mark", canon: "Bible" }, summary: "One woman vs several women.", detail: "John focuses on Mary; Synoptics list multiple. Harmonization: telescoping; surface differs." },
    { id: "c11", topic: "Genealogy of Jesus", verseA: { ref: "Matthew 1:1-16", book: "Matthew", canon: "Bible" }, verseB: { ref: "Luke 3:23-38", book: "Luke", canon: "Bible" }, summary: "Different lineages and counts.", detail: "Names and counts differ; proposals include legal vs biological lines or levirate marriage." },
    { id: "c12", topic: "Last words of Jesus", verseA: { ref: "Luke 23:46", book: "Luke", canon: "Bible" }, verseB: { ref: "John 19:30", book: "John", canon: "Bible" }, summary: "Different final sayings recorded.", detail: "Gospels report different sayings near death; harmonizations order them." },
    { id: "c13", topic: "God tempts?", verseA: { ref: "Genesis 22:1", book: "Genesis", canon: "Bible" }, verseB: { ref: "James 1:13", book: "James", canon: "Bible" }, summary: "God tested Abraham vs God tempts no one.", detail: "Different senses of test/tempt; English conflates terms." },
    { id: "c14", topic: "Who killed Goliath?", verseA: { ref: "1 Samuel 17:50", book: "1 Samuel", canon: "Bible" }, verseB: { ref: "2 Samuel 21:19", book: "2 Samuel", canon: "Bible" }, summary: "David vs Elhanan (textual issue).", detail: "MT reads Elhanan killed Goliath; many translations note 'Goliath's brother'." },
    { id: "c15", topic: "God repents?", verseA: { ref: "Numbers 23:19", book: "Numbers", canon: "Bible" }, verseB: { ref: "Genesis 6:6", book: "Genesis", canon: "Bible" }, summary: "God not a man to repent vs God repented he made man.", detail: "Anthropopathism vs immutable depiction." },
    { id: "c16", topic: "BoM steel/horses", verseA: { ref: "1 Nephi 4:9; Enos 1:21", book: "1 Nephi/Enos", canon: "BoM" }, verseB: { ref: "-", book: "-", canon: "Bible" }, summary: "Old World items in New World timeline.", detail: "Archaeology debates; LDS apologists propose alternate IDs." }
  ];
  return CONTRADICTIONS_SEED.concat(more);
}

// Immorality dataset
// { id, category, ref, canon: "Bible"|"BoM", commanded: boolean, estCount: number|null, note }
const IMMORALITY_SEED = [
  { id: "m1", category: "Killing by God", ref: "Genesis 7:21-23 (Flood)", canon: "Bible", commanded: true, estCount: null, note: "Global flood narrative describes near-total loss of life." },
  { id: "m2", category: "Genocide", ref: "Deuteronomy 20:16-18", canon: "Bible", commanded: true, estCount: null, note: "Cities of the Canaanites devoted to destruction." },
  { id: "m3", category: "Slavery", ref: "Leviticus 25:44-46", canon: "Bible", commanded: true, estCount: null, note: "Rules allowing acquisition of slaves." },
  { id: "m4", category: "Rape", ref: "Deuteronomy 22:28-29", canon: "Bible", commanded: true, estCount: null, note: "Law widely criticized as unjust to the victim." },
  { id: "m5", category: "Patricide/Filicide (attempt)", ref: "Genesis 22:2 (test)", canon: "Bible", commanded: true, estCount: 1, note: "Abraham commanded to offer Isaac; halted before completion." },
  { id: "m6", category: "Killing by God", ref: "Acts 5:1-10", canon: "Bible", commanded: true, estCount: 2, note: "Ananias and Sapphira struck dead after deceit." },
  { id: "m7", category: "Genocide", ref: "1 Samuel 15:3", canon: "Bible", commanded: true, estCount: null, note: "Amalekites to be destroyed including infants." },
  { id: "m8", category: "Violence", ref: "Ether 15 (civil war)", canon: "BoM", commanded: false, estCount: null, note: "Book of Mormon depicts massive casualties in civil conflict." }
];

// Science items (illustrative)
const SCIENCE_ITEMS = [
  {
    id: "s1",
    story: "Noah's Ark and global flood",
    refs: ["Genesis 6-9"],
    summary: "Global deluge and a wooden ark housing all animal kinds for ~1 year.",
    mechanisms: {
      laws: [
        "Structural limits of large wooden ships",
        "Population genetics and inbreeding",
        "Fluid dynamics and salinity of marine ecosystems"
      ],
      why: [
        "Timber hulls beyond ~100–120 m suffer hogging/sagging without metal bracing; ark dimensions approach failure for unbraced wood.",
        "Starting with pairs leads to extreme inbreeding depression and loss of heterozygosity not observed across many taxa.",
        "Mixing freshwater and saltwater plus heavy sediment load would kill many fish, corals, and invertebrates."
      ],
      observations: [
        "Ice cores, tree rings, and speleothems show continuous local records spanning >10k years with no global interruption.",
        "Global stratigraphy shows diverse depositional environments over long periods, not a single-year worldwide deposit."
      ]
    }
  },
  {
    id: "s2",
    story: "Joshua's long day",
    refs: ["Joshua 10:12-14"],
    summary: "Sun and moon stand still so battle can continue.",
    mechanisms: {
      laws: ["Conservation of angular momentum", "Inertial frames and atmospheric coupling"],
      why: [
        "Stopping Earth's rotation would require/release ~2.6e29 J, producing global devastation.",
        "Oceans and atmosphere would continue moving at hundreds of m/s relative to ground."
      ],
      observations: ["No synchronized global historical records of such an event from other civilizations."]
    }
  },
  {
    id: "s3",
    story: "Firmament or dome cosmology",
    refs: ["Genesis 1:6-8"],
    summary: "A solid dome holding back waters above with lights set in it.",
    mechanisms: {
      laws: ["Gas laws and gravity", "Astronomical distances"],
      why: [
        "Atmosphere is a compressible gas with pressure gradient explained by gravity; there is no solid dome.",
        "Stars are distant suns; a nearby dome contradicts parallax and observed spectra."
      ],
      observations: ["Satellites and spacecraft traverse space without encountering a dome."]
    }
  },
  {
    id: "s4",
    story: "Young Earth chronology (6–10k years)",
    refs: ["Genealogies; Ussher chronology"],
    summary: "Dating creation based on biblical genealogies.",
    mechanisms: {
      laws: ["Radioactive decay", "Speed of light", "Plate tectonics"],
      why: [
        "Radiometric systems (U-Pb, Ar-Ar, Rb-Sr) converge on ages ≫10k years.",
        "Light from galaxies millions of light-years away implies an old universe.",
        "Seafloor spreading and mountain building require deep time."
      ],
      observations: ["Ice cores with seasonal layers exceed 100k years; tree-ring series surpass 10k years."]
    }
  },
  {
    id: "s5",
    story: "Jonah in a great fish",
    refs: ["Jonah 1-2"],
    summary: "Human survives days inside a fish/whale.",
    mechanisms: {
      laws: ["Human physiology", "Gastric acidity", "Respiration"],
      why: [
        "Lack of breathable air and exposure to gastric acid would be lethal within minutes to hours.",
        "No known marine species has a chamber providing safe respiration and waste removal for days."
      ],
      observations: ["No verified analogous survivals exist; accounts are considered miraculous or symbolic by interpreters."]
    }
  }
];

/* ========================= RELIGION DATA (EXPANDED) ========================= */
// Each item may include: name, family, text, coreTenets[], adherentsM, countryShare{}, timeseries[], subgroups[]
const RELIGION_TREE = [
  {
    name: "Christianity",
    family: "Abrahamic",
    text: "Bible",
    coreTenets: ["Monotheism (Trinity)", "Incarnation of Jesus", "Salvation by grace/faith", "Resurrection"],
    adherentsM: 2400,
    countryShare: { USA: 230, Brazil: 180, Mexico: 125, Philippines: 110, Nigeria: 100, Russia: 60, DRCongo: 55, China: 45, India: 30, UK: 35, France: 40 },
    timeseries: [
      { year: 1900, adherentsM: 560 },
      { year: 1950, adherentsM: 900 },
      { year: 2000, adherentsM: 2000 },
      { year: 2020, adherentsM: 2300 },
      { year: 2030, adherentsM: 2400 }
    ],
    subgroups: [
      { name: "Catholic", adherentsM: 1300 },
      { name: "Protestant", adherentsM: 900 },
      { name: "Orthodox", adherentsM: 260 },
      { name: "Other", adherentsM: 40 }
    ]
  },
  {
    name: "Islam",
    family: "Abrahamic",
    text: "Quran",
    coreTenets: ["Tawhid (oneness of God)", "Prophethood of Muhammad", "Five Pillars", "Day of Judgment"],
    adherentsM: 1900,
    countryShare: { Indonesia: 230, Pakistan: 220, India: 200, Bangladesh: 160, Nigeria: 110, Egypt: 100, Iran: 85, Turkey: 80, Algeria: 45, SaudiArabia: 35 },
    timeseries: [
      { year: 1900, adherentsM: 200 },
      { year: 1950, adherentsM: 400 },
      { year: 2000, adherentsM: 1200 },
      { year: 2020, adherentsM: 1800 },
      { year: 2030, adherentsM: 1900 }
    ],
    subgroups: [
      { name: "Sunni", adherentsM: 1600 },
      { name: "Shia", adherentsM: 250 },
      { name: "Ibadi & other", adherentsM: 50 }
    ]
  },
  {
    name: "Hinduism",
    family: "Dharmic",
    text: "Vedas",
    coreTenets: ["Dharma", "Karma & Samsara", "Moksha", "Multiple deities/paths"],
    adherentsM: 1200,
    countryShare: { India: 1050, Nepal: 25, Bangladesh: 12, Pakistan: 4, Indonesia: 4, USA: 3, UK: 1.5 },
    timeseries: [
      { year: 1900, adherentsM: 200 },
      { year: 1950, adherentsM: 300 },
      { year: 2000, adherentsM: 900 },
      { year: 2020, adherentsM: 1150 },
      { year: 2030, adherentsM: 1200 }
    ],
    subgroups: [
      { name: "Vaishnavism", adherentsM: 600 },
      { name: "Shaivism", adherentsM: 300 },
      { name: "Shaktism", adherentsM: 100 },
      { name: "Smartism & others", adherentsM: 200 }
    ]
  },
  {
    name: "Buddhism",
    family: "Dharmic",
    text: "Tipitaka",
    coreTenets: ["Four Noble Truths", "Eightfold Path", "Anatta/Anicca/Dukkha"],
    adherentsM: 520,
    countryShare: { China: 250, Thailand: 60, Japan: 45, Myanmar: 40, SriLanka: 15, Vietnam: 45, SouthKorea: 12 },
    timeseries: [
      { year: 1900, adherentsM: 120 },
      { year: 1950, adherentsM: 150 },
      { year: 2000, adherentsM: 450 },
      { year: 2020, adherentsM: 510 },
      { year: 2030, adherentsM: 520 }
    ],
    subgroups: [
      { name: "Theravada", adherentsM: 150 },
      { name: "Mahayana", adherentsM: 300 },
      { name: "Vajrayana", adherentsM: 70 }
    ]
  },
  {
    name: "Sikhism",
    family: "Dharmic",
    text: "Guru Granth Sahib",
    coreTenets: ["One God", "Equality & Seva", "Guru teachings", "Kirat Karni, Vand Chhakna, Naam Japna"],
    adherentsM: 30,
    countryShare: { India: 22, UK: 1.5, Canada: 0.8 },
    timeseries: [
      { year: 1900, adherentsM: 2 },
      { year: 1950, adherentsM: 7 },
      { year: 2000, adherentsM: 23 },
      { year: 2020, adherentsM: 28 },
      { year: 2030, adherentsM: 30 }
    ],
    subgroups: []
  },
  {
    name: "Judaism",
    family: "Abrahamic",
    text: "Tanakh",
    coreTenets: ["Monotheism", "Torah observance (varies by stream)", "Covenant & peoplehood"],
    adherentsM: 15,
    countryShare: { Israel: 7, USA: 6 },
    timeseries: [
      { year: 1900, adherentsM: 12 },
      { year: 1950, adherentsM: 11 },
      { year: 2000, adherentsM: 13 },
      { year: 2020, adherentsM: 14.5 },
      { year: 2030, adherentsM: 15 }
    ],
    subgroups: [
      { name: "Orthodox", adherentsM: 2.5 },
      { name: "Conservative", adherentsM: 1.2 },
      { name: "Reform", adherentsM: 2.0 },
      { name: "Other", adherentsM: 9.3 }
    ]
  },
  {
    name: "Baha'i",
    family: "Abrahamic (post-Islamic)",
    text: "Bahá’í writings",
    coreTenets: ["Progressive revelation", "Unity of humanity", "Equality of men and women"],
    adherentsM: 7,
    countryShare: { India: 2, Iran: 0.3, USA: 0.2 },
    timeseries: [ { year: 1900, adherentsM: 0.1 }, { year: 1950, adherentsM: 0.5 }, { year: 2000, adherentsM: 5 }, { year: 2020, adherentsM: 7 } ],
    subgroups: []
  },
  {
    name: "Jainism",
    family: "Dharmic",
    text: "Agamas",
    coreTenets: ["Ahimsa (non-violence)", "Aparigraha", "Anekantavada"],
    adherentsM: 5,
    countryShare: { India: 4.5, USA: 0.1 },
    timeseries: [ { year: 1900, adherentsM: 2 }, { year: 1950, adherentsM: 3 }, { year: 2000, adherentsM: 4.2 }, { year: 2020, adherentsM: 4.8 } ],
    subgroups: []
  },
  {
    name: "Shinto",
    family: "East Asian",
    text: "Kojiki/Nihon Shoki",
    coreTenets: ["Kami veneration", "Purity rituals", "Harmony with nature"],
    adherentsM: 90,
    countryShare: { Japan: 80 },
    timeseries: [ { year: 1900, adherentsM: 40 }, { year: 1950, adherentsM: 60 }, { year: 2000, adherentsM: 80 }, { year: 2020, adherentsM: 90 } ],
    subgroups: []
  },
  {
    name: "Taoism",
    family: "East Asian",
    text: "Tao Te Ching & others",
    coreTenets: ["Dao (the Way)", "Wu-wei (non-forcing)", "Harmony of opposites"],
    adherentsM: 20,
    countryShare: { China: 15, Taiwan: 3 },
    timeseries: [ { year: 1900, adherentsM: 8 }, { year: 1950, adherentsM: 10 }, { year: 2000, adherentsM: 16 }, { year: 2020, adherentsM: 19 } ],
    subgroups: []
  },
  {
    name: "Latter-day Saint (LDS)",
    family: "Restorationist",
    text: "Bible & Book of Mormon",
    coreTenets: ["Restoration via Joseph Smith", "Additional scripture (BoM)", "Ordinances & priesthood"],
    adherentsM: 17,
    countryShare: { USA: 7, Mexico: 1.5, Brazil: 1.6, Philippines: 0.8 },
    timeseries: [ { year: 1900, adherentsM: 0.3 }, { year: 1950, adherentsM: 1.1 }, { year: 2000, adherentsM: 12 }, { year: 2020, adherentsM: 16.5 } ],
    subgroups: []
  },
  {
    name: "FLDS",
    family: "Restorationist",
    text: "Bible & Book of Mormon",
    coreTenets: ["Fundamentalist LDS offshoot", "Plural marriage (historic doctrine)", "Proph."] ,
    adherentsM: 0.1,
    countryShare: { USA: 0.09, Canada: 0.01 },
    timeseries: [ { year: 1950, adherentsM: 0.02 }, { year: 2000, adherentsM: 0.07 }, { year: 2020, adherentsM: 0.1 } ],
    subgroups: []
  },
  {
    name: "Satanism (various)",
    family: "New Religious Movements",
    text: "Satanic texts (e.g., LaVey); The Satanic Temple materials",
    coreTenets: ["LaVeyan: individualism & symbolic atheism", "TST: secular advocacy & seven tenets"],
    adherentsM: 0.2,
    countryShare: { USA: 0.1, UK: 0.02 },
    timeseries: [ { year: 1966, adherentsM: 0.01 }, { year: 2000, adherentsM: 0.05 }, { year: 2020, adherentsM: 0.2 } ],
    subgroups: [ { name: "LaVeyan", adherentsM: 0.1 }, { name: "The Satanic Temple", adherentsM: 0.1 } ]
  },
  { name: "Atheist", family: "Unaffiliated", text: "-", coreTenets: ["No deity"], adherentsM: 450, countryShare: { China: 200, Czechia: 6, Sweden: 4, Estonia: 0.9, UK: 10, USA: 25 }, timeseries: [ { year: 1900, adherentsM: 5 }, { year: 1950, adherentsM: 20 }, { year: 2000, adherentsM: 140 }, { year: 2020, adherentsM: 430 }, { year: 2030, adherentsM: 450 } ], subgroups: [] },
  { name: "Agnostic", family: "Unaffiliated", text: "-", coreTenets: ["Knowledge uncertain"], adherentsM: 600, countryShare: { China: 250, Japan: 50, UK: 20, Germany: 25, France: 25, USA: 60 }, timeseries: [ { year: 1900, adherentsM: 10 }, { year: 1950, adherentsM: 40 }, { year: 2000, adherentsM: 250 }, { year: 2020, adherentsM: 580 }, { year: 2030, adherentsM: 600 } ], subgroups: [] },
  { name: "Spiritual (not religious)", family: "Unaffiliated", text: "-", coreTenets: ["Personal spirituality"], adherentsM: 300, countryShare: { USA: 40, Brazil: 15, UK: 10, Australia: 6, Canada: 7 }, timeseries: [ { year: 1900, adherentsM: 5 }, { year: 1950, adherentsM: 8 }, { year: 2000, adherentsM: 120 }, { year: 2020, adherentsM: 280 }, { year: 2030, adherentsM: 300 } ], subgroups: [] },
  { name: "Jedi (self-identified)", family: "Novelty", text: "-", coreTenets: ["Pop-culture identity"], adherentsM: 0.5, countryShare: { UK: 0.17, Australia: 0.06, Canada: 0.02 }, timeseries: [ { year: 2000, adherentsM: 0.4 }, { year: 2010, adherentsM: 0.6 }, { year: 2020, adherentsM: 0.5 } ], subgroups: [] }
];

/* ========================= UTILS ========================= */
function aggregateCount(rows, key) {
  const out = {};
  rows.forEach((r) => {
    const k = r[key] || "?";
    out[k] = (out[k] || 0) + 1;
  });
  return out;
}
function mapToBarData(obj) {
  return Object.entries(obj).map(([label, value]) => ({ label, value }));
}
const BOOK_ORDER = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Songs","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi",
  "Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation",
  "1 Nephi","2 Nephi","Jacob","Enos","Jarom","Omni","Words of Mormon","Mosiah","Alma","Helaman","3 Nephi","4 Nephi","Mormon","Ether","Moroni"
];
function bookIndex(book) { const i = BOOK_ORDER.indexOf(book); return i >= 0 ? i : 9999; }
function relationOf(row) { const a = row.verseA.canon || "Bible"; const b = row.verseB.canon || "Bible"; return a === b ? a : "Cross"; }

/* ========================= CONTRADICTIONS NETWORK ========================= */
function NetworkView() {
  const [rows, setRows] = useState(CONTRADICTIONS_SEED);
  const [q, setQ] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [corpus, setCorpus] = useState("all"); // all | Bible | BoM | Cross
  const [timeline, setTimeline] = useState("all"); // all | OT | NT | BoM
  const [selected, setSelected] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [zoomState, setZoomState] = useState(1);

  const topics = useMemo(() => Array.from(new Set(rows.map((r) => r.topic))).sort(), [rows]);

  const filtered = useMemo(() => rows.filter((r) => {
    if (topicFilter !== "all" && r.topic !== topicFilter) return false;
    if (corpus !== "all") { const rel = relationOf(r); if (rel !== corpus) return false; }
    if (timeline !== "all") {
      const ai = bookIndex(r.verseA.book), bi = bookIndex(r.verseB.book);
      const inOT = ai < BOOK_ORDER.indexOf("Matthew") && bi < BOOK_ORDER.indexOf("Matthew");
      const inNT = ai >= BOOK_ORDER.indexOf("Matthew") && ai <= BOOK_ORDER.indexOf("Revelation") && bi >= BOOK_ORDER.indexOf("Matthew") && bi <= BOOK_ORDER.indexOf("Revelation");
      const inBoM = r.verseA.canon === "BoM" && r.verseB.canon === "BoM";
      if (timeline === "OT" && !inOT) return false;
      if (timeline === "NT" && !inNT) return false;
      if (timeline === "BoM" && !inBoM) return false;
    }
    if (!q) return true; const s = q.toLowerCase();
    return (
      r.topic.toLowerCase().includes(s) ||
      r.verseA.ref.toLowerCase().includes(s) ||
      r.verseB.ref.toLowerCase().includes(s) ||
      (r.summary || "").toLowerCase().includes(s) ||
      (r.detail || "").toLowerCase().includes(s)
    );
  }), [rows, topicFilter, corpus, timeline, q]);

  const ref = useRef(null);
  const gRef = useRef(null);
  const simRef = useRef(null);
  const zoomRef = useRef(null);

  function handleImportJson(e) {
    const f = e.target.files[0]; if (!f) return; const r = new FileReader();
    r.onload = (ev) => { try {
      const arr = JSON.parse(ev.target.result); if (!Array.isArray(arr)) throw new Error("JSON must be an array");
      const clean = arr.map((x, i) => ({ id: x.id || `imp_${i}`, topic: x.topic || "Uncategorized", verseA: x.verseA || { ref: "?", book: "?", canon: "Bible" }, verseB: x.verseB || { ref: "?", book: "?", canon: "Bible" }, summary: x.summary || "", detail: x.detail || "" }));
      setRows(clean); setSelected(null); alert("Imported " + clean.length + " rows.");
    } catch (err) { alert("Parse error: " + err.message); } };
    r.readAsText(f);
  }
  function handleExportJson() { const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "contradictions.filtered.json"; a.click(); URL.revokeObjectURL(url); }
  function loadExtended() { setRows(getExtendedSampleContradictions()); setSelected(null); }

  useEffect(() => {
    let cancelled = false;
    import("d3").then((d3) => {
      if (cancelled) return;
      const width = ref.current.clientWidth || 960;
      const height = 520;
      const margin = 24;
      const topicSet = Array.from(new Set(filtered.map((r) => r.topic)));
      const color = d3.scaleOrdinal(d3.schemeTableau10).domain(topicSet);

      const nodeMap = new Map();
      const links = [];
      filtered.forEach((row) => {
        if (!nodeMap.has(row.verseA.ref)) nodeMap.set(row.verseA.ref, { id: row.verseA.ref, topic: row.topic, row });
        if (!nodeMap.has(row.verseB.ref)) nodeMap.set(row.verseB.ref, { id: row.verseB.ref, topic: row.topic, row });
        links.push({ source: row.verseA.ref, target: row.verseB.ref, topic: row.topic, row });
      });
      const nodes = Array.from(nodeMap.values());

      const root = d3.select(ref.current);
      root.selectAll("svg").remove();
      const svg = root
        .append("svg")
        .attr("width", "100%")
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("overflow", "hidden");
      const g = svg.append("g");
      gRef.current = g;

      const zoom = d3
        .zoom()
        .scaleExtent([0.5, 3])
        .on("zoom", (ev) => {
          g.attr("transform", ev.transform);
          setZoomState(ev.transform.k);
        });
      svg.call(zoom);
      zoomRef.current = zoom;

      const sim = d3
        .forceSimulation(nodes)
        .force("link", d3.forceLink(links).id((d) => d.id).distance(140))
        .force("charge", d3.forceManyBody().strength(-320))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide(18));
      simRef.current = sim;

      const link = g
        .append("g")
        .attr("stroke", "#cbd5e1")
        .attr("stroke-opacity", 0.9)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", 1.4);
      link.append("title").text((d) => `${d.row.topic}
${d.row.verseA.ref} <-> ${d.row.verseB.ref}`);

      const drag = d3
        .drag()
        .on("start", (ev, d) => { if (!ev.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (ev, d) => { d.fx = Math.max(margin, Math.min(width - margin, ev.x)); d.fy = Math.max(margin, Math.min(height - margin, ev.y)); })
        .on("end", (ev, d) => { if (!ev.active) sim.alphaTarget(0); d.fx = null; d.fy = null; });

      const node = g
        .append("g")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .call(drag);
      node
        .append("circle")
        .attr("r", 12)
        .attr("fill", (d) => color(d.topic))
        .attr("stroke", "#0f172a")
        .attr("stroke-opacity", 0.1);
      node.append("text").text((d) => d.id).attr("x", 16).attr("y", 4).attr("font-size", 11);
      node.append("title").text((d) => `Topic: ${d.topic}
${d.id}`);
      node.on("click", (ev, d) => {
        const r = filtered.find((x) => x.verseA.ref === d.id || x.verseB.ref === d.id);
        if (r) setSelected(r);
      });

      function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
      sim.on("tick", () => {
        link
          .attr("x1", (d) => clamp(d.source.x, margin, width - margin))
          .attr("y1", (d) => clamp(d.source.y, margin, height - margin))
          .attr("x2", (d) => clamp(d.target.x, margin, width - margin))
          .attr("y2", (d) => clamp(d.target.y, margin, height - margin));
        node.attr("transform", (d) => `translate(${clamp(d.x, margin, width - margin)},${clamp(d.y, margin, height - margin)})`);
      });

      return () => sim.stop();
    }).catch((err) => setLoadError(err?.message || "Failed to load d3"));
    return () => {
      cancelled = true;
    };
  }, [filtered]);

  function zoomIn() { import("d3").then((d3) => { const svg = d3.select(ref.current).select("svg"); svg.transition().call(zoomRef.current.scaleBy, 1.2); }); }
  function zoomOut() { import("d3").then((d3) => { const svg = d3.select(ref.current).select("svg"); svg.transition().call(zoomRef.current.scaleBy, 1 / 1.2); }); }
  function zoomReset() { import("d3").then((d3) => { const svg = d3.select(ref.current).select("svg"); svg.transition().call(zoomRef.current.transform, d3.zoomIdentity); }); }

  return (
    <Card
      title="Contradictions Network"
      right={
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search topic or verse..." className="border rounded p-1" />
          <select value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)} className="border rounded p-1">
            <option value="all">All topics</option>
            {topics.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select value={corpus} onChange={(e) => setCorpus(e.target.value)} className="border rounded p-1">
            <option value="all">All corpora</option>
            <option value="Bible">Bible</option>
            <option value="BoM">Book of Mormon</option>
            <option value="Cross">Bible ↔ BoM</option>
          </select>
          <select value={timeline} onChange={(e) => setTimeline(e.target.value)} className="border rounded p-1">
            <option value="all">All timeline</option>
            <option value="OT">OT</option>
            <option value="NT">NT</option>
            <option value="BoM">BoM</option>
          </select>
          <input type="file" accept="application/json" onChange={handleImportJson} title="Import contradictions JSON" />
          <button onClick={handleExportJson} className="px-2 py-1 border rounded">Export</button>
          <button onClick={loadExtended} className="px-2 py-1 border rounded">Load Sample Extended</button>
          <InstallHint installed={!loadError} error={loadError} pkg="d3" />
        </div>
      }
    >
      <Legend topics={Array.from(new Set(filtered.map((r) => r.topic)))} />
      <div className="flex items-center gap-2 mb-2">
        <div className="text-xs text-s
