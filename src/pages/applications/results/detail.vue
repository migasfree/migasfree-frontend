<template>
  <q-page padding>
    <ItemDetail
      :breadcrumbs="breadcrumbs"
      :original-title="title"
      :model="model"
      :routes="routes"
      :element="element"
      :element-data="elementData"
      :is-valid="isValid"
      @load-related="loadRelated"
      @update-related="updateRelated"
      @reset-element="resetElement"
      @reset-related="resetRelated"
      @set-title="setTitle"
    >
      <template #fields>
        <q-card-section>
          <div class="text-h5 q-mt-sm q-mb-xs">{{ $gettext('General') }}</div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col">
              <q-input
                v-model="element.name"
                outlined
                autofocus
                :label="$gettext('Name')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
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

            <div class="col-6 col-md col-sm">
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
            <div class="col-6 col-md col-sm">
              <q-field
                outlined
                :label="$gettext('Score')"
                stack-label
                :hint="$gettext('Relevance to the organization')"
              >
                <template #control>
                  <q-rating
                    v-model="element.score"
                    size="sm"
                    icon="star_border"
                    icon-selected="star"
                  />
                </template>
              </q-field>
            </div>

            <div class="col-6 col-md col-sm">
              <div class="col-6">
                <q-file
                  v-model="iconFile"
                  outlined
                  clearable
                  counter
                  :label="$gettext('Change Icon')"
                  accept="image/*"
                  @rejected="onRejected"
                  ><template #prepend><q-icon name="mdi-image" /> </template
                ></q-file>
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
              <SelectAttributes
                v-model="element.available_for_attributes"
                :label="$gettext('Available for Attributes')"
              />
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <q-input
                v-model="element.description"
                outlined
                type="textarea"
                autogrow
                :label="$gettext('Description')"
                :hint="$gettext('Allowed Markdown Syntax')"
              />
            </div>

            <div class="col-6 col-md col-sm">
              <q-field
                outlined
                :label="$gettext('Description Preview')"
                readonly
                stack-label
              >
                <template #control>
                  <q-markdown :src="element.description"></q-markdown>
                </template>
              </q-field>
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-h5 q-mt-sm q-mb-xs">{{ $gettext('Projects') }}</div>

          <q-list
            v-if="packagesByProject.length > 0"
            class="q-pa-md"
            bordered
            separator
          >
            <q-item v-for="(project, index) in packagesByProject" :key="index">
              <q-item-section side top>
                <q-btn
                  flat
                  dense
                  round
                  color="negative"
                  :icon="appIcon('delete')"
                  @click="removeInline(index)"
                  ><q-tooltip>{{ $gettext('Delete') }}</q-tooltip></q-btn
                >
              </q-item-section>

              <q-item-section>
                <div class="row q-pa-md q-gutter-md">
                  <div class="col-5 col-md col-sm">
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
                  </div>

                  <div class="col-5 col-md col-sm">
                    <OrderTextArea
                      v-model="project.packages_to_install"
                      :label="$gettext('Packages to Install')"
                    />
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <div class="q-pa-md">
            <q-btn
              :icon="appIcon('add')"
              :label="$gettext('Add other Project')"
              @click="addInline"
            />
          </div>
        </q-card-section>
      </template>
    </ItemDetail>
  </q-page>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import ItemDetail from 'components/ui/ItemDetail'
import OrderTextArea from 'components/ui/OrderTextArea'
import SelectAttributes from 'components/ui/SelectAttributes'

import { appIcon, modelIcon } from 'composables/element'

export default {
  components: {
    ItemDetail,
    OrderTextArea,
    SelectAttributes,
  },
  setup() {
    const uiStore = useUiStore()
    const { $gettext, interpolate } = useGettext()

    const title = ref($gettext('Application'))
    const windowTitle = ref(title.value)
    useMeta(() => {
      return {
        title: windowTitle.value,
      }
    })

    const routes = {
      list: 'apps-list',
      add: 'app-add',
      detail: 'app-detail',
    }
    const model = 'catalog/apps'

    let element = reactive({
      id: 0,
      score: 0,
      available_for_attributes: [],
      description: '',
    })

    const categories = ref([])
    const levels = ref([])
    const projects = ref([])
    const packagesByProject = ref([])
    const removedProjects = ref([])
    const iconFile = ref(null)
    const rand = ref(1)

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Release'),
        icon: appIcon('release'),
      },
      {
        text: $gettext('Applications'),
        icon: modelIcon(model),
        to: 'apps-dashboard',
      },
    ])

    const isValid = computed(() => {
      return (
        element.name !== undefined &&
        element.name.trim() !== '' &&
        element.category !== undefined &&
        element.level !== undefined &&
        element.score !== undefined
      )
    })

    const iconPath = computed(() => {
      return `${element.icon}?rand=${rand.value}`
    })

    const loadRelated = async () => {
      await api
        .get('/api/v1/token/catalog/apps/levels/')
        .then((response) => {
          Object.entries(response.data).map(([key, val]) => {
            levels.value.push({
              id: key,
              name: val,
            })
          })
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      await api
        .get('/api/v1/token/catalog/categories/')
        .then((response) => {
          categories.value = response.data.results
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      await api
        .get('/api/v1/token/projects/')
        .then((response) => {
          projects.value = response.data.results
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      if (element.id) {
        packagesByProject.value = element.packages_by_project
        packagesByProject.value.forEach((item) => {
          item.packages_to_install = item.packages_to_install.join('\n')
        })
      }
    }

    const elementData = () => {
      let data = new FormData()

      data.append('name', element.name)
      data.append('level', element.level.id)
      data.append('category', element.category.id)
      data.append('score', element.score)
      data.append('description', element.description)
      data.append(
        'available_for_attributes',
        element.available_for_attributes.length > 0
          ? element.available_for_attributes.map((item) => item.id)
          : [],
      )
      if (iconFile.value) {
        data.append('icon', iconFile.value)
      }

      return data
    }

    const updateRelated = async () => {
      packagesByProject.value.forEach((project) => {
        if (
          project.project === undefined ||
          project.packages_to_install === undefined
        ) {
          return
        }

        if (project.id > 0) {
          api
            .patch(`/api/v1/token/catalog/project-packages/${project.id}/`, {
              id: project.id,
              application: element.id,
              project: project.project.id,
              packages_to_install:
                project.packages_to_install !== null
                  ? project.packages_to_install.split('\n')
                  : [],
            })
            .catch((error) => {
              uiStore.notifyError(error)
            })
        } else {
          api
            .post('/api/v1/token/catalog/project-packages/', {
              application: element.id,
              project: project.project.id,
              packages_to_install:
                project.packages_to_install !== null
                  ? project.packages_to_install.split('\n')
                  : [],
            })
            .catch((error) => {
              uiStore.notifyError(error)
            })
        }
      })

      removedProjects.value.forEach((id) => {
        api
          .delete(`/api/v1/token/catalog/project-packages/${id}/`)
          .catch((error) => {
            uiStore.notifyError(error)
          })
      })

      rand.value = Date.now()
    }

    const resetElement = () => {
      Object.assign(element, {
        id: 0,
        name: undefined,
        description: undefined,
        level: null,
        category: null,
        score: undefined,
        available_for_attributes: [],
        icon: undefined,
      })
    }

    const resetRelated = () => {
      packagesByProject.value = []
      removedProjects.value = []
    }

    const setTitle = (value) => {
      windowTitle.value = value
    }

    const addInline = () => {
      packagesByProject.value.push({
        id: 0,
        project: null,
        packages_to_install: null,
      })
    }

    const removeInline = (index) => {
      const removedItem = packagesByProject.value.splice(index, 1)[0]
      if (removedItem.id > 0) {
        removedProjects.value.push(removedItem.id)
      }
    }

    const onRejected = (rejectedEntries) => {
      uiStore.notifyError(
        interpolate(
          $gettext('%{n} file(s) did not pass validation constraints'),
          {
            n: rejectedEntries.length,
          },
        ),
      )
    }

    return {
      breadcrumbs,
      title,
      model,
      routes,
      element,
      categories,
      levels,
      projects,
      packagesByProject,
      removedProjects,
      iconFile,
      rand,
      isValid,
      iconPath,
      elementData,
      loadRelated,
      updateRelated,
      resetElement,
      resetRelated,
      setTitle,
      addInline,
      removeInline,
      onRejected,
    }
  },
}
</script>

<style scoped>
.app-icon {
  height: 140px;
  max-width: 150px;
}
</style>
