export function useFilterHelper(columns) {
  const setFilterItems = (field, items) => {
    const col = columns.value.find((x) => x.field === field)
    if (col) col.filterOptions.filterDropdownItems = items
  }

  return {
    setFilterItems,
  }
}
