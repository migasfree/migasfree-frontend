/**
 * Composable for managing filter dropdown items in data grid columns.
 *
 * Used to dynamically set filter options for columns that use dropdown filters.
 *
 * @param {Ref<Array>} columns - Reactive ref containing column definitions
 * @returns {Object} Filter utilities
 * @property {Function} setFilterItems - Set filter dropdown items for a column
 *
 * @example
 * const columns = ref([
 *   { field: 'status', filterOptions: { filterDropdownItems: [] } }
 * ])
 * const { setFilterItems } = useFilterHelper(columns)
 *
 * // Populate filter options
 * setFilterItems('status', [
 *   { value: 'active', label: 'Active' },
 *   { value: 'inactive', label: 'Inactive' }
 * ])
 */
export function useFilterHelper(columns) {
  const setFilterItems = (field, items) => {
    const col = columns.value.find((x) => x.field === field)
    if (col) col.filterOptions.filterDropdownItems = items
  }

  return {
    setFilterItems,
  }
}
