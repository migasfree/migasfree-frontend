<template>
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
          map-options
          multiple
          input-debounce="0"
          label="Asignados"
          :options="assignedDevices"
          @filter="filterAssignedDevices"
          @filter-abort="abortFilterAssignedDevices"
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
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
              color="white"
              class="q-ma-md"
              @remove="scope.removeAtIndex(scope.index)"
            >
              <MigasLink
                model="devices/devices"
                :pk="scope.opt.id"
                :value="scope.opt.name"
              />
            </q-chip>
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
        label="Grabar y seguir editando"
        icon="mdi-content-save-edit"
        :loading="loading"
        :disabled="loading"
        @click="updateDevices"
      />
    </q-card-actions>
  </q-card>
</template>

<script>
export default {
  name: 'ComputerDevices',
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
      assignedDevices: []
    }
  },
  async mounted() {
    await this.loadDevices()
  },
  methods: {
    async loadDevices() {
      await this.$axios
        .get(`/api/v1/token/computers/${this.cid}/devices/`)
        .then((response) => {
          this.devices = response.data
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error.response.data.detail)
        })
    },

    async updateDevices() {
      this.loading = true
      await this.$axios
        .patch(`/api/v1/token/computers/${this.cid}/`, {
          // default_logical_device: , TODO
          // assigned_logical_devices_to_cid: TODO
        })
        .then((response) => {
          this.$store.dispatch('ui/notifySuccess', 'Devices have been changed!')
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
