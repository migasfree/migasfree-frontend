<template>
  <q-select
    ref="attributesComponent"
    v-model="localValue"
    outlined
    use-input
    map-options
    multiple
    counter
    input-debounce="0"
    clearable
    :label="label"
    :hint="
      $gettext('Type to search (minimum %{num} characters)', {
        num: MIN_CHARS_SEARCH,
      })
    "
    :options="attributes"
    @filter="filterAttributes"
    @filter-abort="abortFilterAttributes"
  >
    <template #no-option>
      <q-item>
        <q-item-section v-translate class="text-grey">
          No results
        </q-item-section>
      </q-item>
    </template>

    <template #option="scope">
      <q-item v-bind="scope.itemProps">
        {{ attributeValue(scope.opt) }}
      </q-item>
    </template>

    <template #selected-item="scope">
      <q-chip
        removable
        dense
        :tabindex="scope.tabindex"
        class="q-ma-md"
        @remove="scope.removeAtIndex(scope.index)"
      >
        <MigasLink
          :model="equivalentModel(scope.opt)"
          :pk="equivalentKey(scope.opt)"
          :value="attributeValue(scope.opt)"
          :icon="elementIcon(scope.opt.status)"
          :tooltip="scope.opt.summary"
        />
      </q-chip>
    </template>
  </q-select>

  <div v-if="hasPaste" class="row">
    <q-btn
      flat
      icon="mdi-content-copy"
      color="primary"
      @click.stop="copyList(model, localValue)"
      ><q-tooltip>{{ $gettext('Copy') }}</q-tooltip></q-btn
    >

    <q-btn
      flat
      icon="mdi-content-paste"
      color="primary"
      @click.stop="pasteList(attributesComponent)"
      ><q-tooltip>{{ $gettext('Paste') }}</q-tooltip></q-btn
    >
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'

import { api } from 'boot/axios'
import MigasLink from 'components/MigasLink'
import { useUiStore } from 'stores/ui'
import { MIN_CHARS_SEARCH } from 'config/app.conf'

import useCopyPaste from 'composables/copyPaste'
import { useElement } from 'composables/element'

export default {
  name: 'SelectAttributes',
  components: { MigasLink },
  props: {
    modelValue: {
      type: Array,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
  emits: ['update:model-value'],
  setup(props, { emit }) {
    const uiStore = useUiStore()

    const { copyList, pasteList, hasPaste } = useCopyPaste()
    const { elementIcon, equivalentModel, equivalentKey, attributeValue } =
      useElement()

    const attributesComponent = ref(null)

    const model = 'attributes'
    const attributes = ref([])
    const localValue = ref(props.modelValue)

    onMounted(() => {
      updateAttributes()
    })

    const filterAttributes = async (val, update, abort) => {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < MIN_CHARS_SEARCH) {
        abort()
        return
      }

      await api
        .get(`/api/v1/token/${model}/`, {
          params: { search: val.toLowerCase() },
        })
        .then((response) => {
          attributes.value = response.data.results
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      update(() => {})
    }

    const abortFilterAttributes = () => {
      // console.log('delayed filter aborted')
    }

    const updateAttributes = () => {
      if (localValue.value === null) {
        localValue.value = []
        return
      }

      Object.entries(localValue.value).map(([key, val]) => {
        if (
          !('status' in val) &&
          'property_att' in val &&
          (val.property_att.prefix === 'CID' ||
            val.property_att.prefix === 'SET' ||
            val.property_att.prefix === 'DMN')
        ) {
          api
            .get(`/api/v1/token/${model}/${val.id}/badge/`)
            .then((response) => {
              localValue.value[key] = Object.assign(
                {},
                localValue.value[key],
                response.data,
              )
              localValue.value[key].description = response.data.text
            })
            .catch((error) => {
              uiStore.notifyError(error)
            })
        }
        if (
          !('status' in val) &&
          'property_att' in val &&
          val.property_att.sort === 'server'
        ) {
          localValue.value[key].status = 'tag'
        }
      })
      emit('update:model-value', localValue)
    }

    watch(
      () => props.modelValue,
      (newValue) => {
        localValue.value = newValue
        updateAttributes()
      },
    )

    watch(localValue, (newValue) => {
      if (newValue === null) newValue = []
      emit('update:model-value', newValue)
    })

    return {
      attributesComponent,
      model,
      attributes,
      localValue,
      copyList,
      pasteList,
      hasPaste,
      elementIcon,
      equivalentModel,
      equivalentKey,
      attributeValue,
      filterAttributes,
      abortFilterAttributes,
      updateAttributes,
      MIN_CHARS_SEARCH,
    }
  },
}
</script>
