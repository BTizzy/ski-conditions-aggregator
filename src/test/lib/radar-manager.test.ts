import { describe, it, expect, vi, beforeEach } from 'vitest'
import { radarManager } from '@/app/api/radar/lib/radar-manager'

describe('RadarManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear any cached data
    ;(radarManager as any).frameCache?.clear?.()
    ;(radarManager as any).tileCache?.clear?.()
    ;(radarManager as any).lastUpdate = 0
  })

  describe('getFrames', () => {
    it('should return frames from MSW mock API', async () => {
      const frames = await radarManager.getFrames()

      // The radar manager aggregates from multiple sources, so we expect more than just our mock
      expect(frames.length).toBeGreaterThan(0)
      expect(Array.isArray(frames)).toBe(true)

      // Check that frames have the expected structure
      if (frames.length > 0) {
        expect(frames[0]).toHaveProperty('time')
        expect(frames[0]).toHaveProperty('url')
        expect(frames[0]).toHaveProperty('source')
      }
    })
  })

  describe('getTile', () => {
    it('should return tile buffer from MSW mock API', async () => {
      const result = await radarManager.getTile(1735689600000, 8, 10, 20)

      // MSW returns a Buffer, so check for that
      expect(result).toBeInstanceOf(Buffer)
      expect(result!.length).toBeGreaterThan(0)
    })
  })
})