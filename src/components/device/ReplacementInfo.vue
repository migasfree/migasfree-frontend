<template>
  <transition name="info">
    <div
      v-if="element && !isLoading && !loading"
      class="replacement-info-container"
    >
      <div class="info-section">
        <div class="info-item">
          <q-icon
            :name="modelIcon('devices/devices')"
            size="xs"
            color="primary"
          />
          <span class="label">{{ $gettext('Device') }}:</span>
          <span class="value">{{ element.name }}</span>
          <span
            v-if="element.location"
            class="location text-caption text-muted q-ml-xs"
          >
            ({{ element.location }})
          </span>
        </div>
      </div>

      <div
        v-if="element.logical_devices && element.logical_devices.length > 0"
        class="info-section"
      >
        <div class="section-title">
          <q-icon
            :name="modelIcon('logical-devices')"
            size="xs"
            class="q-mr-xs"
          />
          {{ $gettext('Computers in Logical Devices (by Capability)') }}
        </div>

        <div class="capability-groups">
          <div
            v-for="item in mutableElement.logical_devices"
            :key="item.id"
            class="capability-group q-mb-md"
          >
            <div class="capability-header flex items-center q-mb-sm">
              <q-icon
                :name="modelIcon('devices/capabilities')"
                size="14px"
                color="secondary"
                class="q-mr-xs"
              />
              <MigasLink
                model="devices/capabilities"
                :pk="item.capability.id"
                :value="item.capability.name"
                class="capability-link"
              />
            </div>

            <div class="computer-list q-pl-md">
              <div
                v-if="item.computers && item.computers.length > 0"
                class="row q-col-gutter-xs"
              >
                <div
                  v-for="computer in item.computers"
                  :key="computer.id"
                  class="col-12"
                >
                  <div class="computer-item">
                    <MigasLink
                      model="computers"
                      :pk="computer.id"
                      :value="computer.__str__ || ''"
                      :icon="elementIcon(computer.status)"
                      :tooltip="computer.summary"
                    />
                  </div>
                </div>
              </div>
              <div v-else class="text-caption text-muted italic q-py-xs">
                {{ $gettext('No computers found') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="isLoading || loading"
      class="loading-container flex flex-center"
    >
      <q-spinner-dots color="primary" size="3em" />
    </div>
  </transition>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { api } from 'boot/axios'
import MigasLink from 'components/MigasLink'
import { useElement } from 'composables/element'
import { modelIcon } from 'composables/element'

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

const { elementIcon } = useElement()

const mutableElement = ref(null)
const loading = ref(false)

const loadComputers = async () => {
  if (
    !mutableElement.value?.logical_devices ||
    mutableElement.value.logical_devices.length === 0
  ) {
    loading.value = false
    return
  }

  for (const item of mutableElement.value.logical_devices) {
    if ('attributes' in item && item.attributes.length > 0) {
      const computers = []

      const attrPromises = item.attributes.map(async (att) => {
        if (att.property_att.prefix === 'CID') {
          try {
            const response = await api.get(
              `/api/v1/token/computers/${parseInt(att.value)}`,
            )
            computers.push(response.data)
          } catch (e) {
            console.error('Error loading computer', e)
          }
        }
      })

      await Promise.all(attrPromises)
      item.computers = computers
    } else {
      item.computers = []
    }
  }
  loading.value = false
}

watch(
  () => props.element,
  (val) => {
    if (val) {
      mutableElement.value = reactive({ ...val })
      loading.value = true
      loadComputers()
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
  gap: 16px;
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
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-item .label {
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.9rem;
}

.info-item .value {
  font-weight: 600;
  color: var(--text-main);
}

.capability-header {
  font-size: 0.85rem;
  font-weight: 600;
}

.capability-link {
  color: var(--brand-secondary);
  text-decoration: none;
}

.computer-item {
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s ease;
  font-size: 0.9rem;
}

.computer-item:hover {
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
