<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <div class="row">
      <div class="col-md">
        <h2 class="text-h3">
          Almacén:
          <MigasLink
            v-if="element.id"
            model="stores"
            :pk="element.id"
            :value="element.name"
            icon="mdi-store-24-hour"
          />
        </h2>
      </div>
    </div>

    <q-card>
      <q-card-section>
        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <q-select
              v-model="element.project"
              outlined
              label="Proyecto"
              :options="projects"
              option-value="id"
              option-label="name"
              lazy-rules
              :rules="[(val) => !!val || '* Required']"
            />
          </div>

          <div class="col-6 col-md">
            <q-input
              v-model="element.name"
              outlined
              label="Nombre"
              lazy-rules
              :rules="[(val) => !!val || '* Required']"
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
  data() {
    return {
      title: 'Store',
      breadcrumbs: [
        {
          text: 'Dashboard',
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: 'Liberación',
          icon: 'mdi-truck-delivery'
        },
        {
          text: 'Almacenes',
          to: 'stores-dashboard',
          icon: 'mdi-store-24-hour'
        }
      ],
      element: { id: 0 },
      projects: [],
      loading: false,
      confirmRemove: false
    }
  },
  computed: {
    isValid() {
      return (
        this.element.name !== undefined &&
        this.element.name !== '' &&
        this.element.hasOwnProperty('project')
      )
    }
  },
  created() {
    if (this.$route.params.id) {
      this.breadcrumbs.push({
        text: 'Resultados',
        to: 'stores-list'
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
        .get(`/api/v1/token/stores/${this.$route.params.id}/`)
        .then((response) => {
          this.element = response.data
          this.breadcrumbs.find((x) => x.text === 'Id').text = this.element.name
          this.title = `${this.title}: ${this.element.name}`
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    }

    await this.$axios
      .get(`/api/v1/token/projects/`)
      .then((response) => {
        this.projects = response.data.results
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
          .patch(`/api/v1/token/stores/${this.element.id}/`, {
            project: this.element.project.id,
            name: this.element.name
          })
          .then((response) => {
            this.$store.dispatch('ui/notifySuccess', 'Data has been changed!')
            if (action === 'return') {
              this.$router.push({ name: 'stores-list' })
            } else if (action === 'add') {
              this.element = { id: 0 }
              if (this.breadcrumbs.length === 5) this.breadcrumbs.pop()
              this.breadcrumbs[3].text = 'Añadir'
              this.$router.push({ name: 'store-add' })
              this.title = 'Store'
            }
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
          .finally(() => (this.loading = false))
      } else {
        this.loading = true
        await this.$axios
          .post('/api/v1/token/stores/', {
            project: this.element.project.id,
            name: this.element.name
          })
          .then((response) => {
            this.element = response.data
            this.element.project = this.projects.find(
              (x) => x.id === this.element.project
            )
            console.log('element new', this.element)
            this.$store.dispatch('ui/notifySuccess', 'Data has been added!')

            if (action === 'return') {
              this.$router.push({ name: 'stores-list' })
            } else if (action === 'add') {
              this.element = { id: 0 }
              this.$router.push({ name: 'store-add' })
            } else {
              if (this.breadcrumbs.length === 4) {
                this.breadcrumbs.pop()
                this.breadcrumbs.push({ text: 'Resultados', to: 'stores-list' })
                this.breadcrumbs.push({
                  text: this.element.name
                })
                this.title = `Store: ${this.element.name}`
              }
              this.$router.push({
                name: 'store-detail',
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
        .delete(`/api/v1/token/stores/${this.element.id}/`)
        .then((response) => {
          this.$router.push({ name: 'stores-list' })
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    }
  }
}
</script>
