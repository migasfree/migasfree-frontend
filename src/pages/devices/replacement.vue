<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" />

    <p v-translate>
      This procedure switches assigned computers between two devices.
    </p>

    <div class="row q-pa-md q-gutter-md">
      <div class="col-4 col-md">
        <q-card>
          <q-card-section>
            <div v-translate class="text-h5 q-mt-sm q-mb-xs">Source</div>

            <q-select
              v-model="source"
              outlined
              use-input
              map-options
              input-debounce="0"
              :label="$gettext('Device')"
              :options="devices"
              @filter="filterDevices"
              @filter-abort="abortFilterDevices"
              @input="loadInfo(source)"
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
                  {{ scope.opt.name }}
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
                    model="devices/devices"
                    :pk="scope.opt.id"
                    :value="scope.opt.name || ''"
                    icon="mdi-printer"
                  />
                </q-chip>
              </template>
            </q-select>
          </q-card-section>

          <q-card-section v-if="source">
            <ReplacementInfo :element="source" :is-loading="loading" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-4 col-md">
        <q-btn
          class="absolute-center vertical-top"
          color="primary"
          icon="mdi-arrow-right"
          icon-right="mdi-arrow-left"
          :label="$gettext('Replace')"
          :disabled="!isEnabled || loading"
          @click="replace"
        />
      </div>

      <div class="col-4 col-md">
        <q-card>
          <q-card-section>
            <div v-translate class="text-h5 q-mt-sm q-mb-xs">Target</div>

            <q-select
              v-model="target"
              outlined
              use-input
              map-options
              input-debounce="0"
              :label="$gettext('Device')"
              :options="devices"
              @filter="filterDevices"
              @filter-abort="abortFilterDevices"
              @input="loadInfo(target)"
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
                  {{ scope.opt.name }}
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
                    model="devices/devices"
                    :pk="scope.opt.id"
                    :value="scope.opt.name || ''"
                    icon="mdi-printer"
                  />
                </q-chip>
              </template>
            </q-select>
          </q-card-section>

          <q-card-section v-if="target">
            <ReplacementInfo :element="target" :is-loading="loading" />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'
import ReplacementInfo from 'components/device/ReplacementInfo'
import { elementMixin } from 'mixins/element'

export default {
  meta() {
    return {
      title: this.title
    }
  },
  components: {
    Breadcrumbs,
    Header,
    MigasLink,
    ReplacementInfo
  },
  mixins: [elementMixin],
  data() {
    return {
      title: this.$gettext('Devices Replacement'),
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: this.$gettext('Devices'),
          icon: 'mdi-printer-eye'
        },
        {
          text: this.$gettext('Devices'),
          icon: 'mdi-printer',
          to: 'devices-dashboard'
        },
        {
          text: this.$gettext('Devices Replacement'),
          icon: 'mdi-compare-horizontal'
        }
      ],
      devices: [],
      source: null,
      target: null,
      loading: false
    }
  },
  computed: {
    isEnabled() {
      return this.source !== null && this.target !== null
    }
  },
  methods: {
    filterDevices(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3) {
        abort()
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.$axios
          .get('/api/v1/token/devices/devices/', { params: { search: needle } })
          .then((response) => {
            this.devices = response.data.results
          })
        /* this.devices = stringOptions.filter(
          (v) => v.toLowerCase().indexOf(needle) > -1
        ) */
      })
    },

    abortFilterDevices() {
      // console.log('delayed filter aborted')
    },

    async loadInfo(obj) {
      if (obj !== null) {
        await this.$axios
          .get(`/api/v1/token/devices/logical/?device__id=${obj.id}`)
          .then((response) => {
            this.$set(obj, 'logical_devices', response.data.results)
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
      }
    },

    async replace() {
      if (this.source !== null && this.target !== null) {
        this.loading = true
        await this.$axios
          .post(
            `/api/v1/token/devices/devices/${this.source.id}/replacement/`,
            {
              target: this.target.id
            }
          )
          .then((response) => {
            let tmp = null

            tmp = this.source.logical_devices
            this.$set(
              this.source,
              'logical_devices',
              this.target.logical_devices
            )
            this.$set(this.target, 'logical_devices', tmp)

            this.$store.dispatch(
              'ui/notifySuccess',
              this.$gettext('Replacement done!')
            )
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
          .finally(() => (this.loading = false))
      }
    }
  }
}
</script>
