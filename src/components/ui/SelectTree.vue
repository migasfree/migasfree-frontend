<template>
  <q-input
    outlined
    dense
    readonly
    :value="selected"
    :label="placeholder"
    :hint="hint"
    :disable="disable"
    @input="$refs.menu.show()"
  >
    <template v-slot:append>
      <q-icon name="mdi-menu-down" class="cursor-pointer" />
    </template>

    <template v-if="prependIcon" v-slot:before>
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
export default {
  name: 'SelectTree',
  props: {
    placeholder: {
      type: String,
      required: true
    },
    value: {
      validator: (prop) => typeof prop === 'string' || prop === null,
      required: true
    },
    options: {
      type: Array,
      required: true
    },
    nodeKey: {
      type: String,
      required: false,
      default: 'id'
    },
    labelKey: {
      type: String,
      required: false,
      default: 'label'
    },
    hint: {
      type: String,
      required: false,
      default: ''
    },
    disable: {
      type: Boolean,
      required: false,
      default: false
    },
    defaultExpandAll: {
      type: Boolean,
      required: false,
      default: true
    },
    prependIcon: {
      type: String,
      required: false,
      default: ''
    }
  },
  data() {
    return {
      selected: this.value || null
    }
  },
  methods: {
    nodeSelected(value) {
      const node = this.$refs.tree.getNodeByKey(value)
      this.selected = node[this.labelKey]
      this.$refs.menu.hide()
      this.$emit('select', node)
    },
    reset() {
      this.selected = ''
    }
  }
}
</script>
