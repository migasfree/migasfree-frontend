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
      @reset-element="resetElement"
      @set-title="setTitle"
    >
      <template #fields>
        <q-card-section>
          <div class="row q-pa-md q-gutter-md">
            <div class="col-12 col-md col-sm">
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
        </q-card-section>
      </template>
    </ItemDetail>
  </q-page>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import ItemDetail from 'components/ui/ItemDetail'

import { appIcon, modelIcon } from 'composables/element'

export default {
  components: { ItemDetail },
  setup() {
    const { $gettext } = useGettext()

    const title = ref($gettext('Device Type'))
    const windowTitle = ref(title.value)
    useMeta(() => {
      return {
        title: windowTitle.value,
      }
    })

    const routes = {
      list: 'device-types-list',
      add: 'device-type-add',
      detail: 'device-type-detail',
    }
    const model = 'devices/types'

    let element = reactive({ id: 0 })

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Devices'),
        icon: appIcon('devices'),
      },
      {
        text: $gettext('Device Types'),
        icon: modelIcon(model),
        to: routes.list,
      },
    ])

    const isValid = computed(() => {
      return element.name !== undefined && element.name.trim() !== ''
    })

    const elementData = () => {
      return {
        name: element.name,
      }
    }

    const resetElement = () => {
      Object.assign(element, {
        id: 0,
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
      isValid,
      elementData,
      resetElement,
      setTitle,
    }
  },
}
</script>
