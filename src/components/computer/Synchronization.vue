<template>
  <q-card class="panel sync-card overflow-hidden shadow-2 rounded-borders">
    <q-card-section class="q-pa-lg">
      <!-- Header with User Context & Alert -->
      <div class="panel-header row items-center justify-between q-mb-md">
        <h2 class="panel-title">
          {{ $gettext('Synchronization') }}
        </h2>

        <!-- Right: User & Unsynchronized Alert Header -->
        <div class="flex items-center gap-md">
          <div v-if="syncUser" class="flex items-center">
            <MigasLink
              model="users"
              :pk="syncUser.id"
              :value="syncUser.__str__ || ''"
              :tooltip="$gettext('User')"
              class="text-subtitle2 text-weight-bold text-primary text-decoration-none leading-none"
            />
          </div>
          <div v-if="syncInfo.sync_end_date" class="flex items-center">
            <div
              class="text-subtitle2 text-weight-bold"
              :class="isEndBeforeStart ? 'text-warning' : ''"
            >
              <DateDiff
                :begin="new Date(syncInfo.sync_end_date)"
                :tooltip="$gettext('unsynchronized from')"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="row justify-center q-pa-xl">
        <q-spinner-dots color="primary" size="3em" />
      </div>

      <template v-else>
        <!-- Flow Grid: Vertical Timeline -->
        <div class="row q-col-gutter-lg q-mb-xl">
          <!-- Cycle Flow -->
          <div class="col-12">
            <div
              class="glass-panel q-pa-xl rounded-xl h-full flex column justify-center"
              :class="{ 'theme-warning-border': isEndBeforeStart }"
            >
              <div class="chrono-vertical">
                <!-- Start -->
                <div class="chrono-step">
                  <div class="chrono-marker text-positive">
                    <q-icon name="mdi-play-circle" />
                  </div>
                  <div class="chrono-content">
                    <div class="text-subtitle1 text-weight-bold">
                      <DateView :value="syncInfo.sync_start_date" />
                    </div>
                  </div>
                </div>

                <!-- Duration -->
                <div class="chrono-step chrono-duration">
                  <div class="chrono-marker text-primary">
                    <q-icon name="mdi-timer-outline" />
                  </div>
                  <div
                    class="chrono-content text-subtitle1 text-weight-bold text-primary flex items-center"
                  >
                    <DateDiff
                      v-if="syncInfo.sync_start_date"
                      :begin="new Date(syncInfo.sync_start_date)"
                      :end="new Date(syncInfo.sync_end_date)"
                    />
                    <span v-else>--</span>
                  </div>
                </div>

                <!-- Finished -->
                <div class="chrono-step">
                  <div
                    class="chrono-marker"
                    :class="
                      isEndBeforeStart
                        ? 'text-warning'
                        : $q.dark.isActive
                          ? 'text-blue-grey-3'
                          : 'text-blue-grey-6'
                    "
                  >
                    <q-icon name="mdi-stop-circle" />
                  </div>
                  <div class="chrono-content">
                    <div class="text-subtitle1 text-weight-bold">
                      <DateView :value="syncInfo.sync_end_date" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Attributes -->
        <div class="q-mt-lg">
          <OverflowList
            model="attributes"
            :label="$gettext('Attributes')"
            :items="attributes"
            :icon="modelIcon('attributes')"
          />
        </div>
      </template>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

import DateDiff from 'components/DateDiff'
import DateView from 'components/ui/DateView.vue'
import MigasLink from 'components/MigasLink'
import OverflowList from 'components/ui/OverflowList'

import { modelIcon } from 'composables/element'

defineOptions({
  name: 'ComputerSynchronization',
})

const props = defineProps({
  cid: {
    type: Number,
    required: true,
  },
  syncUser: {
    type: Object,
    default: null,
  },
  syncInfo: {
    type: Object,
    default: () => ({}),
  },
  attributes: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const isEndBeforeStart = computed(() => {
  return props.syncInfo.sync_end_date < props.syncInfo.sync_start_date
})
</script>

<style scoped>
.sync-card {
  max-width: 1000px;
  margin: auto;
}

.text-decoration-none {
  text-decoration: none;
}

/* Vertical Timeline Engine */
.chrono-vertical {
  display: flex;
  flex-direction: column;
}

.chrono-step {
  display: flex;
  position: relative;
  padding-bottom: 28px;
}

.chrono-step:last-child {
  padding-bottom: 0;
}

.chrono-step:not(:last-child)::before {
  content: '';
  position: absolute;
  top: 28px; /* 24px icon + 4px gap */
  bottom: 0;
  left: 11px; /* Center aligned with 24px icon (12px - 1px width) */
  width: 2px;
  background-color: currentColor;
  opacity: 0.15;
}

.chrono-duration {
  align-items: center;
}

.chrono-duration::before {
  border-left: 2px dashed currentColor;
  background-color: transparent !important;
  opacity: 0.3 !important;
}

.chrono-marker {
  font-size: 24px;
  line-height: 1;
  margin-right: 20px;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
}

.chrono-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.theme-warning-border {
  border: 1px solid var(--q-warning) !important;
  background: rgba(var(--q-warning-rgb), 0.02);
}
</style>
