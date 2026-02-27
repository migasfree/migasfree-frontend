<template>
  <transition name="info">
    <div v-if="element && !isLoading" class="replacement-info-container">
      <div class="info-section">
        <div class="info-item">
          <q-icon :name="appIcon('computers')" size="xs" color="primary" />
          <span class="label">{{ $gettext('Computer') }}:</span>
          <span class="value">{{ element.__str__ }}</span>
        </div>

        <div class="info-item">
          <q-icon
            :name="elementIcon(element.status)"
            size="xs"
            color="primary"
          />
          <span class="label">{{ $gettext('Status') }}:</span>
          <span class="value">{{ computerStatus(element.status) }}</span>
        </div>
      </div>

      <div v-if="element.tags && element.tags.length > 0" class="info-section">
        <div class="section-title">
          <q-icon :name="modelIcon('tags')" size="xs" class="q-mr-xs" />
          {{ $gettext('Tags') }}
        </div>
        <div class="tag-list row q-gutter-xs">
          <q-chip
            v-for="tag in element.tags"
            :key="tag.id"
            dense
            outline
            color="transparent"
          >
            <MigasLink model="tags" :pk="tag.id" :value="attributeValue(tag)" />
          </q-chip>
        </div>
      </div>

      <div v-if="element.devices" class="info-section">
        <div class="section-title">
          <q-icon
            :name="modelIcon('logical-devices')"
            size="xs"
            class="q-mr-xs"
          />
          {{ $gettext('Logical Devices') }}
        </div>

        <div
          v-if="element.devices.default_logical_device"
          class="info-item mini q-mb-sm"
        >
          <q-icon name="mdi-star" size="14px" color="warning" />
          <span class="label">{{ $gettext('Default Device') }}:</span>
          <span class="value">{{ defaultDevice(element.devices) }}</span>
        </div>

        <div
          v-if="element.devices.assigned_logical_devices_to_cid.length > 0"
          class="device-group"
        >
          <div
            v-for="device in element.devices.assigned_logical_devices_to_cid"
            :key="device.id"
            class="device-item"
          >
            <MigasLink
              model="devices/logical"
              :pk="device.id"
              :value="device.__str__"
              icon="mdi-arrow-right"
            />
          </div>
        </div>

        <div
          v-if="element.devices.inflicted_logical_devices.length > 0"
          class="inflicted-section q-mt-md"
        >
          <div class="section-subtitle">
            {{ $gettext('Inflicted Devices') }}
          </div>
          <div class="device-group">
            <div
              v-for="device in element.devices.inflicted_logical_devices"
              :key="device.id"
              class="device-item"
            >
              <MigasLink
                model="devices/logical"
                :pk="device.id"
                :value="device.__str__"
                icon="mdi-flash-outline"
                color="orange"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="isLoading" class="loading-container flex flex-center">
      <q-spinner-dots color="primary" size="3em" />
    </div>
  </transition>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'
import MigasLink from 'components/MigasLink'
import { useElement } from 'composables/element'
import { appIcon, modelIcon } from 'composables/element'

const props = defineProps({
  element: {
    type: Object,
    required: false,
    default: null,
  },
  isLoading: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const uiStore = useUiStore()
const { attributeValue, computerStatus, elementIcon } = useElement()

const mutableElement = ref(null)
const loading = ref(false)

const loadDevices = async () => {
  if (!mutableElement.value) return

  loading.value = true
  try {
    const { data } = await api.get(
      `/api/v1/token/computers/${mutableElement.value.id}/devices/`,
    )
    mutableElement.value.devices = data
  } catch (error) {
    uiStore.notifyError(error)
  } finally {
    loading.value = false
  }
}

const defaultDevice = (devices) => {
  const defaultLogicalDeviceId = devices.default_logical_device
  const assignedDevice = devices.assigned_logical_devices_to_cid.find(
    (device) => device.id === defaultLogicalDeviceId,
  )
  if (assignedDevice) return assignedDevice.__str__

  const inflictedDevice = devices.inflicted_logical_devices.find(
    (device) => device.id === defaultLogicalDeviceId,
  )
  if (inflictedDevice) return inflictedDevice.__str__

  return null
}

watch(
  () => props.element,
  (val) => {
    if (val) {
      mutableElement.value = reactive({ ...val })
      loadDevices()
    } else {
      mutableElement.value = null
      loading.value = false
    }
  },
  { immediate: true, deep: true },
)
</script>

<style scoped>
.replacement-info-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-section {
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.info-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.section-subtitle {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.info-item.mini {
  font-size: 0.9rem;
}

.info-item .label {
  color: var(--text-muted);
  font-weight: 500;
}

.info-item .value {
  font-weight: 600;
  color: var(--text-main);
}

.tag-list {
  padding-left: 4px;
}

.device-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.device-item {
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.device-item:hover {
  background: rgba(var(--brand-primary-rgb), 0.05);
}

.loading-container {
  min-height: 150px;
}

/* Transitions */
.info-enter-active {
  transition: all 0.5s ease;
}
.info-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.info-enter-from,
.info-leave-to {
  transform: translateY(10px);
  opacity: 0;
}

[data-theme='dark'] .info-section {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}
</style>
