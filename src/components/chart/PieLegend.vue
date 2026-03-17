<template>
  <q-list separator :dense="flatData.length > 8" class="rounded-borders">
    <template v-for="(group, gIndex) in flatData" :key="'g' + gIndex">
      <!-- Parent Item (Inner Ring) -->
      <q-item
        v-ripple
        clickable
        class="legend-item q-py-sm"
        :class="{
          'bg-blue-grey-1':
            hoverIndex === group.index && hoverSeries === 0 && !isDark,
          'bg-grey-9':
            hoverIndex === group.index && hoverSeries === 0 && isDark,
        }"
        @mouseenter="$emit('highlight', group.index, 0)"
        @focus="$emit('highlight', group.index, 0)"
        @mouseleave="$emit('downplay', 0)"
        @blur="$emit('downplay', 0)"
        @click="$emit('item-click', { data: group })"
      >
        <q-item-section avatar class="legend-item-section">
          <div
            class="color-dot shadow-1"
            :style="{ backgroundColor: group.color }"
          ></div>
        </q-item-section>

        <q-item-section>
          <q-item-label class="text-weight-bold">
            {{ group.name }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <div class="row items-center q-gutter-x-sm">
            <span class="text-weight-bold">{{ group.value }}</span>
            <q-badge v-if="dataTotal > 0" color="grey-4" text-color="grey-10">
              {{ getPercentage(group.value) }}%
            </q-badge>
          </div>
        </q-item-section>
      </q-item>

      <!-- Child Items (Outer Ring / Subdata) -->
      <q-item
        v-for="(child, cIndex) in group.children"
        :key="'c' + cIndex"
        v-ripple
        clickable
        dense
        class="legend-child-item q-ml-lg q-py-xs"
        :class="{
          'bg-blue-grey-1':
            hoverIndex === child.index && hoverSeries === 1 && !isDark,
          'bg-grey-9':
            hoverIndex === child.index && hoverSeries === 1 && isDark,
        }"
        @mouseenter="$emit('highlight', child.index, 1)"
        @focus="$emit('highlight', child.index, 1)"
        @mouseleave="$emit('downplay', 1)"
        @blur="$emit('downplay', 1)"
        @click="$emit('item-click', { data: child })"
      >
        <q-item-section avatar class="legend-item-section">
          <div
            class="color-dot-child"
            :style="{ backgroundColor: getOuterColor(child.index) }"
          ></div>
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-caption text-weight-bold text-grey-9">
            {{ child.name }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="row items-center q-gutter-x-sm">
            <span class="text-caption text-weight-bold text-grey-9">{{
              child.value
            }}</span>
            <q-badge v-if="dataTotal > 0" color="grey-4" text-color="grey-10">
              {{ getPercentage(child.value) }}%
            </q-badge>
          </div>
        </q-item-section>
      </q-item>
    </template>
  </q-list>
</template>

<script setup>
defineOptions({ name: 'PieLegend' })

const props = defineProps({
  flatData: { type: Array, required: true },
  dataTotal: { type: Number, required: true },
  hoverIndex: { type: Number, required: true },
  hoverSeries: { type: Number, required: true },
  isDark: { type: Boolean, required: true },
  getOuterColor: { type: Function, required: true },
})

defineEmits(['highlight', 'downplay', 'item-click'])

const getPercentage = (value) => {
  if (!props.dataTotal || props.dataTotal === 0) return '0.0'
  return ((value / props.dataTotal) * 100).toFixed(1)
}
</script>

<style scoped>
.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.color-dot-child {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  opacity: 0.5;
  margin-left: 4px;
}

.legend-item {
  border-radius: 8px;
  transition: background-color 0.2s;
}

.legend-child-item {
  border-radius: 6px;
  min-height: 32px;
  opacity: 0.8;
  transition: all 0.2s;
  border-left: 2px solid transparent;
}

.legend-child-item:hover {
  opacity: 1;
  background: rgba(var(--brand-primary-rgb), 0.04);
  border-left-color: var(--brand-primary);
}

[data-theme='dark'] .legend-child-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-left-color: var(--brand-tertiary);
}

.legend-item-section {
  min-width: 24px;
  padding-right: 8px;
}
</style>
