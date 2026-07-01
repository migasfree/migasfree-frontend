<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    @update:model-value="closeDialog"
  >
    <q-card class="copy-project-card glass-panel">
      <q-card-section class="row items-center q-pb-none dialog-header">
        <div class="row items-center">
          <div class="icon-wrapper q-mr-md bg-primary-gradient">
            <q-icon :name="icon || appIcon('copy')" size="sm" color="white" />
          </div>
          <span class="text-h6 text-weight-bold text-gradient">
            {{ title }}
          </span>
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
              class="premium-select"
              :loading="loadingProjects"
              :disable="submitting"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
              @update:model-value="onSourceProjectChanged"
            />
          </div>

          <!-- Items List -->
          <template v-if="copyModalData.sourceProject">
            <div class="form-group q-mb-md">
              <div class="row justify-between items-center q-mb-xs">
                <span class="form-label text-weight-medium">{{
                  itemsLabel
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
                class="text-grey q-mb-md"
              >
                {{ $gettext('No items found in source project.') }}
              </div>

              <div
                v-if="items.length > 0"
                class="q-mb-md border-rounded q-pa-sm bg-grey-1 copy-items-list-container premium-scrollbar"
              >
                <div class="row items-center q-pb-xs border-bottom q-mb-xs">
                  <q-checkbox
                    v-model="allItemsSelected"
                    :label="$gettext('Select All')"
                    :disable="submitting"
                    dense
                  />
                </div>
                <div
                  v-for="item in items"
                  :key="item.id"
                  class="q-py-xs item-row"
                >
                  <q-checkbox
                    v-model="copyModalData.selectedItemIds"
                    :val="item.id"
                    :disable="submitting"
                    dense
                  >
                    <div class="row items-center no-wrap">
                      <span class="text-body2">{{ item.label }}</span>
                      <slot name="item-extra" :item="item" />
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
              class="premium-select"
              :loading="loadingProjects"
              :disable="submitting"
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
            class="progress-container q-pa-sm bg-primary-light border-rounded border-primary-light q-mb-sm"
          >
            <div
              class="row justify-between text-caption text-primary text-weight-bold q-mb-xs"
            >
              <span>{{ $gettext('Copying...') }}</span>
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

          <q-card-actions align="right" class="q-px-none q-pt-md items-center">
            <q-btn
              type="submit"
              push
              round
              color="primary"
              size="lg"
              class="submit-copy-btn"
              :loading="submitting"
              :disabled="!isCopyFormValid || submitting"
            >
              <q-icon :name="appIcon('save')" size="sm" />
              <q-tooltip>{{ $gettext('Save') }}</q-tooltip>
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
  title: {
    type: String,
    required: true,
  },
  itemsLabel: {
    type: String,
    required: true,
  },
  getItems: {
    type: Function,
    required: true,
  },
  copyItem: {
    type: Function,
    required: true,
  },
  /**
   * Receives the return value of copyItem() and returns
   * { success: boolean, skipped: boolean, skippedName?: string }.
   * Default: always treat as success (apps/drivers pattern — errors are
   * handled via isDuplicateError in the catch block).
   */
  parseItemResult: {
    type: Function,
    default: () => ({ success: true, skipped: false, skippedName: null }),
  },
  isDuplicateError: {
    type: Function,
    default: (error) => {
      if (error.response && error.response.status === 400) {
        const msg = JSON.stringify(error.response.data)
        return msg.includes('unique set') || msg.includes('already exists')
      }
      return false
    },
  },
  successMessage: { type: String, default: '' },
  errorMessage: { type: String, default: '' },
  alreadyExistedMessage: { type: String, default: '' },
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
    copyModalData.selectedItemIds = value
      ? items.value.map((item) => item.id)
      : []
  },
})

const isCopyFormValid = computed(
  () =>
    !!copyModalData.sourceProject &&
    !!copyModalData.destinationProject &&
    copyModalData.sourceProject !== copyModalData.destinationProject &&
    copyModalData.selectedItemIds.length > 0,
)

const itemsCountLabel = computed(() => {
  const selected = copyModalData.selectedItemIds.length
  const total = items.value.length
  return selected === total ? `(${total})` : `(${selected}/${total})`
})

const progressValue = computed(() =>
  totalItemsToCopyCount.value === 0
    ? 0
    : processedItemsCount.value / totalItemsToCopyCount.value,
)

const progressLabel = computed(
  () =>
    `${processedItemsCount.value} / ${totalItemsToCopyCount.value} (${Math.round(progressValue.value * 100)}%)`,
)

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
  let failureCount = 0
  const errors = []
  const skippedNames = []

  const itemsToCopy = items.value.filter((item) =>
    copyModalData.selectedItemIds.includes(item.id),
  )

  processedItemsCount.value = 0
  totalItemsToCopyCount.value = itemsToCopy.length

  for (const item of itemsToCopy) {
    processedItemsCount.value++
    try {
      const result = await props.copyItem(
        item,
        copyModalData.destinationProject,
      )
      const parsed = props.parseItemResult(result)
      if (parsed.skipped) {
        skippedNames.push(parsed.skippedName || item.label)
      } else {
        successCount++
      }
    } catch (error) {
      if (props.isDuplicateError(error)) {
        continue // silent ignore (apps/drivers pattern)
      }
      failureCount++
      const errorMsg =
        error.response?.data?.non_field_errors?.[0] || error.message || ''
      errors.push(`${item.label}: ${errorMsg}`)
    }

    await new Promise((resolve) => setTimeout(resolve, 150))
  }

  if (successCount > 0) {
    uiStore.notifySuccess(
      props.successMessage ||
        $gettext('%{count} items copied successfully.', {
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

  if (successCount === 0 && failureCount === 0 && skippedNames.length === 0) {
    uiStore.notifySuccess(
      props.alreadyExistedMessage ||
        $gettext(
          'All selected items already existed in the destination project.',
        ),
    )
  }

  if (failureCount > 0) {
    uiStore.notifyError(
      props.errorMessage ||
        $gettext('Failed to copy %{count} items. Errors: %{errors}', {
          count: failureCount,
          errors: errors.join(', '),
        }),
    )
  }

  submitting.value = false
  if (failureCount === 0 || successCount > 0) {
    closeDialog(false)
  }
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
.copy-project-card {
  min-width: 500px;
  max-width: 600px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.glass-panel {
  background: rgba(255, 255, 255, 0.97);
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
  box-shadow: 0 4px 12px rgba(var(--brand-primary-rgb), 0.2);
}

.bg-primary-gradient {
  background: linear-gradient(
    135deg,
    var(--brand-primary) 0%,
    var(--brand-secondary) 100%
  );
}

.text-gradient {
  background: linear-gradient(
    135deg,
    var(--brand-primary) 0%,
    var(--brand-secondary) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

[data-theme='dark'] .icon-wrapper {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

[data-theme='dark'] .bg-primary-gradient {
  background: linear-gradient(
    135deg,
    var(--neutral-300) 0%,
    var(--neutral-100) 100%
  );
}

[data-theme='dark'] .text-gradient {
  background: linear-gradient(
    135deg,
    var(--brand-primary) 0%,
    var(--neutral-700) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.close-btn {
  transition: all 0.2s ease;
}
.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.form-label {
  font-size: 0.85rem;
  color: #555;
}

.copy-items-list-container {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
}

.border-rounded {
  border-radius: 12px;
}

.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.item-row {
  border-radius: 8px;
  padding: 2px 6px;
  transition: background 0.15s ease;
}
.item-row:hover {
  background: rgba(var(--brand-primary-rgb), 0.05);
}

[data-theme='dark'] .item-row:hover {
  background: rgba(255, 255, 255, 0.06);
}

.bg-primary-light {
  background-color: rgba(var(--brand-primary-rgb), 0.05);
}

.border-primary-light {
  border: 1px solid rgba(var(--brand-primary-rgb), 0.12);
}

.premium-progress {
  height: 8px;
  border-radius: 4px;
}

.submit-copy-btn {
  width: 56px;
  height: 56px;
  box-shadow: 0 4px 14px rgba(var(--brand-primary-rgb), 0.3);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.submit-copy-btn:hover:not([disabled]) {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(var(--brand-primary-rgb), 0.4);
}

[data-theme='dark'] .submit-copy-btn {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
}
[data-theme='dark'] .submit-copy-btn:hover:not([disabled]) {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
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
</style>
