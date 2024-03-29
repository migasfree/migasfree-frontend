<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      ref="tableResults"
      :title="title"
      :columns="columns"
      :model="model"
      :more-filters="moreFilters"
    >
      <template #top>
        <q-btn
          icon="mdi-refresh"
          class="q-my-md"
          :loading="loading"
          :disable="loading"
          :label="$gettext('Update')"
          @click="updateItems"
        />
      </template>

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
            :value="slotProps.props.row.user.name"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'created_at'">
          <DateView :value="slotProps.props.row.created_at" />
        </span>

        <span v-else>
          {{ slotProps.props.formattedRow[slotProps.props.column.field] }}
        </span>
      </template>
    </TableResults>
  </q-page>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import DateView from 'components/ui/DateView'
import MigasLink from 'components/MigasLink'

import { appIcon, modelIcon, useElement } from 'composables/element'

export default {
  components: {
    Breadcrumbs,
    TableResults,
    DateView,
    MigasLink,
  },
  setup() {
    const { $gettext } = useGettext()
    const { elementIcon } = useElement()
    const uiStore = useUiStore()

    useMeta({ title: $gettext('Messages List') })

    const tableResults = ref(null)

    const model = 'messages'
    const moreFilters = ['statusIn', 'createdAtRange']

    const title = ref($gettext('Messages'))

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
        to: 'messages-list',
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
        field: 'user.id',
        hidden: true,
      },
      {
        label: $gettext('User'),
        field: 'user.name',
      },
      {
        label: $gettext('Message'),
        field: 'message',
      },
    ])

    const loading = computed(() => {
      return tableResults.value !== null
        ? tableResults.value.isLoading.value
        : false
    })

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

    const updateItems = async () => {
      await tableResults.value.loadItems()
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
      tableResults,
      loading,
      updateItems,
    }
  },
}
</script>
