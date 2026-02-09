<template>
  <q-card class="hardware-card shadow-2 rounded-borders">
    <q-card-section class="q-pb-none">
      <!-- Header Service info -->
      <div class="row items-center justify-between q-mb-md">
        <div
          class="text-h6 text-weight-bold"
          :class="$q.dark.isActive ? 'text-white' : 'text-grey-8'"
        >
          {{ $gettext('Hardware') }}
        </div>
        <div class="capture-info row items-center no-wrap">
          <p v-if="readonly" class="q-ma-none row items-center">
            <DateView
              :value="hardwareDate"
              icon="mdi-calendar-star"
              class="q-mr-sm"
            />
            <DateDiff
              :begin="new Date(hardwareDate)"
              :tooltip="$gettext('unsynchronized from')"
              class="capture-badge"
            />
            <q-tooltip>{{ $gettext('Last hardware capture date') }}</q-tooltip>
          </p>
          <q-btn-group v-else>
            <q-input
              v-model="hardwareDate"
              :label="$gettext('Last hardware capture date')"
              :aria-label="$gettext('Last hardware capture date')"
              dense
              outlined
              clearable
              class="q-mr-none"
              style="border-top-right-radius: 0; border-bottom-right-radius: 0"
            >
              <template #prepend>
                <q-icon name="mdi-clock-outline" class="cursor-pointer">
                  <q-popup-proxy
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-time
                      v-model="hardwareDate"
                      mode="date"
                      mask="YYYY-MM-DD HH:mm:ss"
                      outlined
                      landscape
                      format24h
                      now-btn
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>

              <template #append>
                <q-icon name="mdi-calendar" class="cursor-pointer">
                  <q-popup-proxy
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      v-model="hardwareDate"
                      mode="date"
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
              <q-tooltip v-if="hardwareDate">{{
                diffForHumans(hardwareDate)
              }}</q-tooltip>
            </q-input>

            <q-btn
              color="primary"
              :icon="appIcon('save-edit')"
              :loading="loading"
              :disabled="loading"
              unelevated
              @click="updateCapture"
            >
              <q-tooltip>{{ $gettext('Save and continue editing') }}</q-tooltip>
            </q-btn>
          </q-btn-group>
        </div>
      </div>

      <!-- Hero Section: Product & Model -->
      <div
        class="row items-center q-pa-lg rounded-borders q-mb-lg hero-section"
        :class="$q.dark.isActive ? 'bg-blue-grey-10' : 'bg-blue-grey-1'"
      >
        <div class="col-auto q-mr-xl relative-position">
          <q-icon
            :name="productIcon(productSystem)"
            size="6em"
            :color="$q.dark.isActive ? 'blue-grey-3' : 'blue-grey-8'"
          >
            <q-tooltip>{{ productSystem }}</q-tooltip>
          </q-icon>
        </div>
        <div class="col col-md">
          <div
            v-if="readonly"
            class="text-h4 text-weight-medium"
            :class="$q.dark.isActive ? 'text-blue-grey-2' : 'text-blue-grey-10'"
          >
            {{ product }}
            <q-tooltip>{{ productSystem }}</q-tooltip>
          </div>
          <q-btn
            v-else
            no-caps
            outline
            align="left"
            color="primary"
            class="text-h4 text-weight-medium product-link-btn"
            :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-white'"
            :label="product"
            @click="
              $router.push({ name: 'computer-hardware', params: { id: cid } })
            "
          >
            <q-tooltip
              >{{ productSystem }} ({{
                $gettext('Hardware Information')
              }})</q-tooltip
            >
          </q-btn>
        </div>
      </div>

      <!-- Spec Grid 2x2 -->
      <div class="row q-col-gutter-lg q-mb-lg">
        <!-- CPU Component -->
        <div class="col-12 col-sm-6">
          <div
            class="spec-box q-pa-md rounded-borders text-white"
            :class="$q.dark.isActive ? 'bg-black' : 'bg-blue-grey-9'"
          >
            <div class="row no-wrap items-center">
              <q-icon
                :name="cpuIcon(architecture)"
                size="md"
                class="q-mr-md"
                :class="$q.dark.isActive ? 'text-blue-3' : 'text-blue-2'"
              />
              <div class="col overflow-hidden">
                <div
                  class="text-caption uppercase q-mb-xs"
                  :class="$q.dark.isActive ? 'text-blue-3' : 'text-blue-2'"
                >
                  {{ $gettext('Processor') }}
                </div>
                <div class="text-subtitle1 text-weight-medium ellipsis">
                  {{ cpu }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- RAM Component -->
        <div v-if="ram" class="col-12 col-sm-6">
          <div
            class="spec-box q-pa-md rounded-borders text-white"
            :class="$q.dark.isActive ? 'bg-black' : 'bg-blue-grey-9'"
          >
            <div class="row no-wrap items-center">
              <q-icon
                name="mdi-memory"
                size="md"
                class="q-mr-md"
                :class="$q.dark.isActive ? 'text-blue-3' : 'text-blue-2'"
              />
              <div class="col overflow-hidden">
                <div
                  class="text-caption uppercase q-mb-xs"
                  :class="$q.dark.isActive ? 'text-blue-3' : 'text-blue-2'"
                >
                  {{ $gettext('RAM') }}
                </div>
                <div class="text-subtitle1 text-weight-medium">
                  {{ humanStorageSize(ram) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Storage Component -->
        <div v-if="storage" class="col-12 col-sm-6">
          <div
            class="spec-box q-pa-md rounded-borders text-white"
            :class="$q.dark.isActive ? 'bg-black' : 'bg-blue-grey-9'"
          >
            <div class="row no-wrap items-center">
              <q-icon
                name="mdi-harddisk"
                size="md"
                class="q-mr-md"
                :class="$q.dark.isActive ? 'text-blue-3' : 'text-blue-2'"
              />
              <div class="col overflow-hidden">
                <div
                  class="text-caption uppercase q-mb-xs"
                  :class="$q.dark.isActive ? 'text-blue-3' : 'text-blue-2'"
                >
                  {{ $gettext('Storage') }}
                </div>
                <div class="text-subtitle1 text-weight-medium">
                  {{ humanStorageSize(storage) }}
                  <span class="text-caption q-ml-sm text-blue-grey-3">
                    ({{ disks }} {{ $ngettext('Disk', 'Disks', disks) }})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Network Component -->
        <div v-if="macAddress" class="col-12 col-sm-6">
          <div
            class="spec-box q-pa-md rounded-borders text-white"
            :class="$q.dark.isActive ? 'bg-black' : 'bg-blue-grey-9'"
          >
            <div class="row no-wrap items-center">
              <q-icon
                name="mdi-swap-vertical"
                size="md"
                class="q-mr-md"
                :class="$q.dark.isActive ? 'text-blue-3' : 'text-blue-2'"
              />
              <div class="col overflow-hidden">
                <div
                  class="text-caption uppercase q-mb-xs"
                  :class="$q.dark.isActive ? 'text-blue-3' : 'text-blue-2'"
                >
                  {{ $gettext('MAC Address') }}
                </div>
                <div class="row no-wrap items-center">
                  <div
                    class="text-subtitle1 text-weight-medium q-mr-sm ellipsis"
                  >
                    {{ humanMacAddress(macAddress) }}
                  </div>
                  <CopyToClipboard
                    :content="humanMacAddress(macAddress)"
                    size="xs"
                    flat
                    :color="$q.dark.isActive ? 'blue-3' : 'blue-2'"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </q-card-section>

    <!-- Footer: UUID -->
    <q-card-section v-if="uuid" class="q-pt-none">
      <div
        class="uuid-footer q-pa-sm rounded-borders row items-center no-wrap"
        :class="
          $q.dark.isActive
            ? 'bg-black text-blue-2'
            : 'bg-blue-grey-10 text-blue-1'
        "
      >
        <q-icon
          name="mdi-card-account-details-outline"
          size="sm"
          class="q-mr-sm op-80"
        />
        <span class="text-caption text-monospace col ellipsis"
          >UUID: {{ uuid }}</span
        >
        <CopyToClipboard
          :content="uuid"
          size="xs"
          flat
          :color="$q.dark.isActive ? 'blue-2' : 'blue-1'"
          class="q-ml-sm"
        />
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

import { appIcon, useElement } from 'composables/element'
import useDate from 'composables/date'

export default {
  name: 'ComputerHardwareResume',
  components: { CopyToClipboard, DateDiff, DateView },
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

    const updateCapture = async () => {
      loading.value = true

      if (hardwareDate.value === '') hardwareDate.value = null

      try {
        await api.patch(`/api/v1/token/computers/${props.cid}/`, {
          last_hardware_capture: hardwareDate.value,
        })
        uiStore.notifySuccess(
          $gettext('Last hardware capture date has been changed!'),
        )
      } catch (error) {
        const msg =
          error?.response?.data?.last_hardware_capture?.[0] ??
          $gettext('Failed to update hardware capture date.')
        uiStore.notifyError(msg)
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      hardwareDate,
      humanStorageSize: format.humanStorageSize,
      appIcon,
      productIcon,
      cpuIcon,
      humanMacAddress,
      diffForHumans,
      localeDate,
      updateCapture,
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
.product-link-btn {
  border-radius: 8px;
  padding: 8px 20px;
  transition: all 0.2s ease;
}
.product-link-btn:hover {
  filter: brightness(0.95);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
