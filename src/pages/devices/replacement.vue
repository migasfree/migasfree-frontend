<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :icon="titleIcon" :has-export-button="false" />

    <p>
      {{
        $gettext(
          'This procedure switches assigned computers between two devices.',
        )
      }}
    </p>

    <div class="row q-pb-md justify-around items-center">
      <div class="col-4 col-md-4">
        <q-card flat>
          <q-card-section>
            <div class="text-h5 q-mt-sm q-mb-xs">{{ $gettext('Source') }}</div>

            <q-select
              v-model="source"
              outlined
              autofocus
              use-input
              map-options
              :label="$gettext('Device')"
              :hint="
                $gettext('Type to search (minimum %{num} characters)', {
                  num: MIN_CHARS_SEARCH,
                })
              "
              :options="devices"
              @filter="filterDevices"
              @filter-abort="abortFilterDevices"
              @update:model-value="loadInfo(source)"
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
        <q-card flat>
          <q-card-section>
            <div class="text-h5 q-mt-sm q-mb-xs">{{ $gettext('Target') }}</div>

            <q-select
              v-model="target"
              outlined
              use-input
              map-options
              :label="$gettext('Device')"
              :hint="
                $gettext('Type to search (minimum %{num} characters)', {
                  num: MIN_CHARS_SEARCH,
                })
              "
              :options="devices"
              @filter="filterDevices"
              @filter-abort="abortFilterDevices"
              @update:model-value="loadInfo(target)"
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
import { ref, computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'
import { MIN_CHARS_SEARCH } from 'config/app.conf'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'
import ReplacementInfo from 'components/device/ReplacementInfo'

import { appIcon } from 'composables/element'

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

    const titleIcon = appIcon('replacement')
    const title = $gettext('Devices Replacement')
    useMeta({ title })

    const breadcrumbs = ref([
      {
        text: $gettext('Dashboard'),
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Devices'),
        icon: appIcon('devices'),
      },
      {
        text: title,
        icon: titleIcon,
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
            },
          )
          .then(() => {
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
      if (val.length < MIN_CHARS_SEARCH) {
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
      titleIcon,
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
      MIN_CHARS_SEARCH,
    }
  },
}
</script>
