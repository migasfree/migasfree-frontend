<template>
  <FilteredMultiSelect
    v-model="localValue"
    clearable
    :label="label"
    :fetch-options="filterAttributes"
  >
    <template #option="{ scope }">
      <q-item v-bind="scope.itemProps">
        {{ attributeValue(scope.opt) }}
      </q-item>
    </template>

    <template #selected-item="{ scope }">
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
  </FilteredMultiSelect>

  <div v-if="hasPaste" class="row">
    <q-btn
      flat
      :icon="appIcon('copy')"
      color="primary"
      @click.stop="copyList(model, localValue)"
      ><q-tooltip>{{ $gettext('Copy') }}</q-tooltip></q-btn
    >

    <q-btn flat :icon="appIcon('paste')" color="primary" @click.stop="onPaste"
      ><q-tooltip>{{ $gettext('Paste') }}</q-tooltip></q-btn
    >
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'

import { api } from 'boot/axios'

import FilteredMultiSelect from 'components/ui/FilteredMultiSelect'
import MigasLink from 'components/MigasLink'

import useCopyPaste from 'composables/copyPaste'
import { appIcon, useElement } from 'composables/element'

export default {
  name: 'SelectAttributes',
  components: { FilteredMultiSelect, MigasLink },
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
    const { copyList, pasteList, hasPaste } = useCopyPaste()
    const { elementIcon, equivalentModel, equivalentKey, attributeValue } =
      useElement()

    const model = 'attributes'
    const localValue = ref(props.modelValue)

    const addAttribute = (item) => {
      if (!localValue.value.find((attr) => attr.id === item.id)) {
        localValue.value.push(item)
      }
    }

    const enrichAttribute = async (val) => {
      if (val.status && val.summary) {
        return val
      }

      if (
        val.property_att?.prefix === 'CID' ||
        val.property_att?.prefix === 'SET' ||
        val.property_att?.prefix === 'DMN'
      ) {
        const { data } = await api.get(
          `/api/v1/token/${model}/${val.id}/badge/`,
        )
        return {
          ...val,
          ...data,
          description: data.text,
        }
      }

      if (val.property_att?.sort === 'server') {
        return {
          ...val,
          status: 'tag',
        }
      }

      return val
    }

    const updateAttributes = async () => {
      const updatedArray = await Promise.all(
        localValue.value.map(enrichAttribute),
      )
      localValue.value = updatedArray
      emit('update:model-value', [...updatedArray])
    }

    const filterAttributes = async (val) => {
      const { data } = await api.get(`/api/v1/token/${model}/`, {
        params: { search: val.toLowerCase() },
      })

      return data.results
    }

    const onPaste = async () => {
      await pasteList(addAttribute)
      await updateAttributes()
    }

    watch(
      () => props.modelValue,
      async (newVal, oldVal) => {
        if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
          localValue.value = [...newVal]
          await updateAttributes()
        }
      },
      { immediate: true },
    )

    watch(localValue, (newValue) => {
      if (newValue === null) newValue = []
      emit('update:model-value', newValue)
    })

    onMounted(async () => {
      await updateAttributes()
    })

    return {
      model,
      localValue,
      copyList,
      onPaste,
      hasPaste,
      appIcon,
      elementIcon,
      equivalentModel,
      equivalentKey,
      attributeValue,
      filterAttributes,
      updateAttributes,
    }
  },
}
</script>
