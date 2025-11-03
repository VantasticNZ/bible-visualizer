// scripts/make-geojson.js
const fs = require("fs");
const path = require("path");
const { feature } = require("topojson-client");

// Use 50m for higher detail than 110m
const worldTopo = require("world-atlas/countries-50m.json");

// Convert TopoJSON -> GeoJSON FeatureCollection
const countries = feature(worldTopo, worldTopo.objects.countries);

const out = {
  type: "FeatureCollection",
  features: countries.features.map(f => {
    const props = { ...f.properties };
    if (!props.ADMIN && props.name) props.ADMIN = props.name;
    if (!props.ISO_A3 && props.iso_a3) props.ISO_A3 = String(props.iso_a3).toUpperCase();
    return { type: "Feature", properties: props, geometry: f.geometry };
  })
};

const outPath = path.join(__dirname, "..", "public", "data", "world.geo.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out));
console.log("Wrote:", outPath, "features:", out.features.length);
