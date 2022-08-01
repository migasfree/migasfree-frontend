<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Package Information')" :is-export-btn="false">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="packages"
          :pk="element.id"
          :value="element.fullname"
        />
        <q-btn
          v-if="element.url"
          class="q-ma-md"
          size="md"
          icon="mdi-download"
          :label="$gettext('Download')"
          color="info"
          text-color="black"
          type="a"
          :href="`${server}${element.url}`"
        />
      </template>
    </Header>

    <q-card>
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
    </q-card>
  </q-page>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'

import { modelIcon } from 'composables/element'

export default {
  components: {
    Breadcrumbs,
    Header,
    MigasLink,
  },
  setup() {
    const uiStore = useUiStore()
    const route = useRoute()
    const { $gettext } = useGettext()

    const title = ref($gettext('Package Information'))
    useMeta({ title: title.value })

    const model = 'packages'

    const element = reactive({ id: 0 })
    const information = ref(null)
    const loading = ref(false)

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
        text: $gettext('Packages'),
        icon: modelIcon(model),
        to: 'packages-dashboard',
      },
      {
        text: $gettext('Results'),
        to: 'packages-list',
      },
      {
        text: 'Id',
        to: { name: 'package-detail', params: { id: 0 } },
      },
      {
        text: title.value,
      },
    ])

    const loadInfo = async () => {
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

    onMounted(async () => {
      await api
        .get(`/api/v1/token/${model}/${route.params.id}/`)
        .then((response) => {
          Object.assign(element, response.data)
          breadcrumbs.find((x) => x.text === 'Id').to.params.id = element.id
          breadcrumbs.find((x) => x.text === 'Id').text = element.fullname
          title.value = `${title.value}: ${element.fullname}`
          loadInfo()
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    })

    return {
      server: uiStore.server,
      title,
      breadcrumbs,
      element,
      information,
      loading,
    }
  },
}
</script>
