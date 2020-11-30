<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <template v-if="element.id">
      <div class="row">
        <div class="col-md">
          <h2 class="text-h3">
            Atributo:
            <MigasLink
              model="features"
              :pk="element.id"
              :value="attributeValue(element)"
              :icon="elementIcon(element.property_att.prefix)"
            />
          </h2>
        </div>
      </div>

      <q-card>
        <q-card-section>
          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md">Valor: {{ element.value }}</div>

            <div class="col-6 col-md">
              Fórmula:
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
                label="Descripción"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="justify-around">
          <q-btn
            flat
            color="primary"
            label="Grabar y seguir editando"
            icon="mdi-content-save-edit"
            :loading="loading"
            :disabled="!isValid || loading"
            @click="updateElement"
          />
          <q-btn
            label="Grabar"
            color="primary"
            icon="mdi-content-save-move"
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
          label="Borrar"
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
import RemoveDialog from 'components/ui/RemoveDialog'
import MigasLink from 'components/MigasLink'
import { elementMixin } from 'mixins/element'

export default {
  meta() {
    return {
      title: this.title
    }
  },
  components: {
    Breadcrumbs,
    RemoveDialog,
    MigasLink
  },
  mixins: [elementMixin],
  data() {
    return {
      title: 'Attribute',
      breadcrumbs: [
        {
          text: 'Dashboard',
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: 'Datos',
          icon: 'mdi-database-search'
        },
        {
          text: 'Atributos',
          to: 'attributes-dashboard',
          icon: 'mdi-pound'
        },
        {
          text: 'Resultados',
          to: 'attributes-list'
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
      .get(`/api/v1/token/features/${this.$route.params.id}/`)
      .then((response) => {
        console.log(response)
        this.element = response.data
        this.breadcrumbs[
          this.breadcrumbs.length - 1
        ].text = this.attributeValue(this.element)
        this.title = `Attribute: ${this.attributeValue(this.element)}`
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })
  },
  methods: {
    async updateElement(action = null) {
      this.loading = true
      await this.$axios
        .patch(`/api/v1/token/features/${this.element.id}/`, {
          description: this.element.description
        })
        .then((response) => {
          console.log(response)
          this.$store.dispatch('ui/notifySuccess', 'Data has been changed!')
          if (action === 'return') {
            this.$router.push({ name: 'attributes-list' })
          }
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
        .finally(() => (this.loading = false))
    },

    async remove() {
      console.log(this.element.id)
      await this.$axios
        .delete(`/api/v1/token/features/${this.element.id}/`)
        .then((response) => {
          this.$router.push({ name: 'attributes-list' })
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    }
  }
}
</script>
