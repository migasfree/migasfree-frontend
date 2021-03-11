<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <template v-if="computer.id">
      <Header :title="$gettext('Simulate Synchronization')">
        <template v-if="computer.id" #append
          >:
          <MigasLink
            model="computers"
            :pk="computer.id"
            :value="computer.__str__ || ''"
            :icon="elementIcon(computer.status)"
          />
        </template>
      </Header>

      <div class="row q-pa-md q-gutter-sm">
        <div class="col-md">
          <q-card>
            <q-card-section>
              <div v-translate class="text-h5">Input (from computer)</div>
            </q-card-section>

            <q-card-section>
              <p v-if="loading.input" class="items-center">
                <q-spinner-dots color="primary" size="3em" />
              </p>
              <template v-else>
                <p>
                  <q-icon
                    name="mdi-clock-outline"
                    size="sm"
                    class="vertical-middle"
                  />
                  <span class="vertical-middle">
                    {{ showDate(new Date(Date.now())) }}</span
                  >
                </p>

                <p>
                  <q-icon
                    name="mdi-card-account-details-outline"
                    size="sm"
                    class="vertical-middle"
                  />
                  <span class="vertical-middle"> {{ computer.uuid }}</span>
                </p>

                <p v-if="platform.id">
                  <MigasLink
                    model="platforms"
                    :pk="platform.id"
                    :value="platform.name"
                    icon="mdi-layers"
                  />
                </p>

                <p>
                  <MigasLink
                    model="projects"
                    :pk="computer.project.id"
                    :value="computer.project.name"
                    icon="mdi-sitemap"
                  />
                </p>

                <p>
                  <MigasLink
                    model="users"
                    :pk="computer.sync_user.id"
                    :value="computer.sync_user.__str__"
                    icon="mdi-account"
                  />
                </p>

                <OverflowList
                  :label="$gettext('Attributes')"
                  icon="mdi-pound"
                  :items="onlyAttributes"
                  model="attributes"
                />

                <OverflowList
                  :label="$gettext('Tags')"
                  icon="mdi-tag"
                  :items="onlyTags"
                  model="tags"
                />

                <OverflowList
                  :label="$gettext('Attribute Sets')"
                  icon="mdi-set-none"
                  :items="onlyAttributeSets"
                  model="attribute-sets"
                />
              </template>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-md">
          <q-card>
            <q-card-section>
              <div v-translate class="text-h5">Output (from server)</div>
            </q-card-section>

            <q-card-section>
              <p v-if="loading.output" class="justify-center">
                <q-spinner-dots color="primary" size="3em" />
              </p>
              <template v-else>
                <OverflowList
                  :label="$gettext('Faults Definitions')"
                  icon="mdi-alarm-light"
                  :items="simulation.fault_definitions"
                  model="fault-definitions"
                />

                <OverflowList
                  :label="$gettext('Deployments')"
                  icon="mdi-rocket-launch"
                  :items="simulation.deployments"
                  model="deployments"
                />

                <OverflowList
                  :label="$gettext('Packages to Install')"
                  icon="mdi-package-down"
                  :items="simulation.packages.install"
                />

                <OverflowList
                  :label="$gettext('Packages to Install (by policies)')"
                  icon="mdi-package-down"
                  :items="simulation.policies.install"
                />

                <OverflowList
                  :label="$gettext('Packages to Uninstall')"
                  icon="mdi-package-up"
                  :items="simulation.packages.remove"
                />

                <OverflowList
                  :label="$gettext('Packages to Uninstall (by policies)')"
                  icon="mdi-package-up"
                  :items="simulation.policies.remove"
                />

                <OverflowList
                  :label="$gettext('Devices')"
                  icon="mdi-printer"
                  :items="simulation.logical_devices"
                  model="devices/logical"
                />

                <p>
                  <translate>Capture Hardware</translate>:
                  <q-chip
                    :color="
                      simulation.capture_hardware ? 'positive' : 'negative'
                    "
                    text-color="white"
                    >{{
                      simulation.capture_hardware
                        ? $gettext('Yes')
                        : $gettext('No')
                    }}</q-chip
                  >
                </p>
              </template>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import OverflowList from 'components/ui/OverflowList'
import MigasLink from 'components/MigasLink'
import { elementMixin } from 'mixins/element'
import { dateMixin } from 'mixins/date'

export default {
  meta() {
    return {
      title: this.title
    }
  },
  components: { Breadcrumbs, Header, OverflowList, MigasLink },
  mixins: [elementMixin, dateMixin],
  data() {
    return {
      title: this.$gettext('Simulate Synchronization'),
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
          text: this.$gettext('Simulate Synchronization')
        }
      ],
      computer: {},
      platform: {},
      onlyAttributes: [],
      onlyAttributeSets: [],
      onlyTags: [],
      simulation: {},
      loading: {
        input: false,
        output: false
      }
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
        this.loadProject()
        this.loadSyncInfo()
        this.loadSimulation()

        Object.entries(response.data.tags).map(([key, val]) => {
          this.onlyTags.push({
            id: val.id,
            icon: 'mdi-tag',
            value: this.attributeValue(val)
          })
        })
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })
  },
  methods: {
    async loadProject() {
      await this.$axios
        .get(`/api/v1/token/projects/${this.computer.project.id}/`)
        .then((response) => {
          this.platform = response.data.platform
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    async loadSyncInfo() {
      this.loading.input = true
      await this.$axios
        .get(`/api/v1/token/computers/${this.computer.id}/sync/`)
        .then((response) => {
          Object.entries(response.data.sync_attributes).map(([key, val]) => {
            if (val.property_att.prefix === 'SET') {
              this.$axios
                .get(`/api/v1/token/attributes/${val.id}/badge/`)
                .then((response) => {
                  this.onlyAttributeSets.push({
                    id: response.data.pk,
                    icon: 'mdi-set-none',
                    value: this.attributeValue(val),
                    summary: response.data.summary
                  })
                })
                .catch((error) => {
                  this.$store.dispatch('ui/notifyError', error)
                })
            } else {
              this.onlyAttributes.push({
                id: val.id,
                value: this.attributeValue(val)
              })
            }
          })
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
        .finally(() => {
          this.loading.input = false
        })
    },

    async loadSimulation() {
      this.loading.output = true
      await this.$axios
        .get(`/api/v1/token/computers/${this.computer.id}/sync/simulation/`)
        .then((response) => {
          this.simulation = response.data
          if ('logical_devices' in this.simulation)
            Object.entries(this.simulation.logical_devices).map(
              ([key, item]) => {
                item.icon = 'mdi-printer-settings'
              }
            )

          if ('fault_definitions' in this.simulation)
            Object.entries(this.simulation.fault_definitions).map(
              ([key, item]) => {
                item.icon = 'mdi-alert-octagram-outline'
              }
            )

          if ('deployments' in this.simulation)
            Object.entries(this.simulation.deployments).map(([key, item]) => {
              item.icon = 'mdi-rocket-launch'
            })
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
        .finally(() => {
          this.loading.output = false
        })
    }
  }
}
</script>
