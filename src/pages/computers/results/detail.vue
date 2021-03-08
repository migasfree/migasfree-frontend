<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <template v-if="element.id">
      <Header :title="$gettext('Computer')">
        <template v-if="element.id" #append
          >:
          <MigasLink
            model="computers"
            :pk="element.id"
            :value="element.__str__ || ''"
            :icon="elementIcon(element.status)"
            :tooltip="element.summary"
          />
        </template>
      </Header>

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
              <div v-translate class="text-h5">Current Situation</div>
            </q-card-section>

            <q-card-section>
              <p>
                <q-select
                  v-model="element.status"
                  outlined
                  emit-value
                  map-options
                  :label="$gettext('Status')"
                  :options="status"
                >
                  <template #option="scope">
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

                  <template #selected-item="scope">
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
                  :label="$gettext('Comment')"
                />
              </p>

              <p>
                <q-select
                  v-model="element.tags"
                  outlined
                  use-input
                  map-options
                  multiple
                  input-debounce="0"
                  :label="$gettext('Tags')"
                  :options="tags"
                  @filter="filterTags"
                  @filter-abort="abortFilterTags"
                >
                  <template #no-option>
                    <q-item>
                      <q-item-section v-translate class="text-grey">
                        No results
                      </q-item-section>
                    </q-item>
                  </template>

                  <template #option="scope">
                    <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                      {{ attributeValue(scope.opt) }}
                    </q-item>
                  </template>

                  <template #selected-item="scope">
                    <q-chip
                      removable
                      dense
                      :tabindex="scope.tabindex"
                      class="q-ma-md"
                      @remove="scope.removeAtIndex(scope.index)"
                    >
                      <MigasLink
                        model="tags"
                        :pk="scope.opt.id"
                        :value="attributeValue(scope.opt)"
                        icon="mdi-tag"
                      />
                    </q-chip>
                  </template>
                </q-select>
              </p>

              <OverflowList
                :label="$gettext('Attributes Sets')"
                icon="mdi-set-none"
                :items="onlyAttributeSets"
                model="attributes"
              />

              <div class="row q-pa-md text-center">
                <div class="col-md">
                  <q-tooltip><translate>Errors</translate></q-tooltip>
                  <q-icon name="mdi-bug" size="xl" />
                  <q-btn
                    round
                    size="md"
                    color="negative"
                    text-color="white"
                    :to="{
                      name: 'errors-list',
                      query: { computer_id: element.id, checked: false }
                    }"
                    >{{ errors.unchecked }}</q-btn
                  >
                  /
                  <q-btn
                    round
                    size="md"
                    color="grey-3"
                    text-color="black"
                    :to="{
                      name: 'errors-list',
                      query: { computer_id: element.id }
                    }"
                    >{{ errors.total }}</q-btn
                  >
                </div>

                <div class="col-md">
                  <q-tooltip><translate>Faults</translate></q-tooltip>
                  <q-icon name="mdi-bomb" size="xl" />
                  <q-btn
                    round
                    size="md"
                    color="negative"
                    text-color="white"
                    :to="{
                      name: 'faults-list',
                      query: { computer_id: element.id, checked: false }
                    }"
                    >{{ faults.unchecked }}</q-btn
                  >
                  /
                  <q-btn
                    round
                    size="md"
                    color="grey-3"
                    text-color="black"
                    :to="{
                      name: 'faults-list',
                      query: { computer_id: element.id }
                    }"
                    >{{ faults.total }}</q-btn
                  >
                </div>
              </div>
            </q-card-section>

            <q-card-actions>
              <q-btn
                class="full-width"
                color="primary"
                icon="mdi-content-save-edit"
                :label="$gettext('Save and continue editing')"
                :loading="loading"
                :disabled="loading"
                @click="updateCurrentSituation"
              />
            </q-card-actions>
          </q-card>
        </div>

        <div class="col-md">
          <q-card>
            <q-card-section>
              <div class="row">
                <div class="col">
                  <div v-translate class="text-h5">Synchronization</div>
                </div>

                <div v-if="element.id" class="col-auto">
                  <DateDiff
                    :begin="new Date(element.sync_end_date)"
                    :tooltip="$gettext('unsynchronized from')"
                  />
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div v-if="element.sync_user" class="row q-pa-md">
                <q-tooltip self="bottom middle"
                  ><translate>User</translate></q-tooltip
                >
                <MigasLink
                  model="users"
                  :pk="element.sync_user.id"
                  :value="element.sync_user.__str__ || ''"
                  icon="mdi-account"
                />
              </div>

              <div
                v-if="loadingSync || Object.keys(syncInfo).length == 0"
                class="justify-center"
              >
                <q-spinner-dots color="primary" size="3em" />
              </div>

              <template v-else>
                <div class="row q-pa-md items-baseline">
                  <div class="col-md">
                    <q-tooltip self="bottom middle"
                      ><translate>sync start date</translate></q-tooltip
                    >
                    <q-icon name="mdi-play" size="sm" class="vertical-middle" />
                    <span class="vertical-middle">
                      {{ showDate(syncInfo.sync_start_date) }}</span
                    >
                  </div>

                  <div class="col-md">
                    <q-tooltip self="bottom middle"
                      ><translate>sync end date</translate></q-tooltip
                    >
                    <q-icon name="mdi-stop" size="sm" class="vertical-middle" />
                    <span class="vertical-middle">
                      {{ showDate(syncInfo.sync_end_date) }}</span
                    >
                  </div>

                  <div class="col-auto">
                    <DateDiff
                      v-if="syncInfo.sync_start_date"
                      class="vertical-middle"
                      :begin="new Date(syncInfo.sync_start_date)"
                      :end="new Date(syncInfo.sync_end_date)"
                      :tooltip="$gettext('last sync time')"
                    />
                  </div>
                </div>

                <OverflowList
                  :label="$gettext('Attributes')"
                  icon="mdi-pound"
                  :items="onlyAttributes"
                  model="attributes"
                />
              </template>
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
        <q-btn
          flat
          icon="mdi-delete"
          color="negative"
          :label="$gettext('Delete')"
          @click="confirmRemove = true"
        />
      </div>

      <RemoveDialog
        v-model="confirmRemove"
        @confirmed="remove"
        @canceled="confirmRemove = !confirmRemove"
      />
    </template>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import OverflowList from 'components/ui/OverflowList'
import RemoveDialog from 'components/ui/RemoveDialog'
import MigasLink from 'components/MigasLink'
import DateDiff from 'components/DateDiff'
import ComputerInfo from 'components/computer/Info'
import ComputerHardwareResume from 'components/computer/HardwareResume'
import ComputerSoftware from 'components/computer/Software'
import ComputerDevices from 'components/computer/Devices'
import { elementMixin } from 'mixins/element'
import { dateMixin } from 'mixins/date'
import { detailMixin } from 'mixins/detail'
import { MIGASFREE_SECONDS_MESSAGE_ALERT } from 'config/app.conf'

export default {
  meta() {
    return {
      title: this.title
    }
  },
  components: {
    Breadcrumbs,
    Header,
    OverflowList,
    RemoveDialog,
    MigasLink,
    DateDiff,
    ComputerInfo,
    ComputerHardwareResume,
    ComputerSoftware,
    ComputerDevices
  },
  mixins: [elementMixin, dateMixin, detailMixin],
  data() {
    const route = 'computers-list'
    const title = this.$gettext('Computer')

    return {
      title,
      originalTitle: title,
      model: 'computers',
      listRoute: route,
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
        }
      ],
      element: {},
      syncInfo: {},
      onlyAttributes: [],
      onlyAttributeSets: [],
      status: [],
      tags: [],
      errors: {},
      faults: {},
      loading: false,
      loadingSync: false,
      confirmRemove: false
    }
  },
  computed: {
    elementText() {
      return this.element.__str__
    }
  },
  async mounted() {
    await this.$axios
      .get(`/api/v1/token/${this.model}/${this.$route.params.id}/`)
      .then((response) => {
        this.element = response.data
        this.loadSyncInfo()
        this.loadErrors()
        this.loadFaults()
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
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
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })
  },
  methods: {
    async loadSyncInfo() {
      this.loadingSync = true
      await this.$axios
        .get(`/api/v1/token/${this.model}/${this.$route.params.id}/sync/`)
        .then((response) => {
          this.syncInfo = response.data
          Object.entries(response.data.sync_attributes).map(([key, val]) => {
            if (val.property_att.prefix === 'SET') {
              this.onlyAttributeSets.push({
                id: val.id,
                value: this.attributeValue(val),
                icon: 'mdi-set-none'
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
          this.loadingSync = false
        })
    },

    async loadErrors() {
      await this.$axios
        .get(`/api/v1/token/${this.model}/${this.$route.params.id}/errors/`)
        .then((response) => {
          this.errors = response.data
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    async loadFaults() {
      await this.$axios
        .get(`/api/v1/token/${this.model}/${this.$route.params.id}/faults/`)
        .then((response) => {
          this.faults = response.data
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    filterTags(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3) {
        abort()
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.$axios
          .get('/api/v1/token/tags/', { params: { search: needle } })
          .then((response) => {
            this.tags = response.data.results
          })
        /* this.tags = stringOptions.filter(
          (v) => v.toLowerCase().indexOf(needle) > -1
        ) */
      })
    },

    abortFilterTags() {
      // console.log('delayed filter aborted')
    },

    async updateCurrentSituation() {
      this.loading = true
      await this.$axios
        .patch(`/api/v1/token/${this.model}/${this.element.id}/`, {
          status: this.element.status,
          comment: this.element.comment,
          tags: this.element.tags.map((item) => item.id)
        })
        .then((response) => {
          this.$store.dispatch(
            'ui/notifySuccess',
            this.$gettext('Current Situation has been changed!')
          )
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
        .finally(() => (this.loading = false))
    }
  }
}
</script>
