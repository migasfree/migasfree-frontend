<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :icon="titleIcon" :has-export-button="false" />

    <p>
      {{
        $gettext(
          'This procedure changes status, tags and devices between two computers.',
        )
      }}
    </p>

    <div class="row q-py-md justify-around items-center">
      <div class="col-4 col-md-4">
        <q-card flat>
          <q-card-section>
            <div class="text-h5 q-mt-sm q-mb-xs">{{ $gettext('Source') }}</div>

            <FilteredMultiSelect
              v-model="source"
              autofocus
              :multiple="false"
              :label="$gettext('Computer')"
              :fetch-options="filterComputers"
              @update:model-value="loadComputer(source)"
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

            <FilteredMultiSelect
              v-model="target"
              :multiple="false"
              :label="$gettext('Computer')"
              :fetch-options="filterComputers"
              @update:model-value="loadComputer(target)"
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

import Breadcrumbs from 'components/ui/Breadcrumbs'
import FilteredMultiSelect from 'components/ui/FilteredMultiSelect'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'
import ReplacementInfo from 'components/computer/ReplacementInfo'

import { appIcon, useElement } from 'composables/element'

export default {
  components: {
    Breadcrumbs,
    FilteredMultiSelect,
    Header,
    MigasLink,
    ReplacementInfo,
  },
  setup() {
    const { $gettext } = useGettext()
    const { elementIcon } = useElement()
    const uiStore = useUiStore()

    const titleIcon = appIcon('replacement')
    const title = $gettext('Computers Replacement')
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
    const loading = ref(false)

    const isEnabled = computed(() => {
      return source.value !== null && target.value !== null
    })

    const loadComputer = async (obj) => {
      if (!obj) return

      try {
        const { data } = await api.get(`/api/v1/token/computers/${obj.id}/`)
        Object.assign(obj, data)
        await loadDevices(obj)
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    const loadDevices = async (obj) => {
      if (!obj) return

      try {
        const { data } = await api.get(
          `/api/v1/token/computers/${obj.id}/devices/`,
        )
        obj.devices = data
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    const replace = async () => {
      if (source.value && target.value) {
        loading.value = true
        try {
          await api.post(
            `/api/v1/token/computers/${source.value.id}/replacement/`,
            {
              target: target.value.id,
            },
          )

          const src = source.value
          const tgt = target.value
          const { status: sStatus, tags: sTags, devices: sDevices } = src

          src.status = tgt.status
          src.tags = tgt.tags
          src.devices = tgt.devices

          tgt.status = sStatus
          tgt.tags = sTags
          tgt.devices = sDevices

          uiStore.notifySuccess($gettext('Replacement done!'))
        } catch (error) {
          uiStore.notifyError(error)
        } finally {
          loading.value = false
        }
      }
    }

    const filterComputers = async (val) => {
      const { data } = await api.get('/api/v1/token/computers/', {
        params: { search: val.toLowerCase() },
      })

      return data.results
    }

    return {
      title,
      titleIcon,
      breadcrumbs,
      source,
      target,
      loading,
      isEnabled,
      loadComputer,
      replace,
      filterComputers,
      elementIcon,
    }
  },
}
</script>
