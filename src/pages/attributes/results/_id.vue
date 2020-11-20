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
          <p>
            Fórmula:
            <MigasLink
              model="properties"
              :pk="element.property_att.id"
              :value="element.property_att.name || ''"
            />
          </p>

          <p>Valor: {{ element.value }}</p>

          <p>
            <q-input
              v-model="element.description"
              outlined
              type="textarea"
              label="Descripción"
            />
          </p>
        </q-card-section>

        <q-card-actions>
          <q-btn
            class="full-width"
            color="primary"
            icon="mdi-content-save"
            :loading="loading"
            :disabled="loading"
            @click="updateElement"
          />
        </q-card-actions>
      </q-card>

      <div class="row q-pa-md">
        <q-btn
          icon="mdi-delete"
          color="negative"
          label="Borrar"
          @click="remove"
        />
      </div>
    </template>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import MigasLink from 'components/MigasLink'
import { elementMixin } from 'mixins/element'

export default {
  components: {
    Breadcrumbs,
    MigasLink
  },
  mixins: [elementMixin],
  data() {
    return {
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
      loading: false
    }
  },
  async mounted() {
    await this.$axios
      .get(`/api/v1/token/features/${this.$route.params.id}/`)
      .then((response) => {
        console.log(response)
        this.element = response.data
        this.breadcrumbs[4].text = this.attributeValue(this.element)
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })
  },
  methods: {
    async updateElement() {
      this.loading = true
      await this.$axios
        .patch(`/api/v1/token/features/${this.element.id}/`, {
          description: this.element.description,
        })
        .then((response) => {
          console.log(response)
          this.loading = false
          this.$store.dispatch(
            'ui/notifySuccess',
            'Data has been changed!'
          )
        })
        .catch((error) => {
          this.loading = false
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    remove() {
      console.log(this.element.id)
    }
  }
}
</script>
