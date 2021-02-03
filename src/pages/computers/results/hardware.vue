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

      <div class="row q-pa-md q-gutter-md">
        <pre>{{ hardwareInfo }}</pre>
      </div>
    </template>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'
import ComputerHardwareResume from 'components/computer/HardwareResume'
import { elementMixin } from 'mixins/element'

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
      hardwareInfo: {}
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
    async loadHardwareInfo() {
      await this.$axios
        .get(`/api/v1/token/${this.model}/${this.$route.params.id}/hardware/`)
        .then((response) => {
          this.hardwareInfo = response.data
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    }
  }
}
</script>
