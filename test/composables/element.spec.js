import { describe, it, expect, vi } from 'vitest'
import { useElement, appIcon, modelIcon } from 'src/composables/element'

// Mock gettext
vi.mock('vue3-gettext', () => ({
  useGettext: () => ({
    $gettext: (msg) => msg,
  }),
}))

describe('element.js', () => {
  describe('appIcon', () => {
    it('returns correct icon for known item', () => {
      expect(appIcon('home')).toBe('mdi-home')
      expect(appIcon('add')).toBe('mdi-plus')
    })

    it('returns empty string for unknown item', () => {
      expect(appIcon('unknown-item')).toBe('')
    })
  })

  describe('modelIcon', () => {
    it('returns correct icon for known model', () => {
      expect(modelIcon('computers')).toBe('mdi-desktop-classic')
      expect(modelIcon('deployments')).toBe('mdi-rocket-launch')
    })

    it('returns empty string for unknown model', () => {
      expect(modelIcon('unknown-model')).toBe('')
    })
  })

  describe('useElement', () => {
    const { elementIcon, computerStatus, humanMacAddress, attributeValue } =
      useElement()

    describe('elementIcon', () => {
      it('returns mapped icon for known status', () => {
        expect(elementIcon('available')).toBe('mdi-cart')
        expect(elementIcon('reserved')).toBe('mdi-lock-alert')
      })

      it('returns default icon for unknown status', () => {
        expect(elementIcon('random-status')).toBe('mdi-pound')
      })
    })

    describe('computerStatus', () => {
      it('translates known status', () => {
        // Since we mock $gettext to return identity, we expect the key
        // But logic is: if in STATUS_I18N, return translation.
        // STATUS_I18N keys are lowercase.
        expect(computerStatus('intended')).toBe('Intended')
        expect(computerStatus('Reserved')).toBe('Reserved') // Case insensitive lookup
      })

      it('returns original value if unknown', () => {
        expect(computerStatus('UnknownStatus')).toBe('UnknownStatus')
      })
    })

    describe('humanMacAddress', () => {
      it('formats raw mac address', () => {
        expect(humanMacAddress('001122334455')).toBe('00:11:22:33:44:55')
      })

      it('handles multiple mac addresses', () => {
        expect(humanMacAddress('00112233445566778899aabb')).toBe(
          '00:11:22:33:44:55, 66:77:88:99:aa:bb',
        )
      })

      it('returns empty string for null/undefined', () => {
        expect(humanMacAddress(null)).toBe('')
        expect(humanMacAddress(undefined)).toBe('')
      })
    })

    describe('attributeValue', () => {
      it('returns value for SET prefix', () => {
        const att = { property_att: { prefix: 'SET' }, value: 'Test Value' }
        expect(attributeValue(att)).toBe('Test Value')
      })

      it('returns description for CID prefix', () => {
        const att = {
          property_att: { prefix: 'CID' },
          description: 'Computer Desc',
        }
        expect(attributeValue(att)).toBe('Computer Desc')
      })

      it('returns formatted string for other prefixes', () => {
        const att = { property_att: { prefix: 'TAG' }, value: 'MyTag' }
        expect(attributeValue(att)).toBe('TAG-MyTag')
      })
    })
  })
})
