<template>
  <q-card>
    <q-card-section>
      <div class="row">
        <div class="col-md">
          <div v-translate class="text-h5">Hardware</div>
        </div>
      </div>

      <div class="row q-pa-md">
        <div class="col-md">
          <p v-if="readonly">
            <q-icon
              name="mdi-calendar-star"
              size="sm"
              class="vertical-middle"
            />
            <span class="vertical-middle"> {{ showDate(hardwareDate) }} </span>
            <DateDiff
              :begin="new Date(hardwareDate)"
              :tooltip="$gettext('unsynchronized from')"
            />

            <q-tooltip>{{ $gettext('Last hardware capture date') }}</q-tooltip>
          </p>
          <q-btn-group v-else>
            <q-datetime-picker
              v-model="hardwareDate"
              :label="$gettext('Last hardware capture date')"
              mode="datetime"
              outlined
              clearable
              landscape
              target="self"
              format24h
              :display-value="showDate(hardwareDate)"
              ><q-tooltip>{{
                diffForHumans(hardwareDate)
              }}</q-tooltip></q-datetime-picker
            >
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

      <div class="row q-pa-md">
        <div class="col-md-4">
          <q-icon :name="productIcon(productSystem)" style="font-size: 6em;">
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
              class="vertical-middle"
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
                  params: { id: cid }
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
            <q-tooltip self="bottom middle"
              ><translate>UUID</translate></q-tooltip
            >
            <q-icon
              name="mdi-card-account-details-outline"
              size="sm"
              class="vertical-middle"
            />
            <span class="vertical-middle"> {{ uuid }}</span>
          </p>
        </div>
      </div>

      <div class="row q-pa-md">
        <div class="col-md">
          <p>
            <q-tooltip self="bottom middle"
              ><translate>Processor</translate></q-tooltip
            >
            <q-icon
              :name="cpuIcon(architecture)"
              size="sm"
              class="vertical-middle"
            />
            <span class="vertical-middle"> {{ cpu }}</span>
          </p>
        </div>
        <div v-if="ram" class="col-md">
          <p>
            <q-tooltip self="bottom middle"
              ><translate>RAM</translate></q-tooltip
            >
            <q-icon name="mdi-memory" size="sm" class="vertical-middle" />
            <span class="vertical-middle"> {{ humanStorageSize(ram) }}</span>
          </p>
        </div>
      </div>

      <div class="row q-pa-md">
        <div v-if="storage" class="col-md">
          <p>
            <q-tooltip self="bottom middle"
              ><translate>Storage</translate></q-tooltip
            >
            <q-icon name="mdi-harddisk" size="sm" class="vertical-middle" />
            <span class="vertical-middle">
              {{ humanStorageSize(storage) }} ({{ disks }})</span
            >
          </p>
        </div>
        <div v-if="macAddress" class="col-md">
          <p>
            <q-tooltip self="bottom middle"
              ><translate>MAC Address</translate></q-tooltip
            >
            <q-icon
              name="mdi-swap-vertical"
              size="sm"
              class="vertical-middle"
            />
            <span class="vertical-middle">
              {{ humanMacAddress(macAddress) }}</span
            >
          </p>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import DateDiff from 'components/DateDiff'
import { format } from 'quasar'
import { elementMixin } from 'mixins/element'
import { dateMixin } from 'mixins/date'

const { humanStorageSize } = format

export default {
  name: 'ComputerHardwareResume',
  components: { DateDiff },
  mixins: [elementMixin, dateMixin],
  props: {
    cid: {
      type: Number,
      required: true
    },
    lastHardwareCapture: {
      type: String,
      required: false,
      default: null
    },
    product: {
      type: String,
      required: false,
      default: ''
    },
    productSystem: {
      type: String,
      required: false,
      default: null
    },
    architecture: {
      type: Number,
      required: false,
      default: 64
    },
    uuid: {
      type: String,
      required: false,
      default: null
    },
    cpu: {
      type: String,
      required: false,
      default: null
    },
    ram: {
      type: Number,
      required: false,
      default: 0
    },
    storage: {
      type: Number,
      required: false,
      default: 0
    },
    disks: {
      type: Number,
      required: false,
      default: 0
    },
    macAddress: {
      type: String,
      required: false,
      default: ''
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      hardwareDate: this.lastHardwareCapture
    }
  },
  methods: {
    humanStorageSize,
    async updateCapture() {
      this.loading = true
      if (this.hardwareDate === '') this.hardwareDate = null
      await this.$axios
        .patch(`/api/v1/token/computers/${this.cid}/`, {
          last_hardware_capture: this.hardwareDate
        })
        .then((response) => {
          this.$store.dispatch(
            'ui/notifySuccess',
            this.$gettext('Last hardware capture date has been changed!')
          )
        })
        .catch((error) => {
          this.$store.dispatch(
            'ui/notifyError',
            error.response.data.last_hardware_capture[0]
          )
        })
        .finally(() => (this.loading = false))
    }
  }
}
</script>
