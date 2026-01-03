import { http, HttpResponse } from 'msw'

// Mock data for radar APIs
const mockRadarFrames = {
  radar: {
    past: [
      { time: 1735689600000, url: 'noaa-frame-1' },
      { time: 1735693200000, url: 'noaa-frame-2' },
      { time: 1735696800000, url: 'noaa-frame-3' },
    ],
    source: 'NOAA Weather.gov'
  }
}

const mockRainViewerFrames = {
  radar: {
    past: [
      'rainviewer-frame-1',
      'rainviewer-frame-2',
      'rainviewer-frame-3',
    ]
  }
}

const mockSyntheticFrames = {
  radar: {
    layers: [
      { url: 'synthetic-frame-1', timestamp: 1735689600000 },
      { url: 'synthetic-frame-2', timestamp: 1735693200000 },
      { url: 'synthetic-frame-3', timestamp: 1735696800000 },
    ]
  }
}

// Create a mock tile buffer (256x256 transparent PNG)
const createMockTile = (): ArrayBuffer => {
  const width = 256
  const height = 256
  const pngSignature = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
  // This is a simplified PNG - in real scenarios you'd generate proper PNG data
  const mockData = new Uint8Array(1024) // Small mock data
  return new Uint8Array([...pngSignature, ...mockData]).buffer
}

export const handlers = [
  // Radar frames API
  http.get('/api/radar/frames', () => {
    return HttpResponse.json(mockRadarFrames)
  }),

  // RainViewer frames API
  http.get('https://api.rainviewer.com/public/weather-maps.json', () => {
    return HttpResponse.json(mockRainViewerFrames)
  }),

  // Synthetic frames API
  http.get('/api/radar/synthetic-frames', () => {
    return HttpResponse.json(mockSyntheticFrames)
  }),

  // Tile API - returns mock tile data
  http.get('/api/radar/tile', () => {
    const mockTile = createMockTile()
    return new HttpResponse(mockTile, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=300',
      },
    })
  }),

  // Resort conditions API
  http.get('/api/resorts/conditions', () => {
    return HttpResponse.json({
      resorts: [
        {
          id: 'loon-mountain',
          name: 'Loon Mountain',
          conditions: {
            snowDepth: 48,
            recentSnowfall: 12,
            weeklySnowfall: 24,
          }
        },
        {
          id: 'stowe-mountain',
          name: 'Stowe Mountain Resort',
          conditions: {
            snowDepth: 62,
            recentSnowfall: 8,
            weeklySnowfall: 18,
          }
        }
      ]
    })
  }),

  // Scrape API
  http.get('/api/scrape', ({ request }) => {
    const url = new URL(request.url)
    const resortId = url.searchParams.get('resortId')

    if (resortId === 'stowe') {
      return HttpResponse.json({
        resortId: 'stowe',
        weeklySnowfall: 18,
        weeklyRainfall: 0.2,
        recentSnowfall: 8,
        snowDepth: 62,
        baseTemp: 22,
      })
    }

    if (resortId === 'loon-mountain') {
      return HttpResponse.json({
        resortId: 'loon-mountain',
        weeklySnowfall: 24,
        weeklyRainfall: 0,
        recentSnowfall: 12,
        snowDepth: 48,
        baseTemp: 25,
      })
    }

    return HttpResponse.json({ error: 'Resort not found' }, { status: 404 })
  }),
]