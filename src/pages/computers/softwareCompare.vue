<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :has-export-button="false" />

    <div class="row q-pa-md q-gutter-sm justify-around">
      <div class="col-6 col-md col-sm col-xs">
        <q-card>
          <q-card-section>
            <div v-translate class="text-h5 q-mt-sm q-mb-xs">Source</div>

            <q-select
              v-model="source"
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
              @update:model-value="loadSoftware(source)"
            >
              <template #no-option>
                <q-item>
                  <q-item-section v-translate class="text-grey">
                    No results
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
        </q-card>
      </div>

      <div class="col-6 col-md col-sm col-xs">
        <q-card>
          <q-card-section>
            <div v-translate class="text-h5 q-mt-sm q-mb-xs">Target</div>

            <q-select
              v-model="target"
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
              @update:model-value="loadSoftware(target)"
            >
              <template #no-option>
                <q-item>
                  <q-item-section v-translate class="text-grey">
                    No results
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
        </q-card>
      </div>
    </div>

    <div v-if="isLoading && !isEnabled" class="row q-pa-md">
      <div class="col-12 text-center">
        <q-spinner-dots color="primary" size="3em" />
      </div>
    </div>

    <div v-if="isEnabled">
      <div class="row q-pa-md">
        <div class="col-6">
          <q-tooltip self="bottom middle"
            ><translate>sync end date</translate> ({{
              diffForHumans(source.sync_end_date)
            }})</q-tooltip
          >
          <q-icon name="mdi-calendar-sync" size="sm" class="vertical-middle" />
          <span class="vertical-middle">{{
            showDate(source.sync_end_date)
          }}</span>
        </div>

        <div class="col-6">
          <q-tooltip self="bottom middle"
            ><translate>sync end date</translate> ({{
              diffForHumans(target.sync_end_date)
            }})</q-tooltip
          >
          <q-icon name="mdi-calendar-sync" size="sm" class="vertical-middle" />
          <span class="vertical-middle">{{
            showDate(target.sync_end_date)
          }}</span>
        </div>
      </div>

      <div class="row q-pa-md">
        <div class="col-12">
          <code-diff
            :old-string="source.inventory"
            :new-string="target.inventory"
            :context="10"
            output-format="side-by-side"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'
import { MIN_CHARS_SEARCH } from 'config/app.conf'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'
import { CodeDiff } from 'v-code-diff'

import { useElement } from 'composables/element'
import useDate from 'composables/date'

export default {
  components: {
    Breadcrumbs,
    Header,
    MigasLink,
    CodeDiff,
  },
  setup() {
    const { $gettext } = useGettext()
    const route = useRoute()
    const { elementIcon } = useElement()
    const { showDate, diffForHumans } = useDate()
    const uiStore = useUiStore()

    const title = ref($gettext('Software Compare'))
    useMeta({ title: title.value })

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        to: 'home',
        icon: 'mdi-home',
      },
      {
        text: $gettext('Data'),
        icon: 'mdi-database-search',
      },
      {
        text: title.value,
        icon: 'mdi-file-compare',
      },
    ])

    const computers = ref([])
    const source = ref(null)
    const target = ref(null)

    const url = '/api/v1/token/computers/'

    const isEnabled = computed(() => {
      return (
        source.value !== null &&
        target.value !== null &&
        'inventory' in source.value &&
        'inventory' in target.value
      )
    })

    const isLoading = computed(() => {
      return source.value !== null && target.value !== null
    })

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

    const sortArray = (array) => {
      const originalCopy = array.slice()
      return originalCopy.sort()
    }

    const loadSoftware = async (obj) => {
      if (obj !== null) {
        await api
          .get(`/api/v1/token/computers/${obj.id}/software/inventory/`)
          .then((response) => {
            const inventory = response.data.map((item) => item.name)

            obj.inventory = sortArray(inventory).join('\n')
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
      }
    }

    // created
    if (route.params.source) {
      api.get(`${url}${route.params.source}/`).then((response) => {
        source.value = response.data
        loadSoftware(source.value)
      })
    }

    if (route.params.target) {
      api.get(`${url}${route.params.target}/`).then((response) => {
        target.value = response.data
        loadSoftware(target.value)
      })
    }
    // end created

    return {
      title,
      breadcrumbs,
      computers,
      source,
      target,
      isEnabled,
      isLoading,
      loadSoftware,
      filterComputers,
      abortFilterComputers,
      elementIcon,
      showDate,
      diffForHumans,
      MIN_CHARS_SEARCH,
    }
  },
}
</script>
