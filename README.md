# colorado-cities-map
Boundaries and data for Colorado cities

## Migration to MapLibre GL JS

This project has been migrated from Mapbox GL JS to MapLibre GL JS for vendor independence and cost reduction.

### What Changed
- **Map Library**: Switched from Mapbox GL JS to MapLibre GL JS
- **Style**: Converted to vendor-neutral style using OpenStreetMap tiles
- **Assets**: Set up local font and sprite asset structure
- **Dependencies**: Removed Mapbox access token requirement

### Running the Application

1. **Start the development server:**
   ```bash
   python serve.py
   ```

2. **Open in browser:**
   ```
   http://localhost:8000
   ```

### Asset Setup (Required)

To complete the migration, you need to add font and sprite assets:

#### Fonts
Add PBF font files to `public/assets/fonts/` following the structure:
```
public/assets/fonts/
├── {fontstack}/
│   └── {range}.pbf
```

See `public/assets/fonts/README.md` for detailed instructions.

#### Sprites
Add sprite files to `public/assets/sprites/`:
```
public/assets/sprites/
├── basemap.json
└── basemap.png
```

See `public/assets/sprites/README.md` for detailed instructions.

### Style Conversion

The style conversion script can be run to update the map style:
```bash
node scripts/convert-style.mjs
```

This generates `public/styles/maplibre-style.json` with vendor-neutral tile sources.

## Original Project Setup

### Create Python virtual environment, add libraries, add to .gitgnore.

python3 -m venv venv<br />
source venv/bin/activate<br />
pip install geopandas censusdata pandas<br />
pip freeze > requirements.txt

### Add the 2024 shapefile for Colorado places./

Source: https://www2.census.gov/geo/tiger/TIGER2024/PLACE/<br />
Note: The the tl_2024_08_place.zip is specific to Colorado as the Colorado state code is 08.

### Add the Python script and run it to convert the Colorado places shapefile to GeoJSON.
The GeoJSON can be generated as a simplfied version for better performance. This file name is called colorado-cities-enriched-simplified-app.geojson. I am using the non-simplified/detailed version that is generated call colorado-cities-enriched-detailed-app.geojson.<br /><br />

Note: This file was created with assistance of generative AI and lightly modfied to fit the specfic requirements of this project and file structure.

### Add the Python script to get ACS 5-year 2023 data with some basic demographic data and add it to the the GeoJSON.
This uses the census data to add the 2023 ACS 5-Year demographic data. Outputs a new GeoJSON file with additional population, income, education, and housing fields.
Note: This file was created with assistance of generative AI and lightly modfied to fit the specfic requirements of this project and file structure.<br />

### Add desired data points to popup and style city boundaries based on data.
