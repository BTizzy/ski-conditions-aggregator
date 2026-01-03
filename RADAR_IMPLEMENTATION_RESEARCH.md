# 48-Hour Radar Overlay: Complete Technical Research & Implementation Plan

## Executive Summary

You need to build a **48-hour synthetic snowfall radar** that:
- Shows **48 frames** (1 per hour, not 2)
- Looks professional when users **zoom in/out rapidly**
- Supports **4-7 zoom levels** (Leaflet pyramid)
- Maintains **smooth animation** across frame transitions
- Uses **your 43 resort observations** as ground truth

**The Problem with Current Approach:**
- RainViewer API only provides **2-3 actual radar hours** (you're "lying" about 48)
- Free APIs (HRRR, Mesonet) have limited temporal resolution
- Need to **generate synthetic frames** from available data

---

## Part 1: Tile Pyramid Architecture (for zoom performance)

### Zoom Level Requirements

When users zoom in/out rapidly, they need tiles at MULTIPLE zoom levels:

| Zoom | Tiles Needed | Use Case | Complexity |
|------|-------------|----------|----------|
| **5** | 32×32 (1,024 tiles) | Continental view | LOW |
| **6** | 64×64 (4,096 tiles) | Regional (Northeast) | LOW-MED |
| **7** | 128×128 (16,384 tiles) | State level | MEDIUM |
| **8** | 256×256 (65k tiles) | County level | HIGH |
| **9** | 512×512 (262k tiles) | Local area | VERY HIGH |
| **10+** | 1M+ tiles | Zoomed in | NOT PRACTICAL |

### Recommendation for Your App

**Support Zoom 5-8 (4 levels):**
- ✅ Covers continental down to county-level detail
- ✅ ~85,000 total tiles (manageable)
- ✅ Users can zoom in on specific resorts
- ❌ Can't go ultra-detailed (that's ok for weather)

**Storage Calculation:**
```
48 hours × 4 zoom levels × avg 10,000 tiles per zoom × 8KB per tile = 15.4 GB

More realistic (with caching): ~3-5 GB
```

---

## Part 2: Data Sources for 48-Hour Synthetic Radar

### Option A: Your Resort Observations Only (Recommended - START HERE)

**Data You Have:**
- 43 resorts across Northeast
- Real-time: snowfall, temp, wind, base depth
- Ground truth (most reliable)

**Approach: Spatial Interpolation (IDW)**
```
For each grid cell:
  1. Find 3-5 nearest resorts
  2. Weight by inverse distance squared
  3. Interpolate snowfall rate
  4. Color by intensity
  5. Cache result
```

**Pros:**
- ✅ No external APIs
- ✅ Uses YOUR best data
- ✅ Fast to generate
- ✅ Can backfill historical

**Cons:**
- ❌ Sparse in remote areas (gaps between resorts)
- ❌ No temporal continuity (jumps hour to hour)

**Resolution:** ~5-10km (adequate for ski radar)

---

### Option B: Blended (Observations + NOAA Model)

**Add These FREE Sources:**

1. **NOAA National Blend of Models (NBM)**
   - URL: `https://api.weather.gov/gridpoints/{point}/forecast/hourly`
   - Cadence: Hourly
   - Resolution: 2.5km grid
   - Data: Quantitative Precip Forecast (QPF), probability

2. **HRRR (High-Resolution Rapid Refresh)**
   - Cadence: 15-minute updates
   - Resolution: 3km
   - Best for: Short-term nowcasting (0-24h)
   - Source: https://nomads.ncei.noaa.gov/thredds

3. **CMC GDPS (Canadian)**
   - For 24-48h extended forecast
   - 15km resolution
   - Hourly steps

**Blend Formula:**
```
final_snowfall = (0.7 × interpolated_observations) + (0.3 × nwp_model)
```

**Pros:**
- ✅ Ground-truth weighted (your data is most important)
- ✅ Fills spatial gaps
- ✅ Temporal continuity
- ✅ 48h coverage possible

**Cons:**
- ❌ Requires model API calls
- ❌ Models less accurate than observations

---

### Option C: Pure Model-Based (HRRR + CMC)

**If you had no observations:**
```
0-24h:  Use HRRR (3km resolution, high accuracy)
24-48h: Use CMC GDPS (15km resolution)
```

Not recommended for you (you have 43 ground-truth points!).

---

## Part 3: Frame Generation Strategy

### Pseudocode for 48-Hour Sequence

```typescript
// 1. COLLECT DATA
async function collect48HourData() {
  const frames = [];
  const now = new Date();
  
  for (let hour = 0; hour < 48; hour++) {
    const timestamp = new Date(now.getTime() + hour * 3600000);
    
    // Get resort observations for this hour
    const observations = await getResortConditionsAt(timestamp);
    
    // Optional: Get NOAA forecast to fill gaps
    const model = await getNOAAForecast(timestamp);
    
    frames.push({
      timestamp,
      observations,
      model,
      snowfallGrid: null // Will compute below
    });
  }
  return frames;
}

// 2. GENERATE GRID DATA (Spatial Interpolation)
function generateSnowfallGrid(observations, modelForecast) {
  const grid = [];
  
  // NE bounding box (roughly)
  const bounds = {
    minLat: 41.2, maxLat: 47.0,  // Maine to Connecticut
    minLng: -74.5, maxLng: -66.8   // New Jersey to Maine
  };
  
  // Create 0.05° grid (~5km cell size)
  for (let lat = bounds.minLat; lat <= bounds.maxLat; lat += 0.05) {
    for (let lng = bounds.minLng; lng <= bounds.maxLng; lng += 0.05) {
      const cell = { lat, lng };
      
      // IDW interpolation from nearest 3 resorts
      const snowfall = interpolateIDW(cell, observations, k=3);
      
      // Optional: blend with model
      // const blended = 0.7 * snowfall + 0.3 * modelForecast.getValueAt(cell);
      
      grid.push({
        lat, lng, snowfall
      });
    }
  }
  
  return grid;
}

// 3. RENDER TO TILES (Multiple Zoom Levels)
async function renderToTiles(grid, timestamp) {
  const tilesByZoom = {};
  
  for (let zoom = 5; zoom <= 8; zoom++) {
    const tiles = await renderTilePyramid(grid, zoom, timestamp);
    tilesByZoom[zoom] = tiles;
  }
  
  return tilesByZoom;
}

// 4. CACHE TO DISK
async function cacheFrames(allFrames) {
  // Directory structure:
  // /radar-cache/{timestamp}/z{zoom}/{x}/{y}.png
  
  for (const frame of allFrames) {
    for (const [zoom, tiles] of Object.entries(frame.tiles)) {
      for (const [tileKey, canvas] of Object.entries(tiles)) {
        const [x, y] = tileKey.split(',');
        await saveTile(
          canvas,
          `radar-cache/${frame.timestamp}/z${zoom}/${x}/${y}.png`
        );
      }
    }
  }
}
```

---

## Part 4: Tile Rendering Details

### Snowfall Color Mapping

```typescript
const snowfallToColor = (inchesPerHour: number) => {
  // Standard weather radar colors
  if (inchesPerHour >= 2.0) return '#0047AB';     // Dark blue - heavy
  if (inchesPerHour >= 1.0) return '#0096FF';     // Bright blue - mod-heavy
  if (inchesPerHour >= 0.5) return '#00D9FF';     // Cyan - moderate
  if (inchesPerHour >= 0.25) return '#90EE90';    // Light green - light
  if (inchesPerHour >= 0.1) return '#FFFF00';     // Yellow - trace
  if (inchesPerHour > 0) return '#FFFFCC';        // Very light yellow
  return 'transparent';
};
```

### Canvas Tile Generation (256×256px)

```typescript
async function renderTile(grid, x, y, zoom, timestamp) {
  const canvas = new OffscreenCanvas(256, 256);
  const ctx = canvas.getContext('2d');
  
  // Calculate lat/lng bounds for this tile
  const bounds = tileToLatLng(x, y, zoom);
  
  // Filter grid points in this tile
  const tilePoints = grid.filter(p =>
    p.lat >= bounds.minLat && p.lat <= bounds.maxLat &&
    p.lng >= bounds.minLng && p.lng <= bounds.maxLng
  );
  
  // Draw each point as colored pixel
  for (const point of tilePoints) {
    const px = latLngToPixel(point.lat, point.lng, bounds);
    ctx.fillStyle = snowfallToColor(point.snowfall);
    ctx.fillRect(px.x, px.y, 2, 2);
  }
  
  // Convert to PNG
  const blob = await canvas.convertToBlob({ type: 'image/png' });
  return blob;
}
```

---

## Part 5: Storage & Caching Strategy

### Disk Storage (Pre-generate on server)

```
Option 1: Full Pre-generation (Recommended)
├── Generate all 48 frames when server starts
├── All 4 zoom levels
├── Total: ~85k tiles × 8KB = 680MB (compressed PNG)
├── Load time: ~30 seconds on first run
└── Serve from disk (lightning fast)

Option 2: Lazy Generation
├── Generate frames on-demand
├── Cache tier: Redis (in-memory) → S3 (persistent)
├── First frame: slow (5-10s)
└── Subsequent requests: instant
```

### Memory Usage During Generation

```
Per frame (all zoom levels):
- Grid data: 10k points × 24 bytes = 240KB
- Canvases (5-8): 256×256×4 × 4 canvases = 1MB
- Total per frame: ~1.5MB
- 48 frames: 72MB (manageable)
```

---

## Part 6: Animation & Playback

### Frame Timing

```typescript
const frames = [
  { timestamp: "2025-12-31 03:00", url: "/radar/z5/tile/...png" },
  { timestamp: "2025-12-31 04:00", url: "/radar/z5/tile/...png" },
  // ... 48 total
];

// Your existing animation loop handles this perfectly!
// 1 frame per hour = 48 frames for 48 hours
// At 800ms speed = 38.4 second loop
```

---

## Part 7: API Endpoints Needed

### 1. Generate 48-Hour Radar (Backend Task)

```
POST /api/radar/generate
├── Input: none (uses current time)
├── Output: { status, framesGenerated, cacheSize }
├── Runtime: ~2-5 minutes first time
└── Frequency: Run once daily (or hourly)
```

### 2. Serve Tiles (Fast)

```
GET /api/radar/tile?z={zoom}&x={x}&y={y}&timestamp={iso}
├── Input: zoom level, tile coords, timestamp
├── Output: PNG image (cached, instant)
└── Cache-Control: 24 hours
```

### 3. List Available Frames

```
GET /api/radar/frames
├── Output: [
│   { timestamp: "2025-12-31T03:00Z", available: true },
│   { timestamp: "2025-12-31T04:00Z", available: true },
│   // ... 48 items
│ ]
```

---

## Part 8: Performance Targets

| Operation | Target | Status |
|-----------|--------|--------|
| Generate 48 frames (first time) | < 5 min | ✅ Achievable |
| Serve single tile from cache | < 50ms | ✅ Achievable |
| Animate 48 frames @ 800ms | Smooth 20fps | ✅ Already working |
| Zoom in/out while animating | <100ms response | ✅ With proper caching |
| Memory during playback | <50MB | ✅ Achievable |
| Disk storage for 48h × 4 zoom | <1GB | ✅ Manageable |

---

## Part 9: Implementation Roadmap

### Phase 1: Synthetic Grid Generation (2-3 hours)
- ✅ Implement IDW interpolation
- ✅ Generate grid from your 43 resort observations
- ✅ Test with one timestamp

### Phase 2: Tile Rendering (2 hours)
- ✅ Render grid to tile pyramid (zoom 5-8)
- ✅ Color mapping (snowfall → hex color)
- ✅ Cache tiles to disk

### Phase 3: 48-Hour Sequence (1 hour)
- ✅ Generate frames for all 48 hours
- ✅ Implement frame storage structure
- ✅ Expose via API endpoint

### Phase 4: Animation Integration (30 min)
- ✅ Feed 48 frames to existing animation loop
- ✅ Update UI to show hour labels
- ✅ Test zoom/pan performance

### Phase 5: Blended Model (Optional, later)
- ⏸️ Add NOAA NBM/HRRR data
- ⏸️ Blend with observations
- ⏸️ Better accuracy for remote areas

---

## Key Insights

1. **Your 43 resorts are GOLD** - They're ground-truth observations. Use them as primary data.

2. **Zoom levels matter** - Support zoom 5-8 covers everything from continental to county-level.

3. **Pre-generate, don't compute on-the-fly** - Generate all 48 frames once, serve from cache.

4. **Spatial interpolation is simple & fast** - IDW with k=3 neighbors works great.

5. **Animation loop already works** - Just feed it 48 real frames instead of 2.

6. **No complex modeling needed** - Observations + simple interpolation looks professional.

---

## File Structure (What You'll Create)

```
/app/api/radar/
├── generate.ts         # Generate 48-hour synthetic frames
├── tile.ts            # Serve pre-generated tiles
├── frames.ts          # List available frames
└── lib/
    ├── interpolation.ts    # IDW algorithm
    ├── colormap.ts        # Snowfall → color
    ├── tiling.ts          # Tile pyramid math
    └── storage.ts         # Disk caching
```