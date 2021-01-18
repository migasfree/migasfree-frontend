<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Device')" :has-add-button="false">
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
        </div>

        <div class="col-6 col-md">
          <q-select
            v-model="element.available_for_attributes"
            outlined
            use-input
            map-options
            multiple
            input-debounce="0"
            :label="$gettext('Available for Attributes')"
            :options="attributes"
            @filter="filterAttributes"
            @filter-abort="abortFilterAttributes"
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
                {{ attributeValue(scope.opt) }}
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
                  model="attributes"
                  :pk="scope.opt.id"
                  :value="attributeValue(scope.opt)"
                />
              </q-chip>
            </template>
          </q-select>
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
      attributes: [],
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
    },

    filterAttributes(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3) {
        abort()
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.$axios
          .get('/api/v1/token/attributes/', { params: { search: needle } })
          .then((response) => {
            this.attributes = response.data.results
          })
        /* this.attributes = stringOptions.filter(
          (v) => v.toLowerCase().indexOf(needle) > -1
        ) */
      })
    },

    abortFilterAttributes() {
      // console.log('delayed filter aborted')
    }
  }
}
</script>
