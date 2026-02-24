<template>
  <q-card class="panel overflow-hidden shadow-2 rounded-borders">
    <q-card-section class="q-pa-lg">
      <!-- Header -->
      <div class="panel-header row items-center justify-between q-mb-xl">
        <div class="row items-center q-gutter-md">
          <div class="text-h6 text-weight-bold text-primary">
            {{ $gettext('Current Situation') }}
          </div>
        </div>
        <div class="flex items-center gap-md">
          <q-badge
            :color="currentStatusColor"
            class="status-badge-premium q-px-md q-py-xs"
          >
            <q-icon :name="currentStatusIcon" size="14px" class="q-mr-xs" />
            {{ currentStatusLabel }}
          </q-badge>
        </div>
      </div>

      <div class="row q-col-gutter-xl">
        <!-- Left Column: Readonly/Links -->
        <div class="col-12 col-xl-7">
          <div class="flex column gap-sm h-full">
            <div class="row q-col-gutter-lg q-mb-lg">
              <!-- Errors Diagnostic Card -->
              <div class="col-12 col-sm-6">
                <div class="diagnostic-card theme-critical">
                  <div class="card-content">
                    <div class="card-top row items-center q-mb-md">
                      <q-icon
                        :name="modelIcon('errors')"
                        size="24px"
                        class="text-critical q-mr-sm"
                      />
                      <span class="text-subtitle1 text-bold">{{
                        $gettext('Errors')
                      }}</span>
                    </div>

                    <div class="row q-col-gutter-sm items-center full-width">
                      <div v-if="errors.unchecked > 0" class="col-6">
                        <router-link
                          :to="{
                            name: 'errors-list',
                            query: { computer_id: cid, checked: false },
                          }"
                          class="action-stat-btn full-width column items-center text-center text-decoration-none"
                          :class="
                            $q.dark.isActive
                              ? 'bg-neutral-800 text-critical'
                              : 'bg-neutral-100 text-critical'
                          "
                        >
                          <span class="stat-value text-bold">{{
                            errors.unchecked
                          }}</span>
                          <span class="stat-desc">{{
                            $gettext('Unchecked')
                          }}</span>
                        </router-link>
                      </div>
                      <div :class="errors.unchecked > 0 ? 'col-6' : 'col-12'">
                        <router-link
                          :to="{
                            name: 'errors-list',
                            query: { computer_id: cid },
                          }"
                          class="action-stat-btn full-width column items-center text-center text-decoration-none"
                          :class="
                            $q.dark.isActive
                              ? 'bg-neutral-800 text-white'
                              : 'bg-neutral-100 text-black'
                          "
                        >
                          <span class="stat-value text-bold">{{
                            errors.total
                          }}</span>
                          <span class="stat-desc">{{ $gettext('Total') }}</span>
                        </router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Faults Diagnostic Card -->
              <div class="col-12 col-sm-6">
                <div class="diagnostic-card theme-warning">
                  <div class="card-content">
                    <div class="card-top row items-center q-mb-md">
                      <q-icon
                        :name="modelIcon('faults')"
                        size="24px"
                        class="text-warning q-mr-sm"
                      />
                      <span class="text-subtitle1 text-bold">{{
                        $gettext('Faults')
                      }}</span>
                    </div>

                    <div class="row q-col-gutter-sm items-center full-width">
                      <div v-if="faults.unchecked > 0" class="col-6">
                        <router-link
                          :to="{
                            name: 'faults-list',
                            query: { computer_id: cid, checked: false },
                          }"
                          class="action-stat-btn full-width column items-center text-center text-decoration-none"
                          :class="
                            $q.dark.isActive
                              ? 'bg-neutral-800 text-warning-dark'
                              : 'bg-neutral-100 text-warning-dark'
                          "
                        >
                          <span class="stat-value text-bold">{{
                            faults.unchecked
                          }}</span>
                          <span class="stat-desc">{{
                            $gettext('Unchecked')
                          }}</span>
                        </router-link>
                      </div>
                      <div :class="faults.unchecked > 0 ? 'col-6' : 'col-12'">
                        <router-link
                          :to="{
                            name: 'faults-list',
                            query: { computer_id: cid },
                          }"
                          class="action-stat-btn full-width column items-center text-center text-decoration-none"
                          :class="
                            $q.dark.isActive
                              ? 'bg-neutral-800 text-white'
                              : 'bg-neutral-100 text-black'
                          "
                        >
                          <span class="stat-value text-bold">{{
                            faults.total
                          }}</span>
                          <span class="stat-desc">{{ $gettext('Total') }}</span>
                        </router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Current Assignments -->
            <div class="q-gutter-y-md">
              <OverflowList
                model="attribute-sets"
                :label="$gettext('Attribute Sets')"
                :items="attributeSets"
                :icon="modelIcon('attribute-sets')"
              />

              <OverflowList
                model="domains"
                :label="$gettext('Domains')"
                :items="domains"
                :icon="modelIcon('domains')"
              />
            </div>
          </div>
        </div>

        <!-- Right Column: MANAGEMENT (Editable) -->
        <div class="col-12 col-xl-5">
          <div
            class="text-subtitle2 text-weight-bold text-uppercase opacity-50 q-mb-md tracking-widest"
          >
            {{ $gettext('Configuration') }}
          </div>

          <!-- Status Select -->
          <q-select
            v-model="localStatus"
            class="q-mb-md"
            emit-value
            map-options
            outlined
            :label="$gettext('Status')"
            :options="statusOptions"
            behavior="menu"
          >
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon
                    :name="scope.opt.icon"
                    :color="getStatusColor(scope.opt.value)"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{
                    scope.opt.label
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>

            <template #selected-item="scope">
              <q-item v-bind="scope.itemProps" class="q-pa-none">
                <q-item-section avatar class="min-width-0 q-pr-sm">
                  <q-icon
                    :name="scope.opt.icon"
                    :color="getStatusColor(scope.opt.value)"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{
                    scope.opt.label
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Comments -->
          <q-input
            v-model="localComment"
            type="textarea"
            rows="3"
            :label="$gettext('Comment')"
            class="q-mb-md"
            outlined
            autogrow
          />

          <!-- Tags using FilteredMultiSelect -->
          <div class="field-container q-mb-xl col">
            <FilteredMultiSelect
              v-model="localTags"
              :label="$gettext('Tags')"
              :fetch-options="filterTags"
            >
              <template #option="{ scope }">
                <q-item v-bind="scope.itemProps">
                  {{ attributeValue(scope.opt) }}
                </q-item>
              </template>

              <template #selected-item="{ scope }">
                <q-chip
                  removable
                  dense
                  color="transparent"
                  :tabindex="scope.tabindex"
                  class="q-ma-sm q-pa-none"
                  @remove="scope.removeAtIndex(scope.index)"
                >
                  <MigasLink
                    model="tags"
                    :pk="scope.opt.id"
                    :value="attributeValue(scope.opt)"
                    :tooltip="scope.opt.description"
                  />
                </q-chip>
              </template>
            </FilteredMultiSelect>
          </div>

          <!-- Save Button -->
          <div class="save-zone q-mt-auto">
            <q-btn
              unelevated
              color="primary"
              :label="$gettext('Save and continue editing')"
              :icon="appIcon('save-edit')"
              class="full-width"
              :loading="loading"
              :disabled="loading"
              @click="save"
            />
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useGettext } from 'vue3-gettext'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import OverflowList from 'components/ui/OverflowList'
import FilteredMultiSelect from 'components/ui/FilteredMultiSelect'
import MigasLink from 'components/MigasLink'

import { appIcon, modelIcon, useElement } from 'composables/element'

defineOptions({
  name: 'ComputerCurrentSituation',
})

const props = defineProps({
  cid: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: '',
  },
  comment: {
    type: String,
    default: '',
  },
  tags: {
    type: Array,
    default: () => [],
  },
  attributeSets: {
    type: Array,
    default: () => [],
  },
  domains: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['updated'])

const { $gettext } = useGettext()
const uiStore = useUiStore()
const { elementIcon, attributeValue } = useElement()

const loading = ref(false)
const statusOptions = ref([])
const errors = reactive({ unchecked: 0, total: 0 })
const faults = reactive({ unchecked: 0, total: 0 })

const localStatus = ref(props.status)
const localComment = ref(props.comment)
const localTags = ref([...props.tags])

// Sync props to local state
watch(
  () => props.status,
  (val) => {
    localStatus.value = val
  },
)
watch(
  () => props.comment,
  (val) => {
    localComment.value = val
  },
)
watch(
  () => props.tags,
  (val) => {
    localTags.value = [...val]
  },
)

const getComputerStatus = async () => {
  try {
    const response = await api.get('/api/v1/token/computers/status/')
    const { choices } = response.data

    Object.entries(choices).forEach(([key, val]) => {
      statusOptions.value.push({
        label: val,
        value: key,
        icon: elementIcon(key),
      })
    })
  } catch (error) {
    uiStore.notifyError(error)
  }
}

const loadErrors = async () => {
  try {
    const { data } = await api.get(
      `/api/v1/token/computers/${props.cid}/errors/`,
    )
    Object.assign(errors, data)
  } catch (error) {
    uiStore.notifyError(error)
  }
}

const loadFaults = async () => {
  try {
    const { data } = await api.get(
      `/api/v1/token/computers/${props.cid}/faults/`,
    )
    Object.assign(faults, data)
  } catch (error) {
    uiStore.notifyError(error)
  }
}

const filterTags = async (val) => {
  const { data } = await api.get('/api/v1/token/tags/', {
    params: { search: val.toLowerCase() },
  })

  return data.results
}

const save = async () => {
  loading.value = true
  try {
    await api.patch(`/api/v1/token/computers/${props.cid}/`, {
      status: localStatus.value,
      comment: localComment.value,
      tags: localTags.value.map((item) => item.id),
    })
    uiStore.notifySuccess($gettext('Current Situation has been changed!'))
    emit('updated', {
      status: localStatus.value,
      comment: localComment.value,
      tags: localTags.value,
    })
  } catch (error) {
    uiStore.notifyError(error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([getComputerStatus(), loadErrors(), loadFaults()])
})

const getStatusColor = (status) => {
  switch (status) {
    case 'OK':
      return 'positive'
    case 'REP':
      return 'warning'
    case 'RET':
      return 'negative'
    default:
      return 'grey-6'
  }
}

const currentStatusColor = computed(() => {
  return getStatusColor(localStatus.value)
})

const currentStatusIcon = computed(() => {
  const opt = statusOptions.value.find((o) => o.value === localStatus.value)
  return opt ? opt.icon : 'mdi-help-circle'
})

const currentStatusLabel = computed(() => {
  const opt = statusOptions.value.find((o) => o.value === localStatus.value)
  return opt ? opt.label : localStatus.value
})
</script>

<style scoped>
/* Diagnostic Cards Refined Layout */
.diagnostic-card {
  position: relative;
  border-radius: 12px;
  padding: 1.25rem;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  background: rgba(var(--brand-primary-rgb), 0.02);
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
  border: 1px solid rgba(var(--brand-primary-rgb), 0.05);
}

[data-theme='dark'] .diagnostic-card {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.05);
}

.diagnostic-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border-color: var(--brand-primary);
}

.theme-critical {
  border-top: 4px solid var(--q-negative);
}
.theme-warning {
  border-top: 4px solid var(--q-warning);
}

.card-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.action-stat-btn {
  border-radius: 10px;
  padding: 0.8rem 0.2rem;
  transition: all 0.2s ease;
  min-width: 0;
  display: flex;
}

.action-stat-btn:hover {
  filter: brightness(0.95);
}

[data-theme='dark'] .action-stat-btn:hover {
  filter: brightness(1.2);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 4px;
}

.stat-desc {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
}

.text-critical {
  color: var(--q-negative) !important;
}

.text-warning {
  color: var(--q-warning) !important;
}

.text-warning-dark {
  color: #c67900 !important;
}

[data-theme='dark'] .text-warning-dark {
  color: var(--q-warning) !important;
}

.bg-neutral-100 {
  background: #f5f5f5 !important;
}

.bg-neutral-800 {
  background: #262626 !important;
}

.text-black {
  color: #1c1c1c !important;
}

.status-badge-premium {
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: 6px;
  letter-spacing: 0.03em;
}

.text-decoration-none {
  text-decoration: none;
}
</style>
