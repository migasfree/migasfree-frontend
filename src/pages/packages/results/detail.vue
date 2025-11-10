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
      :visible-actions="element.id === 0"
      @load-related="loadRelated"
      @set-related="setRelated"
      @reset-element="resetElement"
      @reset-related="resetRelated"
      @set-title="setTitle"
    >
      <template #fields>
        <q-card-section>
          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <template v-if="element.id">
                <MigasLink
                  model="projects"
                  :pk="element.project.id"
                  :value="element.project.name"
                  :tooltip="$gettext('Project')"
                />
              </template>
              <q-input
                v-else
                v-model="projectStore.selected"
                outlined
                readonly
                :label="$gettext('Project / Store')"
                @update:model-value="menu.value.show()"
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

            <div class="col-6 col-md col-sm">
              <template v-if="element.id">
                <MigasLink
                  v-if="element.store.id > 0"
                  model="stores"
                  :pk="element.store.id"
                  :value="element.store.name"
                  :tooltip="$gettext('Store')"
                />
              </template>
            </div>
          </div>

          <div v-if="element.id === 0" class="row q-pa-md q-gutter-md">
            <div class="col-12 col-md col-sm">
              <q-file
                v-model="element.files"
                clearable
                outlined
                counter
                :label="$gettext('Select one file')"
                ><template #prepend
                  ><q-icon :name="modelIcon('packages')" /> </template
              ></q-file>
            </div>
          </div>

          <div v-if="element.id" class="row q-pa-md q-gutter-md">
            <div class="col col-md col-sm">
              <q-tree
                v-model:expanded="expandedNodes"
                :nodes="infoNodes"
                node-key="value"
              >
                <template #default-header="prop">
                  <div class="row items-center text-no-wrap no-wrap">
                    <q-icon
                      v-if="prop.node.avatar"
                      :name="prop.node.avatar"
                      class="vertical-middle q-mr-xs"
                    />
                    <span v-if="prop.node.label" class="q-mr-xs"
                      >{{ prop.node.label }}:
                    </span>
                    <strong class="vertical-middle">{{
                      prop.node.value
                    }}</strong>
                  </div>
                </template>
              </q-tree>
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
import MigasLink from 'components/MigasLink'

import { appIcon, modelIcon } from 'composables/element'

export default {
  components: {
    ItemDetail,
    MigasLink,
  },
  setup() {
    const uiStore = useUiStore()
    const { $gettext } = useGettext()

    const title = ref($gettext('Package'))
    const windowTitle = ref(title.value)
    useMeta(() => ({ title: windowTitle.value }))

    const routes = {
      list: 'packages-list',
      add: 'package-add',
      detail: 'package-detail',
    }
    const model = 'packages'

    let element = reactive({ id: 0, files: null })

    const projectStore = reactive({ items: [], selected: null })

    const menu = ref(null)
    const tree = ref(null)

    let infoNodes = ref([])
    let expandedNodes = ref([])

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
        text: $gettext('Packages'),
        icon: modelIcon(model),
        to: 'packages-dashboard',
      },
    ])

    const isValid = computed(() => {
      return projectStore.selected !== null && element.files !== null
    })

    const nodeSelected = (value) => {
      if (typeof value !== 'string') return

      const keys = value.split('|')
      if (keys.length != 2) return

      const nodeProject = tree.value.getNodeByKey(parseInt(keys[0]))
      const nodeStore = tree.value.getNodeByKey(value)

      projectStore.selected = `${nodeProject.label} / ${nodeStore.label}`
      Object.assign(element, {
        project: { id: nodeProject.id },
        store: { id: nodeStore.store_id },
      })

      menu.value.hide()
    }

    const onLazyLoad = ({ key, done }) => {
      api
        .get('/api/v1/token/stores/', { params: { project__id: key } })
        .then((response) => {
          done(
            Object.entries(response.data.results).map(([, item]) => {
              return {
                id: `${key}|${item.id}`,
                label: item.name,
                icon: modelIcon('stores'),
                store_id: item.id,
              }
            }),
          )
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    }

    const setRelated = () => {
      infoNodes.value = [
        {
          value: element.fullname,
          avatar: modelIcon('packages'),
          children: [
            {
              value: element.name,
              label: $gettext('Name'),
            },
            {
              value: element.version,
              label: $gettext('Version'),
            },
            {
              value: element.architecture,
              label: $gettext('Architecture'),
            },
          ],
        },
      ]

      expandedNodes.value = [element.fullname]
    }

    const loadRelated = async () => {
      try {
        const { data } = await api.get('/api/v1/token/projects/')
        const projects = data.results

        projectStore.items = Object.values(projects).map((item) => ({
          id: item.id,
          label: item.name,
          icon: modelIcon('projects'),
          lazy: true,
        }))
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    const elementData = () => {
      if (element.id) {
        return {
          property_att: element.property_att.id,
          value: element.value,
          description: element.description,
        }
      }

      let data = new FormData()
      data.append('project', element.project.id)
      data.append('store', element.store.id)
      data.append('files', element.files)

      return data
    }

    const resetRelated = () => {
      projectStore.selected = null
    }

    const resetElement = () => {
      Object.assign(element, {
        id: 0,
        value: undefined,
        description: undefined,
        files: undefined,
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
      projectStore,
      menu,
      tree,
      infoNodes,
      expandedNodes,
      isValid,
      nodeSelected,
      onLazyLoad,
      elementData,
      setRelated,
      loadRelated,
      resetElement,
      resetRelated,
      setTitle,
      modelIcon,
    }
  },
}
</script>
