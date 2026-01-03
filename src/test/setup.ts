import '@testing-library/jest-dom'
import { vi, beforeAll, afterEach, afterAll } from 'vitest'
import { server } from '../mocks/server'

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished.
afterAll(() => server.close())

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Leaflet
vi.mock('leaflet', () => ({
  map: vi.fn(() => ({
    setView: vi.fn(),
    remove: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    getSize: vi.fn(() => ({ x: 800, y: 600 })),
    getCenter: vi.fn(() => ({ lat: 40, lng: -74 })),
    project: vi.fn(() => ({ x: 400, y: 300 })),
    getZoom: vi.fn(() => 8),
    invalidateSize: vi.fn(),
    createPane: vi.fn(),
    getPane: vi.fn(() => document.createElement('div')),
  })),
  tileLayer: vi.fn(() => ({
    addTo: vi.fn(),
  })),
  circleMarker: vi.fn(() => ({
    addTo: vi.fn(),
    setStyle: vi.fn(),
    bindPopup: vi.fn(),
    on: vi.fn(),
    setRadius: vi.fn(),
    remove: vi.fn(),
  })),
  popup: vi.fn(() => ({
    setContent: vi.fn(),
  })),
  Icon: {
    Default: {
      imagePath: '',
    },
  },
}))

// Mock fetch globally
global.fetch = vi.fn()

// Mock canvas APIs
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  clearRect: vi.fn(),
  drawImage: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(400), // 100 pixels * 4 channels
  })),
  setTransform: vi.fn(),
  globalAlpha: 1,
  canvas: document.createElement('canvas'),
  globalCompositeOperation: 'source-over',
  beginPath: vi.fn(),
  clip: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  scale: vi.fn(),
})) as any

// Mock createImageBitmap
global.createImageBitmap = vi.fn(() =>
  Promise.resolve({
    width: 256,
    height: 256,
    close: vi.fn(),
  })
)

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock requestAnimationFrame
let rafId = 0
global.requestAnimationFrame = vi.fn((cb) => {
  rafId++
  setTimeout(cb, 16)
  return rafId
})
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id))

// Mock performance.now
global.performance.now = vi.fn(() => Date.now())
