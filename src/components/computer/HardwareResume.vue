<template>
  <q-card class="panel hardware-card overflow-hidden">
    <q-card-section class="q-pa-md">
      <!-- Header with Title and Capture Date -->
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6 text-weight-bold text-primary">
          {{ $gettext('Hardware') }}
        </div>
        <div class="capture-info row items-center no-wrap">
          <!-- Display Mode -->
          <div
            v-if="readonly || !editingDate"
            class="row items-center no-wrap date-display-group"
          >
            <DateView
              :value="hardwareDate"
              icon="mdi-calendar-star"
              class="q-mr-sm"
            />
            <DateDiff
              v-if="hardwareDate"
              :begin="new Date(hardwareDate)"
              :tooltip="$gettext('unsynchronized from')"
              class="capture-badge"
            />
            <q-tooltip>{{ $gettext('Last hardware capture date') }}</q-tooltip>

            <template v-if="!readonly">
              <q-btn
                flat
                round
                dense
                icon="mdi-pencil-outline"
                size="sm"
                class="edit-trigger opacity-40 q-ml-xs"
                @click="startDateEdit"
              >
                <q-tooltip>{{ $gettext('Edit date') }}</q-tooltip>
              </q-btn>
              <q-btn
                v-if="hardwareDate"
                flat
                round
                dense
                icon="mdi-delete-outline"
                size="sm"
                class="opacity-30 q-ml-xs"
                @click="clearDate"
              >
                <q-tooltip>{{ $gettext('Clear date') }}</q-tooltip>
              </q-btn>
            </template>
          </div>

          <!-- Edit Mode -->
          <div
            v-if="!readonly && editingDate"
            class="row items-center no-wrap date-edit-container"
          >
            <q-input
              v-model="hardwareDate"
              dense
              borderless
              class="date-input"
              :placeholder="$gettext('No date')"
              @keyup.enter="saveDate"
              @keyup.esc="cancelDateEdit"
            >
              <template #prepend>
                <q-icon
                  name="mdi-calendar-edit"
                  size="18px"
                  color="brand-primary"
                  class="cursor-pointer"
                >
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      v-model="hardwareDate"
                      mask="YYYY-MM-DD HH:mm:ss"
                      outlined
                      landscape
                      today-btn
                      flat
                      :locale="localeDate"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-btn
              flat
              round
              dense
              icon="check"
              color="positive"
              size="sm"
              :loading="loading"
              @click="saveDate"
            >
              <q-tooltip>{{ $gettext('Save') }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="close"
              color="negative"
              size="sm"
              @click="cancelDateEdit"
            >
              <q-tooltip>{{ $gettext('Cancel') }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>

      <!-- Hero Section: Product & Model -->
      <div class="glass-panel q-pa-lg q-mb-lg">
        <div class="row items-center no-wrap full-width">
          <!-- Product Icon -->
          <div class="hero-icon-section flex-center q-mr-md gt-xs">
            <q-icon
              :name="productIcon(productSystem)"
              size="28px"
              color="brand-primary"
            />
          </div>

          <div class="col overflow-hidden">
            <div v-if="readonly" class="text-h4 text-weight-medium">
              <TextTooltip :text="product" />
              <q-tooltip>{{ productSystem }}</q-tooltip>
            </div>
            <q-btn
              v-else
              no-caps
              flat
              align="left"
              color="primary"
              class="text-h5 text-weight-bold product-link-btn"
              :label="product"
              @click="
                $router.push({
                  name: 'computer-hardware',
                  params: { id: cid },
                })
              "
            >
              <q-tooltip
                >{{ productSystem }} ({{
                  $gettext('Hardware Information')
                }})</q-tooltip
              >
            </q-btn>

            <!-- Subtitle: productSystem + UUID -->
            <div class="row items-center no-wrap q-mt-xs q-gutter-x-md">
              <div
                v-if="productSystem"
                class="text-body2 opacity-50 text-weight-bold"
              >
                {{ productSystem }}
              </div>
              <div
                v-if="uuid"
                class="row items-center no-wrap text-mono opacity-40 uuid-metrics"
              >
                <q-icon name="mdi-identifier" size="14px" class="q-mr-xs" />
                <span class="ellipsis uuid-text">{{ uuid }}</span>
                <CopyToClipboard
                  :content="uuid"
                  size="xs"
                  flat
                  class="q-ml-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Specs Section -->
      <div class="solid-panel">
        <div class="section-label">
          {{ $gettext('Key Specifications') }}
        </div>

        <div class="row q-col-gutter-md">
          <!-- CPU -->
          <div v-if="cpu" class="col-12 col-sm-6">
            <div class="data-field">
              <span class="data-field-label">{{ $gettext('Processor') }}</span>
              <div class="spec-value-row q-mt-xs">
                <q-icon
                  :name="cpuIcon(architecture)"
                  color="brand-primary"
                  size="20px"
                />
                <TextTooltip
                  :text="cpu"
                  text-class="text-mono text-weight-medium"
                />
              </div>
            </div>
          </div>

          <!-- RAM -->
          <div v-if="ram" class="col-12 col-sm-6">
            <div class="data-field">
              <span class="data-field-label">{{ $gettext('RAM') }}</span>
              <div class="spec-value-row q-mt-xs">
                <q-icon name="mdi-memory" color="brand-primary" size="20px" />
                <span class="text-weight-bold">{{
                  humanStorageSize(ram)
                }}</span>
              </div>
            </div>
          </div>

          <!-- Storage -->
          <div v-if="storage" class="col-12 col-sm-6">
            <div class="data-field">
              <span class="data-field-label">{{ $gettext('Storage') }}</span>
              <div class="spec-value-row q-mt-xs">
                <q-icon name="mdi-harddisk" color="brand-primary" size="20px" />
                <span class="text-weight-bold">{{
                  humanStorageSize(storage)
                }}</span>
                <span class="text-caption opacity-50">
                  ({{ disks }} {{ $ngettext('Disk', 'Disks', disks) }})
                </span>
              </div>
            </div>
          </div>

          <!-- MAC Address -->
          <div v-if="macAddress" class="col-12 col-sm-6">
            <div class="data-field">
              <span class="data-field-label">{{
                $gettext('MAC Address')
              }}</span>
              <div class="spec-value-row q-mt-xs">
                <q-icon name="mdi-ethernet" color="brand-primary" size="20px" />
                <TextTooltip
                  :text="humanMacAddress(macAddress)"
                  text-class="text-mono text-weight-medium"
                />
                <CopyToClipboard
                  :content="humanMacAddress(macAddress)"
                  size="xs"
                  flat
                  class="opacity-40"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { ref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { format } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import CopyToClipboard from 'components/ui/CopyToClipboard'
import DateDiff from 'components/DateDiff'
import DateView from 'components/ui/DateView'
import TextTooltip from 'components/ui/TextTooltip'

import { appIcon, useElement } from 'composables/element'
import useDate from 'composables/date'

export default {
  name: 'ComputerHardwareResume',
  components: { CopyToClipboard, DateDiff, DateView, TextTooltip },
  props: {
    cid: {
      type: Number,
      required: true,
    },
    lastHardwareCapture: {
      type: String,
      required: false,
      default: null,
    },
    product: {
      type: String,
      required: false,
      default: '',
    },
    productSystem: {
      type: String,
      required: false,
      default: null,
    },
    architecture: {
      type: Number,
      required: false,
      default: 64,
    },
    uuid: {
      type: String,
      required: false,
      default: null,
    },
    cpu: {
      type: String,
      required: false,
      default: null,
    },
    ram: {
      type: Number,
      required: false,
      default: 0,
    },
    storage: {
      type: Number,
      required: false,
      default: 0,
    },
    disks: {
      type: Number,
      required: false,
      default: 0,
    },
    macAddress: {
      type: String,
      required: false,
      default: '',
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props) {
    const { $gettext } = useGettext()
    const uiStore = useUiStore()
    const { productIcon, cpuIcon, humanMacAddress } = useElement()
    const { diffForHumans, localeDate } = useDate()

    const loading = ref(false)
    const hardwareDate = ref(props.lastHardwareCapture)
    const editingDate = ref(false)
    const savedDate = ref(props.lastHardwareCapture)

    const startDateEdit = () => {
      savedDate.value = hardwareDate.value
      editingDate.value = true
    }

    const cancelDateEdit = () => {
      hardwareDate.value = savedDate.value
      editingDate.value = false
    }

    const saveDate = async () => {
      loading.value = true

      if (hardwareDate.value === '') hardwareDate.value = null

      try {
        await api.patch(`/api/v1/token/computers/${props.cid}/`, {
          last_hardware_capture: hardwareDate.value,
        })
        uiStore.notifySuccess(
          $gettext('Last hardware capture date has been changed!'),
        )
        savedDate.value = hardwareDate.value
        editingDate.value = false
      } catch (error) {
        const msg =
          error?.response?.data?.last_hardware_capture?.[0] ??
          $gettext('Failed to update hardware capture date.')
        uiStore.notifyError(msg)
      } finally {
        loading.value = false
      }
    }

    const clearDate = async () => {
      hardwareDate.value = null
      loading.value = true
      try {
        await api.patch(`/api/v1/token/computers/${props.cid}/`, {
          last_hardware_capture: null,
        })
        uiStore.notifySuccess(
          $gettext('Last hardware capture date has been changed!'),
        )
        savedDate.value = null
      } catch (error) {
        const msg =
          error?.response?.data?.last_hardware_capture?.[0] ??
          $gettext('Failed to update hardware capture date.')
        uiStore.notifyError(msg)
        hardwareDate.value = savedDate.value
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      hardwareDate,
      editingDate,
      startDateEdit,
      cancelDateEdit,
      saveDate,
      clearDate,
      humanStorageSize: format.humanStorageSize,
      appIcon,
      productIcon,
      cpuIcon,
      humanMacAddress,
      diffForHumans,
      localeDate,
    }
  },
}
</script>

<style scoped>
.hardware-card {
  max-width: 1000px;
  margin: auto;
}

.capture-badge {
  font-weight: 500;
}

.hero-icon-section {
  width: 44px;
  height: 44px;
  background: var(--warning-surface);
  border-radius: 12px;
  flex-shrink: 0;
  display: flex;
}

[data-theme='dark'] .hero-icon-section {
  background: rgba(var(--brand-primary-rgb), 0.1);
}

.product-link-btn {
  border-radius: 12px;
  padding: 8px 20px;
  background: rgba(var(--brand-primary-rgb), 0.05);
  transition: all 0.2s;
}

.product-link-btn:hover {
  background: rgba(var(--brand-primary-rgb), 0.1);
}

.section-label {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.5;
  margin-bottom: 12px;
}

.data-field-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.5;
}

.spec-value-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.solid-panel {
  background: rgba(var(--brand-primary-rgb), 0.04);
  border: 1px solid rgba(var(--brand-primary-rgb), 0.08);
  border-radius: 16px;
  padding: 16px;
}

[data-theme='dark'] .solid-panel {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.06);
}

.text-mono {
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  font-size: 0.95rem;
}

/* Date edit micro-interaction */
.date-display-group .edit-trigger {
  transition: opacity 0.2s;
}

.date-display-group:hover .edit-trigger {
  opacity: 0.8 !important;
}

.date-edit-container {
  padding: 4px 12px;
  border-radius: 8px;
  background: rgba(var(--brand-primary-rgb), 0.05);
  transition: all 0.2s;
}

[data-theme='dark'] .date-edit-container {
  background: rgba(255, 255, 255, 0.05);
}

.date-input {
  min-width: 160px;
}

.date-input :deep(.q-field__native) {
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0;
}
.uuid-metrics {
  font-size: 0.7rem;
}

.uuid-text {
  max-width: 200px;
}
</style>
