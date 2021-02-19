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
              ><translate
                >Date of entry into the migasfree system</translate
              ></q-tooltip
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
              { slot: 'migrations', value: 'migrations' }
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
                <translate>Errors</translate> ({{ events.errors.total }})</span
              >
            </template>

            <template #faults>
              <q-icon name="mdi-bomb" class="vertical-middle" />
              <span class="vertical-middle">
                <translate>Faults</translate> ({{ events.faults.total }})</span
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

      <div v-if="items.length > 0" id="events" class="q-pa-md">
        <q-toolbar class="bg-primary text-white shadow-2">
          <q-toolbar-title
            >{{ events[event].title }} ({{ itemsDate }}:
            {{ items.length }})</q-toolbar-title
          >
        </q-toolbar>

        <q-list bordered dense separator>
          <q-item v-for="(item, index) in items" :key="index" class="q-my-sm">
            <q-item-section>
              {{ item[0] }}
            </q-item-section>

            <!-- eslint-disable-next-line vue/no-v-html -->
            <q-item-section v-html="item[1]" />
          </q-item>
        </q-list>
      </div>
    </template>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'
import HeatMap from 'components/chart/HeatMap'
import { elementMixin } from 'mixins/element'
import { dateMixin } from 'mixins/date'
import { date } from 'quasar'

const { addToDate } = date

export default {
  meta() {
    return {
      title: this.title
    }
  },
  components: { Breadcrumbs, Header, MigasLink, HeatMap },
  mixins: [elementMixin, dateMixin],
  data() {
    return {
      title: this.$gettext('Events'),
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: this.$gettext('Data'),
          icon: 'mdi-database-search'
        },
        {
          text: this.$gettext('Computers'),
          to: 'computers-dashboard',
          icon: 'mdi-desktop-classic'
        },
        {
          text: this.$gettext('Results'),
          to: 'computers-list'
        },
        {
          text: 'Id',
          to: { name: 'computer-detail', params: { id: 0 } }
        },
        {
          text: this.$gettext('Events')
        }
      ],
      computer: {},
      event: null,
      current: {
        title: '',
        data: [],
        total: 0
      },
      events: {
        syncs: {
          data: [],
          total: 0,
          title: this.$gettext('Synchronizations')
        },
        errors: {
          data: [],
          total: 0,
          title: this.$gettext('Errors')
        },
        faults: {
          data: [],
          total: 0,
          title: this.$gettext('Faults')
        },
        migrations: {
          data: [],
          total: 0,
          title: this.$gettext('Migrations')
        },
        statusLogs: {
          data: [],
          total: 0,
          title: this.$gettext('Status Logs')
        }
      },
      items: [],
      itemsDate: null
    }
  },
  async mounted() {
    await this.$axios
      .get(`/api/v1/token/computers/${this.$route.params.id}/`)
      .then((response) => {
        this.computer = response.data
        this.breadcrumbs.find(
          (x) => x.text === 'Id'
        ).to.params.id = this.computer.id
        this.breadcrumbs.find(
          (x) => x.text === 'Id'
        ).text = this.computer.__str__
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
        )
      }

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
        )
      }
      const url = `/api/v1/token/${this.camelToKebabCase(this.event)}/`

      this.itemsDate = params.data[0]

      await this.$axios
        .get(url, { params: queryString })
        .then((response) => {
          this.items = []
          response.data.results.forEach((item) => {
            let itemDate = new Date(item.date || item.created_at)
            itemDate = itemDate.toLocaleTimeString()
            switch (this.event) {
              case 'syncs':
                this.items.push([
                  itemDate,
                  `(${item.project.name}): ${item.user.__str__}`
                ])
                break

              case 'errors':
                this.items.push([
                  itemDate,
                  `(${item.project.name}):<br />${item.description.replace(
                    new RegExp('\n', 'g'),
                    '<br />'
                  )}`
                ])
                break

              case 'faults':
                this.items.push([
                  itemDate,
                  `(${item.project.name}):<br />${item.result.replace(
                    new RegExp('\n', 'g'),
                    '<br />'
                  )}`
                ])
                break

              case 'statusLogs':
                this.items.push([itemDate, item.status])
                break

              case 'migrations':
                this.items.push([itemDate, item.project.name])
                break
            }
          })
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
    }
  }
}
</script>
