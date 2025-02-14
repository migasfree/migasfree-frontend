<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h5 q-pb-md">{{ $gettext('Software') }}</div>

      <q-list bordered>
        <q-expansion-item
          :content-inset-level="0.5"
          @show="loadSoftwareInventory"
        >
          <template #header>
            <q-item-section avatar>
              <q-icon name="mdi-package-variant" size="md" />
            </q-item-section>

            <q-item-section>
              {{ $gettext('Inventory') }}
            </q-item-section>

            <q-item-section v-if="softwareInventory.length > 0">
              <q-chip>
                <q-avatar color="info" text-color="black"
                  ><strong>{{
                    abbreviateNumber(softwareInventory.length, 0)
                  }}</strong>
                  <q-tooltip>{{
                    softwareInventory.length
                  }}</q-tooltip></q-avatar
                >
                {{ $gettext('packages') }}
              </q-chip>
            </q-item-section>

            <q-item-section side>
              <div class="row items-center">
                <q-btn
                  v-if="softwareInventory.length > 0 && !showSearchInventory"
                  flat
                  icon="mdi-magnify"
                  color="primary"
                  @click.stop="toggleSearchInventory"
                  ><q-tooltip>{{ $gettext('Search') }}</q-tooltip></q-btn
                >

                <q-input
                  v-if="showSearchInventory"
                  ref="searchInputInventory"
                  v-model="searchInventory"
                  :label="$gettext('Search')"
                  clearable
                  dense
                  @clear="showSearchInventory = false"
                  @click.stop
                  ><template #prepend><q-icon name="mdi-magnify" /></template
                ></q-input>

                <q-btn
                  flat
                  icon="mdi-content-copy"
                  color="primary"
                  @click.stop="copyInventory"
                  ><q-tooltip>{{ $gettext('Copy') }}</q-tooltip></q-btn
                >

                <q-btn
                  v-if="isSuperUser"
                  flat
                  icon="mdi-delete"
                  :color="$q.dark.isActive ? 'white' : 'negative'"
                  :class="{ 'reversed-delete': $q.dark.isActive }"
                  @click.stop="confirmRemoveInventory = true"
                  ><q-tooltip>{{ $gettext('Delete') }}</q-tooltip></q-btn
                >
              </div>
            </q-item-section>
          </template>

          <q-list>
            <q-item v-if="loading.inventory" class="justify-center">
              <q-spinner-dots color="primary" size="3em" />
            </q-item>

            <q-virtual-scroll
              class="overflow"
              :items-size="filteredSoftwareInventory.length"
              :items="filteredSoftwareInventory"
            >
              <template #default="{ item }">
                <q-item>
                  <MigasLink
                    model="packages"
                    :pk="item.id"
                    :value="item.name"
                  />
                </q-item>
              </template>
            </q-virtual-scroll>
          </q-list>
        </q-expansion-item>

        <q-separator />

        <q-expansion-item
          :content-inset-level="0.5"
          @show="loadSoftwareHistory"
        >
          <template #header>
            <q-item-section avatar>
              <q-icon name="mdi-history" size="md" />
            </q-item-section>

            <q-item-section>
              {{ $gettext('History') }}
            </q-item-section>

            <q-item-section v-if="softwareHistoryLength > 0">
              <q-chip>
                <q-avatar color="info" text-color="black"
                  ><strong>{{
                    abbreviateNumber(softwareHistoryLength, 0)
                  }}</strong
                  ><q-tooltip>{{ softwareHistoryLength }}</q-tooltip></q-avatar
                >
                {{ $ngettext('date', 'dates', softwareHistoryLength) }}
              </q-chip>
            </q-item-section>

            <q-item-section side>
              <div class="row items-center">
                <q-btn
                  v-if="
                    Object.keys(softwareHistory).length > 0 &&
                    !showSearchHistory
                  "
                  flat
                  icon="mdi-magnify"
                  color="primary"
                  @click.stop="toggleSearchHistory"
                  ><q-tooltip>{{ $gettext('Search') }}</q-tooltip></q-btn
                >

                <q-input
                  v-if="showSearchHistory"
                  ref="searchInputHistory"
                  v-model="searchHistory"
                  :label="$gettext('Search')"
                  clearable
                  dense
                  @clear="showSearchHistory = false"
                  @click.stop
                  ><template #prepend><q-icon name="mdi-magnify" /></template
                ></q-input>

                <q-btn
                  flat
                  icon="mdi-content-copy"
                  color="primary"
                  @click.stop="copyHistory"
                  ><q-tooltip>{{ $gettext('Copy') }}</q-tooltip></q-btn
                >

                <q-btn
                  v-if="isSuperUser"
                  flat
                  icon="mdi-delete"
                  :color="$q.dark.isActive ? 'white' : 'negative'"
                  :class="{ 'reversed-delete': $q.dark.isActive }"
                  @click.stop="confirmRemoveHistory = true"
                  ><q-tooltip>{{ $gettext('Delete') }}</q-tooltip></q-btn
                >
              </div>
            </q-item-section>
          </template>

          <q-list class="overflow">
            <q-item v-if="loading.history" class="justify-center">
              <q-spinner-dots color="primary" size="3em" />
            </q-item>
            <q-expansion-item
              v-for="(value, key) in filteredSoftwareHistory"
              :key="key"
              expand-separator
            >
              <template #header>
                <q-item-section avatar>
                  <q-avatar icon="mdi-calendar-range" />
                </q-item-section>

                <q-item-section>
                  <DateView :value="key" />
                </q-item-section>

                <q-item-section side>
                  <div class="row items-center">
                    <q-chip
                      v-if="value.filter((item) => item.mode === '+').length"
                      color="positive"
                      text-color="white"
                      ><strong>{{
                        value.filter((item) => item.mode === '+').length
                      }}</strong
                      ><q-tooltip>{{
                        $gettext('Installed Packages')
                      }}</q-tooltip></q-chip
                    >

                    <q-chip
                      v-if="value.filter((item) => item.mode === '-').length"
                      color="negative"
                      text-color="white"
                      ><strong>{{
                        value.filter((item) => item.mode === '-').length
                      }}</strong
                      ><q-tooltip>{{
                        $gettext('Uninstalled Packages')
                      }}</q-tooltip></q-chip
                    >

                    <q-btn
                      v-if="isSuperUser && !showSearchHistory"
                      flat
                      icon="mdi-delete"
                      :color="$q.dark.isActive ? 'white' : 'negative'"
                      :class="{ 'reversed-delete': $q.dark.isActive }"
                      @click.stop="deleteHistory(key)"
                      ><q-tooltip>{{ $gettext('Delete') }}</q-tooltip></q-btn
                    >
                  </div>
                </q-item-section>
              </template>
              <q-card>
                <q-card-section>
                  <q-list>
                    <q-virtual-scroll
                      class="overflow"
                      :items-size="value.length"
                      :items="value"
                    >
                      <template #default="{ item }">
                        <q-item>
                          <q-item-section avatar>
                            <q-avatar
                              size="md"
                              outline
                              :color="
                                item.mode === '+' ? 'positive' : 'negative'
                              "
                              text-color="white"
                              :icon="
                                item.mode === '+'
                                  ? 'mdi-plus-thick'
                                  : 'mdi-minus-thick'
                              "
                            />
                          </q-item-section>

                          <q-item-section side>
                            <MigasLink
                              model="packages"
                              :pk="item.id"
                              :value="item.name"
                            />
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-virtual-scroll>
                  </q-list>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
        </q-expansion-item>
      </q-list>
    </q-card-section>

    <q-card-actions class="justify-around">
      <q-btn
        :icon="appIcon('compare')"
        color="info"
        text-color="black"
        no-caps
        :label="`${$gettext('Compare')}...`"
        @click="showingCompare = true"
      />
    </q-card-actions>
  </q-card>

  <q-dialog v-model="showingCompare" persistent>
    <q-card>
      <q-card-section class="row">
        <div class="text-h5 q-mt-sm q-mb-xs">
          {{ $gettext('Software Compare') }}
        </div>
      </q-card-section>

      <q-card-section class="row items-center">
        <q-select
          v-model="target"
          autofocus
          outlined
          use-input
          map-options
          input-debounce="0"
          :label="$gettext('Computer')"
          :hint="
            $gettext('Type to search (minimum %{num} characters)', {
              num: MIN_CHARS_SEARCH,
            })
          "
          :options="computers"
          @filter="filterComputers"
          @filter-abort="abortFilterComputers"
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                {{ $gettext('No results') }}
              </q-item-section>
            </q-item>
          </template>

          <template #option="scope">
            <q-item v-bind="scope.itemProps">
              {{ scope.opt.__str__ }}
            </q-item>
          </template>

          <template #selected-item="scope">
            <q-chip
              removable
              dense
              :tabindex="scope.tabindex"
              class="q-ma-md"
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
        </q-select>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          v-close-popup
          flat
          color="primary"
          :label="$gettext('Cancel')"
          @click="showingCompare = !showingCompare"
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
</template>

<script>
import { ref, reactive, computed, nextTick, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'
import { abbreviateNumber } from 'js-abbreviation-number'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'
import { useAuthStore } from 'stores/auth'
import { MIN_CHARS_SEARCH } from 'config/app.conf'

import DateView from 'components/ui/DateView'
import MigasLink from 'components/MigasLink'
import RemoveDialog from 'components/ui/RemoveDialog'

import { appIcon, useElement } from 'composables/element'
import useDate from 'composables/date'
import useCopyPaste from 'composables/copyPaste'

export default {
  name: 'ComputerSoftware',
  components: { DateView, MigasLink, RemoveDialog },
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
    const computers = ref([])
    const target = ref(null)

    const searchInventory = ref('')
    const showSearchInventory = ref(false)
    const searchInputInventory = useTemplateRef('searchInputInventory')

    const searchHistory = ref('')
    const showSearchHistory = ref(false)
    const searchInputHistory = useTemplateRef('searchInputHistory')

    const confirmRemoveInventory = ref(false)
    const confirmRemoveHistory = ref(false)

    const filteredSoftwareInventory = computed(() => {
      if (searchInventory.value === '' || searchInventory.value === null) {
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
      if (searchHistory.value === '' || searchHistory.value === null) {
        return softwareHistory.value
      } else {
        const result = Object.keys(softwareHistory.value).reduce((acc, key) => {
          const filter = softwareHistory.value[key].filter((item) =>
            item.name.toLowerCase().includes(searchHistory.value.toLowerCase()),
          )
          if (filter.length > 0) {
            acc[key] = filter
          }
          return acc
        }, {})

        return result
      }
    })

    const isCompareEnabled = computed(() => {
      return target.value !== null
    })

    const softwareHistoryLength = computed(() => {
      return softwareHistory.value
        ? Object.keys(softwareHistory.value).length
        : 0
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
        await api
          .get(`/api/v1/token/computers/${props.cid}/software/inventory/`)
          .then((response) => {
            softwareInventory.value = response.data
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
          .finally(() => (loading.inventory = false))
      }
    }

    const loadSoftwareHistory = async () => {
      if (Object.keys(softwareHistory).length === 0) {
        loading.history = true
        await api
          .get(`/api/v1/token/computers/${props.cid}/software/history/`)
          .then((response) => {
            softwareHistory.value = response.data
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
          .finally(() => (loading.history = false))
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

    const filterComputers = async (val, update, abort) => {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < MIN_CHARS_SEARCH) {
        abort()
        return
      }

      await api
        .get('/api/v1/token/computers/', {
          params: { search: val.toLowerCase() },
        })
        .then((response) => {
          computers.value = response.data.results
        })

      update(() => {})
    }

    const abortFilterComputers = () => {
      // console.log('delayed filter aborted')
    }

    const deleteInventory = async () => {
      loading.inventory = true
      await api
        .delete(`/api/v1/token/computers/${props.cid}/software/inventory/`)
        .then((response) => {
          softwareInventory.value = response.data
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
        .finally(() => (loading.inventory = false))
    }

    const deleteHistory = async (key = null) => {
      loading.history = true
      await api
        .delete(
          `/api/v1/token/computers/${props.cid}/software/history/?key=${key}`,
        )
        .then((response) => {
          for (var key in softwareHistory) {
            delete softwareHistory[key]
          }
          Object.assign(softwareHistory, response.data)
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
        .finally(() => (loading.history = false))
    }

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
      computers,
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
      abortFilterComputers,
      appIcon,
      elementIcon,
      MIN_CHARS_SEARCH,
      abbreviateNumber,
      confirmRemoveInventory,
      confirmRemoveHistory,
      deleteInventory,
      deleteHistory,
    }
  },
}
</script>
