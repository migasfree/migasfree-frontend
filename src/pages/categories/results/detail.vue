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
      @reset-element="resetElement"
      @set-title="setTitle"
    >
      <template v-if="element.id" #actions>
        <q-btn
          color="secondary"
          :icon="appIcon('add')"
          :icon-right="modelIcon('catalog/apps')"
          @click="
            $router.push({
              name: 'app-add',
              query: { category: element.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add Application') }}</q-tooltip></q-btn
        >
      </template>

      <template #fields>
        <q-card-section>
          <div class="row q-pa-md q-gutter-md">
            <div class="col">
              <q-input
                ref="nameInput"
                v-model="element.name"
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
import useAutoFocus from 'composables/autoFocus'

export default {
  components: {
    ItemDetail,
  },
  setup() {
    const { $gettext } = useGettext()
    const { inputRef: primaryInput } = useAutoFocus()

    const title = ref($gettext('Application Category'))
    const windowTitle = ref(title.value)
    useMeta(() => ({ title: windowTitle.value }))

    const routes = {
      list: 'categories-list',
      add: 'category-add',
      detail: 'category-detail',
    }
    const model = 'catalog/categories'

    let element = reactive({ id: 0 })
    const { inputRef: nameInput } = useAutoFocus()

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
      nameInput,
      isValid,
      elementData,
      resetElement,
      setTitle,
      appIcon,
      modelIcon,
      primaryInput,
    }
  },
}
</script>
