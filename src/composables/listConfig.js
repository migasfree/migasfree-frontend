import { ref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'
import { appIcon, modelIcon } from 'composables/element'

/**
 * Provides generic configuration for list views,
 * centralizing breadcrumbs, head meta, title, and base columns (id and actions).
 *
 * @param {string} model - Model identifier (e.g. 'devices/capabilities')
 * @param {string} titleString - View title (usually passed through gettext)
 * @param {string} metaTitle - Localized string for the page title (meta tag)
 * @param {Array} parentBreadcrumb - Array (or 1 element) prior to the current element in the breadcrumb.
 * @param {Array} modelColumns - Extra array of specific columns for the view table
 * @returns {Object} Reactive standard configuration for `TableResults`
 */
export function useListConfig(
  model,
  titleString,
  metaTitle,
  parentBreadcrumb,
  modelColumns,
) {
  const { $gettext } = useGettext()

  useMeta({ title: metaTitle })

  const title = ref(titleString)

  // Ensure parent breadcrumb is always an array to allow spread (...)
  const parents = Array.isArray(parentBreadcrumb)
    ? parentBreadcrumb
    : [parentBreadcrumb]

  const breadcrumbs = ref([
    {
      text: $gettext('Dashboard'),
      icon: appIcon('home'),
      to: 'home',
    },
    ...parents,
    {
      text: titleString,
      icon: modelIcon(model),
    },
    {
      text: $gettext('Results'),
      icon: appIcon('results'),
    },
  ])

  const columns = ref([
    {
      field: 'id',
      hidden: true,
    },
    {
      label: $gettext('Actions'),
      field: 'actions',
      html: true,
      sortable: false,
      globalSearchDisabled: true,
    },
    ...modelColumns,
  ])

  return {
    title,
    breadcrumbs,
    columns,
    modelIcon,
  }
}
