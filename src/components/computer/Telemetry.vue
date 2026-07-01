<template>
  <!-- Loading State -->
  <div v-if="loadingSync" class="row justify-center q-pa-xl">
    <q-spinner-dots color="primary" size="3em" />
  </div>

  <template v-else>
    <div class="row q-col-gutter-lg items-start">
      <!-- Card 1: System -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card
          class="panel detail-card overflow-hidden shadow-2 rounded-borders"
        >
          <q-card-section class="q-pa-lg">
            <div
              class="panel-header row items-center justify-between q-col-gutter-sm q-mb-md"
            >
              <h2 class="panel-title text-h6 text-weight-bold">
                {{ $gettext('System') }}
              </h2>
            </div>

            <!-- Environment & Network Information -->
            <div class="row q-col-gutter-md">
              <!-- Platform -->
              <div v-if="platform" class="col-12 col-sm-6 col-md-12">
                <div class="data-field">
                  <span
                    class="data-field-label text-caption text-weight-bold opacity-60"
                  >
                    {{ $gettext('Platform') }}
                  </span>
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
              <div v-if="project" class="col-12 col-sm-6 col-md-12">
                <div class="data-field">
                  <span
                    class="data-field-label text-caption text-weight-bold opacity-60"
                  >
                    {{ $gettext('Project') }}
                  </span>
                  <div class="q-mt-xs text-subtitle2">
                    <MigasLink
                      model="projects"
                      :pk="project.id"
                      :value="project.name"
                    />
                  </div>
                </div>
              </div>

              <!-- IP Address -->
              <div v-if="ipAddress" class="col-12 col-sm-6 col-md-12">
                <div class="data-field">
                  <span
                    class="data-field-label text-caption text-weight-bold opacity-60"
                  >
                    {{ $gettext('IP Address') }}
                  </span>
                  <div
                    class="net-value-row q-mt-xs text-subtitle2 flex items-center"
                  >
                    <q-icon
                      name="mdi-ip-network"
                      size="18px"
                      class="q-mr-xs opacity-60"
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
              <div v-if="forwardedIpAddress" class="col-12 col-sm-6 col-md-12">
                <div class="data-field">
                  <span
                    class="data-field-label text-caption text-weight-bold opacity-60"
                  >
                    {{ $gettext('Forwarded IP') }}
                  </span>
                  <div
                    class="net-value-row q-mt-xs text-subtitle2 flex items-center"
                  >
                    <q-icon
                      name="mdi-ip"
                      size="18px"
                      class="q-mr-xs opacity-60"
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
          </q-card-section>
        </q-card>
      </div>

      <!-- Card 2: Diagnostics -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card
          class="panel detail-card overflow-hidden shadow-2 rounded-borders"
        >
          <q-card-section class="q-pa-lg">
            <div
              class="panel-header row items-center justify-between q-col-gutter-sm q-mb-md"
            >
              <h2 class="panel-title text-h6 text-weight-bold">
                {{ $gettext('Diagnostics') }}
              </h2>
            </div>

            <div class="row q-col-gutter-md q-mt-xs">
              <!-- Errors Diagnostic Card -->
              <div class="col-12 col-sm-6 col-md-12">
                <div class="diagnostic-box theme-critical">
                  <div class="row items-center q-mb-sm">
                    <q-icon
                      :name="modelIcon('errors')"
                      size="24px"
                      class="text-critical q-mr-sm"
                      aria-hidden="true"
                    />
                    <span class="text-subtitle1 text-weight-bold">{{
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

              <!-- Faults Diagnostic Card -->
              <div class="col-12 col-sm-6 col-md-12">
                <div class="diagnostic-box theme-warning">
                  <div class="row items-center q-mb-sm">
                    <q-icon
                      :name="modelIcon('faults')"
                      size="24px"
                      class="text-warning q-mr-sm"
                      aria-hidden="true"
                    />
                    <span class="text-subtitle1 text-weight-bold">{{
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
          </q-card-section>
        </q-card>
      </div>

      <!-- Card 3: Last Synchronization -->
      <div class="col-12 col-sm-12 col-md-4">
        <q-card
          class="panel detail-card overflow-hidden shadow-2 rounded-borders"
          :class="{ 'theme-warning-border': isEndBeforeStart }"
        >
          <q-card-section class="q-pa-lg">
            <div
              class="panel-header panel-header-wrap row items-center justify-between q-col-gutter-sm q-mb-md"
            >
              <h2 class="panel-title panel-title-wrap text-h6 text-weight-bold">
                {{ $gettext('Last Synchronization') }}
              </h2>
              <div class="row items-center no-wrap q-gutter-x-sm">
                <div
                  v-if="syncInfo.sync_end_date"
                  class="text-subtitle2 text-weight-bold"
                  :class="isEndBeforeStart ? 'text-warning' : 'text-primary'"
                >
                  <DateDiff
                    :begin="new Date(syncInfo.sync_end_date)"
                    :tooltip="$gettext('unsynchronized from')"
                  />
                </div>
                <MigasLink
                  v-if="syncUser"
                  model="users"
                  :pk="syncUser.id"
                  :value="syncUser.__str__ || ''"
                  :tooltip="$gettext('Sync User')"
                  class="text-weight-bold text-decoration-none"
                />
              </div>
            </div>

            <div class="chrono-vertical q-mt-lg">
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
          </q-card-section>
        </q-card>
      </div>

      <!-- Bottom Row: Attributes -->
      <div class="col-12">
        <q-card
          class="panel detail-card overflow-hidden shadow-2 rounded-borders"
        >
          <q-card-section class="q-pa-lg">
            <div class="panel-header row items-center q-mb-md">
              <h2 class="panel-title text-h6 text-weight-bold">
                {{ $gettext('Attributes') }}
              </h2>
            </div>

            <!-- Attributes, Attribute Sets & Domains -->
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
          </q-card-section>
        </q-card>
      </div>
    </div>
  </template>
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
.panel-header-wrap {
  flex-wrap: wrap !important;
}

.panel-title-wrap {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: clip !important;
  flex: none !important;
}

.panel-title {
  margin: 0;
}

/* Diagnostic Boxes Layout */
.diagnostic-box {
  position: relative;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  background: rgba(var(--brand-primary-rgb), 0.02);
  transition: all 0.3s ease;
  border: 1px solid rgba(var(--brand-primary-rgb), 0.05);
}

[data-theme='dark'] .diagnostic-box {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.05);
}

.diagnostic-box:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  border-color: var(--brand-primary);
}

.theme-critical {
  border-left: 4px solid var(--q-negative);
}
.theme-warning {
  border-left: 4px solid var(--q-warning);
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

.border-top-dashed {
  border-top: 1px dashed rgba(128, 128, 128, 0.2);
}
</style>
