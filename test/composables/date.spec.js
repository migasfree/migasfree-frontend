import { describe, it, expect, vi, beforeEach } from 'vitest'
import useDate from 'src/composables/date'

// Mock vue3-gettext
vi.mock('vue3-gettext', () => ({
  useGettext: () => ({
    $gettext: (msg) => msg,
    current: 'en_US',
  }),
}))

// Mock dayjs locale import
vi.mock('dayjs/locale/en.js', () => ({
  default: { name: 'en' },
}))

describe('useDate composable', () => {
  let dateComposable

  beforeEach(() => {
    dateComposable = useDate()
  })

  describe('localeDate', () => {
    it('has days array with 7 elements', () => {
      expect(dateComposable.localeDate.days).toHaveLength(7)
    })

    it('has daysShort array with 7 elements', () => {
      expect(dateComposable.localeDate.daysShort).toHaveLength(7)
    })

    it('has months array with 12 elements', () => {
      expect(dateComposable.localeDate.months).toHaveLength(12)
    })

    it('has monthsShort array with 12 elements', () => {
      expect(dateComposable.localeDate.monthsShort).toHaveLength(12)
    })

    it('has firstDayOfWeek set based on locale', () => {
      // en_US locale should start on Sunday (0)
      expect(dateComposable.localeDate.firstDayOfWeek).toBe(0)
    })

    it('has format24h set to true', () => {
      expect(dateComposable.localeDate.format24h).toBe(true)
    })

    it('has pluralDay string', () => {
      expect(dateComposable.localeDate.pluralDay).toBe('days')
    })
  })

  describe('showDate', () => {
    it('formats date-only string with YYYY-MM-DD', () => {
      const result = dateComposable.showDate('2024-01-15')
      expect(result).toBe('2024-01-15')
    })

    it('formats datetime string with YYYY-MM-DD HH:mm:ss', () => {
      const result = dateComposable.showDate('2024-01-15T10:30:00Z')
      expect(result).toMatch(/2024-01-15/)
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/)
    })

    it('uses custom format when provided', () => {
      const result = dateComposable.showDate('2024-01-15', 'DD/MM/YYYY')
      expect(result).toBe('15/01/2024')
    })

    it('handles Date objects', () => {
      const date = new Date('2024-06-15T12:00:00Z')
      const result = dateComposable.showDate(date)
      expect(result).toMatch(/2024-06-15/)
    })
  })

  describe('diffForHumans', () => {
    it('returns relative time string', () => {
      const result = dateComposable.diffForHumans('2024-01-01')
      expect(typeof result).toBe('string')
      // Should be something like "X months ago" or "X years ago"
      expect(result.length).toBeGreaterThan(0)
    })

    it('returns "a few seconds ago" for recent dates', () => {
      const now = new Date().toISOString()
      const result = dateComposable.diffForHumans(now)
      expect(result).toMatch(/second|just now|few seconds/i)
    })
  })
})
