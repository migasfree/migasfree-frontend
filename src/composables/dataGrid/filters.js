import { computed, reactive } from 'vue'
import { useGettext } from 'vue3-gettext'

export function useFilters() {
  const { $gettext } = useGettext()

  const ALL_OPTION = { id: '', name: $gettext('All') }

  const simpleFilter = (extra = []) => ({
    items: [ALL_OPTION, ...extra],
    selected: null,
  })

  const rangeFilter = () => ({
    selected: { from: null, to: null },
  })

  const bitsOption = (n) => ({
    id: n,
    name: $gettext('%{n} bits', { n }),
  })

  const daysAgoOption = (n) => ({
    id: n,
    name: $gettext('%{n} days ago', { n }),
  })

  const tableFilters = reactive({
    search: '',
    platform: simpleFilter(),
    project: simpleFilter(),
    statusIn: {
      items: [],
      selected: null,
      choices: {},
    },
    createdAtRange: rangeFilter(),
    startDateRange: rangeFilter(),
    schedule: {
      items: [
        ALL_OPTION,
        { id: 1, name: $gettext('without schedule') },
        { id: 0, name: $gettext('with schedule') },
      ],
      selected: null,
    },
    model: simpleFilter(),
    installDateRange: rangeFilter(),
    uninstallDateRange: rangeFilter(),
    uninstallDate: {
      items: [
        ALL_OPTION,
        { id: 1, name: $gettext('without date') },
        { id: 0, name: $gettext('with date') },
      ],
      selected: null,
    },
    user: simpleFilter(),
    serial: '',
    mac: '',
    uuid: '',
    architecture: {
      items: [ALL_OPTION, bitsOption(32), bitsOption(64)],
      selected: null,
    },
    machine: {
      items: [
        ALL_OPTION,
        {
          id: 'P',
          label: $gettext('Physical'),
          children: [
            { id: 'desktop', label: $gettext('desktop') },
            { id: 'laptop', label: $gettext('laptop') },
          ],
        },
        {
          id: 'V',
          label: $gettext('Virtual'),
          children: [
            { id: 'virtual', label: $gettext('emulator') },
            { id: 'docker', label: $gettext('container') },
          ],
        },
      ],
      selected: null,
    },
    syncEndDate: {
      items: [
        ALL_OPTION,
        { id: 0, name: $gettext('without date') },
        daysAgoOption(7),
        daysAgoOption(30),
        daysAgoOption(60),
        daysAgoOption(180),
        daysAgoOption(365),
      ],
      selected: null,
    },
    softwareInventory: {
      items: [
        ALL_OPTION,
        { id: 0, name: $gettext('without inventory') },
        { id: 1, name: $gettext('with inventory') },
      ],
      selected: null,
    },
    syncEndDateRange: rangeFilter(),
  })

  const searchOptions = computed(() => ({
    enabled: true,
    skipDiacritics: true,
    externalQuery: tableFilters.search,
  }))

  const resetFilters = (
    rangeRefs,
    machineTree,
    statusTree,
    loadItemsAfter = true,
  ) => {
    const rangeFilters = [
      'createdAtRange',
      'installDateRange',
      'startDateRange',
      'syncEndDateRange',
      'uninstallDateRange',
    ]

    const textFilters = ['serial', 'mac', 'uuid', 'search']

    Object.entries(tableFilters).forEach(([key]) => {
      if (rangeFilters.includes(key)) {
        tableFilters[key] = rangeFilter()
        const rangeRef = rangeRefs[key]
        if (rangeRef?.value) rangeRef.value.reset(loadItemsAfter)
      } else if (textFilters.includes(key)) {
        tableFilters[key] = ''
      } else if (key === 'machine' && machineTree?.value) {
        machineTree.value.reset()
      } else if (key === 'statusIn' && statusTree?.value) {
        statusTree.value.reset()
      } else {
        tableFilters[key].selected = null
      }
    })
  }

  return {
    tableFilters,
    searchOptions,
    simpleFilter,
    rangeFilter,
    resetFilters,
  }
}
