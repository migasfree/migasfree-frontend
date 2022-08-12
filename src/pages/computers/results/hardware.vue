<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <template v-if="element.id">
      <Header :title="title" :has-export-button="false">
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
        <div class="col-6">
          <ComputerHardwareResume
            v-if="element.product_system"
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
          <q-banner v-else class="text-white bg-info q-ma-md">
            <translate>No information</translate>
          </q-banner>
        </div>
      </div>

      <div v-if="hardwareInfo.length > 0" class="row q-pa-md q-gutter-md">
        <q-tree :nodes="hardwareInfo" node-key="id" no-connectors>
          <template #default-header="prop">
            <div class="row items-center">
              <div class="text-weight-bold text-primary">
                {{ header(prop.node) }}

                <q-btn
                  class="q-ma-md"
                  :label="$gettext('Details')"
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
                  <BooleanView :value="prop.node.enabled" />
                </p>

                <p>
                  <translate>Claimed</translate>:
                  <BooleanView :value="prop.node.claimed" />
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
    <p v-else class="text-center">
      <q-spinner-dots color="primary" size="3em" />
    </p>

    <q-dialog v-model="details">
      <q-card>
        <q-card-section>
          <div class="text-h5">
            <q-icon
              name="mdi-text-box-search"
              size="lg"
              class="vertical-middle"
            />
            <span class="vertical-middle">
              <translate>Details</translate>:
              {{ detailInfo.name }}
            </span>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div v-translate class="text-h6">Capabilities</div>
          <q-table
            v-if="detailInfo.capability.length > 0"
            class="q-ma-md"
            :rows="detailInfo.capability"
            :columns="columnsCapability"
            row-key="name"
            :pagination="{ rowsPerPage: 0 }"
            hide-pagination
          />
          <q-banner v-else class="text-white bg-info q-ma-md">
            <translate>No information</translate>
          </q-banner>

          <div v-translate class="text-h6">Logical Names</div>
          <q-table
            v-if="detailInfo.logical_name.length > 0"
            class="q-ma-md"
            :rows="detailInfo.logical_name"
            :columns="columnsLogicalName"
            row-key="name"
            :pagination="{ rowsPerPage: 0 }"
            hide-pagination
          />
          <q-banner v-else class="text-white bg-info q-ma-md">
            <translate>No information</translate>
          </q-banner>

          <div v-translate class="text-h6">Configurations</div>
          <q-table
            v-if="detailInfo.configuration.length > 0"
            class="q-ma-md"
            :rows="detailInfo.configuration"
            :columns="columnsConfiguration"
            row-key="name"
            :pagination="{ rowsPerPage: 0 }"
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
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { arrayToTree } from 'performant-array-to-tree'
import { format, useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'
import BooleanView from 'components/ui/BooleanView'
import ComputerHardwareResume from 'components/computer/HardwareResume'

import { modelIcon, useElement } from 'composables/element'

export default {
  components: {
    Breadcrumbs,
    Header,
    MigasLink,
    BooleanView,
    ComputerHardwareResume,
  },
  setup() {
    const { $gettext } = useGettext()
    const route = useRoute()
    const { humanStorageSize } = format
    const { elementIcon, productIcon, cpuIcon } = useElement()
    const uiStore = useUiStore()

    const title = ref($gettext('Hardware Information'))
    useMeta({ title: title.value })

    const model = 'computers'

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        icon: 'mdi-home',
        to: 'home',
      },
      {
        text: $gettext('Data'),
        icon: 'mdi-database-search',
      },
      {
        text: $gettext('Computers'),
        icon: modelIcon(model),
        to: 'computers-dashboard',
      },
      {
        text: $gettext('Results'),
        to: 'computers-list',
      },
      {
        text: 'Id',
        to: { name: 'computer-detail', params: { id: 0 } },
      },
      {
        text: title.value,
      },
    ])

    let element = reactive({})
    const hardwareInfo = ref([])
    const details = ref(false)
    const detailInfo = reactive({
      capability: [],
      logical_name: [],
      configuration: [],
    })

    const columnsCapability = [
      {
        name: 'name',
        field: 'name',
        label: $gettext('Name'),
        align: 'left',
      },
      {
        name: 'description',
        field: 'description',
        label: $gettext('Description'),
        align: 'left',
      },
    ]
    const columnsLogicalName = [
      {
        name: 'name',
        field: 'name',
        label: $gettext('Name'),
        align: 'left',
      },
    ]
    const columnsConfiguration = [
      {
        name: 'name',
        field: 'name',
        label: $gettext('Name'),
        align: 'left',
      },
      {
        name: 'value',
        field: 'value',
        label: $gettext('Value'),
      },
    ]

    const loadHardwareInfo = async () => {
      await api
        .get(`/api/v1/token/${model}/${route.params.id}/hardware/`)
        .then((response) => {
          hardwareInfo.value = arrayToTree(response.data, {
            dataField: null,
            parentId: 'parent',
          })
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    }

    const header = (row) => {
      if (row.description !== null && row.description !== 'NULL')
        return row.description

      return row.product
    }

    const showDetails = async (id) => {
      await api
        .get(`/api/v1/token/hardware/${id}/info/`)
        .then((response) => {
          Object.assign(detailInfo, response.data)
          details.value = true
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    }

    onMounted(async () => {
      await api
        .get(`/api/v1/token/${model}/${route.params.id}/`)
        .then((response) => {
          Object.assign(element, response.data)
          breadcrumbs.find((x) => x.text === 'Id').to.params.id = element.id
          breadcrumbs.find((x) => x.text === 'Id').icon = elementIcon(
            element.status
          )
          breadcrumbs.find((x) => x.text === 'Id').text = element.__str__
          useMeta({ title: `${title.value}: ${element.__str__}` })
          loadHardwareInfo()
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    })

    return {
      title,
      breadcrumbs,
      element,
      hardwareInfo,
      details,
      detailInfo,
      columnsCapability,
      columnsLogicalName,
      columnsConfiguration,
      elementIcon,
      productIcon,
      cpuIcon,
      humanStorageSize,
      header,
      showDetails,
    }
  },
}
</script>
