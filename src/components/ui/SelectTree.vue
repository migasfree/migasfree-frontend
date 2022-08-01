<template>
  <q-input
    v-model="selected"
    outlined
    dense
    readonly
    :label="placeholder"
    :hint="hint"
    :disable="disable"
    @update:model-value="menu.show()"
  >
    <template #append>
      <q-icon name="mdi-menu-down" class="cursor-pointer" />
    </template>

    <template v-if="prependIcon" #before>
      <q-icon :name="prependIcon" />
    </template>

    <q-menu ref="menu" fit auto-close>
      <q-tree
        ref="tree"
        class="q-ma-sm"
        :nodes="options"
        :node-key="nodeKey"
        :label-key="labelKey"
        :default-expand-all="defaultExpandAll"
        :selected="selected"
        @update:selected="nodeSelected"
      >
      </q-tree>
    </q-menu>
  </q-input>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'SelectTree',
  props: {
    placeholder: {
      type: String,
      required: true,
    },
    modelValue: {
      validator: (prop) => typeof prop === 'string' || prop === null,
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
    nodeKey: {
      type: String,
      required: false,
      default: 'id',
    },
    labelKey: {
      type: String,
      required: false,
      default: 'label',
    },
    hint: {
      type: String,
      required: false,
      default: '',
    },
    disable: {
      type: Boolean,
      required: false,
      default: false,
    },
    defaultExpandAll: {
      type: Boolean,
      required: false,
      default: true,
    },
    prependIcon: {
      type: String,
      required: false,
      default: '',
    },
  },
  emits: ['select'],
  setup(props, { emit }) {
    const selected = ref(props.modelValue || null)
    const menu = ref(null)
    const tree = ref(null)

    const nodeSelected = (value) => {
      const node = tree.value.getNodeByKey(value)
      selected.value = node[props.labelKey]
      menu.value.hide()
      emit('select', node)
    }

    const reset = () => {
      selected.value = ''
    }

    watch(
      () => props.modelValue,
      (newValue) => {
        selected.value = newValue
      }
    )

    return { selected, menu, tree, nodeSelected, reset }
  },
}
</script>
