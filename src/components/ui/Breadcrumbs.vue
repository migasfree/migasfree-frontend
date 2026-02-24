<template>
  <q-breadcrumbs
    class="breadcrumbs-container q-mb-lg"
    active-color="brand-primary"
  >
    <template #separator>
      <q-icon size="1.2em" name="chevron_right" class="breadcrumbs-separator" />
    </template>

    <q-breadcrumbs-el
      v-for="(item, index) in items"
      :key="index"
      :label="item.text"
      :icon="item.icon"
      :to="resolveTo(item.to)"
      class="breadcrumbs-item"
      :class="{ 'is-active': index === items.length - 1 }"
    />
  </q-breadcrumbs>
</template>

<script setup>
defineOptions({ name: 'Breadcrumbs' })

defineProps({
  items: {
    type: Array,
    required: true,
    // [{ text: String, to: String|Object, icon?: String }]
  },
})

const resolveTo = (to) => {
  if (typeof to === 'object') return to
  if (typeof to === 'string') return { name: to }
  return ''
}

defineExpose({ goTo: resolveTo })
</script>

<style scoped>
.breadcrumbs-container {
  padding: 8px 16px;
  background: rgba(var(--brand-primary-rgb), 0.03);
  border-radius: 12px;
  display: inline-flex;
  border: 1px solid rgba(var(--brand-primary-rgb), 0.05);
}

[data-theme='dark'] .breadcrumbs-container {
  background: rgba(254, 252, 232, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.breadcrumbs-item {
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s ease;
  color: var(--text-main);
  opacity: 0.6;
}

.breadcrumbs-item:hover {
  opacity: 1 !important;
  color: var(--brand-primary) !important;
}

.is-active {
  opacity: 1;
  color: var(--brand-primary);
  font-weight: 700;
  pointer-events: none;
}

.breadcrumbs-separator {
  opacity: 0.3;
  color: var(--text-main);
}
</style>
