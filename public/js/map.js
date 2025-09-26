// MapLibre GL JS - no access token required

// Enable PMTiles protocol support
function enablePMTiles() {
  if (typeof pmtiles !== 'undefined' && typeof pmtiles.Protocol !== 'undefined') {
    // Use PMTiles 3.x API
    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);
    console.log('PMTiles protocol enabled');
    return true;
  }
  return false;
}

// Wait for PMTiles to load before initializing map
function waitForPMTiles() {
  return new Promise((resolve) => {
    const checkPMTiles = () => {
      if (enablePMTiles()) {
        console.log('PMTiles protocol enabled');
        resolve();
      } else {
        console.log('Waiting for PMTiles library...');
        setTimeout(checkPMTiles, 100);
      }
    };
    checkPMTiles();
  });
}

// Color variables for consistent use across the application
const COLORS = {
  // Population/Density color scale - more differentiated
  VERY_LIGHT: '#8DF6FC',    // Brighter lightest blue
  LIGHT: '#5DE7FC',          // Brighter light blue  
  MEDIUM: '#4AACD5',        // Brighter medium blue
  LIGHT_PURPLE: '#F7BFF7',  // Brighter light purple
  MEDIUM_PURPLE: '#D674FB', // Brighter medium purple
  DARK_PURPLE: '#A143C8',   // Brighter dark purple
  CDP: '#808080'             // Gray for CDPs
};

// Population thresholds for color mapping
const POPULATION_THRESHOLDS = {
  SMALL: 5000,
  MEDIUM: 25000,
  LARGE: 100000,
  VERY_LARGE: 300000,
  MEGA: 600000
};

// Density thresholds for color mapping
const DENSITY_THRESHOLDS = {
  LOW: 100,
  MEDIUM: 500,
  HIGH: 1000,
  VERY_HIGH: 2000,
  EXTREME: 5000
};

// Initialize map after PMTiles is ready
let map;
let popup;

function initializeMap() {
  // Create a popup but don't add it to the map yet
  popup = new maplibregl.Popup({
    closeButton: true,
    closeOnClick: false,
    maxWidth: '300px',
    className: 'custom-popup',
    focusAfterOpen: false
  });
  
  // Continue with the rest of the map initialization...
  setupMapEventHandlers();
}

function setupMapEventHandlers() {
  // Add city layers when the map loads
  map.on('load', async () => {
    try {
      console.log('Map loaded, fetching city data...');
      const response = await fetch('../data/colorado-cities-enriched-detailed-app.geojson');
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const geojson = await response.json();
      console.log('City data loaded:', geojson.features.length, 'cities');
      chartData = geojson;

    // Add IDs to features if they don't exist and calculate population density
    geojson.features.forEach((feature, index) => {
      if (!feature.id) {
        feature.id = feature.properties.GEOID || index;
      }
      
      // Calculate population density (people per square mile)
      // ALAND is in square meters, convert to square miles (1 sq mile = 2,589,988 sq meters)
      const areaSqMiles = feature.properties.ALAND / 2589988;
      feature.properties.Pop_Density = areaSqMiles > 0 ? 
        Math.round(feature.properties.Total_Pop / areaSqMiles) : 0;
    });

    // Variables for key highlighting
    let clickedKeyItem = null;
    let highlightedFeatures = [];

    // Function to highlight cities by range
    function highlightCitiesByRange(range, type, highlight) {
      if (!range) return; // Safety check for undefined/null range
      
      const data = chartData || geojson;
      if (!data) return;
      
      const features = data.features;
      const highlightedFeatures = [];
      
      features.forEach(feature => {
        if (!feature.properties) return; // skip if properties is missing
        let shouldHighlight = false;
        const properties = feature.properties;
        
        if (range === 'cdp') {
          shouldHighlight = properties.NAMELSAD && properties.NAMELSAD.includes('CDP');
        } else {
          const value = type === 'population' ? properties.Total_Pop : properties.Pop_Density;
          if (value === null || value === undefined) return;
          
          switch (range) {
            case 'very-light':
              shouldHighlight = value < (type === 'population' ? POPULATION_THRESHOLDS.SMALL : DENSITY_THRESHOLDS.LOW);
              break;
            case 'light':
              shouldHighlight = value >= (type === 'population' ? POPULATION_THRESHOLDS.SMALL : DENSITY_THRESHOLDS.LOW) && 
                               value < (type === 'population' ? POPULATION_THRESHOLDS.MEDIUM : DENSITY_THRESHOLDS.MEDIUM);
              break;
            case 'medium':
              shouldHighlight = value >= (type === 'population' ? POPULATION_THRESHOLDS.MEDIUM : DENSITY_THRESHOLDS.MEDIUM) && 
                               value < (type === 'population' ? POPULATION_THRESHOLDS.LARGE : DENSITY_THRESHOLDS.HIGH);
              break;
            case 'light-purple':
              shouldHighlight = value >= (type === 'population' ? POPULATION_THRESHOLDS.LARGE : DENSITY_THRESHOLDS.HIGH) && 
                               value < (type === 'population' ? POPULATION_THRESHOLDS.VERY_LARGE : DENSITY_THRESHOLDS.VERY_HIGH);
              break;
            case 'medium-purple':
              shouldHighlight = value >= (type === 'population' ? POPULATION_THRESHOLDS.VERY_LARGE : DENSITY_THRESHOLDS.VERY_HIGH) && 
                               value < (type === 'population' ? POPULATION_THRESHOLDS.MEGA : DENSITY_THRESHOLDS.EXTREME);
              break;
            case 'dark-purple':
              shouldHighlight = value >= (type === 'population' ? POPULATION_THRESHOLDS.MEGA : DENSITY_THRESHOLDS.EXTREME);
              break;
          }
        }
        
        if (shouldHighlight) {
          highlightedFeatures.push(feature.id);
        }
      });
      
      if (highlight) {
        // Add highlighted features to the map
        map.setFilter('city-fills-population', ['in', 'id', ...highlightedFeatures]);
        map.setFilter('city-fills-density', ['in', 'id', ...highlightedFeatures]);
      } else {
        // Remove highlight by resetting to all features
        map.setFilter('city-fills-population', ['has', 'id']);
        map.setFilter('city-fills-density', ['has', 'id']);
      }
    }

    // Add the data source
    map.addSource('colorado-cities', {
      type: 'geojson',
      data: geojson
    });

    // Add population-based city fills
    map.addLayer({
      id: 'city-fills-population',
      type: 'fill',
      source: 'colorado-cities',
      paint: {
        'fill-color': [
          'case',
          ['in', 'CDP', ['get', 'NAMELSAD']],
          COLORS.CDP,
          [
            'case',
            ['<', ['get', 'Total_Pop'], POPULATION_THRESHOLDS.SMALL],
            COLORS.VERY_LIGHT,
            [
              'case',
              ['<', ['get', 'Total_Pop'], POPULATION_THRESHOLDS.MEDIUM],
              COLORS.LIGHT,
              [
                'case',
                ['<', ['get', 'Total_Pop'], POPULATION_THRESHOLDS.LARGE],
                COLORS.MEDIUM,
                [
                  'case',
                  ['<', ['get', 'Total_Pop'], POPULATION_THRESHOLDS.VERY_LARGE],
                  COLORS.LIGHT_PURPLE,
                  [
                    'case',
                    ['<', ['get', 'Total_Pop'], POPULATION_THRESHOLDS.MEGA],
                    COLORS.MEDIUM_PURPLE,
                    COLORS.DARK_PURPLE
                  ]
                ]
              ]
            ]
          ]
        ],
        'fill-opacity': 0.7
      }
    });

    // Add density-based city fills
    map.addLayer({
      id: 'city-fills-density',
      type: 'fill',
      source: 'colorado-cities',
      paint: {
        'fill-color': [
          'case',
          ['in', 'CDP', ['get', 'NAMELSAD']],
          COLORS.CDP,
          [
            'case',
            ['<', ['get', 'Pop_Density'], DENSITY_THRESHOLDS.LOW],
            COLORS.VERY_LIGHT,
            [
              'case',
              ['<', ['get', 'Pop_Density'], DENSITY_THRESHOLDS.MEDIUM],
              COLORS.LIGHT,
              [
                'case',
                ['<', ['get', 'Pop_Density'], DENSITY_THRESHOLDS.HIGH],
                COLORS.MEDIUM,
                [
                  'case',
                  ['<', ['get', 'Pop_Density'], DENSITY_THRESHOLDS.VERY_HIGH],
                  COLORS.LIGHT_PURPLE,
                  [
                    'case',
                    ['<', ['get', 'Pop_Density'], DENSITY_THRESHOLDS.EXTREME],
                    COLORS.MEDIUM_PURPLE,
                    COLORS.DARK_PURPLE
                  ]
                ]
              ]
            ]
          ]
        ],
        'fill-opacity': 0.7
      }
    });

    // Add city borders
    map.addLayer({
      id: 'city-borders',
      type: 'line',
      source: 'colorado-cities',
      paint: {
        'line-color': '#ffffff',
        'line-width': 1,
        'line-opacity': 0.8
      }
    });

    // Initially show population view
    map.setLayoutProperty('city-fills-population', 'visibility', 'visible');
    map.setLayoutProperty('city-fills-density', 'visibility', 'none');

    // Add click handlers for both layers
    map.on('click', 'city-fills-population', (e) => {
      const properties = e.features[0].properties;
      selectedCity = properties;
      
      // Update popup content
      popup.setLngLat(e.lngLat)
        .setHTML(formatPopupContent(properties))
        .addTo(map);
      
      // Update chart
      updateChart('population');
    });

    map.on('click', 'city-fills-density', (e) => {
      const properties = e.features[0].properties;
      selectedCity = properties;
      
      // Update popup content
      popup.setLngLat(e.lngLat)
        .setHTML(formatPopupContent(properties))
        .addTo(map);
      
      // Update chart
      updateChart('density');
    });

    // Add hover effects
    let hoveredCityId = null;

    map.on('mouseenter', 'city-fills-population', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseenter', 'city-fills-density', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mousemove', 'city-fills-population', (e) => {
      if (e.features.length > 0) {
        if (hoveredCityId !== null) {
          map.setFeatureState(
            { source: 'colorado-cities', id: hoveredCityId },
            { hover: false }
          );
        }
        hoveredCityId = e.features[0].id;
        map.setFeatureState(
          { source: 'colorado-cities', id: hoveredCityId },
          { hover: true }
        );
      }
    });

    map.on('mousemove', 'city-fills-density', (e) => {
      if (e.features.length > 0) {
        if (hoveredCityId !== null) {
          map.setFeatureState(
            { source: 'colorado-cities', id: hoveredCityId },
            { hover: false }
          );
        }
        hoveredCityId = e.features[0].id;
        map.setFeatureState(
          { source: 'colorado-cities', id: hoveredCityId },
          { hover: true }
        );
      }
    });

    map.on('mouseleave', 'city-fills-population', () => {
      map.getCanvas().style.cursor = '';
      if (hoveredCityId !== null) {
        map.setFeatureState(
          { source: 'colorado-cities', id: hoveredCityId },
          { hover: false }
        );
        hoveredCityId = null;
      }
    });

    map.on('mouseleave', 'city-fills-density', () => {
      map.getCanvas().style.cursor = '';
      if (hoveredCityId !== null) {
        map.setFeatureState(
          { source: 'colorado-cities', id: hoveredCityId },
          { hover: false }
        );
        hoveredCityId = null;
      }
    });

    console.log("Map loaded with Colorado cities");
    
    // Example (commented): add a vector layer from a pmtiles-backed source
    // map.addSource('demo', { type: 'vector', url: 'pmtiles:///tiles/demo.pmtiles' });
    // map.addLayer({ id: 'demo-fill', type: 'fill', source: 'demo', 'source-layer': 'demo_layer', paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.3 }});
    } catch (error) {
      console.error('Error loading city data:', error);
    }
  });
}

waitForPMTiles().then(() => {
  map = new maplibregl.Map({
    container: 'map',
    style: 'styles/maplibre-openmaptiles-pmtiles.json',
    center: [-105.5, 39.1],
    zoom: 6
  });
  
  // Initialize map after it's created
  initializeMap();
});

// Chart functionality - moved outside setTimeout for proper scope
let currentChart = null;
let chartData = null;
let selectedCity = null;

// Track the current key type
let currentKeyType = 'population';

/**
 * Gets the appropriate color for a city based on its properties and display type
 * @param {Object} cityProperties - The city's properties from GeoJSON
 * @param {string} type - The display type ('population' or 'density')
 * @returns {string} The color hex code for the city
 */
function getCityColor(cityProperties, type) {
  if (cityProperties.NAMELSAD.includes('CDP')) return COLORS.CDP;
  
  if (type === 'population') {
    const pop = cityProperties.Total_Pop;
    if (pop < POPULATION_THRESHOLDS.SMALL) return COLORS.VERY_LIGHT;
    if (pop < POPULATION_THRESHOLDS.MEDIUM) return COLORS.LIGHT;
    if (pop < POPULATION_THRESHOLDS.LARGE) return COLORS.MEDIUM;
    if (pop < POPULATION_THRESHOLDS.VERY_LARGE) return COLORS.LIGHT_PURPLE;
    if (pop < POPULATION_THRESHOLDS.MEGA) return COLORS.MEDIUM_PURPLE;
    return COLORS.DARK_PURPLE;
  } else {
    const density = cityProperties.Pop_Density;
    if (density < DENSITY_THRESHOLDS.LOW) return COLORS.VERY_LIGHT;
    if (density < DENSITY_THRESHOLDS.MEDIUM) return COLORS.LIGHT;
    if (density < DENSITY_THRESHOLDS.HIGH) return COLORS.MEDIUM;
    if (density < DENSITY_THRESHOLDS.VERY_HIGH) return COLORS.LIGHT_PURPLE;
    if (density < DENSITY_THRESHOLDS.EXTREME) return COLORS.MEDIUM_PURPLE;
    return COLORS.DARK_PURPLE;
  }
}

// Function to prepare chart data
function prepareChartData(data, type) {
  const cities = data.features
    .filter(f => !f.properties.NAMELSAD.includes('CDP'))
    .sort((a, b) => b.properties[type === 'population' ? 'Total_Pop' : 'Pop_Density'] - a.properties[type === 'population' ? 'Total_Pop' : 'Pop_Density'])
    .slice(0, 15); // Top 15 cities

  const colors = cities.map(f => {
    const color = getCityColor(f.properties, type);
    return color;
  });

  // Function to split long labels at spaces
  const formatLabel = (label) => {
    if (label.length > 15 && label.includes(' ')) {
      const words = label.split(' ');
      const midPoint = Math.ceil(words.length / 2);
      const firstLine = words.slice(0, midPoint).join(' ');
      const secondLine = words.slice(midPoint).join(' ');
      return [firstLine, secondLine];
    }
    return [label];
  };

  return {
    labels: cities.map(f => formatLabel(f.properties.NAME)),
    values: cities.map(f => f.properties[type === 'population' ? 'Total_Pop' : 'Pop_Density']),
    colors: colors
  };
}

// Function to calculate state averages
function calculateStateAverages(data) {
  const cities = data.features.filter(f => !f.properties.NAMELSAD.includes('CDP'));
  
  const totals = cities.reduce((acc, city) => {
    acc.population += city.properties.Total_Pop || 0;
    acc.density += city.properties.Pop_Density || 0;
    
    // Only add valid income values (positive numbers)
    const income = city.properties.Median_Income;
    if (income && income > 0 && income !== -666666666) {
      acc.income += income;
      acc.validIncomeCount += 1;
    }
    
    // Only add valid rent values
    const rent = city.properties.Median_Rent;
    if (rent && rent > 0 && rent !== -666666666) {
      acc.rent += rent;
      acc.validRentCount += 1;
    }
    
    // Only add valid home value values
    const homeValue = city.properties.Median_Home_Value;
    if (homeValue && homeValue > 0 && homeValue !== -666666666) {
      acc.homeValue += homeValue;
      acc.validHomeValueCount += 1;
    }
    
    // Only add valid poverty values
    const poverty = city.properties.Poverty_Rate;
    if (poverty && poverty >= 0 && poverty !== -666666666) {
      acc.poverty += poverty;
      acc.validPovertyCount += 1;
    }
    
    acc.validCities += 1;
    return acc;
  }, {
    population: 0,
    density: 0,
    income: 0,
    rent: 0,
    homeValue: 0,
    poverty: 0,
    validCities: 0,
    validIncomeCount: 0,
    validRentCount: 0,
    validHomeValueCount: 0,
    validPovertyCount: 0
  });

  return {
    population: Math.round(totals.population / totals.validCities),
    density: Math.round(totals.density / totals.validCities),
    income: totals.validIncomeCount > 0 ? Math.round(totals.income / totals.validIncomeCount) : 0,
    rent: totals.validRentCount > 0 ? Math.round(totals.rent / totals.validRentCount) : 0,
    homeValue: totals.validHomeValueCount > 0 ? Math.round(totals.homeValue / totals.validHomeValueCount) : 0,
    poverty: totals.validPovertyCount > 0 ? Math.round((totals.poverty / totals.validPovertyCount) * 100) / 100 : 0
  };
}

// Function to prepare demographics chart data
function prepareDemographicsData(cityData, stateAverages) {
  if (!cityData || !stateAverages) return null;

  const categories = [
    'Population Density',
    'Median Income',
    'Median Rent',
    'Median Home Value',
    'Poverty Rate'
  ];

  const cityValues = [
    cityData.Pop_Density,
    cityData.Median_Income,
    cityData.Median_Rent,
    cityData.Median_Home_Value,
    cityData.Poverty_Rate
  ];

  const stateValues = [
    stateAverages.density,
    stateAverages.income,
    stateAverages.rent,
    stateAverages.homeValue,
    stateAverages.poverty
  ];

  // Format values for display
  const formattedCityValues = cityValues.map((val, index) => {
    if (val === -666666666 || val === null || val === undefined || val < 0 || isNaN(val)) return 0;
    return val;
  });

  const formattedStateValues = stateValues.map((val, index) => {
    if (val === -666666666 || val === null || val === undefined || val < 0 || isNaN(val)) return 0;
    return val;
  });

  return {
    categories,
    cityValues: formattedCityValues,
    stateValues: formattedStateValues,
    rawCityValues: cityValues,
    rawStateValues: stateValues
  };
}

// Function to create/update chart
function updateChart(type) {
  if (!chartData) return;

  if (type === 'demographics') {
    if (!selectedCity) {
      // Show message when no city is selected
      const options = {
        chart: {
          type: 'bar',
          height: 380,
          background: 'transparent',
          toolbar: { show: false }
        },
        series: [{
          name: 'No Data',
          data: [0]
        }],
        xaxis: {
          categories: ['No city selected'],
          labels: {
            style: {
              colors: '#bdc3c7',
              fontSize: '11px'
            }
          }
        },
        yaxis: {
          labels: {
            style: {
              colors: '#bdc3c7',
              fontSize: '11px'
            }
          }
        },
        colors: ['#808080'],
        plotOptions: {
          bar: {
            borderRadius: 4
          }
        },
        legend: {
          show: false
        },
        title: {
          text: 'Click on a city to see detailed demographics',
          align: 'left',
          style: {
            color: '#ecf0f1',
            fontSize: '14px',
            fontWeight: 600
          }
        },
        grid: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
          strokeDashArray: 3
        }
      };

      if (currentChart) {
        currentChart.destroy();
      }
      currentChart = new ApexCharts(document.querySelector("#chart-container"), options);
      currentChart.render();
      return;
    }

    const demoData = prepareDemographicsData(selectedCity, calculateStateAverages(chartData));
    if (!demoData) return;

    // Create 5 separate charts
    const chartContainer = document.querySelector("#chart-container");
    if (!chartContainer) {
      console.error('Chart container not found');
      return;
    }

    // Destroy existing chart if it exists
    if (currentChart) {
      try {
        currentChart.destroy();
      } catch (error) {
        console.warn('Error destroying previous chart:', error);
      }
      currentChart = null;
    }

    // Clear the container and insert new HTML
    chartContainer.innerHTML = '';
    
    // Insert the demographics grid HTML
    chartContainer.innerHTML = `
      <div class="demographics-grid">
        <div class="chart-item">
          <h4>Population Density</h4>
          <div id="chart-population"></div>
        </div>
        <div class="chart-item">
          <h4>Median Income</h4>
          <div id="chart-income"></div>
        </div>
        <div class="chart-item">
          <h4>Median Rent</h4>
          <div id="chart-rent"></div>
        </div>
        <div class="chart-item">
          <h4>Median Home Value</h4>
          <div id="chart-home"></div>
        </div>
        <div class="chart-item">
          <h4>Poverty Rate</h4>
          <div id="chart-poverty"></div>
        </div>
      </div>
    `;

    // Force a reflow to ensure DOM is updated
    chartContainer.offsetHeight;

    // Create individual charts
    const createIndividualChart = (containerId, title, cityValue, stateValue, formatType, cityColor) => {
      const container = document.querySelector(containerId);
      if (!container) {
        console.error(`Container not found: ${containerId}`);
        return null;
      }

      const options = {
        chart: {
          type: 'bar',
          height: 160,
          background: 'transparent',
          toolbar: { show: false },
          sparkline: { enabled: false }
        },
        series: [
          {
            name: selectedCity.NAME,
            data: [cityValue]
          },
          {
            name: 'State Avg',
            data: [stateValue]
          }
        ],
        xaxis: {
          categories: [''],
          labels: {
            style: {
              colors: '#bdc3c7',
              fontSize: '9px'
            },
            formatter: function(val) {
              // Handle non-numeric values and negative values
              if (val === null || val === undefined || isNaN(val) || val === -666666666 || val < 0) {
                return 'N/A';
              }
              if (formatType === 'density') return val.toString();
              if (formatType === 'population') return val >= 1000 ? (val/1000).toFixed(1) + 'K' : val.toString();
              if (formatType === 'percentage') return val.toFixed(1) + '%';
              return '$' + (val >= 1000 ? (val/1000).toFixed(1) + 'K' : val.toString());
            }
          }
        },
        yaxis: {
          labels: {
            style: {
              colors: '#bdc3c7',
              fontSize: '9px'
            }
          }
        },
        colors: [cityColor, '#3498db'],
        plotOptions: {
          bar: {
            horizontal: true,
            borderRadius: 2,
            dataLabels: {
              position: 'center'
            }
          }
        },
        legend: {
          show: false
        },
        dataLabels: {
          enabled: true,
          formatter: function(val) {
            // Handle non-numeric values and negative values
            if (val === null || val === undefined || isNaN(val) || val === -666666666 || val < 0) {
              return 'N/A';
            }
            if (formatType === 'density') return val.toString();
            if (formatType === 'population') return val >= 1000 ? (val/1000).toFixed(1) + 'K' : val.toString();
            if (formatType === 'percentage') return val.toFixed(1) + '%';
            return '$' + (val >= 1000 ? (val/1000).toFixed(1) + 'K' : val.toString());
          },
          style: {
            fontSize: '9px',
            colors: ['#ffffff'],
            fontWeight: 600
          },
          offsetX: 0
        },
        grid: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
          strokeDashArray: 2
        }
      };

      try {
        return new ApexCharts(container, options);
      } catch (error) {
        console.error(`Error creating chart for ${containerId}:`, error);
        return null;
      }
    };

    // Create all 5 charts with a small delay to ensure DOM is ready
    const chartIds = ['#chart-population', '#chart-income', '#chart-rent', '#chart-home', '#chart-poverty'];
    
    setTimeout(() => {
      try {
        // Verify all chart containers exist before creating charts
        const missingElements = chartIds.filter(id => !document.querySelector(id));
        
        if (missingElements.length > 0) {
          console.error('Missing chart containers:', missingElements);
          // Try to recreate the HTML if it's missing
          if (chartContainer.innerHTML.trim() === '') {
            chartContainer.innerHTML = `
              <div class="demographics-grid">
                <div class="chart-item">
                  <h4>Population Density</h4>
                  <div id="chart-population"></div>
                </div>
                <div class="chart-item">
                  <h4>Median Income</h4>
                  <div id="chart-income"></div>
                </div>
                <div class="chart-item">
                  <h4>Median Rent</h4>
                  <div id="chart-rent"></div>
                </div>
                <div class="chart-item">
                  <h4>Median Home Value</h4>
                  <div id="chart-home"></div>
                </div>
                <div class="chart-item">
                  <h4>Poverty Rate</h4>
                  <div id="chart-poverty"></div>
                </div>
              </div>
            `;
          }
          
          // Try again with a longer delay
          setTimeout(() => {
            const retryMissingElements = chartIds.filter(id => !document.querySelector(id));
            if (retryMissingElements.length > 0) {
              console.error('Still missing chart containers after retry:', retryMissingElements);
              return;
            }
            createDemographicsCharts();
          }, 200);
          return;
        }

        // Additional verification that containers are empty and ready
        const containersReady = chartIds.every(id => {
          const container = document.querySelector(id);
          return container && container.children.length === 0;
        });

        if (!containersReady) {
          console.warn('Some chart containers are not ready, retrying...');
          setTimeout(createDemographicsCharts, 100);
          return;
        }

        createDemographicsCharts();
      } catch (error) {
        console.error('Error creating demographics charts:', error);
      }
    }, 100);

    // Function to create the actual charts
    function createDemographicsCharts() {
      // Get the city's color from the map
      const cityColor = getCityColor(selectedCity, 'population'); // Use population colors for consistency
      
      const charts = [
        createIndividualChart('#chart-population', 'Population Density', demoData.cityValues[0], demoData.stateValues[0], 'density', cityColor),
        createIndividualChart('#chart-income', 'Median Income', demoData.cityValues[1], demoData.stateValues[1], 'currency', cityColor),
        createIndividualChart('#chart-rent', 'Median Rent', demoData.cityValues[2], demoData.stateValues[2], 'currency', cityColor),
        createIndividualChart('#chart-home', 'Median Home Value', demoData.cityValues[3], demoData.stateValues[3], 'currency', cityColor),
        createIndividualChart('#chart-poverty', 'Poverty Rate', demoData.cityValues[4], demoData.stateValues[4], 'percentage', cityColor)
      ];

      // Render all charts
      charts.forEach((chart, index) => {
        try {
          if (chart === null) {
            console.warn(`Chart ${chartIds[index]} was not created`);
            return;
          }
          
          const container = document.querySelector(chartIds[index]);
          if (container && container.children.length === 0) {
            chart.render();
          } else {
            console.warn(`Chart container ${chartIds[index]} is not ready`);
          }
        } catch (error) {
          console.warn('Failed to render chart:', error);
        }
      });

      // Store reference to the first valid chart for cleanup
      const validCharts = charts.filter(chart => chart !== null);
      currentChart = validCharts.length > 0 ? validCharts[0] : null;
    }
    return;
  }

  const data = prepareChartData(chartData, type);
  const title = type === 'population' ? 'Top 15 Cities by Population' : 'Top 15 Cities by Population Density';
  const yAxisTitle = type === 'population' ? 'Population' : 'Population Density (per sq mile)';

  const options = {
    chart: {
      type: 'bar',
      height: 380,
      background: 'transparent',
      toolbar: {
        show: false
      }
    },
    series: [{
      name: yAxisTitle,
      data: data.values
    }],
    xaxis: {
      categories: data.labels,
      labels: {
        style: {
          colors: '#bdc3c7',
          fontSize: '9px'
        },
        rotate: -45,
        rotateAlways: true,
        maxHeight: 80,
        formatter: function(value) {
          if (Array.isArray(value)) {
            return value.join('\n');
          }
          return value;
        }
      }
    },
    yaxis: {
      title: {
        text: yAxisTitle,
        style: {
          color: '#ecf0f1',
          fontSize: '12px'
        }
      },
      labels: {
        style: {
          colors: '#bdc3c7',
          fontSize: '11px'
        }
      }
    },
    colors: data.colors,
    plotOptions: {
      bar: {
        borderRadius: 4,
        dataLabels: {
          position: 'top'
        },
        distributed: true
      }
    },
    legend: {
      show: false
    },
    dataLabels: {
      enabled: true,
      formatter: function(val) {
        return type === 'population' ? 
          (val >= 1000 ? (val/1000).toFixed(1) + 'K' : val.toString()) :
          val.toString();
      },
      style: {
        fontSize: '10px',
        colors: ['#ffffff'],
        fontWeight: 600
      },
      offsetY: -15
    },
    title: {
      text: title,
      align: 'left',
      style: {
        color: '#ecf0f1',
        fontSize: '14px',
        fontWeight: 600
      }
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.1)',
      strokeDashArray: 3
    }
  };

  if (currentChart) {
    currentChart.destroy();
  }

  currentChart = new ApexCharts(document.querySelector("#chart-container"), options);
  currentChart.render();
}

// Function to fix popup accessibility issues
function fixPopupAccessibility() {
  setTimeout(() => {
    const closeButton = document.querySelector('.maplibregl-popup-close-button');
    if (closeButton) {
      closeButton.removeAttribute('aria-hidden');
    }
  }, 10);
}

// Function to format popup content
function formatPopupContent(properties) {
  const formatNumber = (num) => {
    if (num === -666666666 || num === null || num === undefined) return 'N/A';
    return num.toLocaleString();
  };

  const formatCurrency = (num) => {
    if (num === -666666666 || num === null || num === undefined) return 'N/A';
    return `$${num.toLocaleString()}`;
  };

  const formatPercentage = (num) => {
    if (num === -666666666 || num === null || num === undefined) return 'N/A';
    return `${num.toFixed(1)}%`;
  };

  // Parse place type from NAMELSAD
  const getPlaceType = (namelsad) => {
    if (namelsad.includes('CDP')) return 'Census Designated Place';
    if (namelsad.includes('city')) return 'City';
    if (namelsad.includes('town')) return 'Town';
    return 'Place';
  };

  const placeType = getPlaceType(properties.NAMELSAD);

  return `
    <div class="popup-content">
      <h3>${properties.NAME}</h3>
      <p><strong>Type:</strong> ${placeType}</p>
      
      <h4>Demographics</h4>
      <p><strong>Population:</strong> ${formatNumber(properties.Total_Pop)}</p>
      <p><strong>Population Density:</strong> ${formatNumber(properties.Pop_Density)} people/sq mile</p>
      <p><strong>Median Income:</strong> ${formatCurrency(properties.Median_Income)}</p>
      <p><strong>Poverty Rate:</strong> ${formatPercentage(properties.Poverty_Rate)}</p>
      
      <h4>Housing</h4>
      <p><strong>Median Rent:</strong> ${formatCurrency(properties.Median_Rent)}</p>
      <p><strong>Median Home Value:</strong> ${formatCurrency(properties.Median_Home_Value)}</p>
      
      <h4>Education</h4>
      <p><strong>Bachelor's Degree or Higher:</strong> ${formatPercentage(properties.Pct_Bachelors_or_Higher)}</p>
      <p><strong>Total Education Population:</strong> ${formatNumber(properties.Educ_Total)}</p>
    </div>
  `;
}


