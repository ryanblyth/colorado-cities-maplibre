# Font Assets (Glyphs)

This folder contains PBF font files for map labels.

## Required Structure

```
public/assets/fonts/
├── Noto Sans Regular/
│   ├── 0-255.pbf
│   ├── 256-511.pbf
│   └── ... (additional ranges as needed)
└── README.md
```

## Font Stacks

The current style uses:
- `Noto Sans Regular` for most labels

## Getting Font Files

1. **Download from MapLibre**: Visit [MapLibre Fonts](https://github.com/maplibre/fonts)
2. **Extract PBF files**: Place them in the appropriate font stack folder
3. **Required ranges**: At minimum, include `0-255.pbf` for basic Latin characters

## Alternative Sources

- **OpenMapTiles Fonts**: https://fonts.openmaptiles.org/
- **Self-hosted**: Convert TTF/OTF fonts to PBF format using tools like `node-fontnik`

## Testing

If fonts are missing, labels won't render. Check browser console for 404 errors on font requests.