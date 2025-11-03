import React, { useEffect, useRef, useState } from "react";

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
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Religious Text Visualizer
        </h1>
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
      <div className="px-4 py-3 border-b flex items-center justify-between">
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
        Import/Export buttons accept JSON or CSV where noted. Network view
        requires d3 (<code>npm install d3</code>).
      </div>
    </footer>
  );
}

/* ============================== DATA ============================== */
// Contradictions seed. Schema (ASCII only):
// {
//   id: string,
//   topic: string,
//   verseA: { ref: string, book: string, canon: "Bible" | "BoM" },
//   verseB: { ref: string, book: string, canon: "Bible" | "BoM" },
//   summary: string,
//   detail: string
// }
const CONTRADICTIONS_SEED = [
  {
    id: "c1",
    topic: "Creation order",
    verseA: { ref: "Genesis 1:24-27", book: "Genesis", canon: "Bible" },
    verseB: { ref: "Genesis 2:18-19", book: "Genesis", canon: "Bible" },
    summary:
      "Genesis 1 seems to place humans after animals, Genesis 2 appears to place man before animals.",
    detail:
      "Genesis 1 presents a structured sequence culminating in mankind after animals. Genesis 2 narrates man formed, then animals formed and brought to him. Harmonizations appeal to Hebrew verb aspects (had formed) or different scopes, but in plain reading the order differs."
  },
  {
    id: "c2",
    topic: "Seeing God",
    verseA: { ref: "Exodus 33:20", book: "Exodus", canon: "Bible" },
    verseB: { ref: "Genesis 32:30", book: "Genesis", canon: "Bible" },
    summary:
      "No one can see God and live vs Jacob says he saw God face to face.",
    detail:
      "Exodus 33:20 says no man can see Gods face and live; Genesis 32:30 has Jacob naming the place Peniel because he saw God face to face and lived. Explanations often say one is the Fathers unveiled glory vs an angel or theophany; the tension is explicit if both are literal."
  },
  {
    id: "c3",
    topic: "Death of Judas",
    verseA: { ref: "Matthew 27:5", book: "Matthew", canon: "Bible" },
    verseB: { ref: "Acts 1:18", book: "Acts", canon: "Bible" },
    summary:
      "Judas hanged himself vs he fell and burst open; field bought by priests vs by Judas.",
    detail:
      "Matthew says Judas hanged himself and the priests bought the field with the money. Acts says Judas bought a field and fell headlong, bursting open. Harmonizations include a rope breaking and legal ownership nuances; the narratives diverge on mechanism and purchaser."
  },
  {
    id: "c4",
    topic: "Resurrection witnesses",
    verseA: { ref: "Mark 16:1-8", book: "Mark", canon: "Bible" },
    verseB: { ref: "Matthew 28:1-10", book: "Matthew", canon: "Bible" },
    summary:
      "Who came, what they saw, and whether they told anyone differ.",
    detail:
      "Mark ends (in earliest manuscripts) with women fleeing and telling no one for fear. Matthew has appearances, worship, and a different angel scene. Apologists harmonize by ordering events; plain summaries differ on silence, messengers, and post-tomb encounters."
  },
  {
    id: "c5",
    topic: "Census numbers",
    verseA: { ref: "2 Samuel 24:9", book: "2 Samuel", canon: "Bible" },
    verseB: { ref: "1 Chronicles 21:5", book: "1 Chronicles", canon: "Bible" },
    summary: "Different totals for Israel and Judah.",
    detail:
      "Samuel gives about 800k Israel + 500k Judah; Chronicles gives 1.1M Israel + 470k Judah. Explanations cite excluded groups or rounding; the raw totals do not match."
  },
  {
    id: "c6",
    topic: "Gods nature: change or no change",
    verseA: { ref: "Malachi 3:6", book: "Malachi", canon: "Bible" },
    verseB: { ref: "Exodus 32:14", book: "Exodus", canon: "Bible" },
    summary: "God does not change vs God relents.",
    detail:
      "Malachi states God does not change; Exodus depicts God relenting from intended judgment after Moses intercedes. Some argue anthropopathic language; the narratives present different portrayals."
  },
  {
    id: "c7",
    topic: "Faith vs works",
    verseA: { ref: "James 2:24", book: "James", canon: "Bible" },
    verseB: { ref: "Romans 3:28", book: "Romans", canon: "Bible" },
    summary:
      "Justified by works and not by faith alone vs justified by faith apart from works.",
    detail:
      "James focuses on living faith evidenced by works; Paul on justification apart from works of the Law. The emphasis and wording appear opposed; theological harmonizations differentiate types of works or moments of justification."
  },
  {
    id: "c8",
    topic: "BoM vs Bible: salvation and law",
    verseA: { ref: "2 Nephi 25:23", book: "2 Nephi", canon: "BoM" },
    verseB: { ref: "Ephesians 2:8-9", book: "Ephesians", canon: "Bible" },
    summary:
      "By grace we are saved, after all we can do vs by grace through faith, not of works.",
    detail:
      "2 Nephi includes a clause often read as adding a works component; Ephesians stresses grace through faith not by works. LDS exegesis reads 2 Nephi as reliance on Christ after our efforts; critics see a tension with Paul."
  },
  {
    id: "c9",
    topic: "BoM vs Bible: geography",
    verseA: { ref: "Alma 22:27-34", book: "Alma", canon: "BoM" },
    verseB: { ref: "No parallel", book: "-", canon: "Bible" },
    summary:
      "Book of Mormon describes American geography and civilizations absent from Bible chronology.",
    detail:
      "BoM posits large pre-Columbian civilizations with Christian theology pre-1st century. Bible chronology is centered in the Near East. The contradiction is not verse-to-verse but cross-corpus historical claims."
  }
];

// Immorality dataset (seed). Schema:
// { id, category, ref, canon: "Bible"|"BoM", commanded: boolean, estCount: number|null, note }
const IMMORALITY_SEED = [
  {
    id: "m1",
    category: "Killing by God",
    ref: "Genesis 7:21-23 (Flood)",
    canon: "Bible",
    commanded: true,
    estCount: null,
    note: "Global flood narrative describes near-total loss of life."
  },
  {
    id: "m2",
    category: "Genocide",
    ref: "Deuteronomy 20:16-18",
    canon: "Bible",
    commanded: true,
    estCount: null,
    note: "Cities of the Canaanites to be devoted to destruction."
  },
  {
    id: "m3",
    category: "Slavery",
    ref: "Leviticus 25:44-46",
    canon: "Bible",
    commanded: true,
    estCount: null,
    note: "Rules allowing acquisition of slaves from nations around."
  },
  {
    id: "m4",
    category: "Rape",
    ref: "Deuteronomy 22:28-29",
    canon: "Bible",
    commanded: true,
    estCount: null,
    note:
      "Law about bride price after seizing an unbetrothed virgin; widely criticized as unjust."
  },
  {
    id: "m5",
    category: "Patricide/Filicide",
    ref: "Genesis 22:2 (test)",
    canon: "Bible",
    commanded: true,
    estCount: 1,
    note:
      "Abraham commanded to offer Isaac; halted before completion."
  },
  {
    id: "m6",
    category: "Killing by God",
    ref: "Acts 5:1-10",
    canon: "Bible",
    commanded: true,
    estCount: 2,
    note:
      "Ananias and Sapphira struck dead after deceit."
  },
  {
    id: "m7",
    category: "Genocide",
    ref: "1 Samuel 15:3",
    canon: "Bible",
    commanded: true,
    estCount: null,
    note:
      "Amalekites to be destroyed including infants; Saul censured for sparing."
  },
  {
    id: "m8",
    category: "Violence",
    ref: "Ether 15 (civil war)",
    canon: "BoM",
    commanded: false,
    estCount: null,
    note:
      "Late Book of Mormon depicts massive casualties in civil conflict."
  }
];

// Science items. Schema:
// { id, story, refs[], summary, mechanisms: { laws: string[], why: string[], observations: string[] } }
const SCIENCE_ITEMS = [
  {
    id: "s1",
    story: "Noahs Ark and global flood",
    refs: ["Genesis 6-9"],
    summary:
      "A global deluge and a wooden ark housing all animal kinds for about a year.",
    mechanisms: {
      laws: [
        "Structural limits of large wooden ships",
        "Population genetics and inbreeding",
        "Fluid dynamics and salinity of marine ecosystems"
      ],
      why: [
        "Timber hulls beyond ~100-120 m suffer severe hogging/sagging without metal bracing; ark dimensions approach failure for unbraced wood.",
        "Starting with pairs leads to extreme inbreeding depression and loss of heterozygosity not observed across many taxa.",
        "Mixing of freshwater and saltwater plus heavy sediment load would kill many fish, corals, and invertebrates; corals require low turbidity and consistent salinity."
      ],
      observations: [
        "Ice cores, tree rings, and speleothems show continuous local records spanning > 10k years with no global interruption.",
        "Global stratigraphy shows diverse depositional environments over long periods, not a single-year, worldwide deposit."
      ]
    }
  },
  {
    id: "s2",
    story: "Joshuas long day",
    refs: ["Joshua 10:12-14"],
    summary:
      "Sun and moon stand still so battle can continue.",
    mechanisms: {
      laws: [
        "Conservation of angular momentum",
        "Inertial frames and atmospheric coupling"
      ],
      why: [
        "Stopping Earths rotation would require or release ~2.6e29 J (order of magnitude), producing global cataclysmic winds and tsunamis.",
        "Oceans and atmosphere would continue moving at hundreds of m/s relative to ground; no worldwide devastation is recorded."
      ],
      observations: [
        "No synchronized global historical records of such an event from other civilizations."
      ]
    }
  },
  {
    id: "s3",
    story: "Firmament or dome cosmology",
    refs: ["Genesis 1:6-8"],
    summary:
      "A solid dome holding back waters above with lights set in it.",
    mechanisms: {
      laws: ["Gas laws and gravity", "Astronomical distances"],
      why: [
        "Atmosphere is a compressible gas with pressure gradient explained by gravity; there is no physical solid dome.",
        "Stars are distant suns; placing them in a nearby dome contradicts parallax and observed spectra."
      ],
      observations: [
        "Satellites and spacecraft traverse outer space without encountering a physical barrier."
      ]
    }
  },
  {
    id: "s4",
    story: "Young Earth chronology (6-10k years)",
    refs: ["Genealogies; Ussher chronology"],
    summary:
      "Dating creation based on biblical genealogies.",
    mechanisms: {
      laws: ["Radioactive decay", "Speed of light", "Plate tectonics"],
      why: [
        "Radiometric systems (U-Pb, Ar-Ar, Rb-Sr) converge on ages >> 10k years for rocks and meteorites.",
        "Light from galaxies millions of light-years away implies an old universe under finite c.",
        "Seafloor spreading rates and mountain building require deep time."
      ],
      observations: [
        "Ice cores with seasonal layers exceed 100k years; tree-ring series surpass 10k years."
      ]
    }
  },
  {
    id: "s5",
    story: "Jonah in a great fish",
    refs: ["Jonah 1-2"],
    summary:
      "Human survives days inside a fish/whale.",
    mechanisms: {
      laws: ["Human physiology", "Gastric acidity", "Respiration"],
      why: [
        "Lack of breathable air and exposure to gastric acid would be lethal within minutes to hours.",
        "No known marine species has a chamber providing safe respiration and waste removal for days."
      ],
      observations: [
        "No verified analogous survivals exist; accounts are considered miraculous or symbolic by interpreters."
      ]
    }
  }
];

// Religions (illustrative small list; import to replace)
const RELIGIONS = [
  { name: "Christianity", family: "Abrahamic", adherentsM: 2400, text: "Bible" },
  { name: "Islam", family: "Abrahamic", adherentsM: 1900, text: "Quran" },
  { name: "Hinduism", family: "Dharmic", adherentsM: 1200, text: "Vedas" },
  { name: "Buddhism", family: "Dharmic", adherentsM: 520, text: "Tipitaka" },
  { name: "Sikhism", family: "Dharmic", adherentsM: 30, text: "Guru Granth Sahib" },
  { name: "Judaism", family: "Abrahamic", adherentsM: 15, text: "Tanakh" }
];

/* ========================= CONTRADICTIONS NETWORK ========================= */
function NetworkView() {
  const ref = useRef(null);
  const [rows, setRows] = useState(CONTRADICTIONS_SEED);
  const [q, setQ] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [corpus, setCorpus] = useState("all"); // all | Bible | BoM | Cross
  const [selected, setSelected] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [ready, setReady] = useState(false);

  const topics = Array.from(new Set(rows.map((r) => r.topic))).sort();

  const filtered = rows.filter((r) => {
    if (topicFilter !== "all" && r.topic !== topicFilter) return false;
    if (corpus !== "all") {
      const a = r.verseA.canon || "Bible";
      const b = r.verseB.canon || "Bible";
      const rel = a === b ? a : "Cross";
      if (
        (corpus === "Bible" && rel !== "Bible") ||
        (corpus === "BoM" && rel !== "BoM") ||
        (corpus === "Cross" && rel !== "Cross")
      )
        return false;
    }
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      r.topic.toLowerCase().includes(s) ||
      r.verseA.ref.toLowerCase().includes(s) ||
      r.verseB.ref.toLowerCase().includes(s) ||
      (r.summary || "").toLowerCase().includes(s) ||
      (r.detail || "").toLowerCase().includes(s)
    );
  });

  function handleImportJson(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const arr = JSON.parse(ev.target.result);
        if (!Array.isArray(arr)) throw new Error("JSON must be an array");
        const clean = arr.map((x, i) => ({
          id: x.id || `imp_${i}`,
          topic: x.topic || "Uncategorized",
          verseA: x.verseA || { ref: "?", book: "?", canon: "Bible" },
          verseB: x.verseB || { ref: "?", book: "?", canon: "Bible" },
          summary: x.summary || "",
          detail: x.detail || ""
        }));
        setRows(clean);
        setSelected(null);
        alert("Imported " + clean.length + " rows.");
      } catch (err) {
        alert("Parse error: " + err.message);
      }
    };
    r.readAsText(f);
  }
  function handleExportJson() {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contradictions.filtered.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    let cancelled = false;
    import("d3")
      .then((d3) => {
        if (cancelled) return;
        const width = 960;
        const height = 520;
        const topicSet = Array.from(new Set(filtered.map((r) => r.topic)));
        const color = d3
          .scaleOrdinal(d3.schemeTableau10)
          .domain(topicSet);

        const nodeMap = new Map();
        const links = [];
        filtered.forEach((row) => {
          nodeMap.set(row.verseA.ref, {
            id: row.verseA.ref,
            topic: row.topic,
            row
          });
          nodeMap.set(row.verseB.ref, {
            id: row.verseB.ref,
            topic: row.topic,
            row
          });
          links.push({
            source: row.verseA.ref,
            target: row.verseB.ref,
            topic: row.topic,
            row
          });
        });
        const nodes = Array.from(nodeMap.values());

        // reset svg
        const root = d3.select(ref.current);
        root.selectAll("svg").remove();

        const svg = root
          .append("svg")
          .attr("width", "100%")
          .attr("height", height)
          .attr("viewBox", `0 0 ${width} ${height}`)
          .style("overflow", "visible");

        const sim = d3
          .forceSimulation(nodes)
          .force("link", d3.forceLink(links).id((d) => d.id).distance(150))
          .force("charge", d3.forceManyBody().strength(-320))
          .force("center", d3.forceCenter(width / 2, height / 2));

        const link = svg
          .append("g")
          .attr("stroke", "#cbd5e1")
          .attr("stroke-opacity", 0.9)
          .selectAll("line")
          .data(links)
          .join("line")
          .attr("stroke-width", 1.4);

        link
          .append("title")
          .text(
            (d) => `${d.row.topic}\n${d.row.verseA.ref} <-> ${d.row.verseB.ref}`
          );

        const node = svg
          .append("g")
          .selectAll("g")
          .data(nodes)
          .join("g")
          .call(
            d3
              .drag()
              .on("start", (ev, d) => {
                if (!ev.active) sim.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
              })
              .on("drag", (ev, d) => {
                d.fx = ev.x;
                d.fy = ev.y;
              })
              .on("end", (ev, d) => {
                if (!ev.active) sim.alphaTarget(0);
                d.fx = null;
                d.fy = null;
              })
          );

        node
          .append("circle")
          .attr("r", 12)
          .attr("fill", (d) => color(d.topic));

        node
          .append("text")
          .text((d) => d.id)
          .attr("x", 16)
          .attr("y", 4)
          .attr("font-size", 11);

        node
          .append("title")
          .text((d) => `Topic: ${d.topic}\n${d.id}`);

        node.on("click", (ev, d) => {
          const r = filtered.find(
            (x) => x.verseA.ref === d.id || x.verseB.ref === d.id
          );
          if (r) setSelected(r);
        });

        sim.on("tick", () => {
          link
            .attr("x1", (d) => d.source.x)
            .attr("y1", (d) => d.source.y)
            .attr("x2", (d) => d.target.x)
            .attr("y2", (d) => d.target.y);
          node.attr("transform", (d) => `translate(${d.x},${d.y})`);
        });

        setReady(true);
        return () => sim.stop();
      })
      .catch((err) =>
        setLoadError(err && err.message ? err.message : "Failed to load d3")
      );
    return () => {
      cancelled = true;
    };
  }, [q, rows, topicFilter, corpus]);

  return (
    <Card
      title="Contradictions Network"
      right={
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search topic or verse..."
            className="border rounded p-1"
          />
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="border rounded p-1"
          >
            <option value="all">All topics</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={corpus}
            onChange={(e) => setCorpus(e.target.value)}
            className="border rounded p-1"
          >
            <option value="all">All corpora</option>
            <option value="Bible">Bible only</option>
            <option value="BoM">Book of Mormon only</option>
            <option value="Cross">Bible ↔ BoM</option>
          </select>
          <input
            type="file"
            accept="application/json"
            onChange={handleImportJson}
            title="Import contradictions JSON"
          />
          <button onClick={handleExportJson} className="px-2 py-1 border rounded">
            Export
          </button>
          <InstallHint installed={ready} error={loadError} pkg="d3" />
        </div>
      }
    >
      <Legend topics={Array.from(new Set(filtered.map((r) => r.topic)))} />
      <div ref={ref} className="w-full min-h-[320px]" />

      {!selected ? (
        <div className="text-sm text-slate-600 mt-3">
          Click a node to view details. Import your own JSON to expand the
          dataset.
        </div>
      ) : (
        <div className="mt-4 border rounded-lg p-3 bg-slate-50">
          <div className="text-sm">Topic</div>
          <div className="font-semibold">{selected.topic}</div>
          <div className="grid md:grid-cols-2 gap-3 mt-2 text-sm">
            <div className="border rounded p-2 bg-white">
              <div className="text-xs text-slate-500">Verse A</div>
              <div className="font-medium">
                {selected.verseA.ref} ({selected.verseA.canon})
              </div>
            </div>
            <div className="border rounded p-2 bg-white">
              <div className="text-xs text-slate-500">Verse B</div>
              <div className="font-medium">
                {selected.verseB.ref} ({selected.verseB.canon})
              </div>
            </div>
          </div>
          {selected.summary && (
            <div className="mt-2 text-sm">
              <span className="font-medium">Summary:</span> {selected.summary}
            </div>
          )}
          {selected.detail && (
            <div className="mt-1 text-sm">
              <span className="font-medium">Why contradictory:</span>{" "}
              {selected.detail}
            </div>
          )}
          <div className="mt-2 text-right">
            <button
              className="px-2 py-1 border rounded text-sm"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

function Legend({ topics }) {
  const [colors, setColors] = useState([]);
  useEffect(() => {
    import("d3")
      .then((d3) => {
        const c = topics.map((t, i) => ({
          topic: t,
          color: d3.schemeTableau10[i % d3.schemeTableau10.length]
        }));
        setColors(c);
      })
      .catch(() => {});
  }, [topics]);
  if (!topics.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
      {topics.map((t, i) => (
        <span key={t} className="inline-flex items-center gap-1">
          <span
            className="inline-block w-3 h-3 rounded"
            style={{
              background: (colors[i] && colors[i].color) || "#94a3b8"
            }}
          />
          {t}
        </span>
      ))}
    </div>
  );
}

function InstallHint({ installed, error, pkg }) {
  if (installed) return null;
  return (
    <div className="text-xs text-slate-500">
      {error ? (
        <span>
          Could not load {pkg}. Run: <code>npm install {pkg}</code>
        </span>
      ) : (
        <span>
          Loading graph... If nothing appears, run:{" "}
          <code>npm install {pkg}</code>
        </span>
      )}
    </div>
  );
}

/* ============================== MATRIX ============================== */
function MatrixView() {
  const data = CONTRADICTIONS_SEED; // seed for deterministic grid
  const books = Array.from(
    new Set(data.flatMap((d) => [d.verseA.book, d.verseB.book]))
  ).sort();
  const grid = {};
  books.forEach((a) => {
    grid[a] = {};
    books.forEach((b) => (grid[a][b] = 0));
  });
  data.forEach((d) => {
    grid[d.verseA.book][d.verseB.book] += 1;
  });
  return (
    <Card title="Contradiction Matrix (book x book)">
      <div className="overflow-auto">
        <table className="table-auto text-sm border-collapse">
          <thead>
            <tr>
              <th className="p-2 border"></th>
              {books.map((b) => (
                <th key={b} className="p-2 border text-xs">
                  {b}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {books.map((row) => (
              <tr key={row}>
                <td className="p-2 border font-medium text-sm bg-slate-50">
                  {row}
                </td>
                {books.map((col) => {
                  const count = grid[row][col];
                  return (
                    <td key={col} className="p-2 border text-center">
                      {count > 0 ? (
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 border text-xs">
                          {count}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ============================== IMMORALITY ============================== */
function ImmoralityView() {
  const [rows, setRows] = useState(IMMORALITY_SEED);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [commanded, setCommanded] = useState("all"); // all | yes | no

  const cats = Array.from(new Set(rows.map((r) => r.category))).sort();
  const filtered = rows.filter((r) => {
    if (category !== "all" && r.category !== category) return false;
    if (commanded !== "all" && (commanded === "yes") !== !!r.commanded)
      return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      r.ref.toLowerCase().includes(s) ||
      (r.note || "").toLowerCase().includes(s) ||
      r.category.toLowerCase().includes(s)
    );
  });

  function importJson(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const arr = JSON.parse(ev.target.result);
        if (!Array.isArray(arr)) throw new Error("JSON must be an array");
        setRows(arr);
      } catch (err) {
        alert("Parse error: " + err.message);
      }
    };
    r.readAsText(f);
  }
  function exportJson() {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "immorality.filtered.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  const byCat = aggregateCount(filtered, "category");
  const byCmd = {
    Commanded: filtered.filter((x) => x.commanded).length,
    Descriptive: filtered.filter((x) => !x.commanded).length
  };

  return (
    <Card
      title="Examples of immorality (seed)"
      right={
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search..."
            className="border rounded p-1"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded p-1"
          >
            <option value="all">All categories</option>
            {cats.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={commanded}
            onChange={(e) => setCommanded(e.target.value)}
            className="border rounded p-1"
          >
            <option value="all">All</option>
            <option value="yes">Commanded</option>
            <option value="no">Descriptive</option>
          </select>
          <input type="file" accept="application/json" onChange={importJson} />
          <button onClick={exportJson} className="px-2 py-1 border rounded">
            Export
          </button>
        </div>
      }
    >
      <div className="grid md:grid-cols-2 gap-3">
        <Card title="By category">
          <BarList data={mapToBarData(byCat)} />
        </Card>
        <Card title="Commanded vs descriptive">
          <BarList
            data={[
              { label: "Commanded", value: byCmd.Commanded },
              { label: "Descriptive", value: byCmd.Descriptive }
            ]}
          />
        </Card>
      </div>

      <div className="overflow-auto mt-3">
        <table className="table-auto w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Ref</th>
              <th className="p-2 border">Canon</th>
              <th className="p-2 border">Commanded?</th>
              <th className="p-2 border">Est. count</th>
              <th className="p-2 border">Note</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((x, i) => (
              <tr key={i}>
                <td className="p-2 border">{x.category}</td>
                <td className="p-2 border">{x.ref}</td>
                <td className="p-2 border">{x.canon}</td>
                <td className="p-2 border">{x.commanded ? "Yes" : "No"}</td>
                <td className="p-2 border text-right">
                  {x.estCount == null ? "-" : x.estCount}
                </td>
                <td className="p-2 border">{x.note || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ============================== SCIENCE ============================== */
function ScienceView() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState(SCIENCE_ITEMS);
  const filtered = items.filter((s) => {
    if (!q) return true;
    const t = q.toLowerCase();
    return (
      s.story.toLowerCase().includes(t) ||
      s.summary.toLowerCase().includes(t) ||
      s.refs.join(" ").toLowerCase().includes(t) ||
      s.mechanisms.laws.join(" ").toLowerCase().includes(t) ||
      s.mechanisms.why.join(" ").toLowerCase().includes(t) ||
      (s.mechanisms.observations || []).join(" ").toLowerCase().includes(t)
    );
  });
  function exportJson() {
    const blob = new Blob([JSON.stringify(items, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "science.items.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  function importJson(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const arr = JSON.parse(ev.target.result);
        if (Array.isArray(arr)) setItems(arr);
        else alert("JSON must be an array");
      } catch (err) {
        alert("Parse error: " + err.message);
      }
    };
    r.readAsText(f);
  }
  return (
    <Card
      title="Scientific issues and why they conflict with nature"
      right={
        <div className="flex items-center gap-2 text-sm">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search laws, stories..."
            className="border rounded p-1"
          />
          <input type="file" accept="application/json" onChange={importJson} />
          <button onClick={exportJson} className="px-2 py-1 border rounded">
            Export
          </button>
        </div>
      }
    >
      {filtered.map((s) => (
        <div key={s.id} className="p-3 border rounded bg-white mb-3">
          <div className="text-base font-semibold">{s.story}</div>
          <div className="text-xs text-slate-600">
            Primary refs: {s.refs.join(", ")}
          </div>
          <p className="mt-2 text-sm text-slate-700">{s.summary}</p>
          <div className="mt-2 grid md:grid-cols-3 gap-3 text-sm">
            <div>
              <div className="font-medium">Laws of nature implicated</div>
              <ul className="list-disc list-inside space-y-1 mt-1">
                {s.mechanisms.laws.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-medium">Why it conflicts</div>
              <ul className="list-disc list-inside space-y-1 mt-1">
                {s.mechanisms.why.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-medium">Empirical observations</div>
              <ul className="list-disc list-inside space-y-1 mt-1">
                {(s.mechanisms.observations || []).map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </Card>
  );
}

/* ============================== RELIGIONS ============================== */
function ReligionsView() {
  const [sort, setSort] = useState("adherents");
  const rows = [...RELIGIONS].sort((a, b) =>
    sort === "adherents"
      ? b.adherentsM - a.adherentsM
      : a.name.localeCompare(b.name)
  );
  const max = Math.max(...rows.map((r) => r.adherentsM));
  return (
    <Card
      title="Top world religions (illustrative)"
      right={
        <div className="flex items-center gap-2 text-sm">
          <span>Sort:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border rounded p-1"
          >
            <option value="adherents">By adherents</option>
            <option value="name">By name</option>
          </select>
        </div>
      }
    >
      <div className="overflow-auto">
        <table className="min-w-full border border-slate-200 text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="border p-2 text-left">Religion</th>
              <th className="border p-2 text-left">Family</th>
              <th className="border p-2 text-left">Primary text</th>
              <th className="border p-2 text-right">Adherents (M)</th>
              <th className="border p-2 text-left">Bar</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="border p-2 font-medium">{r.name}</td>
                <td className="border p-2">{r.family}</td>
                <td className="border p-2">{r.text}</td>
                <td className="border p-2 text-right tabular-nums">
                  {r.adherentsM}
                </td>
                <td className="border p-2">
                  <div className="h-2 bg-slate-100 rounded">
                    <div
                      className="h-2 rounded"
                      style={{
                        width: `${Math.round((r.adherentsM / max) * 100)}%`,
                        background: "#0ea5e9"
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ============================== GLOBAL COUNTS ============================== */
function GlobalCountsView() {
  const [counts, setCounts] = useState({
    totalReligionsEstimate: 4300,
    totalDenominationsEstimate: 45000,
    notes: "Placeholders. Replace with sourced values."
  });
  const [history, setHistory] = useState([]);
  function snapshot() {
    setHistory((h) => [
      ...h,
      {
        t: Date.now(),
        r: counts.totalReligionsEstimate || 0,
        d: counts.totalDenominationsEstimate || 0
      }
    ]);
  }
  function onNum(key, v) {
    setCounts((c) => ({ ...c, [key]: v === "" ? null : Number(v) }));
  }
  return (
    <Card
      title="Global counts"
      right={
        <button className="px-2 py-1 border rounded text-sm" onClick={snapshot}>
          Snapshot
        </button>
      }
    >
      <div className="grid md:grid-cols-3 gap-3">
        <Stat label="Total religions (declared)" value={counts.totalReligionsEstimate} />
        <Stat label="Total sub-chapters (declared)" value={counts.totalDenominationsEstimate} />
        <Stat label="Branches in top dataset (derived)" value={RELIGIONS.length} />
      </div>
      <div className="grid md:grid-cols-3 gap-3 text-sm mt-3">
        <label className="border rounded p-3">
          Total religions
          <input
            type="number"
            className="border rounded p-1 w-full mt-1"
            value={counts.totalReligionsEstimate ?? ""}
            onChange={(e) => onNum("totalReligionsEstimate", e.target.value)}
          />
        </label>
        <label className="border rounded p-3">
          Total sub-chapters
          <input
            type="number"
            className="border rounded p-1 w-full mt-1"
            value={counts.totalDenominationsEstimate ?? ""}
            onChange={(e) => onNum("totalDenominationsEstimate", e.target.value)}
          />
        </label>
        <label className="border rounded p-3">
          Notes
          <textarea
            rows={3}
            className="border rounded p-1 w-full mt-1"
            value={counts.notes || ""}
            onChange={(e) =>
              setCounts((c) => ({ ...c, notes: e.target.value }))
            }
          />
        </label>
      </div>
      <div className="grid md:grid-cols-2 gap-3 mt-3">
        <Sparkline title="Religions (declared)" data={history.map((p) => p.r)} />
        <Sparkline title="Sub-chapters (declared)" data={history.map((p) => p.d)} />
      </div>
    </Card>
  );
}

function Stat({ label, value }) {
  return (
    <div className="border rounded p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-semibold">{value ?? "-"}</div>
    </div>
  );
}

function Sparkline({ title, data }) {
  const w = 360,
    h = 80,
    p = 8;
  const max = Math.max(1, ...data);
  const pts = data
    .map((v, i) => {
      const x = p + (i * (w - 2 * p)) / Math.max(1, data.length - 1);
      const y = h - p - (v / max) * (h - 2 * p);
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <div className="border rounded p-3 bg-white">
      <div className="text-sm font-medium mb-1">{title}</div>
      <svg width={w} height={h} className="block">
        <rect x="0" y="0" width={w} height={h} fill="#f8fafc" />
        {data.length > 1 ? (
          <polyline points={pts} fill="none" stroke="#334155" strokeWidth="2" />
        ) : (
          <text
            x={w / 2}
            y={h / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="12"
            fill="#64748b"
          >
            Add snapshots
          </text>
        )}
      </svg>
    </div>
  );
}

/* ============================== LEGAL CASES ============================== */
function LegalCasesView() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [yearMin, setYearMin] = useState("");
  const [yearMax, setYearMax] = useState("");
  const [world, setWorld] = useState(null);

  function importJson(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const obj = JSON.parse(ev.target.result);
        if (Array.isArray(obj)) setRows(obj);
        else if (obj && obj.type === "FeatureCollection") setWorld(obj);
        else
          alert(
            "JSON must be an array of cases or a GeoJSON FeatureCollection."
          );
      } catch (err) {
        alert("Parse error: " + err.message);
      }
    };
    r.readAsText(f);
  }
  function importCsv(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        setRows(parseCsv(ev.target.result));
      } catch (err) {
        alert("CSV parse error: " + err.message);
      }
    };
    r.readAsText(f);
  }
  function exportJson() {
    const blob = new Blob([JSON.stringify(rows, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "legal.cases.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = rows.filter((x) => {
    if (q) {
      const s = q.toLowerCase();
      const hit =
        (x.groupName || "").toLowerCase().includes(s) ||
        (x.country || "").toLowerCase().includes(s) ||
        (x.allegedOffenseType || "").toLowerCase().includes(s) ||
        String(x.year || "").includes(s);
      if (!hit) return false;
    }
    if (yearMin && (x.year || 0) < Number(yearMin)) return false;
    if (yearMax && (x.year || 0) > Number(yearMax)) return false;
    return true;
  });

  const byType = aggregateCount(filtered, "allegedOffenseType");
  const byGroup = aggregateCount(filtered, "groupName");
  const byCountry = aggregateCount(filtered, "country");

  return (
    <Card
      title="Legal cases (import your data)"
      right={
        <div className="flex items-center gap-2 text-sm">
          <input
            type="file"
            accept="application/json"
            onChange={importJson}
            title="Cases JSON or world GeoJSON"
          />
          <input
            type="file"
            accept="text/csv"
            onChange={importCsv}
            title="Cases CSV"
          />
          <button onClick={exportJson} className="px-2 py-1 border rounded">
            Export
          </button>
        </div>
      }
    >
      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded">
        Counts are for visualization only. Use primary sources (dockets,
        judgments).
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search groups, countries, offenses..."
          className="border rounded p-2 flex-1 min-w-[220px]"
        />
        <label className="text-sm">Year from</label>
        <input
          type="number"
          value={yearMin}
          onChange={(e) => setYearMin(e.target.value)}
          className="border rounded p-1 w-24"
        />
        <label className="text-sm">to</label>
        <input
          type="number"
          value={yearMax}
          onChange={(e) => setYearMax(e.target.value)}
          className="border rounded p-1 w-24"
        />
      </div>
      <div className="grid md:grid-cols-3 gap-3 mt-3">
        <Stat label="Total cases (filtered)" value={filtered.length} />
        <Stat label="Unique groups" value={Object.keys(byGroup).length} />
        <Stat label="Offense types" value={Object.keys(byType).length} />
      </div>
      <div className="grid md:grid-cols-2 gap-3 mt-3">
        <Card title="By offense type">
          <BarList data={mapToBarData(byType)} />
        </Card>
        <Card title="Top groups">
          <BarList
            data={mapToBarData(byGroup).sort((a, b) => b.value - a.value).slice(0, 10)}
          />
        </Card>
      </div>

      <Card title="Cases by country (summary)">
        {Object.keys(byCountry).length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
            {Object.entries(byCountry)
              .sort((a, b) => b[1] - a[1])
              .map(([c, v]) => (
                <div
                  key={c}
                  className="border rounded p-2 flex items-center justify-between"
                >
                  <span>{c || "-"}</span>
                  <span className="font-semibold">{v}</span>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-sm text-slate-600">
            Import cases (CSV or JSON) to see country counts. Optionally, also
            import a world GeoJSON FeatureCollection (JSON) — this view shows a
            summary list that works without maps.
          </div>
        )}
      </Card>

      <div className="overflow-auto mt-3">
        <table className="table-auto w-full text-sm">
          <thead>
            <tr className="text-left bg-slate-50">
              <th className="p-2 border">Group</th>
              <th className="p-2 border">Country</th>
              <th className="p-2 border">Year</th>
              <th className="p-2 border">Alleged offense</th>
              <th className="p-2 border">Outcome</th>
              <th className="p-2 border">Source</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((x, i) => (
              <tr key={i}>
                <td className="p-2 border">{x.groupName || "-"}</td>
                <td className="p-2 border">{x.country || "-"}</td>
                <td className="p-2 border">{x.year || "-"}</td>
                <td className="p-2 border">{x.allegedOffenseType || "-"}</td>
                <td className="p-2 border">{x.caseOutcome || "-"}</td>
                <td className="p-2 border">
                  {x.source ? (
                    <a
                      href={x.source}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600"
                    >
                      Link
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ============================== SMALL UI HELPERS ============================== */
function BarList({ data }) {
  if (!data || !data.length) {
    return <div className="text-sm text-slate-500">No data.</div>;
  }
  const max = Math.max(...data.map((d) => d.value || 0), 1);
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex-1">
            <div className="text-xs">{d.label || "-"}</div>
            <div className="h-2 bg-slate-100 rounded">
              <div
                className="h-2 rounded"
                style={{
                  width: `${Math.round(((d.value || 0) / max) * 100)}%`,
                  background: "#22c55e"
                }}
              />
            </div>
          </div>
          <div className="text-xs w-10 text-right">{d.value || 0}</div>
        </div>
      ))}
    </div>
  );
}

function aggregateCount(arr, key) {
  const m = {};
  arr.forEach((x) => {
    const k = (x[key] ?? "-") + "";
    m[k] = (m[k] || 0) + 1;
  });
  return m;
}

function mapToBarData(obj) {
  return Object.entries(obj).map(([k, v]) => ({ label: k, value: v }));
}

/* Parse a simple CSV with headers, quotes supported for basic commas */
function parseCsv(text) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(Boolean);
  if (!lines.length) return [];
  const headers = splitCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const obj = {};
    headers.forEach((h, j) => {
      obj[h.trim()] = cols[j] != null ? cols[j] : "";
    });
    rows.push(obj);
  }
  return rows;
}
function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQ = false;
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ",") {
        out.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur);
  return out;
}
