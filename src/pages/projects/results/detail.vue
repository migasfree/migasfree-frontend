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
      <template #actions>
        <q-btn
          v-if="element.id && !hasStores"
          class="q-ma-sm"
          :aria-label="$gettext('Create default stores')"
          color="secondary"
          :icon="modelIcon('stores')"
          @click="createDefaultStores"
          ><q-tooltip>{{ $gettext('Create default stores') }}</q-tooltip></q-btn
        >

        <q-btn
          v-if="element.id && !hasDeployments"
          class="q-ma-sm"
          :aria-label="$gettext('Create default deployments')"
          color="secondary"
          :icon="modelIcon('deployments')"
          @click="createDefaultDeployments"
          ><q-tooltip>{{
            $gettext('Create default deployments')
          }}</q-tooltip></q-btn
        >

        <q-btn
          v-if="element.id"
          class="q-ma-sm"
          color="secondary"
          :aria-label="$gettext('Add Store')"
          :icon="appIcon('add')"
          :icon-right="modelIcon('stores')"
          @click="
            $router.push({
              name: 'store-add',
              query: { project: element.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add Store') }}</q-tooltip></q-btn
        >

        <q-btn
          v-if="element.id"
          class="q-ma-sm"
          color="secondary"
          :aria-label="$gettext('Add Deployment')"
          :icon="appIcon('add')"
          :icon-right="modelIcon('deployments')"
          @click="
            $router.push({
              name: 'deployment-add',
              query: { project: element.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add Deployment') }}</q-tooltip></q-btn
        >

        <q-btn
          v-if="element.id"
          class="q-ma-sm"
          color="secondary"
          :aria-label="$gettext('Add Driver')"
          :icon="appIcon('add')"
          :icon-right="modelIcon('devices/drivers')"
          @click="
            $router.push({
              name: 'driver-add',
              query: { project: element.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add Driver') }}</q-tooltip></q-btn
        >
      </template>

      <template #fields>
        <q-card-section>
          <div class="row q-pa-md q-gutter-md">
            <div class="col-4 col-md col-sm">
              <EntitySelect
                v-model="element.platform"
                focus
                :options="platforms"
                :label="$gettext('Platform')"
                detail-route="platform-detail"
                add-route="platform-add"
                :add-tooltip="$gettext('Add Platform')"
                :prepend-icon="modelIcon('platforms')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>

            <div class="col-4 col-md col-sm">
              <q-input
                v-model="element.name"
                outlined
                :label="$gettext('Name')"
                :aria-label="$gettext('Name')"
                lazy-rules
                :rules="[
                  (val) => !!val || $gettext('* Required'),
                  (val) =>
                    val === '' ||
                    !val.includes(' ') ||
                    $gettext('* No blank spaces allowed'),
                ]"
              />
            </div>

            <div class="col-4 col-md col-sm">
              <q-input
                v-model="element.base_os"
                outlined
                :label="$gettext('Base Operating System')"
                :aria-label="$gettext('Base Operating System')"
                lazy-rules
                :rules="[
                  (val) =>
                    !(val && val.trim() !== '' && val.includes(' ')) ||
                    $gettext('* No blank spaces allowed'),
                ]"
              />
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-4 col-md col-sm">
              <q-checkbox
                v-model="element.auto_register_computers"
                left-label
                :label="$gettext('Auto register computers?')"
                :aria-label="$gettext('Auto register computers?')"
              />
            </div>

            <div class="col-4 col-md col-sm">
              <q-select
                v-model="element.pms"
                outlined
                :label="$gettext('Package Management System')"
                :aria-label="$gettext('Package Management System')"
                :options="pms"
                option-value="id"
                option-label="name"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
                @update:model-value="updateArchitectures"
              />
            </div>

            <div class="col-4 col-md col-sm">
              <q-select
                v-model="element.architecture"
                outlined
                multiple
                use-chips
                :rules="[(val) => !!val || $gettext('* Required')]"
                :label="$gettext('Architecture')"
                :aria-label="$gettext('Architecture')"
                :options="architectures"
                :disable="!element.pms"
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
import useAutoFocus from 'composables/autoFocus'

export default {
  components: {
    EntitySelect,
    ItemDetail,
  },
  setup() {
    const uiStore = useUiStore()
    const route = useRoute()
    const { $gettext } = useGettext()
    const { inputRef: primaryInput } = useAutoFocus()

    const title = ref($gettext('Project'))
    const windowTitle = ref(title.value)
    useMeta(() => ({ title: windowTitle.value }))

    const routes = {
      list: 'projects-list',
      add: 'project-add',
      detail: 'project-detail',
    }
    const model = 'projects'

    let element = reactive({ id: 0, auto_register_computers: false })
    const storeCount = ref(0)
    const deploymentCount = ref(0)

    const breadcrumbs = ref([
      {
        text: $gettext('Dashboard'),
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Configuration'),
        icon: appIcon('configuration'),
      },
      {
        text: $gettext('Projects'),
        icon: modelIcon(model),
        to: routes.list,
      },
    ])

    const platforms = ref([])
    const pms = ref([])

    const architectures = computed(() => {
      if (!element.pms) return []

      return pms.value
        .filter((pms) => pms.id === element.pms.id)
        .flatMap((pms) => pms.architectures)
    })

    const hasStores = computed(() => {
      if (!element.id) return false

      return storeCount.value > 0
    })

    const hasDeployments = computed(() => {
      if (!element.id) return false

      return deploymentCount.value > 0
    })

    const updateArchitectures = () => {
      element.architecture = []
    }

    const isValid = computed(() => {
      return (
        element.name !== undefined &&
        element.name.trim() !== '' &&
        !element.name.includes(' ') &&
        (element.base_os === undefined ||
          element.base_os === null ||
          element.base_os.trim() === '' ||
          !element.base_os.includes(' ')) &&
        element.platform !== undefined &&
        element.pms !== undefined &&
        element.architecture !== undefined &&
        Object.keys(element.architecture || {}).length > 0
      )
    })

    const elementData = () => {
      return {
        name: element.name,
        base_os: element.base_os,
        architecture: Array.isArray(element.architecture)
          ? element.architecture.join(' ')
          : '',
        platform: element.platform.id,
        auto_register_computers: element.auto_register_computers,
        pms: element.pms.id,
      }
    }

    const loadRelated = async () => {
      try {
        const [
          platformResponse,
          pmsResponse,
          storeReponse,
          deploymentResponse,
        ] = await Promise.all([
          api.get('/api/v1/token/platforms/'),
          api.get('/api/v1/public/pms/'),
          api.get('/api/v1/token/stores/', {
            params: { project__id: element.id },
          }),
          api.get('/api/v1/token/deployments/', {
            params: { project__id: element.id },
          }),
        ])

        platforms.value = platformResponse.data.results
        storeCount.value = storeReponse.data.count
        deploymentCount.value = deploymentResponse.data.count

        for (const [key, val] of Object.entries(pmsResponse.data)) {
          pms.value.push({
            id: key,
            name: val.module,
            architectures: val.architectures,
          })
        }

        if (route.query.platform)
          element.platform =
            platforms.value.find(
              (item) => item.id === Number(route.query.platform),
            ) || null
      } catch (error) {
        storeCount.value = 0
        deploymentCount.value = 0
        uiStore.notifyError(error)
      }

      if (typeof element.pms === 'string')
        element.pms = pms.value.find((x) => x.id === element.pms)

      if (typeof element.architecture === 'string')
        element.architecture = element.architecture
          ? element.architecture.split(' ')
          : []
    }

    const resetElement = () => {
      Object.assign(element, {
        id: 0,
        auto_register_computers: false,
        name: undefined,
        base_os: undefined,
        platform: undefined,
        pms: undefined,
        architecture: undefined,
      })
    }

    const setTitle = (value) => {
      windowTitle.value = value
    }

    const createDefaultStores = async () => {
      const url = '/api/v1/token/stores/'

      try {
        await api.post(url, {
          name: 'org',
          project: element.id,
        })

        await api.post(url, {
          name: 'thirds',
          project: element.id,
        })

        storeCount.value = 2
        uiStore.notifySuccess($gettext('Data has been added!'))
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    const createDefaultDeployments = async () => {
      const url = '/api/v1/token/deployments/'

      try {
        await api.post(url, {
          enabled: true,
          name: 'org',
          project: element.id,
          included_attributes: [1],
        })

        await api.post(url, {
          enabled: true,
          name: 'thirds',
          project: element.id,
          included_attributes: [1],
        })

        deploymentCount.value = 2
        uiStore.notifySuccess($gettext('Data has been added!'))
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    return {
      breadcrumbs,
      title,
      model,
      routes,
      element,
      platforms,
      pms,
      architectures,
      updateArchitectures,
      isValid,
      hasStores,
      hasDeployments,
      elementData,
      loadRelated,
      resetElement,
      setTitle,
      appIcon,
      modelIcon,
      primaryInput,
      createDefaultStores,
      createDefaultDeployments,
    }
  },
}
</script>
