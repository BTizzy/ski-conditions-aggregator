# Testing Guide - Refactored Architecture

## Quick Start

```bash
# Run all tests
npm test

# Run tests in UI mode
npm run test:ui

# Run with coverage
npm run test:coverage

# Run specific test file
npm test api-client.test.ts
```

---

## Test Structure

### 1. **API Client Tests** (`__tests__/api-client.test.ts`)

Tests the frontend caching layer:

- ✅ Cache operations (set, get, invalidate)
- ✅ TTL enforcement
- ✅ Stale-while-revalidate pattern
- ✅ Error handling and fallbacks
- ✅ Background fetching
- ✅ Data sync triggers

**Run:**
```bash
npm test api-client.test.ts
```

**Expected output:**
```
✓ ApiClient
  ✓ Cache Operations
    ✓ should cache conditions data with TTL
    ✓ should return stale cache on fetch error
    ✓ should implement stale-while-revalidate pattern
  ✓ Data Sync
    ✓ should trigger background data sync
    ✓ should clear cache after sync
  ✓ Error Handling
    ✓ should handle network errors gracefully
    ✓ should handle malformed cache entries
```

### 2. **Cache Strategy Tests** (`__tests__/cache-strategy.test.ts`)

Tests cache timing and expiration logic:

- ✅ 5-minute TTL implementation
- ✅ Stale cache detection
- ✅ Stale-while-revalidate window
- ✅ Data age calculations

**Run:**
```bash
npm test cache-strategy.test.ts
```

**Expected output:**
```
✓ Cache Strategy
  ✓ should implement 5-minute TTL for conditions
  ✓ should detect expired cache after TTL
  ✓ should return stale cache when fresh fetch fails
  ✓ should allow stale-while-revalidate pattern
  ✓ should calculate data age for display
```

### 3. **Integration Tests** (`__tests__/integration.test.ts`)

Tests end-to-end flows:

- ✅ Full fetch → cache → display cycle
- ✅ Parallel request handling
- ✅ Logging and debugging
- ✅ Error recovery

**Run:**
```bash
npm test integration.test.ts
```

**Expected output:**
```
✓ Integration Tests
  ✓ should complete end-to-end flow: fetch -> cache -> display
  ✓ should handle parallel requests efficiently
  ✓ should log cache operations for debugging
```

---

## Manual Testing Checklist

### Setup
- [ ] Pull the `refactor/backend-frontend-split` branch
- [ ] Install dependencies: `npm install`
- [ ] Start dev server: `npm run dev`
- [ ] Open http://localhost:3000

### Browser Console Tests

#### Test 1: Check Initial Cache State
```javascript
// Should be empty on first visit
console.log(localStorage.getItem('ski_conditions'));
// Output: null

// Refresh should populate it
console.log(localStorage.getItem('ski_conditions'));
// Output: {...cached data...}
```

#### Test 2: Verify Cache TTL
```javascript
const entry = JSON.parse(localStorage.getItem('ski_conditions'));
const now = Date.now() / 1000;
const age = now - entry.timestamp;
const isValid = age < entry.ttl;

console.log('Cache age:', age, 'seconds');
console.log('TTL:', entry.ttl, 'seconds');
console.log('Valid:', isValid);
// Should show age < 300 seconds if fresh
```

#### Test 3: Test Stale Cache
```javascript
// Manually expire the cache
const entry = JSON.parse(localStorage.getItem('ski_conditions'));
entry.timestamp = (Date.now() / 1000) - (10 * 60); // 10 minutes ago
localStorage.setItem('ski_conditions', JSON.stringify(entry));

// Refresh page - should still see data from stale cache
// Check console - should see "[Cache] returning stale cache due to fetch error"
```

#### Test 4: Test Network Error Recovery
```javascript
// In DevTools Network tab:
// 1. Set throttling to "Offline"
// 2. Click "Sync Now" button
// 3. Should show error but data remains visible (from stale cache)
// 4. Resume network
// 5. Data should update to fresh values
```

#### Test 5: Monitor Background Sync
```javascript
// Open DevTools Console
// Watch for logs like:
// [ApiClient] Returning cached conditions
// [ApiClient] Cached fresh conditions: 43 resorts

// Open DevTools Network tab
// Should see periodic requests to /api/resorts/conditions
// even while using cached data
```

---

## Performance Testing

### Load Time Test

```javascript
// In browser console, measure perceived load time:
performance.mark('page-start');

// After page renders:
performance.mark('page-end');

performance.measure('pageRender', 'page-start', 'page-end');
const measure = performance.getEntriesByName('pageRender')[0];

console.log('Perceived load time:', measure.duration, 'ms');
// Should be <100ms (showing cached data instantly)
```

### Cache Hit Rate

```javascript
// Track how many times we hit cache vs fetch fresh
let hits = 0;
let misses = 0;

const originalFetch = fetch;
window.fetch = function(...args) {
  if (args[0].includes('/api/resorts/conditions')) {
    const cached = localStorage.getItem('ski_conditions');
    if (cached) hits++;
    else misses++;
  }
  return originalFetch(...args);
};

// After 1 hour of usage:
console.log('Cache hit rate:', (hits / (hits + misses) * 100).toFixed(1), '%');
// Should be >80%
```

---

## API Testing

### Test Data Sync Endpoint

```bash
# Trigger manual sync
curl -X POST http://localhost:3000/api/data/sync

# Expected response:
{
  "success": true,
  "timestamp": 1641234567890,
  "synced": {
    "resorts": 43,
    "conditions": 43,
    "radar": 48
  },
  "durationMs": 5234
}
```

### Test Conditions Endpoint

```bash
# Get current conditions
curl http://localhost:3000/api/resorts/conditions

# Should include Cache-Control header:
# Cache-Control: public, max-age=60, stale-while-revalidate=300

# Response should have all 43 resorts with conditions
```

### Test Cache Stats

```bash
# Get cache metadata
curl http://localhost:3000/api/cache/stats

# Should return cache configuration info
```

---

## Debugging Tips

### Enable Detailed Logging

In `lib/api-client.ts`, set log level:

```typescript
private debugMode = true; // Set to true for verbose logs
```

Watch for logs:
- `[Cache] Hit` - Cache was used
- `[Cache] Miss` - Had to fetch fresh
- `[ApiClient] Returning cached` - Stale-while-revalidate pattern
- `[ApiClient] Cached fresh` - Background fetch completed

### Monitor Network Activity

1. Open DevTools → Network tab
2. Filter by: `api/`
3. Sort by Time
4. Look for patterns:
   - First visit: One request to `/api/resorts/conditions`
   - Subsequent visits (within 5min): Cached, background request in progress
   - After 5min: Fresh request to refresh cache

### Check localStorage

```javascript
// View all ski-related cache entries
Object.entries(localStorage)
  .filter(([k]) => k.startsWith('ski_'))
  .forEach(([k, v]) => {
    const entry = JSON.parse(v);
    const age = ((Date.now() / 1000) - entry.timestamp).toFixed(0);
    console.log(`${k}: ${age}s old, TTL: ${entry.ttl}s`);
  });
```

---

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Run tests
  run: npm test -- --run

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

---

## Troubleshooting

### Cache not persisting
- Check if localStorage is enabled
- Check browser quota (usually 5-10MB)
- Verify cache key is correct: `ski_conditions`

### Old data showing
- Clear localStorage: `localStorage.clear()`
- Manually trigger sync: Click "Sync Now" button
- Force refresh: Ctrl+Shift+R (hard refresh)

### Sync button not working
- Check `/api/data/sync` endpoint is accessible
- Monitor network tab for errors
- Check browser console for error messages

### Cache inconsistency
- Verify all clients use same cache version: `1.0.0`
- Check for timezone issues in timestamps
- Monitor clock skew between client and server

---

## Success Criteria

✅ All tests pass
✅ Cache hit rate > 80% (after 5 minutes)
✅ Perceived load time < 100ms
✅ Stale cache returned on network error
✅ Background sync completes within 120 seconds
✅ No localStorage quota exceeded warnings
✅ Data age visible in sidebar
✅ Manual sync button works
✅ Console shows proper logging

---

**Ready to test? Start with `npm test`! 🚀**
