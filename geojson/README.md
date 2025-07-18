# 🏁 Track Densifier

This tool takes a race track exported from OpenStreetMap (via Overpass Turbo) and increases its point density by interpolating intermediate coordinates. It’s designed for precise lap segmentation, sector timing, and accurate map-based telemetry in motorsport applications.

---

## 📍 Step 1: Find the Track on OpenStreetMap

1. Go to [https://www.openstreetmap.org](https://www.openstreetmap.org)
2. Search for your track by name, e.g.: `Circuito Internacional Zuera`
3. Right click and view items
3. Click on the track path (usually tagged as a `way`)
4. In the left sidebar, note the **Way ID** (e.g. `way 490212649`)

## 🔎 Step 2: Extract GeoJSON from Overpass Turbo

1. Open [https://overpass-turbo.eu](https://overpass-turbo.eu)
2. Paste the following Overpass query, replacing the Way ID with your own:

```overpass
[out:json];
way(490212649);
(._;>;);
out body;
```

## 🛠️ Step 3: Densify the GeoJSON

> This step increases the number of points in the track so that no two consecutive points are more than 2 meters apart. This is essential for precise user interactions like sector creation or lap splitting.

### 1. 🧰 Requirements

Make sure you have [Bun](https://bun.sh) installed.

### 2. 📁 Navigate to the Project Directory

Go to the folder where the script is located:

```bash
cd telemetry
```

### 3. 📥 Run the Script

From the `telemetry` folder, run:

```bash
bun ./scripts/track-densify.ts ../geojson/circuito-internacional-zuera.geojson
```

✅ This will output a new file:

```
../geojson/circuito-internacional-zuera-densified.geojson
```

---

### ⚙️ What It Does

- Reads your input GeoJSON file (must be a `FeatureCollection` with `LineString` geometry).
- For each line segment, inserts intermediate points so that spacing between them is ≤ **2 meters**.
- Outputs a new GeoJSON file with the same structure and metadata, but higher point density.

### 📊 Why Densify?

- Enables precise snapping for tools like sector or lap editors.
- Makes visualizations smoother, especially for curved or high-speed sections.
- Critical for accurate telemetry overlays and user interactions.