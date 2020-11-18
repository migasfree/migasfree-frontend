<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <template v-if="computer.id">
      <div class="row">
        <div class="col-md">
          <h2 class="text-h3">
            Simular sincronización:
            <MigasLink
              model="computers"
              :pk="computer.id"
              :value="computer.__str__ || ''"
              :icon="elementIcon(computer.status)"
            />
          </h2>
        </div>
      </div>

      <div class="row q-pa-md q-gutter-sm">
        <div class="col-md">
          <q-card>
            <q-card-section>
              <div class="text-h5">Entrada (del ordenador)</div>
            </q-card-section>

            <q-card-section>
              <p>
                <q-icon name="mdi-clock-outline" size="sm" />
                {{ showDate(new Date(Date.now())) }}
              </p>

              <p>
                <q-icon name="mdi-card-account-details-outline" size="sm" />
                {{ computer.uuid }}
              </p>

              <p v-if="platform.id">
                <q-icon name="mdi-layers" size="sm" />
                <MigasLink
                  model="platforms"
                  :pk="platform.id"
                  :value="platform.name"
                />
              </p>

              <p>
                <q-icon name="mdi-sitemap" size="sm" />
                <MigasLink
                  model="projects"
                  :pk="computer.project.id"
                  :value="computer.project.name"
                />
              </p>

              <p>
                <q-icon name="mdi-account" size="sm" />
                <MigasLink
                  model="users"
                  :pk="computer.sync_user.id"
                  :value="computer.sync_user.name"
                />
              </p>

              <OverflowList
                label="Attributes"
                icon="mdi-pound"
                :items="onlyAttributes"
                model="attributes"
              />

              <OverflowList
                label="Conjuntos de atributos"
                icon="mdi-set-none"
                :items="onlyAttributeSets"
                model="attributes"
              />
            </q-card-section>
          </q-card>
        </div>

        <div class="col-md">
          <q-card>
            <q-card-section>
              <div class="text-h5">Salida (del servidor)</div>
            </q-card-section>

            <q-card-section v-if="Object.keys(simulation).length > 0">
              <OverflowList
                label="Definiciones de fallas"
                icon="mdi-alarm-light"
                :items="simulation.fault_definitions"
                model="fault-definitions"
              />

              <OverflowList
                label="Despliegues"
                icon="mdi-rocket-launch"
                :items="simulation.deployments"
                model="deployments"
              />

              <OverflowList
                label="Paquetes a instalar"
                icon="mdi-package-down"
                :items="simulation.packages.install"
              />

              <OverflowList
                label="Paquetes a instalar (por políticas)"
                icon="mdi-package-down"
                :items="simulation.policies.install"
              />

              <OverflowList
                label="Paquetes a desinstalar"
                icon="mdi-package-up"
                :items="simulation.packages.remove"
              />

              <OverflowList
                label="Paquetes a desinstalar (por políticas)"
                icon="mdi-package-up"
                :items="simulation.policies.remove"
              />

              <OverflowList
                label="Dispositivos"
                icon="mdi-printer"
                :items="simulation.logical_devices"
                model="devices/logical"
              />

              <p>
                Obtención del hardware:
                <q-chip
                  :color="simulation.capture_hardware ? 'positive' : 'negative'"
                  text-color="white"
                  >{{ simulation.capture_hardware ? 'Sí' : 'No' }}</q-chip
                >
              </p>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import OverflowList from 'components/ui/OverflowList'
import MigasLink from 'components/MigasLink'
import { elementMixin } from 'mixins/element'
import { dateMixin } from 'mixins/date'

export default {
  components: { Breadcrumbs, OverflowList, MigasLink },
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
          to: 'computers-dashboard',
          icon: 'mdi-desktop-classic'
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
          text: 'Simular sincronización'
        }
      ],
      computer: {},
      platform: {},
      onlyAttributes: [],
      onlyAttributeSets: [],
      simulation: {}
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
        this.loadProject()
        this.loadSyncInfo()
        this.loadSimulation()
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error.response.data.detail)
      })
  },
  methods: {
    async loadProject() {
      await this.$axios
        .get(`/api/v1/token/projects/${this.computer.project.id}/`)
        .then((response) => {
          console.log(response)
          this.platform = response.data.platform
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error.response.data.detail)
        })
    },

    async loadSyncInfo() {
      await this.$axios
        .get(`/api/v1/token/computers/${this.computer.id}/sync/`)
        .then((response) => {
          console.log(response)
          Object.entries(response.data.sync_attributes).map(([key, val]) => {
            if (val.property_att.prefix === 'SET') {
              this.onlyAttributeSets.push({
                id: val.id,
                value: `${val.property_att.prefix}-${val.value}`
              })
            } else {
              this.onlyAttributes.push({
                id: val.id,
                value: `${val.property_att.prefix}-${val.value}`
              })
            }
          })
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error.response.data.detail)
        })
    },

    async loadSimulation() {
      await this.$axios
        .get(`/api/v1/token/computers/${this.computer.id}/sync/simulation/`)
        .then((response) => {
          console.log(response)
          this.simulation = response.data
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error.response.data.detail)
        })
    }
  }
}
</script>
