<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Device Type')">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="devices/types"
          :pk="element.id"
          :value="element.name"
          icon="mdi-devices"
        />
      </template>
    </Header>

    <q-card>
      <q-card-section>
        <div class="row q-pa-md q-gutter-md">
          <div class="col-12">
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
  mixins: [detailMixin],
  data() {
    const route = 'device-types-list'
    const title = this.$gettext('Device Type')
    const element = { id: 0 }

    return {
      title,
      originalTitle: title,
      model: 'devices/types',
      listRoute: route,
      addRoute: 'device-type-add',
      detailRoute: 'device-type-detail',
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
          text: this.$gettext('Device Types'),
          icon: 'mdi-devices',
          to: route
        }
      ],
      element,
      emptyElement: Object.assign({}, element),
      confirmRemove: false
    }
  },
  computed: {
    isValid() {
      return this.element.name !== undefined && this.element.name !== ''
    }
  },
  methods: {
    elementData() {
      return {
        name: this.element.name
      }
    }
  }
}
</script>
