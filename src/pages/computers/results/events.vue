<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <template v-if="computer.id">
      <div class="row">
        <div class="col-md">
          <h2 class="text-h3">
            Sucesos:
            <MigasLink
              model="computers"
              :pk="computer.id"
              :value="computer.__str__ || ''"
              :icon="elementIcon(computer.status)"
            />
          </h2>
        </div>
      </div>

      <div class="row">
        <h3 class="text-h5">
          <q-tooltip self="bottom middle"
            >Date of entry into the migasfree system</q-tooltip
          >
          <q-icon name="mdi-calendar-plus" size="md" />
          {{ showDate(computer.created_at) }}
        </h3>
      </div>

      <div class="row">
        <div class="col-12">
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
            <template v-slot:syncs>
              <q-icon name="mdi-sync" />
              Sincronizaciones ({{ events.syncs.total }})
            </template>

            <template v-slot:errors>
              <q-icon name="mdi-bug" />
              Errores ({{ events.errors.total }})
            </template>

            <template v-slot:faults>
              <q-icon name="mdi-bomb" />
              Fallas ({{ events.faults.total }})
            </template>

            <template v-slot:statusLogs>
              <q-icon name="mdi-flag-variant" />
              Registros de Estado ({{ events.statusLogs.total }})
            </template>

            <template v-slot:migrations>
              <q-icon name="mdi-map-marker-right" />
              Migraciones ({{ events.migrations.total }})
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
          />
        </div>
      </div>
    </template>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import MigasLink from 'components/MigasLink'
import HeatMap from 'components/chart/HeatMap'
import { elementMixin } from 'mixins/element'
import { dateMixin } from 'mixins/date'

export default {
  components: { Breadcrumbs, MigasLink, HeatMap },
  mixins: [elementMixin, dateMixin],
  data() {
    return {
      breadcrumbs: [
        {
          text: 'Dashboard',
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: 'Datos',
          icon: 'mdi-database-search'
        },
        {
          text: 'Ordenadores',
          to: 'computers-dashboard'
        },
        {
          text: 'Resultados',
          to: 'computers-list'
        },
        {
          text: 'Id',
          to: { name: 'computer-detail', params: { id: 0 } }
        },
        {
          text: 'Sucesos'
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
          title: 'Sincronizaciones'
        },
        errors: {
          data: [],
          total: 0,
          title: 'Errores'
        },
        faults: {
          data: [],
          total: 0,
          title: 'Fallas'
        },
        migrations: {
          data: [],
          total: 0,
          title: 'Migraciones'
        },
        statusLogs: {
          data: [],
          total: 0,
          title: 'Registros de Estado'
        }
      }
    }
  },
  async mounted() {
    await this.$axios
      .get(`/api/v1/token/computers/${this.$route.params.id}/`)
      .then((response) => {
        console.log(response)
        this.computer = response.data
        this.breadcrumbs[4].text = this.computer.__str__
        this.breadcrumbs[4].to.params.id = this.computer.id
        this.loadItems()
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error.response.data.detail)
      })
  },
  methods: {
    async loadItems() {
      const queryString = {
        computer_id: this.computer.id,
        start_date: this.showDate(this.computer.created_at, 'YYYY-MM-DD'),
        end_date: this.showDate(
          new Date(Date.now()).toISOString(),
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
          this.$store.dispatch('ui/notifyError', error.response.data)
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
          this.$store.dispatch('ui/notifyError', error.response.data)
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
          this.$store.dispatch('ui/notifyError', error.response.data)
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
          this.$store.dispatch('ui/notifyError', error.response.data)
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
          this.$store.dispatch('ui/notifyError', error.response.data)
        })
    },

    updateEvent(evt) {
      this.current = this.events[evt]
    }
  }
}
</script>
