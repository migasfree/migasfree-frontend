<template>
  <q-select
    :model-value="modelValue"
    :options="options"
    :label="label"
    outlined
    :multiple="multiple"
    :counter="multiple"
    :clearable="clearable"
    :option-value="optionValue"
    :option-label="optionLabel"
    :lazy-rules="lazyRules"
    :rules="rules"
    @update:model-value="$emit('update:modelValue', $event)"
    @clear="$emit('clear')"
  >
    <template v-if="prependIcon" #prepend>
      <q-icon :name="prependIcon" />
    </template>

    <template #selected-item="scope">
      <q-chip
        v-if="chipMode"
        removable
        dense
        :tabindex="scope.tabindex"
        class="q-ma-md"
        @remove="scope.removeAtIndex(scope.index)"
      >
        <template v-if="linkModel">
          <MigasLink
            :model="linkModel"
            :pk="scope.opt[optionValue]"
            :value="scope.opt[optionLabel]"
            @click.stop
          />
        </template>

        <q-btn
          v-else-if="detailRoute"
          no-caps
          flat
          color="primary"
          :to="{
            name: detailRoute,
            params: { id: scope.opt[optionValue] },
          }"
          :label="scope.opt[optionLabel]"
        />

        <span v-else>{{ scope.opt[optionLabel] }}</span>
      </q-chip>

      <q-btn
        v-else-if="detailRoute"
        no-caps
        flat
        color="primary"
        :to="{
          name: detailRoute,
          params: { id: scope.opt[optionValue] },
        }"
        :label="scope.opt[optionLabel]"
      />
    </template>

    <template v-if="addRoute" #append>
      <q-btn
        round
        dense
        color="secondary"
        :icon="appIcon('add')"
        @click="$router.push({ name: addRoute })"
      >
        <q-tooltip>{{ addTooltip }}</q-tooltip>
      </q-btn>
    </template>
  </q-select>
</template>

<script>
import { defineComponent } from 'vue'

import MigasLink from 'components/MigasLink'

import { appIcon } from 'composables/element'

export default defineComponent({
  name: 'EntitySelect',

  components: {
    MigasLink,
  },

  props: {
    modelValue: {
      type: [Object, Array, String, Number],
      default: null,
    },
    options: {
      type: Array,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    optionValue: {
      type: String,
      default: 'id',
    },
    optionLabel: {
      type: String,
      default: 'name',
    },
    linkModel: {
      type: String,
      default: '',
    },
    chipMode: {
      type: Boolean,
      default: false,
    },
    detailRoute: {
      type: String,
      default: '',
    },
    addRoute: {
      type: String,
      default: '',
    },
    addTooltip: {
      type: String,
      default: 'Add',
    },
    prependIcon: {
      type: String,
      default: '',
    },
    lazyRules: {
      type: Boolean,
      default: false,
    },
    rules: {
      type: Array,
      default: () => [],
    },
  },

  setup() {
    return { appIcon }
  },

  emits: ['update:modelValue', 'clear'],
})
</script>
