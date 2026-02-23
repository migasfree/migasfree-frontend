<template>
  <q-select
    :model-value="modelValue"
    :options="options"
    :label="label"
    option-value="id"
    option-label="name"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #prepend>
      <div class="filter-icon-box">
        <q-icon :name="appIcon('filter')" size="18px" />
      </div>
    </template>

    <template #option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section v-if="scope.opt.icon" avatar>
          <q-icon :name="scope.opt.icon" size="20px" />
        </q-item-section>

        <q-item-section>
          <q-item-label class="text-weight-bold">{{
            scope.opt.name
          }}</q-item-label>
          <q-item-label v-if="scope.opt.count !== undefined" caption>
            {{
              $ngettext(
                '%{ count } element',
                '%{ count } elements',
                scope.opt.count,
                { count: scope.opt.count },
              )
            }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'
import { appIcon } from 'composables/element'

defineOptions({ name: 'FilterSelect' })

const { $ngettext } = useGettext()

defineProps({
  modelValue: { type: [Object, String, Number], default: null },
  options: { type: Array, required: true },
  label: { type: String, required: true },
})

defineEmits(['update:modelValue'])
</script>
