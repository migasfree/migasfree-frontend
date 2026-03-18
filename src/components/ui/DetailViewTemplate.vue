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
        <slot name="actions" :element="element" />
      </template>

      <template #fields>
        <q-card-section>
          <div class="row q-pa-md q-gutter-md">
            <div class="col-12 col-md col-sm">
              <q-input
                ref="primaryInput"
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

<script setup>
import { ref, reactive, computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import ItemDetail from 'components/ui/ItemDetail'

import useAutoFocus from 'composables/autoFocus'

defineOptions({ name: 'DetailViewTemplate' })

const props = defineProps({
  title: { type: String, required: true },
  model: { type: String, required: true },
  routes: { type: Object, required: true },
  breadcrumbs: { type: Array, required: true },
})

const { $gettext } = useGettext()
const { inputRef: primaryInput } = useAutoFocus()

const windowTitle = ref(props.title)
useMeta(() => ({ title: windowTitle.value }))

const element = reactive({ id: 0 })

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
</script>
