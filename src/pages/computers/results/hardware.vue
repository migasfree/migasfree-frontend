<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <template v-if="element.id">
      <Header :title="$gettext('Hardware Information')">
        <template v-if="element.id" #append
          >:
          <MigasLink
            model="computers"
            :pk="element.id"
            :value="element.__str__ || ''"
            :icon="elementIcon(element.status)"
            :tooltip="element.summary"
          />
        </template>
      </Header>

      <div class="row q-pa-md q-gutter-md">
        <div class="col-md">
          <ComputerHardwareResume
            :cid="element.id"
            :last-hardware-capture="element.last_hardware_capture"
            :product="element.product"
            :product-system="element.product_system"
            :architecture="element.architecture"
            :uuid="element.uuid"
            :cpu="element.cpu"
            :ram="element.ram"
            :storage="element.storage"
            :disks="element.disks"
            :mac-address="element.mac_address"
            :readonly="true"
          />
        </div>
      </div>

      <div v-if="hardwareInfo" class="row q-pa-md q-gutter-md">
        <q-tree :nodes="hardwareInfo" node-key="id" no-connectors>
          <template #default-header="prop">
            <div class="row items-center">
              <div class="text-weight-bold text-primary">
                {{ header(prop.node) }}

                <q-btn
                  class="q-ma-md"
                  label="Details"
                  icon="mdi-text-box-search"
                  @click="showDetails(prop.node.id)"
                />
              </div>
            </div>
          </template>

          <template #default-body="prop">
            <q-card>
              <q-card-section>
                <p v-if="prop.node.width">
                  <translate>Width</translate>:
                  <strong>{{ prop.node.width }}</strong>
                </p>

                <p v-if="prop.node.name">
                  <translate>Name</translate>:
                  <strong>{{ prop.node.name }}</strong>
                </p>

                <p v-if="prop.node.class_name">
                  <translate>Class Name</translate>:
                  <strong>{{ prop.node.class_name }}</strong>
                </p>

                <p>
                  <translate>Enabled</translate>:
                  <BooleanView v-model="prop.node.enabled" />
                </p>

                <p>
                  <translate>Claimed</translate>:
                  <BooleanView v-model="prop.node.claimed" />
                </p>

                <p v-if="prop.node.vendor">
                  <translate>Vendor</translate>:
                  <strong>{{ prop.node.vendor }}</strong>
                </p>

                <p v-if="prop.node.product">
                  <translate>Product</translate>:
                  <strong>{{ prop.node.product }}</strong>
                </p>

                <p v-if="prop.node.version">
                  <translate>Version</translate>:
                  <strong>{{ prop.node.version }}</strong>
                </p>

                <p v-if="prop.node.serial">
                  <translate>Serial</translate>:
                  <strong>{{ prop.node.serial }}</strong>
                </p>

                <p v-if="prop.node.bus_info">
                  <translate>Bus Info</translate>:
                  <strong>{{ prop.node.bus_info }}</strong>
                </p>

                <p v-if="prop.node.physid">
                  <translate>Physical Id</translate>:
                  <strong>{{ prop.node.physid }}</strong>
                </p>

                <p v-if="prop.node.slot">
                  <translate>Slot</translate>:
                  <strong>{{ prop.node.slot }}</strong>
                </p>

                <p v-if="prop.node.size">
                  <translate>Size</translate>:
                  <strong>{{ humanStorageSize(prop.node.size) }}</strong>
                </p>

                <p v-if="prop.node.capacity">
                  <translate>Capacity</translate>:
                  <strong>{{ humanStorageSize(prop.node.capacity) }}</strong>
                </p>

                <p v-if="prop.node.clock">
                  <translate>Clock</translate>:
                  <strong>{{ humanStorageSize(prop.node.clock) }}</strong>
                </p>

                <p v-if="prop.node.dev">
                  <translate>Dev</translate>:
                  <strong>{{ prop.node.dev }}</strong>
                </p>
              </q-card-section>
            </q-card>
          </template>
        </q-tree>
      </div>
    </template>

    <q-dialog v-model="details">
      <q-card>
        <q-card-section>
          <div class="text-h5">
            <q-icon name="mdi-text-box-search" />
            <translate>Details</translate>:
            {{ detailInfo.name }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div v-translate class="text-h6">Capabilities</div>
          <q-table
            v-if="detailInfo.capability.length > 0"
            class="q-ma-md"
            :data="detailInfo.capability"
            :columns="columnsCapability"
            row-key="name"
            hide-pagination
          />
          <q-banner v-else class="text-white bg-info q-ma-md">
            <translate>No information</translate>
          </q-banner>

          <div v-translate class="text-h6">Logical Names</div>
          <q-table
            v-if="detailInfo.logical_name.length > 0"
            class="q-ma-md"
            :data="detailInfo.logical_name"
            :columns="columnsLogicalName"
            row-key="name"
            hide-pagination
          />
          <q-banner v-else class="text-white bg-info q-ma-md">
            <translate>No information</translate>
          </q-banner>

          <div v-translate class="text-h6">Configurations</div>
          <q-table
            v-if="detailInfo.configuration.length > 0"
            class="q-ma-md"
            :data="detailInfo.configuration"
            :columns="columnsConfiguration"
            row-key="name"
            hide-pagination
          />
          <q-banner v-else class="text-white bg-info q-ma-md">
            <translate>No information</translate>
          </q-banner>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            v-close-popup
            flat
            :label="$gettext('Close')"
            color="primary"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'
import BooleanView from 'components/ui/BooleanView'
import ComputerHardwareResume from 'components/computer/HardwareResume'
import { elementMixin } from 'mixins/element'
import { arrayToTree } from 'performant-array-to-tree'
import { format } from 'quasar'

const { humanStorageSize } = format

export default {
  meta() {
    return {
      title: this.title
    }
  },
  components: {
    Breadcrumbs,
    Header,
    MigasLink,
    BooleanView,
    ComputerHardwareResume
  },
  mixins: [elementMixin],
  data() {
    return {
      title: this.$gettext('Hardware Information'),
      model: 'computers',
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: this.$gettext('Data'),
          icon: 'mdi-database-search'
        },
        {
          text: this.$gettext('Computers'),
          to: 'computers-dashboard',
          icon: 'mdi-desktop-classic'
        },
        {
          text: this.$gettext('Results'),
          to: 'computers-list'
        },
        {
          text: 'Id',
          to: { name: 'computer-detail', params: { id: 0 } }
        },
        {
          text: this.$gettext('Hardware Information')
        }
      ],
      element: {},
      hardwareInfo: [],
      details: false,
      detailInfo: { capability: [], logical_name: [], configuration: [] },
      columnsCapability: [
        {
          name: 'name',
          field: 'name',
          label: this.$gettext('Name'),
          align: 'left'
        },
        {
          name: 'description',
          field: 'description',
          label: this.$gettext('Description'),
          align: 'left'
        }
      ],
      columnsLogicalName: [
        {
          name: 'name',
          field: 'name',
          label: this.$gettext('Name'),
          align: 'left'
        }
      ],
      columnsConfiguration: [
        {
          name: 'name',
          field: 'name',
          label: this.$gettext('Name'),
          align: 'left'
        },
        {
          name: 'value',
          field: 'value',
          label: this.$gettext('Value')
        }
      ]
    }
  },
  async mounted() {
    await this.$axios
      .get(`/api/v1/token/${this.model}/${this.$route.params.id}/`)
      .then((response) => {
        this.element = response.data
        this.breadcrumbs.find(
          (x) => x.text === 'Id'
        ).to.params.id = this.element.id
        this.breadcrumbs.find(
          (x) => x.text === 'Id'
        ).text = this.element.__str__
        this.title = `${this.title}: ${this.element.__str__}`
        this.loadHardwareInfo()
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })
  },
  methods: {
    humanStorageSize,

    async loadHardwareInfo() {
      await this.$axios
        .get(`/api/v1/token/${this.model}/${this.$route.params.id}/hardware/`)
        .then((response) => {
          this.hardwareInfo = arrayToTree(response.data, {
            dataField: null,
            parentId: 'parent'
          })
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    header(row) {
      if (row.description !== null && row.description !== 'NULL')
        return row.description

      return row.product
    },

    async showDetails(id) {
      await this.$axios
        .get(`/api/v1/token/hardware/${id}/info/`)
        .then((response) => {
          console.log(response.data)
          this.detailInfo = response.data
          this.details = true
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    }
  }
}
</script>
