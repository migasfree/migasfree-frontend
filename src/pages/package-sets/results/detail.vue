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
      :continue-button="false"
      @load-related="loadRelated"
      @reset-element="resetElement"
      @reset-related="resetRelated"
      @set-title="setTitle"
    >
      <template #fields>
        <q-card-section>
          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <q-input
                v-model="element.name"
                outlined
                autofocus
                :label="$gettext('Name')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>

            <div class="col-6 col-md col-sm">
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
                    />
                    /
                    <MigasLink
                      v-if="element.store.id > 0"
                      model="stores"
                      :pk="element.store.id"
                      :value="element.store.name"
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
          </div>

          <template v-if="element.store || element.id">
            <div v-if="packages.length > 0" class="row q-pa-md q-gutter-md">
              <div class="col-12 col-md col-sm">
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
                      />
                    </q-chip>
                  </template>
                </q-select>
              </div>
            </div>

            <div class="row q-pa-md q-gutter-md">
              <div class="col-12 col-md col-sm">
                <q-file
                  v-model="element.files"
                  clearable
                  outlined
                  counter
                  multiple
                  append
                  :label="$gettext('Add more Packages')"
                  ><template #prepend
                    ><q-icon :name="modelIcon('packages')" /> </template
                ></q-file>
              </div>
            </div>
          </template>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-12 col-md col-sm">
              <q-input
                v-model="element.description"
                outlined
                type="textarea"
                :label="$gettext('Description')"
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
import MigasLink from 'components/MigasLink'

import { modelIcon } from 'composables/element'

export default {
  components: {
    ItemDetail,
    MigasLink,
  },
  setup() {
    const uiStore = useUiStore()
    const { $gettext } = useGettext()

    const title = ref($gettext('Package Set'))
    const windowTitle = ref(title.value)
    useMeta(() => {
      return {
        title: windowTitle.value,
      }
    })

    const routes = {
      list: 'package-sets-list',
      add: 'package-set-add',
      detail: 'package-set-detail',
    }
    const model = 'package-sets'

    let element = reactive({
      id: 0,
      project: null,
      description: '',
      files: null,
    })

    const projectStore = reactive({ items: [], selected: null })
    const packages = ref([])

    const menu = ref(null)
    const tree = ref(null)

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        to: 'home',
        icon: 'mdi-home',
      },
      {
        text: $gettext('Release'),
        icon: 'mdi-truck-delivery',
      },
      {
        text: $gettext('Package Sets'),
        icon: modelIcon(model),
        to: routes.list,
      },
    ])

    const isValid = computed(() => {
      return element.project !== null && element.name !== null
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

      loadPackages()

      menu.value.hide()
    }

    const onLazyLoad = ({ node, key, done, fail }) => {
      api
        .get('/api/v1/token/stores/', { params: { project__id: key } })
        .then((response) => {
          done(
            Object.entries(response.data.results).map(([index, item]) => {
              return {
                id: `${key}|${item.id}`,
                label: item.name,
                icon: modelIcon('stores'),
                store_id: item.id,
              }
            })
          )
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    }

    const loadPackages = () => {
      api
        .get('/api/v1/token/packages/', {
          params: { store__id: element.store.id },
        })
        .then((response) => {
          packages.value = []
          Object.entries(response.data.results).map(([key, item]) => {
            packages.value.push({
              id: item.id,
              fullname: item.fullname,
            })
          })
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    }

    const loadRelated = async () => {
      await api
        .get('/api/v1/token/projects/')
        .then((response) => {
          const projects = response.data.results

          projectStore.items = Object.entries(projects).map(([key, item]) => {
            return {
              id: item.id,
              label: item.name,
              icon: modelIcon('projects'),
              lazy: true,
            }
          })
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      if (element.id) {
        loadPackages()
      }
    }

    const elementData = () => {
      let data = new FormData()

      data.append('name', element.name)
      data.append('description', element.description)

      if (element.packages) {
        for (var i = 0; i < element.packages.length; i++) {
          data.append('packages', element.packages[i].id)
        }
      } else {
        data.append('packages', [])
      }

      if (element.files) {
        for (var i = 0; i < element.files.length; i++) {
          data.append('files', element.files[i])
        }
      }

      if (!element.id) {
        data.append('project', element.project.id)
        data.append('store', element.store.id)
      }

      return data
    }

    const resetRelated = () => {
      projectStore.selected = null
    }

    const resetElement = () => {
      Object.assign(element, {
        id: 0,
        name: undefined,
        description: undefined,
        project: null,
        store: null,
        packages: [],
        files: [],
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
      packages,
      projectStore,
      menu,
      tree,
      isValid,
      nodeSelected,
      onLazyLoad,
      elementData,
      loadRelated,
      resetElement,
      resetRelated,
      setTitle,
      modelIcon,
    }
  },
}
</script>
