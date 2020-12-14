<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Package')" :has-add-button="false">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="packages"
          :pk="element.id"
          :value="element.fullname"
          icon="mdi-package-variant"
        />
      </template>
    </Header>

    <q-card>
      <q-card-section>
        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <template v-if="element.id">
              <translate>Project</translate>:
              <MigasLink
                model="projects"
                :pk="element.project.id"
                :value="element.project.name"
                icon="mdi-sitemap"
              />
            </template>
            <q-input
              v-else
              v-model="projectStore.selected"
              outlined
              readonly
              label-slot
              @input="$refs.menu.show()"
            >
              <template #label>
                <translate>Project / Store</translate>
              </template>

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
              <translate>Store</translate>:
              <MigasLink
                v-if="element.store.id > 0"
                model="stores"
                :pk="element.store.id"
                :value="element.store.name"
                icon="mdi-store-24-hour"
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
              label-slot
            >
              <template #label
                ><translate>Select one file</translate></template
              ></q-file
            >
          </div>
        </div>

        <div v-if="element.id" class="row q-pa-md q-gutter-md">
          <div class="col-4 col-md">
            <translate>Name</translate>: <strong>{{ element.name }}</strong>
          </div>

          <div class="col-4 col-md">
            <translate>Version</translate>:
            <strong>{{ element.version }}</strong>
          </div>

          <div class="col-4 col-md">
            <translate>Architecture</translate>:
            <strong>{{ element.architecture }}</strong>
          </div>
        </div>
      </q-card-section>

      <q-card-actions v-if="element.id === 0" class="justify-around">
        <q-btn
          flat
          color="primary"
          icon="mdi-plus"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="updateElement('add')"
          ><translate>Save and add other</translate></q-btn
        >
        <q-btn
          color="primary"
          icon="mdi-content-save-move"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="updateElement('return')"
          ><translate>Save</translate></q-btn
        >
      </q-card-actions>
    </q-card>

    <div v-if="$route.params.id && element.id" class="row q-pa-md">
      <q-btn
        flat
        icon="mdi-delete"
        color="negative"
        @click="confirmRemove = true"
        ><translate>Delete</translate></q-btn
      >
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
    return {
      title: this.$gettext('Package'),
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: this.$gettext('Release'),
          icon: 'mdi-truck-delivery'
        },
        {
          text: this.$gettext('Packages'),
          to: 'packages-dashboard',
          icon: 'mdi-package-variant'
        }
      ],
      element: { id: 0, files: null },
      model: 'packages',
      listRoute: 'packages-list',
      addRoute: 'package-add',
      detailRoute: 'package-detail',
      projectStore: { items: [], selected: null },
      loading: false,
      confirmRemove: false
    }
  },
  computed: {
    isValid() {
      return this.projectStore.selected !== null && this.element.files !== null
    }
  },
  created() {
    if (this.$route.params.id) {
      this.breadcrumbs.push({
        text: this.$gettext('Results'),
        to: this.listRoute
      })
      this.breadcrumbs.push({
        text: 'Id'
      })
    } else {
      this.breadcrumbs.push({ text: this.$gettext('Add') })
    }
  },
  async mounted() {
    if (this.$route.params.id) {
      await this.$axios
        .get(`/api/v1/token/${this.model}/${this.$route.params.id}/`)
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
          .patch(`/api/v1/token/${this.model}/${this.element.id}/`, {
            property_att: this.element.property_att.id,
            value: this.element.value,
            description: this.element.description
          })
          .then((response) => {
            this.$store.dispatch(
              'ui/notifySuccess',
              this.$gettext('Data has been changed!')
            )
            if (action === 'return') {
              this.$router.push({ name: this.listRoute })
            } else if (action === 'add') {
              this.element = { id: 0 }
              if (this.breadcrumbs.length === 5) this.breadcrumbs.pop()
              this.breadcrumbs[3].text = this.$gettext('Add')
              this.$router.push({ name: this.addRoute })
              this.title = this.$gettext('Package')
              this.projectStore.selected = null
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
          .post(`/api/v1/token/${this.model}`, data, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          .then((response) => {
            this.element = response.data
            console.log('element new', this.element)
            this.$store.dispatch(
              'ui/notifySuccess',
              this.$gettext('Data has been added!')
            )

            if (action === 'return') {
              this.$router.push({ name: this.listRoute })
            } else if (action === 'add') {
              this.element = { id: 0 }
              this.$router.push({ name: this.addRoute })
            } else {
              if (this.breadcrumbs.length === 4) {
                this.breadcrumbs.pop()
                this.breadcrumbs.push({
                  text: this.$gettext('Results'),
                  to: this.listRoute
                })
                this.breadcrumbs.push({
                  text: this.element.fullname
                })
                this.title = `${this.$gettext('Package')}: ${
                  this.element.fullname
                }`
              }
              this.$router.push({
                name: this.detailRoute,
                params: { id: this.element.id }
              })
            }
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
          .finally(() => (this.loading = false))
      }
    }
  }
}
</script>
