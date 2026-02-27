<template>
  <q-card class="panel software-card overflow-hidden shadow-2 rounded-borders">
    <q-card-section class="q-pa-lg">
      <!-- Header -->
      <div class="panel-header row items-center justify-between q-mb-md">
        <h2 class="panel-title">
          {{ $gettext('Software') }}
        </h2>
        <div class="actions-group row items-center q-gutter-x-md">
          <q-btn
            unelevated
            color="primary"
            :icon="appIcon('compare')"
            :label="`${$gettext('Compare')}...`"
            @click="showingCompare = true"
          />
        </div>
      </div>

      <!-- Main Layout: 2 Columns -->
      <div class="row q-col-gutter-xl">
        <!-- INVENTORY COLUMN -->
        <div class="col-12 col-xl-6">
          <div class="software-column flex column q-gutter-y-sm">
            <div class="row items-center justify-between q-mb-sm">
              <div class="row items-center q-gutter-x-sm">
                <span class="tech-data-label text-weight-bold">{{
                  $gettext('Inventory')
                }}</span>
                <q-badge
                  v-if="inventoryLoaded"
                  color="primary"
                  class="badge-counter"
                >
                  <span v-if="searchInventory" class="q-mr-xs opacity-70"
                    >{{ filteredSoftwareInventory.length }} /</span
                  >
                  {{ softwareInventory.length }}
                </q-badge>
              </div>

              <div class="row items-center q-gutter-x-xs">
                <template v-if="inventoryLoaded">
                  <q-btn
                    flat
                    round
                    :color="showSearchInventory ? 'primary' : 'grey-7'"
                    :icon="
                      showSearchInventory ? 'mdi-close' : appIcon('search')
                    "
                    size="12px"
                    class="opacity-80 hover-opacity-100"
                    @click="toggleSearchInventory"
                  >
                    <q-tooltip>{{
                      showSearchInventory
                        ? $gettext('Hide search')
                        : $gettext('Search')
                    }}</q-tooltip>
                  </q-btn>

                  <q-btn
                    flat
                    round
                    :icon="appIcon('copy')"
                    size="12px"
                    color="primary"
                    class="opacity-80 hover-opacity-100"
                    @click="copyInventory"
                  >
                    <q-tooltip>{{ $gettext('Copy') }}</q-tooltip>
                  </q-btn>

                  <q-btn
                    v-if="isSuperUser"
                    flat
                    round
                    :icon="appIcon('delete')"
                    size="12px"
                    color="negative"
                    class="opacity-60 hover-opacity-100"
                    @click="confirmRemoveInventory = true"
                  >
                    <q-tooltip>{{ $gettext('Delete') }}</q-tooltip>
                  </q-btn>
                </template>

                <q-btn
                  v-else
                  flat
                  color="primary"
                  :label="$gettext('Load')"
                  icon="mdi-cloud-download"
                  size="md"
                  :loading="loading.inventory"
                  :aria-label="$gettext('Load inventory')"
                  @click="loadSoftwareInventory"
                />
              </div>
            </div>

            <q-slide-transition>
              <div v-show="showSearchInventory" class="q-pb-sm">
                <q-input
                  ref="searchInputInventory"
                  v-model="searchInventory"
                  dense
                  outlined
                  :placeholder="$gettext('Search')"
                  clearable
                >
                  <template #prepend>
                    <q-icon name="mdi-magnify" aria-hidden="true" />
                  </template>
                </q-input>
              </div>
            </q-slide-transition>

            <!-- Content Panel -->
            <template v-if="inventoryLoaded">
              <div
                class="content-panel glass-panel panel-fixed-height flex column no-wrap overflow-hidden relative-position"
              >
                <div class="relative-position z-10 flex column col">
                  <div class="col flex column pt-sm">
                    <q-virtual-scroll
                      class="col"
                      :items="filteredSoftwareInventory"
                      :items-size="filteredSoftwareInventory.length"
                    >
                      <template #default="{ item }">
                        <div :key="item.id" class="pkg-wrapper">
                          <MigasLink
                            model="packages"
                            :pk="item.id"
                            :value="item.name"
                            icon="mdi-package-variant-closed"
                            class="pkg-card"
                          />
                        </div>
                      </template>
                    </q-virtual-scroll>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- HISTORY COLUMN -->
        <div class="col-12 col-xl-6">
          <div class="software-column flex column q-gutter-y-sm">
            <div class="row items-center justify-between q-mb-sm">
              <div class="row items-center q-gutter-x-sm">
                <span class="tech-data-label text-weight-bold">{{
                  $gettext('History')
                }}</span>
                <q-badge
                  v-if="historyLoaded"
                  color="secondary"
                  class="badge-counter"
                >
                  <span v-if="searchHistory" class="q-mr-xs opacity-70"
                    >{{ filteredSoftwareHistoryDates.length }} /</span
                  >
                  {{ softwareHistoryLength }}
                </q-badge>
              </div>

              <div class="row items-center q-gutter-x-xs">
                <template v-if="historyLoaded">
                  <q-btn
                    flat
                    round
                    :color="showSearchHistory ? 'secondary' : 'grey-7'"
                    :icon="showSearchHistory ? 'mdi-close' : appIcon('search')"
                    size="12px"
                    class="opacity-80 hover-opacity-100"
                    @click="toggleSearchHistory"
                  >
                    <q-tooltip>{{
                      showSearchHistory
                        ? $gettext('Hide search')
                        : $gettext('Search')
                    }}</q-tooltip>
                  </q-btn>

                  <q-btn
                    flat
                    round
                    :icon="appIcon('copy')"
                    size="12px"
                    color="primary"
                    class="opacity-80 hover-opacity-100"
                    @click="copyHistory"
                  >
                    <q-tooltip>{{ $gettext('Copy') }}</q-tooltip>
                  </q-btn>

                  <q-btn
                    v-if="isSuperUser"
                    flat
                    round
                    icon="mdi-delete-clock-outline"
                    size="12px"
                    color="negative"
                    class="opacity-60 hover-opacity-100"
                    @click="confirmRemoveHistory = true"
                  >
                    <q-tooltip>{{ $gettext('Delete') }}</q-tooltip>
                  </q-btn>
                </template>

                <q-btn
                  v-else
                  flat
                  color="primary"
                  :label="$gettext('Load')"
                  icon="mdi-cloud-download"
                  size="md"
                  :loading="loading.history"
                  :aria-label="$gettext('Load history')"
                  @click="loadSoftwareHistory"
                />
              </div>
            </div>

            <q-slide-transition>
              <div v-show="showSearchHistory" class="q-pb-sm">
                <q-input
                  ref="searchInputHistory"
                  v-model="searchHistory"
                  dense
                  outlined
                  :placeholder="$gettext('Search')"
                  clearable
                >
                  <template #prepend>
                    <q-icon name="mdi-magnify" aria-hidden="true" />
                  </template>
                </q-input>
              </div>
            </q-slide-transition>

            <!-- Content Panel -->
            <template v-if="historyLoaded">
              <div
                class="content-panel glass-panel panel-fixed-height flex column no-wrap overflow-hidden relative-position"
              >
                <div class="relative-position z-10 flex column col">
                  <div class="scroll-area q-pa-md col">
                    <q-expansion-item
                      v-for="(changes, date) in filteredSoftwareHistory"
                      :key="date"
                      class="history-card q-mb-md glass-panel overflow-hidden"
                      header-class="history-header"
                      :default-opened="false"
                    >
                      <template #header>
                        <q-item-section avatar>
                          <q-icon
                            name="mdi-calendar-clock"
                            color="grey-7"
                            size="20px"
                            aria-hidden="true"
                          />
                        </q-item-section>
                        <q-item-section>
                          <DateView :value="date" class="text-bold text-sm" />
                        </q-item-section>
                        <q-item-section side>
                          <div class="row q-gutter-x-xs items-center">
                            <q-badge
                              v-if="getAddCount(changes)"
                              color="positive"
                              class="badge-sm"
                              >+{{ getAddCount(changes) }}</q-badge
                            >
                            <q-badge
                              v-if="getRemoveCount(changes)"
                              color="negative"
                              class="badge-sm"
                              >-{{ getRemoveCount(changes) }}</q-badge
                            >
                            <q-btn
                              v-if="isSuperUser && !showSearchHistory"
                              flat
                              round
                              dense
                              size="sm"
                              :icon="appIcon('delete')"
                              color="negative"
                              @click.stop="deleteHistory(date)"
                            >
                              <q-tooltip>{{ $gettext('Delete') }}</q-tooltip>
                            </q-btn>
                          </div>
                        </q-item-section>
                      </template>

                      <q-virtual-scroll
                        class="overflow-auto history-virtual-scroll"
                        :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
                        :items="changes"
                        :items-size="changes.length"
                      >
                        <template #default="{ item: pkg }">
                          <div
                            :key="pkg.name"
                            class="row items-center no-wrap gap-sm full-width overflow-hidden q-pb-sm"
                          >
                            <q-icon
                              :name="
                                pkg.mode === '+'
                                  ? 'mdi-plus-circle'
                                  : 'mdi-minus-circle'
                              "
                              :color="
                                pkg.mode === '+' ? 'positive' : 'negative'
                              "
                              size="20px"
                              class="opacity-80 flex-shrink-0"
                              aria-hidden="true"
                            />
                            <MigasLink
                              model="packages"
                              :pk="pkg.id || 0"
                              :value="pkg.name"
                              class="pkg-card"
                              :class="
                                pkg.mode === '+'
                                  ? 'border-add'
                                  : 'border-remove'
                              "
                            />
                          </div>
                        </template>
                      </q-virtual-scroll>
                    </q-expansion-item>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </q-card-section>

    <q-dialog v-model="showingCompare" persistent>
      <q-card>
        <q-card-section class="q-pa-lg">
          <h2 class="panel-title">
            {{ $gettext('Software Compare') }}
          </h2>
        </q-card-section>

        <q-card-section class="row items-center">
          <FilteredMultiSelect
            ref="primaryInput"
            v-model="target"
            :label="$gettext('Computer')"
            :fetch-options="filterComputers"
            :multiple="false"
          >
            <template #option="{ scope }">
              <q-item v-bind="scope.itemProps">
                {{ scope.opt.__str__ }}
              </q-item>
            </template>

            <template #selected-item="{ scope }">
              <q-chip
                removable
                dense
                color="transparent"
                :tabindex="scope.tabindex"
                class="q-ma-md q-pa-none"
                @remove="scope.removeAtIndex(scope.index)"
              >
                <MigasLink
                  model="computers"
                  :pk="scope.opt.id"
                  :value="scope.opt.__str__ || ''"
                  :icon="elementIcon(scope.opt.status)"
                  :tooltip="scope.opt.summary"
                />
              </q-chip>
            </template>
          </FilteredMultiSelect>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            v-close-popup
            flat
            color="primary"
            :label="$gettext('Cancel')"
            @click="showingCompare = false"
          />

          <q-btn
            v-close-popup
            :icon="appIcon('compare')"
            color="primary"
            :disabled="!isCompareEnabled"
            :label="$gettext('Compare')"
            @click="compare"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <RemoveDialog
      v-model="confirmRemoveInventory"
      @confirmed="deleteInventory"
      @canceled="confirmRemoveInventory = !confirmRemoveInventory"
    />

    <RemoveDialog
      v-model="confirmRemoveHistory"
      @confirmed="deleteHistory"
      @canceled="confirmRemoveHistory = !confirmRemoveHistory"
    />
  </q-card>
</template>

<script>
import { ref, reactive, computed, nextTick, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'
import { abbreviateNumber } from 'js-abbreviation-number'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'
import { useAuthStore } from 'stores/auth'

import DateView from 'components/ui/DateView'
import FilteredMultiSelect from 'components/ui/FilteredMultiSelect'
import MigasLink from 'components/MigasLink'
import RemoveDialog from 'components/ui/RemoveDialog'

import { appIcon, modelIcon, useElement } from 'composables/element'
import useDate from 'composables/date'
import useCopyPaste from 'composables/copyPaste'

export default {
  name: 'ComputerSoftware',
  components: { DateView, FilteredMultiSelect, MigasLink, RemoveDialog },
  props: {
    cid: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter()
    const uiStore = useUiStore()
    const authStore = useAuthStore()
    const { elementIcon } = useElement()
    const { showDate } = useDate()
    const { contentToClipboard } = useCopyPaste()

    const loading = reactive({
      inventory: false,
      history: false,
    })
    const softwareInventory = ref([])
    const softwareHistory = reactive({})
    const showingCompare = ref(false)
    const target = ref(null)

    const searchInventory = ref('')
    const showSearchInventory = ref(false)
    const searchInputInventory = useTemplateRef('searchInputInventory')

    const searchHistory = ref('')
    const showSearchHistory = ref(false)
    const searchInputHistory = useTemplateRef('searchInputHistory')

    const confirmRemoveInventory = ref(false)
    const confirmRemoveHistory = ref(false)

    const inventoryLoaded = computed(() => softwareInventory.value.length > 0)
    const historyLoaded = computed(
      () => Object.keys(softwareHistory).length > 0,
    )

    const filteredSoftwareInventory = computed(() => {
      if (!searchInventory.value) {
        return softwareInventory.value
      } else {
        return softwareInventory.value.filter((item) => {
          return item.name
            .toLowerCase()
            .includes(searchInventory.value.toLowerCase())
        })
      }
    })

    const filteredSoftwareHistory = computed(() => {
      if (!searchHistory.value) {
        return softwareHistory
      } else {
        const result = Object.keys(softwareHistory).reduce((acc, key) => {
          const filter = softwareHistory[key].filter((item) =>
            item.name.toLowerCase().includes(searchHistory.value.toLowerCase()),
          )
          if (
            filter.length > 0 ||
            key.toLowerCase().includes(searchHistory.value.toLowerCase())
          ) {
            acc[key] = filter.length > 0 ? filter : softwareHistory[key]
          }
          return acc
        }, {})
        return result
      }
    })

    const filteredSoftwareHistoryDates = computed(() => {
      return Object.keys(filteredSoftwareHistory.value)
    })

    const isCompareEnabled = computed(() => {
      return target.value !== null
    })

    const softwareHistoryLength = computed(() => {
      return Object.keys(softwareHistory).length
    })

    const toggleSearchInventory = async () => {
      showSearchInventory.value = !showSearchInventory.value
      if (showSearchInventory.value) {
        await nextTick()
        if (searchInputInventory.value) {
          searchInputInventory.value.focus()
        }
      }
    }

    const toggleSearchHistory = async () => {
      showSearchHistory.value = !showSearchHistory.value
      if (showSearchHistory.value) {
        await nextTick()
        if (searchInputHistory.value) {
          searchInputHistory.value.focus()
        }
      }
    }

    const sortArray = (array) => {
      const originalCopy = array.slice()
      return originalCopy.sort()
    }

    const loadSoftwareInventory = async () => {
      if (softwareInventory.value.length === 0) {
        loading.inventory = true
        try {
          const { data } = await api.get(
            `/api/v1/token/computers/${props.cid}/software/inventory/`,
          )
          softwareInventory.value = data
        } catch (error) {
          uiStore.notifyError(error)
        } finally {
          loading.inventory = false
        }
      }
    }

    const loadSoftwareHistory = async () => {
      if (Object.keys(softwareHistory).length === 0) {
        loading.history = true
        try {
          const { data } = await api.get(
            `/api/v1/token/computers/${props.cid}/software/history/`,
          )
          Object.assign(softwareHistory, data)
        } catch (error) {
          uiStore.notifyError(error)
        } finally {
          loading.history = false
        }
      }
    }

    const copyInventory = async () => {
      if (softwareInventory.value.length === 0) {
        await loadSoftwareInventory()
      }

      const inventory = filteredSoftwareInventory.value.map((item) => item.name)

      contentToClipboard(sortArray(inventory).join('\n'))
    }

    const copyHistory = async () => {
      if (Object.keys(softwareHistory).length === 0) {
        await loadSoftwareHistory()
      }

      let history = []
      Object.entries(filteredSoftwareHistory.value).map(([key, val]) => {
        history.push(showDate(key))
        sortArray(val).forEach((item) => {
          history.push(`${item.mode}${item.name}`)
        })
        history.push('')
      })

      contentToClipboard(history.join('\n'))
    }

    const compare = () => {
      router.push({
        name: 'computers-software-compare',
        query: { source: props.cid, target: target.value.id },
      })
    }

    const filterComputers = async (val) => {
      const { data } = await api.get('/api/v1/token/computers/', {
        params: { search: val.toLowerCase() },
      })
      return data.results
    }

    const deleteInventory = async () => {
      loading.inventory = true
      try {
        const { data } = await api.delete(
          `/api/v1/token/computers/${props.cid}/software/inventory/`,
        )
        softwareInventory.value = data
      } catch (error) {
        uiStore.notifyError(error)
      } finally {
        loading.inventory = false
      }
    }

    const deleteHistory = async (key = null) => {
      loading.history = true

      try {
        const url =
          `/api/v1/token/computers/${props.cid}/software/history/` +
          (key ? `?key=${key}` : '')
        const { data } = await api.delete(url)
        Object.keys(softwareHistory).forEach((k) => delete softwareHistory[k])
        Object.assign(softwareHistory, data)
      } catch (error) {
        uiStore.notifyError(error)
      } finally {
        loading.history = false
      }
    }

    const getAddCount = (c) => c.filter((x) => x.mode === '+').length
    const getRemoveCount = (c) => c.filter((x) => x.mode === '-').length

    return {
      loading,
      isSuperUser: authStore.user.is_superuser,
      softwareInventory,
      softwareHistory,
      searchInventory,
      searchInputInventory,
      showSearchInventory,
      searchHistory,
      searchInputHistory,
      showSearchHistory,
      showingCompare,
      filteredSoftwareInventory,
      filteredSoftwareHistory,
      filteredSoftwareHistoryDates,
      inventoryLoaded,
      historyLoaded,
      target,
      isCompareEnabled,
      softwareHistoryLength,
      toggleSearchInventory,
      toggleSearchHistory,
      sortArray,
      loadSoftwareInventory,
      loadSoftwareHistory,
      copyInventory,
      copyHistory,
      compare,
      filterComputers,
      appIcon,
      modelIcon,
      elementIcon,
      abbreviateNumber,
      confirmRemoveInventory,
      confirmRemoveHistory,
      deleteInventory,
      deleteHistory,
      getAddCount,
      getRemoveCount,
    }
  },
}
</script>

<style scoped>
.software-card {
  max-width: 1000px;
  margin: auto;
}

.software-column {
  width: 100%;
}

.content-panel {
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden;
  min-width: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.02) !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
}

.panel-fixed-height {
  max-height: 500px;
  height: fit-content;
}

[data-theme='dark'] .content-panel {
  background: rgba(0, 0, 0, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.05) !important;
}

.scroll-area {
  flex: 1;
  min-height: 0;
  overflow-y: auto !important;
}

.pkg-wrapper {
  padding: 4px 16px;
  width: 100%;
  display: flex;
  min-width: 0;
}

.pkg-card {
  align-self: flex-start;
  border: 1px solid rgba(var(--brand-primary-rgb), 0.2) !important;
  background: rgba(var(--brand-primary-rgb), 0.05) !important;
  border-radius: 10px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  min-width: 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02) !important;
  overflow: hidden;
}

[data-theme='dark'] .pkg-card {
  background: rgba(255, 255, 255, 0.03) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.pkg-card:hover {
  border-color: var(--brand-primary) !important;
  background: rgba(var(--brand-primary-rgb), 0.1) !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1) !important;
}

[data-theme='dark'] .pkg-card:hover {
  background: rgba(255, 255, 255, 0.08) !important;
  border-color: var(--brand-primary) !important;
}

.border-add.pkg-card {
  border-left: 3px solid var(--q-positive) !important;
}
.border-remove.pkg-card {
  border-left: 3px solid var(--q-negative) !important;
}

.history-card {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
}

[data-theme='dark'] .history-card {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.05);
}

.history-virtual-scroll {
  max-height: 400px;
  padding: 16px;
}
</style>
