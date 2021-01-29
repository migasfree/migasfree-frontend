<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Application')">
      <template v-if="element.id" #append
        >:
        <MigasLink
          :model="model"
          :pk="element.id"
          :value="element.name"
          icon="mdi-apps"
        />
      </template>
    </Header>

    <q-card>
      <q-card-section>
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">General</div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col">
            <q-input
              v-model="element.name"
              outlined
              :label="$gettext('Name')"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
            />
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <q-select
              v-model="element.category"
              outlined
              :label="$gettext('Category')"
              :options="categories"
              option-value="id"
              option-label="name"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
            />
          </div>

          <div class="col-6 col-md">
            <q-select
              v-model="element.level"
              outlined
              :label="$gettext('Level')"
              :options="levels"
              option-value="id"
              option-label="name"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
            />
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <q-field
              outlined
              :label="$gettext('Score')"
              stack-label
              :hint="$gettext('Relevance to the organization')"
            >
              <template v-slot:control>
                <q-rating
                  v-model="element.score"
                  size="sm"
                  icon="star_border"
                  icon-selected="star"
                />
              </template>
            </q-field>
          </div>

          <div class="col-6 col-md">
            <div class="col-6">
              <q-file
                v-model="iconFile"
                outlined
                clearable
                counter
                :label="$gettext('Change Icon')"
                accept="image/*"
                @rejected="onRejected"
              />
            </div>

            <div class="col-6">
              <q-img
                v-if="element.icon"
                :src="iconPath"
                spinner-color="white"
                class="app-icon"
              />
            </div>
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col">
            <q-select
              v-model="element.available_for_attributes"
              outlined
              use-input
              map-options
              multiple
              input-debounce="0"
              :label="$gettext('Available for Attributes')"
              :options="attributes"
              @filter="filterAttributes"
              @filter-abort="abortFilterAttributes"
            >
              <template #no-option>
                <q-item>
                  <q-item-section v-translate class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>

              <template #option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  {{ attributeValue(scope.opt) }}
                </q-item>
              </template>

              <template #selected-item="scope">
                <q-chip
                  removable
                  dense
                  :tabindex="scope.tabindex"
                  class="q-ma-md"
                  @remove="scope.removeAtIndex(scope.index)"
                >
                  <MigasLink
                    model="attributes"
                    :pk="scope.opt.id"
                    :value="attributeValue(scope.opt)"
                  />
                </q-chip>
              </template>
            </q-select>
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <q-input
              v-model="element.description"
              outlined
              type="textarea"
              :label="$gettext('Description')"
              :hint="$gettext('Allowed Markdown Syntax')"
            />
          </div>

          <div class="col-6 col-md">
            <q-field
              outlined
              :label="$gettext('Description Preview')"
              readonly
              stack-label
            >
              <template v-slot:control>
                <q-markdown :src="element.description"></q-markdown>
              </template>
            </q-field>
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">Projects</div>

        <q-list
          v-if="packagesByProject.length > 0"
          class="q-pa-md"
          bordered
          separator
        >
          <q-item v-for="(project, index) in packagesByProject" :key="index">
            <q-item-section side>
              <q-btn
                flat
                dense
                round
                color="negative"
                icon="mdi-delete"
                @click="removeInline(index)"
                ><q-tooltip><translate>Delete</translate></q-tooltip></q-btn
              >
            </q-item-section>

            <q-item-section class="col-5">
              <q-select
                v-model="project.project"
                outlined
                :label="$gettext('Project')"
                :options="projects"
                option-value="id"
                option-label="name"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </q-item-section>

            <q-item-section class="col-6 col-md">
              <q-input
                v-model="project.packages_to_install"
                outlined
                type="textarea"
                :label="$gettext('Packages to Install')"
              />
            </q-item-section>
          </q-item>
        </q-list>

        <div class="q-pa-md">
          <q-btn
            icon="mdi-plus"
            :label="$gettext('Add other Project')"
            @click="addInline"
          />
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
import { detailMixin } from 'mixins/detail'
import { elementMixin } from 'mixins/element'

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
  mixins: [detailMixin, elementMixin],
  data() {
    const title = this.$gettext('Application')
    const element = {
      id: 0,
      score: 0,
      available_for_attributes: [],
      description: ''
    }

    return {
      title,
      originalTitle: title,
      model: 'catalog/apps',
      listRoute: 'apps-list',
      addRoute: 'app-add',
      detailRoute: 'app-detail',
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
          text: this.$gettext('Applications'),
          to: 'apps-dashboard',
          icon: 'mdi-apps'
        }
      ],
      element,
      emptyElement: Object.assign({}, element),
      categories: [],
      levels: [],
      projects: [],
      attributes: [],
      packagesByProject: [],
      removedProjects: [],
      iconFile: null,
      confirmRemove: false,
      rand: 1
    }
  },
  computed: {
    isValid() {
      return (
        this.element.name !== undefined &&
        this.element.name !== '' &&
        this.element.category !== undefined &&
        this.element.level !== undefined &&
        this.element.score !== undefined
      )
    },

    iconPath() {
      return `${this.element.icon}?rand=${this.rand}`
    }
  },
  methods: {
    async loadRelated() {
      await this.$axios
        .get('/api/v1/token/catalog/apps/levels/')
        .then((response) => {
          Object.entries(response.data).map(([key, val]) => {
            this.levels.push({
              id: key,
              name: val
            })
          })
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })

      await this.$axios
        .get('/api/v1/token/catalog/apps/categories/')
        .then((response) => {
          Object.entries(response.data).map(([key, val]) => {
            this.categories.push({
              id: parseInt(key),
              name: val
            })
          })
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })

      await this.$axios
        .get('/api/v1/token/projects/')
        .then((response) => {
          this.projects = response.data.results
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })

      if (this.element.id) {
        this.packagesByProject = this.element.packages_by_project
        this.packagesByProject.forEach((item) => {
          item.packages_to_install = item.packages_to_install.join('\n')
        })
      }
    },

    elementData() {
      let data = new FormData()

      data.append('name', this.element.name)
      data.append('level', this.element.level.id)
      data.append('category', this.element.category.id)
      data.append('score', this.element.score)
      data.append('description', this.element.description)
      data.append(
        'available_for_attributes',
        this.element.available_for_attributes.length > 0
          ? this.element.available_for_attributes.map((item) => item.id)
          : []
      )
      if (this.iconFile) {
        data.append('icon', this.iconFile)
      }

      return data
    },

    setRelated() {
      if (typeof this.element.level === 'string')
        this.element.level = this.levels.find(
          (x) => x.id === this.element.level
        )

      if (typeof this.element.category === 'number')
        this.element.category = this.categories.find(
          (x) => x.id === this.element.category
        )
    },

    addInline() {
      this.packagesByProject.push({
        id: 0,
        project: null,
        packages_to_install: null
      })
    },

    removeInline(index) {
      const removedItem = this.packagesByProject.splice(index, 1)[0]
      if (removedItem.id > 0) {
        this.removedProjects.push(removedItem.id)
      }
    },

    filterAttributes(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3) {
        abort()
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.$axios
          .get('/api/v1/token/attributes/', { params: { search: needle } })
          .then((response) => {
            this.attributes = response.data.results
          })
        /* this.attributes = stringOptions.filter(
          (v) => v.toLowerCase().indexOf(needle) > -1
        ) */
      })
    },

    abortFilterAttributes() {
      // console.log('delayed filter aborted')
    },

    onRejected(rejectedEntries) {
      this.$store.dispatch(
        'ui/notifyError',
        this.$gettextInterpolate(
          this.$gettext('%{n} file(s) did not pass validation constraints'),
          {
            n: rejectedEntries.length
          }
        )
      )
    },

    async updateRelated() {
      this.packagesByProject.forEach((project) => {
        if (
          project.project === undefined ||
          project.packages_to_install === undefined
        ) {
          return
        }

        if (project.id > 0) {
          this.$axios
            .patch(`/api/v1/token/catalog/packages/${project.id}/`, {
              id: project.id,
              application: this.element.id,
              project: project.project.id,
              packages_to_install:
                project.packages_to_install !== null
                  ? project.packages_to_install.split('\n')
                  : []
            })
            .catch((error) => {
              this.$store.dispatch('ui/notifyError', error)
            })
        } else {
          this.$axios
            .post('/api/v1/token/catalog/packages/', {
              application: this.element.id,
              project: project.project.id,
              packages_to_install:
                project.packages_to_install !== null
                  ? project.packages_to_install.split('\n')
                  : []
            })
            .catch((error) => {
              this.$store.dispatch('ui/notifyError', error)
            })
        }
      })

      this.removedProjects.forEach((id) => {
        this.$axios
          .delete(`/api/v1/token/catalog/packages/${id}/`)
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
      })

      this.rand = Date.now()
    }
  }
}
</script>

<style scoped>
.app-icon {
  height: 140px;
  max-width: 150px;
}
</style>
