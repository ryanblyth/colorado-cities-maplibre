# Sprites Directory

This directory contains sprite assets for the MapLibre map style.

## Required Files

To complete the migration from Mapbox, you need to add the following files:

- `basemap.json` - Sprite metadata file
- `basemap.png` - Sprite image file

## How to Obtain Sprites

### Option 1: Extract from Mapbox Style
1. Visit the Mapbox Style Editor
2. Export the dark-v11 style as JSON
3. Extract the sprite URLs from the style
4. Download the sprite files and rename them to `basemap.json` and `basemap.png`

### Option 2: Use OpenMapTiles Sprites
1. Visit [OpenMapTiles](https://openmaptiles.org/)
2. Download the sprite files for the dark theme
3. Rename them to `basemap.json` and `basemap.png`

### Option 3: Generate Custom Sprites
1. Use tools like [spritezero-cli](https://github.com/mapbox/spritezero-cli)
2. Create your own sprite from SVG icons
3. Generate both JSON and PNG files

## File Structure

```
public/assets/sprites/
├── README.md          # This file
├── basemap.json       # Sprite metadata (required)
└── basemap.png        # Sprite image (required)
```

## Style Configuration

The converted style references sprites using:
```json
{
  "sprite": "/assets/sprites/basemap"
}
```

Note: No file extension is used in the style configuration.

## Testing

After adding the sprite files, test that:
1. Icons appear correctly on the map
2. No 404 errors in the browser console
3. Sprites load from the correct local paths
