<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Connection')">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="devices/connections"
          :pk="element.id"
          :value="element.name"
          icon="mdi-connection"
        />
      </template>
    </Header>

    <q-card>
      <q-card-section>
        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md col-sm">
            <q-input
              v-model="element.name"
              outlined
              :label="$gettext('Name')"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
            />
          </div>

          <div class="col-6 col-md col-sm">
            <q-select
              v-model="element.device_type"
              outlined
              :label="$gettext('Device Type')"
              :options="deviceTypes"
              option-value="id"
              option-label="name"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
              ><template #prepend>
                <q-icon name="mdi-devices" />
              </template>
            </q-select>
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-12 col-md col-sm">
            <q-input
              v-model="element.fields"
              outlined
              :label="$gettext('Fields')"
              :hint="$gettext('Format: NAME[:Placeholder],...')"
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
        :color="$q.dark.isActive ? 'white' : 'negative'"
        :class="{ 'reversed-delete': $q.dark.isActive }"
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

export default {
  meta() {
    return {
      title: this.title,
    }
  },
  components: {
    Breadcrumbs,
    Header,
    RemoveDialog,
    MigasLink,
  },
  mixins: [detailMixin],
  data() {
    const route = 'connections-list'
    const title = this.$gettext('Connection')
    const element = { id: 0 }

    return {
      title,
      originalTitle: title,
      model: 'devices/connections',
      listRoute: route,
      addRoute: 'connection-add',
      detailRoute: 'connection-detail',
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home',
        },
        {
          text: this.$gettext('Devices'),
          icon: 'mdi-printer-eye',
        },
        {
          text: this.$gettext('Connections'),
          icon: 'mdi-connection',
          to: route,
        },
      ],
      element,
      emptyElement: Object.assign({}, element),
      deviceTypes: [],
      confirmRemove: false,
    }
  },
  computed: {
    isValid() {
      return (
        this.element.name !== undefined &&
        this.element.name.trim() !== '' &&
        this.element.device_type !== undefined
      )
    },
  },
  methods: {
    async loadRelated() {
      await this.$axios
        .get('/api/v1/token/devices/types/')
        .then((response) => {
          this.deviceTypes = response.data.results
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    elementData() {
      return {
        name: this.element.name,
        device_type: this.element.device_type.id,
        fields: this.element.fields,
      }
    },
  },
}
</script>
