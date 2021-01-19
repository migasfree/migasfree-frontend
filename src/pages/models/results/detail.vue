<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Model')" :has-add-button="false">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="devices/models"
          :pk="element.id"
          :value="element.name"
          icon="mdi-shape"
        />
      </template>
    </Header>

    <q-card>
      <q-card-section>
        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <q-select
              v-model="element.device_type"
              outlined
              :label="$gettext('Type')"
              :options="deviceTypes"
              option-value="id"
              option-label="name"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
            />
          </div>

          <div class="col-6 col-md">
            <q-select
              v-model="element.manufacturer"
              outlined
              :label="$gettext('Manufacturer')"
              :options="manufacturers"
              option-value="id"
              option-label="name"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
            />
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <q-select
              v-model="element.connections"
              outlined
              multiple
              :label="$gettext('Connections')"
              :options="connections"
              option-value="id"
              option-label="name"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
            />
          </div>

          <div class="col-6 col-md">
            <q-input
              v-model="element.name"
              outlined
              :label="$gettext('Name')"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="justify-around">
        <q-btn
          flat
          color="primary"
          :label="$gettext('Save and add other')"
          icon="mdi-plus"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="updateElement('add')"
        />
        <q-btn
          flat
          color="primary"
          :label="$gettext('Save and continue editing')"
          icon="mdi-content-save-edit"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="updateElement"
        />
        <q-btn
          :label="$gettext('Save')"
          color="primary"
          icon="mdi-content-save-move"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="updateElement('return')"
        />
      </q-card-actions>
    </q-card>

    <div v-if="$route.params.id && element.id" class="row q-pa-md">
      <q-btn
        flat
        icon="mdi-delete"
        color="negative"
        :label="$gettext('Delete')"
        @click="confirmRemove = true"
      />
    </div>

    <RemoveDialog
      v-model="confirmRemove"
      @confirmed="remove"
      @canceled="confirmRemove = !confirmRemove"
    />
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'
import RemoveDialog from 'components/ui/RemoveDialog'
import { detailMixin } from 'mixins/detail'
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
    RemoveDialog,
    MigasLink
  },
  mixins: [detailMixin, elementMixin],
  data() {
    const route = 'models-list'
    const title = this.$gettext('Model')
    const element = { id: 0, connections: [] }

    return {
      title,
      originalTitle: title,
      model: 'devices/models',
      listRoute: route,
      addRoute: 'model-add',
      detailRoute: 'model-detail',
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: this.$gettext('Devices'),
          icon: 'mdi-printer-eye'
        },
        {
          text: this.$gettext('Models'),
          icon: 'mdi-shape',
          to: route
        }
      ],
      element,
      emptyElement: Object.assign({}, element),
      deviceTypes: [],
      manufacturers: [],
      connections: [],
      confirmRemove: false
    }
  },
  computed: {
    isValid() {
      console.log(this.element)
      return (
        this.element.device_type !== undefined &&
        this.element.manufacturer !== undefined &&
        this.element.name !== undefined &&
        this.element.name !== ''
      )
    }
  },
  methods: {
    async loadRelated() {
      await this.$axios
        .get('/api/v1/token/devices/types/')
        .then((response) => {
          console.log(response)
          this.deviceTypes = response.data.results
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })

      await this.$axios
        .get('/api/v1/token/devices/manufacturers/')
        .then((response) => {
          console.log(response)
          this.manufacturers = response.data.results
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })

      await this.$axios
        .get('/api/v1/token/devices/connections/')
        .then((response) => {
          console.log(response)
          this.connections = response.data.results
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    elementData() {
      return {
        device_type: this.element.device_type.id,
        manufacturer: this.element.manufacturer.id,
        name: this.element.name,
        connections: this.element.connections.map((item) => item.id)
      }
    }
  }
}
</script>
