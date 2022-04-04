<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <template v-if="computer.id">
      <Header :title="$gettext('Events')">
        <template v-if="computer.id" #append
          >:
          <MigasLink
            model="computers"
            :pk="computer.id"
            :value="computer.__str__ || ''"
            :icon="elementIcon(computer.status)"
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
          <div class="col-md">
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
              @input="updateEvent"
            >
              <template #syncs>
                <q-icon name="mdi-sync" class="vertical-middle" />
                <span class="vertical-middle">
                  <translate>Synchronizations</translate> ({{
                    events.syncs.total
                  }})</span
                >
              </template>

              <template #errors>
                <q-icon name="mdi-bug" class="vertical-middle" />
                <span class="vertical-middle">
                  <translate>Errors</translate> ({{
                    events.errors.total
                  }})</span
                >
              </template>

              <template #faults>
                <q-icon name="mdi-bomb" class="vertical-middle" />
                <span class="vertical-middle">
                  <translate>Faults</translate> ({{
                    events.faults.total
                  }})</span
                >
              </template>

              <template #statusLogs>
                <q-icon name="mdi-flag-variant" class="vertical-middle" />
                <span class="vertical-middle">
                  <translate>Status Logs</translate> ({{
                    events.statusLogs.total
                  }})</span
                >
              </template>

              <template #migrations>
                <q-icon name="mdi-map-marker-right" class="vertical-middle" />
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
              @getDate="showItems"
            />
          </div>
        </div>
      </template>

      <div v-if="items.length > 0" id="events" class="q-pa-lg">
        <q-table
          :title="`${events[event].title} (${itemsDate}: ${items.length})`"
          :data="items"
          :columns="events[event].columns"
          hide-pagination
          :rows-per-page-options="[0]"
          :visible-columns="events[event].visibleColumns"
        >
          <template #body="props">
            <q-tr :props="props">
              <q-td v-if="event === 'syncs'" key="start_date" :props="props">
                {{ showDate(props.row.start_date) }}
              </q-td>

              <q-td key="created_at" :props="props">
                {{ showDate(props.row.created_at) }}
                <DateDiff
                  v-if="props.row.created_at && props.row.start_date"
                  class="float-right"
                  :begin="new Date(props.row.start_date)"
                  :end="new Date(props.row.created_at)"
                  :tooltip="$gettext('Duration')"
                />
              </q-td>

              <q-td v-if="event === 'syncs'" key="user.name" :props="props">
                <MigasLink
                  model="users"
                  :pk="props.row.user.id"
                  :value="props.row.user.__str__"
                  icon="mdi-account"
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
                  icon="mdi-sitemap"
                />
              </q-td>

              <q-td v-if="event === 'syncs'" key="pms_status_ok" :props="props">
                <BooleanView v-model="props.row.pms_status_ok" />
              </q-td>

              <q-td v-if="event === 'syncs'" key="consumer" :props="props">
                {{ props.row.consumer }}
              </q-td>

              <q-td
                v-if="['errors', 'faults'].includes(event)"
                key="checked"
                :props="props"
              >
                <BooleanView v-model="props.row.checked" />
              </q-td>

              <q-td v-if="event === 'errors'" key="description" :props="props">
                <Truncate v-model="props.row.description" />
              </q-td>

              <q-td
                v-if="event === 'faults'"
                key="fault_definition.name"
                :props="props"
              >
                <MigasLink
                  model="fault-definitions"
                  :pk="props.row.fault_definition.id"
                  :value="props.row.fault_definition.name || ''"
                  icon="mdi-alert-octagram-outline"
                />
              </q-td>

              <q-td v-if="event === 'statusLogs'" key="status" :props="props">
                {{ props.row.status }}
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </template>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import Truncate from 'components/ui/Truncate'
import BooleanView from 'components/ui/BooleanView'
import MigasLink from 'components/MigasLink'
import DateDiff from 'components/DateDiff'
import HeatMap from 'components/chart/HeatMap'
import { elementMixin } from 'mixins/element'
import { dateMixin } from 'mixins/date'
import { date } from 'quasar'

const { addToDate } = date

export default {
  meta() {
    return {
      title: this.title,
    }
  },
  components: {
    Breadcrumbs,
    Header,
    MigasLink,
    HeatMap,
    BooleanView,
    Truncate,
    DateDiff,
  },
  mixins: [elementMixin, dateMixin],
  data() {
    return {
      title: this.$gettext('Events'),
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home',
        },
        {
          text: this.$gettext('Data'),
          icon: 'mdi-database-search',
        },
        {
          text: this.$gettext('Computers'),
          to: 'computers-dashboard',
          icon: 'mdi-desktop-classic',
        },
        {
          text: this.$gettext('Results'),
          to: 'computers-list',
        },
        {
          text: 'Id',
          to: { name: 'computer-detail', params: { id: 0 } },
        },
        {
          text: this.$gettext('Events'),
        },
      ],
      computer: {},
      event: null,
      current: {
        title: '',
        data: [],
        total: 0,
      },
      events: {
        syncs: {
          data: [],
          total: 0,
          title: this.$gettext('Synchronizations'),
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
              label: this.$gettext('Start Date'),
              field: 'start_date',
              align: 'left',
            },
            {
              name: 'created_at',
              label: this.$gettext('End Date'),
              field: 'created_at',
              align: 'left',
            },
            {
              name: 'user.id',
              field: 'user.id',
            },
            {
              name: 'user.name',
              label: this.$gettext('User'),
              field: 'user.name',
              align: 'left',
            },
            {
              name: 'project.id',
              field: 'project.id',
            },
            {
              name: 'project.name',
              label: this.$gettext('Project'),
              field: 'project.name',
              align: 'left',
            },
            {
              name: 'pms_status_ok',
              label: this.$gettext('PMS Status Ok'),
              field: 'pms_status_ok',
              align: 'center',
            },
            {
              name: 'consumer',
              label: this.$gettext('Consumer'),
              field: 'consumer',
              align: 'left',
            },
          ],
        },
        errors: {
          data: [],
          total: 0,
          title: this.$gettext('Errors'),
          visibleColumns: [
            'created_at',
            'project.name',
            'checked',
            'description',
          ],
          columns: [
            {
              name: 'created_at',
              label: this.$gettext('Date'),
              field: 'created_at',
              align: 'left',
            },
            {
              name: 'project.id',
              field: 'project.id',
            },
            {
              name: 'project.name',
              label: this.$gettext('Project'),
              field: 'project.name',
              align: 'left',
            },
            {
              name: 'checked',
              label: this.$gettext('Checked'),
              field: 'checked',
              align: 'center',
            },
            {
              name: 'description',
              label: this.$gettext('Description'),
              field: 'description',
              align: 'left',
            },
          ],
        },
        faults: {
          data: [],
          total: 0,
          title: this.$gettext('Faults'),
          visibleColumns: [
            'created_at',
            'project.name',
            'checked',
            'fault_definition.name',
          ],
          columns: [
            {
              name: 'created_at',
              label: this.$gettext('Date'),
              field: 'created_at',
              align: 'left',
            },
            {
              name: 'project.id',
              field: 'project.id',
            },
            {
              name: 'project.name',
              label: this.$gettext('Project'),
              field: 'project.name',
              align: 'left',
            },
            {
              name: 'checked',
              label: this.$gettext('Checked'),
              field: 'checked',
              align: 'center',
            },
            {
              name: 'fault_definition.id',
              field: 'fault_definition.id',
            },
            {
              name: 'fault_definition.name',
              label: this.$gettext('Fault Definition'),
              field: 'fault_definition.name',
              align: 'left',
            },
          ],
        },
        migrations: {
          data: [],
          total: 0,
          title: this.$gettext('Migrations'),
          visibleColumns: ['created_at', 'project.name'],
          columns: [
            {
              name: 'created_at',
              label: this.$gettext('Date'),
              field: 'created_at',
              align: 'left',
            },
            {
              name: 'project.id',
              field: 'project.id',
            },
            {
              name: 'project.name',
              label: this.$gettext('Project'),
              field: 'project.name',
              align: 'left',
            },
          ],
        },
        statusLogs: {
          data: [],
          total: 0,
          title: this.$gettext('Status Logs'),
          visibleColumns: ['created_at', 'status'],
          columns: [
            {
              name: 'created_at',
              label: this.$gettext('Date'),
              field: 'created_at',
              align: 'left',
            },
            {
              name: 'status',
              label: this.$gettext('Status'),
              field: 'status',
              align: 'left',
            },
          ],
        },
      },
      items: [],
      itemsDate: null,
      loading: false,
    }
  },
  async mounted() {
    await this.$axios
      .get(`/api/v1/token/computers/${this.$route.params.id}/`)
      .then((response) => {
        this.computer = response.data
        this.breadcrumbs.find((x) => x.text === 'Id').to.params.id =
          this.computer.id
        this.breadcrumbs.find((x) => x.text === 'Id').text =
          this.computer.__str__
        this.title = `${this.title}: ${this.computer.__str__}`
        this.loadItems()
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })
  },
  methods: {
    async loadItems() {
      const queryString = {
        computer_id: this.computer.id,
        start_date: this.showDate(this.computer.created_at, 'YYYY-MM-DD'),
        end_date: this.showDate(
          addToDate(new Date(), { days: 1 }).toISOString(),
          'YYYY-MM-DD'
        ),
      }

      this.loading = true
      await this.$axios
        .get(`/api/v1/token/stats/syncs/by-day/`, { params: queryString })
        .then((response) => {
          this.events.syncs.data = response.data
          this.events.syncs.total = response.data.reduce(
            (accumulator, current) => accumulator + parseInt(current[1]),
            0
          )

          // default event
          this.event = 'syncs'
          this.updateEvent(this.event)
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
        .finally(() => {
          this.loading = false
        })

      await this.$axios
        .get(`/api/v1/token/stats/errors/by-day/`, { params: queryString })
        .then((response) => {
          this.events.errors.data = response.data
          this.events.errors.total = response.data.reduce(
            (accumulator, current) => accumulator + parseInt(current[1]),
            0
          )
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })

      await this.$axios
        .get(`/api/v1/token/stats/faults/by-day/`, { params: queryString })
        .then((response) => {
          this.events.faults.data = response.data
          this.events.faults.total = response.data.reduce(
            (accumulator, current) => accumulator + parseInt(current[1]),
            0
          )
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })

      await this.$axios
        .get(`/api/v1/token/stats/migrations/by-day/`, { params: queryString })
        .then((response) => {
          this.events.migrations.data = response.data
          this.events.migrations.total = response.data.reduce(
            (accumulator, current) => accumulator + parseInt(current[1]),
            0
          )
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })

      await this.$axios
        .get(`/api/v1/token/stats/status-logs/by-day/`, { params: queryString })
        .then((response) => {
          this.events.statusLogs.data = response.data
          this.events.statusLogs.total = response.data.reduce(
            (accumulator, current) => accumulator + parseInt(current[1]),
            0
          )
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    updateEvent(evt) {
      this.current = this.events[evt]
      this.items = []
    },

    camelToKebabCase(str) {
      return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
    },

    async showItems(params) {
      const queryString = {
        computer__id: this.computer.id,
        created_at__gte: params.data[0],
        created_at__lt: this.showDate(
          date.addToDate(Date.parse(params.data[0]), { days: 1 }),
          'YYYY-MM-DD'
        ),
      }
      const url = `/api/v1/token/${this.camelToKebabCase(this.event)}/`

      this.itemsDate = params.data[0]

      await this.$axios
        .get(url, { params: queryString })
        .then((response) => {
          this.items = response.data.results

          setTimeout(() => {
            this.$store.dispatch(
              'ui/scrollToElement',
              document.getElementById('events')
            )
          }, 250)
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },
  },
}
</script>
