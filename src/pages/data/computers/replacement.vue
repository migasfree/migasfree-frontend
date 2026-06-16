<template>
  <q-page padding class="replacement-page">
    <Breadcrumbs :items="breadcrumbs" />

    <div class="row items-center q-mb-lg">
      <div class="col">
        <Header
          :title="title"
          :icon="titleIcon"
          :has-export-button="false"
          class="no-margin"
        />
        <p class="text-subtitle2 text-muted q-mt-sm">
          {{
            $gettext(
              'This procedure changes status, tags and devices between two computers.',
            )
          }}
        </p>
      </div>
    </div>

    <div
      class="replacement-grid row justify-center items-stretch q-col-gutter-xl"
    >
      <!-- Source Panel -->
      <div class="col-12 col-md-5">
        <q-card class="panel full-height replacement-card source-card">
          <q-card-section class="card-header flex items-center">
            <q-icon
              name="mdi-source-repository"
              size="sm"
              color="primary"
              class="q-mr-sm"
            />
            <div class="text-h6">{{ $gettext('Source') }}</div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-lg">
            <FilteredMultiSelect
              v-model="source"
              focus
              :multiple="false"
              :label="$gettext('Computer')"
              :fetch-options="filterComputers"
              class="q-mb-md"
              @update:model-value="loadComputer(source)"
            >
              <template #option="{ scope }">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon :name="elementIcon(scope.opt.status)" size="xs" />
                  </q-item-section>
                  <q-item-section>
                    {{ scope.opt.__str__ }}
                  </q-item-section>
                </q-item>
              </template>

              <template #selected-item="{ scope }">
                <q-chip
                  removable
                  dense
                  color="transparent"
                  :tabindex="scope.tabindex"
                  class="q-pa-none selected-chip"
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

            <div class="replacement-info-wrapper q-mt-md">
              <ReplacementInfo :element="source" :is-loading="loadingSource" />
              <div v-if="!source" class="empty-state text-center q-pa-xl">
                <q-icon
                  :name="modelIcon('computers')"
                  size="xl"
                  color="grey-4"
                />
                <div class="text-muted q-mt-md">
                  {{ $gettext('No computer selected') }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Action Column -->
      <div class="col-12 col-md-2 flex flex-center">
        <div class="action-column flex flex-center column">
          <div class="arrow-container q-mb-md">
            <q-icon
              name="mdi-swap-horizontal"
              size="3rem"
              class="swap-icon"
              :class="{ 'is-loading': loading }"
            />
          </div>
          <q-btn
            round
            unelevated
            size="22px"
            color="primary"
            class="replace-btn shadow-8"
            :disabled="!isEnabled || loading"
            @click="replace"
          >
            <q-icon name="mdi-sync" :class="{ 'rotate-right': loading }" />
          </q-btn>
          <div
            class="text-caption text-bold text-primary q-mt-sm text-uppercase letter-spacing-1"
          >
            {{ loading ? $gettext('Working...') : $gettext('Replace') }}
          </div>
        </div>
      </div>

      <!-- Target Panel -->
      <div class="col-12 col-md-5">
        <q-card class="panel full-height replacement-card target-card">
          <q-card-section class="card-header flex items-center">
            <q-icon
              name="mdi-target"
              size="sm"
              color="primary"
              class="q-mr-sm"
            />
            <div class="text-h6">{{ $gettext('Target') }}</div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-lg">
            <FilteredMultiSelect
              v-model="target"
              :multiple="false"
              :label="$gettext('Computer')"
              :fetch-options="filterComputers"
              class="q-mb-md"
              @update:model-value="loadComputer(target)"
            >
              <template #option="{ scope }">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon :name="elementIcon(scope.opt.status)" size="xs" />
                  </q-item-section>
                  <q-item-section>
                    {{ scope.opt.__str__ }}
                  </q-item-section>
                </q-item>
              </template>

              <template #selected-item="{ scope }">
                <q-chip
                  removable
                  dense
                  color="transparent"
                  :tabindex="scope.tabindex"
                  class="q-pa-none selected-chip"
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

            <div class="replacement-info-wrapper q-mt-md">
              <ReplacementInfo :element="target" :is-loading="loadingTarget" />
              <div v-if="!target" class="empty-state text-center q-pa-xl">
                <q-icon
                  :name="modelIcon('computers')"
                  size="xl"
                  color="grey-4"
                />
                <div class="text-muted q-mt-md">
                  {{ $gettext('No computer selected') }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
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

import { appIcon, modelIcon, useElement } from 'composables/element'

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
const loadingSource = ref(false)
const loadingTarget = ref(false)

const isEnabled = computed(() => {
  return source.value !== null && target.value !== null
})

const loadComputer = async (obj) => {
  if (!obj) return

  const isLoading = obj === source.value ? loadingSource : loadingTarget
  isLoading.value = true

  try {
    const { data } = await api.get(`/api/v1/token/computers/${obj.id}/`)
    Object.assign(obj, data)
    await loadDevices(obj)
  } catch (error) {
    uiStore.notifyError(error)
  } finally {
    isLoading.value = false
  }
}

const loadDevices = async (obj) => {
  if (!obj) return

  try {
    const { data } = await api.get(`/api/v1/token/computers/${obj.id}/devices/`)
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
</script>

<style scoped>
.replacement-page {
  max-width: 1400px;
  margin: 0 auto;
}

.text-muted {
  color: var(--text-muted);
}

.replacement-card {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  overflow: hidden;
}

.card-header {
  background: rgba(var(--brand-primary-rgb), 0.03);
  padding: 12px 20px;
}

.replacement-info-wrapper {
  min-height: 200px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);
  padding: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
}

.action-column {
  height: 100%;
  min-height: 200px;
}

.swap-icon {
  color: var(--brand-primary);
  opacity: 0.2;
  transition: opacity 0.3s ease;
}

.swap-icon.is-loading {
  opacity: 0.8;
  animation: pulse 1.5s infinite ease-in-out;
}

.replace-btn {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.replace-btn:hover:not(:disabled) {
  transform: scale(1.1);
}

.rotate-right {
  animation: rotate 1.5s linear infinite;
}

.selected-chip {
  background: rgba(var(--brand-primary-rgb), 0.1);
}

.letter-spacing-1 {
  letter-spacing: 1px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.2;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 0.2;
  }
}

/* Dark mode adjustments */
[data-theme='dark'] .replacement-info-wrapper {
  background: rgba(255, 255, 255, 0.03);
}

[data-theme='dark'] .card-header {
  background: rgba(255, 255, 255, 0.05);
}
</style>
