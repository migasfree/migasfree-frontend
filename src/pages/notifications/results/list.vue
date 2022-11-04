<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :more-filters="moreFilters"
    >
      <template #fields="slotProps">
        <span v-if="slotProps.props.column.field == 'created_at'">
          <DateView :value="slotProps.props.row.created_at" />
        </span>

        <span v-else-if="slotProps.props.column.field == 'checked'">
          <BooleanView :value="slotProps.props.row.checked" />
        </span>

        <span v-else>
          {{ slotProps.props.formattedRow[slotProps.props.column.field] }}
        </span>
      </template>
    </TableResults>
  </q-page>
</template>

<script>
import { ref, reactive } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import BooleanView from 'components/ui/BooleanView'
import DateView from 'components/ui/DateView'

import { appIcon, modelIcon, useElement } from 'composables/element'

export default {
  components: {
    Breadcrumbs,
    TableResults,
    BooleanView,
    DateView,
  },
  setup() {
    const { $gettext } = useGettext()
    const { elementIcon } = useElement()

    useMeta({ title: $gettext('Notifications List') })

    const model = 'notifications'
    const moreFilters = ['createdAtRange']

    const title = ref($gettext('Notifications'))

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Data'),
        icon: appIcon('data'),
      },
      {
        text: title.value,
        icon: modelIcon(model),
        to: 'notifications-dashboard',
      },
      {
        text: $gettext('Results'),
        icon: appIcon('results'),
      },
    ])

    const columns = reactive([
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
      {
        label: $gettext('Date'),
        field: 'created_at',
      },
      {
        label: $gettext('Checked'),
        field: 'checked',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
          filterDropdownItems: [
            { value: true, text: $gettext('Yes') },
            { value: false, text: $gettext('No') },
          ],
        },
      },
      {
        label: $gettext('Message'),
        field: 'message',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('Filter'),
          trigger: 'enter',
        },
      },
    ])

    return {
      model,
      moreFilters,
      title,
      breadcrumbs,
      columns,
      elementIcon,
    }
  },
}
</script>
