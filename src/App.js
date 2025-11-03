import React, { useEffect, useMemo, useRef, useState } from "react";

/* =========================================================
   Single-file React app (CRA)
   - Auto-loads big datasets from /public/data (if present)
   - Seeds embedded so the app still works if files missing
   - Views: Network, Matrix, Immorality, Science, Religions (with map), Global, Legal
   - Admin-only import buttons are still supported via ?admin=1
   ========================================================= */

/* -------------------------- Admin gate -------------------------- */
function isAdmin() {
  try {
    const qp = new URLSearchParams(window.location.search);
    if (qp.get("admin") === "1") { localStorage.setItem("viz_admin", "1"); return true; }
    if (localStorage.getItem("viz_admin") === "1") return true;
    if (process.env.REACT_APP_ADMIN === "1") return true;
  } catch {}
  return false;
}

/* -------------------------- Seeds (fallbacks) -------------------------- */
// A few to boot the app; big files will override.
const CONTRADICTIONS_SEED = [
  { id: "c1", topic: "Creation order", verseA: { ref: "Genesis 1:24-27", book: "Genesis", canon: "Bible" }, verseB: { ref: "Genesis 2:18-19", book: "Genesis", canon: "Bible" }, summary: "Humans after animals vs man before animals.", detail: "Genesis 1 sequences animals→humans; Genesis 2 narrates man then animals brought to him." },
  { id: "c2", topic: "Seeing God", verseA: { ref: "Exodus 33:20", book: "Exodus", canon: "Bible" }, verseB: { ref: "Genesis 32:30", book: "Genesis", canon: "Bible" }, summary: "No one can see God and live vs Jacob saw God face to face.", detail: "Theophany vs doctrinal prohibition." }
];

const IMMORALITY_SEED = [
  { id: "m1", category: "Killing by God", ref: "Genesis 7:21-23 (Flood)", canon: "Bible", commanded: true, estCount: null, note: "Near-total loss of life in narrative." },
  { id: "m2", category: "Genocide", ref: "Deuteronomy 20:16-18", canon: "Bible", commanded: true, estCount: null, note: "Cities devoted to destruction." }
];

const SCIENCE_SEED = [
  { id: "s1", story: "Noah's Ark and global flood", refs: ["Genesis 6-9"], summary: "Deluge + wooden ark houses all kinds.", mechanisms: { laws: ["Ship structure limits", "Population genetics", "Marine salinity"], why: ["Large timber hulls need modern bracing.", "Pairs cause extreme inbreeding depression.", "Mixing fresh/saltwater & sediment harms marine life."], observations: ["Ice cores & tree rings continuous >10k years.", "Stratigraphy inconsistent with global one-year layer."] } },
  { id: "s2", story: "Joshua's long day", refs: ["Joshua 10:12-14"], summary: "Sun/Moon stand still.", mechanisms: { laws: ["Angular momentum"], why: ["Stopping Earth's rotation releases ~2.6e29 J."], observations: ["No global synchronised records."] } }
];

// Lightweight tree (extended by file)
const RELIGION_TREE_SEED = [
  { name: "Christianity", family: "Abrahamic", text: "Bible", coreTenets: ["Trinity", "Incarnation", "Grace/Faith", "Resurrection"], adherentsM: 2400, subgroups: [ { name: "Catholic", adherentsM: 1300 }, { name: "Protestant", adherentsM: 900 }, { name: "Orthodox", adherentsM: 260 } ] },
  { name: "Islam", family: "Abrahamic", text: "Quran", coreTenets: ["Tawhid", "Prophethood", "Five Pillars"], adherentsM: 1900, subgroups: [ { name: "Sunni", adherentsM: 1600 }, { name: "Shia", adherentsM: 250 } ] },
  { name: "Latter-day Saint (LDS)", family: "Restorationist", text: "Bible & Book of Mormon", coreTenets: ["Restoration", "Additional scripture", "Ordinances"], adherentsM: 17, subgroups: [] },
  { name: "FLDS", family: "Restorationist", text: "Bible & Book of Mormon", coreTenets: ["Fundamentalist LDS offshoot", "Plural marriage (historic)", "Prophetic leadership"], adherentsM: 0.1, subgroups: [] },
  { name: "Satanism (various)", family: "NRM", text: "Various", coreTenets: ["LaVeyan individualism", "TST secular advocacy"], adherentsM: 0.2, subgroups: [ { name: "LaVeyan", adherentsM: 0.1 }, { name: "The Satanic Temple", adherentsM: 0.1 } ] },
  { name: "Hinduism", family: "Dharmic", text: "Vedas/Upanishads/etc.", coreTenets: ["Dharma", "Karma", "Samsara", "Moksha"], adherentsM: 1200, subgroups: [ { name: "Vaishnavism" }, { name: "Shaivism" }, { name: "Shaktism" } ] },
  { name: "Buddhism", family: "Dharmic", text: "Tripitaka/various", coreTenets: ["Four Noble Truths", "Eightfold Path", "Anatta"], adherentsM: 500, subgroups: [ { name: "Theravada" }, { name: "Mahayana" }, { name: "Vajrayana" } ] },
  { name: "Sikhism", family: "Dharmic", text: "Guru Granth Sahib", coreTenets: ["Ik Onkar", "Seva", "Kirat Karni"], adherentsM: 26, subgroups: [] },
  { name: "Judaism", family: "Abrahamic", text: "Tanakh/Talmud", coreTenets: ["Shema", "Torah observance", "Covenant"], adherentsM: 15, subgroups: [ { name: "Orthodox" }, { name: "Conservative" }, { name: "Reform" } ] },
  { name: "Bahá’í", family: "Abrahamic (post-Islamic)", text: "Kitáb-i-Aqdas/etc.", coreTenets: ["Unity of religions", "World peace", "Equality"], adherentsM: 7, subgroups: [] },
  { name: "Jainism", family: "Dharmic", text: "Agamas", coreTenets: ["Ahimsa", "Anekantavada", "Aparigraha"], adherentsM: 4, subgroups: [] },
  { name: "Shinto", family: "East Asian", text: "Kojiki/Nihon Shoki", coreTenets: ["Kami", "Ritual purity"], adherentsM: 100, subgroups: [] },
  { name: "Taoism", family: "East Asian", text: "Tao Te Ching/Zhuangzi", coreTenets: ["Dao", "Wu-wei", "Ziran"], adherentsM: 12, subgroups: [] },
  { name: "Confucian traditions", family: "East Asian", text: "Analects", coreTenets: ["Ren", "Li", "Xiao"], adherentsM: 6, subgroups: [] },
  { name: "Indigenous/folk religions", family: "Various", text: "Oral traditions", coreTenets: ["Ancestral veneration", "Local deities"], adherentsM: 400, subgroups: [] },
  { name: "Atheist", family: "Unaffiliated", text: "-", coreTenets: ["No deity"], adherentsM: 450, subgroups: [] },
  { name: "Agnostic", family: "Unaffiliated", text: "-", coreTenets: ["Knowledge uncertain"], adherentsM: 600, subgroups: [] },
  { name: "Spiritual (not religious)", family: "Unaffiliated", text: "-", coreTenets: ["Personal spirituality"], adherentsM: 300, subgroups: [] },
  { name: "Jedi (self-identified)", family: "Novelty", text: "-", coreTenets: ["Pop-culture identity"], adherentsM: 0.5, subgroups: [] }
];

/* -------------------------- Helpers -------------------------- */
const BOOK_ORDER = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Songs","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi",
  "Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation",
  "1 Nephi","2 Nephi","Jacob","Enos","Jarom","Omni","Words of Mormon","Mosiah","Alma","Helaman","3 Nephi","4 Nephi","Mormon","Ether","Moroni"
];
function bookIndex(book) { const i = BOOK_ORDER.indexOf(book); return i >= 0 ? i : 9999; }
function relationOf(row) { const a = row.verseA.canon || "Bible"; const b = row.verseB.canon || "Bible"; return a === b ? a : "Cross"; }

/* -------------------------- Shell UI -------------------------- */
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
    { id: "religions", label: "Religions + Map" },
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
                (view === t.id ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:bg-slate-100 border-slate-300")
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
        Tip: Put large JSONs into <code>public/data/</code> and the app will auto-load them. Import buttons are admin-only (add <code>?admin=1</code> to the URL).
      </div>
    </footer>
  );
}

/* ============================== NETWORK VIEW ============================== */
function NetworkView() {
  const [rows, setRows] = useState(CONTRADICTIONS_SEED);
  const [q, setQ] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [corpus, setCorpus] = useState("all"); // all|Bible|BoM|Cross
  const [timeline, setTimeline] = useState("all"); // all|OT|NT|BoM
  const hostRef = useRef(null);
  const [loadError, setLoadError] = useState("");

  // Auto-load if present
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(process.env.PUBLIC_URL + "/data/contradictions.all.json", { cache: "no-store" });
        if (res.ok) {
          const arr = await res.json();
          if (!cancelled && Array.isArray(arr) && arr.length) setRows(arr);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => rows.filter((r) => {
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
  }), [rows, topicFilter, corpus, timeline, q]);

  // d3 network w/ clamped nodes + zoom
  useEffect(() => {
    let cancelled = false;
    import("d3").then((d3) => {
      if (cancelled) return;
      const el = hostRef.current; if (!el) return;
      const width = el.clientWidth || 960; const height = 520; const margin = 24;
      const topics = Array.from(new Set(filtered.map((r) => r.topic)));
      const color = d3.scaleOrdinal(d3.schemeTableau10).domain(topics);

      // Build nodes/links
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
      node.append("text").text(d=>d.id).attr("x", 16).attr("y", 4).attr("fontSize", 11);

      const clamp = (v,min,max)=>Math.max(min, Math.min(max,v));
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

  const topics = useMemo(() => Array.from(new Set(rows.map(r=>r.topic))).sort(), [rows]);

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
          {isAdmin() && (<input type="file" accept="application/json" onChange={(e)=>importJson(e, setRows)} title="Import contradictions JSON" />)}
        </div>
      }
    >
      <div className="text-xs text-slate-500 mb-2">Nodes are clamped & draggable; zoom with mousewheel/trackpad.</div>
      <div ref={hostRef} className="w-full border rounded-xl overflow-hidden bg-slate-25" />
      {loadError && <div className="text-red-600 text-sm mt-2">{loadError}</div>}
    </Card>
  );
}

/* ============================== MATRIX VIEW ============================== */
function MatrixView(){
  const [rows, setRows] = useState(CONTRADICTIONS_SEED);
  useEffect(()=>{ // try auto-load
    (async ()=>{
      try{
        const r = await fetch(process.env.PUBLIC_URL + "/data/contradictions.all.json", {cache:"no-store"});
        if (r.ok) { const arr = await r.json(); if (Array.isArray(arr) && arr.length) setRows(arr); }
      }catch{}
    })();
  },[]);
  const [bookFilter, setBookFilter] = useState("all");
  const filtered = useMemo(() => rows.filter(r=> bookFilter==="all" || r.verseA.book===bookFilter || r.verseB.book===bookFilter), [rows, bookFilter]);
  const books = useMemo(() => Array.from(new Set(rows.flatMap(r=>[r.verseA.book, r.verseB.book]))).filter(Boolean).sort((a,b)=>bookIndex(a)-bookIndex(b)), [rows]);
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
    </Card>
  );
}

/* ============================== IMMORALITY VIEW ============================== */
function ImmoralityView(){
  const [rows, setRows] = useState(IMMORALITY_SEED);
  useEffect(()=>{
    (async ()=>{
      try{
        const r = await fetch(process.env.PUBLIC_URL + "/data/immorality.all.json", {cache:"no-store"});
        if (r.ok) { const arr = await r.json(); if (Array.isArray(arr) && arr.length) setRows(arr); }
      }catch{}
    })();
  },[]);
  const counts = useMemo(()=> rows.reduce((m,r)=>{m[r.category]=(m[r.category]||0)+1; return m;},{}),[rows]);
  return (
    <Card title="Examples of Immorality (by narrative)">
      <div className="grid md:grid-cols-2 gap-3">
        <div className="border rounded-lg p-3">
          <div className="font-semibold mb-2">Items</div>
          <ul className="list-disc pl-5 space-y-1">
            {rows.map(r=> <li key={r.id}><span className="font-medium">{r.category}</span> — {r.ref} {r.commanded?"(commanded)":""} <span className="text-slate-500">{r.note}</span></li>)}
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
  const [rows, setRows] = useState(SCIENCE_SEED);
  useEffect(()=>{
    (async ()=>{
      try{
        const r = await fetch(process.env.PUBLIC_URL + "/data/science.all.json", {cache:"no-store"});
        if (r.ok) { const arr = await r.json(); if (Array.isArray(arr) && arr.length) setRows(arr); }
      }catch{}
    })();
  },[]);
  return (
    <Card title="Scientific Inaccuracies & Why They Conflict with Natural Laws">
      <div className="space-y-3">
        {rows.map(s=> (
          <div key={s.id} className="border rounded-lg p-3">
            <div className="font-semibold">{s.story}</div>
            {Array.isArray(s.refs) && <div className="text-sm">Refs: {s.refs.join(", ")}</div>}
            <div className="text-sm mt-1">{s.summary}</div>
            {s.mechanisms && (
              <div className="grid md:grid-cols-3 gap-2 mt-2 text-sm">
                <div><div className="font-medium">Laws</div><ul className="list-disc pl-5">{(s.mechanisms.laws||[]).map((x,i)=><li key={i}>{x}</li>)}</ul></div>
                <div><div className="font-medium">Why</div><ul className="list-disc pl-5">{(s.mechanisms.why||[]).map((x,i)=><li key={i}>{x}</li>)}</ul></div>
                <div><div className="font-medium">Observations</div><ul className="list-disc pl-5">{(s.mechanisms.observations||[]).map((x,i)=><li key={i}>{x}</li>)}</ul></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ============================== RELIGIONS VIEW (tree + map) ============================== */
function ReligionsView(){
  const [tree, setTree] = useState(RELIGION_TREE_SEED);
  const [dist, setDist] = useState([]); // [{country,year,religion,shareIndex}]
  const [world, setWorld] = useState(null); // world TopoJSON (countries-110m.json)
  const [year, setYear] = useState(2020);
  const [religion, setReligion] = useState("Christianity");

  // Load tree
  useEffect(()=>{
    (async ()=>{
      try{
        const r = await fetch(process.env.PUBLIC_URL + "/data/religion_tree.all.json", {cache:"no-store"});
        if (r.ok) { const arr = await r.json(); if (Array.isArray(arr) && arr.length) setTree(arr); }
      }catch{}
    })();
  },[]);
  // Load distribution
  useEffect(()=>{
    (async ()=>{
      try{
        const r = await fetch(process.env.PUBLIC_URL + "/data/religion_distribution.world.json", {cache:"no-store"});
        if (r.ok) { const arr = await r.json(); if (Array.isArray(arr) && arr.length) setDist(arr); }
      }catch{}
    })();
  },[]);
  // Load world topo (local)
  useEffect(()=>{
    (async ()=>{
      try{
        const r = await fetch(process.env.PUBLIC_URL + "/data/world-110m.json", {cache:"no-store"});
        if (r.ok) { const topo = await r.json(); setWorld(topo); }
      }catch{}
    })();
  },[]);

  function onImportTree(e){ if(!isAdmin()) return;
    const f = e.target.files[0]; if(!f) return; const r = new FileReader();
    r.onload = (ev)=>{ try{ const arr = JSON.parse(ev.target.result); if(Array.isArray(arr)) { setTree(arr); alert("Religions tree imported: "+arr.length); } else { throw new Error("Expected array"); } } catch(err){ alert("Parse error: "+err.message); } };
    r.readAsText(f);
  }
  function onImportDist(e){ if(!isAdmin()) return;
    const f = e.target.files[0]; if(!f) return; const r = new FileReader();
    r.onload = (ev)=>{ try{ const arr = JSON.parse(ev.target.result); if(Array.isArray(arr)) { setDist(arr); alert("Distribution rows: "+arr.length); } else { throw new Error("Expected array"); } } catch(err){ alert("Parse error: "+err.message); } };
    r.readAsText(f);
  }

  const years = useMemo(()=> Array.from(new Set(dist.map(d=>d.year))).sort((a,b)=>a-b), [dist]);
  const religions = useMemo(()=> Array.from(new Set(dist.map(d=>d.religion))).sort(), [dist]);

  return (
    <Card
      title="World Religions (Tree + Choropleth)"
      right={
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {isAdmin() && (
            <>
              <input type="file" accept="application/json" onChange={onImportTree} title="Import religions tree JSON" />
              <input type="file" accept="application/json" onChange={onImportDist} title="Import distribution JSON" />
            </>
          )}
        </div>
      }
    >
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="border rounded-lg p-3">
          <div className="font-semibold mb-2">Main branches (expand/collapse)</div>
          <ExpandableTree data={tree} />
        </div>
        <div className="border rounded-lg p-3">
          <div className="font-semibold mb-2">Global distribution map</div>
          <div className="flex items-center gap-2 text-sm mb-2">
            <label>Year:</label>
            <select className="border rounded p-1" value={year} onChange={(e)=>setYear(Number(e.target.value))}>
              {years.map(y=><option key={y} value={y}>{y}</option>)}
            </select>
            <label>Religion:</label>
            <select className="border rounded p-1" value={religion} onChange={(e)=>setReligion(e.target.value)}>
              {religions.map(r=><option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <WorldChoropleth world={world} dist={dist} year={year} religion={religion} />
          <div className="text-xs text-slate-600 mt-2">
            Format: <code>{'{country, year, religion, shareIndex}'}</code> where <code>shareIndex</code> is 0..1.
          </div>
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
                {n.subgroups.map((s,i)=> <li key={i}>{s.name}{s.adherentsM?` — ${s.adherentsM}M`:""}</li>)}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* -------------------------- Map component -------------------------- */
function WorldChoropleth({ world, dist, year, religion }){
  const hostRef = useRef(null);
  useEffect(()=>{
    let cancelled = false;
    if (!world || !Array.isArray(dist) || dist.length===0) return;
    Promise.all([import("d3"), import("topojson-client")]).then(([d3mod, topo])=>{
      if (cancelled) return;
      const d3 = d3mod;
      const el = hostRef.current; if (!el) return;
      const width = el.clientWidth || 640, height = 360;

      // Convert Topo -> Geo
      const countries = topo.feature(world, world.objects.countries);
      const projection = d3.geoNaturalEarth1().fitSize([width, height], countries);
      const path = d3.geoPath(projection);

      // Build data lookup for selected year/religion
      const byCountry = new Map();
      dist.forEach(d => {
        if (d.year === year && d.religion === religion) {
          byCountry.set(d.country.toLowerCase(), d.shareIndex);
        }
      });

      // Simple name matcher (ISO names vary); use lowercase includes as a fallback
      function scoreCountry(name){
        const key = name.toLowerCase();
        if (byCountry.has(key)) return byCountry.get(key);
        // fallback: find any entry that contains this key
        for (const [k,v] of byCountry.entries()){ if (k.includes(key) || key.includes(k)) return v; }
        return null;
      }

      // Color scale
      const values = Array.from(byCountry.values());
      const max = values.length? Math.max(...values) : 1;
      const color = d3.scaleSequential(d3.interpolateBlues).domain([0, max||1]);

      // Draw
      const root = d3.select(el); root.selectAll("svg").remove();
      const svg = root.append("svg").attr("width", "100%").attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);

      svg.append("rect").attr("width", width).attr("height", height).attr("fill", "#f8fafc");

      const g = svg.append("g");
      g.selectAll("path.country")
        .data(countries.features)
        .join("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("fill", f => {
          const v = scoreCountry(f.properties.name || "");
          return v==null ? "#e5e7eb" : color(v);
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.6)
        .append("title")
        .text(f=>{
          const n = f.properties.name||"";
          const v = scoreCountry(n);
          const pct = v==null ? "n/a" : Math.round(v*100)+"%";
          return `${n}: ${pct} ${religion}`;
        });

      // Legend
      const legendWidth = 160, legendHeight = 10;
      const legend = svg.append("g").attr("transform", `translate(${width-legendWidth-10}, ${height-30})`);
      const gradId = "gradRel";
      const defs = svg.append("defs");
      const grad = defs.append("linearGradient").attr("id", gradId).attr("x1","0%").attr("x2","100%");
      const steps = 10;
      for (let i=0;i<=steps;i++){
        const t = i/steps;
        grad.append("stop").attr("offset", `${t*100}%`).attr("stop-color", color(t*max));
      }
      legend.append("rect").attr("width", legendWidth).attr("height", legendHeight).attr("fill", `url(#${gradId})`).attr("stroke","#ccc");
      legend.append("text").attr("x", 0).attr("y", -2).attr("font-size", 10).text("Lower");
      legend.append("text").attr("x", legendWidth).attr("y", -2).attr("textAnchor","end").attr("font-size", 10).text("Higher");
    });
    return ()=>{ cancelled = true; };
  }, [world, dist, year, religion]);

  return <div ref={hostRef} className="w-full border rounded-lg overflow-hidden" style={{height: 380}} />;
}

/* ============================== GLOBAL COUNTS VIEW ============================== */
function GlobalCountsView(){
  const [contr, setContr] = useState(CONTRADICTIONS_SEED);
  const [imm, setImm] = useState(IMMORALITY_SEED);
  const [sci, setSci] = useState(SCIENCE_SEED);
  useEffect(()=>{
    (async ()=>{
      try{ const r = await fetch(process.env.PUBLIC_URL + "/data/contradictions.all.json", {cache:"no-store"}); if(r.ok){ const a=await r.json(); if(Array.isArray(a)&&a.length) setContr(a);} }catch{}
      try{ const r = await fetch(process.env.PUBLIC_URL + "/data/immorality.all.json", {cache:"no-store"}); if(r.ok){ const a=await r.json(); if(Array.isArray(a)&&a.length) setImm(a);} }catch{}
      try{ const r = await fetch(process.env.PUBLIC_URL + "/data/science.all.json", {cache:"no-store"}); if(r.ok){ const a=await r.json(); if(Array.isArray(a)&&a.length) setSci(a);} }catch{}
    })();
  },[]);
  return (
    <Card title="Global Overview">
      <div className="grid md:grid-cols-3 gap-3">
        <Stat label="Contradictions" value={contr.length} />
        <Stat label="Immorality examples" value={imm.length} />
        <Stat label="Science entries" value={sci.length} />
      </div>
      <div className="text-xs text-slate-500 mt-2">These are permanent JSONs in <code>public/data</code>.</div>
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
  const [rows, setRows] = useState([]);
  useEffect(()=>{ (async ()=>{
    try{
      const r = await fetch(process.env.PUBLIC_URL + "/data/legal_cases.template.json", {cache:"no-store"});
      if (r.ok) { const arr = await r.json(); if (Array.isArray(arr)) setRows(arr); }
    }catch{}
  })(); },[]);
  function onImport(e){ if(!isAdmin()) return;
    const f = e.target.files[0]; if(!f) return; const r = new FileReader();
    r.onload = (ev)=>{ try{ const arr = JSON.parse(ev.target.result); if(Array.isArray(arr)){ setRows(arr); alert("Legal cases imported: "+arr.length); } else { throw new Error("Expected array"); } } catch(err){ alert("Parse error: "+err.message); } };
    r.readAsText(f);
  }
  return (
    <Card title="Religious Legal Landscape" right={isAdmin() && <input type="file" accept="application/json" onChange={onImport} title="Import legal cases JSON" /> }>
      <table className="w-full text-sm">
        <thead><tr className="text-left border-b"><th className="py-2">Group</th><th>Country</th><th>Year</th><th>Type</th><th>Outcome</th></tr></thead>
        <tbody>
          {rows.map((r,i)=> (
            <tr key={i} className="border-b hover:bg-slate-50">
              <td className="py-2">{r.groupName}</td>
              <td>{r.country}</td>
              <td>{r.year}</td>
              <td>{r.allegedOffenseType}</td>
              <td className="text-slate-600">{r.outcome}</td>
            </tr>
          ))}
          {rows.length===0 && (
            <tr><td colSpan="5" className="py-6 text-center text-slate-500">No rows yet — add <code>public/data/legal_cases.template.json</code> or import a file (admin only)</td></tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}

/* -------------------------- Import helper -------------------------- */
function importJson(e, setter){
  const f = e.target.files[0]; if (!f) return; const r = new FileReader();
  r.onload = (ev) => { try {
    const arr = JSON.parse(ev.target.result);
    if (!Array.isArray(arr)) throw new Error("JSON must be an array");
    setter(arr);
    alert("Imported " + arr.length + " rows.");
  } catch (err) { alert("Parse error: " + err.message); } };
  r.readAsText(f);
}

