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
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">General</div>

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

      <q-card-section>
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">Drivers</div>

        <q-list v-if="drivers.length > 0" class="q-pa-md" bordered separator>
          <q-item v-for="(driver, index) in drivers" :key="index">
            <q-item-section side>
              <q-btn
                flat
                dense
                round
                color="negative"
                icon="mdi-delete"
                @click="removeDriver(index)"
                ><q-tooltip><translate>Delete</translate></q-tooltip></q-btn
              >
            </q-item-section>

            <q-item-section class="col-3">
              <q-select
                v-model="driver.project"
                outlined
                :label="$gettext('Project')"
                :options="projects"
                option-value="id"
                option-label="name"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </q-item-section>

            <q-item-section class="col-3 col-md">
              <q-select
                v-model="driver.capability"
                outlined
                :label="$gettext('Capability')"
                :options="capabilities"
                option-value="id"
                option-label="name"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </q-item-section>

            <q-item-section class="col-3 col-md">
              <q-input
                v-model="driver.name"
                outlined
                :label="$gettext('Name')"
              />
            </q-item-section>

            <q-item-section class="col-2 col-md">
              <q-input
                v-model="driver.packages_to_install"
                outlined
                type="textarea"
                :label="$gettext('Packages to Install')"
              />
            </q-item-section>
          </q-item>
        </q-list>

        <div class="q-pa-md">
          <q-btn
            icon="mdi-plus"
            :label="$gettext('Add other Driver')"
            @click="addDriver"
          />
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
      drivers: [],
      removedDrivers: [],
      projects: [],
      capabilities: [],
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

      await this.$axios
        .get('/api/v1/token/projects/')
        .then((response) => {
          this.projects = response.data.results
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })

      await this.$axios
        .get('/api/v1/token/devices/capabilities/')
        .then((response) => {
          console.log(response)
          this.capabilities = response.data.results
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })

      if (this.element.id) {
        await this.$axios
          .get(`/api/v1/token/devices/drivers/?model__id=${this.element.id}`)
          .then((response) => {
            console.log(response)
            this.drivers = response.data.results
            this.drivers.forEach((item) => {
              item.packages_to_install = item.packages_to_install.join('\n')
            })
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
      }
    },

    elementData() {
      return {
        device_type: this.element.device_type.id,
        manufacturer: this.element.manufacturer.id,
        name: this.element.name,
        connections: this.element.connections.map((item) => item.id)
      }
    },

    addDriver() {
      this.drivers.push({
        id: 0,
        project: null,
        capability: null,
        name: null,
        packages_to_install: null
      })
    },

    removeDriver(index) {
      const removedItem = this.drivers.splice(index, 1)[0]
      if (removedItem.id > 0) {
        this.removedDrivers.push(removedItem.id)
      }
    },

    async updateRelated() {
      this.drivers.forEach((driver) => {
        if (driver.project === undefined || driver.capability === undefined) {
          return
        }

        if (driver.id > 0) {
          this.$axios
            .patch(`/api/v1/token/devices/drivers/${driver.id}/`, {
              model: this.element.id,
              project: driver.project.id,
              capability: driver.capability.id,
              name: driver.name,
              packages_to_install:
                driver.packages_to_install !== null
                  ? driver.packages_to_install.split('\n')
                  : []
            })
            .catch((error) => {
              this.$store.dispatch('ui/notifyError', error)
            })
        } else {
          this.$axios
            .post('/api/v1/token/devices/drivers/', {
              model: this.element.id,
              project: driver.project.id,
              capability: driver.capability.id,
              name: driver.name,
              packages_to_install:
                driver.packages_to_install !== null
                  ? driver.packages_to_install.split('\n')
                  : []
            })
            .catch((error) => {
              this.$store.dispatch('ui/notifyError', error)
            })
        }
      })

      this.removedDrivers.forEach((id) => {
        this.$axios
          .delete(`/api/v1/token/devices/drivers/${id}/`)
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
      })
    }
  }
}
</script>
