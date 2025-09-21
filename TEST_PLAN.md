# MapLibre Migration Test Plan

## Visual Parity Testing

### Screenshot Comparison Points
- **Zoom Level 5**: State-wide view showing all cities
- **Zoom Level 10**: Regional view with city details
- **Zoom Level 14**: City-level detail view

### Test Views
1. **Population Layer (Default)**
   - Verify color scale matches original
   - Check city boundaries and fills
   - Confirm CDP (gray) vs city (colored) distinction

2. **Density Layer**
   - Switch to density view
   - Verify density-based color mapping
   - Check layer switching functionality

## Interaction Testing

### Map Interactions
- [ ] **Click Events**: City popups display correctly
- [ ] **Hover Effects**: City highlighting on mouseover
- [ ] **Layer Switching**: Population ↔ Density toggle
- [ ] **Color Key**: Hover/click highlighting works
- [ ] **Chart Toggle**: Show/hide charts functionality

### Chart Functionality
- [ ] **Population Chart**: Top 15 cities display
- [ ] **Density Chart**: Top 15 cities by density
- [ ] **Demographics Chart**: Individual city details
- [ ] **Chart Switching**: All chart types work
- [ ] **City Selection**: Clicking city updates demographics

### Responsive Design
- [ ] **Mobile View**: Layout adapts to smaller screens
- [ ] **Chart Responsiveness**: Charts scale appropriately
- [ ] **Popup Positioning**: Popups don't overflow viewport

## Technical Testing

### Console/Network
- [ ] **No 4xx/5xx Errors**: All requests successful
- [ ] **No Mapbox Requests**: No `mapbox://` URLs in network tab
- [ ] **No Token Warnings**: No access token errors
- [ ] **Asset Loading**: Fonts and sprites load correctly

### Performance
- [ ] **Initial Load**: Map loads within 3 seconds
- [ ] **Smooth Interactions**: No lag on hover/click
- [ ] **Memory Usage**: No memory leaks during extended use

### Accessibility
- [ ] **Keyboard Navigation**: Tab through interactive elements
- [ ] **Screen Reader**: Popup content is accessible
- [ ] **Reduced Motion**: Respects `prefers-reduced-motion`
- [ ] **Focus Indicators**: Clear focus states visible

## Browser Compatibility

### Test Browsers
- [ ] **Chrome**: Latest version
- [ ] **Firefox**: Latest version  
- [ ] **Safari**: Latest version
- [ ] **Edge**: Latest version

### Mobile Browsers
- [ ] **iOS Safari**: Mobile view
- [ ] **Chrome Mobile**: Android view

## Data Integrity

### GeoJSON Loading
- [ ] **Data Completeness**: All cities load correctly
- [ ] **Property Access**: All demographic data accessible
- [ ] **Calculations**: Population density calculations correct
- [ ] **Filtering**: CDP vs city filtering works

### Chart Data
- [ ] **Sorting**: Cities sorted by population/density correctly
- [ ] **Formatting**: Numbers formatted properly (K notation, currency)
- [ ] **State Averages**: State average calculations correct
- [ ] **Missing Data**: N/A values handled gracefully

## Regression Testing

### Existing Features
- [ ] **Color Scales**: Match original exactly
- [ ] **Popup Content**: All fields display correctly
- [ ] **Chart Styling**: Visual appearance unchanged
- [ ] **Layer Controls**: UI positioning and styling
- [ ] **Chart Controls**: Button states and interactions

### New Requirements
- [ ] **Vendor Independence**: No Mapbox dependencies
- [ ] **Local Assets**: Fonts and sprites load from local paths
- [ ] **Style Conversion**: Dark theme maintained
- [ ] **Performance**: No degradation from original
