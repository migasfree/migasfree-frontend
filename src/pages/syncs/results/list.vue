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
        <span v-if="slotProps.props.column.field == 'computer.__str__'">
          <MigasLink
            model="computers"
            :pk="slotProps.props.row.computer.id"
            :value="slotProps.props.row.computer.__str__"
            :icon="elementIcon(slotProps.props.row.computer.status)"
            :tooltip="slotProps.props.row.computer.summary"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'project.name'">
          <MigasLink
            model="projects"
            :pk="slotProps.props.row.project.id"
            :value="slotProps.props.row.project.name || ''"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'user.name'">
          <MigasLink
            model="users"
            :pk="slotProps.props.row.user.id"
            :value="slotProps.props.row.user.__str__"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'created_at'">
          <DateView :value="slotProps.props.row.created_at" />
          <DateDiff
            v-if="
              slotProps.props.row.created_at && slotProps.props.row.start_date
            "
            class="float-right"
            :begin="new Date(slotProps.props.row.start_date)"
            :end="new Date(slotProps.props.row.created_at)"
            :tooltip="$gettext('Duration')"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'start_date'">
          <DateView :value="slotProps.props.row.start_date" />
        </span>

        <span v-else-if="slotProps.props.column.field == 'pms_status_ok'">
          <BooleanView :value="slotProps.props.row.pms_status_ok" />
        </span>

        <span v-else>
          {{ slotProps.props.formattedRow[slotProps.props.column.field] }}
        </span>
      </template>
    </TableResults>
  </q-page>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import BooleanView from 'components/ui/BooleanView'
import DateView from 'components/ui/DateView'
import DateDiff from 'components/DateDiff'
import MigasLink from 'components/MigasLink'

import { appIcon, modelIcon, useElement } from 'composables/element'

export default {
  components: {
    Breadcrumbs,
    TableResults,
    BooleanView,
    DateView,
    DateDiff,
    MigasLink,
  },
  setup() {
    const { $gettext } = useGettext()
    const { elementIcon } = useElement()
    const uiStore = useUiStore()

    useMeta({ title: $gettext('Syncs List') })

    const model = 'syncs'
    const moreFilters = ['platform', 'createdAtRange', 'startDateRange']

    const title = ref($gettext('Synchronizations'))

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
        to: 'syncs-dashboard',
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
        label: $gettext('Start Date'),
        field: 'start_date',
      },
      {
        label: $gettext('End Date'),
        field: 'created_at',
      },
      {
        field: 'user.id',
        hidden: true,
      },
      {
        label: $gettext('User'),
        field: 'user.name',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
        },
      },
      {
        field: 'computer.id',
        hidden: true,
      },
      {
        field: 'computer.status',
        hidden: true,
      },
      {
        field: 'computer.summary',
        hidden: true,
      },
      {
        label: $gettext('Computer'),
        field: 'computer.__str__',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('Filter'),
          trigger: 'enter',
        },
      },
      {
        field: 'project.id',
        hidden: true,
      },
      {
        label: $gettext('Project'),
        field: 'project.name',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
        },
      },
      {
        label: $gettext('PMS Status Ok'),
        field: 'pms_status_ok',
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
        label: $gettext('Consumer'),
        field: 'consumer',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
        },
      },
    ])

    const loadFilters = async () => {
      await api
        .get('/api/v1/token/projects/')
        .then((response) => {
          columns.find(
            (x) => x.field === 'project.name',
          ).filterOptions.filterDropdownItems = response.data.results.map(
            (item) => {
              return {
                value: item.id,
                text: item.name,
              }
            },
          )
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    }

    onMounted(async () => {
      await loadFilters()
    })

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
