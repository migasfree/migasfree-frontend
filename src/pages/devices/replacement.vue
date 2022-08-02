<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :has-export-button="false" />

    <p v-translate>
      This procedure switches assigned computers between two devices.
    </p>

    <div class="row q-pa-md justify-around items-center">
      <div class="col-4 col-md-4">
        <q-card>
          <q-card-section>
            <div v-translate class="text-h5 q-mt-sm q-mb-xs">Source</div>

            <q-select
              v-model="source"
              outlined
              use-input
              map-options
              input-debounce="0"
              :label="$gettext('Device')"
              :options="devices"
              @filter="filterDevices"
              @filter-abort="abortFilterDevices"
              @update:model-value="loadInfo(source)"
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
                  {{ scope.opt.name }}
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
                    model="devices/devices"
                    :pk="scope.opt.id"
                    :value="scope.opt.name || ''"
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
              :label="$gettext('Device')"
              :options="devices"
              @filter="filterDevices"
              @filter-abort="abortFilterDevices"
              @update:model-value="loadInfo(target)"
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
                  {{ scope.opt.name }}
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
                    model="devices/devices"
                    :pk="scope.opt.id"
                    :value="scope.opt.name || ''"
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

import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'
import ReplacementInfo from 'components/device/ReplacementInfo'

export default {
  components: {
    Breadcrumbs,
    Header,
    MigasLink,
    ReplacementInfo,
  },
  setup() {
    const { $gettext } = useGettext()
    const uiStore = useUiStore()

    const title = ref($gettext('Devices Replacement'))
    useMeta({ title: title.value })

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        to: 'home',
        icon: 'mdi-home',
      },
      {
        text: $gettext('Devices'),
        icon: 'mdi-printer-eye',
      },
      {
        text: $gettext('Devices Replacement'),
        icon: 'mdi-compare-horizontal',
      },
    ])

    const devices = ref([])
    const source = ref(null)
    const target = ref(null)
    const loading = ref(false)

    const isEnabled = computed(() => {
      return source.value !== null && target.value !== null
    })

    const loadInfo = async (obj) => {
      if (obj !== null) {
        await api
          .get(`/api/v1/token/devices/logical/?device__id=${obj.id}`)
          .then((response) => {
            obj.logical_devices = response.data.results
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
      }
    }

    const replace = async () => {
      if (isEnabled.value) {
        loading.value = true
        await api
          .post(
            `/api/v1/token/devices/devices/${source.value.id}/replacement/`,
            {
              target: target.value.id,
            }
          )
          .then((response) => {
            let tmp = null

            tmp = source.value.logical_devices
            source.value.logical_devices = target.value.logical_devices
            target.value.logical_devices = tmp

            uiStore.notifySuccess($gettext('Replacement done!'))
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
          .finally(() => (loading.value = false))
      }
    }

    const filterDevices = async (val, update, abort) => {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3) {
        abort()
        return
      }

      await api
        .get('/api/v1/token/devices/devices/', {
          params: { search: val.toLowerCase() },
        })
        .then((response) => {
          devices.value = response.data.results
        })

      update(() => {})
    }

    const abortFilterDevices = () => {
      // console.log('delayed filter aborted')
    }

    return {
      title,
      breadcrumbs,
      devices,
      source,
      target,
      loading,
      isEnabled,
      loadInfo,
      replace,
      filterDevices,
      abortFilterDevices,
    }
  },
}
</script>
