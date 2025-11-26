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
      @reset-element="resetElement"
      @set-title="setTitle"
    >
      <template #fields>
        <q-card-section>
          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <EntitySelect
                v-model="element.project"
                autofocus
                :options="projects"
                :label="$gettext('Project')"
                detail-route="project-detail"
                add-route="project-add"
                :add-tooltip="$gettext('Add Project')"
                :prepend-icon="modelIcon('projects')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>

            <div class="col-6 col-md col-sm">
              <q-input
                v-model="element.name"
                outlined
                :label="$gettext('Name')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>
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

import { appIcon, modelIcon } from 'composables/element'

export default {
  components: {
    EntitySelect,
    ItemDetail,
  },
  setup() {
    const { $gettext } = useGettext()
    const route = useRoute()
    const uiStore = useUiStore()

    const title = ref($gettext('Store'))
    const windowTitle = ref(title.value)
    useMeta(() => ({ title: windowTitle.value }))

    const routes = {
      list: 'stores-list',
      add: 'store-add',
      detail: 'store-detail',
    }
    const model = 'stores'

    const projects = ref([])

    const element = reactive({ id: 0 })

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
        text: $gettext('Stores'),
        icon: modelIcon(model),
        to: 'stores-dashboard',
      },
    ])

    const isValid = computed(() => {
      return (
        element.name !== undefined &&
        element.name.trim() !== '' &&
        Object.hasOwn(element, 'project')
      )
    })

    const loadRelated = async () => {
      try {
        const { data } = await api.get('/api/v1/token/projects/')
        projects.value = data.results

        if (route.query.project)
          element.project =
            projects.value.find(
              (item) => item.id === Number(route.query.project),
            ) || null
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    const elementData = () => {
      return {
        project: element.project.id,
        name: element.name,
      }
    }

    const resetElement = () => {
      Object.assign(element, {
        id: 0,
        project: null,
        name: undefined,
      })
    }

    const setTitle = (value) => {
      windowTitle.value = value
    }

    return {
      breadcrumbs,
      title,
      model,
      routes,
      element,
      projects,
      isValid,
      loadRelated,
      elementData,
      resetElement,
      setTitle,
      appIcon,
      modelIcon,
    }
  },
}
</script>
