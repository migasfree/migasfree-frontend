<template>
  <q-card>
    <q-card-section>
      <div class="row">
        <div class="col-md">
          <div class="text-h5">Hardware</div>
        </div>

        <div class="col-md">
          <q-btn-group class="float-right">
            <q-datetime-picker
              v-model="hardwareDate"
              label="Fecha de la última captura del hardware"
              mode="datetime"
              outlined
              clearable
              landscape
              target="self"
              format24h
              :display-value="showDate(hardwareDate)"
            ></q-datetime-picker>
            <q-btn
              color="primary"
              icon="mdi-content-save"
              @click="updateCapture"
            />
          </q-btn-group>
        </div>
      </div>
    </q-card-section>

    <q-card-section>
      <div class="row q-pa-md">
        <div class="col-md-4">
          <q-icon :name="productIcon(productSystem)" style="font-size: 6em;">
            <q-tooltip>{{ productSystem }}</q-tooltip>
            <q-badge floating transparent>
              {{ architecture }} bits
            </q-badge></q-icon
          >
        </div>

        <div class="col-md-8">
          <p>
            <MigasLink model="computers" :pk="cid" :value="product" />
          </p>
          <p>
            <q-tooltip self="bottom middle">UUID</q-tooltip>
            {{ uuid }}
          </p>
        </div>
      </div>

      <div class="row q-pa-md">
        <div class="col-md">
          <p>
            <q-tooltip self="bottom middle">Procesador</q-tooltip>
            <q-icon :name="cpuIcon(architecture)" size="sm" />
            {{ cpu }}
          </p>
        </div>
        <div class="col-md">
          <p>
            <q-tooltip self="bottom middle">RAM</q-tooltip>
            <q-icon name="mdi-memory" size="sm" />
            {{ humanStorageSize(ram) }}
          </p>
        </div>
      </div>

      <div class="row q-pa-md">
        <div class="col-md">
          <p>
            <q-tooltip self="bottom middle">Almacenamiento</q-tooltip>
            <q-icon name="mdi-harddisk" size="sm" />
            {{ humanStorageSize(storage) }}
            ({{ disks }})
          </p>
        </div>
        <div class="col-md">
          <p>
            <q-tooltip self="bottom middle">Dirección MAC</q-tooltip>
            <q-icon name="mdi-swap-vertical" size="sm" />
            {{ humanMacAddress(macAddress) }}
          </p>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { format } from 'quasar'
import { elementMixin } from 'mixins/element'
import { dateMixin } from 'mixins/date'
import MigasLink from 'components/MigasLink'

const { humanStorageSize } = format

export default {
  name: 'ComputerHardwareResume',
  components: { MigasLink },
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
    }
  },
  data() {
    return {
      hardwareDate: this.lastHardwareCapture
    }
  },
  methods: {
    humanStorageSize,
    updateCapture() {
      console.log(this.hardwareDate)
    }
  }
}
</script>
