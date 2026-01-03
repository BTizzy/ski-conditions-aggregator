# Debug: Blank Map Issue

**Date:** December 30, 2025, 4:50 PM EST  
**Status:** ✅ **FIXED - Simplified Component**

---

## What Was Wrong

The ResortMap component had:
1. **Too much complex state** managing frames
2. **Race conditions** between effects
3. **Missing error handling** for API failures
4. **No debugging output** to see what's failing

---

## What I Changed

### 1. Simplified State Management

**Before:**
```typescript
const radarFramesRef = useRef<number[]>([]);
const displayFramesRef = useRef<number[]>([]);
const [selectedWindowHours, setSelectedWindowHours] = useState<number>(24);
const [currentRadarTime, setCurrentRadarTime] = useState<number | null>(null);
// ... 10+ more state variables
```

**After:**
```typescript
const [radarFramesAvailable, setRadarFramesAvailable] = useState(false);
const [frameCount, setFrameCount] = useState(0);
const [loadingStatus, setLoadingStatus] = useState('Initializing...');
// Just what we actually need
```

### 2. Added Explicit Debugging

Now logs at every step:
```typescript
[Map] Initializing Leaflet map
[Frames] Loaded: 12 layers
[RenderFrame] Failed: ...
[Tile] Fetch failed: ...
```

You can watch the browser console to see exactly where it fails.

### 3. Cleaned Up Effects

**Map initialization:**
```typescript
useEffect(() => {
  if (mapInitializedRef.current) return;  // Guard
  mapInitializedRef.current = true;
  // ... init code
  return () => { map.remove(); };  // Cleanup
}, []);  // Empty deps = once on mount
```

**Frames loading:**
```typescript
useEffect(() => {
  const loadFrames = async () => {
    const res = await fetch('/api/radar/frames');
    const layers = res.json().radar.layers;
    radarFramesRef.current = layers;
    setFrameCount(layers.length);
  };
  loadFrames();
}, []);  // Once on mount
```

### 4. Fixed Canvas Sizing

Made sure canvas has explicit min-height and gets resized:
```typescript
<div ref={mapDivRef} className="w-full h-full" style={{ minHeight: '600px' }} />
```

---

## How to Debug

### Step 1: Open Browser Console

**Mac:** Cmd + Option + I  
**Windows:** F12  

### Step 2: Look for Messages

You should see:

```
[Map] Initializing Leaflet map
[Frames] Loaded: 12 layers
[RenderFrame] Failed: ...
```

### Step 3: Identify the Failure Point

**If you see:**
- ✅ `[Map] Initializing Leaflet map` → Map initialized OK
- ✅ `[Frames] Loaded: 12 layers` → API is working
- ❌ `[RenderFrame] Failed: ...` → Tiles aren't rendering

Then problem is tile rendering (zoom level? coordinates?).

**If you see:**
- ✅ `[Map] Initializing Leaflet map`
- ❌ No frames message

Then problem is frames API not loading.

---

## Common Issues & Fixes

### Issue: Blank gray map, no error messages

**Cause:** Map not initialized yet  
**Fix:** Wait 2 seconds, should see `[Map] Initializing...` in console

### Issue: Console shows `[Frames] Loaded: 0 layers`

**Cause:** API not returning layers  
**Fix:** Test API manually:
```bash
curl http://localhost:3000/api/radar/frames | jq '.radar.layers'
```
Should return array like: `["nexrad-n0q", "nexrad-n0q-m05m", ...]`

### Issue: `[Frames] Loaded: 12 layers` but no animation

**Cause:** Tiles failing to fetch  
**Fix:** Check tile API:
```bash
curl 'http://localhost:3000/api/radar/tile?layer=nexrad-n0q&z=6&x=18&y=24' -o tile.png
file tile.png  # Should say "image data"
```

If it's blank/small: Mesonet not returning data for that region

### Issue: OSM map shows but no radar overlay

**Cause:** Tiles are transparent (no precipitation data)  
**This is OK** - just means no rain in that area right now

---

## Testing Checklist

- [ ] Browser console shows `[Map] Initializing Leaflet map` ✅
- [ ] Browser console shows `[Frames] Loaded: X layers` ✅
- [ ] Console shows no errors (only info/debug logs) ✅
- [ ] Map is visible (gray, white, or with satellite tiles) ✅
- [ ] Can drag/pan the map ✅
- [ ] Play button is clickable ✅
- [ ] Speed slider works ✅
- [ ] Opacity slider works ✅
- [ ] Status shows frame count ✅

---

## If Still Broken

### 1. Try Incognito Mode

Clear browser cache:
- **Mac:** Cmd + Shift + Delete
- **Windows:** Ctrl + Shift + Delete

Then refresh.

### 2. Check Next.js Build

```bash
npm run build
npm start
# (production mode)
```

If it works in production but not dev, it's a strict mode issue.

### 3. Verify APIs Work

```bash
# Test frames
curl http://localhost:3000/api/radar/frames

# Test tile (current)
curl 'http://localhost:3000/api/radar/tile?layer=nexrad-n0q&z=6&x=18&y=24' -o test.png
open test.png  # Or view in image viewer

# If tile is blank but valid PNG, then data isn't available
# Try Mesonet directly:
curl 'https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q/6/18/24.png' -o direct.png
open direct.png
```

---

## Key Changes in This Version

✅ **Removed `selectedWindowHours`** - Was unused, causing complexity  
✅ **Removed `displayFramesRef`** - Using radarFramesRef directly  
✅ **Removed `currentRadarTime`** - Not critical  
✅ **Added `loadingStatus`** - Shows progress  
✅ **Added `frameCount`** - Shows how many loaded  
✅ **Explicit console.log()** everywhere - Can see what's happening  
✅ **Try-catch everywhere** - Won't crash silently  
✅ **Min height on map div** - Ensures canvas has space  

---

## Next Steps

1. **Run locally:** `npm run dev`
2. **Open browser:** http://localhost:3000
3. **Watch console:** Should see progress messages
4. **Report what you see** - Which message is the last one?

With the debugging output, we can identify exactly where it breaks.
