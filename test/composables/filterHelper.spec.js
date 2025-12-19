import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useFilterHelper } from 'src/composables/filterHelper'

describe('useFilterHelper composable', () => {
  describe('setFilterItems', () => {
    it('sets filterDropdownItems for matching column', () => {
      const columns = ref([
        {
          field: 'name',
          filterOptions: { filterDropdownItems: [] },
        },
        {
          field: 'status',
          filterOptions: { filterDropdownItems: [] },
        },
      ])

      const { setFilterItems } = useFilterHelper(columns)
      const items = [
        { value: 1, label: 'Active' },
        { value: 2, label: 'Inactive' },
      ]

      setFilterItems('status', items)

      expect(columns.value[1].filterOptions.filterDropdownItems).toEqual(items)
    })

    it('does not modify other columns', () => {
      const columns = ref([
        {
          field: 'name',
          filterOptions: { filterDropdownItems: ['original'] },
        },
        {
          field: 'status',
          filterOptions: { filterDropdownItems: [] },
        },
      ])

      const { setFilterItems } = useFilterHelper(columns)
      setFilterItems('status', ['new'])

      expect(columns.value[0].filterOptions.filterDropdownItems).toEqual([
        'original',
      ])
    })

    it('does nothing if column not found', () => {
      const columns = ref([
        {
          field: 'name',
          filterOptions: { filterDropdownItems: ['original'] },
        },
      ])

      const { setFilterItems } = useFilterHelper(columns)
      setFilterItems('nonexistent', ['new'])

      expect(columns.value[0].filterOptions.filterDropdownItems).toEqual([
        'original',
      ])
    })

    it('handles empty columns array', () => {
      const columns = ref([])
      const { setFilterItems } = useFilterHelper(columns)

      // Should not throw
      expect(() => setFilterItems('any', [])).not.toThrow()
    })
  })
})
