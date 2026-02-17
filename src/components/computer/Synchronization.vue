<template>
  <q-card class="sync-card shadow-2 rounded-borders">
    <q-card-section class="q-pb-none">
      <!-- Header -->
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center q-gutter-sm">
          <div
            class="text-h6 text-weight-bold"
            :class="$q.dark.isActive ? 'text-white' : 'text-grey-8'"
          >
            {{ $gettext('Synchronization') }}
          </div>
        </div>
        <div v-if="syncInfo.sync_end_date" class="col-auto">
          <DateDiff
            :begin="new Date(syncInfo.sync_end_date)"
            :tooltip="$gettext('unsynchronized from')"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="row justify-center q-pa-lg">
        <q-spinner-dots color="primary" size="3em" />
      </div>

      <template v-else>
        <!-- Hero Section: User -->
        <div
          v-if="syncUser"
          class="row items-center q-pa-lg rounded-borders q-mb-lg hero-section"
          :class="$q.dark.isActive ? 'bg-blue-grey-10' : 'bg-blue-grey-1'"
        >
          <div class="col-auto q-mr-lg">
            <q-icon
              name="mdi-account-circle"
              size="4em"
              :color="$q.dark.isActive ? 'blue-grey-3' : 'blue-grey-8'"
            />
          </div>
          <div class="col">
            <div
              class="text-caption uppercase q-mb-xs"
              :class="
                $q.dark.isActive ? 'text-blue-grey-4' : 'text-blue-grey-6'
              "
            >
              {{ $gettext('User') }}
            </div>
            <MigasLink
              model="users"
              :pk="syncUser.id"
              :value="syncUser.__str__ || ''"
              :tooltip="$gettext('User')"
              :light="$q.dark.isActive"
              class="text-h5 text-weight-medium"
            />
          </div>
        </div>

        <!-- Spec Grid: Start, End, Duration -->
        <div class="row q-col-gutter-md q-mb-lg">
          <!-- Start Date -->
          <div class="col-12 col-sm-4">
            <div
              class="spec-box q-pa-md rounded-borders text-white"
              :class="$q.dark.isActive ? 'bg-black' : 'bg-blue-grey-9'"
            >
              <div class="row no-wrap items-center">
                <q-icon
                  name="mdi-play"
                  size="md"
                  class="q-mr-md"
                  :class="$q.dark.isActive ? 'text-green-3' : 'text-green-2'"
                />
                <div class="col overflow-hidden">
                  <div class="text-caption uppercase q-mb-xs text-grey-5">
                    {{ $gettext('Start') }}
                  </div>
                  <div class="text-subtitle1 text-weight-medium">
                    <DateView :value="syncInfo.sync_start_date" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- End Date -->
          <div class="col-12 col-sm-4">
            <div
              class="spec-box q-pa-md rounded-borders text-white"
              :class="[
                $q.dark.isActive ? 'bg-black' : 'bg-blue-grey-9',
                isEndBeforeStart ? 'sync-warning' : '',
              ]"
            >
              <div class="row no-wrap items-center">
                <q-icon
                  name="mdi-stop"
                  size="md"
                  class="q-mr-md"
                  :class="$q.dark.isActive ? 'text-red-3' : 'text-red-2'"
                />
                <div class="col overflow-hidden">
                  <div class="text-caption uppercase q-mb-xs text-grey-5">
                    {{ $gettext('End') }}
                  </div>
                  <div class="text-subtitle1 text-weight-medium">
                    <DateView :value="syncInfo.sync_end_date" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Duration -->
          <div class="col-12 col-sm-4">
            <div
              class="spec-box q-pa-md rounded-borders text-white"
              :class="$q.dark.isActive ? 'bg-black' : 'bg-blue-grey-9'"
            >
              <div class="row no-wrap items-center">
                <div class="col overflow-hidden">
                  <div class="text-caption uppercase q-mb-xs text-grey-5">
                    {{ $gettext('Duration') }}
                  </div>
                  <div class="text-subtitle1 text-weight-medium">
                    <DateDiff
                      v-if="syncInfo.sync_start_date"
                      :begin="new Date(syncInfo.sync_start_date)"
                      :end="new Date(syncInfo.sync_end_date)"
                      :tooltip="$gettext('last sync time')"
                    />
                    <span v-else>--</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Attributes -->
        <OverflowList
          model="attributes"
          :label="$gettext('Attributes')"
          :items="attributes"
        />
      </template>
    </q-card-section>
  </q-card>
</template>

<script>
import { computed } from 'vue'
import { date } from 'quasar'

import DateDiff from 'components/DateDiff'
import DateView from 'components/ui/DateView.vue'
import MigasLink from 'components/MigasLink'
import OverflowList from 'components/ui/OverflowList'

export default {
  name: 'ComputerSynchronization',
  components: {
    DateDiff,
    DateView,
    MigasLink,
    OverflowList,
  },
  props: {
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
  },
  setup(props) {
    const isEndBeforeStart = computed(() => {
      return props.syncInfo.sync_end_date < props.syncInfo.sync_start_date
    })

    const formatDateTime = (dateString) => {
      if (!dateString) return '--'
      return date.formatDate(new Date(dateString), 'YYYY-MM-DD HH:mm:ss')
    }

    return {
      isEndBeforeStart,
      formatDateTime,
    }
  },
}
</script>

<style scoped>
.sync-card {
  max-width: 1000px;
  margin: auto;
}

.hero-section {
  border: 1px solid rgba(128, 128, 128, 0.1);
}

.spec-box {
  transition: transform 0.2s ease;
}

.sync-warning {
  background-color: #f9a825 !important;
  color: #000 !important;
}

.sync-warning .text-caption,
.sync-warning .q-icon {
  color: rgba(0, 0, 0, 0.7) !important;
}

.uppercase {
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
