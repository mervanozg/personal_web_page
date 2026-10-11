[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/7C3xAGjq)

# GMT 458 – Web GIS | Assignment 1: Personal Web Page

**Author:** Mervan Özgönül  
**Department:** Geomatics Engineering, Hacettepe University

---

## 📌 Project Overview

This personal web page was developed for **GMT 458 – Web GIS (Assignment 1)** using HTML5, CSS3, JavaScript, **OpenLayers**, and **Leaflet**.

### Pages Included
1. **`index.html` (Home):** Personal introduction, quick overview cards, and direct buttons to view or download my CV.
2. **`background.html` (About):** Academic background, certifications, an interactive **Leaflet** map displaying education & international geodetic meetings (IGSM Sofia & Valencia, Ankara, İzmir), and an embedded **Curriculum Vitae (CV)** section with inline PDF preview and download options.
3. **`technologies.html` (Technologies):** Technical skill set presented as tabular information with custom SVG images (`<img>`) and CSS animations.
4. **`company.html` (MERYKSI CO.):** E-commerce & AI-powered Print-on-Demand business overview featuring an interactive **OpenLayers** global sales distribution map.

---

## 🗺️ Web GIS Issues Solved

### Issue 1: Overlapping Markers & Zoom Threshold
When multiple markers are close to each other (such as multiple markers in Ankara on the Leaflet map or multiple US/European cities on the OpenLayers map), they overlap at low zoom levels.
- **OpenLayers (`company.html` / `script.js`):** Implemented a resolution/zoom listener (`map.getView().on('change:resolution', ...)`) that checks `map.getView().getZoom() >= 3.5` and toggles marker visibility accordingly.
- **Leaflet (`background.html` / `script.js`):** Grouped markers into a `L.layerGroup()` and attached a `zoomend` listener (`map.on('zoomend', ...)`) so markers are added to the map only when `map.getZoom() >= 5`.

### Issue 2: Preventing the Earth from Repeating When Zoomed Out
- **OpenLayers (`script.js`):** Configured `wrapX: false` in `ol.source.OSM` and set `multiWorld: false`, `minZoom: 2`, and `extent: ol.proj.get('EPSG:3857').getExtent()` inside `ol.View`.
- **Leaflet (`script.js`):** Configured `noWrap: true` and `bounds` on `L.tileLayer`, alongside `minZoom: 2`, `maxBounds: [[-85, -180], [85, 180]]`, and `maxBoundsViscosity: 1.0` on `L.map`.

---

## 🤖 AI Usage Declaration

### Specific Issues / Concepts Learned from AI
After researching documentation and search results first, AI assistance was used for the following specific topics:
1. **Setting a Zoom Threshold for Markers (Issue 1):** Learned how to dynamically toggle `L.layerGroup()` in Leaflet using the `zoomend` event (`map.getZoom() >= threshold`) and how to listen to `change:resolution` on an OpenLayers `ol.View` to control `ol.Overlay` visibility based on zoom level.
2. **Preventing Horizontal World Repetition (Issue 2):** Learned how to combine `wrapX: false` on `ol.source.OSM` with `multiWorld: false` and `extent` on `ol.View` in OpenLayers, and how to pair `noWrap: true` in `L.tileLayer` with `maxBounds` and `maxBoundsViscosity: 1.0` in Leaflet.
3. **CSS Scroll Animations & Responsive Layout:** Learned how to use the `IntersectionObserver` API in JavaScript to trigger CSS `@keyframes` and transform transitions smoothly when cards enter the viewport.

### Estimated Total AI Usage Time
- **Total AI Usage:** Approximately **1.5 hours (90 minutes)** across the entire project (structuring responsive CSS animations, debugging OpenLayers/Leaflet zoom threshold events, and configuring map bounds).
