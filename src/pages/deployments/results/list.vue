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
      <template #actions="{ props }">
        <q-btn
          v-if="props.row.source === 'I'"
          class="q-ma-xs"
          round
          size="sm"
          :icon="appIcon('regenerate')"
          color="primary"
          @click="regenerateMetadata(props.row.id)"
          ><q-tooltip>{{ $gettext('Regenerate Metadata') }}</q-tooltip></q-btn
        >
      </template>

      <template #fields="{ props }">
        <span v-if="props.column.field == 'name'">
          <MigasLink
            :model="model"
            :pk="props.row.id"
            :value="props.row.name"
          />
        </span>

        <span v-else-if="props.column.field == 'project.name'">
          <MigasLink
            model="projects"
            :pk="props.row.project.id"
            :value="props.row.project.name"
          />
        </span>

        <span v-else-if="props.column.field == 'domain.name'">
          <MigasLink
            v-if="props.row.domain"
            model="domains"
            :pk="props.row.domain.id"
            :value="props.row.domain.name"
          />
        </span>

        <span v-else-if="props.column.field == 'schedule.name'">
          <MigasLink
            v-if="props.row.schedule"
            model="schedules"
            :pk="props.row.schedule.id"
            :value="props.row.schedule.name"
          />

          <template v-if="props.row.schedule_timeline">
            <ScheduleProgress
              :timeline="props.row.schedule_timeline"
              class="q-mt-sm"
            />
          </template>
        </span>

        <span v-else-if="props.column.field == 'enabled'">
          <BooleanView :value="props.row.enabled" />
        </span>

        <span v-else-if="props.column.field == 'start_date'">
          <DateView :value="props.row.start_date" />
          <q-icon v-if="props.row.auto_restart" name="mdi-repeat" size="sm">
            <q-tooltip>{{ $gettext('Auto Restart') }}</q-tooltip>
          </q-icon>
        </span>

        <span v-else-if="props.column.field == 'source'">
          {{ resolveSource(props.row.source) }}
          <q-icon
            v-if="props.row.source === 'E' && props.row.frozen"
            name="mdi-fridge"
            size="sm"
            ><q-tooltip>{{ $gettext('Frozen') }}</q-tooltip></q-icon
          >
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
import BooleanView from 'components/ui/BooleanView'
import DateView from 'components/ui/DateView'
import MigasLink from 'components/MigasLink'
import ScheduleProgress from 'components/deployment/ScheduleProgress.vue'

import { appIcon, modelIcon } from 'composables/element'
import { useFilterHelper } from 'composables/filterHelper'

export default {
  components: {
    Breadcrumbs,
    TableResults,
    BooleanView,
    DateView,
    MigasLink,
    ScheduleProgress,
  },
  setup() {
    const { $gettext } = useGettext()
    const uiStore = useUiStore()

    useMeta({ title: $gettext('Deployments List') })

    const routes = {
      add: 'deployment-add',
      detail: 'deployment-detail',
    }
    const model = 'deployments'
    const moreFilters = ['schedule']

    const title = ref($gettext('Deployments'))

    const breadcrumbs = ref([
      {
        text: $gettext('Dashboard'),
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Release'),
        icon: appIcon('release'),
      },
      {
        text: $gettext('Deployments'),
        icon: modelIcon(model),
        to: 'deployments-dashboard',
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
        field: 'domain.id',
        hidden: true,
      },
      {
        label: $gettext('Domain'),
        field: 'domain.name',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
        },
      },
      {
        label: $gettext('Source'),
        field: 'source',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
          filterDropdownItems: [
            { value: 'I', text: $gettext('Internal') },
            { value: 'E', text: $gettext('External') },
          ],
        },
      },
      {
        label: $gettext('Enabled'),
        field: 'enabled',
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
        label: $gettext('Start Date'),
        field: 'start_date',
      },
      {
        field: 'schedule.id',
        hidden: true,
      },
      {
        label: $gettext('Schedule'),
        field: 'schedule.name',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
        },
      },
    ])

    const { setFilterItems } = useFilterHelper(columns)

    const loadFilters = async () => {
      try {
        const [projectsResponse, domainsResponse, schedulesResponse] =
          await Promise.all([
            api.get('/api/v1/token/projects/'),
            api.get('/api/v1/token/domains/'),
            api.get('/api/v1/token/schedules/'),
          ])

        setFilterItems(
          'project.name',
          projectsResponse.data.results.map(({ id, name }) => ({
            value: id,
            text: name,
          })),
        )

        setFilterItems(
          'domain.name',
          domainsResponse.data.results.map(({ id, name }) => ({
            value: id,
            text: name,
          })),
        )

        setFilterItems(
          'schedule.name',
          schedulesResponse.data.results.map(({ id, name }) => ({
            value: id,
            text: name,
          })),
        )
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    const resolveSource = (value) =>
      ({
        I: $gettext('Internal'),
        E: $gettext('External'),
      })[value] ?? ''

    const regenerateMetadata = async (id) => {
      try {
        const { data } = await api.get(
          `/api/v1/token/${model}/internal-sources/${id}/metadata/`,
        )
        uiStore.notifySuccess(data.detail)
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    onMounted(async () => {
      await loadFilters()
    })

    return {
      routes,
      model,
      moreFilters,
      title,
      breadcrumbs,
      columns,
      appIcon,
      resolveSource,
      regenerateMetadata,
    }
  },
}
</script>
