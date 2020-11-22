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
            :icon="elementIcon(element.property_att.prefix)"
          />
        </h2>
      </div>
    </div>

    <q-card>
      <q-card-section>
        <p>
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
        </p>

        <p>
          <q-input
            v-model="element.value"
            outlined
            label="Valor"
            lazy-rules
            :rules="[(val) => !!val || '* Required']"
          />
        </p>

        <p>
          <q-input
            v-model="element.description"
            outlined
            type="textarea"
            label="Descripción"
          />
        </p>
      </q-card-section>
      <q-card-actions class="justify-around">
        <q-btn
          label="Grabar y añadir otro"
          icon="mdi-plus"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="updateElement('add')"
        />
        <q-btn
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
  components: {
    Breadcrumbs,
    RemoveDialog,
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
          console.log(response)
          this.element = response.data
          this.breadcrumbs[4].text = this.attributeValue(this.element)
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    }

    await this.$axios
      .get(`/api/v1/token/stamps/`)
      .then((response) => {
        console.log(response)
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
            console.log(response)
            this.$store.dispatch('ui/notifySuccess', 'Data has been changed!')
            if (action === 'return') {
              this.$router.push({ name: 'tags-list' })
            } else if (action === 'add') {
              this.element = { id: 0 }
              this.breadcrumbs[4].text = 'Añadir'
              this.$router.push({ name: 'tag-add' })
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
            console.log(response)
            this.element = response.data
            this.element.property_att = this.stamps.filter(
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
      console.log(this.element.id)
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
