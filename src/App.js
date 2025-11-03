import React, { useEffect, useMemo, useRef, useState, createContext, useContext } from "react";

/* 
  Data loading priority per dataset:
  1) public/data/*.json  (auto-load on startup; best for “always present” data on GitHub Pages)
  2) seeds in this file (fallback to keep the app working)

  Files the app will try to read (if present):
  - public/data/contradictions.all.json
  - public/data/religion_distribution.world.json
  - public/data/world.geo.json            <-- GeoJSON FeatureCollection (countries)
  - public/data/legal_cases.template.json
*/

/* ============================== SEEDS (fallbacks) ============================== */
const CONTRADICTIONS_SEED = [
  {
    id: "c1",
    topic: "Creation order",
    verseA: { ref: "Genesis 1:24-27", book: "Genesis", canon: "Bible" },
    verseB: { ref: "Genesis 2:18-19", book: "Genesis", canon: "Bible" },
    summary: "Humans after animals vs man before animals.",
    detail: "Genesis 1 sequences animals→humans; Genesis 2 narrates man then animals brought to him."
  },
  {
    id: "c2",
    topic: "Seeing God",
    verseA: { ref: "Exodus 33:20", book: "Exodus", canon: "Bible" },
    verseB: { ref: "Genesis 32:30", book: "Genesis", canon: "Bible" },
    summary: "No one can see God and live vs Jacob saw God face to face.",
    detail: "Theophany vs prohibition in doctrinal claim."
  }
];

const IMMORALITY_SEED = [
  { id: "m1", category: "Killing by God", ref: "Genesis 7:21-23 (Flood)", canon: "Bible", commanded: true, estCount: null, note: "Near-total loss of life in narrative." },
  { id: "m2", category: "Genocide", ref: "Deuteronomy 20:16-18", canon: "Bible", commanded: true, estCount: null, note: "Cities devoted to destruction." }
];

const SCIENCE_ITEMS = [
  {
    id: "s1",
    story: "Noah's Ark and global flood",
    refs: ["Genesis 6-9"],
    summary: "Deluge + wooden ark houses all kinds.",
    mechanisms: {
      laws: ["Ship structure limits", "Population genetics", "Marine salinity"],
      why: [
        "Large timber hulls need modern bracing.",
        "Pairs cause extreme inbreeding depression.",
        "Mixing fresh/saltwater & sediment harms marine life."
      ],
      observations: ["Ice cores & tree rings continuous >10k years.", "Stratigraphy inconsistent with global one-year layer."]
    }
  },
  {
    id: "s2",
    story: "Joshua's long day",
    refs: ["Joshua 10:12-14"],
    summary: "Sun/Moon stand still.",
    mechanisms: {
      laws: ["Angular momentum"],
      why: ["Stopping Earth's rotation releases ~2.6e29 J."],
      observations: ["No global synchronised records."]
    }
  }
];

const RELIGION_TREE = [
  { name: "Christianity", family: "Abrahamic", text: "Bible", coreTenets: ["Trinity", "Incarnation", "Grace/Faith", "Resurrection"], adherentsM: 2400, subgroups: [ { name: "Catholic", adherentsM: 1300 }, { name: "Protestant", adherentsM: 900 }, { name: "Orthodox", adherentsM: 260 } ] },
  { name: "Islam", family: "Abrahamic", text: "Quran", coreTenets: ["Tawhid", "Prophethood", "Five Pillars"], adherentsM: 1900, subgroups: [ { name: "Sunni", adherentsM: 1600 }, { name: "Shia", adherentsM: 250 } ] },
  { name: "Latter-day Saint (LDS)", family: "Restorationist", text: "Bible & Book of Mormon", coreTenets: ["Restoration","Additional scripture","Ordinances"], adherentsM: 17, subgroups: [] },
  { name: "FLDS", family: "Restorationist", text: "Bible & Book of Mormon", coreTenets: ["Fundamentalist LDS offshoot","Plural marriage (historic)","Prophetic leadership"], adherentsM: 0.1, subgroups: [] },
  { name: "Satanism (various)", family: "NRM", text: "Various", coreTenets: ["LaVeyan individualism","TST secular advocacy"], adherentsM: 0.2, subgroups: [{ name:"LaVeyan", adherentsM:0.1},{ name:"The Satanic Temple", adherentsM:0.1}] },
  { name: "Atheist", family: "Unaffiliated", text: "-", coreTenets: ["No deity"], adherentsM: 450, subgroups: [] },
  { name: "Agnostic", family: "Unaffiliated", text: "-", coreTenets: ["Knowledge uncertain"], adherentsM: 600, subgroups: [] },
  { name: "Spiritual (not religious)", family: "Unaffiliated", text: "-", coreTenets: ["Personal spirituality"], adherentsM: 300, subgroups: [] },
  { name: "Jedi (self-identified)", family: "Novelty", text: "-", coreTenets: ["Pop-culture identity"], adherentsM: 0.5, subgroups: [] },
];

/* ============================== HELPERS ============================== */
const BOOK_ORDER = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Songs","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi",
  "Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation",
  "1 Nephi","2 Nephi","Jacob","Enos","Jarom","Omni","Words of Mormon","Mosiah","Alma","Helaman","3 Nephi","4 Nephi","Mormon","Ether","Moroni"
];
function bookIndex(book) { const i = BOOK_ORDER.indexOf(book); return i >= 0 ? i : 9999; }
function relationOf(row) { const a = row.verseA?.canon || "Bible"; const b = row.verseB?.canon || "Bible"; return a === b ? a : "Cross"; }
function isAdmin() {
  try {
    const qp = new URLSearchParams(window.location.search);
    if (qp.get("admin") === "1") { localStorage.setItem("viz_admin", "1"); return true; }
    if (localStorage.getItem("viz_admin") === "1") return true;
    if (process.env.REACT_APP_ADMIN === "1") return true;
  } catch {}
  return false;
}

/* ============================== GLOBAL DATA CONTEXT ============================== */
const DataCtx = createContext(null);
function useData(){ return useContext(DataCtx); }

/* ============================== APP ============================== */
export default function App() {
  const [view, setView] = useState("network");

  // Global datasets
  const [contradictions, setContradictions] = useState(CONTRADICTIONS_SEED);
  const [religionDist, setReligionDist] = useState([]); // {country, year, religion, shareIndex}
  const [legalCases, setLegalCases] = useState([]);

  // Auto-load contradictions
  useEffect(()=>{ (async ()=>{
    try{
      const r = await fetch(process.env.PUBLIC_URL + "/data/contradictions.all.json", { cache:"no-store" });
      if(r.ok){ const arr = await r.json(); if(Array.isArray(arr)&&arr.length) setContradictions(sanitizeContradictions(arr)); }
    }catch{}
  })(); },[]);
  // Auto-load dist
  useEffect(()=>{ (async ()=>{
    try{
      const r = await fetch(process.env.PUBLIC_URL + "/data/religion_distribution.world.json", { cache:"no-store" });
      if(r.ok){ const arr = await r.json(); if(Array.isArray(arr)) setReligionDist(arr); }
    }catch{}
  })(); },[]);
  // Auto-load legal
  useEffect(()=>{ (async ()=>{
    try{
      const r = await fetch(process.env.PUBLIC_URL + "/data/legal_cases.template.json", { cache:"no-store" });
      if(r.ok){ const arr = await r.json(); if(Array.isArray(arr)) setLegalCases(arr); }
    }catch{}
  })(); },[]);

  const ctx = { contradictions, setContradictions, religionDist, setReligionDist, legalCases, setLegalCases };

  return (
    <DataCtx.Provider value={ctx}>
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <TopBar view={view} setView={setView} />
        <main className="max-w-7xl mx-auto p-4 space-y-4">
          {view === "network" && <NetworkView />}
          {view === "timeline" && <TimelineView />}
          {view === "matrix" && <MatrixView />}
          {view === "immorality" && <ImmoralityView />}
          {view === "science" && <ScienceView />}
          {view === "religions" && <ReligionsView />}
          {view === "global" && <GlobalCountsView />}
          {view === "legal" && <LegalCasesView />}
        </main>
        <Footer />
      </div>
    </DataCtx.Provider>
  );
}

function TopBar({ view, setView }) {
  const tabs = [
    { id: "network", label: "Contradictions Network" },
    { id: "timeline", label: "Timeline" },
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
        Data loads from <code>public/data</code> if present, otherwise seeds. Use <code>?admin=1</code> (once) to unlock import buttons.
      </div>
    </footer>
  );
}

/* ============================== NETWORK VIEW ============================== */
function NetworkView() {
  const { contradictions, setContradictions } = useData();
  const [q, setQ] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [corpus, setCorpus] = useState("all"); // all|Bible|BoM|Cross
  const [timeline, setTimeline] = useState("all"); // all|OT|NT|BoM

  const filtered = useMemo(() => contradictions.filter((r) => {
    if (topicFilter !== "all" && r.topic !== topicFilter) return false;
    if (corpus !== "all" && relationOf(r) !== corpus) return false;
    if (timeline !== "all") {
      const ai = bookIndex(r.verseA.book), bi = bookIndex(r.verseB.book);
      const inOT = ai < BOOK_ORDER.indexOf("Matthew") && bi < BOOK_ORDER.indexOf("Matthew");
      const inNT = ai >= BOOK_ORDER.indexOf("Matthew") && ai <= BOOK_ORDER.indexOf("Revelation") && bi >= BOOK_ORDER.indexOf("Matthew") && bi <= BOOK_ORDER.indexOf("Revelation");
      const inBoM = r.verseA.canon === "BoM" && r.verseB.canon === "BoM";
      if (timeline === "OT" && !inOT) return false;
      if (timeline === "NT" && !inNT) return false;
      if (timeline === "BoM" && !inBoM) return false;
    }
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      (r.topic||"").toLowerCase().includes(s) ||
      (r.verseA?.ref||"").toLowerCase().includes(s) ||
      (r.verseB?.ref||"").toLowerCase().includes(s) ||
      (r.summary||"").toLowerCase().includes(s) ||
      (r.detail||"").toLowerCase().includes(s)
    );
  }), [contradictions, topicFilter, corpus, timeline, q]);

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
    }).catch(()=>{});
    return () => { cancelled = true; };
  }, [filtered]);

  const topics = useMemo(() => Array.from(new Set(contradictions.map(r=>r.topic))).sort(), [contradictions]);

  function onImport(e) {
    if (!isAdmin()) return;
    const f = e.target.files[0]; if (!f) return; const r = new FileReader();
    r.onload = (ev) => { try {
      const arr = JSON.parse(ev.target.result);
      if (!Array.isArray(arr)) throw new Error("JSON must be an array");
      setContradictions(sanitizeContradictions(arr));
      alert("Imported " + arr.length + " rows.");
    } catch (err) { alert("Parse error: " + err.message); } };
    r.readAsText(f);
  }

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
      <div className="text-xs text-slate-500 mb-2">Drag nodes, wheel to zoom. Nodes are clamped inside the frame.</div>
      <div ref={hostRef} className="w-full border rounded-xl overflow-hidden bg-slate-25" />
    </Card>
  );
}

function sanitizeContradictions(arr) {
  return arr.map((x, i) => ({
    id: x.id || `imp_${i}`,
    topic: x.topic || "Uncategorized",
    verseA: x.verseA || { ref: "?", book: "?", canon: "Bible" },
    verseB: x.verseB || { ref: "?", book: "?", canon: "Bible" },
    summary: x.summary || "",
    detail: x.detail || ""
  }));
}

/* ============================== TIMELINE VIEW ============================== */
function TimelineView(){
  const { contradictions } = useData();
  const [q, setQ] = useState("");
  const [corpus, setCorpus] = useState("all");
  const [topic, setTopic] = useState("all");
  const hostRef = useRef(null);

  const topics = useMemo(()=> Array.from(new Set(contradictions.map(r=>r.topic))).sort(), [contradictions]);

  const rows = useMemo(()=> contradictions.filter(r=>{
    if (corpus!=="all" && relationOf(r)!==corpus) return false;
    if (topic!=="all" && r.topic!==topic) return false;
    if (q){
      const s=q.toLowerCase();
      if(!((r.topic||"").toLowerCase().includes(s) || (r.summary||"").toLowerCase().includes(s) || (r.detail||"").toLowerCase().includes(s) || (r.verseA?.ref||"").toLowerCase().includes(s) || (r.verseB?.ref||"").toLowerCase().includes(s))) return false;
    }
    return true;
  }),[contradictions, corpus, topic, q]);

  useEffect(()=>{
    let cancelled=false;
    import("d3").then(d3=>{
      if(cancelled) return;
      const el=hostRef.current; if(!el) return;
      const width = el.clientWidth||960, height=420, margin={top:20,right:20,bottom:40,left:20};

      const root=d3.select(el); root.selectAll("svg").remove();
      const svg=root.append("svg").attr("width","100%").attr("height",height).attr("viewBox",`0 0 ${width} ${height}`);
      const g=svg.append("g").attr("transform",`translate(${margin.left},${margin.top})`);
      const innerW=width-margin.left-margin.right, innerH=height-margin.top-margin.bottom;

      const x=d3.scalePoint().domain(BOOK_ORDER).range([0, innerW]).padding(0.5);

      // axis
      const bookTicks = BOOK_ORDER.filter((_,i)=> i%3===0);
      g.append("g").attr("transform",`translate(0,${innerH})`)
        .call(d3.axisBottom(x).tickValues(bookTicks).tickSize(0))
        .selectAll("text").attr("font-size",10).attr("text-anchor","end").attr("transform","rotate(-45)").attr("dx","-0.4em").attr("dy","0.2em");

      const zoom = d3.zoom().scaleExtent([0.6,4]).on("zoom", (ev)=>{
        g.attr("transform", `translate(${ev.transform.x},${ev.transform.y}) scale(${ev.transform.k})`);
      });
      svg.call(zoom);

      const topicList = Array.from(new Set(rows.map(r=>r.topic)));
      const yTopic = d3.scalePoint().domain(topicList).range([0, innerH-40]).padding(0.5);
      const color = d3.scaleOrdinal(d3.schemeTableau10).domain(topicList);

      // edges
      const edges = rows.map(r=>({
        x1:x(r.verseA.book), x2:x(r.verseB.book),
        y: yTopic(r.topic) || (innerH/2),
        r
      })).filter(e=> e.x1!=null && e.x2!=null);

      const edgeG = g.append("g").attr("stroke","#94a3b8").attr("stroke-opacity",0.9).attr("fill","none");
      edgeG.selectAll("path").data(edges).join("path")
        .attr("d", d=>{
          const y = d.y, c = (d.x1 + d.x2)/2;
          return `M${d.x1},${y} C${c},${y-30} ${c},${y+30} ${d.x2},${y}`;
        })
        .attr("stroke-width",1.6)
        .append("title").text(d=>`${d.r.topic}\n${d.r.verseA.ref} ↔ ${d.r.verseB.ref}`);

      // nodes
      const nodeG = g.append("g");
      nodeG.selectAll("circle").data(edges.flatMap(e=>[
        {x:e.x1, y:e.y, topic:e.r.topic, label:e.r.verseA.ref},
        {x:e.x2, y:e.y, topic:e.r.topic, label:e.r.verseB.ref}
      ])).join("circle")
        .attr("cx",d=>d.x).attr("cy",d=>d.y)
        .attr("r",4).attr("fill",d=>color(d.topic)).attr("stroke","#0f172a").attr("stroke-opacity",0.15)
        .append("title").text(d=>d.label);

      // legend
      const legend = svg.append("g").attr("transform",`translate(${width-160},10)`);
      legend.append("text").text("Topics").attr("font-size",12).attr("font-weight",600).attr("y",0);
      const lg = legend.append("g").attr("transform","translate(0,10)");
      topicList.slice(0,10).forEach((t,i)=>{
        lg.append("circle").attr("cx",8).attr("cy",i*16).attr("r",5).attr("fill",color(t));
        lg.append("text").attr("x",20).attr("y",i*16+4).attr("font-size",11).text(t);
      });
    });
    return ()=>{cancelled=true;};
  },[rows]);

  return (
    <Card
      title="Contradictions Timeline"
      right={
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…" className="border rounded p-1" />
          <select value={corpus} onChange={e=>setCorpus(e.target.value)} className="border rounded p-1">
            <option value="all">All corpora</option>
            <option value="Bible">Bible</option>
            <option value="BoM">Book of Mormon</option>
            <option value="Cross">Bible ↔ BoM</option>
          </select>
          <select value={topic} onChange={e=>setTopic(e.target.value)} className="border rounded p-1">
            <option value="all">All topics</option>
            {topics.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      }
    >
      <div className="text-xs text-slate-500 mb-2">Zoom/pan enabled. Lines connect verses between books; color by topic.</div>
      <div ref={hostRef} className="w-full border rounded-xl overflow-hidden bg-white" />
    </Card>
  );
}

/* ============================== MATRIX VIEW ============================== */
function MatrixView(){
  const { contradictions } = useData();
  const [bookFilter, setBookFilter] = useState("all");
  const [corpus, setCorpus] = useState("all");
  const [topic, setTopic] = useState("all");
  const [q, setQ] = useState("");

  const books = useMemo(() => Array.from(new Set(contradictions.flatMap(r=>[r.verseA.book, r.verseB.book]))).filter(Boolean).sort((a,b)=>bookIndex(a)-bookIndex(b)), [contradictions]);
  const topics = useMemo(()=> Array.from(new Set(contradictions.map(r=>r.topic))).sort(), [contradictions]);

  const filtered = useMemo(()=> contradictions.filter(r=>{
    if (bookFilter!=="all" && !(r.verseA.book===bookFilter || r.verseB.book===bookFilter)) return false;
    if (corpus!=="all" && relationOf(r)!==corpus) return false;
    if (topic!=="all" && r.topic!==topic) return false;
    if (q){
      const s=q.toLowerCase();
      if(!((r.topic||"").toLowerCase().includes(s) || (r.summary||"").toLowerCase().includes(s) || (r.detail||"").toLowerCase().includes(s) || (r.verseA?.ref||"").toLowerCase().includes(s) || (r.verseB?.ref||"").toLowerCase().includes(s))) return false;
    }
    return true;
  }),[contradictions, bookFilter, corpus, topic, q]);

  const [selected, setSelected] = useState(null);

  return (
    <Card
      title="Contradictions Matrix"
      right={
        <div className="flex flex-wrap gap-2 text-sm">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…" className="border rounded p-1" />
          <select value={bookFilter} onChange={(e)=>setBookFilter(e.target.value)} className="border rounded p-1"><option value="all">All books</option>{books.map(b=> <option key={b} value={b}>{b}</option>)}</select>
          <select value={corpus} onChange={e=>setCorpus(e.target.value)} className="border rounded p-1">
            <option value="all">All corpora</option><option value="Bible">Bible</option><option value="BoM">Book of Mormon</option><option value="Cross">Bible ↔ BoM</option>
          </select>
          <select value={topic} onChange={e=>setTopic(e.target.value)} className="border rounded p-1"><option value="all">All topics</option>{topics.map(t=> <option key={t} value={t}>{t}</option>)}</select>
        </div>
      }
    >
      <table className="w-full text-sm">
        <thead><tr className="text-left border-b"><th className="py-2">Topic</th><th>Verse A</th><th>Verse B</th><th>Summary</th></tr></thead>
        <tbody>
          {filtered.map(r=> (
            <tr key={r.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={()=>setSelected(r)}>
              <td className="py-2 font-medium">{r.topic}</td>
              <td>{r.verseA.ref}</td>
              <td>{r.verseB.ref}</td>
              <td className="text-slate-600">{r.summary}</td>
            </tr>
          ))}
          {filtered.length===0 && <tr><td colSpan="4" className="py-6 text-center text-slate-500">No rows</td></tr>}
        </tbody>
      </table>
      {selected && (
        <div className="mt-3 p-3 border rounded-lg bg-slate-50">
          <div className="font-semibold">{selected.topic}</div>
          <div className="text-sm">{selected.verseA?.ref} ↔ {selected.verseB?.ref}</div>
          <div className="text-sm mt-1">{selected.summary}</div>
          {selected.detail && <div className="text-xs mt-1 text-slate-600">{selected.detail}</div>}
        </div>
      )}
    </Card>
  );
}

/* ============================== IMMORALITY VIEW ============================== */
function ImmoralityView(){
  const [rows] = useState(IMMORALITY_SEED);
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
  const [rows] = useState(SCIENCE_ITEMS);
  return (
    <Card title="Scientific Inaccuracies & Why They Conflict with Natural Laws">
      <div className="space-y-3">
        {rows.map(s=> (
          <div key={s.id} className="border rounded-lg p-3">
            <div className="font-semibold">{s.story}</div>
            <div className="text-sm">Refs: {s.refs.join(", ")}</div>
            <div className="text-sm mt-1">{s.summary}</div>
            <div className="grid md:grid-cols-3 gap-2 mt-2 text-sm">
              <div><div className="font-medium">Laws</div><ul className="list-disc pl-5">{s.mechanisms.laws.map((x,i)=><li key={i}>{x}</li>)}</ul></div>
              <div><div className="font-medium">Why</div><ul className="list-disc pl-5">{s.mechanisms.why.map((x,i)=><li key={i}>{x}</li>)}</ul></div>
              <div><div className="font-medium">Observations</div><ul className="list-disc pl-5">{s.mechanisms.observations.map((x,i)=><li key={i}>{x}</li>)}</ul></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ============================== RELIGIONS VIEW (choropleth, legend, tooltips) ============================== */
function ReligionsView(){
  const [tree] = useState(RELIGION_TREE);
  const { religionDist, setReligionDist } = useData();

  const [selectedReligion, setSelectedReligion] = useState("All");

  const years = useMemo(()=> {
    const ys = Array.from(new Set(religionDist.map(d=>+d.year))).filter(n=>!Number.isNaN(n)).sort((a,b)=>a-b);
    return ys.length? ys : [2000];
  },[religionDist]);
  const [year, setYear] = useState(years[0]);
  useEffect(()=>{ if(years.length) setYear(years[0]); },[years]);

  function onImportDist(e){
    if(!isAdmin()) return;
    const f = e.target.files[0]; if(!f) return; const r = new FileReader();
    r.onload = (ev)=>{ try{ const arr = JSON.parse(ev.target.result); if(Array.isArray(arr)) { setReligionDist(arr); alert("Distribution rows: "+arr.length); } else { throw new Error("Expected array"); } } catch(err){ alert("Parse error: "+err.message); } };
    r.readAsText(f);
  }

  // Geo load (must be GeoJSON FeatureCollection)
  const hostRef = useRef(null);
  const tooltipRef = useRef(null);
  const [geoError, setGeoError] = useState("");
  const [geo, setGeo] = useState(null);
  useEffect(()=>{ (async ()=>{
    try{
      const r = await fetch(process.env.PUBLIC_URL + "/data/world.geo.json", { cache:"no-store" });
      if(!r.ok){ setGeoError("Could not fetch /data/world.geo.json (place it under public/data)."); return; }
      const gj = await r.json();
      if (gj?.type !== "FeatureCollection" || !Array.isArray(gj.features)) {
        setGeoError("world.geo.json must be a GeoJSON FeatureCollection with a 'features' array.");
        setGeo(null);
        return;
      }
      setGeo(gj);
      setGeoError("");
    } catch(e){ setGeoError("Failed to load world.geo.json: " + e.message); setGeo(null); }
  })(); },[]);

  // draw map
  useEffect(()=>{
    let cancelled=false;
    if(!geo){ return; }
    import("d3").then(d3=>{
      if(cancelled) return;
      const el=hostRef.current; if(!el) return;

      const width = el.clientWidth||960, height=480;

      const root=d3.select(el); root.selectAll("svg").remove();
      const svg=root.append("svg").attr("width","100%").attr("height",height).attr("viewBox",`0 0 ${width} ${height}`);
      const g=svg.append("g");

      // Projection & path
      const projection = d3.geoNaturalEarth1().fitSize([width, height], geo);
      const path = d3.geoPath(projection);

      // Graticule for visual detail
      const graticule = d3.geoGraticule();
      g.append("path").attr("d", path(graticule())).attr("fill","none").attr("stroke","#e2e8f0").attr("stroke-width",0.6);

      // Prepare data lookup for this year + religion
      const rows = religionDist.filter(d=> +d.year === +year && (selectedReligion==="All" || d.religion===selectedReligion));
      const byCountry = new Map();
      rows.forEach(d=>{
        const key = String(d.country||"").toUpperCase();
        const val = Number(d.shareIndex);
        byCountry.set(key, (byCountry.get(key)||0) + (Number.isFinite(val) ? val : 0));
      });

      // Scale: quantize for better legend/ticks
      const values = Array.from(byCountry.values());
      const maxVal = values.length ? Math.max(...values, 1) : 1;
      const color = d3.scaleQuantize().domain([0, maxVal]).range(d3.schemeBlues[7]);

      // Zoom/pan + reset
      const zoom = d3.zoom().scaleExtent([0.9, 12]).on("zoom", (ev)=> g.attr("transform", ev.transform));
      svg.call(zoom);
      const resetBtn = svg.append("g").attr("transform", `translate(${width-90},${20})`).style("cursor","pointer");
      resetBtn.append("rect").attr("width",70).attr("height",24).attr("rx",6).attr("fill","#0f172a").attr("opacity",0.9);
      resetBtn.append("text").attr("x",35).attr("y",16).attr("text-anchor","middle").attr("fill","white").attr("font-size",12).text("Reset");
      resetBtn.on("click", ()=> svg.transition().duration(250).call(zoom.transform, d3.zoomIdentity));

      // Tooltip div
      const tdiv = d3.select(tooltipRef.current);
      function showTip(html, x, y){
        tdiv.style("opacity", 1).style("left", (x+10)+"px").style("top",(y+10)+"px").html(html);
      }
      function hideTip(){ tdiv.style("opacity", 0); }

      // Draw countries
      const features = geo.features || [];
      g.selectAll("path.country").data(features).join("path")
        .attr("class","country")
        .attr("d", path)
        .attr("stroke","#94a3b8").attr("stroke-width",0.5)
        .attr("fill", (d)=>{
          const props = d.properties || {};
          const iso = (props.ISO_A3 || props.iso_a3 || props.ADM0_A3 || props.adm0_a3 || props.A3 || "").toUpperCase();
          const name = (props.ADMIN || props.admin || props.NAME || props.name || "").toUpperCase();
          const val = byCountry.get(iso) ?? byCountry.get(name) ?? 0;
          return color(val);
        })
        .on("mousemove", (ev, d)=>{
          const props = d.properties || {};
          const iso = (props.ISO_A3 || props.iso_a3 || props.ADM0_A3 || props.adm0_a3 || props.A3 || "").toUpperCase();
          const name = (props.ADMIN || props.admin || props.NAME || props.name || "Unknown");
          const byIso = byCountry.get(iso);
          const byName = byCountry.get(name.toUpperCase());
          const val = byIso ?? byName ?? 0;
          const totalAll = (selectedReligion!=="All")
            ? // how much of *any* religion in this country this year (sum all rows)
              (religionDist.filter(d=>+d.year===+year && (String(d.country||"").toUpperCase()===iso || String(d.country||"").toUpperCase()===name.toUpperCase()))
               .reduce((acc,d)=> acc+(Number(d.shareIndex)||0),0))
            : val;
          const html = `
            <div style="font-weight:600;">${name}</div>
            <div style="font-size:12px;">Year: ${year}</div>
            <div style="font-size:12px;">${selectedReligion==="All" ? "All religions (sum)" : selectedReligion}: <b>${val.toFixed(2)}</b></div>
            ${selectedReligion!=="All" ? `<div style="font-size:12px;">All religions (sum): <b>${totalAll.toFixed(2)}</b></div>` : ""}
          `;
          showTip(html, ev.clientX, ev.clientY);
        })
        .on("mouseleave", hideTip);

      // Legend with ticks
      const legendW=180, legendH=10, legendSteps = color.range().length;
      const legendX = d3.scaleLinear().domain(color.domain()).range([0, legendW]);
      const legendG = svg.append("g").attr("transform",`translate(${width-legendW-18},${height-34})`);
      // gradient blocks
      const stepW = legendW / legendSteps;
      color.range().forEach((col, i)=>{
        legendG.append("rect").attr("x", i*stepW).attr("y", 0).attr("width", stepW+0.1).attr("height", legendH).attr("fill", col).attr("stroke","#94a3b8").attr("stroke-width",0.3);
      });
      // axis
      const axis = d3.axisBottom(legendX).ticks(5).tickSize(4);
      legendG.append("g").attr("transform",`translate(0,${legendH})`).call(axis).selectAll("text").attr("font-size",10);
      legendG.append("text").text("Share index").attr("font-size",10).attr("y",-4);

    });
    return ()=>{ cancelled=true; };
  },[geo, religionDist, year, selectedReligion]);

  return (
    <Card
      title="World Religions"
      right={
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {isAdmin() && <input type="file" accept="application/json" onChange={onImportDist} title="Import distribution JSON" />}
        </div>
      }
    >
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="border rounded-lg p-3">
          <div className="font-semibold mb-2">Main branches (expandable)</div>
          <ExpandableTree data={tree} />
        </div>
        <div className="border rounded-lg p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 border-b">
            <div className="font-semibold">World map</div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm">Religion</label>
              <select value={selectedReligion} onChange={e=>setSelectedReligion(e.target.value)} className="border rounded p-1">
                <option value="All">All</option>
                {Array.from(new Set(religionDist.map(d=>d.religion))).sort().map(r=> <option key={r} value={r}>{r}</option>)}
              </select>
              <label className="text-sm">Year</label>
              <input type="range" min={years[0]} max={years[years.length-1]} value={year} onChange={e=>setYear(+e.target.value)} />
              <span className="text-sm">{year}</span>
            </div>
          </div>
          <div className="relative">
            {geoError && <div className="text-xs text-red-600 m-3">{geoError}</div>}
            {(!religionDist || religionDist.length===0) && (
              <div className="text-xs text-amber-700 m-3">No distribution data loaded yet. Add <code>public/data/religion_distribution.world.json</code> to color the map.</div>
            )}
            <div ref={hostRef} className="w-full h-[480px] border rounded-xl overflow-hidden bg-white" />
            <div ref={tooltipRef}
                 style={{position:"fixed", pointerEvents:"none", background:"rgba(0,0,0,0.75)", color:"#fff", padding:"6px 8px", borderRadius:"6px", fontSize:12, opacity:0, zIndex:50}} />
          </div>
          <div className="text-xs text-slate-600 mt-2 px-3 pb-3">Format: {'{country, year, religion, shareIndex}'}. Country can be ISO3 (e.g., USA) or name (e.g., UNITED STATES).</div>
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
  const { contradictions, religionDist, legalCases } = useData();
  return (
    <Card title="Global Overview">
      <div className="grid md:grid-cols-3 gap-3">
        <Stat label="Contradictions" value={contradictions.length} />
        <Stat label="Religion dist rows" value={religionDist.length} />
        <Stat label="Legal cases" value={legalCases.length} />
      </div>
      <div className="text-xs text-slate-500 mt-2">Counts reflect currently loaded datasets.</div>
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
  const { legalCases, setLegalCases } = useData();
  function onImport(e){
    if(!isAdmin()) return;
    const f = e.target.files[0]; if(!f) return; const r = new FileReader();
    r.onload = (ev)=>{ try{ const arr = JSON.parse(ev.target.result); if(Array.isArray(arr)){ setLegalCases(arr); alert("Legal cases imported: "+arr.length); } else { throw new Error("Expected array"); } } catch(err){ alert("Parse error: "+err.message); } };
    r.readAsText(f);
  }

  return (
    <Card title="Religious Legal Landscape" right={isAdmin() && <input type="file" accept="application/json" onChange={onImport} title="Import legal cases JSON" /> }>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b"><th className="py-2">Group</th><th>Country</th><th>Year</th><th>Type</th><th>Outcome</th></tr>
        </thead>
        <tbody>
          {legalCases.map((r,i)=> (
            <tr key={i} className="border-b hover:bg-slate-50">
              <td className="py-2">{r.groupName}</td>
              <td>{r.country}</td>
              <td>{r.year}</td>
              <td>{r.allegedOffenseType}</td>
              <td className="text-slate-600">{r.outcome}</td>
            </tr>
          ))}
          {legalCases.length===0 && (
            <tr><td colSpan="5" className="py-6 text-center text-slate-500">No rows yet — add <code>public/data/legal_cases.template.json</code> or import a file (admin only)</td></tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}
