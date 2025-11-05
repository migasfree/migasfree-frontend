<template>
  <q-page padding>
    <ItemDetail
      :breadcrumbs="breadcrumbs"
      :original-title="title"
      :icon="titleIcon"
      :model="model"
      :routes="routes"
      :element="element"
      :is-valid="false"
      :add-button="false"
      :continue-button="false"
      :save-button="false"
      :remove-button="false"
      @set-related="setRelated"
      @set-title="setTitle"
    >
      <template #fields>
        <q-card-section>
          <div class="row q-pa-md q-gutter-md">
            <div class="col-md">
              <div v-if="loading" class="text-center">
                <q-spinner-dots color="primary" size="3em" />
              </div>

              <q-markdown :src="information" />
            </div>
          </div>
        </q-card-section>
      </template>
    </ItemDetail>
  </q-page>
</template>

<script>
import { ref, reactive } from 'vue'
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

    const titleIcon = appIcon('information')
    const title = $gettext('Package Information')
    const windowTitle = ref(title)
    useMeta(() => {
      return {
        title: windowTitle.value,
      }
    })

    const routes = {
      list: 'packages-list',
    }
    const model = 'packages'

    const element = reactive({ id: 0 })
    const information = ref(null)
    const loading = ref(false)

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
      {
        text: $gettext('Results'),
        icon: appIcon('results'),
        to: routes.list,
      },
      {
        text: 'Id',
        to: { name: 'package-detail', params: { id: 0 } },
      },
      {
        text: title,
        icon: titleIcon,
      },
    ])

    const setRelated = async () => {
      loading.value = true
      await api
        .get(`/api/v1/token/${model}/${element.id}/info/`)
        .then((response) => {
          information.value = response.data.data
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
        .finally(() => (loading.value = false))
    }

    const setTitle = (value) => {
      windowTitle.value = value
    }

    return {
      server: uiStore.server,
      title,
      titleIcon,
      routes,
      model,
      breadcrumbs,
      element,
      information,
      loading,
      setTitle,
      setRelated,
    }
  },
}
</script>
