# Mapbox GL JS to MapLibre GL JS Migration Notes

## Inventory Summary

### Style
- **Current**: Uses `mapbox://styles/mapbox/dark-v11` style
- **Action**: Convert to vendor-neutral style with local assets
- **Dependencies**: None (style is referenced directly)

### Sources
- **Current**: No custom tile sources, only GeoJSON data
- **Action**: No changes needed for data sources
- **Dependencies**: None

### Plugins
- **Current**: No Mapbox-specific plugins detected
- **Action**: No plugin migration needed
- **Dependencies**: None

### 3D/Visual
- **Current**: Standard 2D map with fill and line layers
- **Action**: No changes needed
- **Dependencies**: None

### APIs
- **Current**: 
  - `mapboxgl.Map()` constructor
  - `mapboxgl.Popup()` constructor
  - `mapboxgl.accessToken` (hardcoded token)
- **Action**: Replace with MapLibre equivalents
- **Dependencies**: MapLibre GL JS

## Migration Decisions

### Style Conversion
- Convert `mapbox://styles/mapbox/dark-v11` to local style JSON
- Replace Mapbox fonts with local PBF fonts
- Replace Mapbox sprites with local sprite assets
- Use vendor-neutral tile sources (OpenStreetMap-based)

### Token Removal
- Remove hardcoded Mapbox access token
- No environment variable dependencies to clean up

### Asset Strategy
- Use local fonts and sprites for complete vendor independence
- Set up asset directory structure for easy maintenance
- Document asset hosting requirements

### API Compatibility
- MapLibre GL JS maintains API compatibility with Mapbox GL JS
- No breaking changes expected for existing functionality
- Popup and event handling remain the same

## Files Modified

1. ✅ `public/index.html` - Updated CDN links to MapLibre GL JS and added PMTiles support
2. ✅ `public/js/map.js` - Replaced mapboxgl with maplibregl, removed access token, added PMTiles protocol
3. ✅ `public/css/style.css` - Updated CSS class names from mapboxgl to maplibregl
4. ✅ `public/styles/maplibre-style.json` - Created converted style with OpenStreetMap tiles
5. ✅ `scripts/convert-style.mjs` - Created style conversion script
6. ✅ `public/assets/sprites/` - Created sprite asset directory with documentation
7. ✅ `public/assets/fonts/` - Created font asset directory with documentation
8. ✅ `README.md` - Updated with migration instructions and asset setup
9. ✅ `MIGRATION_NOTES.md` - This file with complete migration details
10. ✅ `TEST_PLAN.md` - Created comprehensive test plan

## Migration Status

### Completed ✅
- [x] Dependencies updated to MapLibre GL JS
- [x] Access token removed
- [x] Style converted to vendor-neutral
- [x] API calls updated (mapboxgl → maplibregl)
- [x] CSS class names updated
- [x] PMTiles protocol support added
- [x] Asset directory structure created
- [x] Documentation updated

### Pending ⏳
- [ ] Add actual font files (PBF format)
- [ ] Add actual sprite files (JSON + PNG)
- [ ] Visual testing and verification
- [ ] Performance testing

## Testing Checklist

- [ ] Visual parity at different zoom levels
- [ ] All interactions work (click, hover, popup)
- [ ] Chart functionality remains intact
- [ ] No console errors or network failures
- [ ] No Mapbox token warnings
- [ ] Responsive design maintained
- [ ] PMTiles protocol loads correctly
- [ ] Local assets load when available
