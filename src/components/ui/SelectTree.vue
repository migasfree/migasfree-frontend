<template>
  <div
    class="select-tree-wrapper cursor-pointer"
    role="button"
    tabindex="0"
    @click="menu?.show()"
    @keydown.space.prevent="menu?.show()"
    @keydown.enter="menu?.show()"
  >
    <q-input
      v-model="selectedLabel"
      readonly
      :label="placeholder"
      :disable="disable"
      class="tree-input no-pointer-events"
    >
      <template v-if="prependIcon" #prepend>
        <div class="filter-icon-box">
          <q-icon :name="prependIcon" size="18px" />
        </div>
      </template>

      <template #append>
        <q-icon
          :name="menuShowing ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          class="cursor-pointer transition-transform"
          :class="{ 'rotate-180': menuShowing }"
        />
      </template>

      <q-menu
        ref="menu"
        fit
        auto-close
        class="glass-menu"
        @show="onMenuShow"
        @hide="menuShowing = false"
      >
        <div class="q-pa-sm">
          <q-tree
            ref="tree"
            v-model:expanded="expandedKeys"
            v-model:selected="selectedKey"
            :nodes="options"
            :node-key="nodeKey"
            :label-key="labelKey"
            class="tree-content"
            selected-color="primary"
            @lazy-load="(...args) => emit('lazy-load', ...args)"
          >
            <template #default-header="prop">
              <div
                class="row items-center cursor-pointer full-width tree-node-header"
                role="treeitem"
                tabindex="0"
                :aria-selected="String(prop.node[nodeKey] === selectedKey)"
                @click.stop="handleNodeClick(prop)"
                @keydown.space.prevent.stop="handleNodeClick(prop)"
                @keydown.enter.stop="handleNodeClick(prop)"
              >
                <q-icon
                  :name="getNodeIcon(prop)"
                  size="20px"
                  class="q-mr-sm node-icon"
                  :class="{ expanded: prop.expanded }"
                />
                <div class="node-label text-weight-bold">
                  {{ getNodeLabel(prop.node) }}
                </div>

                <q-space />

                <q-icon
                  v-if="isExpandable(prop)"
                  :name="
                    prop.expanded ? 'mdi-chevron-down' : 'mdi-chevron-right'
                  "
                  size="sm"
                  class="opacity-40"
                />
              </div>
            </template>
          </q-tree>
        </div>
      </q-menu>
    </q-input>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

defineOptions({ name: 'SelectTree' })

const props = defineProps({
  placeholder: { type: String, required: true },
  modelValue: {
    validator: (v) =>
      typeof v === 'string' || v === null || typeof v === 'number',
    required: true,
  },
  options: { type: Array, required: true },
  nodeKey: { type: String, default: 'id' },
  labelKey: { type: String, default: 'label' },
  disable: { type: Boolean, default: false },
  defaultExpandAll: { type: Boolean, default: false },
  prependIcon: { type: String, default: '' },
})

const emit = defineEmits(['select', 'update:model-value', 'lazy-load'])

const menu = ref(null)
const tree = ref(null)
const menuShowing = ref(false)
const expandedKeys = ref([])
const selectedKey = ref(props.modelValue)

// --- Tree traversal helpers ---

const walkTree = (nodes, key, visitor) => {
  for (const node of nodes) {
    const result = visitor(node)
    if (result !== undefined) return result
    if (node.children) {
      const found = walkTree(node.children, key, visitor)
      if (found !== undefined) return found
    }
  }
  return undefined
}

const findNodeByKey = (nodes, key) =>
  walkTree(nodes, key, (node) =>
    String(node[props.nodeKey]) === String(key) ? node : undefined,
  )

const findPathByKey = (nodes, key, path = []) => {
  for (const node of nodes) {
    const label = getNodeLabel(node)
    const currentPath = [...path, label]
    if (String(node[props.nodeKey]) === String(key)) return currentPath
    if (node.children) {
      const found = findPathByKey(node.children, key, currentPath)
      if (found) return found
    }
  }
  return null
}

const collectExpandableKeys = (nodes) => {
  const keys = []
  const collect = (list) => {
    for (const n of list) {
      if (n.children) {
        keys.push(n[props.nodeKey])
        collect(n.children)
      }
    }
  }
  collect(nodes)
  return keys
}

const isExpandable = (prop) =>
  prop.expandable || prop.node.lazy || prop.node.children?.length > 0

// --- Node helpers ---

const getNodeLabel = (node) => {
  return node[props.labelKey] || node.label || node.name || ''
}

const getNodeIcon = (prop) => {
  if (prop.node.icon) return prop.node.icon
  if (isExpandable(prop))
    return prop.expanded ? 'mdi-folder-open-outline' : 'mdi-folder-outline'
  // Special case: if it's the 'All' option (empty ID), we can skip the icon or use a specific one
  if (prop.node[props.nodeKey] === '') return 'mdi-filter-variant'
  return 'mdi-circle-medium'
}

// --- Computed ---

const selectedLabel = computed(() => {
  if (!selectedKey.value) return ''
  const path = findPathByKey(props.options, selectedKey.value)
  return path ? path.join(' / ') : selectedKey.value
})

// --- Actions ---

const handleNodeClick = (prop) => {
  const key = prop.node[props.nodeKey]

  if (isExpandable(prop)) {
    tree.value?.setExpanded(key, !prop.expanded)
  } else {
    selectedKey.value = key
  }
}

const onMenuShow = () => {
  menuShowing.value = true
  if (!props.defaultExpandAll) expandedKeys.value = []
}

const reset = () => {
  selectedKey.value = null
  emit('select', null)
  emit('update:model-value', null)
}

defineExpose({ reset, menu, tree })

// --- Watchers ---

watch(selectedKey, (newKey) => {
  if (newKey) {
    emit('select', findNodeByKey(props.options, newKey))
    emit('update:model-value', newKey)
    menu.value?.hide()
  }
})

watch(
  () => props.modelValue,
  (val) => {
    selectedKey.value = val
  },
)

watch(
  () => props.options,
  (opts) => {
    if (props.defaultExpandAll && opts.length)
      expandedKeys.value = collectExpandableKeys(opts)
  },
  { immediate: true },
)
</script>

<style scoped>
.select-tree-wrapper {
  width: 100%;
}

.tree-input {
  transition: all 0.3s ease;
}

:deep(.q-field__control) {
  background: rgba(var(--brand-primary-rgb), 0.04);
  border-radius: var(--radius, 14px);
  padding: 0 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

[data-theme='dark'] :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.05);
}

:deep(.q-field__control:before) {
  border-bottom: none !important;
}

/* Focus */
.tree-input:focus-within :deep(.q-field__control) {
  background: white;
  box-shadow: 0 0 0 4px rgba(var(--brand-primary-rgb), 0.1);
}

[data-theme='dark'] .tree-input:focus-within :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1);
}

:deep(.q-field__label) {
  font-weight: 600;
}

:deep(.q-field__native) {
  font-weight: 700;
  cursor: pointer;
}

.tree-content {
  color: var(--text-main);
}

[data-theme='dark'] .tree-content,
[data-theme='dark'] .tree-content :deep(.q-tree__node-header) {
  color: #fefce8 !important;
}

[data-theme='dark'] .tree-content :deep(.q-tree__arrow),
[data-theme='dark'] .tree-content :deep(.q-tree__node-header:before) {
  color: rgba(254, 252, 232, 0.4) !important;
}

[data-theme='dark'] .tree-content :deep(.q-tree__connection) {
  border-color: rgba(254, 252, 232, 0.2) !important;
}

.node-label {
  font-size: 0.95rem;
}

.node-icon {
  opacity: 0.7;
}

[data-theme='dark'] .node-label,
[data-theme='dark'] .node-icon {
  color: #fefce8 !important;
}

.tree-node-header {
  padding: 8px 12px;
  border-radius: 10px;
  transition: all 0.2s ease;
  margin: 2px 0;
  color: inherit;
}

.tree-node-header:hover {
  background: rgba(var(--brand-primary-rgb), 0.08);
}

[data-theme='dark'] .tree-node-header:hover {
  background: rgba(255, 255, 255, 0.05);
}

:deep(.q-tree__node--selected) > .q-tree__node-header {
  background: rgba(var(--brand-primary-rgb), 0.1) !important;
  font-weight: 700;
}

[data-theme='dark'] :deep(.q-tree__node--selected) > .q-tree__node-header {
  background: rgba(254, 252, 232, 0.15) !important;
}

.transition-transform {
  transition: transform 0.3s ease;
}

.no-pointer-events {
  pointer-events: none;
}
</style>
