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
          <ComputerInfo
            :cid="element.id"
            :name="element.name"
            :fqdn="element.fqdn"
            :project="element.project"
            :created-at="element.created_at"
            :ip-address="element.ip_address"
            :forwarded-ip-address="element.forwarded_ip_address"
          />
        </div>

        <div class="col-md">
          <ComputerHardwareResume
            :cid="element.id"
            :last-hardware-capture="element.last_hardware_capture"
            :product="element.product"
            :product-system="element.product_system"
            :architecture="element.architecture"
            :uuid="element.uuid"
            :cpu="element.cpu"
            :ram="element.ram"
            :storage="element.storage"
            :disks="element.disks"
            :mac-address="element.mac_address"
          />
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
          <ComputerSoftware
            :inventory-url="element.software_inventory"
            :history-url="element.software_history"
          />
        </div>

        <div v-if="element.id" class="col-md">
          <ComputerDevices :cid="element.id" />
        </div>
      </div>

      <div class="row q-pa-md">
        <q-btn icon="mdi-delete" color="negative" label="Borrar" />
      </div>
    </template>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import MigasLink from 'components/MigasLink'
import DateDiff from 'components/DateDiff'
import ComputerInfo from 'components/computer/Info'
import ComputerHardwareResume from 'components/computer/HardwareResume'
import ComputerSoftware from 'components/computer/Software'
import ComputerDevices from 'components/computer/Devices'
import { elementMixin } from 'mixins/element'
import { dateMixin } from 'mixins/date'
import { MIGASFREE_SECONDS_MESSAGE_ALERT } from 'config/app.conf'

export default {
  components: {
    Breadcrumbs,
    MigasLink,
    DateDiff,
    ComputerInfo,
    ComputerHardwareResume,
    ComputerSoftware,
    ComputerDevices
  },
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
          text: 'Id'
        }
      ],
      element: {},
      syncInfo: {},
      status: [],
      tags: []
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
