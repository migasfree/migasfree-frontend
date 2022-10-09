<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <template v-if="computer.id">
      <Header :title="title" :has-export-button="false">
        <template v-if="computer.id" #append
          >:
          <MigasLink
            model="computers"
            :pk="computer.id"
            :value="computer.__str__ || ''"
            :icon="elementIcon(computer.status)"
            :tooltip="computer.summary"
          />
          <h3 class="text-h6 float-right">
            <q-tooltip self="bottom middle"
              ><translate>Date of entry into the migasfree system</translate>
              ({{ diffForHumans(computer.created_at) }})</q-tooltip
            >
            <q-icon
              name="mdi-calendar-plus"
              size="md"
              class="vertical-middle"
            />
            <span class="vertical-middle">
              {{ showDate(computer.created_at) }}</span
            >
          </h3>
        </template>
      </Header>

      <div v-if="loading" class="text-center">
        <q-spinner-dots color="primary" size="3em" />
      </div>

      <template v-else>
        <div class="row q-pa-md">
          <div class="col">
            <q-btn-toggle
              v-model="event"
              spread
              no-caps
              toggle-color="primary"
              :options="[
                { slot: 'syncs', value: 'syncs' },
                { slot: 'errors', value: 'errors' },
                { slot: 'faults', value: 'faults' },
                { slot: 'statusLogs', value: 'statusLogs' },
                { slot: 'migrations', value: 'migrations' },
              ]"
              @update:model-value="updateEvent"
            >
              <template #syncs>
                <q-icon :name="modelIcon('syncs')" class="vertical-middle" />
                <span class="vertical-middle">
                  <translate>Synchronizations</translate> ({{
                    events.syncs.total
                  }})</span
                >
              </template>

              <template #errors>
                <q-icon :name="modelIcon('errors')" class="vertical-middle" />
                <span class="vertical-middle">
                  <translate>Errors</translate> ({{
                    events.errors.total
                  }})</span
                >
              </template>

              <template #faults>
                <q-icon :name="modelIcon('faults')" class="vertical-middle" />
                <span class="vertical-middle">
                  <translate>Faults</translate> ({{
                    events.faults.total
                  }})</span
                >
              </template>

              <template #statusLogs>
                <q-icon
                  :name="modelIcon('status-logs')"
                  class="vertical-middle"
                />
                <span class="vertical-middle">
                  <translate>Status Logs</translate> ({{
                    events.statusLogs.total
                  }})</span
                >
              </template>

              <template #migrations>
                <q-icon
                  :name="modelIcon('migrations')"
                  class="vertical-middle"
                />
                <span class="vertical-middle">
                  <translate>Migrations</translate> ({{
                    events.migrations.total
                  }})</span
                >
              </template>
            </q-btn-toggle>
          </div>
        </div>

        <div class="row q-pa-md">
          <div class="col-12">
            <HeatMap
              :title="current.title"
              :data="current.data"
              :total="current.total"
              :start="showDate(computer.created_at, 'YYYY-MM-DD')"
              @get-date="showItems"
            />
          </div>
        </div>
      </template>

      <div v-if="items.length > 0" id="events" class="q-pa-lg">
        <q-table
          :title="`${events[event].title} (${itemsDate}: ${items.length})`"
          :rows="items"
          :columns="events[event].columns"
          hide-pagination
          :rows-per-page-options="[0]"
          :visible-columns="events[event].visibleColumns"
        >
          <template #body="props">
            <q-tr :props="props">
              <q-td v-if="event === 'syncs'" key="start_date">
                {{ showDate(props.row.start_date) }}
                <q-tooltip>{{ diffForHumans(props.row.start_date) }}</q-tooltip>
              </q-td>

              <q-td key="created_at">
                <span
                  >{{ showDate(props.row.created_at) }}
                  <q-tooltip>{{
                    diffForHumans(props.row.created_at)
                  }}</q-tooltip></span
                >
                <DateDiff
                  v-if="props.row.created_at && props.row.start_date"
                  class="float-right"
                  :begin="new Date(props.row.start_date)"
                  :end="new Date(props.row.created_at)"
                  :tooltip="$gettext('Duration')"
                />
              </q-td>

              <q-td v-if="event === 'syncs'" key="user.name">
                <MigasLink
                  model="users"
                  :pk="props.row.user.id"
                  :value="props.row.user.__str__"
                />
              </q-td>

              <q-td
                v-if="event !== 'statusLogs'"
                key="project.name"
                :props="props"
              >
                <MigasLink
                  model="projects"
                  :pk="props.row.project.id"
                  :value="props.row.project.name || ''"
                />
              </q-td>

              <q-td v-if="event === 'syncs'" key="pms_status_ok">
                <BooleanView :value="props.row.pms_status_ok" />
              </q-td>

              <q-td v-if="event === 'syncs'" key="consumer">
                {{ props.row.consumer }}
              </q-td>

              <q-td v-if="['errors', 'faults'].includes(event)" key="checked">
                <BooleanView :value="props.row.checked" />
              </q-td>

              <q-td v-if="event === 'errors'" key="description">
                <Truncate v-model="props.row.description" />
              </q-td>

              <q-td v-if="event === 'faults'" key="fault_definition.name">
                <MigasLink
                  model="fault-definitions"
                  :pk="props.row.fault_definition.id"
                  :value="props.row.fault_definition.name || ''"
                />
              </q-td>

              <q-td v-if="event === 'statusLogs'" key="status">
                {{ props.row.status }}
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </template>
    <p v-else class="text-center">
      <q-spinner-dots color="primary" size="3em" />
    </p>
  </q-page>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { date, useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import Truncate from 'components/ui/Truncate'
import BooleanView from 'components/ui/BooleanView'
import MigasLink from 'components/MigasLink'
import DateDiff from 'components/DateDiff'
import HeatMap from 'components/chart/HeatMap'

import { modelIcon, useElement } from 'composables/element'
import useDate from 'composables/date'

export default {
  components: {
    Breadcrumbs,
    Header,
    MigasLink,
    HeatMap,
    BooleanView,
    Truncate,
    DateDiff,
  },
  setup() {
    const route = useRoute()
    const { $gettext } = useGettext()
    const { addToDate } = date

    const uiStore = useUiStore()
    const { showDate, diffForHumans } = useDate()
    const { elementIcon } = useElement()

    const title = ref($gettext('Events'))
    useMeta({ title: title.value })

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        to: 'home',
        icon: 'mdi-home',
      },
      {
        text: $gettext('Data'),
        icon: 'mdi-database-search',
      },
      {
        text: $gettext('Computers'),
        icon: modelIcon('computers'),
        to: 'computers-dashboard',
      },
      {
        text: $gettext('Results'),
        to: 'computers-list',
      },
      {
        text: 'Id',
        to: { name: 'computer-detail', params: { id: 0 } },
      },
      {
        text: title.value,
      },
    ])

    let computer = reactive({})
    const event = ref(null)
    const current = reactive({
      title: '',
      data: [],
      total: 0,
    })
    const items = ref([])
    const itemsDate = ref(null)
    const loading = ref(false)

    const events = reactive({
      syncs: {
        data: [],
        total: 0,
        title: $gettext('Synchronizations'),
        visibleColumns: [
          'start_date',
          'created_at',
          'user.name',
          'project.name',
          'pms_status_ok',
          'consumer',
        ],
        columns: [
          {
            name: 'start_date',
            label: $gettext('Start Date'),
            field: 'start_date',
            align: 'left',
          },
          {
            name: 'created_at',
            label: $gettext('End Date'),
            field: 'created_at',
            align: 'left',
          },
          {
            name: 'user.id',
            field: 'user.id',
          },
          {
            name: 'user.name',
            label: $gettext('User'),
            field: 'user.name',
            align: 'left',
          },
          {
            name: 'project.id',
            field: 'project.id',
          },
          {
            name: 'project.name',
            label: $gettext('Project'),
            field: 'project.name',
            align: 'left',
          },
          {
            name: 'pms_status_ok',
            label: $gettext('PMS Status Ok'),
            field: 'pms_status_ok',
            align: 'center',
          },
          {
            name: 'consumer',
            label: $gettext('Consumer'),
            field: 'consumer',
            align: 'left',
          },
        ],
      },
      errors: {
        data: [],
        total: 0,
        title: $gettext('Errors'),
        visibleColumns: [
          'created_at',
          'project.name',
          'checked',
          'description',
        ],
        columns: [
          {
            name: 'created_at',
            label: $gettext('Date'),
            field: 'created_at',
            align: 'left',
          },
          {
            name: 'project.id',
            field: 'project.id',
          },
          {
            name: 'project.name',
            label: $gettext('Project'),
            field: 'project.name',
            align: 'left',
          },
          {
            name: 'checked',
            label: $gettext('Checked'),
            field: 'checked',
            align: 'center',
          },
          {
            name: 'description',
            label: $gettext('Description'),
            field: 'description',
            align: 'left',
          },
        ],
      },
      faults: {
        data: [],
        total: 0,
        title: $gettext('Faults'),
        visibleColumns: [
          'created_at',
          'project.name',
          'checked',
          'fault_definition.name',
        ],
        columns: [
          {
            name: 'created_at',
            label: $gettext('Date'),
            field: 'created_at',
            align: 'left',
          },
          {
            name: 'project.id',
            field: 'project.id',
          },
          {
            name: 'project.name',
            label: $gettext('Project'),
            field: 'project.name',
            align: 'left',
          },
          {
            name: 'checked',
            label: $gettext('Checked'),
            field: 'checked',
            align: 'center',
          },
          {
            name: 'fault_definition.id',
            field: 'fault_definition.id',
          },
          {
            name: 'fault_definition.name',
            label: $gettext('Fault Definition'),
            field: 'fault_definition.name',
            align: 'left',
          },
        ],
      },
      migrations: {
        data: [],
        total: 0,
        title: $gettext('Migrations'),
        visibleColumns: ['created_at', 'project.name'],
        columns: [
          {
            name: 'created_at',
            label: $gettext('Date'),
            field: 'created_at',
            align: 'left',
          },
          {
            name: 'project.id',
            field: 'project.id',
          },
          {
            name: 'project.name',
            label: $gettext('Project'),
            field: 'project.name',
            align: 'left',
          },
        ],
      },
      statusLogs: {
        data: [],
        total: 0,
        title: $gettext('Status Logs'),
        visibleColumns: ['created_at', 'status'],
        columns: [
          {
            name: 'created_at',
            label: $gettext('Date'),
            field: 'created_at',
            align: 'left',
          },
          {
            name: 'status',
            label: $gettext('Status'),
            field: 'status',
            align: 'left',
          },
        ],
      },
    })

    const loadItems = async () => {
      const queryString = {
        computer_id: computer.id,
        start_date: showDate(computer.created_at, 'YYYY-MM-DD'),
        end_date: showDate(
          addToDate(new Date(), { days: 1 }).toISOString(),
          'YYYY-MM-DD'
        ),
      }

      loading.value = true
      await api
        .get(`/api/v1/token/stats/syncs/by-day/`, { params: queryString })
        .then((response) => {
          events.syncs.data = response.data
          events.syncs.total = response.data.reduce(
            (accumulator, current) => accumulator + parseInt(current[1]),
            0
          )

          // default event
          event.value = 'syncs'
          updateEvent(event.value)
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
        .finally(() => {
          loading.value = false
        })

      await api
        .get(`/api/v1/token/stats/errors/by-day/`, { params: queryString })
        .then((response) => {
          events.errors.data = response.data
          events.errors.total = response.data.reduce(
            (accumulator, current) => accumulator + parseInt(current[1]),
            0
          )
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      await api
        .get(`/api/v1/token/stats/faults/by-day/`, { params: queryString })
        .then((response) => {
          events.faults.data = response.data
          events.faults.total = response.data.reduce(
            (accumulator, current) => accumulator + parseInt(current[1]),
            0
          )
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      await api
        .get(`/api/v1/token/stats/migrations/by-day/`, { params: queryString })
        .then((response) => {
          events.migrations.data = response.data
          events.migrations.total = response.data.reduce(
            (accumulator, current) => accumulator + parseInt(current[1]),
            0
          )
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      await api
        .get(`/api/v1/token/stats/status-logs/by-day/`, { params: queryString })
        .then((response) => {
          events.statusLogs.data = response.data
          events.statusLogs.total = response.data.reduce(
            (accumulator, current) => accumulator + parseInt(current[1]),
            0
          )
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    }

    const updateEvent = (evt) => {
      Object.assign(current, events[evt])
      items.value = []
    }

    const camelToKebabCase = (str) => {
      return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
    }

    const showItems = async (params) => {
      const queryString = {
        computer__id: computer.id,
        created_at__gte: params.data[0],
        created_at__lt: showDate(
          date.addToDate(Date.parse(params.data[0]), { days: 1 }),
          'YYYY-MM-DD'
        ),
      }
      const url = `/api/v1/token/${camelToKebabCase(event.value)}/`

      itemsDate.value = params.data[0]

      await api
        .get(url, { params: queryString })
        .then((response) => {
          items.value = response.data.results

          setTimeout(() => {
            uiStore.scrollToElement(document.getElementById('events'))
          }, 250)
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    }

    onMounted(async () => {
      await api
        .get(`/api/v1/token/computers/${route.params.id}/`)
        .then((response) => {
          Object.assign(computer, response.data)
          breadcrumbs.find((x) => x.text === 'Id').to.params.id = computer.id
          breadcrumbs.find((x) => x.text === 'Id').icon = elementIcon(
            computer.status
          )
          breadcrumbs.find((x) => x.text === 'Id').text = computer.__str__
          useMeta({ title: `${title.value}: ${computer.__str__}` })
          loadItems()
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    })

    return {
      title,
      breadcrumbs,
      computer,
      event,
      current,
      items,
      itemsDate,
      loading,
      events,
      updateEvent,
      showItems,
      elementIcon,
      modelIcon,
      showDate,
      diffForHumans,
    }
  },
}
</script>
