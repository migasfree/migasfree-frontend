<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Device')">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="devices/devices"
          :pk="element.id"
          :value="element.name"
          icon="mdi-printer"
        />
      </template>
    </Header>

    <q-card>
      <q-card-section>
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">General</div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <q-input
              v-model="element.name"
              outlined
              :label="$gettext('Name')"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
            />
          </div>

          <div class="col-6 col-md">
            <SelectAttributes
              v-model="element.available_for_attributes"
              :label="$gettext('Available for Attributes')"
            />
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <q-select
              v-model="element.model"
              outlined
              use-input
              map-options
              input-debounce="0"
              :label="$gettext('Model')"
              :options="models"
              @filter="filterModels"
              @filter-abort="abortFilterModels"
              @input="resetConnections"
            >
              <template #no-option>
                <q-item>
                  <q-item-section v-translate class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>

              <template #option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  {{ scope.opt.name }}
                </q-item>
              </template>

              <template #selected-item="scope">
                <q-chip
                  removable
                  dense
                  :tabindex="scope.tabindex"
                  class="q-ma-md"
                  @remove="scope.removeAtIndex(scope.index)"
                >
                  <MigasLink
                    model="devices/models"
                    :pk="scope.opt.id"
                    :value="
                      `${scope.opt.name} (${scope.opt.manufacturer.name})`
                    "
                    icon="mdi-shape"
                  />
                </q-chip>
              </template>
            </q-select>
          </div>

          <div class="col-6 col-md">
            <q-select
              v-if="element.model"
              v-model="element.connection"
              outlined
              :label="$gettext('Connection')"
              :options="element.model.connections"
              option-value="id"
              option-label="name"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
              @input="localConnectionFields"
              ><template #prepend>
                <q-icon name="mdi-connection" />
              </template>
            </q-select>
          </div>
        </div>
      </q-card-section>

      <q-card-section v-if="element.connection">
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">Connection Fields</div>

        <div
          v-for="(field, index) in element.connection.fields"
          :key="index"
          class="row q-pa-md q-gutter-md"
        >
          <div class="col-md">
            <q-input
              v-model="field.value"
              outlined
              :label="field.id"
              :hint="field.hint"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">Logical Devices</div>

        <q-list
          v-if="logicalDevices.length > 0"
          class="q-pa-md"
          bordered
          separator
        >
          <q-item v-for="(logical, index) in logicalDevices" :key="index">
            <q-item-section side top>
              <q-btn
                flat
                dense
                round
                color="negative"
                icon="mdi-delete"
                @click="removeInline(index)"
                ><q-tooltip>{{ $gettext('Delete') }}</q-tooltip></q-btn
              >
            </q-item-section>

            <q-item-section>
              <div class="row q-pa-md q-gutter-md">
                <div class="col-md">
                  <q-select
                    v-model="logical.capability"
                    outlined
                    :label="$gettext('Capability')"
                    :options="capabilities"
                    option-value="id"
                    option-label="name"
                    lazy-rules
                    :rules="[(val) => !!val || $gettext('* Required')]"
                  >
                    <template #prepend>
                      <q-icon name="mdi-format-list-bulleted-type" />
                    </template>
                  </q-select>
                </div>

                <div class="col-md">
                  <q-input
                    v-model="logical.alternative_capability_name"
                    outlined
                    :label="$gettext('Alternative Capability Name')"
                  />
                </div>
              </div>

              <div class="row q-pa-md q-gutter-md">
                <div class="col-md">
                  <SelectAttributes
                    v-model="logical.attributes"
                    :label="$gettext('Attributes')"
                  />
                </div>
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <div class="q-pa-md">
          <q-btn
            icon="mdi-plus"
            :label="$gettext('Add other Logical Device')"
            @click="addInline"
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
import SelectAttributes from 'components/ui/SelectAttributes'
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
    MigasLink,
    SelectAttributes
  },
  mixins: [detailMixin, elementMixin],
  data() {
    const route = 'devices-list'
    const title = this.$gettext('Device')
    const element = { id: 0, available_for_attributes: [] }

    return {
      title,
      originalTitle: title,
      model: 'devices/devices',
      listRoute: route,
      addRoute: 'device-add',
      detailRoute: 'device-detail',
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
          text: this.$gettext('Devices'),
          icon: 'mdi-printer',
          to: route
        }
      ],
      element,
      emptyElement: Object.assign({}, element),
      models: [],
      logicalDevices: [],
      removedLogicalDevices: [],
      capabilities: [],
      confirmRemove: false
    }
  },
  computed: {
    isValid() {
      return (
        this.element.name !== undefined &&
        this.element.name !== '' &&
        this.element.model !== undefined &&
        this.element.connection !== null
      )
    }
  },
  watch: {
    logicalDevices: {
      handler: function(val, oldVal) {},
      deep: true
    }
  },
  methods: {
    async loadRelated() {
      await this.$axios
        .get('/api/v1/token/devices/capabilities/')
        .then((response) => {
          this.capabilities = response.data.results
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })

      if (this.element.id) {
        await this.$axios
          .get(`/api/v1/token/devices/logical/?device__id=${this.element.id}`)
          .then((response) => {
            this.logicalDevices = response.data.results
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })

        this.localConnectionFields()
      }
    },

    elementData() {
      return {
        name: this.element.name,
        model: this.element.model.id,
        connection: this.element.connection.id,
        available_for_attributes: this.element.available_for_attributes
          ? this.element.available_for_attributes.map((item) => item.id)
          : [],
        data: this.element.connection.fields.reduce((obj, v) => {
          if (v.value) obj[v.id] = v.value
          return obj
        }, {})
      }
    },

    filterModels(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3) {
        abort()
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.$axios
          .get('/api/v1/token/devices/models/', { params: { search: needle } })
          .then((response) => {
            this.models = response.data.results
          })
        /* this.models = stringOptions.filter(
          (v) => v.toLowerCase().indexOf(needle) > -1
        ) */
      })
    },

    abortFilterModels() {
      // console.log('delayed filter aborted')
    },

    resetConnections() {
      this.$set(this.element, 'connection', null)
    },

    async localConnectionFields() {
      if (this.element.connection.id)
        await this.$axios
          .get(
            `/api/v1/token/devices/connections/${this.element.connection.id}/`
          )
          .then((response) => {
            this.$set(
              this.element.connection,
              'fields',
              response.data.fields.split(',').map((item) => {
                const field = item.trim().split(':')

                return {
                  id: field[0],
                  value:
                    'data' in this.element && field[0] in this.element.data
                      ? this.element.data[field[0]]
                      : null,
                  hint: field[1] ? field[1] : null
                }
              })
            )
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
    },

    addInline() {
      this.logicalDevices.push({
        id: 0,
        capability: null,
        alternative_capability_name: null,
        attributes: []
      })
    },

    removeInline(index) {
      const removedItem = this.logicalDevices.splice(index, 1)[0]
      if (removedItem.id > 0) {
        this.removedLogicalDevices.push(removedItem.id)
      }
    },

    async updateRelated() {
      this.logicalDevices.forEach((logical) => {
        if (logical.capability === undefined) {
          return
        }

        if (logical.id > 0) {
          this.$axios
            .patch(`/api/v1/token/devices/logical/${logical.id}/`, {
              id: logical.id,
              device: this.element.id,
              capability: logical.capability.id,
              alternative_capability_name: logical.alternative_capability_name,
              attributes:
                logical.attributes !== null
                  ? logical.attributes.map((item) => item.id)
                  : []
            })
            .catch((error) => {
              this.$store.dispatch('ui/notifyError', error)
            })
        } else {
          this.$axios
            .post('/api/v1/token/devices/logical/', {
              device: this.element.id,
              capability: logical.capability.id,
              alternative_capability_name: logical.alternative_capability_name,
              attributes:
                logical.attributes !== null
                  ? logical.attributes.map((item) => item.id)
                  : []
            })
            .catch((error) => {
              this.$store.dispatch('ui/notifyError', error)
            })
        }
      })

      this.removedLogicalDevices.forEach((id) => {
        this.$axios
          .delete(`/api/v1/token/devices/logical/${id}/`)
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
      })
    },

    async setRelated() {
      await this.localConnectionFields()
    },

    resetRelated() {
      this.logicalDevices = []
    }
  }
}
</script>
