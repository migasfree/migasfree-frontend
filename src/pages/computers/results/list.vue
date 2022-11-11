<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :routes="routes"
      :more-filters="moreFilters"
    >
      <template #fields="slotProps">
        <span v-if="slotProps.props.column.field == 'name'">
          <MigasLink
            model="computers"
            :pk="slotProps.props.row.id"
            :icon="elementIcon(slotProps.props.row.status)"
            :value="slotProps.props.row.__str__ || ''"
            :tooltip="slotProps.props.row.summary"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'project.name'">
          <MigasLink
            model="projects"
            :pk="slotProps.props.row.project.id"
            :value="slotProps.props.row.project.name || ''"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'sync_user.name'">
          <MigasLink
            v-if="slotProps.props.row.sync_user"
            model="users"
            :pk="slotProps.props.row.sync_user.id"
            :value="slotProps.props.row.sync_user.__str__ || ''"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'product'">
          <q-btn
            no-caps
            dense
            color="info"
            text-color="black"
            :icon="productIcon(slotProps.props.row.product_system)"
            :label="slotProps.props.row.product || ''"
            @click="
              $router.push({
                name: 'computer-hardware',
                params: { id: slotProps.props.row.id },
              })
            "
            ><q-tooltip
              >{{ slotProps.props.row.product_system }} ({{
                $gettext('Hardware Information')
              }})</q-tooltip
            ></q-btn
          >
        </span>

        <span v-else-if="slotProps.props.column.field == 'sync_end_date'">
          <DateView :value="slotProps.props.row.sync_end_date" />
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
    const { elementIcon, productIcon } = useElement()
    const uiStore = useUiStore()

    useMeta({ title: $gettext('Computers List') })

    const routes = {
      detail: 'computer-detail',
    }
    const model = 'computers'
    const moreFilters = [
      'platform',
      'architecture',
      'serial',
      'uuid',
      'softwareInventory',
      'statusIn',
      'machine',
      'createdAtRange',
      'syncEndDateRange',
      'syncEndDate',
    ]

    const title = ref($gettext('Computers'))

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
        to: 'computers-dashboard',
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
        label: $gettext('Name'),
        field: 'name',
        html: true,
        filterOptions: {
          enabled: true,
          placeholder: $gettext('Filter'),
          trigger: 'enter',
        },
      },
      {
        field: '__str__',
        hidden: true,
      },
      {
        field: 'project.id',
        hidden: true,
      },
      {
        label: $gettext('Project'),
        field: 'project.name',
        html: true,
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
        },
      },
      {
        field: 'sync_user.id',
        hidden: true,
      },
      {
        label: $gettext('User'),
        field: 'sync_user.name',
        html: true,
        filterOptions: {
          enabled: true,
          placeholder: $gettext('Filter'),
          trigger: 'enter',
        },
      },
      {
        label: $gettext('Sync end Date'),
        field: 'sync_end_date',
      },
      {
        field: 'product_system',
        hidden: true,
      },
      {
        label: $gettext('Product'),
        field: 'product',
        html: true,
        filterOptions: {
          enabled: true,
          placeholder: $gettext('Filter'),
          trigger: 'enter',
        },
      },
      {
        field: 'summary',
        hidden: true,
      },
    ])

    const loadFilters = async () => {
      await api
        .get('/api/v1/token/projects/')
        .then((response) => {
          columns.find(
            (x) => x.field === 'project.name'
          ).filterOptions.filterDropdownItems = response.data.results.map(
            (item) => {
              return {
                value: item.id,
                text: item.name,
              }
            }
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
      title,
      breadcrumbs,
      columns,
      model,
      routes,
      moreFilters,
      elementIcon,
      productIcon,
    }
  },
}
</script>
