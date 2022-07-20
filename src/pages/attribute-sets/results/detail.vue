<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Attribute Set')">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="attribute-sets"
          :pk="element.id"
          :value="element.name"
          icon="mdi-set-none"
        />
      </template>
    </Header>

    <q-card>
      <q-card-section>
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">General</div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md col-sm">
            <q-checkbox
              v-model="element.enabled"
              left-label
              :label="$gettext('Enabled?')"
            />
          </div>

          <div class="col-6 col-md col-sm">
            <q-input
              v-model="element.name"
              outlined
              :label="$gettext('Name')"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
            />
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-12 col-md col-sm">
            <q-input
              v-model="element.description"
              outlined
              type="textarea"
              :label="$gettext('Description')"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">Attributes</div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md col-sm">
            <SelectAttributes
              v-model="element.included_attributes"
              :label="$gettext('Included')"
            />
          </div>

          <div class="col-6 col-md col-sm">
            <SelectAttributes
              v-model="element.excluded_attributes"
              :label="$gettext('Excluded')"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">Location</div>

        <q-toggle
          v-model="viewMap"
          :label="
            viewMap
              ? $gettext('Remove Coordinates')
              : $gettext('Add Coordinates')
          "
          :false-value="false"
          :true-value="true"
          @input="updateCoords"
        />

        <template v-if="viewMap">
          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <q-input
                v-model="element.latitude"
                outlined
                :label="$gettext('Latitude')"
                @input="updateMapCoords"
              />
            </div>

            <div class="col-6 col-md col-sm">
              <q-input
                v-model="element.longitude"
                outlined
                :label="$gettext('Longitude')"
                @input="updateMapCoords"
              />
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col">
              <AddLocation v-model="coords" @update-coords="updateCoords" />
            </div>
          </div>
        </template>
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
import SelectAttributes from 'components/ui/SelectAttributes'
import AddLocation from 'components/map/AddLocation'
import RemoveDialog from 'components/ui/RemoveDialog'
import { detailMixin } from 'mixins/detail'
import { elementMixin } from 'mixins/element'

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
    SelectAttributes,
    AddLocation,
  },
  mixins: [detailMixin, elementMixin],
  data() {
    const route = 'attribute-sets-list'
    const title = this.$gettext('Attribute Set')
    const element = {
      id: 0,
      enabled: false,
      included_attributes: [],
      excluded_attributes: [],
    }

    return {
      title,
      originalTitle: title,
      model: 'attribute-sets',
      listRoute: route,
      addRoute: 'attribute-set-add',
      detailRoute: 'attribute-set-detail',
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home',
        },
        {
          text: this.$gettext('Configuration'),
          icon: 'mdi-cogs',
        },
        {
          text: this.$gettext('Attribute Sets'),
          icon: 'mdi-set-none',
          to: route,
        },
      ],
      element,
      emptyElement: Object.assign({}, element),
      confirmRemove: false,

      viewMap: false,
      coords: [0, 0],
    }
  },
  computed: {
    isValid() {
      return this.element.name !== undefined && this.element.name.trim() !== ''
    },
  },
  methods: {
    elementData() {
      return {
        name: this.element.name,
        description: this.element.description,
        enabled: this.element.enabled,
        included_attributes: this.element.included_attributes.map(
          (item) => item.id
        ),
        excluded_attributes: this.element.excluded_attributes.map(
          (item) => item.id
        ),
        latitude: this.element.latitude,
        longitude: this.element.longitude,
      }
    },

    setRelated() {
      if (this.element.latitude !== null) {
        this.coords = [this.element.latitude, this.element.longitude]
        this.viewMap = true
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.coords = [position.coords.latitude, position.coords.longitude]
        })
      }
    },

    updateCoords(params) {
      if (this.viewMap) {
        this.element.latitude = params[0]
        this.element.longitude = params[1]
      } else {
        this.element.latitude = null
        this.element.longitude = null
      }
    },

    updateMapCoords() {
      this.coords = [this.element.latitude, this.element.longitude]
    },
  },
}
</script>
