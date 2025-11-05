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
      <template #fields="{ props }">
        <span v-if="props.column.field == 'name'">
          <MigasLink
            :model="model"
            :pk="props.row.id"
            :icon="elementIcon(props.row.status)"
            :value="props.row.__str__ || ''"
            :tooltip="props.row.summary"
          />
        </span>

        <span v-else-if="props.column.field == 'project.name'">
          <MigasLink
            model="projects"
            :pk="props.row.project.id"
            :value="props.row.project.name || ''"
          />
        </span>

        <span v-else-if="props.column.field == 'sync_user.name'">
          <MigasLink
            v-if="props.row.sync_user"
            model="users"
            :pk="props.row.sync_user.id"
            :value="props.row.sync_user.__str__ || ''"
          />
        </span>

        <span v-else-if="props.column.field == 'product'">
          <q-btn
            no-caps
            dense
            color="info"
            text-color="black"
            :icon="productIcon(props.row.product_system)"
            :label="props.row.product || ''"
            @click="
              $router.push({
                name: 'computer-hardware',
                params: { id: props.row.id },
              })
            "
            ><q-tooltip
              >{{ props.row.product_system }} ({{
                $gettext('Hardware Information')
              }})</q-tooltip
            ></q-btn
          >
        </span>

        <span v-else-if="props.column.field == 'sync_end_date'">
          <DateView :value="props.row.sync_end_date" />
        </span>

        <span v-else>
          {{ props.formattedRow[props.column.field] }}
        </span>
      </template>
    </TableResults>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
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
      'mac',
      'uuid',
      'softwareInventory',
      'statusIn',
      'machine',
      'createdAtRange',
      'syncEndDateRange',
      'syncEndDate',
    ]

    const title = ref($gettext('Computers'))

    const breadcrumbs = ref([
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
          columns.value.find(
            (x) => x.field === 'project.name',
          ).filterOptions.filterDropdownItems = response.data.results.map(
            ({ id, name }) => ({
              value: id,
              text: name,
            }),
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
