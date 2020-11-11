<template>
  <div>
    <q-field
      v-model="selected"
      outlined
      dense
      stack-label
      :label="placeholder"
      :hint="hint"
      :disable="disable"
    >
      <template v-slot:append>
        <q-icon name="mdi-menu-down" />
      </template>

      <template v-if="prependIcon" v-slot:before>
        <q-icon :name="prependIcon" />
      </template>

      <template v-if="selected" v-slot:control>
        <div class="self-center full-width no-outline" tabindex="0">
          <q-chip color="primary" text-color="white" dense>
            {{ selected }}
          </q-chip>
        </div>
      </template>

      <q-popup-proxy ref="popup" :breakpoint="600" fit>
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
      </q-popup-proxy>
    </q-field>
  </div>
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
      this.$refs.popup.hide()
      this.$emit('select', node)
    },
    reset() {
      this.selected = ''
    }
  }
}
</script>
