<template>
  <q-select
    ref="selectInput"
    :model-value="modelValue"
    :options="options"
    :label="label"
    :aria-label="label"
    :multiple="multiple"
    :counter="multiple"
    :clearable="clearable"
    :option-value="optionValue"
    :option-label="optionLabel"
    :use-input="useInput"
    :map-options="mapOptions"
    :lazy-rules="lazyRules"
    :rules="rules"
    @update:model-value="$emit('update:modelValue', $event)"
    @clear="$emit('clear')"
    v-on="filterListeners"
  >
    <template v-if="prependIcon" #prepend>
      <q-icon :name="prependIcon" size="20px" class="opacity-60" />
    </template>

    <template #no-option>
      <q-item>
        <q-item-section class="text-grey text-italic opacity-50">
          {{ $gettext('No results') }}
        </q-item-section>
      </q-item>
    </template>

    <template v-if="useCustomOption" #option="scope">
      <slot name="option" v-bind="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label>{{ scope.opt[optionLabel] }}</q-item-label>
          </q-item-section>
        </q-item>
      </slot>
    </template>

    <template #selected-item="scope">
      <q-chip
        v-if="chipMode"
        removable
        dense
        color="transparent"
        :tabindex="scope.tabindex"
        class="q-ma-sm q-pa-none"
        @remove="scope.removeAtIndex(scope.index)"
      >
        <MigasLink
          v-if="linkModel"
          :model="linkModel"
          :pk="scope.opt[optionValue]"
          :value="scope.opt[optionLabel]"
          @click.stop
        />

        <q-btn
          v-else-if="detailRoute"
          no-caps
          flat
          color="primary"
          class="chip-text"
          :to="detailTo(scope.opt)"
          :label="scope.opt[optionLabel]"
        />

        <span v-else class="chip-text">{{ scope.opt[optionLabel] }}</span>
      </q-chip>

      <q-btn
        v-else-if="detailRoute && !multiple"
        no-caps
        flat
        color="primary"
        :to="detailTo(scope.opt)"
        :label="scope.opt[optionLabel]"
      />

      <span v-else>{{ scope.opt[optionLabel] }}</span>
    </template>

    <template v-if="addRoute" #append>
      <q-btn
        flat
        round
        dense
        color="primary"
        :icon="appIcon('add')"
        size="sm"
        class="add-btn-select opacity-60 hover-opacity-100"
        @click.stop="$router.push({ name: addRoute })"
      >
        <q-tooltip>{{ addTooltip }}</q-tooltip>
      </q-btn>
    </template>
  </q-select>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { appIcon } from 'composables/element'
import MigasLink from 'components/MigasLink.vue'

defineOptions({ name: 'EntitySelect' })

const props = defineProps({
  modelValue: { type: [Object, Array, String, Number], default: null },
  options: { type: Array, required: true },
  label: { type: String, required: true },
  multiple: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  optionValue: { type: String, default: 'id' },
  optionLabel: { type: String, default: 'name' },
  linkModel: { type: String, default: '' },
  chipMode: { type: Boolean, default: false },
  detailRoute: { type: String, default: '' },
  addRoute: { type: String, default: '' },
  addTooltip: { type: String, default: 'Add' },
  prependIcon: { type: String, default: '' },
  lazyRules: { type: Boolean, default: false },
  rules: { type: Array, default: () => [] },
  useInput: { type: Boolean, default: false },
  mapOptions: { type: Boolean, default: false },
  useCustomOption: { type: Boolean, default: false },
  focus: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:modelValue',
  'clear',
  'filter',
  'filter-abort',
])

const selectInput = ref(null)

// Computed to avoid inline object creation in the template on every render
const filterListeners = computed(() =>
  props.useInput
    ? {
        filter: (val, update, abort) => emit('filter', val, update, abort),
        'filter-abort': () => emit('filter-abort'),
      }
    : {},
)

const detailTo = (opt) => ({
  name: props.detailRoute,
  params: { id: opt[props.optionValue] },
})

onMounted(() => {
  if (props.focus && selectInput.value) {
    nextTick(() => selectInput.value.focus())
  }
})
</script>

<style scoped>
.add-btn-select {
  font-size: 14px !important;
  margin-left: 4px;
  transition: transform 0.2s;
}

.add-btn-select:hover {
  transform: scale(1.1);
}
</style>
