<template>
  <q-card class="panel devices-card overflow-hidden">
    <q-card-section class="q-pa-lg">
      <!-- Header -->
      <div class="panel-header row items-center justify-between q-mb-xl">
        <h2 class="panel-title">
          {{ $gettext('Devices') }}
        </h2>
      </div>

      <div
        v-if="Object.keys(devices).length === 0"
        class="flex flex-center q-pa-xl"
      >
        <q-spinner-dots color="primary" size="3em" />
      </div>

      <template v-else>
        <div class="column q-gutter-y-lg">
          <!-- Assigned Devices MultiSelect -->
          <FilteredMultiSelect
            v-model="devices.assigned_logical_devices_to_cid"
            use-chips
            :label="$gettext('Assigned')"
            :fetch-options="filterAssignedDevices"
            class="q-mt-sm"
            @update:model-value="updateDefaultLogicalDeviceSelect"
          >
            <template #option="{ scope }">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon name="mdi-devices" size="sm" color="grey-6" />
                </q-item-section>
                <q-item-section>
                  {{ scope.opt.__str__ }}
                </q-item-section>
              </q-item>
            </template>

            <template #selected-item="{ scope }">
              <q-chip
                removable
                dense
                outline
                color="transparent"
                :tabindex="scope.tabindex"
                class="q-ma-sm q-pa-none"
                @remove="scope.removeAtIndex(scope.index)"
              >
                <MigasLink
                  model="devices/logical"
                  :pk="scope.opt.id"
                  :value="scope.opt.__str__"
                />
              </q-chip>
            </template>
          </FilteredMultiSelect>

          <!-- Default Device Selection -->
          <q-slide-transition>
            <div
              v-if="devices.assigned_logical_devices_to_cid.length"
              class="glass-panel q-pa-md"
            >
              <div class="section-label q-mb-sm text-primary">
                <q-icon name="mdi-star" class="q-mr-xs" />
                {{ $gettext('Primary Device') }}
              </div>
              <q-select
                v-model="devices.default_logical_device"
                dense
                outlined
                clearable
                :options="defaultLogicalDevices"
                :label="$gettext('Set as default')"
                class="bg-surface rounded-borders overflow-hidden"
              >
                <template #prepend>
                  <q-icon name="mdi-check-circle-outline" size="xs" />
                </template>
              </q-select>
              <div class="text-caption opacity-50 q-mt-sm q-ml-xs">
                {{
                  $gettext(
                    'Select which of the assigned devices is the primary for this computer.',
                  )
                }}
              </div>
            </div>
          </q-slide-transition>
        </div>
      </template>
    </q-card-section>

    <!-- Actions -->
    <q-card-actions class="row justify-center q-px-lg q-pb-lg q-mt-md">
      <q-btn
        unelevated
        color="primary"
        :icon="appIcon('save-edit')"
        :loading="loading"
        :disabled="loading"
        class="full-width"
        :label="$gettext('Save and continue editing')"
        @click="updateDevices"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'
import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'
import { appIcon } from 'composables/element'
import FilteredMultiSelect from 'components/ui/FilteredMultiSelect.vue'
import MigasLink from 'components/MigasLink.vue'

defineOptions({ name: 'ComputerDevices' })

const props = defineProps({
  cid: { type: Number, required: true },
})

const { $gettext } = useGettext()
const uiStore = useUiStore()

const loading = ref(false)
const devices = reactive({})
const defaultLogicalDevices = ref([])

const updateDefaultLogicalDeviceSelect = () => {
  defaultLogicalDevices.value = devices.assigned_logical_devices_to_cid.map(
    (item) => ({
      id: item.id,
      label: item.__str__,
    }),
  )
}

const loadDevices = async () => {
  loading.value = true
  try {
    const { data } = await api.get(
      `/api/v1/token/computers/${props.cid}/devices/`,
    )
    Object.assign(devices, data)

    updateDefaultLogicalDeviceSelect()

    if (devices.default_logical_device) {
      devices.default_logical_device = defaultLogicalDevices.value.find(
        (x) => x.id === devices.default_logical_device,
      )
    }
  } catch (error) {
    uiStore.notifyError(error)
  } finally {
    loading.value = false
  }
}

const updateDevices = async () => {
  loading.value = true
  try {
    await api.patch(`/api/v1/token/computers/${props.cid}/`, {
      default_logical_device: devices.default_logical_device?.id ?? null,
      assigned_logical_devices_to_cid:
        devices.assigned_logical_devices_to_cid.map((item) => item.id),
    })
    uiStore.notifySuccess($gettext('Devices have been changed!'))
  } catch (error) {
    uiStore.notifyError(error)
  } finally {
    loading.value = false
  }
}

const filterAssignedDevices = async (val) => {
  const { data } = await api.get('/api/v1/token/devices/logical/', {
    params: { search: val.toLowerCase() },
  })
  return data.results
}

onMounted(loadDevices)
</script>

<style scoped>
.devices-card {
  max-width: 1000px;
  margin: auto;
}

.bg-surface {
  background: rgba(var(--brand-primary-rgb), 0.02);
}

[data-theme='dark'] .bg-surface {
  background: rgba(0, 0, 0, 0.15);
}
</style>
