<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <div class="row">
      <div class="col-md">
        <h2 class="text-h3">
          Etiqueta:
          <MigasLink
            v-if="element.id"
            model="tags"
            :pk="element.id"
            :value="attributeValue(element)"
            icon="mdi-tag"
          />
        </h2>
      </div>
    </div>

    <q-card>
      <q-card-section>
        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <q-select
              v-model="element.property_att"
              outlined
              label="Categoría de etiqueta"
              :options="stamps"
              option-value="id"
              option-label="name"
              lazy-rules
              :rules="[(val) => !!val || '* Required']"
            />
          </div>

          <div class="col-6 col-md">
            <q-input
              v-model="element.value"
              outlined
              label="Valor"
              lazy-rules
              :rules="[(val) => !!val || '* Required']"
            />
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
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
          label="Grabar y añadir otro"
          icon="mdi-plus"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="updateElement('add')"
        />
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

    <div v-if="$route.params.id && element.id" class="row q-pa-md">
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
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import MigasLink from 'components/MigasLink'
import RemoveDialog from 'components/ui/RemoveDialog'
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
      title: 'Tag',
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
          text: 'Etiquetas',
          to: 'tags-dashboard',
          icon: 'mdi-tag'
        }
      ],
      element: { id: 0 },
      stamps: [],
      loading: false,
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
    }
  },
  created() {
    if (this.$route.params.id) {
      this.breadcrumbs.push({
        text: 'Resultados',
        to: 'tags-list'
      })
      this.breadcrumbs.push({
        text: 'Id'
      })
    } else {
      this.breadcrumbs.push({ text: 'Añadir' })
    }
  },
  async mounted() {
    if (this.$route.params.id) {
      await this.$axios
        .get(`/api/v1/token/tags/${this.$route.params.id}/`)
        .then((response) => {
          this.element = response.data
          this.breadcrumbs.find(
            (x) => x.text === 'Id'
          ).text = this.attributeValue(this.element)
          this.title = `${this.title}: ${this.attributeValue(this.element)}`
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    }

    await this.$axios
      .get(`/api/v1/token/stamps/`)
      .then((response) => {
        this.stamps = response.data.results
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })
  },
  methods: {
    async updateElement(action = null) {
      if (this.element.id) {
        this.loading = true
        await this.$axios
          .patch(`/api/v1/token/tags/${this.element.id}/`, {
            property_att: this.element.property_att.id,
            value: this.element.value,
            description: this.element.description
          })
          .then((response) => {
            this.$store.dispatch('ui/notifySuccess', 'Data has been changed!')
            if (action === 'return') {
              this.$router.push({ name: 'tags-list' })
            } else if (action === 'add') {
              this.element = { id: 0 }
              if (this.breadcrumbs.length === 5) this.breadcrumbs.pop()
              this.breadcrumbs[3].text = 'Añadir'
              this.$router.push({ name: 'tag-add' })
              this.title = 'Tag'
            }
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
          .finally(() => (this.loading = false))
      } else {
        this.loading = true
        await this.$axios
          .post('/api/v1/token/tags/', {
            property_att: this.element.property_att.id,
            value: this.element.value,
            description: this.element.description
          })
          .then((response) => {
            this.element = response.data
            this.element.property_att = this.stamps.find(
              (x) => x.id === this.element.property_att
            )
            console.log('element new', this.element)
            this.$store.dispatch('ui/notifySuccess', 'Data has been added!')

            if (action === 'return') {
              this.$router.push({ name: 'tags-list' })
            } else if (action === 'add') {
              this.element = { id: 0 }
              this.$router.push({ name: 'tag-add' })
            } else {
              if (this.breadcrumbs.length === 4) {
                this.breadcrumbs.pop()
                this.breadcrumbs.push({ text: 'Resultados', to: 'tags-list' })
                this.breadcrumbs.push({
                  text: this.attributeValue(this.element)
                })
                this.title = `Tag: ${this.attributeValue(this.element)}`
              }
              this.$router.push({
                name: 'tag-detail',
                params: { id: this.element.id }
              })
            }
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
          .finally(() => (this.loading = false))
      }
    },

    async remove() {
      await this.$axios
        .delete(`/api/v1/token/tags/${this.element.id}/`)
        .then((response) => {
          this.$router.push({ name: 'tags-list' })
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    }
  }
}
</script>
