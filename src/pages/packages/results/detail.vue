<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <div class="row">
      <div class="col-md">
        <h2 class="text-h3">
          Paquete:
          <MigasLink
            v-if="element.id"
            model="packages"
            :pk="element.id"
            :value="element.fullname"
            icon="mdi-package-variant"
          />
        </h2>
      </div>
    </div>

    <q-card>
      <q-card-section>
        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <template v-if="element.id">
              Proyecto:
              <MigasLink
                model="projects"
                :pk="element.project.id"
                :value="element.project.name"
              />
            </template>
            <q-input
              v-else
              v-model="projectStore.selected"
              outlined
              readonly
              label="Proyecto / Almacén"
              @input="$refs.menu.show()"
            >
              <template #append>
                <q-icon name="mdi-menu-down" class="cursor-pointer" />
              </template>

              <q-menu ref="menu" fit auto-close>
                <q-tree
                  ref="tree"
                  class="q-ma-sm"
                  :nodes="projectStore.items"
                  node-key="id"
                  label-key="label"
                  :default-expand-all="true"
                  :selected="projectStore.selected"
                  @update:selected="nodeSelected"
                  @lazy-load="onLazyLoad"
                >
                </q-tree>
              </q-menu>
            </q-input>
          </div>

          <div class="col-6 col-md">
            <template v-if="element.id">
              Almacén:
              <MigasLink
                v-if="element.store.id > 0"
                model="stores"
                :pk="element.store.id"
                :value="element.store.name"
              />
            </template>
          </div>
        </div>

        <div v-if="element.id === 0" class="row q-pa-md q-gutter-md">
          <div class="col-12">
            <q-file
              v-model="element.files"
              clearable
              outlined
              counter
              label="Selecciona un fichero"
            />
          </div>
        </div>

        <div v-if="element.id" class="row q-pa-md q-gutter-md">
          <div class="col-4 col-md">
            Nombre: <strong>{{ element.name }}</strong>
          </div>

          <div class="col-4 col-md">
            Versión: <strong>{{ element.version }}</strong>
          </div>

          <div class="col-4 col-md">
            Arquitectura: <strong>{{ element.architecture }}</strong>
          </div>
        </div>
      </q-card-section>

      <q-card-actions v-if="element.id === 0" class="justify-around">
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
      title: 'Paquete',
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
          text: 'Paquetes',
          to: 'packages-dashboard',
          icon: 'mdi-package-variant'
        }
      ],
      element: { id: 0, files: null },
      projectStore: { items: [], selected: null },
      loading: false,
      confirmRemove: false
    }
  },
  computed: {
    isValid() {
      return (
        this.projectStore.selected !== null && this.element.files !== undefined
      )
    }
  },
  created() {
    if (this.$route.params.id) {
      this.breadcrumbs.push({
        text: 'Resultados',
        to: 'packages-list'
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
        .get(`/api/v1/token/packages/${this.$route.params.id}/`)
        .then((response) => {
          this.element = response.data
          this.breadcrumbs.find(
            (x) => x.text === 'Id'
          ).text = this.element.fullname
          this.title = `${this.title}: ${this.element.fullname}`
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    }

    await this.$axios
      .get(`/api/v1/token/projects/`)
      .then((response) => {
        this.projects = response.data.results

        this.projectStore.items = Object.entries(this.projects).map(
          ([key, item]) => {
            return {
              id: item.id,
              label: item.name,
              icon: 'mdi-sitemap',
              lazy: true
            }
          }
        )
        console.log(this.projectStore.items)
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })
  },
  methods: {
    nodeSelected(value) {
      if (typeof value !== 'string') return

      const keys = value.split('|')
      if (keys.length != 2) return

      const nodeProject = this.$refs.tree.getNodeByKey(parseInt(keys[0]))
      const nodeStore = this.$refs.tree.getNodeByKey(value)

      this.projectStore.selected = `${nodeProject.label} / ${nodeStore.label}`
      Object.assign(this.element, {
        project: { id: nodeProject.id },
        store: { id: nodeStore.store_id }
      })

      this.$refs.menu.hide()
    },

    onLazyLoad({ node, key, done, fail }) {
      this.$axios
        .get('/api/v1/token/stores/', { params: { project__id: key } })
        .then((response) => {
          done(
            Object.entries(response.data.results).map(([index, item]) => {
              return {
                id: `${key}|${item.id}`,
                label: item.name,
                icon: 'mdi-store-24-hour',
                store_id: item.id
              }
            })
          )
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    async updateElement(action = null) {
      let data = new FormData()
      if (this.element.id) {
        this.loading = true
        await this.$axios
          .patch(`/api/v1/token/packages/${this.element.id}/`, {
            property_att: this.element.property_att.id,
            value: this.element.value,
            description: this.element.description
          })
          .then((response) => {
            this.$store.dispatch('ui/notifySuccess', 'Data has been changed!')
            if (action === 'return') {
              this.$router.push({ name: 'packages-list' })
            } else if (action === 'add') {
              this.element = { id: 0 }
              if (this.breadcrumbs.length === 5) this.breadcrumbs.pop()
              this.breadcrumbs[3].text = 'Añadir'
              this.$router.push({ name: 'package-add' })
              this.title = 'Paquete'
            }
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
          .finally(() => (this.loading = false))
      } else {
        this.loading = true
        data.append('project', this.element.project.id)
        data.append('store', this.element.store.id)
        data.append('files', this.element.files)
        await this.$axios
          .post('/api/v1/token/packages/', data, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          .then((response) => {
            this.element = response.data
            console.log('element new', this.element)
            this.$store.dispatch('ui/notifySuccess', 'Data has been added!')

            if (action === 'return') {
              this.$router.push({ name: 'packages-list' })
            } else if (action === 'add') {
              this.element = { id: 0 }
              this.$router.push({ name: 'package-add' })
            } else {
              if (this.breadcrumbs.length === 4) {
                this.breadcrumbs.pop()
                this.breadcrumbs.push({
                  text: 'Resultados',
                  to: 'packages-list'
                })
                this.breadcrumbs.push({
                  text: this.element.fullname
                })
                this.title = `Paquete: ${this.element.fullname}`
              }
              this.$router.push({
                name: 'package-detail',
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
        .delete(`/api/v1/token/packages/${this.element.id}/`)
        .then((response) => {
          this.$router.push({ name: 'packages-list' })
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    }
  }
}
</script>
