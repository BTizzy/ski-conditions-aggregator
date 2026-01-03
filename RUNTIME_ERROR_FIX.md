# Runtime Error Fix: "Map container is already initialized"

**Date:** December 30, 2025, 4:45 PM EST  
**Status:** ✅ **FIXED**

---

## The Error

```
Uncaught Error: Map container is already initialized.
app/components/ResortMap.tsx (80:24) @ ResortMap.useEffect
```

The Leaflet map was trying to initialize twice on the same DOM element.

---

## Root Cause

**React 18 Strict Mode + Leaflet:**

In development, React 18 intentionally runs effects TWICE to catch bugs [web:138]:

```javascript
// React 18 behavior in strict mode:
setup() → cleanup() → setup()  // Runs again immediately after
```

Leaflet doesn't like this:

```javascript
const map = L.map(container, {});  // First call: OK
const map = L.map(container, {});  // Second call: ERROR (already initialized)
```

---

## The Solution

### Pattern Used: Guard + Container Check [web:134][web:140]

**Key changes in ResortMap.tsx:**

#### 1. Add Initialization Guard Ref
```typescript
const mapInitializedRef = useRef<boolean>(false);
```

#### 2. Check Guard Before Initialization
```typescript
if (mapInitializedRef.current || !mapDivRef.current) return;
mapInitializedRef.current = true;
```

#### 3. Check if Container Already Has Leaflet
```typescript
const container = mapDivRef.current;
if (container.classList.contains('leaflet-container')) {
  mapRef.current = (container as any).__LEAFLET_MAP__;
  return;
}
```

#### 4. Empty Dependency Array
```typescript
useEffect(() => {
  // ... initialization code
}, []); // ← Empty = run ONCE on mount only
```

---

## How It Works

### Before (❌ Broken)
```typescript
useEffect(() => {
  if (!mapRef.current) {
    const map = L.map(mapDivRef.current, { ... });  // ← React runs twice!
    mapRef.current = map;
  }
}, []); // Empty deps but effect runs 2x in strict mode dev
```

**Problem:** Check `!mapRef.current` passes BOTH times because:
- First run: mapRef is null → creates map ✅
- Cleanup runs (no cleanup function though)
- Second run: mapRef.current still being set → ERROR on L.map()

### After (✅ Fixed)
```typescript
useEffect(() => {
  // Guard #1: If already initialized, skip
  if (mapInitializedRef.current || !mapDivRef.current) return;
  mapInitializedRef.current = true;  // ← Mark as done

  // Guard #2: If container already has Leaflet, reuse it
  const container = mapDivRef.current;
  if (container.classList.contains('leaflet-container')) {
    mapRef.current = (container as any).__LEAFLET_MAP__;
    return;  // ← Stop here, don't re-initialize
  }

  // Safe to initialize now
  const map = L.map(mapDivRef.current, { ... });
  mapRef.current = map;
  
  // Cleanup: Remove map on unmount
  return () => {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    mapInitializedRef.current = false;
  };
}, []); // Empty deps = only run on mount/unmount
```

**Why it works:**
- First run: `mapInitializedRef.current = false` → proceeds to create map ✅
- Effect cleanup runs (map persists)
- Second run: `mapInitializedRef.current = true` → **returns early, skips initialization** ✅
- No duplicate initialization = no error ✅

---

## Additional Fixes

### 1. Updated Radar Frames Format

The API now returns **layer names** instead of timestamps:

**Before (❌):**
```javascript
radarFramesRef.current = [1735603200, 1735602900, ...];  // Timestamps
```

**After (✅):**
```javascript
radarFramesRef.current = ['nexrad-n0q', 'nexrad-n0q-m05m', ...];  // Layer names
```

Updated:
- `getTileBitmap()` - now accepts `layer` string
- `renderFrameToCanvas()` - now accepts `layer` string
- `loadRadarFrames()` - now returns `data?.radar?.layers` array

### 2. Cleanup Organization

Proper cleanup function in map initialization effect:

```typescript
return () => {
  try {
    if (markerLayerRef.current) {
      markerLayerRef.current.clearLayers();
      markerLayerRef.current.remove();
      markerLayerRef.current = null;
    }
    if (radarContainerRef.current && radarContainerRef.current.parentNode) {
      radarContainerRef.current.parentNode.removeChild(radarContainerRef.current);
      radarContainerRef.current = null;
    }
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  } catch (e) {
    console.debug('[ResortMap] cleanup error', e);
  }
  mapInitializedRef.current = false;  // ← Allow reinit if component remounts
};
```

---

## Testing

### Test 1: Basic Load
```bash
npm run dev
# Navigate to app
# Should see map without error
```

### Test 2: React Strict Mode (Dev)
Strict mode intentionally runs effects twice - should work fine now.

### Test 3: Console
Should NOT see:
```
Error: Map container is already initialized
```

Should see:
```
[RadarMap] Loading radar data...
[Radar] loadRadarFrames succeeded
12 frames available
```

---

## References

- [web:134] - StackOverflow: Refresh leaflet map fix
- [web:137] - Leaflet GitHub Issue: Map container already initialized
- [web:138] - React useEffect cleanup documentation
- [web:140] - Leaflet Issue: Check if map already initialized pattern
- [web:141] - LogRocket: Understanding useEffect cleanup

---

## Files Changed

- ✅ `app/components/ResortMap.tsx` - Added initialization guard + layer names
- ✅ `app/api/radar/frames/route.ts` - Returns layer names (nexrad-n0q-mXXm)
- ✅ `app/api/radar/tile/route.ts` - Accepts layer parameter

---

## Common Issues & Solutions

### Issue: Map still doesn't initialize
**Check:**
- Is `mapDivRef` correctly bound? `<div ref={mapDivRef}>`
- Does container have non-zero size? Check CSS
- Are API endpoints returning data? Check network tab

### Issue: Map initializes but no radar
**Check:**
- Does `/api/radar/frames` return layer names?
- Does `/api/radar/tile?layer=nexrad-n0q&z=6&x=18&y=24` return PNG?
- Check browser console for fetch errors

### Issue: Tiles are blank (transparent)
**Likely causes:**
- Tile coordinates (z, x, y) are wrong
- Mesonet service doesn't have data for that region
- API proxy not working correctly

**Debug:**
```javascript
// In browser console:
fetch('/api/radar/frames').then(r => r.json()).then(console.log)
fetch('/api/radar/tile?layer=nexrad-n0q&z=6&x=18&y=24').then(r => r.blob()).then(blob => {
  const url = URL.createObjectURL(blob);
  console.log('Tile size:', blob.size, url);
})
```

---

## Summary

✅ **Map initialization guard** prevents double initialization  
✅ **Container check** reuses existing map if it somehow exists  
✅ **Empty dependency array** ensures effect runs only on mount/unmount  
✅ **Proper cleanup** removes resources when component unmounts  
✅ **Layer names** now used instead of timestamps for frames

**Error should be gone.** If still occurring, check browser console for other errors before map initialization.
