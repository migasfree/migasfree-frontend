<template>
  <q-page padding>
    <ItemDetail
      :key="$route.fullPath"
      :breadcrumbs="breadcrumbs"
      :original-title="title"
      :model="model"
      :routes="routes"
      :element="element"
      :is-valid="false"
      :add-button="false"
      :continue-button="false"
      :save-button="false"
      @reset-element="resetElement"
      @set-title="setTitle"
    >
      <template #fields>
        <q-card-section>
          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <q-input
                v-model="element.name"
                outlined
                readonly
                :label="$gettext('Name')"
              />
            </div>

            <div class="col-6 col-md col-sm">
              <q-input
                v-model="element.fullname"
                outlined
                readonly
                :label="$gettext('Fullname')"
              />
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

import ItemDetail from 'components/ui/ItemDetail'

import { appIcon, modelIcon } from 'composables/element'

export default {
  components: { ItemDetail },
  setup() {
    const { $gettext } = useGettext()

    const title = ref($gettext('User'))
    const windowTitle = ref(title.value)
    useMeta(() => ({ title: windowTitle.value }))

    const routes = {
      list: 'users-list',
      detail: 'user-detail',
    }
    const model = 'users'

    let element = reactive({ id: 0 })

    const breadcrumbs = ref([
      {
        text: $gettext('Dashboard'),
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Data'),
        icon: appIcon('data'),
      },
      {
        text: $gettext('Users'),
        icon: modelIcon(model),
        to: routes.list,
      },
    ])

    const resetElement = () => {
      Object.assign(element, {
        id: 0,
        name: undefined,
        fullname: undefined,
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
      resetElement,
      setTitle,
    }
  },
}
</script>
