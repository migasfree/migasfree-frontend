<template>
  <q-page padding>
    <ItemDetail
      :key="$route.fullPath"
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
                ref="primaryInput"
                v-model="element.name"
                :label="$gettext('Name')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <EntitySelect
                v-model="element.category"
                :options="categories"
                :label="$gettext('Category')"
                detail-route="category-detail"
                add-route="category-add"
                :add-tooltip="$gettext('Add Application Category')"
                :prepend-icon="modelIcon('catalog/categories')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>

            <div class="col-6 col-md col-sm">
              <q-select
                v-model="element.level"
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
                v-model="element.score"
                :label="$gettext('Score')"
                stack-label
                :hint="$gettext('Relevance to the organization')"
                lazy-rules
                :rules="[(val) => val > 0 || $gettext('* Required')]"
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
                  clearable
                  counter
                  :label="$gettext('Change Icon')"
                  accept=".jpg,.jpeg,.png,.gif,.svg,.webp,.bmp,.ico,.tiff,.tif"
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
                type="textarea"
                autogrow
                :label="$gettext('Description')"
                :hint="$gettext('Allowed Markdown Syntax')"
              />
            </div>

            <div class="col-6 col-md col-sm">
              <q-field
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
                    <EntitySelect
                      v-model="project.project"
                      :options="projects"
                      :label="$gettext('Project')"
                      detail-route="project-detail"
                      :prepend-icon="modelIcon('projects')"
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
import { useRoute } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import EntitySelect from 'components/ui/EntitySelect'
import ItemDetail from 'components/ui/ItemDetail'
import OrderTextArea from 'components/ui/OrderTextArea'
import SelectAttributes from 'components/ui/SelectAttributes'

import { appIcon, modelIcon } from 'composables/element'
import useAutoFocus from 'composables/autoFocus'

export default {
  components: {
    EntitySelect,
    ItemDetail,
    OrderTextArea,
    SelectAttributes,
  },
  setup() {
    const uiStore = useUiStore()
    const route = useRoute()
    const { $gettext, interpolate } = useGettext()
    const { inputRef: primaryInput } = useAutoFocus()

    const title = ref($gettext('Application'))
    const windowTitle = ref(title.value)
    useMeta(() => ({ title: windowTitle.value }))

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

    const breadcrumbs = ref([
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
        element.score !== undefined &&
        element.score > 0
      )
    })

    const iconPath = computed(() => `${element.icon}?rand=${rand.value}`)

    const loadRelated = async () => {
      try {
        const [
          { data: levelsData },
          { data: categoriesData },
          { data: projectsData },
        ] = await Promise.all([
          api.get('/api/v1/token/catalog/apps/levels/'),
          api.get('/api/v1/token/catalog/categories/'),
          api.get('/api/v1/token/projects/'),
        ])

        levels.value = Object.entries(levelsData).map(([id, name]) => ({
          id,
          name,
        }))
        categories.value = categoriesData.results
        projects.value = projectsData.results

        if (route.query.category)
          element.category =
            categories.value.find(
              (item) => item.id === Number(route.query.category),
            ) || null
      } catch (error) {
        uiStore.notifyError(error)
      }

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

    const saveProjectPackage = async (project) => {
      const { id, project: proj, packages_to_install } = project
      const payload = {
        application: element.id,
        project: proj.id,
        packages_to_install:
          packages_to_install !== null ? packages_to_install.split('\n') : [],
      }

      try {
        if (id > 0) {
          await api.patch(`/api/v1/token/catalog/project-packages/${id}/`, {
            ...payload,
            id,
          })
        } else {
          await api.post('/api/v1/token/catalog/project-packages/', payload)
        }
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    const updateRelated = async () => {
      const savePromises = packagesByProject.value
        .filter(
          (p) => p.project !== undefined && p.packages_to_install !== undefined,
        )
        .map((project) => saveProjectPackage(project))

      const deletePromises = removedProjects.value.map((id) =>
        api
          .delete(`/api/v1/token/catalog/project-packages/${id}/`)
          .catch((error) => {
            uiStore.notifyError(error)
          }),
      )

      await Promise.all([...savePromises, ...deletePromises])

      rand.value = Date.now()
    }

    const resetElement = () => {
      Object.assign(element, {
        id: 0,
        name: undefined,
        description: '',
        level: null,
        category: null,
        score: 0,
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
      appIcon,
      modelIcon,
      primaryInput,
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
