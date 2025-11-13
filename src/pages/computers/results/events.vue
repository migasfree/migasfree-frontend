<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <template v-if="computer.id">
      <Header
        :title="$gettext('Events')"
        :icon="titleIcon"
        :has-export-button="false"
      >
        <template v-if="computer.id" #append
          ><span class="vertical-middle">: </span>
          <MigasLink
            model="computers"
            :pk="computer.id"
            :value="computer.__str__ || ''"
            :icon="elementIcon(computer.status)"
            :tooltip="computer.summary"
          />
          <span class="text-h6 vertical-middle float-right">
            <DateView
              :value="computer.created_at"
              icon="mdi-calendar-plus"
              :tooltip-text="
                $gettext('Date of entry into the migasfree system')
              "
            />
          </span>
        </template>
      </Header>

      <div v-if="loading" class="text-center">
        <q-spinner-dots color="primary" size="3em" />
      </div>

      <template v-else>
        <div class="row q-py-md">
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
                <q-icon
                  :name="modelIcon('syncs')"
                  class="vertical-middle q-mr-sm"
                />
                <span class="vertical-middle">
                  {{ $gettext('Synchronizations') }}</span
                >
                <q-chip color="grey" text-color="white">{{
                  events.syncs.total
                }}</q-chip>
              </template>

              <template #errors>
                <q-icon
                  :name="modelIcon('errors')"
                  class="vertical-middle q-mr-sm"
                />
                <span class="vertical-middle"> {{ $gettext('Errors') }}</span>
                <q-chip color="grey" text-color="white">{{
                  events.errors.total
                }}</q-chip>
              </template>

              <template #faults>
                <q-icon
                  :name="modelIcon('faults')"
                  class="vertical-middle q-mr-sm"
                />
                <span class="vertical-middle"> {{ $gettext('Faults') }}</span>
                <q-chip color="grey" text-color="white">{{
                  events.faults.total
                }}</q-chip>
              </template>

              <template #statusLogs>
                <q-icon
                  :name="modelIcon('status-logs')"
                  class="vertical-middle q-mr-sm"
                />
                <span class="vertical-middle">
                  {{ $gettext('Status Logs') }}</span
                >
                <q-chip color="grey" text-color="white">{{
                  events.statusLogs.total
                }}</q-chip>
              </template>

              <template #migrations>
                <q-icon
                  :name="modelIcon('migrations')"
                  class="vertical-middle q-mr-sm"
                />
                <span class="vertical-middle">
                  {{ $gettext('Migrations') }}</span
                >
                <q-chip color="grey" text-color="white">{{
                  events.migrations.total
                }}</q-chip>
              </template>
            </q-btn-toggle>
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            <HeatMap
              :title="current.title"
              :data="current.data"
              :total="current.total"
              :start="showDate(computer.created_at, 'YYYY-MM-DD')"
              @get-date="showItems"
              @total="goToModel"
            />
          </div>
        </div>
      </template>

      <div v-if="items.length > 0" id="events" class="q-py-md">
        <q-table
          :title="`${events[event].title} (${itemsDate}: ${items.length})`"
          :rows="items"
          :columns="events[event].columns"
          hide-pagination
          flat
          bordered
          :rows-per-page-options="[0]"
          :visible-columns="events[event].visibleColumns"
        >
          <template #top>
            <span class="q-table__title">{{ events[event].title }}</span
            ><q-space />
            <DateView :value="itemsDate" icon="mdi-calendar-star" />
            <q-space />
            <q-btn
              :label="items.length"
              size="lg"
              padding="xs md"
              color="info"
              text-color="black"
              @click="goToItems(itemsDate)"
            ></q-btn>
          </template>

          <template #body="props">
            <q-tr :props="props">
              <q-td v-if="event === 'syncs'" key="start_date">
                <DateView :value="props.row.start_date" />
              </q-td>

              <q-td key="created_at">
                <DateView :value="props.row.created_at" />
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

              <q-td v-if="event === 'faults'" key="result">
                <Truncate v-model="props.row.result" />
              </q-td>

              <q-td v-if="event === 'statusLogs'" key="status">
                <q-icon
                  :name="elementIcon(props.row.status)"
                  class="vertical-middle q-mr-xs"
                  size="sm"
                />
                <span class="vertical-middle">{{
                  computerStatus(props.row.status)
                }}</span>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { date, useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import Truncate from 'components/ui/Truncate'
import BooleanView from 'components/ui/BooleanView'
import DateView from 'components/ui/DateView'
import MigasLink from 'components/MigasLink'
import DateDiff from 'components/DateDiff'
import HeatMap from 'components/chart/HeatMap'

import { appIcon, modelIcon, useElement } from 'composables/element'
import useDate from 'composables/date'

export default {
  components: {
    Breadcrumbs,
    Header,
    MigasLink,
    HeatMap,
    BooleanView,
    DateView,
    Truncate,
    DateDiff,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { $gettext } = useGettext()
    const { addToDate } = date

    const uiStore = useUiStore()
    const { showDate } = useDate()
    const { elementIcon, computerStatus } = useElement()

    let computer = reactive({})
    const titleIcon = appIcon('events')
    const title = computed(() =>
      computer?.__str__
        ? `${$gettext('Events')}: ${computer.__str__}`
        : $gettext('Events'),
    )
    useMeta(() => ({ title: title.value }))

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
        text: $gettext('Computers'),
        icon: modelIcon('computers'),
        to: 'computers-dashboard',
      },
      {
        text: $gettext('Results'),
        icon: appIcon('results'),
        to: 'computers-list',
      },
      {
        text: 'Id',
        to: { name: 'computer-detail', params: { id: 0 } },
      },
      {
        text: $gettext('Events'),
        icon: titleIcon,
      },
    ])

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
          'result',
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
          {
            name: 'result',
            label: $gettext('Result'),
            field: 'result',
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
          'YYYY-MM-DD',
        ),
      }

      loading.value = true

      const fetchEventData = async (endpoint, target) => {
        try {
          const { data } = await api.get(endpoint, { params: queryString })
          target.data = data
          target.total = data.reduce(
            (accumulator, current) => accumulator + parseInt(current[1]),
            0,
          )
        } catch (error) {
          uiStore.notifyError(error)
        }
      }

      // ---- syncs (needs to set default event after load)
      await fetchEventData('/api/v1/token/stats/syncs/by-day/', events.syncs)

      // default event
      event.value = 'syncs'
      updateEvent(event.value)

      const otherEndpoints = [
        { url: '/api/v1/token/stats/errors/by-day/', target: events.errors },
        { url: '/api/v1/token/stats/faults/by-day/', target: events.faults },
        {
          url: '/api/v1/token/stats/migrations/by-day/',
          target: events.migrations,
        },
        {
          url: '/api/v1/token/stats/status-logs/by-day/',
          target: events.statusLogs,
        },
      ]

      await Promise.all(
        otherEndpoints.map(({ url, target }) => fetchEventData(url, target)),
      )

      loading.value = false
    }

    const updateEvent = (evt) => {
      Object.assign(current, events[evt])
      items.value = []
    }

    const camelToKebabCase = (str) => {
      return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
    }

    const showItems = async (params) => {
      if (itemsDate.value === params.data[0] && items.value.length) return

      const queryString = {
        computer__id: computer.id,
        created_at__gte: params.data[0],
        created_at__lt: showDate(
          date.addToDate(Date.parse(params.data[0]), { days: 1 }),
          'YYYY-MM-DD',
        ),
      }
      const url = `/api/v1/token/${camelToKebabCase(event.value)}/`

      itemsDate.value = params.data[0]

      try {
        const { data } = await api.get(url, { params: queryString })
        items.value = data.results

        setTimeout(() => {
          uiStore.scrollToElement(document.getElementById('events'))
        }, 250)
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    const goToModel = () => {
      router.push({
        name: `${camelToKebabCase(event.value)}-list`,
        query: { computer_id: computer.id },
      })
    }

    const goToItems = (day) => {
      const oneDayPlus = new Date(day)
      oneDayPlus.setDate(oneDayPlus.getDate() + 1)

      router.push({
        name: `${camelToKebabCase(event.value)}-list`,
        query: {
          computer_id: computer.id,
          created_at__gte: day,
          created_at__lt: date.formatDate(oneDayPlus, 'YYYY-MM-DD'),
        },
      })
    }

    onMounted(async () => {
      try {
        const { data } = await api.get(
          `/api/v1/token/computers/${route.params.id}/`,
        )
        Object.assign(computer, data)

        const idBreadcrumb = breadcrumbs.value.find((b) => b.text === 'Id')
        if (idBreadcrumb) {
          idBreadcrumb.to.params.id = computer.id
          idBreadcrumb.icon = elementIcon(computer.status)
          idBreadcrumb.text = computer.__str__
        }

        loadItems()
      } catch (error) {
        uiStore.notifyError(error)
      }
    })

    return {
      title,
      titleIcon,
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
      goToModel,
      goToItems,
      elementIcon,
      computerStatus,
      modelIcon,
      showDate,
    }
  },
}
</script>
