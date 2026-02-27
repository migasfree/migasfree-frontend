<template>
  <div v-if="items.length" class="overflow-list-wrapper">
    <q-expansion-item
      v-model="isExpanded"
      class="overflow-item"
      header-class="overflow-header"
      expand-icon-class="text-brand-primary"
    >
      <template #header>
        <q-item-section avatar>
          <div class="header-icon-container">
            <q-icon
              :name="icon || 'mdi-format-list-bulleted'"
              size="22px"
              aria-hidden="true"
            />
          </div>
        </q-item-section>

        <q-item-section>
          <div class="row items-center no-wrap">
            <span class="header-label text-weight-bold">{{ label }}</span>
            <div class="items-count-badge q-ml-md">{{ items.length }}</div>
          </div>
        </q-item-section>
      </template>

      <div class="overflow-content-container">
        <div class="overflow-grid">
          <div
            v-for="(item, index) in items"
            :key="index"
            class="overflow-grid-item"
          >
            <MigasLink
              v-if="model || item.model"
              :model="item.model || model"
              :pk="item.id"
              :icon="
                item.icon || elementIcon(item.status) || 'mdi-link-variant'
              "
              :value="itemLabel(item)"
              :tooltip="item.summary || ''"
            />
            <div v-else class="simple-item">
              <q-icon
                name="mdi-circle-small"
                size="18px"
                color="neutral-300"
                aria-hidden="true"
              />
              <span>{{ item }}</span>
            </div>
          </div>
        </div>
      </div>
    </q-expansion-item>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MigasLink from 'components/MigasLink'
import { useElement } from 'composables/element'

defineOptions({ name: 'OverflowList' })

defineProps({
  label: { type: String, required: true },
  icon: { type: String, default: '' },
  items: { type: Array, required: true },
  model: { type: String, default: '' },
})

const { elementIcon } = useElement()

const isExpanded = ref(true)

const itemLabel = (item) =>
  item && typeof item === 'object'
    ? item.value || item.name || item.__str__
    : item
</script>

<style scoped>
.overflow-list-wrapper {
  margin-bottom: 0.75rem;
}

.overflow-item {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px -5px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.overflow-item:hover {
  border-color: var(--brand-secondary);
}

.header-icon-container {
  width: 32px;
  height: 32px;
  background: var(--warning-surface);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--brand-primary);
}

.header-label {
  font-size: 0.95rem;
  color: var(--text-main);
  letter-spacing: -0.01em;
}

.items-count-badge {
  background: var(--brand-primary);
  color: var(--brand-on-primary);
  padding: 1px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 800;
}

.overflow-content-container {
  padding: 0.75rem 1rem;
  background: rgba(var(--neutral-100-rgb), 0.3);
  border-top: 1px solid var(--border);
  max-height: 250px;
  overflow-y: auto;
}

.overflow-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.overflow-grid-item {
  flex: 0 0 auto;
}

:deep(.overflow-header) {
  min-height: 48px;
  padding: 4px 12px;
}

.simple-item {
  display: flex;
  align-items: center;
  padding: 0.3rem 0.6rem;
  background: var(--neutral-100);
  border-radius: 6px;
  font-size: 0.85rem;
  color: var(--neutral-700);
}
</style>
