<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :has-export-button="false" />

    <p v-translate>
      This procedure changes status, tags and devices between two computers.
    </p>

    <div class="row q-py-md justify-around items-center">
      <div class="col-4 col-md-4">
        <q-card>
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
              @update:model-value="loadComputer(source)"
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

          <q-card-section v-if="source">
            <ReplacementInfo :element="source" :is-loading="loading" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-4 col-md-4">
        <q-btn
          class="q-mx-auto block"
          color="primary"
          icon="mdi-arrow-right"
          icon-right="mdi-arrow-left"
          :label="$gettext('Replace')"
          :disabled="!isEnabled || loading"
          @click="replace"
        />
      </div>

      <div class="col-4 col-md-4">
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
              @update:model-value="loadComputer(target)"
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

          <q-card-section v-if="target">
            <ReplacementInfo :element="target" :is-loading="loading" />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'
import { MIN_CHARS_SEARCH } from 'config/app.conf'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'
import ReplacementInfo from 'components/computer/ReplacementInfo'

import { appIcon, useElement } from 'composables/element'

export default {
  components: {
    Breadcrumbs,
    Header,
    MigasLink,
    ReplacementInfo,
  },
  setup() {
    const { $gettext } = useGettext()
    const { elementIcon } = useElement()
    const uiStore = useUiStore()

    const title = ref($gettext('Computers Replacement'))
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
        icon: appIcon('replacement'),
      },
    ])

    const computers = ref([])
    const source = ref(null)
    const target = ref(null)
    const loading = ref(false)

    const isEnabled = computed(() => {
      return source.value !== null && target.value !== null
    })

    const loadComputer = async (obj) => {
      if (obj !== null) {
        await api
          .get(`/api/v1/token/computers/${obj.id}/`)
          .then((response) => {
            obj = Object.assign(obj, response.data)
            loadDevices(obj)
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
      }
    }

    const loadDevices = async (obj) => {
      if (obj !== null) {
        await api
          .get(`/api/v1/token/computers/${obj.id}/devices/`)
          .then((response) => {
            obj.devices = response.data
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
      }
    }

    const replace = async () => {
      if (source.value !== null && target.value !== null) {
        loading.value = true
        await api
          .post(`/api/v1/token/computers/${source.value.id}/replacement/`, {
            target: target.value.id,
          })
          .then((response) => {
            let tmp = null

            tmp = source.value.status
            source.value.status = target.value.status
            target.value.status = tmp

            tmp = source.value.tags
            source.value.tags = target.value.tags
            target.value.tags = tmp

            tmp = source.value.devices
            source.value.devices = target.value.devices
            target.value.devices = tmp

            uiStore.notifySuccess($gettext('Replacement done!'))
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
          .finally(() => (loading.value = false))
      }
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

    return {
      title,
      breadcrumbs,
      computers,
      source,
      target,
      loading,
      isEnabled,
      loadComputer,
      replace,
      filterComputers,
      abortFilterComputers,
      elementIcon,
      MIN_CHARS_SEARCH,
    }
  },
}
</script>
