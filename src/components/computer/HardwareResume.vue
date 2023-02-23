<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="row">
        <div class="col-md">
          <div v-translate class="text-h5">Hardware</div>
        </div>
      </div>

      <div class="row q-py-sm">
        <div class="col-md">
          <p v-if="readonly">
            <DateView :value="hardwareDate" icon="mdi-calendar-star" />
            <DateDiff
              :begin="new Date(hardwareDate)"
              :tooltip="$gettext('unsynchronized from')"
            />

            <q-tooltip>{{ $gettext('Last hardware capture date') }}</q-tooltip>
          </p>
          <q-btn-group v-else>
            <q-input
              v-model="hardwareDate"
              :label="$gettext('Last hardware capture date')"
              outlined
              clearable
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
              icon="mdi-content-save-edit"
              :loading="loading"
              :disabled="loading"
              @click="updateCapture"
            >
              <q-tooltip
                ><translate>Save and continue editing</translate></q-tooltip
              >
            </q-btn>
          </q-btn-group>
        </div>
      </div>

      <div class="row q-py-sm">
        <div class="col-md-4">
          <q-icon :name="productIcon(productSystem)" style="font-size: 6em">
            <q-tooltip>{{ productSystem }}</q-tooltip>
            <q-badge floating transparent>
              {{ architecture }} <translate>bits</translate>
            </q-badge></q-icon
          >
        </div>

        <div class="col-md-8">
          <p v-if="readonly">
            <q-icon
              :name="productIcon(productSystem)"
              size="sm"
              class="vertical-middle q-mr-xs"
            />
            <span class="vertical-middle"> {{ product }}</span>
            <q-tooltip>{{ productSystem }}</q-tooltip>
          </p>
          <p v-else>
            <q-btn
              no-caps
              dense
              color="info"
              text-color="black"
              :icon="productIcon(productSystem)"
              :label="product"
              @click="
                $router.push({
                  name: 'computer-hardware',
                  params: { id: cid },
                })
              "
              ><q-tooltip
                >{{ productSystem }} ({{
                  $gettext('Hardware Information')
                }})</q-tooltip
              ></q-btn
            >
          </p>
          <p>
            <q-icon
              name="mdi-card-account-details-outline"
              size="sm"
              class="vertical-middle q-mr-xs"
            />
            <span class="vertical-middle">
              {{ uuid }}
              <q-tooltip><translate>UUID</translate></q-tooltip>
            </span>
          </p>
        </div>
      </div>

      <div class="row q-py-sm">
        <div class="col-md">
          <q-icon
            :name="cpuIcon(architecture)"
            size="sm"
            class="vertical-middle"
          />
          <span class="vertical-middle">
            {{ cpu }}
            <q-tooltip><translate>Processor</translate></q-tooltip>
          </span>
        </div>

        <div v-if="ram" class="col-md">
          <q-icon name="mdi-memory" size="sm" class="vertical-middle" />
          <span class="vertical-middle">
            {{ humanStorageSize(ram) }}
            <q-tooltip><translate>RAM</translate></q-tooltip>
          </span>
        </div>
      </div>

      <div class="row q-py-sm">
        <div v-if="storage" class="col-md">
          <q-icon name="mdi-harddisk" size="sm" class="vertical-middle" />
          <span class="vertical-middle">
            {{ humanStorageSize(storage) }} ({{ disks }})
            <q-tooltip><translate>Storage</translate></q-tooltip>
          </span>
        </div>
        <div v-if="macAddress" class="col-md">
          <q-icon name="mdi-swap-vertical" size="sm" class="vertical-middle" />
          <span class="vertical-middle">
            {{ humanMacAddress(macAddress) }}
            <q-tooltip><translate>MAC Address</translate></q-tooltip>
          </span>
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

import DateDiff from 'components/DateDiff'
import DateView from 'components/ui/DateView'

import { useElement } from 'composables/element'
import useDate from 'composables/date'

export default {
  name: 'ComputerHardwareResume',
  components: { DateDiff, DateView },
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
    const { humanStorageSize } = format
    const uiStore = useUiStore()
    const { productIcon, cpuIcon, humanMacAddress } = useElement()
    const { diffForHumans, localeDate } = useDate()

    const loading = ref(false)
    const hardwareDate = ref(props.lastHardwareCapture)

    const updateCapture = async () => {
      loading.value = true
      if (hardwareDate.value === '') hardwareDate.value = null
      await api
        .patch(`/api/v1/token/computers/${props.cid}/`, {
          last_hardware_capture: hardwareDate.value,
        })
        .then((response) => {
          uiStore.notifySuccess(
            $gettext('Last hardware capture date has been changed!')
          )
        })
        .catch((error) => {
          uiStore.notifyError(error.response.data.last_hardware_capture[0])
        })
        .finally(() => (loading.value = false))
    }

    return {
      loading,
      hardwareDate,
      humanStorageSize,
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
