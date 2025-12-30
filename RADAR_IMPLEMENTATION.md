# Ski Conditions Aggregator - Radar Overlay Implementation

## Overview

This document describes the fully functional precipitation radar overlay system for the Ski Conditions Aggregator. The implementation provides animated, 72-hour historical precipitation data from NOAA's MRMS and RainViewer, displayed as a Doppler-style overlay on the Leaflet map.

## Architecture

### Components

#### 1. **Frontend: ResortMap.tsx**
- React component managing the Leaflet map and radar canvas overlay
- **Key Features:**
  - Canvas-based rendering for 60fps smooth animation
  - Map-independent overlay (stays synchronized during zoom/pan)
  - Crossfade transitions between consecutive precipitation frames
  - Control UI for playback, speed, opacity, and time window

#### 2. **API: `/api/radar/frames`**
- Fetches available radar frame timestamps
- **Data Sources:**
  - MRMS (NOAA): Multi-Radar Multi-Sensor System
  - RainViewer: High-quality global precipitation data
- **Returns:** List of timestamps for 72-hour lookback
- **Update Frequency:** 2 minutes (MRMS), 10 minutes (RainViewer)

#### 3. **API: `/api/radar/tile`**
- Proxy endpoint for weather radar tiles
- **Tile Sources:**
  1. RainViewer (primary): `https://tilecache.rainviewer.com/`
  2. MRMS (fallback): `https://mesonet.agron.iastate.edu/` WMS
- **Tile Format:** 256x256 PNG, XYZ tile coordinates
- **Caching:** 24h for historical tiles, 1h for current

## How It Works

### Rendering Pipeline

```
1. Load Frames
   └─> API: /api/radar/frames
       └─> Returns: [timestamp1, timestamp2, ...]

2. Animation Loop (RAF ~60fps)
   ├─> Get current frame index
   ├─> Fetch next frame
   └─> Render on canvas

3. Tile Rendering (Per Frame)
   ├─> Get map bounds (lat/lon)
   ├─> Calculate tile coordinates (z/x/y)
   ├─> Fetch tiles: API: /api/radar/tile?time=X&z=Z&x=X&y=Y
   ├─> Draw tiles onto frame canvas
   └─> Apply opacity/filters

4. Crossfade Animation
   ├─> Draw frame N (full opacity)
   ├─> Draw frame N+1 (alpha: 0→1)
   └─> Advance on completion
```

### Map Synchronization

The radar overlay stays locked to map coordinates through:

1. **Coordinate Transform:**
   ```typescript
   // Map world coordinates to canvas pixel coordinates
   const centerWorld = map.project(center, zoom);
   const tileX = Math.floor(leftWorldX / 256); // tile column
   const tileY = Math.floor(topWorldY / 256);  // tile row
   ```

2. **Zoom Handling:**
   - Tiles are recalculated when map zoom changes
   - Frame canvas cache is cleared on zoom to force redraw
   - New tiles fetched at correct zoom level

3. **Pan Handling:**
   - Happens automatically via coordinate transform
   - No offset drift because tiles are always positioned correctly relative to world coordinates

## Data Sources

### NOAA MRMS (Primary)
- **URL:** `https://mrms.ncep.noaa.gov/data/2D/`
- **Products:**
  - `PrecipRate`: Precipitation rate (color-coded)
  - `ReflectivityQC`: Base reflectivity (dBZ)
  - `GaugeOnlyQPE`: Gauge-based quantitative precipitation
- **Resolution:** 1km x 1km
- **Update:** Every 2 minutes
- **Coverage:** Continental US, Alaska, Caribbean, Guam, Hawaii
- **Cost:** Free, public
- **Advantage:** Official US weather data, high frequency updates

### RainViewer (Secondary)
- **URL:** `https://tilecache.rainviewer.com/v2/radar/`
- **Resolution:** 1km x 1km
- **Update:** Every 10 minutes
- **Coverage:** Global
- **Cost:** Free tier available
- **Advantage:** Better visual quality, global coverage, easier integration

## Configuration

### Animation Controls (UI)

| Control | Range | Default | Effect |
|---------|-------|---------|--------|
| Play/Pause | - | Playing | Start/stop animation |
| Time Window | 24h / 48h / 72h | 24h | Historical data lookback |
| Speed | 100-2000ms | 500ms | Frame duration (lower = faster) |
| Opacity | 0-100% | 75% | Overlay transparency |

### Performance Tuning

**Tile Cache:** 
- Max 256 tiles in memory (bitmaps)
- Max 32 frame canvases in memory
- Automatic LRU eviction

**Frame Rate:**
- 60fps target (requestAnimationFrame)
- Adaptive: skips if busy

**Network:**
- Parallel tile fetches (up to 16 concurrent)
- 5min cache on frames API
- 24h cache on historical tiles

## Development

### Testing the Radar

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to map** → Check bottom-left for radar controls

3. **Verify frames load:**
   - Open DevTools Network tab
   - Check `/api/radar/frames` response
   - Should see `{ radar: { past: [...] } }`

4. **Verify tiles load:**
   - Play animation
   - Check `/api/radar/tile?...` requests
   - Tiles should appear on canvas

### Debugging

**Check if frames are available:**
```javascript
const res = await fetch('/api/radar/frames');
const data = await res.json();
console.log(data.radar.past.length, 'frames available');
```

**Verify map coordinate transformation:**
- Zoom/pan the map
- Radar should track smoothly
- No drift or jitter

**Monitor tile cache:**
- Open DevTools Console
- Radar will log cache stats to console during development

## Known Limitations

1. **Tile Availability:**
   - RainViewer: ~12-24 hour lookback on free tier
   - MRMS: ~4 hour lookback via WMS
   - Some older timestamps may return "no data"

2. **Geographic Coverage:**
   - MRMS: Continental US only (primary)
   - RainViewer: Global but may have gaps

3. **Browser Support:**
   - Requires `ImageBitmap` support (all modern browsers)
   - Requires `devicePixelRatio` support (all modern browsers)
   - Falls back to transparent tiles gracefully

4. **Mobile Performance:**
   - Heavy on low-end devices
   - May reduce opacity/simplify on mobile detection

## Future Enhancements

1. **Multi-Product Support:**
   - Add toggle between PrecipRate, Reflectivity, etc.
   - Show hail/tornado products

2. **Forecast Extension:**
   - Add radar forecast (next 6-12 hours)
   - Show confidence intervals

3. **Data Enhancements:**
   - Integrate HRRR forecast model
   - Add satellite data layer
   - Overlay with weather alerts

4. **UX Improvements:**
   - Add legend (color scale for precipitation rate)
   - Timeline slider for frame selection
   - Coordinate display on hover
   - Export animation as GIF

## Troubleshooting

### "No frames available"
- Check API endpoint: `curl https://mesonet.agron.iastate.edu/json/radar/mrms_qpe.json`
- RainViewer may be rate-limited; try again in a few minutes
- Check browser console for CORS errors

### Animation is blank/black
- Verify tiles are loading in Network tab
- Check if timestamps are valid (should be epoch ms)
- May be timezone issue; tiles timestamp in UTC

### Animation is slow/stuttering
- Reduce time window (24h instead of 72h)
- Increase frame duration (Speed slider)
- Lower opacity to reduce rendering load
- Close other browser tabs

### Map zoom/pan doesn't sync with radar
- This is expected if loading tiles; wait for current frame to finish
- If persistent, check browser console for errors
- Try clicking "Play" to restart animation

## References

- [NOAA MRMS Documentation](https://www.nssl.noaa.gov/projects/mrms/)
- [RainViewer API](https://www.rainviewer.com/api.html)
- [Leaflet Map Library](https://leafletjs.com/)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [ImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmap)
