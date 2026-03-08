<template>
  <div class="schedule-progress-wrapper">
    <q-linear-progress
      :size="size"
      :value="timeline.percent / 100"
      class="schedule-bar"
      :class="{
        'glow-success': timeline.percent > 90,
        'glow-info': timeline.percent <= 90,
      }"
    >
      <div class="absolute-full flex flex-center">
        <div class="glass-badge">{{ timeline.percent }}%</div>
      </div>

      <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">
        <div class="column q-pa-xs">
          <div class="row items-center q-mb-xs">
            <q-icon name="mdi-calendar-start" size="14px" class="q-mr-xs" />
            <span class="text-caption">{{ $gettext('Start') }}:</span>
            <span class="text-weight-bold q-ml-xs">{{
              timeline.begin_date
            }}</span>
          </div>
          <div class="row items-center">
            <q-icon name="mdi-calendar-end" size="14px" class="q-mr-xs" />
            <span class="text-caption">{{ $gettext('End') }}:</span>
            <span class="text-weight-bold q-ml-xs">{{
              timeline.end_date
            }}</span>
          </div>
        </div>
      </q-tooltip>
    </q-linear-progress>
  </div>
</template>

<script setup>
defineOptions({ name: 'ScheduleProgress' })
defineProps({
  timeline: {
    type: Object,
    required: true,
  },
  size: {
    type: String,
    required: false,
    default: '24px',
  },
})
</script>

<style scoped>
.schedule-progress-wrapper {
  width: 100%;
  padding: 4px 0;
}

.schedule-bar {
  border-radius: 12px;
  background: rgba(var(--brand-primary-rgb), 0.08);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(var(--brand-primary-rgb), 0.05);
}

[data-theme='dark'] .schedule-bar {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
}

:deep(.q-linear-progress__model) {
  background: linear-gradient(90deg, var(--brand-primary), #d97706);
  border-radius: 12px;
}

[data-theme='dark'] :deep(.q-linear-progress__model) {
  background: linear-gradient(90deg, #ca8a04, #f59e0b);
}

.glow-info :deep(.q-linear-progress__model) {
  box-shadow: 0 0 12px rgba(var(--brand-primary-rgb), 0.25);
}

[data-theme='dark'] .glow-info :deep(.q-linear-progress__model) {
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.3);
}

.glow-success :deep(.q-linear-progress__model) {
  background: linear-gradient(90deg, #16a34a, #4ade80);
}

[data-theme='dark'] .glow-success :deep(.q-linear-progress__model) {
  background: linear-gradient(90deg, #22c55e, #86efac);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
}
</style>
