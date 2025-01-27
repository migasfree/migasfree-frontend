<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h5">{{ $gettext('Devices') }}</div>

      <div v-if="Object.keys(devices).length == 0" class="justify-center">
        <q-spinner-dots color="primary" size="3em" />
      </div>

      <template v-else>
        <q-select
          v-model="devices.assigned_logical_devices_to_cid"
          class="q-my-md"
          outlined
          use-input
          use-chips
          map-options
          multiple
          counter
          input-debounce="0"
          :label="$gettext('Assigned')"
          :hint="
            $gettext('Type to search (minimum %{num} characters)', {
              num: MIN_CHARS_SEARCH,
            })
          "
          :options="assignedDevices"
          @filter="filterAssignedDevices"
          @filter-abort="abortFilterAssignedDevices"
          @update:model-value="updateDefaultLogicalDeviceSelect"
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                {{ $gettext('No results') }}
              </q-item-section>
            </q-item>
          </template>

          <template #option="scope">
            <q-item v-bind="scope.itemProps">
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
              />
            </q-chip>
          </template>
        </q-select>

        <template v-if="devices.assigned_logical_devices_to_cid.length">
          <q-select
            v-model="devices.default_logical_device"
            class="q-my-md"
            outlined
            clearable
            :options="defaultLogicalDevices"
            :label="$gettext('By default')"
          />
        </template>
      </template>
    </q-card-section>

    <q-card-actions class="q-px-md">
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
import { ref, reactive, onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'
import { MIN_CHARS_SEARCH } from 'config/app.conf'

import MigasLink from 'components/MigasLink'

export default {
  name: 'ComputerDevices',
  components: {
    MigasLink,
  },
  props: {
    cid: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const { $gettext } = useGettext()
    const uiStore = useUiStore()

    const loading = ref(false)
    const devices = reactive({})
    const assignedDevices = ref([])
    const defaultLogicalDevices = ref([])

    const updateDefaultLogicalDeviceSelect = () => {
      defaultLogicalDevices.value = []
      devices.assigned_logical_devices_to_cid.forEach((item) => {
        defaultLogicalDevices.value.push({ id: item.id, label: item.__str__ })
      })
    }

    const loadDevices = async () => {
      loading.value = true
      await api
        .get(`/api/v1/token/computers/${props.cid}/devices/`)
        .then((response) => {
          Object.assign(devices, response.data)
          updateDefaultLogicalDeviceSelect()

          devices.default_logical_device = defaultLogicalDevices.value.find(
            (x) => x.id === devices.default_logical_device,
          )
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
        .finally(() => {
          loading.value = false
        })
    }

    const updateDevices = async () => {
      loading.value = true
      await api
        .patch(`/api/v1/token/computers/${props.cid}/`, {
          default_logical_device:
            devices.default_logical_device !== undefined &&
            devices.default_logical_device !== null
              ? devices.default_logical_device.id
              : null,
          assigned_logical_devices_to_cid:
            devices.assigned_logical_devices_to_cid.map((item) => item.id),
        })
        .then(() => {
          uiStore.notifySuccess($gettext('Devices have been changed!'))
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
        .finally(() => (loading.value = false))
    }

    const filterAssignedDevices = async (val, update, abort) => {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < MIN_CHARS_SEARCH) {
        abort()
        return
      }

      await api
        .get(`/api/v1/token/devices/logical/`, {
          params: { search: val.toLowerCase() },
        })
        .then((response) => {
          assignedDevices.value = response.data.results
        })

      update(() => {})
    }

    const abortFilterAssignedDevices = () => {
      // console.log('delayed filter aborted')
    }

    onMounted(async () => {
      await loadDevices()
    })

    return {
      loading,
      devices,
      assignedDevices,
      defaultLogicalDevices,
      updateDevices,
      updateDefaultLogicalDeviceSelect,
      filterAssignedDevices,
      abortFilterAssignedDevices,
      MIN_CHARS_SEARCH,
    }
  },
}
</script>
