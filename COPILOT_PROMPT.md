# Copilot Prompt: Build 48-Hour Synthetic Snowfall Radar

## Context

We have a ski conditions aggregator app (`ski-conditions-aggregator`) with:
- 43 Northeast ski resort locations with real-time conditions (snowfall, temp, wind, base depth)
- Leaflet map with animation loop already working smoothly
- Current radar overlay showing only 2-3 hours, falsely claiming 48 hours

## Goal

**Generate and animate a real 48-hour synthetic snowfall radar overlay** using spatial interpolation of our resort observations. The radar must:

1. ✅ Generate exactly 48 frames (one per hour for 48 hours)
2. ✅ Support zoom levels 5-8 (continental down to county-level detail)
3. ✅ Use Inverse Distance Weighting (IDW) to interpolate snowfall across Northeast from 43 resort points
4. ✅ Render to tile pyramid format (256×256px PNG tiles)
5. ✅ Cache tiles to disk for instant serving
6. ✅ Serve via API endpoint that the animation loop consumes
7. ✅ Show proper snowfall colors (blue for heavy, yellow for light, transparent for none)
8. ✅ Work smoothly when users zoom in/out while animating

## Technical Requirements

### Data Structure for Resort Conditions

We have this data available (from existing app):
```typescript
interface ResortConditions {
  resortId: string;
  snowDepth: number;           // inches
  recentSnowfall: number;      // 24h snowfall in inches
  weeklySnowfall?: number;
  baseTemp: number;            // °F
  windSpeed: number;           // mph
  visibility: string;
  timestamp: string;           // ISO timestamp
}
```

Use `recentSnowfall` (24h snowfall) as the primary metric for interpolation.

### Tile Pyramid Specification

- **Zoom levels:** 5, 6, 7, 8
- **Tile size:** 256×256 pixels
- **Grid cell resolution:** 0.05° (~5km) for interpolation grid
- **Bounds:** NE region (lat: 41.2-47.0, lng: -74.5 to -66.8)
- **Tile format:** PNG with transparency
- **Coordinate system:** Web Mercator (Leaflet standard)

### Color Mapping

```typescript
snowfallToColor(inchesPerHour: number):
  >= 2.0": "#0047AB"  (dark blue - heavy)
  >= 1.0": "#0096FF"  (bright blue - mod-heavy)
  >= 0.5": "#00D9FF"  (cyan - moderate)
  >= 0.25": "#90EE90" (green - light)
  >= 0.1": "#FFFF00"  (yellow - trace)
  > 0": "#FFFFCC"     (pale yellow - very light)
  else: transparent
```

### IDW Interpolation Formula

For each grid cell, find k=3 nearest resorts and weight by inverse squared distance:

```
value = Σ(weight_i × value_i) / Σ(weight_i)
where weight_i = 1 / (distance_i² + epsilon)
epsilon = 0.0001 (avoid division by zero)
```

---

## Implementation Tasks

### Task 1: Create Interpolation Library

**File:** `app/api/radar/lib/interpolation.ts`

Implement:
```typescript
// IDW spatial interpolation
function interpolateIDW(
  point: { lat: number; lng: number },
  observations: Array<{ lat: number; lng: number; value: number }>,
  k: number = 3
): number

// Generate interpolation grid for bounds
function generateGrid(
  bounds: { minLat, maxLat, minLng, maxLng },
  cellSize: number = 0.05
): Array<{ lat: number; lng: number }>

// Haversine distance
function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number
```

**Requirements:**
- K-nearest neighbor search (k=3)
- Inverse squared distance weighting
- Handle edge cases (point coincident with observation)
- Return numeric value 0-3 inches/hour range

---

### Task 2: Create Color Mapping

**File:** `app/api/radar/lib/colormap.ts`

Implement:
```typescript
// Convert snowfall inches/hour to hex color
function snowfallToColor(inchesPerHour: number): string

// Create color ramp for legend
function createLegend(): Array<{
  label: string;
  color: string;
  value: number;
}>
```

---

### Task 3: Create Tile Pyramid Math

**File:** `app/api/radar/lib/tiling.ts`

Implement:
```typescript
// Convert lat/lng to tile coordinates
function latLngToTile(
  lat: number,
  lng: number,
  zoom: number
): { x: number; y: number }

// Convert tile coords back to lat/lng bounds
function tileToLatLng(
  x: number,
  y: number,
  zoom: number
): { minLat, maxLat, minLng, maxLng }

// Convert tile-relative pixel coords to lat/lng
function pixelToLatLng(
  pixelX: number,
  pixelY: number,
  tileX: number,
  tileY: number,
  zoom: number
): { lat: number; lng: number }

// Get all tiles needed for given bounds/zoom
function getTilesForBounds(
  bounds: { minLat, maxLat, minLng, maxLng },
  zoom: number
): Array<{ x: number; y: number }>
```

**Notes:**
- Use Web Mercator projection (standard for Leaflet)
- Formula: `n = 2^zoom`, x = n * ((lng + 180) / 360), y = n * (1 - ln(tan(lat*π/180) + sec(lat*π/180)) / π) / 2`

---

### Task 4: Implement Frame Generation

**File:** `app/api/radar/lib/framegenerator.ts`

Implement:
```typescript
async function generateSyntheticFrame(
  timestamp: Date,
  resorts: Resort[],
  conditions: Record<string, ResortConditions | null>,
  zoomLevels: number[] = [5, 6, 7, 8]
): Promise<{
  timestamp: Date;
  tiles: Record<number, Map<string, HTMLCanvasElement | Buffer>>;
  metadata: {
    pointCount: number;
    gridSize: number;
    tilesPerZoom: number;
  };
}>
```

**Process:**
1. Extract resort observations at given timestamp
2. Generate interpolation grid (0.05° cells, full NE bounds)
3. For each zoom level:
   - Partition grid into tiles (256×256px each)
   - Render tile canvas with colors
   - Convert to PNG buffer
4. Return tiles organized by zoom/x/y

---

### Task 5: Implement Caching/Storage

**File:** `app/api/radar/lib/storage.ts`

Implement:
```typescript
async function saveTile(
  buffer: Buffer,
  timestamp: Date,
  zoom: number,
  x: number,
  y: number
): Promise<void>

async function loadTile(
  timestamp: Date,
  zoom: number,
  x: number,
  y: number
): Promise<Buffer | null>

async function getTilesCachedFor(
  timestamp: Date
): Promise<boolean>

async function listAvailableFrames(
  hours: number = 48
): Promise<Array<{ timestamp: Date; available: boolean }>>
```

**Storage structure:**
```
/public/radar-cache/
├── 2025-12-31T03:00:00Z/
│   ├── z5/
│   │   ├── 16/8/tile.png
│   │   ├── 16/9/tile.png
│   │   └── ...
│   ├── z6/ ...
│   ├── z7/ ...
│   └── z8/ ...
├── 2025-12-31T04:00:00Z/
│   └── z5/ ...
└── ...
```

---

### Task 6: Create API Endpoint - Generate 48h Radar

**File:** `app/api/radar/generate.ts`

Implement `POST /api/radar/generate`:
```typescript
export async function POST(request: NextRequest) {
  // 1. Get all resorts
  const resorts = await fetchResorts();
  
  // 2. Generate 48 frames (1 per hour from now)
  const now = new Date();
  const frames = [];
  
  for (let hour = 0; hour < 48; hour++) {
    const timestamp = new Date(now.getTime() + hour * 60 * 60 * 1000);
    
    // 3. Get conditions for this hour (from your existing conditions database)
    const conditions = await fetchConditionsAt(timestamp);
    
    // 4. Generate frame
    const frame = await generateSyntheticFrame(
      timestamp,
      resorts,
      conditions
    );
    
    // 5. Save tiles to disk
    for (const [zoom, tiles] of Object.entries(frame.tiles)) {
      for (const [tileKey, canvas] of tiles) {
        const [x, y] = tileKey.split(',');
        const buffer = await canvasToBuffer(canvas);
        await saveTile(buffer, timestamp, zoom, x, y);
      }
    }
    
    frames.push({ timestamp, status: 'generated' });
  }
  
  return NextResponse.json({
    status: 'success',
    framesGenerated: frames.length,
    totalTiles: frames.length * 4 * expectedTilesPerZoom,
    message: '48-hour radar generated'
  });
}
```

**Requirements:**
- Run in background (use job queue if possible)
- Return immediately with status
- Progress tracking optional but nice
- Handle errors gracefully

---

### Task 7: Create API Endpoint - Serve Tiles

**File:** `app/api/radar/tile.ts`

Implement `GET /api/radar/tile?z={zoom}&x={x}&y={y}&timestamp={iso}`:
```typescript
export async function GET(request: NextRequest) {
  const zoom = request.nextUrl.searchParams.get('z');
  const x = request.nextUrl.searchParams.get('x');
  const y = request.nextUrl.searchParams.get('y');
  const timestamp = request.nextUrl.searchParams.get('timestamp');
  
  // Load cached tile
  const buffer = await loadTile(
    new Date(timestamp),
    parseInt(zoom),
    parseInt(x),
    parseInt(y)
  );
  
  if (!buffer) {
    return new Response('Not found', { status: 404 });
  }
  
  return new Response(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400', // 24h
      'Content-Length': buffer.length.toString()
    }
  });
}
```

---

### Task 8: Create API Endpoint - List Frames

**File:** `app/api/radar/frames.ts`

Implement `GET /api/radar/frames`:
```typescript
export async function GET(request: NextRequest) {
  const frames = await listAvailableFrames(48);
  
  return NextResponse.json({
    radar: {
      source: 'synthetic-interpolation',
      frames: frames.map(f => ({
        timestamp: f.timestamp.toISOString(),
        available: f.available
      }))
    }
  });
}
```

---

### Task 9: Update ResortMap Component

**File:** `app/components/ResortMap.tsx`

Changes:
1. Update `loadFrames` useEffect to call `/api/radar/frames`
2. Construct tile URLs: `/api/radar/tile?z={z}&x={x}&y={y}&timestamp={iso}`
3. Verify animation loop picks up all 48 frames
4. Test zoom in/out performance

---

## Dependencies Required

```json
{
  "canvas": "^2.11.2",        // For server-side canvas rendering
  "sharp": "^0.33.1",         // Optional: faster PNG encoding
  "geolib": "^3.3.4"          // For distance calculations (or inline)
}
```

---

## Testing Checklist

- [ ] IDW interpolation produces smooth gradients
- [ ] Tile rendering creates correct size (256×256px)
- [ ] All 4 zoom levels generate without errors
- [ ] 48 frames generate in <5 minutes total
- [ ] Tiles serve instantly from cache
- [ ] Zoom 5-8 all load tiles smoothly
- [ ] Animation loops through all 48 frames
- [ ] No memory leaks during 48-hour animation
- [ ] Colors match snowfall intensity visually
- [ ] Pan/zoom doesn't break animation

---

## Success Criteria

✅ **48 real frames** (not 2, actually 48)
✅ **Smooth animation** at 800ms/frame with panning/zooming
✅ **Professional appearance** (interpolated, colorized, smooth)
✅ **Fast serving** (tiles load <50ms from cache)
✅ **Zoom responsive** (levels 5-8 all work)
✅ **No external APIs** (uses your resort data only)
✅ **Backfillable** (can generate historical radar)

---

## Questions for Clarification

Before you start, consider:

1. **Data backfill:** Do you want to generate historical 48h radar, or just forward-looking?
2. **Update frequency:** How often should new 48h radar generate? (Daily? Hourly?)
3. **Zoom depth:** Would county-level (zoom 8) be enough, or need ultra-detail?
4. **Blended model:** Want to add NOAA forecasts later for better temporal continuity, or stick with observations?
5. **Storage:** Can you spare ~500MB for tile cache, or prefer on-demand generation?

---

## Success Look & Feel

When done, users will see:

1. **Map loads** with blue circles marking resorts ✓ (already works)
2. **Radar overlay animates** showing snowfall patterns ✓ (will work after this)
3. **Users zoom in** → radar tiles load at higher detail ✓
4. **Users pan** → animation continues smoothly ✓
5. **Users scrub timeline** → can jump to any of 48 hours ✓
6. **Legend shows** what colors mean (0.1", 0.5", 1.0", 2.0"+) ✓

**This is production-ready ski-specific weather intelligence.**

---

## Implementation Order

Do tasks in this sequence:
1. Interpolation library (Task 1)
2. Color mapping (Task 2)
3. Tile pyramid math (Task 3)
4. Frame generation (Task 4)
5. Storage library (Task 5)
6. API endpoints (Tasks 6-8)
7. Update component (Task 9)
8. Test everything

Estimated time: **4-6 hours** with Copilot assistance.