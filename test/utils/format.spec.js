import { describe, it, expect } from 'vitest'
import { abbreviateNumber, arrayToTree, pluralize } from 'src/utils/format'

describe('format utils', () => {
  describe('abbreviateNumber', () => {
    it('returns empty string for null or undefined', () => {
      expect(abbreviateNumber(null)).toBe('')
      expect(abbreviateNumber(undefined)).toBe('')
    })

    it('returns the same number if tier is 0', () => {
      expect(abbreviateNumber(500)).toBe(500)
      expect(abbreviateNumber(0)).toBe(0)
    })

    it('abbreviates numbers correctly with suffixes', () => {
      expect(abbreviateNumber(1000)).toBe('1K')
      expect(abbreviateNumber(1500, 1)).toBe('1.5K')
      expect(abbreviateNumber(1000000)).toBe('1M')
      expect(abbreviateNumber(2500000, 1)).toBe('2.5M')
    })

    it('handles negative numbers', () => {
      expect(abbreviateNumber(-1000)).toBe('-1K')
    })
  })

  describe('arrayToTree', () => {
    it('converts a flat array to a tree structure', () => {
      const flat = [
        { id: 1, parent: null, name: 'Root' },
        { id: 2, parent: 1, name: 'Child 1' },
        { id: 3, parent: 1, name: 'Child 2' },
        { id: 4, parent: 2, name: 'Grandchild' },
      ]

      const tree = arrayToTree(flat)

      expect(tree).toHaveLength(1)
      expect(tree[0].id).toBe(1)
      expect(tree[0].children).toHaveLength(2)
      expect(tree[0].children[0].id).toBe(2)
      expect(tree[0].children[0].children).toHaveLength(1)
      expect(tree[0].children[0].children[0].id).toBe(4)
    })

    it('respects custom parentId and id configs', () => {
      const flat = [
        { customId: 'a', customParent: null },
        { customId: 'b', customParent: 'a' },
      ]

      const tree = arrayToTree(flat, { id: 'customId', parentId: 'customParent' })

      expect(tree).toHaveLength(1)
      expect(tree[0].customId).toBe('a')
      expect(tree[0].children).toHaveLength(1)
      expect(tree[0].children[0].customId).toBe('b')
    })
  })

  describe('pluralize', () => {
    it('pluralizes words correctly', () => {
      expect(pluralize.plural('computer')).toBe('computers')
      expect(pluralize.plural('sync')).toBe('syncs')
      expect(pluralize.plural('unknown')).toBe('unknowns')
      expect(pluralize.plural('computers')).toBe('computers')
    })

    it('singularizes words correctly', () => {
      expect(pluralize.singular('computers')).toBe('computer')
      expect(pluralize.singular('syncs')).toBe('sync')
      expect(pluralize.singular('unknowns')).toBe('unknown')
      expect(pluralize.singular('computer')).toBe('computer')
    })
  })
})
