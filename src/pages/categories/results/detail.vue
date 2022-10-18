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
      :header-link="false"
      @reset-element="resetElement"
      @set-title="setTitle"
    >
      <template #fields>
        <q-card-section>
          <div class="row q-pa-md q-gutter-md">
            <div class="col">
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

import { modelIcon } from 'composables/element'

export default {
  components: {
    ItemDetail,
  },
  setup() {
    const { $gettext } = useGettext()

    const title = ref($gettext('Application Category'))
    const windowTitle = ref(title.value)
    useMeta(() => {
      return {
        title: windowTitle.value,
      }
    })

    const routes = {
      list: 'categories-list',
      add: 'category-add',
      detail: 'category-detail',
    }
    const model = 'catalog/categories'

    let element = reactive({ id: 0 })

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
        text: $gettext('Application Categories'),
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
