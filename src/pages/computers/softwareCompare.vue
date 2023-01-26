<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :has-export-button="false" />

    <div class="row q-py-md q-gutter-sm justify-around">
      <div class="col-6 col-md col-sm col-xs">
        <q-card flat>
          <q-card-section>
            <div v-translate class="text-h5 q-mt-sm q-mb-xs">Source</div>

            <q-select
              v-model="source"
              outlined
              autofocus
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

            <div v-if="source" class="row q-pa-md q-gutter-md">
              <div class="col">
                <DateView
                  :value="source.sync_end_date"
                  icon="mdi-calendar-sync"
                  :tooltip-text="$gettext('sync end date')"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6 col-md col-sm col-xs">
        <q-card flat>
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

            <div v-if="target" class="row q-pa-md q-gutter-md">
              <div class="col">
                <DateView
                  :value="target.sync_end_date"
                  icon="mdi-calendar-sync"
                  :tooltip-text="$gettext('sync end date')"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div v-if="isLoading && !isEnabled" class="row q-py-md">
      <div class="col-12 text-center">
        <q-spinner-dots color="primary" size="3em" />
      </div>
    </div>

    <div v-if="isEnabled">
      <div class="row q-py-md">
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
import DateView from 'components/ui/DateView'
import MigasLink from 'components/MigasLink'
import { CodeDiff } from 'v-code-diff'

import { appIcon, useElement } from 'composables/element'

export default {
  components: {
    Breadcrumbs,
    Header,
    DateView,
    MigasLink,
    CodeDiff,
  },
  setup() {
    const { $gettext } = useGettext()
    const route = useRoute()
    const { elementIcon } = useElement()
    const uiStore = useUiStore()

    const title = ref($gettext('Software Compare'))
    useMeta({ title: title.value })

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Data'),
        icon: appIcon('data'),
      },
      {
        text: title.value,
        icon: appIcon('compare'),
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
    if (route.query.source) {
      api.get(`${url}${route.query.source}/`).then((response) => {
        source.value = response.data
        loadSoftware(source.value)
      })
    }

    if (route.query.target) {
      api.get(`${url}${route.query.target}/`).then((response) => {
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
      MIN_CHARS_SEARCH,
    }
  },
}
</script>
