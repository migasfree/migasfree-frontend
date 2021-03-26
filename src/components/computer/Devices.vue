<template>
  <q-card>
    <q-card-section>
      <div v-translate class="text-h5">Devices</div>
    </q-card-section>

    <q-card-section>
      <div v-if="Object.keys(devices).length == 0" class="justify-center">
        <q-spinner-dots color="primary" size="3em" />
      </div>

      <template v-else>
        <p>
          <q-select
            v-model="devices.assigned_logical_devices_to_cid"
            outlined
            use-input
            use-chips
            map-options
            multiple
            counter
            input-debounce="0"
            :label="$gettext('Assigned')"
            :options="assignedDevices"
            @filter="filterAssignedDevices"
            @filter-abort="abortFilterAssignedDevices"
            @input="updateDefaultLogicalDeviceSelect"
          >
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">
                  <translate>No results</translate>
                </q-item-section>
              </q-item>
            </template>

            <template #option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                {{ scope.opt.__str__ }}
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
                  model="devices/logical"
                  :pk="scope.opt.id"
                  :value="scope.opt.__str__"
                  icon="mdi-printer-settings"
                />
              </q-chip>
            </template>
          </q-select>
        </p>

        <p>
          <q-select
            v-model="devices.default_logical_device"
            outlined
            :options="defaultLogicalDevices"
            :label="$gettext('By default')"
          />
        </p>
      </template>
    </q-card-section>

    <q-card-actions>
      <q-btn
        class="full-width"
        color="primary"
        icon="mdi-content-save-edit"
        :loading="loading"
        :disabled="loading"
        :label="$gettext('Save and continue editing')"
        @click="updateDevices"
      />
    </q-card-actions>
  </q-card>
</template>

<script>
import MigasLink from 'components/MigasLink'

export default {
  name: 'ComputerDevices',
  components: {
    MigasLink
  },
  props: {
    cid: {
      type: Number,
      required: true
    }
  },

  data() {
    return {
      loading: false,
      devices: {},
      assignedDevices: [],
      defaultLogicalDevices: []
    }
  },
  async mounted() {
    await this.loadDevices()
  },
  methods: {
    async loadDevices() {
      this.loading = true
      await this.$axios
        .get(`/api/v1/token/computers/${this.cid}/devices/`)
        .then((response) => {
          this.devices = response.data
          this.updateDefaultLogicalDeviceSelect()

          this.devices.default_logical_device = this.defaultLogicalDevices.find(
            (x) => x.id === this.devices.default_logical_device
          )
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
        .finally(() => {
          this.loading = false
        })
    },

    async updateDevices() {
      this.loading = true
      await this.$axios
        .patch(`/api/v1/token/computers/${this.cid}/`, {
          default_logical_device: this.devices.default_logical_device.id,
          assigned_logical_devices_to_cid: this.devices.assigned_logical_devices_to_cid.map(
            (item) => item.id
          )
        })
        .then((response) => {
          this.$store.dispatch(
            'ui/notifySuccess',
            this.$gettext('Devices have been changed!')
          )
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
        .finally(() => (this.loading = false))
    },

    filterAssignedDevices(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3) {
        abort()
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.$axios
          .get(`/api/v1/token/devices/logical/`, { params: { search: needle } })
          .then((response) => {
            this.assignedDevices = response.data.results
          })
        /* this.assignedDevices = stringOptions.filter(
          (v) => v.toLowerCase().indexOf(needle) > -1
        ) */
      })
    },

    abortFilterAssignedDevices() {
      // console.log('delayed filter aborted')
    },

    updateDefaultLogicalDeviceSelect() {
      this.defaultLogicalDevices = []
      this.devices.assigned_logical_devices_to_cid.forEach((item) => {
        this.defaultLogicalDevices.push({ id: item.id, label: item.__str__ })
      })
    }
  }
}
</script>
