<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Package Set')">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="package-sets"
          :pk="element.id"
          :value="element.name"
          icon="mdi-apps-box"
        />
      </template>
    </Header>

    <q-card>
      <q-card-section>
        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <q-input
              v-model="element.name"
              outlined
              :label="$gettext('Name')"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
            />
          </div>

          <div class="col-6 col-md">
            <template v-if="element.id">
              <q-field
                outlined
                :label="$gettext('Project / Store')"
                readonly
                stack-label
              >
                <template #control>
                  <MigasLink
                    model="projects"
                    :pk="element.project.id"
                    :value="element.project.name"
                    icon="mdi-sitemap"
                  />
                  /
                  <MigasLink
                    v-if="element.store.id > 0"
                    model="stores"
                    :pk="element.store.id"
                    :value="element.store.name"
                    icon="mdi-store-24-hour"
                  />
                </template>
              </q-field>
            </template>
            <q-input
              v-else
              v-model="projectStore.selected"
              outlined
              readonly
              :label="$gettext('Project / Store')"
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
                />
              </q-menu>
            </q-input>
          </div>
        </div>

        <template v-if="element.store || element.id">
          <div v-if="packages.length > 0" class="row q-pa-md q-gutter-md">
            <div class="col-md">
              <q-select
                v-model="element.packages"
                outlined
                multiple
                counter
                use-input
                input-debounce="0"
                clearable
                :label="$gettext('Packages')"
                :options="packages"
                option-value="id"
                option-label="fullname"
              >
                <template #selected-item="scope">
                  <q-chip
                    removable
                    dense
                    :tabindex="scope.tabindex"
                    class="q-ma-md"
                    @remove="scope.removeAtIndex(scope.index)"
                  >
                    <MigasLink
                      model="packages"
                      :pk="scope.opt.id"
                      :value="scope.opt.fullname"
                      icon="mdi-package-variant"
                    />
                  </q-chip>
                </template>
              </q-select>
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-md">
              <q-file
                v-model="element.files"
                clearable
                outlined
                counter
                multiple
                append
                :label="$gettext('Add more Packages')"
                ><template #prepend
                  ><q-icon name="mdi-package-variant" /> </template
              ></q-file>
            </div>
          </div>
        </template>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-md">
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
          icon="mdi-plus"
          :label="$gettext('Save and add other')"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="updateElement('add')"
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
    const title = this.$gettext('Package Set')
    const element = { id: 0, project: null, description: '', files: null }

    return {
      title,
      originalTitle: title,
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
          text: this.$gettext('Package Sets'),
          to: 'package-sets-list',
          icon: 'mdi-apps-box'
        }
      ],
      element,
      emptyElement: Object.assign({}, element),
      model: 'package-sets',
      listRoute: 'package-sets-list',
      addRoute: 'package-set-add',
      detailRoute: 'package-set-detail',
      projectStore: { items: [], selected: null },
      packages: [],
      confirmRemove: false
    }
  },
  computed: {
    isValid() {
      return this.element.project !== null && this.element.name !== null
    }
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

      this.loadPackages()

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

    loadPackages() {
      this.$axios
        .get('/api/v1/token/packages/', {
          params: { store__id: this.element.store.id }
        })
        .then((response) => {
          this.packages = []
          Object.entries(response.data.results).map(([key, item]) => {
            this.packages.push({
              id: item.id,
              fullname: item.fullname
            })
          })
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    async loadRelated() {
      await this.$axios
        .get('/api/v1/token/projects/')
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
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })

      if (this.element.id) {
        this.loadPackages()
      }
    },

    elementData() {
      let data = new FormData()

      data.append('name', this.element.name)
      data.append('description', this.element.description)

      if (this.element.packages) {
        for (var i = 0; i < this.element.packages.length; i++) {
          data.append('packages', this.element.packages[i].id)
        }
      } else {
        data.append('packages', [])
      }

      if (this.element.files) {
        for (var i = 0; i < this.element.files.length; i++) {
          data.append('files', this.element.files[i])
        }
      }

      if (!this.element.id) {
        data.append('project', this.element.project.id)
        data.append('store', this.element.store.id)
      }

      return data
    },

    resetRelated() {
      this.projectStore.selected = null
    }
  }
}
</script>
