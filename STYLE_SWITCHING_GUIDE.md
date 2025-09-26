# Style Switching Guide

## Current Setup

Your map is currently using `maplibre-openmaptiles-hybrid.json` which combines OSM raster tiles with vector overlays for a rich dark theme.

## Three Style Options

### 1. Hybrid Style (Current - Working Now)
**File**: `public/styles/maplibre-openmaptiles-hybrid.json`
**Sources**: OSM raster + MapLibre demo vector tiles
**Features**: Rich OSM base map with dark styling + vector overlays
**Status**: ✅ Working immediately

### 2. Demo Style (Basic - Working)
**File**: `public/styles/maplibre-openmaptiles-dark.json`
**Source**: `https://demotiles.maplibre.org/tiles/tiles.json`
**Features**: Basic countries, geolines, centroids
**Status**: ✅ Working immediately

### 3. Full OpenMapTiles Style (Future - When You Have PMTiles)
**File**: `public/styles/maplibre-openmaptiles-pmtiles.json`
**Source**: `pmtiles:///tiles/world.pmtiles`
**Features**: Complete roads, water, buildings, labels, admin boundaries
**Status**: ⏳ Requires PMTiles file

## How to Switch

### To Use Full OpenMapTiles Style:

1. **Add PMTiles file**:
   ```bash
   # Download OpenMapTiles PMTiles file
   # Place at: public/tiles/world.pmtiles
   ```

2. **Update map.js**:
   ```javascript
   // Change this line in public/js/map.js:
   style: 'styles/maplibre-openmaptiles-pmtiles.json',
   ```

3. **Add fonts (optional)**:
   ```bash
   # Add PBF fonts to: public/assets/fonts/Noto Sans Regular/
   ```

4. **Add sprites (optional)**:
   ```bash
   # Add sprite files to: public/assets/sprites/
   ```

## Current Status

- ✅ Map loads with dark theme
- ✅ City overlays work perfectly
- ✅ No external dependencies
- ⏳ Limited basemap features (roads, water, buildings missing)
- ⏳ No labels (fonts missing)

## Next Steps

1. **Immediate**: Test current setup - should see dark map with country borders
2. **Short-term**: Add PMTiles file for full OpenMapTiles features
3. **Long-term**: Add fonts and sprites for complete styling
