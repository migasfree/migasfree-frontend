<template>
  <q-card class="panel detail-card overflow-hidden shadow-2 rounded-borders">
    <q-card-section class="q-pa-lg">
      <!-- Header -->
      <div class="panel-header row items-center justify-between q-mb-md">
        <h2 class="panel-title text-h6 text-weight-bold">
          {{ $gettext('Telemetry') }}
        </h2>
      </div>

      <!-- Loading State -->
      <div v-if="loadingSync" class="row justify-center q-pa-xl">
        <q-spinner-dots color="primary" size="3em" />
      </div>

      <template v-else>
        <!-- Row 1: Diagnostics (Errors & Faults) -->
        <div class="row q-col-gutter-lg q-mb-lg">
          <!-- Errors Diagnostic Card -->
          <div class="col-12 col-sm-6">
            <div class="diagnostic-card theme-critical">
              <div class="column full-height relative-position z-top">
                <div class="row items-center q-mb-md">
                  <q-icon
                    :name="modelIcon('errors')"
                    size="24px"
                    class="text-critical q-mr-sm"
                    aria-hidden="true"
                  />
                  <span class="text-subtitle1 text-bold">{{
                    $gettext('Errors')
                  }}</span>
                </div>

                <div class="row q-col-gutter-sm items-center full-width">
                  <div v-if="errors.unchecked > 0" class="col-6">
                    <router-link
                      :to="{
                        name: 'errors-list',
                        query: { computer_id: cid, checked: false },
                      }"
                      class="action-stat-btn full-width column items-center text-center text-decoration-none"
                      :class="
                        $q.dark.isActive
                          ? 'bg-grey-9 text-critical'
                          : 'bg-grey-2 text-critical'
                      "
                    >
                      <span
                        class="text-h5 text-weight-bolder line-height-1 q-mb-xs"
                        >{{ errors.unchecked }}</span
                      >
                      <span
                        class="text-caption text-weight-bold uppercase opacity-70"
                        >{{ $gettext('Unchecked') }}</span
                      >
                    </router-link>
                  </div>
                  <div :class="errors.unchecked > 0 ? 'col-6' : 'col-12'">
                    <router-link
                      :to="{
                        name: 'errors-list',
                        query: { computer_id: cid },
                      }"
                      class="action-stat-btn full-width column items-center text-center text-decoration-none"
                      :class="
                        $q.dark.isActive
                          ? 'bg-grey-9 text-white'
                          : 'bg-grey-2 text-dark'
                      "
                    >
                      <span
                        class="text-h5 text-weight-bolder line-height-1 q-mb-xs"
                        >{{ errors.total }}</span
                      >
                      <span
                        class="text-caption text-weight-bold uppercase opacity-70"
                        >{{ $gettext('Total') }}</span
                      >
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Faults Diagnostic Card -->
          <div class="col-12 col-sm-6">
            <div class="diagnostic-card theme-warning">
              <div class="column full-height relative-position z-top">
                <div class="row items-center q-mb-md">
                  <q-icon
                    :name="modelIcon('faults')"
                    size="24px"
                    class="text-warning q-mr-sm"
                    aria-hidden="true"
                  />
                  <span class="text-subtitle1 text-bold">{{
                    $gettext('Faults')
                  }}</span>
                </div>

                <div class="row q-col-gutter-sm items-center full-width">
                  <div v-if="faults.unchecked > 0" class="col-6">
                    <router-link
                      :to="{
                        name: 'faults-list',
                        query: { computer_id: cid, checked: false },
                      }"
                      class="action-stat-btn full-width column items-center text-center text-decoration-none"
                      :class="
                        $q.dark.isActive
                          ? 'bg-grey-9 text-warning'
                          : 'bg-grey-2 text-orange-9'
                      "
                    >
                      <span
                        class="text-h5 text-weight-bolder line-height-1 q-mb-xs"
                        >{{ faults.unchecked }}</span
                      >
                      <span
                        class="text-caption text-weight-bold uppercase opacity-70"
                        >{{ $gettext('Unchecked') }}</span
                      >
                    </router-link>
                  </div>
                  <div :class="faults.unchecked > 0 ? 'col-6' : 'col-12'">
                    <router-link
                      :to="{
                        name: 'faults-list',
                        query: { computer_id: cid },
                      }"
                      class="action-stat-btn full-width column items-center text-center text-decoration-none"
                      :class="
                        $q.dark.isActive
                          ? 'bg-grey-9 text-white'
                          : 'bg-grey-2 text-dark'
                      "
                    >
                      <span
                        class="text-h5 text-weight-bolder line-height-1 q-mb-xs"
                        >{{ faults.total }}</span
                      >
                      <span
                        class="text-caption text-weight-bold uppercase opacity-70"
                        >{{ $gettext('Total') }}</span
                      >
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 2: Environment & Network Information -->
        <div class="solid-panel q-pa-md q-mb-lg">
          <div class="row q-col-gutter-md">
            <!-- Platform -->
            <div v-if="platform" class="col-12 col-sm-6">
              <div class="data-field">
                <span
                  class="data-field-label text-caption text-weight-bold opacity-60"
                  >{{ $gettext('Platform') }}</span
                >
                <div class="q-mt-xs text-subtitle2">
                  <MigasLink
                    model="platforms"
                    :pk="platform.id"
                    :value="platform.name"
                  />
                </div>
              </div>
            </div>

            <!-- Project -->
            <div v-if="project" class="col-12 col-sm-6">
              <div class="data-field">
                <span
                  class="data-field-label text-caption text-weight-bold opacity-60"
                  >{{ $gettext('Project') }}</span
                >
                <div class="q-mt-xs text-subtitle2">
                  <MigasLink
                    model="projects"
                    :pk="project.id"
                    :value="project.name"
                  />
                </div>
              </div>
            </div>

            <!-- Main IP -->
            <div v-if="ipAddress" class="col-12 col-sm-6">
              <div class="data-field">
                <span
                  class="data-field-label text-caption text-weight-bold opacity-60"
                  >{{ $gettext('IP Address') }}</span
                >
                <div
                  class="net-value-row q-mt-xs text-subtitle2 flex items-center"
                >
                  <q-icon
                    name="mdi-ip-network"
                    size="18px"
                    class="q-mr-xs"
                    aria-hidden="true"
                  />
                  <span class="text-mono text-weight-medium">{{
                    ipAddress
                  }}</span>
                  <CopyToClipboard
                    :content="ipAddress"
                    size="sm"
                    flat
                    class="opacity-40 q-ml-xs"
                  />
                </div>
              </div>
            </div>

            <!-- Forwarded IP -->
            <div v-if="forwardedIpAddress" class="col-12 col-sm-6">
              <div class="data-field">
                <span
                  class="data-field-label text-caption text-weight-bold opacity-60"
                  >{{ $gettext('Forwarded IP') }}</span
                >
                <div
                  class="net-value-row q-mt-xs text-subtitle2 flex items-center"
                >
                  <q-icon
                    name="mdi-ip"
                    size="18px"
                    class="opacity-50 q-mr-xs"
                    aria-hidden="true"
                  />
                  <span class="text-mono text-weight-medium">{{
                    forwardedIpAddress
                  }}</span>
                  <CopyToClipboard
                    :content="forwardedIpAddress"
                    size="sm"
                    flat
                    class="opacity-40 q-ml-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 3: Last Synchronization Timeline & User -->
        <div
          class="glass-panel q-pa-md q-mb-lg rounded-xl flex column justify-center"
          :class="{ 'theme-warning-border': isEndBeforeStart }"
        >
          <div class="row items-center justify-between q-mb-md">
            <span
              class="text-caption text-weight-bold opacity-60 uppercase tracking-wider"
            >
              {{ $gettext('Last Synchronization') }}
            </span>
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

          <div class="chrono-vertical">
            <!-- Start -->
            <div class="chrono-step">
              <div class="chrono-marker text-positive">
                <q-icon name="mdi-play-circle" aria-hidden="true" />
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
                <q-icon name="mdi-timer-outline" aria-hidden="true" />
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
                <q-icon name="mdi-stop-circle" aria-hidden="true" />
              </div>
              <div class="chrono-content">
                <div class="text-subtitle1 text-weight-bold">
                  <DateView :value="syncInfo.sync_end_date" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 4: Attributes, Attribute Sets & Domains -->
        <div class="q-gutter-y-md">
          <OverflowList
            v-if="attributes && attributes.length > 0"
            model="attributes"
            :label="$gettext('Attributes')"
            :items="attributes"
            :icon="modelIcon('attributes')"
          />

          <OverflowList
            v-if="attributeSets && attributeSets.length > 0"
            model="attribute-sets"
            :label="$gettext('Attribute Sets')"
            :items="attributeSets"
            :icon="modelIcon('attribute-sets')"
          />

          <OverflowList
            v-if="domains && domains.length > 0"
            model="domains"
            :label="$gettext('Domains')"
            :items="domains"
            :icon="modelIcon('domains')"
          />
        </div>
      </template>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { useGettext } from 'vue3-gettext'

import DateDiff from 'components/DateDiff'
import DateView from 'components/ui/DateView'
import MigasLink from 'components/MigasLink'
import OverflowList from 'components/ui/OverflowList'
import CopyToClipboard from 'components/ui/CopyToClipboard'

import { modelIcon } from 'composables/element'

defineOptions({
  name: 'ComputerTelemetry',
})

const props = defineProps({
  cid: {
    type: Number,
    required: true,
  },
  project: {
    type: Object,
    default: null,
  },
  platform: {
    type: Object,
    default: null,
  },
  ipAddress: {
    type: String,
    default: null,
  },
  forwardedIpAddress: {
    type: String,
    default: null,
  },
  syncUser: {
    type: Object,
    default: null,
  },
  syncInfo: {
    type: Object,
    default: () => ({}),
  },
  loadingSync: {
    type: Boolean,
    default: false,
  },
  attributes: {
    type: Array,
    default: () => [],
  },
  attributeSets: {
    type: Array,
    default: () => [],
  },
  domains: {
    type: Array,
    default: () => [],
  },
  errors: {
    type: Object,
    default: () => ({ unchecked: 0, total: 0 }),
  },
  faults: {
    type: Object,
    default: () => ({ unchecked: 0, total: 0 }),
  },
})

const { $gettext } = useGettext()

const isEndBeforeStart = computed(() => {
  return props.syncInfo.sync_end_date < props.syncInfo.sync_start_date
})
</script>

<style scoped>
.panel-title {
  margin: 0;
}

/* Diagnostic Cards Layout */
.diagnostic-card {
  position: relative;
  border-radius: 12px;
  padding: 1.25rem;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  background: rgba(var(--brand-primary-rgb), 0.02);
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
  border: 1px solid rgba(var(--brand-primary-rgb), 0.05);
}

[data-theme='dark'] .diagnostic-card {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.05);
}

.diagnostic-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border-color: var(--brand-primary);
}

.theme-critical {
  border-top: 4px solid var(--q-negative);
}
.theme-warning {
  border-top: 4px solid var(--q-warning);
}

.action-stat-btn {
  border-radius: 10px;
  padding: 0.8rem 0.2rem;
  transition: all 0.2s ease;
  min-width: 0;
  display: flex;
}

.action-stat-btn:hover {
  filter: brightness(0.95);
}

[data-theme='dark'] .action-stat-btn:hover {
  filter: brightness(1.2);
}

/* Environment & Network */
.solid-panel {
  border: 1px solid rgba(128, 128, 128, 0.15);
  border-radius: 12px;
}

/* Vertical Timeline */
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
  top: 28px;
  bottom: 0;
  left: 11px;
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
