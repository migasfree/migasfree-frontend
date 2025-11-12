<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :icon="titleIcon" :has-export-button="false" />

    <div class="row q-py-md q-gutter-sm justify-around">
      <div class="col-6 col-md col-sm col-xs">
        <q-card flat>
          <q-card-section>
            <div class="text-h5 q-mt-sm q-mb-xs">{{ $gettext('Source') }}</div>

            <FilteredMultiSelect
              v-model="source"
              :multiple="false"
              :label="$gettext('Computer')"
              :fetch-options="filterComputers"
              @update:model-value="loadSoftware(source)"
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
            </FilteredMultiSelect>

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
            <div class="text-h5 q-mt-sm q-mb-xs">{{ $gettext('Target') }}</div>

            <FilteredMultiSelect
              v-model="target"
              :multiple="false"
              :label="$gettext('Computer')"
              :fetch-options="filterComputers"
              @update:model-value="loadSoftware(target)"
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
            </FilteredMultiSelect>

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
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import FilteredMultiSelect from 'components/ui/FilteredMultiSelect'
import Header from 'components/ui/Header'
import DateView from 'components/ui/DateView'
import MigasLink from 'components/MigasLink'
import { CodeDiff } from 'v-code-diff'

import { appIcon, useElement } from 'composables/element'

export default {
  components: {
    Breadcrumbs,
    FilteredMultiSelect,
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

    const titleIcon = appIcon('compare')
    const title = $gettext('Software Compare')
    useMeta({ title })

    const breadcrumbs = ref([
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
        text: title,
        icon: titleIcon,
      },
    ])

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

    const filterComputers = async (val) => {
      const { data } = await api.get('/api/v1/token/computers/', {
        params: { search: val.toLowerCase() },
      })

      return data.results
    }

    const sortArray = (array) => {
      const originalCopy = array.slice()
      return originalCopy.sort()
    }

    const loadSoftware = async (obj) => {
      if (!obj) return

      try {
        const { data } = await api.get(
          `/api/v1/token/computers/${obj.id}/software/inventory/`,
        )
        obj.inventory = sortArray(data.map((item) => item.name)).join('\n')
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    const fetchAndLoad = async (key, setter) => {
      if (route.query[key]) {
        return await api.get(`${url}${route.query[key]}/`).then((response) => {
          setter.value = response.data
          loadSoftware(setter.value)
        })
      }
      return Promise.resolve()
    }

    // created
    Promise.all([
      fetchAndLoad('source', source),
      fetchAndLoad('target', target),
    ]).catch((error) => {
      uiStore.notifyError(error)
    })
    // end created

    return {
      title,
      titleIcon,
      breadcrumbs,
      source,
      target,
      isEnabled,
      isLoading,
      loadSoftware,
      filterComputers,
      elementIcon,
    }
  },
}
</script>
