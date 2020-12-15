<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <template v-if="element.id">
      <Header :title="$gettext('Attribute')" :has-add-button="false">
        <template v-if="element.id" #append
          >:
          <MigasLink
            model="features"
            :pk="element.id"
            :value="attributeValue(element)"
            :icon="elementIcon(element.property_att.prefix)"
          />
        </template>
      </Header>

      <q-card>
        <q-card-section>
          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md">
              <translate>Value</translate>: {{ element.value }}
            </div>

            <div class="col-6 col-md">
              <translate>Formula</translate>:
              <MigasLink
                model="properties"
                :pk="element.property_att.id"
                :value="element.property_att.name || ''"
              />
            </div>
          </div>

          <div class="row q-pa-md">
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
            icon="mdi-content-save-edit"
            :label="$gettext('Save and continue editing')"
            :loading="loading"
            :disabled="!isValid || loading"
            @click="updateElement"
          />
          <q-btn
            color="primary"
            icon="mdi-content-save-move"
            :label="$gettext('Save')"
            :loading="loading"
            :disabled="!isValid || loading"
            @click="updateElement('return')"
          />
        </q-card-actions>
      </q-card>

      <div class="row q-pa-md">
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
    </template>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import RemoveDialog from 'components/ui/RemoveDialog'
import MigasLink from 'components/MigasLink'
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
    return {
      title: this.$gettext('Attribute'),
      model: 'features',
      listRoute: 'attributes-list',
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
          text: this.$gettext('Attributes'),
          to: 'attributes-dashboard',
          icon: 'mdi-pound'
        },
        {
          text: this.$gettext('Results'),
          to: this.listRoute
        },
        {
          text: 'Id'
        }
      ],
      element: {},
      loading: false,
      isValid: true,
      confirmRemove: false
    }
  },
  async mounted() {
    await this.$axios
      .get(`/api/v1/token/${this.model}/${this.$route.params.id}/`)
      .then((response) => {
        this.element = response.data
        this.breadcrumbs[
          this.breadcrumbs.length - 1
        ].text = this.attributeValue(this.element)
        this.title = `${this.title}: ${this.attributeValue(this.element)}`
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })
  },
  methods: {
    async updateElement(action = null) {
      this.loading = true
      await this.$axios
        .patch(`/api/v1/token/${this.model}/${this.element.id}/`, {
          description: this.element.description
        })
        .then((response) => {
          this.$store.dispatch(
            'ui/notifySuccess',
            this.$gettext('Data has been changed!')
          )
          if (action === 'return') {
            this.$router.push({ name: this.listRoute })
          }
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
        .finally(() => (this.loading = false))
    }
  }
}
</script>
