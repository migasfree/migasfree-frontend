<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Tag')" :has-add-button="false">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="tags"
          :pk="element.id"
          :value="attributeValue(element)"
          icon="mdi-tag"
        />
      </template>
    </Header>

    <q-card>
      <q-card-section>
        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <q-select
              v-model="element.property_att"
              outlined
              :label="$gettext('Stamp')"
              :options="stamps"
              option-value="id"
              option-label="name"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
            />
          </div>

          <div class="col-6 col-md">
            <q-input
              v-model="element.value"
              outlined
              label="Valor"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
            />
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-12">
            <q-input
              v-model="element.description"
              outlined
              type="textarea"
              :label="$gettext('Description')"
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
import { elementMixin } from 'mixins/element'
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
  mixins: [elementMixin, detailMixin],
  data() {
    const title = this.$gettext('Tag')
    const element = { id: 0 }

    return {
      title,
      originalTitle: title,
      model: 'tags',
      listRoute: 'tags-list',
      addRoute: 'tag-add',
      detailRoute: 'tag-detail',
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
          text: this.$gettext('Tags'),
          to: 'tags-dashboard',
          icon: 'mdi-tag'
        }
      ],
      element,
      emptyElement: element,
      stamps: [],
      confirmRemove: false
    }
  },
  computed: {
    isValid() {
      return (
        this.element.value !== undefined &&
        this.element.value !== '' &&
        this.element.hasOwnProperty('property_att')
      )
    },
    elementText() {
      return this.element.id ? this.attributeValue(this.element) : ''
    }
  },
  methods: {
    async loadRelated() {
      await this.$axios
        .get(`/api/v1/token/stamps/`)
        .then((response) => {
          this.stamps = response.data.results
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    elementData() {
      return {
        property_att: this.element.property_att.id,
        value: this.element.value,
        description: this.element.description
      }
    },

    setRelated() {
      this.element.property_att = this.stamps.find(
        (x) => x.id === this.element.property_att
      )
    }
  }
}
</script>
