# Sprite Assets

This folder contains sprite files for map icons and symbols.

## Required Files

```
public/assets/sprites/
├── basemap.json    # Sprite metadata (positions, sizes)
├── basemap.png     # Sprite image (all icons combined)
└── README.md
```

## Sprite Format

- **basemap.json**: Contains icon definitions with positions and dimensions
- **basemap.png**: Single PNG image containing all icons
- **No file extension** in style references: `/assets/sprites/basemap`

## Getting Sprite Files

1. **MapLibre Sprites**: Visit [MapLibre Sprites](https://github.com/maplibre/sprites)
2. **OpenMapTiles Sprites**: https://openmaptiles.org/styles/
3. **Custom sprites**: Use tools like `spritezero` to generate from individual icons

## Style Reference

The style references sprites as:
```json
{
  "sprite": "/assets/sprites/basemap"
}
```

## Testing

If sprites are missing, icons won't render. Check browser console for 404 errors on sprite requests.