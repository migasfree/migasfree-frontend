import { onMounted, onUpdated, nextTick } from 'vue'
import { useGettext } from 'vue3-gettext'

/**
 * Patches ARIA attributes on vue-good-table elements
 * that don't natively support accessibility.
 * @param {import('vue').Ref} tableRef - ref to the vue-good-table component
 */
export function useTableAccessibility(tableRef) {
  const { $gettext, interpolate } = useGettext()

  const runFix = () => {
    if (!tableRef.value?.$el) return

    const root = tableRef.value.$el

    // Checkboxes
    const checkboxes = root.querySelectorAll(
      '.vgt-checkbox-col input[type="checkbox"]',
    )
    checkboxes.forEach((cb, i) => {
      if (!cb.hasAttribute('aria-label') || !cb.getAttribute('aria-label')) {
        cb.setAttribute(
          'aria-label',
          i === 0 ? $gettext('Select All') : $gettext('Select Row'),
        )
      }
    })

    // Filter selects
    const selects = root.querySelectorAll('.vgt-select')
    selects.forEach((select) => {
      if (
        !select.hasAttribute('aria-label') ||
        !select.getAttribute('aria-label')
      ) {
        const name = select.getAttribute('name') || ''
        const fieldName = name.replace('vgt-', '')
        select.setAttribute(
          'aria-label',
          interpolate($gettext('Filter by %s'), [fieldName]),
        )
      }
    })
  }

  const fixAccessibility = () => {
    nextTick(runFix)
    setTimeout(runFix, 500)
    setTimeout(runFix, 1500)
    setTimeout(runFix, 3000)
  }

  onMounted(fixAccessibility)
  onUpdated(fixAccessibility)
}
