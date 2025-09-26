# Tile Source Guide: OpenStreetMap (Raster) vs OpenMapTiles (Vector)

## Overview
When building maps with **MapLibre GL JS**, two common basemap approaches are:
1. **OpenStreetMap (OSM) raster tiles** – pre-rendered image tiles.
2. **OpenMapTiles vector tiles** – compact vector data styled in the browser.

---

## OpenStreetMap Raster Tiles

### What They Are
- Pre-rendered PNG/JPG tiles created from OSM data.
- Served as static images (XYZ URLs like `/{z}/{x}/{y}.png`).
- Look is fixed at render time (you’re loading pictures of the map).

### When to Use OSM Raster

#### Good for
- Fast, zero-pipeline prototypes (just drop in a tile URL).
- Simple apps that don’t need to restyle the basemap.
- Consistent appearance without design effort.

#### Not good for
- Custom basemap styling (colors, fonts, showing/hiding features).
- Querying basemap features (roads, buildings aren’t selectable).
- Dark/light themes (tinting a raster looks crude).
- Heavy traffic production on the public OSM server (usage is restricted).
- HiDPI efficiency (often requires @2x tiles → more bandwidth).

### Example (MapLibre style snippet)
```json
{
  "sources": {
    "osm": {
      "type": "raster",
      "tiles": ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      "tileSize": 256,
      "maxzoom": 19
    }
  },
  "layers": [
    { "id": "osm", "type": "raster", "source": "osm" }
  ]
}
```

### Styling Limits (raster paint only)
- You can adjust opacity/brightness/contrast/saturation.
- You cannot restyle individual features or change fonts/labels.
- Show/hide is all-or-nothing for the raster layer.

> Production note: The public `tile.openstreetmap.org` is community infrastructure and not intended for high-traffic production. Use a paid/hosted raster provider or self-host if you need raster in production.

---

## OpenMapTiles Vector Tiles

### What They Are
- PBF vector tiles (points/lines/polygons + attributes).
- Styled client-side via MapLibre’s style spec (per layer/zoom/condition).
- Many thematic source-layers (e.g., `water`, `transportation`, `building`, `admin`).

### When to Use OpenMapTiles

#### Great for
- Full custom styling & brand consistency.
- Interactive basemaps (hover/click on features, filters).
- Dynamic theming (light/dark toggles, seasonal looks).
- Performance & flexibility at varied zooms (GPU-rendered, decluttering).
- Professional apps you want to evolve without re-rendering tiles.

#### Less ideal for
- Throwaway prototypes (setup is a bit more involved).
- Teams with no styling bandwidth at all.

### Example (MapLibre style snippet)
```json
{
  "sources": {
    "openmaptiles": {
      "type": "vector",
      "url": "https://tiles.openmaptiles.org/osm_tiles.json"
    }
  },
  "layers": [
    {
      "id": "water",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "water",
      "paint": { "fill-color": "#1e40af" }
    },
    {
      "id": "admin-country",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "admin",
      "filter": ["==", ["get", "admin_level"], 2],
      "paint": { "line-color": "#f59e0b", "line-width": 2 }
    }
  ]
}
```

### Styling Capabilities
- Style per feature type (water/roads/buildings) with zoom-based rules.
- Conditional styling via data attributes.
- Interactive (query features, click/hover, hit-testing).
- Control visibility/order, icons, fonts, labels.

---

## Feature Comparison

| Feature | OSM Raster | OpenMapTiles Vector |
|---|---|---|
| Setup | Very simple (drop a URL) | Moderate (style JSON + glyphs/sprite) |
| Bandwidth / Size | Higher overall (many PNG/JPG requests; @2x on HiDPI) | Lower typically (compact PBF; reuse across styles) |
| Styling Control | Very limited (image-level) | Full (per-layer, expressions, zoom) |
| Interactivity | Basemap not queryable (use separate overlays) | Full (query, filters, tooltips on basemap) |
| Theming (dark/light) | Not restylable | Easy (swap styles) |
| Performance | Simple render; network-heavy | High, GPU-rendered; style/device dependent |
| Cost | Free to self-host; public OSM not for prod | Free to self-host; hosted tiers available |
| Update cadence | Depends on provider/pipeline | Depends on provider/pipeline |

---

## Common Use Cases

### Use OSM Raster when you:
- Need a quick, low-effort basemap for a prototype.
- Won’t restyle the basemap and only overlay your own data.
- Have very low traffic (or you use a production raster provider).

### Use OpenMapTiles Vector when you:
- Want brand-consistent or dark/light theming.
- Need interactive basemap features (query/hover) in addition to your overlays.
- Care about long-term performance, flexibility, and portability.

---

## Migration Path (Raster → Vector)

1) Switch the source
```json
// Before (raster)
"sources": { "osm": { "type": "raster", "tiles": ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"] } }

// After (vector)
"sources": { "openmaptiles": { "type": "vector", "url": "https://tiles.openmaptiles.org/osm_tiles.json" } }
```

2) Replace the raster layer with vector layers
```json
// Before
{ "id": "osm", "type": "raster", "source": "osm" }

// After (example)
{ "id": "water", "type": "fill", "source": "openmaptiles", "source-layer": "water", "paint": { "fill-color": "#1e40af" } }
```

3) Add required assets
- Set glyphs (PBF fonts) and sprite (icons) URLs in your style JSON.
- If self-hosting, consider a PMTiles basemap and MapLibre’s PMTiles protocol for simple CDN hosting.

---

## Recommendation (for long-term goals)
Move to a vector basemap (OpenMapTiles or Protomaps) with MapLibre GL JS:
- Full control over design, interactive basemaps, and dark/light theming.
- Cheap, portable hosting (e.g., PMTiles on a CDN). Keep overlays as Tippecanoe→PMTiles for performance.

Use OSM raster only for quick demos or screenshots—avoid the public OSM tiles for production traffic.

---

## Resources

### OpenStreetMap (Raster)
- Docs: https://wiki.openstreetmap.org/wiki/Tiles
- Usage policy: https://operations.osmfoundation.org/policies/tiles/
- Attribution: “© OpenStreetMap contributors”

### OpenMapTiles (Vector)
- Docs: https://openmaptiles.org/docs/
- Styles: https://openmaptiles.org/styles/
- Self-hosting: https://github.com/openmaptiles/openmaptiles-server

### MapLibre GL JS
- Style Spec: https://maplibre.org/maplibre-style-spec/
- Examples: https://maplibre.org/maplibre-gl-js-docs/example/
