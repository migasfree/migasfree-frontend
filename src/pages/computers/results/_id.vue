<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <template v-if="element.id">
      <div class="row">
        <div class="col-md">
          <h2 class="text-h3">
            Ordenador:
            <MigasLink
              model="computers"
              :pk="element.id"
              :value="element.__str__ || ''"
              :icon="elementIcon(element.status)"
            />
          </h2>
        </div>
      </div>

      <div class="row q-pa-md q-gutter-md">
        <div class="col-md">
          <q-card>
            <q-card-section>
              <q-btn-group v-if="$store.getters['auth/user'].is_superuser">
                <q-input v-model="element.name" outlined label="Nombre" />
                <q-btn color="primary" icon="mdi-content-save" />
              </q-btn-group>
              <div v-else class="text-h5">{{ element.name }}</div>
            </q-card-section>

            <q-card-section>
              <div class="row q-pa-md">
                <q-tooltip self="bottom middle"
                  >full qualified domain name</q-tooltip
                >
                <q-icon name="mdi-information" size="sm" /> {{ element.fqdn }}
              </div>

              <div class="row q-pa-md">
                <div class="col-md">
                  <q-tooltip self="bottom middle">project</q-tooltip>
                  <q-icon name="mdi-sitemap" size="sm" />
                  <MigasLink
                    model="projects"
                    :pk="element.project.id"
                    :value="element.project.name"
                  />
                </div>
                <div class="col-md">
                  <q-tooltip self="bottom middle"
                    >Date of entry into the migasfree system</q-tooltip
                  >
                  <q-icon name="mdi-calendar-plus" size="sm" />
                  {{ showDate(element.created_at) }}
                </div>
              </div>

              <div class="row q-pa-md">
                <div class="col-md">
                  <q-tooltip self="bottom middle">ip address</q-tooltip>
                  <q-icon name="mdi-ip-network" size="sm" />
                  {{ element.ip_address }}
                </div>
                <div class="col-md">
                  <q-tooltip self="bottom middle"
                    >forwarded ip address</q-tooltip
                  >
                  <q-icon name="mdi-ip" size="sm" />
                  {{ element.forwarded_ip_address }}
                </div>
              </div>
            </q-card-section>

            <q-card-actions align="evenly">
              <q-btn-group>
                <q-btn
                  icon="mdi-calendar-multiple"
                  label="Sucesos"
                  no-caps
                  :to="{
                    name: 'computer-events',
                    params: { id: element.id }
                  }"
                />
                <q-btn
                  icon="mdi-head-sync-outline"
                  label="Simular sincronización"
                  no-caps
                  :to="{
                    name: 'computer-simulate',
                    params: { id: element.id }
                  }"
                />
                <q-btn
                  icon="mdi-card-account-details-outline"
                  label="Identificación"
                  no-caps
                  :to="{
                    name: 'computer-label',
                    params: { id: element.id }
                  }"
                />
              </q-btn-group>
            </q-card-actions>
          </q-card>
        </div>

        <div class="col-md">
          <q-card>
            <q-card-section>
              <div class="row">
                <div class="col-md">
                  <div class="text-h5">Hardware</div>
                </div>

                <div class="col-md">
                  <q-btn-group class="float-right">
                    <q-datetime-picker
                      v-model="element.last_hardware_capture"
                      label="Fecha de la última captura del hardware"
                      mode="datetime"
                      outlined
                      clearable
                      landscape
                      target="self"
                      format24h
                      :display-value="showDate(element.last_hardware_capture)"
                    ></q-datetime-picker>
                    <q-btn color="primary" icon="mdi-content-save" />
                  </q-btn-group>
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div class="row q-pa-md">
                <div class="col-md-4">
                  <q-icon
                    :name="productIcon(element.product_system)"
                    style="font-size: 6em;"
                  >
                    <q-tooltip>{{ element.product_system }}</q-tooltip>
                    <q-badge floating transparent>
                      {{ element.architecture }} bits
                    </q-badge></q-icon
                  >
                </div>

                <div class="col-md-8">
                  <p>
                    <MigasLink
                      model="computers"
                      :pk="element.id"
                      :value="element.product || ''"
                    />
                  </p>
                  <p>
                    <q-tooltip self="bottom middle">UUID</q-tooltip>
                    {{ element.uuid }}
                  </p>
                </div>
              </div>

              <div class="row q-pa-md">
                <div class="col-md">
                  <p>
                    <q-tooltip self="bottom middle">Procesador</q-tooltip>
                    <q-icon :name="cpuIcon(element.architecture)" size="sm" />
                    {{ element.cpu }}
                  </p>
                </div>
                <div class="col-md">
                  <p>
                    <q-tooltip self="bottom middle">RAM</q-tooltip>
                    <q-icon name="mdi-memory" size="sm" />
                    {{ humanStorageSize(element.ram) }}
                  </p>
                </div>
              </div>

              <div class="row q-pa-md">
                <div class="col-md">
                  <p>
                    <q-tooltip self="bottom middle">Almacenamiento</q-tooltip>
                    <q-icon name="mdi-harddisk" size="sm" />
                    {{ humanStorageSize(element.storage) }}
                    ({{ element.disks }})
                  </p>
                </div>
                <div class="col-md">
                  <p>
                    <q-tooltip self="bottom middle">Dirección MAC</q-tooltip>
                    <q-icon name="mdi-swap-vertical" size="sm" />
                    {{ humanMacAddress(element.mac_address) }}
                  </p>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row q-pa-md q-gutter-md">
        <div class="col-md">
          <q-card>
            <q-card-section>
              <div class="text-h5">Situación actual</div>
            </q-card-section>

            <q-card-section>
              <p>
                <q-select
                  v-model="element.status"
                  outlined
                  emit-value
                  map-options
                  label="Estado"
                  :options="status"
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                      <q-item-section avatar>
                        <q-icon :name="scope.opt.icon" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                        <q-item-label caption>{{
                          scope.opt.description
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>

                  <template v-slot:selected-item="scope">
                    <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                      <q-item-section avatar>
                        <q-icon :name="scope.opt.icon" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                        <q-item-label caption>{{
                          scope.opt.description
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </p>

              <p>
                <q-input
                  v-model="element.comment"
                  outlined
                  type="textarea"
                  label="Comentario"
                />
              </p>

              <p>
                <q-select
                  v-model="element.tags"
                  outlined
                  use-input
                  use-chips
                  emit-value
                  map-options
                  multiple
                  input-debounce="0"
                  label="Etiquetas"
                  :options="tags"
                  @filter="filterTags"
                  @filter-abort="abortFilterTags"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        No results
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </p>
            </q-card-section>

            <q-card-actions>
              <q-btn
                class="full-width"
                color="primary"
                icon="mdi-content-save"
              />
            </q-card-actions>
          </q-card>
        </div>

        <div class="col-md">
          <q-card>
            <q-card-section>
              <div class="row">
                <div class="col-md">
                  <div class="text-h5">Sincronización</div>
                </div>

                <div class="col-md">
                  <DateDiff
                    class="float-right"
                    :begin="new Date(element.sync_end_date)"
                    tooltip="unsynchronized from"
                  />
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div class="row q-pa-md">
                <div class="col-md">
                  <q-tooltip self="bottom middle">sync start date</q-tooltip>
                  <q-icon name="mdi-play" size="sm" />{{
                    showDate(syncInfo.sync_start_date)
                  }}
                </div>

                <div class="col-md">
                  <q-tooltip self="bottom middle">sync end date</q-tooltip>
                  <q-icon name="mdi-stop" size="sm" />{{
                    showDate(syncInfo.sync_end_date)
                  }}
                </div>

                <div class="col-md">
                  <DateDiff
                    v-if="syncInfo.sync_start_date"
                    :begin="new Date(syncInfo.sync_start_date)"
                    :end="new Date(syncInfo.sync_end_date)"
                    tooltip="last sync time"
                  />
                </div>
              </div>

              <div class="row q-pa-md">
                <q-tooltip self="bottom middle">User</q-tooltip>
                <q-icon name="mdi-account" size="sm" />
                <MigasLink
                  model="users"
                  :pk="element.sync_user.id"
                  :value="element.sync_user.name || ''"
                />
              </div>

              <q-list bordered>
                <q-expansion-item
                  label="Attributes"
                  default-opened
                  icon="mdi-pound"
                  :content-inset-level="0.5"
                >
                  <q-list class="overflow">
                    <q-item
                      v-for="item in syncInfo.sync_attributes"
                      :key="item.id"
                    >
                      <MigasLink
                        model="attributes"
                        :pk="item.id"
                        :value="`${item.property_att.prefix}-${item.value}`"
                      />
                    </q-item>
                  </q-list>
                </q-expansion-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row q-pa-md q-gutter-md">
        <div v-if="element.has_software_inventory" class="col-md">
          <q-card>
            <q-card-section>
              <div class="text-h5">Software</div>
            </q-card-section>

            <q-card-section>
              <q-list bordered>
                <q-expansion-item
                  :content-inset-level="0.5"
                  @show="loadSoftwareInventory"
                >
                  <template v-slot:header>
                    <q-item-section avatar>
                      <q-icon name="mdi-package-variant" size="md" />
                    </q-item-section>

                    <q-item-section>
                      Inventory
                    </q-item-section>

                    <q-item-section side>
                      <q-btn
                        flat
                        icon="mdi-content-copy"
                        color="primary"
                        @click.stop="copyInventory"
                      />
                    </q-item-section>
                  </template>

                  <q-list class="overflow">
                    <q-item v-if="loading.inventory">
                      <q-spinner-dots color="primary" size="3em" />
                    </q-item>
                    <q-item v-for="item in softwareInventory" :key="item.id">
                      <MigasLink
                        model="packages"
                        :pk="item.id"
                        :value="item.name"
                      />
                    </q-item>
                  </q-list>
                </q-expansion-item>

                <q-separator />

                <q-expansion-item
                  :content-inset-level="0.5"
                  @show="loadSoftwareHistory"
                >
                  <template v-slot:header>
                    <q-item-section avatar>
                      <q-icon name="mdi-history" size="md" />
                    </q-item-section>

                    <q-item-section>
                      History
                    </q-item-section>

                    <q-item-section side>
                      <q-btn
                        flat
                        icon="mdi-content-copy"
                        color="primary"
                        @click.stop="copyHistory"
                      />
                    </q-item-section>
                  </template>

                  <q-list class="overflow">
                    <q-item v-if="loading.history">
                      <q-spinner-dots color="primary" size="3em" />
                    </q-item>
                    <q-expansion-item
                      v-for="(value, key) in softwareHistory"
                      :key="key"
                      expand-separator
                      :label="key"
                      icon="mdi-calendar-range"
                    >
                      <q-card>
                        <q-card-section>
                          <p v-for="(item, index) in value" :key="index">
                            {{ item }}
                          </p>
                        </q-card-section>
                      </q-card>
                    </q-expansion-item>
                  </q-list>
                </q-expansion-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-md">
          <q-card>
            <q-card-section>
              <div class="text-h5">Dispositivos</div>
            </q-card-section>

            <q-card-section>
              <p>
                <q-select
                  v-model="devices.assigned_logical_devices_to_cid"
                  outlined
                  use-input
                  use-chips
                  emit-value
                  map-options
                  multiple
                  input-debounce="0"
                  label="Asignados"
                  :options="assignedDevices"
                  @filter="filterAssignedDevices"
                  @filter-abort="abortFilterAssignedDevices"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        No results
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </p>

              <p>
                <q-select
                  v-model="devices.default_logical_device"
                  outlined
                  label="Por defecto"
                />
              </p>
            </q-card-section>

            <q-card-actions>
              <q-btn
                class="full-width"
                color="primary"
                icon="mdi-content-save"
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>

      <div class="row q-pa-md">
        <q-btn icon="mdi-delete" color="negative" label="Borrar" />
      </div>
    </template>
  </q-page>
</template>

<script>
import { date, format } from 'quasar'
import Breadcrumbs from 'components/ui/Breadcrumbs'
import MigasLink from 'components/MigasLink'
import DateDiff from 'components/DateDiff'
import { elementMixin } from 'mixins/element'
import { MIGASFREE_SECONDS_MESSAGE_ALERT } from 'config/app.conf'

const { humanStorageSize } = format

export default {
  components: {
    Breadcrumbs,
    MigasLink,
    DateDiff
  },
  mixins: [elementMixin],
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
          text: 'Id'
        }
      ],
      loading: {
        inventory: false,
        history: false
      },
      element: {},
      syncInfo: {},
      softwareInventory: [],
      softwareHistory: {},
      devices: {},
      status: [],
      tags: [],
      assignedDevices: []
    }
  },
  async mounted() {
    await this.$axios
      .get(`/api/v1/token/computers/${this.$route.params.id}/`)
      .then((response) => {
        console.log(response)
        this.element = response.data
        this.breadcrumbs[4].text = this.element.__str__
        this.loadSyncInfo()
        this.loadDevices()
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error.response.data.detail)
      })

    await this.$axios
      .get('/api/v1/token/computers/status/')
      .then((response) => {
        Object.entries(response.data.choices).map(([key, val]) => {
          this.status.push({
            label: val,
            value: key,
            icon: this.elementIcon(key)
          })
        })
        console.log(this.status)
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error.response.data)
      })
  },
  methods: {
    humanStorageSize,

    async loadSyncInfo() {
      await this.$axios
        .get(`/api/v1/token/computers/${this.$route.params.id}/sync/`)
        .then((response) => {
          console.log(response)
          this.syncInfo = response.data
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error.response.data.detail)
        })
    },

    async loadDevices() {
      await this.$axios
        .get(`/api/v1/token/computers/${this.$route.params.id}/devices/`)
        .then((response) => {
          console.log(response)
          this.devices = response.data
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error.response.data.detail)
        })
    },

    async loadSoftwareInventory() {
      if (
        this.element.has_software_inventory &&
        this.softwareInventory.length === 0
      ) {
        this.loading.inventory = true
        await this.$axios
          .get(this.element.software_inventory)
          .then((response) => {
            this.softwareInventory = response.data
            this.loading.inventory = false
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error.response.data.detail)
            this.loading.inventory = false
          })
      }
    },

    async loadSoftwareHistory() {
      if (
        this.element.has_software_inventory &&
        Object.keys(this.softwareHistory).length === 0
      ) {
        this.loading.history = true
        await this.$axios
          .get(this.element.software_history)
          .then((response) => {
            this.softwareHistory = response.data
            this.loading.history = false
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error.response.data.detail)
            this.loading.history = false
          })
      }
    },

    showDate(isoString) {
      return date.formatDate(Date.parse(isoString), 'YYYY-MM-DD HH:mm:ss')
    },

    filterTags(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3) {
        abort()
        return
      }

      /* update(() => {
        const needle = val.toLowerCase()
        this.tags = stringOptions.filter(
          (v) => v.toLowerCase().indexOf(needle) > -1
        )
      }) */
    },

    abortFilterTags() {
      // console.log('delayed filter aborted')
    },

    filterAssignedDevices(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3) {
        abort()
        return
      }

      /* update(() => {
        const needle = val.toLowerCase()
        this.tags = stringOptions.filter(
          (v) => v.toLowerCase().indexOf(needle) > -1
        )
      }) */
    },

    abortFilterAssignedDevices() {
      // console.log('delayed filter aborted')
    }
  }
}
</script>

<style scoped>
.overflow {
  min-height: 6em;
  max-height: 15em;
  overflow: auto;
}
</style>
