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
              <q-select
                v-model="element.project"
                outlined
                autofocus
                :label="$gettext('Project')"
                :options="projects"
                option-value="id"
                option-label="name"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              >
                <template #prepend>
                  <q-icon :name="modelIcon('projects')" />
                </template>

                <template #selected-item="scope">
                  <q-btn
                    no-caps
                    flat
                    color="primary"
                    :to="{
                      name: 'project-detail',
                      params: { id: scope.opt.id },
                    }"
                    :label="scope.opt.name"
                  />
                </template>
              </q-select>
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
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import ItemDetail from 'components/ui/ItemDetail'

import { appIcon, modelIcon } from 'composables/element'

export default {
  components: {
    ItemDetail,
  },
  setup() {
    const uiStore = useUiStore()
    const { $gettext } = useGettext()

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

    let element = reactive({ id: 0 })

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
      modelIcon,
    }
  },
}
</script>
