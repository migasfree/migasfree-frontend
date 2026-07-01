<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    @update:model-value="closeDialog"
  >
    <q-card class="copy-deployment-card glass-panel">
      <!-- Header -->
      <q-card-section class="row items-center q-pb-none dialog-header">
        <div class="row items-center">
          <div class="icon-wrapper q-mr-md bg-primary-gradient">
            <q-icon :name="icon || appIcon('copy')" size="sm" color="white" />
          </div>
          <div>
            <div class="text-h6 text-weight-bold text-gradient">
              {{ $gettext('Copy Deployments') }}
            </div>
            <div class="text-caption text-grey-6">
              {{ $gettext('Migrate internal sources between projects') }}
            </div>
          </div>
        </div>
        <q-space />
        <q-btn
          v-close-popup
          flat
          round
          dense
          icon="close"
          class="close-btn text-grey-5"
          :disabled="submitting"
        />
      </q-card-section>

      <!-- Content -->
      <q-card-section class="q-pa-lg">
        <q-form @submit="submitCopy">
          <!-- Source Project -->
          <div class="form-group q-mb-md">
            <div class="form-label text-weight-medium q-mb-xs">
              {{ $gettext('Source Project') }}
            </div>
            <q-select
              v-model="copyModalData.sourceProject"
              :options="projectsOptions"
              option-value="id"
              option-label="name"
              filled
              emit-value
              map-options
              :loading="loadingProjects"
              :disable="submitting"
              placeholder="Select project..."
              class="premium-select"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
              @update:model-value="onSourceProjectChanged"
            />
          </div>

          <!-- Deployments List (Visible when source project is selected) -->
          <template v-if="copyModalData.sourceProject">
            <div class="form-group q-mb-md">
              <div class="row justify-between items-center q-mb-xs">
                <span class="form-label text-weight-medium">{{
                  $gettext('Deployments to Copy')
                }}</span>
                <span
                  v-if="items.length > 0"
                  class="text-caption text-primary text-weight-bold"
                >
                  {{ itemsCountLabel }}
                </span>
                <span v-if="loadingItems">
                  <q-spinner size="xs" color="primary" />
                </span>
              </div>

              <div
                v-if="!loadingItems && items.length === 0"
                class="empty-state-box text-center q-pa-md border-rounded bg-grey-1"
              >
                <q-icon
                  name="mdi-package-variant-closed"
                  size="md"
                  color="grey-4"
                  class="q-mb-xs"
                />
                <div class="text-grey-6 text-body2">
                  {{
                    $gettext('No internal deployments found in source project.')
                  }}
                </div>
              </div>

              <div
                v-if="items.length > 0"
                class="border-rounded q-pa-sm bg-grey-1 copy-items-list-container premium-scrollbar"
              >
                <!-- Select All -->
                <div
                  class="row items-center q-pb-xs border-bottom q-mb-xs select-all-row"
                >
                  <q-checkbox
                    v-model="allItemsSelected"
                    :label="$gettext('Select All')"
                    :disable="submitting"
                    dense
                    class="premium-checkbox"
                  />
                </div>
                <!-- Individual Items -->
                <div
                  v-for="item in items"
                  :key="item.id"
                  class="q-py-xs item-row transition-all"
                >
                  <q-checkbox
                    v-model="copyModalData.selectedItemIds"
                    :val="item.id"
                    :disable="submitting"
                    dense
                    class="premium-checkbox"
                  >
                    <div class="row items-center no-wrap">
                      <span class="text-body2 text-weight-medium text-grey-8">{{
                        item.label
                      }}</span>
                      <q-badge
                        v-if="item.enabled"
                        color="green-1"
                        text-color="green-8"
                        class="q-ml-sm text-weight-bold"
                        label="enabled"
                      />
                      <q-badge
                        v-else
                        color="red-1"
                        text-color="red-8"
                        class="q-ml-sm text-weight-bold"
                        label="disabled"
                      />
                    </div>
                  </q-checkbox>
                </div>
              </div>
            </div>
          </template>

          <!-- Destination Project -->
          <div class="form-group q-mb-md">
            <div class="form-label text-weight-medium q-mb-xs">
              {{ $gettext('Destination Project') }}
            </div>
            <q-select
              v-model="copyModalData.destinationProject"
              :options="destinationProjectsOptions"
              option-value="id"
              option-label="name"
              filled
              emit-value
              map-options
              :loading="loadingProjects"
              :disable="submitting"
              placeholder="Select destination project..."
              class="premium-select"
              lazy-rules
              :rules="[
                (val) => !!val || $gettext('* Required'),
                (val) =>
                  val !== copyModalData.sourceProject ||
                  $gettext(
                    'Destination project must be different from source project',
                  ),
              ]"
            />
          </div>

          <!-- Progress bar -->
          <div
            v-if="submitting"
            class="progress-container q-mt-lg q-pa-sm bg-primary-light border-rounded border-primary-light"
          >
            <div
              class="row justify-between text-caption text-primary text-weight-bold q-mb-xs"
            >
              <span>{{ $gettext('Copying Deployments...') }}</span>
              <span>{{ progressLabel }}</span>
            </div>
            <q-linear-progress
              :value="progressValue"
              color="primary"
              stripe
              animate
              class="rounded-borders premium-progress"
            />
          </div>

          <!-- Card Actions -->
          <q-card-actions align="right" class="q-px-none q-pt-lg items-center">
            <q-btn
              type="submit"
              push
              round
              color="primary"
              size="lg"
              class="submit-copy-btn bg-primary-gradient"
              :loading="submitting"
              :disabled="!isCopyFormValid || submitting"
            >
              <q-icon :name="appIcon('save')" size="sm" />
              <q-tooltip>{{ $gettext('Start Copying') }}</q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useGettext } from 'vue3-gettext'
import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'
import { appIcon } from 'composables/element'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  icon: {
    type: String,
    default: '',
  },
  getItems: {
    type: Function,
    required: true,
  },
  copyItem: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'copied'])

const { $gettext } = useGettext()
const uiStore = useUiStore()

const projectsList = ref([])
const items = ref([])
const loadingProjects = ref(false)
const loadingItems = ref(false)
const submitting = ref(false)
const processedItemsCount = ref(0)
const totalItemsToCopyCount = ref(0)

const copyModalData = reactive({
  sourceProject: null,
  destinationProject: null,
  selectedItemIds: [],
})

const projectsOptions = computed(() => projectsList.value)
const destinationProjectsOptions = computed(() => {
  if (!copyModalData.sourceProject) return projectsList.value
  return projectsList.value.filter((p) => p.id !== copyModalData.sourceProject)
})

const allItemsSelected = computed({
  get() {
    return (
      items.value.length > 0 &&
      copyModalData.selectedItemIds.length === items.value.length
    )
  },
  set(value) {
    if (value) {
      copyModalData.selectedItemIds = items.value.map((item) => item.id)
    } else {
      copyModalData.selectedItemIds = []
    }
  },
})

const isCopyFormValid = computed(() => {
  return (
    !!copyModalData.sourceProject &&
    !!copyModalData.destinationProject &&
    copyModalData.sourceProject !== copyModalData.destinationProject &&
    copyModalData.selectedItemIds.length > 0
  )
})

const itemsCountLabel = computed(() => {
  const selected = copyModalData.selectedItemIds.length
  const total = items.value.length
  if (selected === total) {
    return `(${total})`
  } else {
    return `(${selected}/${total})`
  }
})

const progressValue = computed(() => {
  if (totalItemsToCopyCount.value === 0) return 0
  return processedItemsCount.value / totalItemsToCopyCount.value
})

const progressLabel = computed(() => {
  return `${processedItemsCount.value} / ${totalItemsToCopyCount.value} (${Math.round(progressValue.value * 100)}%)`
})

watch(
  () => copyModalData.sourceProject,
  (newSource) => {
    if (newSource && copyModalData.destinationProject === newSource) {
      copyModalData.destinationProject = null
    }
  },
)

const loadProjects = async () => {
  if (projectsList.value.length > 0) return
  loadingProjects.value = true
  try {
    const { data } = await api.get('/api/v1/token/projects/', {
      params: { page_size: 10000 },
    })
    projectsList.value = data.results || []
  } catch (error) {
    uiStore.notifyError(error)
  } finally {
    loadingProjects.value = false
  }
}

const onSourceProjectChanged = async (projectId) => {
  copyModalData.selectedItemIds = []
  items.value = []
  if (!projectId) return

  loadingItems.value = true
  try {
    items.value = await props.getItems(projectId)
    // Select all by default
    copyModalData.selectedItemIds = items.value.map((item) => item.id)
  } catch (error) {
    uiStore.notifyError(error)
  } finally {
    loadingItems.value = false
  }
}

const submitCopy = async () => {
  submitting.value = true
  let successCount = 0
  const skippedNames = []

  const itemsToCopy = items.value.filter((item) =>
    copyModalData.selectedItemIds.includes(item.id),
  )

  processedItemsCount.value = 0
  totalItemsToCopyCount.value = itemsToCopy.length

  for (const item of itemsToCopy) {
    processedItemsCount.value++
    try {
      const response = await props.copyItem(
        item,
        copyModalData.destinationProject,
      )
      if (response && response.created) {
        successCount++
      } else if (response && response.skipped_name) {
        skippedNames.push(response.skipped_name)
      } else {
        successCount++ // Fallback if result isn't fully structured
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message || ''
      uiStore.notifyError(`${item.label}: ${errorMsg}`)
    }

    // Rate-limiting delay to avoid 429 / performance load
    await new Promise((resolve) => setTimeout(resolve, 150))
  }

  // Final summary notification
  if (successCount > 0) {
    uiStore.notifySuccess(
      $gettext('%{count} deployments copied successfully.', {
        count: successCount,
      }),
    )
    emit('copied')
  }

  if (skippedNames.length > 0) {
    uiStore.notifyWarning(
      $gettext('Skipped (already existed in target): %{names}', {
        names: skippedNames.join(', '),
      }),
    )
  }

  submitting.value = false
  closeDialog(false)
}

const closeDialog = (value) => {
  if (!submitting.value) {
    emit('update:modelValue', value)
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      copyModalData.sourceProject = null
      copyModalData.destinationProject = null
      copyModalData.selectedItemIds = []
      items.value = []
      processedItemsCount.value = 0
      totalItemsToCopyCount.value = 0
      loadProjects()
    }
  },
)
</script>

<style scoped>
.copy-deployment-card {
  min-width: 500px;
  max-width: 600px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.glass-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
}

.dialog-header {
  padding: 20px 24px 10px;
}

.icon-wrapper {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.25);
}

.bg-primary-gradient {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

.text-gradient {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.close-btn {
  transition: all 0.2s ease;
}
.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1976d2 !important;
}

.form-label {
  font-size: 0.85rem;
  color: #555;
}

.premium-select :deep(.q-field__control) {
  border-radius: 10px;
}

.copy-items-list-container {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
}

.select-all-row {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.item-row {
  border-radius: 8px;
  padding: 4px 8px;
}
.item-row:hover {
  background: rgba(25, 118, 210, 0.04);
}

.border-rounded {
  border-radius: 12px;
}

.bg-primary-light {
  background-color: rgba(25, 118, 210, 0.05);
}

.border-primary-light {
  border: 1px solid rgba(25, 118, 210, 0.12);
}

.premium-progress {
  height: 8px;
  border-radius: 4px;
}

.submit-copy-btn {
  width: 56px;
  height: 56px;
  box-shadow: 0 4px 14px rgba(25, 118, 210, 0.3);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.submit-copy-btn:hover:not([disabled]) {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
}

.premium-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.premium-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 3px;
}
.premium-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}
.premium-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}

.transition-all {
  transition: all 0.2s ease;
}
</style>
