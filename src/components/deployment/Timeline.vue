<template>
  <div class="q-pa-md row q-col-gutter-lg items-center justify-center">
    <!-- Schedule Circle -->
    <div v-if="showing.schedule" class="col-auto">
      <div class="timeline-card">
        <q-circular-progress
          show-value
          class="schedule-indicator"
          :value="showing.schedule.percent"
          size="94px"
          :thickness="0.14"
        >
          <div class="column items-center">
            <q-icon
              :name="modelIcon('schedules')"
              size="22px"
              class="indicator-icon"
            />
            <div class="text-h6 text-weight-bolder indicator-text">
              {{ showing.schedule.percent }}%
            </div>
          </div>

          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">
            <div class="column q-gutter-y-xs">
              <div class="text-weight-bold row items-center">
                <q-icon name="mdi-calendar-clock" class="q-mr-xs" />
                {{ $gettext('Schedule') }}
              </div>
              <q-separator dark class="q-my-xs opacity-20" />
              <div class="row justify-between q-gutter-x-md">
                <span class="opacity-70">{{ $gettext('Start') }}:</span>
                <span class="text-weight-bold">{{
                  showing.schedule.begin_date
                }}</span>
              </div>
              <div class="row justify-between q-gutter-x-md">
                <span class="opacity-70">{{ $gettext('End') }}:</span>
                <span class="text-weight-bold">{{
                  showing.schedule.end_date
                }}</span>
              </div>
            </div>
          </q-tooltip>
        </q-circular-progress>
        <div class="card-label">{{ $gettext('Schedule') }}</div>
      </div>
    </div>

    <!-- Computers Circle -->
    <div class="col-auto">
      <div
        class="timeline-card"
        :class="{
          'status-complete':
            showing.computers.assigned ===
            showing.computers.ok + showing.computers.error,
          'status-error': showing.computers.error > 0,
        }"
      >
        <q-circular-progress
          show-value
          class="computers-indicator"
          :class="showing.computers.error > 0 ? 'color-error' : 'color-success'"
          size="94px"
          :thickness="0.14"
          :min="0"
          :max="showing.computers.assigned"
          :value="showing.computers.ok + showing.computers.error"
        >
          <div class="column items-center">
            <q-icon
              :name="modelIcon('computers')"
              size="22px"
              class="indicator-icon"
            />
            <div
              class="text-subtitle2 text-weight-bolder no-wrap indicator-text"
            >
              {{ showing.computers.ok + showing.computers.error
              }}<span class="opacity-40 q-mx-xs">/</span>
              <q-btn
                flat
                dense
                no-caps
                padding="none"
                color="primary"
                :label="String(showing.computers.assigned)"
                :disabled="loading"
                :loading="loading"
                class="text-subtitle2 text-weight-bolder"
                @click.stop="goToComputers"
              >
                <q-tooltip anchor="top middle" self="bottom middle">{{
                  $gettext('View assigned Computers')
                }}</q-tooltip>
              </q-btn>
            </div>
          </div>

          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">
            <div class="column q-gutter-y-xs timeline-tooltip">
              <div class="text-weight-bold row items-center">
                <q-icon name="mdi-monitor-dashboard" class="q-mr-xs" />
                {{ $gettext('Computers Status') }}
              </div>
              <q-separator dark class="q-my-xs opacity-20" />
              <div class="row justify-between">
                <span class="text-positive"
                  >{{ $gettext('OK Computers') }}:</span
                >
                <span class="text-weight-bold">{{ showing.computers.ok }}</span>
              </div>
              <div
                v-if="showing.computers.error > 0"
                class="row justify-between"
              >
                <span class="text-negative"
                  >{{ $gettext('Computers with any error') }}:</span
                >
                <span class="text-weight-bold">{{
                  showing.computers.error
                }}</span>
              </div>
              <div class="row justify-between opacity-50">
                <span>{{ $gettext('Pending') }}:</span>
                <span class="text-weight-bold">{{
                  showing.computers.assigned -
                  (showing.computers.ok + showing.computers.error)
                }}</span>
              </div>
            </div>
          </q-tooltip>
        </q-circular-progress>
        <div class="card-label">{{ $gettext('Computers') }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import { modelIcon } from 'composables/element'

export default {
  name: 'Timeline',
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    id: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter()
    const uiStore = useUiStore()

    const loading = ref(false)
    const showing = ref(props.modelValue)

    const goToComputers = async () => {
      if (props.id <= 0) return

      loading.value = true
      try {
        const { data } = await api.get(
          `/api/v1/token/stats/deployments/${props.id}/computers/assigned/`,
        )
        router.push({
          name: 'computers-list',
          query: { id_in: data.join(',') },
        })
      } catch (error) {
        uiStore.notifyError(error)
      } finally {
        loading.value = false
      }
    }

    watch(
      () => props.modelValue,
      (newValue) => {
        showing.value = newValue
      },
      { deep: true },
    )

    return { loading, showing, modelIcon, goToComputers }
  },
}
</script>

<style scoped>
/* Base progress colors */
.schedule-indicator :deep(circle.q-circular-progress__circle) {
  color: var(--brand-primary);
}
.schedule-indicator :deep(circle.q-circular-progress__track) {
  color: rgba(var(--brand-primary-rgb), 0.1);
}

.computers-indicator.color-success :deep(circle.q-circular-progress__circle) {
  color: #16a34a;
}
.computers-indicator.color-error :deep(circle.q-circular-progress__circle) {
  color: #dc2626;
}
.computers-indicator :deep(circle.q-circular-progress__track) {
  color: rgba(var(--brand-primary-rgb), 0.1);
}

/* Dark mode progress overrides */
[data-theme='dark']
  .schedule-indicator
  :deep(circle.q-circular-progress__circle) {
  stroke: #fbbf24 !important;
}
[data-theme='dark']
  .schedule-indicator
  :deep(circle.q-circular-progress__track) {
  stroke: #0d0807 !important;
}

[data-theme='dark']
  .computers-indicator.color-success
  :deep(circle.q-circular-progress__circle) {
  stroke: #4ade80 !important;
}
[data-theme='dark']
  .computers-indicator.color-error
  :deep(circle.q-circular-progress__circle) {
  stroke: #f87171 !important;
}
[data-theme='dark']
  .computers-indicator
  :deep(circle.q-circular-progress__track) {
  stroke: #0d0807 !important;
}

/* Card */
.timeline-card {
  background: rgba(var(--brand-primary-rgb), 0.04);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(var(--brand-primary-rgb), 0.1);
  border-radius: 24px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.timeline-card:hover {
  transform: translateY(-6px);
  background: rgba(var(--brand-primary-rgb), 0.06);
  border-color: rgba(var(--brand-primary-rgb), 0.3);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

[data-theme='dark'] .timeline-card {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

/* Status variants */
.status-complete {
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.04);
}
[data-theme='dark'] .status-complete {
  border-color: rgba(74, 222, 128, 0.2);
  background: rgba(74, 222, 128, 0.05);
}

.status-error {
  border-color: rgba(220, 38, 38, 0.2);
}
[data-theme='dark'] .status-error {
  border-color: rgba(248, 113, 113, 0.3);
}

/* Label */
.card-label {
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  opacity: 0.6;
}

[data-theme='dark'] .card-label {
  opacity: 0.7;
  color: #fefce8;
}

/* Indicator icon & text */
.indicator-icon {
  color: var(--brand-primary);
  opacity: 0.8;
}
[data-theme='dark'] .indicator-icon {
  color: #fbbf24;
}

.indicator-text {
  color: var(--text-main);
}
[data-theme='dark'] .indicator-text {
  color: #fefce8;
}

.timeline-tooltip {
  min-width: 150px;
}
</style>
