import React, { useEffect, useMemo, useRef, useState, createContext, useContext } from "react";
// Single-file React app (CRA compatible)
// Visualizer for contradictions, science issues, world religions, global counts, legal cases.
// CHANGE: Central data loading so *all* views (Network + Matrix + others) read the same loaded dataset,
// falling back to embedded seeds. Admin-only import is still available but does not edit the file.

/* ============================== EMBEDDED SEEDS (permanent) ============================== */
// These are always bundled so the app works even with no external JSON files present.
const CONTRADICTIONS_SEED = [
  { id: "c1", topic: "Creation order", verseA: { ref: "Genesis 1:24-27", book: "Genesis", canon: "Bible" }, verseB: { ref: "Genesis 2:18-19", book: "Genesis", canon: "Bible" }, summary: "Humans after animals vs man before animals.", detail: "Genesis 1 sequences animals→humans; Genesis 2 narrates man then animals brought to him." },
  { id: "c2", topic: "Seeing God", verseA: { ref: "Exodus 33:20", book: "Exodus", canon: "Bible" }, verseB: { ref: "Genesis 32:30", book: "Genesis", canon: "Bible" }, summary: "No one can see God and live vs Jacob saw God face to face.", detail: "Doctrinal statement vs theophany claim." },
  { id: "c3", topic: "God tempts vs does not", verseA: { ref: "Genesis 22:1", book: "Genesis", canon: "Bible" }, verseB: { ref: "James 1:13", book: "James", canon: "Bible" }, summary: "God tested/tempted Abraham vs God tempts no one.", detail: "Different authors, different theology of trials/temptation." },
  { id: "c4", topic: "Righteousness by faith vs works", verseA: { ref: "Romans 3:28", book: "Romans", canon: "Bible" }, verseB: { ref: "James 2:24", book: "James", canon: "Bible" }, summary: "Justified by faith apart from works vs justified by works and not faith alone.", detail: "Paul vs James emphasis and audience." },
  { id: "c5", topic: "Genealogies of Jesus", verseA: { ref: "Matthew 1:1-16", book: "Matthew", canon: "Bible" }, verseB: { ref: "Luke 3:23-38", book: "Luke", canon: "Bible" }, summary: "Different lineages from David to Joseph.", detail: "Names, counts, and path differ (Solomon vs Nathan)." },
  { id: "c6", topic: "The number of women at the tomb", verseA: { ref: "John 20:1", book: "John", canon: "Bible" }, verseB: { ref: "Matthew 28:1", book: "Matthew", canon: "Bible" }, summary: "Mary Magdalene alone vs multiple women.", detail: "Narrative scope differs among evangelists." },
  { id: "c7", topic: "The time of the crucifixion", verseA: { ref: "Mark 15:25", book: "Mark", canon: "Bible" }, verseB: { ref: "John 19:14", book: "John", canon: "Bible" }, summary: "Third hour vs about the sixth hour.", detail: "Different time reckonings/traditions." },
  { id: "c8", topic: "God relents vs never repents", verseA: { ref: "Exodus 32:14", book: "Exodus", canon: "Bible" }, verseB: { ref: "Numbers 23:19", book: "Numbers", canon: "Bible" }, summary: "God relented vs God does not repent/relent.", detail: "Narrative anthropopathism vs doctrinal statement." },
  { id: "c9", topic: "BoM: Skin color as a sign vs not", verseA: { ref: "2 Nephi 5:21", book: "2 Nephi", canon: "BoM" }, verseB: { ref: "2 Nephi 26:33", book: "2 Nephi", canon: "BoM" }, summary: "Cursing with skin vs all alike unto God.", detail: "Internal tension within Book of Mormon ethics." },
  { id: "c10", topic: "Cross-canon: Salvation by grace vs additional ordinances", verseA: { ref: "Ephesians 2:8-9", book: "Ephesians", canon: "Bible" }, verseB: { ref: "Moroni 10:32-33", book: "Moroni", canon: "BoM" }, summary: "Grace through faith vs grace after all we can do.", detail: "Interpretive and doctrinal divergence." }
];

const IMMORALITY_SEED = [
  { id: "m1", category: "Killing by God", ref: "Genesis 7:21-23 (Flood)", canon: "Bible", commanded: true, estCount: null, note: "Near-total loss of life in narrative." },
  { id: "m2", category: "Genocide", ref: "Deuteronomy 20:16-18", canon: "Bible", commanded: true, estCount: null, note: "Cities devoted to destruction." },
  { id: "m3", category: "Slavery regulation", ref: "Exodus 21", canon: "Bible", commanded: false, estCount: null, note: "Bondservitude allowances in law code." }
];

const SCIENCE_ITEMS = [
  { id: "s1", story: "Noah's Ark and global flood", refs: ["Genesis 6-9"], summary: "Deluge + wooden ark houses all kinds.", mechanisms: { laws: ["Ship structure limits", "Population genetics", "Marine salinity"], why: ["Large timber hulls require steel/composite bracing for oceanic stability.", "Small founder pairs cause inbreeding depression incompatible with observed diversity.", "Global fresh/salt mixing and sediment loads threaten marine ecosystems."], observations: ["Ice cores with annual layers continuous >100k years.", "Tree rings continuous >10k years in multiple regions.", "Global stratigraphy not a single-year deposit."] } },
  { id: "s2", story: "Joshua's long day", refs: ["Joshua 10:12-14"], summary: "Sun/Moon stand still.", mechanisms: { laws: ["Angular momentum", "Conservation of energy"], why: ["Stopping Earth's rotation releases ~2.6e29 J.", "Catastrophic inertial effects on oceans/atmosphere."], observations: ["No global synchronized historical records."] } },
  { id: "s3", story: "Geocentric language vs heliocentrism", refs: ["Psalm 93:1", "Eccl 1:5"], summary: "Immovable Earth phrasing.", mechanisms: { laws: ["Classical mechanics"], why: ["Earth rotates and orbits the sun."], observations: ["Foucault pendulum, Coriolis effect, stellar parallax."] } }
];

const RELIGION_TREE = [
  { name: "Christianity", family: "Abrahamic", text: "Bible", coreTenets: ["Trinity", "Incarnation", "Grace/Faith", "Resurrection"], adherentsM: 2400, subgroups: [ { name: "Catholic", adherentsM: 1300 }, { name: "Protestant", adherentsM: 900 }, { name: "Orthodox", adherentsM: 260 } ] },
  { name: "Islam", family: "Abrahamic", text: "Quran", coreTenets: ["Tawhid", "Prophethood", "Five Pillars"], adherentsM: 1900, subgroups: [ { name: "Sunni", adherentsM: 1600 }, { name: "Shia", adherentsM: 250 } ] },
  { name: "Latter-day Saint (LDS)", family: "Restorationist", text: "Bible & Book of Mormon", coreTenets: ["Restoration", "Additional scripture", "Ordinances"], adherentsM: 17, subgroups: [] },
  { name: "FLDS", family: "Restorationist", text: "Bible & Book of Mormon", coreTenets: ["Fundamentalist LDS offshoot", "Plural marriage (historic)", "Prophetic leadership"], adherentsM: 0.1, subgroups: [] },
  { name: "Satanism (various)", family: "NRM", text: "Various", coreTenets: ["LaVeyan individualism", "TST secular advocacy"], adherentsM: 0.2, subgroups: [ { name: "LaVeyan", adherentsM: 0.1 }, { name: "The Satanic Temple", adherentsM: 0.1 } ] },
  { name: "Atheist", family: "Unaffiliated", text: "-", coreTenets: ["No deity"], adherentsM: 450, subgroups: [] },
  { name: "Agnostic", family: "Unaffiliated", text: "-", coreTenets: ["Knowledge uncertain"], adherentsM: 600, subgroups: [] },
  { name: "Spiritual (not religious)", family: "Unaffiliated", text: "-", coreTenets: ["Personal spirituality"], adherentsM: 300, subgroups: [] },
  { name: "Jedi (self-identified)", family: "Novelty", text: "-", coreTenets: ["Pop-culture identity"], adherentsM: 0.5, subgroups: [] }
];

/* ============================== APP-WIDE DATA CONTEXT ============================== */
const DataCtx = createContext(null);
function useData(){ return useContext(DataCtx); }

async function fetchJson(path) {
  const base = process.env.PUBLIC_URL || "";
  const url = `${base}${path}?v=${Date.now()}`; // cache-bust
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${path}`);
  return await res.json();
}
function mergeUniqueById(baseArr, extraArr) {
  const m = new Map();
  baseArr.forEach(x => m.set(x.id || JSON.stringify(x), x));
  (extraArr||[]).forEach(x => m.set(x.id || JSON.stringify(x), x));
  return Array.from(m.values());
}

/* ============================== APP ============================== */
export default function App() {
  const [view, setView] = useState("network");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [contradictions, setContradictions] = useState(CONTRADICTIONS_SEED);
  const [immorality, setImmorality] = useState(IMMORALITY_SEED);
  const [science, setScience] = useState(SCIENCE_ITEMS);
  const [religions, setReligions] = useState(RELIGION_TREE);
  const [legal, setLegal] = useState([]);

  // Load external JSONs (if present) from /public/data and MERGE into seeds so views see the full set.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const tasks = [
          fetchJson("/data/contradictions.all.json").catch(()=>[]),
          fetchJson("/data/immorality.items.json").catch(()=>[]),
          fetchJson("/data/science.items.json").catch(()=>[]),
          fetchJson("/data/religions.tree.json").catch(()=>[]),
          fetchJson("/data/legal_cases.json").catch(()=>[]),
        ];
        const [c,i,s,r,l] = await Promise.all(tasks);
        if (cancelled) return;
        if (Array.isArray(c) && c.length) setContradictions(prev => mergeUniqueById(prev, c));
        if (Array.isArray(i) && i.length) setImmorality(prev => mergeUniqueById(prev, i));
        if (Array.isArray(s) && s.length) setScience(prev => mergeUniqueById(prev, s));
        if (Array.isArray(r) && r.length) setReligions(prev => r); // tree replaces
        if (Array.isArray(l) && l.length) setLegal(prev => mergeUniqueById(prev, l));
      } catch(e) {
        setErr(String(e.message||e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const dataValue = useMemo(()=>({
    contradictions, immorality, science, religions, legal,
    setContradictions, setImmorality, setScience, setReligions, setLegal
  }), [contradictions, immorality, science, religions, legal]);

  return (
    <DataCtx.Provider value={dataValue}>
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <TopBar view={view} setView={setView} />
        <main className="max-w-7xl mx-auto p-4 space-y-4">
          {loading ? (
            <div className="p-6 text-center text-slate-500">Loading data…</div>
          ) : (
            <>
              {view === "network" && <NetworkView />}
              {view === "matrix" && <MatrixView />}
              {view === "immorality" && <ImmoralityView />}
              {view === "science" && <ScienceView />}
              {view === "religions" && <ReligionsView />}
              {view === "global" && <GlobalCountsView />}
              {view === "legal" && <LegalCasesView />}
            </>
          )}
          {err && <div className="text-red-600 text-sm">{err}</div>}
        </main>
        <Footer />
      </div>
    </DataCtx.Provider>
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
        App bundles permanent seeds and merges any JSONs in <code>public/data/</code> at runtime.
      </div>
    </footer>
  );
}

/* ============================== ADMIN GATE ============================== */
function isAdmin() {
  try {
    const qp = new URLSearchParams(window.location.search);
    if (qp.get("admin") === "1") { localStorage.setItem("viz_admin", "1"); return true; }
    if (localStorage.getItem("viz_admin") === "1") return true;
    if (process.env.REACT_APP_ADMIN === "1") return true;
  } catch (_) {}
  return false;
}

/* ============================== HELPERS ============================== */
const BOOK_ORDER = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Songs","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi",
  "Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation",
  "1 Nephi","2 Nephi","Jacob","Enos","Jarom","Omni","Words of Mormon","Mosiah","Alma","Helaman","3 Nephi","4 Nephi","Mormon","Ether","Moroni"
];
function bookIndex(book) { const i = BOOK_ORDER.indexOf(book); return i >= 0 ? i : 9999; }
function relationOf(row) { const a = row.verseA.canon || "Bible"; const b = row.verseB.canon || "Bible"; return a === b ? a : "Cross"; }

/* ============================== NETWORK VIEW ============================== */
function NetworkView() {
  const { contradictions, setContradictions } = useData();
  const [q, setQ] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [corpus, setCorpus] = useState("all"); // all|Bible|BoM|Cross
  const [timeline, setTimeline] = useState("all"); // all|OT|NT|BoM
  const [loadError, setLoadError] = useState("");

  const filtered = useMemo(() => contradictions.filter((r) => {
    if (topicFilter !== "all" && r.topic !== topicFilter) return false;
    if (corpus !== "all") { if (relationOf(r) !== corpus) return false; }
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
      (r.topic||"").toLowerCase().includes(s) ||
      (r.verseA?.ref||"").toLowerCase().includes(s) ||
      (r.verseB?.ref||"").toLowerCase().includes(s) ||
      (r.summary||"").toLowerCase().includes(s) ||
      (r.detail||"").toLowerCase().includes(s)
    );
  }), [contradictions, topicFilter, corpus, timeline, q]);

  // d3 network
  const hostRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    import("d3").then((d3) => {
      if (cancelled) return;
      const el = hostRef.current; if (!el) return;
      const width = el.clientWidth || 960; const height = 520; const margin = 24;
      const topicSet = Array.from(new Set(filtered.map((r) => r.topic)));
      const color = d3.scaleOrdinal(d3.schemeTableau10).domain(topicSet);

      const nmap = new Map(); const links = [];
      filtered.forEach((row) => {
        const a = row.verseA?.ref || "?"; const b = row.verseB?.ref || "?";
        if (!nmap.has(a)) nmap.set(a, { id: a, topic: row.topic });
        if (!nmap.has(b)) nmap.set(b, { id: b, topic: row.topic });
        links.push({ source: a, target: b, row });
      });
      const nodes = Array.from(nmap.values());

      const root = d3.select(el); root.selectAll("svg").remove();
      const svg = root.append("svg").attr("width", "100%").attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);
      const g = svg.append("g");

      const zoom = d3.zoom().scaleExtent([0.5, 4]).on("zoom", (ev) => g.attr("transform", ev.transform));
      svg.call(zoom);

      const sim = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d=>d.id).distance(140))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width/2, height/2))
        .force("collide", d3.forceCollide(18));

      const link = g.append("g").attr("stroke", "#cbd5e1").attr("stroke-opacity", 0.9)
        .selectAll("line").data(links).join("line").attr("stroke-width", 1.4);

      const drag = d3.drag()
        .on("start", (ev, d) => { if (!ev.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (ev, d) => { d.fx = Math.max(margin, Math.min(width-margin, ev.x)); d.fy = Math.max(margin, Math.min(height-margin, ev.y)); })
        .on("end",   (ev, d) => { if (!ev.active) sim.alphaTarget(0); d.fx = null; d.fy = null; });

      const node = g.append("g").selectAll("g").data(nodes).join("g").call(drag);
      node.append("circle").attr("r", 12).attr("fill", d=>color(d.topic)).attr("stroke", "#0f172a").attr("stroke-opacity", 0.1);
      node.append("text").text(d=>d.id).attr("x", 16).attr("y", 4).attr("font-size", 11);

      function clamp(v,min,max){return Math.max(min, Math.min(max,v));}
      sim.on("tick", () => {
        link.attr("x1", d=>clamp(d.source.x, margin, width-margin))
            .attr("y1", d=>clamp(d.source.y, margin, height-margin))
            .attr("x2", d=>clamp(d.target.x, margin, width-margin))
            .attr("y2", d=>clamp(d.target.y, margin, height-margin));
        node.attr("transform", d=>`translate(${clamp(d.x, margin, width-margin)},${clamp(d.y, margin, height-margin)})`);
      });

      return () => sim.stop();
    }).catch((err) => setLoadError(err?.message || "Failed to load d3"));
    return () => { cancelled = true; };
  }, [filtered]);

  function onImport(e) {
    const f = e.target.files[0]; if (!f) return; const r = new FileReader();
    r.onload = (ev) => { try {
      const arr = JSON.parse(ev.target.result);
      if (!Array.isArray(arr)) throw new Error("JSON must be an array");
      const clean = arr.map((x,i)=>({ id: x.id || `imp_${i}`, topic: x.topic || "Uncategorized", verseA: x.verseA || {ref:"?",book:"?",canon:"Bible"}, verseB: x.verseB || {ref:"?",book:"?",canon:"Bible"}, summary: x.summary || "", detail: x.detail || "" }));
      setContradictions(prev => mergeUniqueById(prev, clean));
      alert("Imported " + clean.length + " rows (merged).");
    } catch (err) { alert("Parse error: " + err.message); } };
    r.readAsText(f);
  }

  const topics = useMemo(() => Array.from(new Set(contradictions.map(r=>r.topic))).sort(), [contradictions]);

  return (
    <Card
      title="Contradictions Network"
      right={
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search..." className="border rounded p-1" />
          <select value={topicFilter} onChange={(e)=>setTopicFilter(e.target.value)} className="border rounded p-1">
            <option value="all">All topics</option>
            {topics.map(t=> <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={corpus} onChange={(e)=>setCorpus(e.target.value)} className="border rounded p-1">
            <option value="all">All corpora</option>
            <option value="Bible">Bible</option>
            <option value="BoM">Book of Mormon</option>
            <option value="Cross">Bible ↔ BoM</option>
          </select>
          <select value={timeline} onChange={(e)=>setTimeline(e.target.value)} className="border rounded p-1">
            <option value="all">All timeline</option>
            <option value="OT">OT</option>
            <option value="NT">NT</option>
            <option value="BoM">BoM</option>
          </select>
          {isAdmin() && (<input type="file" accept="application/json" onChange={onImport} title="Import contradictions JSON" />)}
        </div>
      }
    >
      <div className="text-xs text-slate-500 mb-2">Nodes are clamped, draggable; zoom with mousewheel or trackpad.</div>
      <div ref={hostRef} className="w-full border rounded-xl overflow-hidden bg-slate-25" />
      {loadError && <div className="text-red-600 text-sm">{loadError}</div>}
    </Card>
  );
}

/* ============================== MATRIX VIEW (now uses central data) ============================== */
function MatrixView(){
  const { contradictions } = useData();
  const [bookFilter, setBookFilter] = useState("all");
  const filtered = useMemo(() => contradictions.filter(r=> bookFilter==="all" || r.verseA.book===bookFilter || r.verseB.book===bookFilter), [contradictions, bookFilter]);
  const books = useMemo(() => Array.from(new Set(contradictions.flatMap(r=>[r.verseA.book, r.verseB.book]))).filter(Boolean).sort((a,b)=>bookIndex(a)-bookIndex(b)), [contradictions]);
  return (
    <Card title="Contradictions Matrix" right={<select value={bookFilter} onChange={(e)=>setBookFilter(e.target.value)} className="border rounded p-1"><option value="all">All books</option>{books.map(b=> <option key={b} value={b}>{b}</option>)}</select>}>
      <table className="w-full text-sm">
        <thead><tr className="text-left border-b"><th className="py-2">Topic</th><th>Verse A</th><th>Verse B</th><th>Summary</th></tr></thead>
        <tbody>
          {filtered.map(r=> (
            <tr key={r.id} className="border-b hover:bg-slate-50">
              <td className="py-2 font-medium">{r.topic}</td>
              <td>{r.verseA.ref}</td>
              <td>{r.verseB.ref}</td>
              <td className="text-slate-600">{r.summary}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-xs text-slate-500 mt-2">Showing {filtered.length} of {contradictions.length} total.</div>
    </Card>
  );
}

/* ============================== IMMORALITY VIEW ============================== */
function ImmoralityView(){
  const { immorality } = useData();
  const counts = useMemo(()=> immorality.reduce((m,r)=>{m[r.category]=(m[r.category]||0)+1; return m;},{}),[immorality]);
  return (
    <Card title="Examples of Immorality (by narrative)">
      <div className="grid md:grid-cols-2 gap-3">
        <div className="border rounded-lg p-3">
          <div className="font-semibold mb-2">Items</div>
          <ul className="list-disc pl-5 space-y-1">
            {immorality.map(r=> <li key={r.id}><span className="font-medium">{r.category}</span> — {r.ref} {r.commanded?"(commanded)":""} <span className="text-slate-500">{r.note}</span></li>)}
          </ul>
        </div>
        <div className="border rounded-lg p-3">
          <div className="font-semibold mb-2">Counts by Category</div>
          <ul className="space-y-1 text-sm">{Object.entries(counts).map(([k,v])=> <li key={k}><span className="font-medium">{k}:</span> {v}</li>)}</ul>
        </div>
      </div>
    </Card>
  );
}

/* ============================== SCIENCE VIEW ============================== */
function ScienceView(){
  const { science } = useData();
  return (
    <Card title="Scientific Inaccuracies & Why They Conflict with Natural Laws">
      <div className="space-y-3">
        {science.map(s=> (
          <div key={s.id} className="border rounded-lg p-3">
            <div className="font-semibold">{s.story}</div>
            <div className="text-sm">Refs: {Array.isArray(s.refs)? s.refs.join(", ") : s.refs}</div>
            <div className="text-sm mt-1">{s.summary}</div>
            <div className="grid md:grid-cols-3 gap-2 mt-2 text-sm">
              <div><div className="font-medium">Laws</div><ul className="list-disc pl-5">{s.mechanisms?.laws?.map((x,i)=><li key={i}>{x}</li>)}</ul></div>
              <div><div className="font-medium">Why</div><ul className="list-disc pl-5">{s.mechanisms?.why?.map((x,i)=><li key={i}>{x}</li>)}</ul></div>
              <div><div className="font-medium">Observations</div><ul className="list-disc pl-5">{s.mechanisms?.observations?.map((x,i)=><li key={i}>{x}</li>)}</ul></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ============================== RELIGIONS VIEW ============================== */
function ReligionsView(){
  const { religions, setReligions } = useData();
  const [dist, setDist] = useState([]); // optional world distribution

  // Auto-load distribution if present
  useEffect(() => {
    let cancelled = false;
    (async ()=>{
      try {
        const arr = await fetchJson("/data/religion_distribution.world.json").catch(()=>[]);
        if (!cancelled && Array.isArray(arr)) setDist(arr);
      } catch(_) {}
    })();
    return ()=>{ cancelled = true; };
  }, []);

  function onImportTree(e){
    const f = e.target.files[0]; if(!f) return; const r = new FileReader();
    r.onload = (ev)=>{ try{ const arr = JSON.parse(ev.target.result); if(Array.isArray(arr)) { setReligions(arr); alert("Religions tree imported: "+arr.length); } else { throw new Error("Expected array"); } } catch(err){ alert("Parse error: "+err.message); } };
    r.readAsText(f);
  }

  function onImportDist(e){
    const f = e.target.files[0]; if(!f) return; const r = new FileReader();
    r.onload = (ev)=>{ try{ const arr = JSON.parse(ev.target.result); if(Array.isArray(arr)) { setDist(arr); alert("Distribution rows: "+arr.length); } else { throw new Error("Expected array"); } } catch(err){ alert("Parse error: "+err.message); } };
    r.readAsText(f);
  }

  return (
    <Card
      title="World Religions"
      right={
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {isAdmin() && <><input type="file" accept="application/json" onChange={onImportTree} title="Import religions tree JSON" />
          <input type="file" accept="application/json" onChange={onImportDist} title="Import distribution JSON" /></>}
        </div>
      }
    >
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-3">
          <div className="font-semibold mb-2">Main branches (expandable)</div>
          <ExpandableTree data={religions} />
        </div>
        <div className="border rounded-lg p-3">
          <div className="font-semibold mb-2">Distribution (sample) — rows loaded: {dist.length}</div>
          <div className="text-xs text-slate-600">Hook this to a choropleth/timeline if desired. Format: <code>{'{country, year, religion, shareIndex}'}</code></div>
        </div>
      </div>
    </Card>
  );
}

function ExpandableTree({ data }){
  const [open, setOpen] = useState({});
  return (
    <ul className="space-y-2">
      {data.map((n, idx) => {
        const key = n.name+"_"+idx; const isOpen = !!open[key];
        return (
          <li key={key} className="border rounded p-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{n.name} <span className="text-xs text-slate-500">({n.family})</span></div>
                <div className="text-xs">Text: {n.text} • Core tenets: {Array.isArray(n.coreTenets)? n.coreTenets.join(", ") : "-"}</div>
                <div className="text-xs text-slate-500">Approx adherents (M): {n.adherentsM ?? "-"}</div>
              </div>
              {Array.isArray(n.subgroups) && n.subgroups.length>0 && (
                <button onClick={()=>setOpen({...open, [key]:!isOpen})} className="text-xs px-2 py-1 border rounded">
                  {isOpen?"Collapse":"Expand"}
                </button>
              )}
            </div>
            {isOpen && (
              <ul className="mt-2 pl-5 list-disc text-sm">
                {n.subgroups.map((s,i)=> <li key={i}>{s.name} {s.adherentsM?`— ${s.adherentsM}M`:""}</li>)}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ============================== GLOBAL COUNTS VIEW ============================== */
function GlobalCountsView(){
  const { contradictions, immorality, science } = useData();
  return (
    <Card title="Global Overview">
      <div className="grid md:grid-cols-3 gap-3">
        <Stat label="Contradictions" value={contradictions.length} />
        <Stat label="Immorality examples" value={immorality.length} />
        <Stat label="Science entries" value={science.length} />
      </div>
      <div className="text-xs text-slate-500 mt-2">Permanent seeds + any JSONs in <code>public/data/</code>.</div>
    </Card>
  );
}
function Stat({label, value}){ return (
  <div className="border rounded-lg p-4 text-center">
    <div className="text-3xl font-bold">{value}</div>
    <div className="text-sm text-slate-600">{label}</div>
  </div>
);} 

/* ============================== LEGAL CASES VIEW ============================== */
function LegalCasesView(){
  const { legal, setLegal } = useData();

  function onImport(e){
    const f = e.target.files[0]; if(!f) return; const r = new FileReader();
    r.onload = (ev)=>{ try{ const arr = JSON.parse(ev.target.result); if(Array.isArray(arr)){ setLegal(prev=>mergeUniqueById(prev, arr)); alert("Legal cases imported: "+arr.length+" (merged)"); } else { throw new Error("Expected array"); } } catch(err){ alert("Parse error: "+err.message); } };
    r.readAsText(f);
  }

  return (
    <Card title="Religious Legal Landscape" right={isAdmin() && <input type="file" accept="application/json" onChange={onImport} title="Import legal cases JSON" /> }>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b"><th className="py-2">Group</th><th>Country</th><th>Year</th><th>Type</th><th>Outcome</th></tr>
        </thead>
        <tbody>
          {legal.map((r,i)=> (
            <tr key={i} className="border-b hover:bg-slate-50">
              <td className="py-2">{r.groupName}</td>
              <td>{r.country}</td>
              <td>{r.year}</td>
              <td>{r.allegedOffenseType}</td>
              <td className="text-slate-600">{r.outcome}</td>
            </tr>
          ))}
          {legal.length===0 && (
            <tr><td colSpan="5" className="py-6 text-center text-slate-500">No rows yet — add <code>public/data/legal_cases.json</code> or import a file (admin only)</td></tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}

/* ============================== MISC ============================== */
function FooterNote(){ return null; }



