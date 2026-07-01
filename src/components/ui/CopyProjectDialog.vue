<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    @update:model-value="closeDialog"
  >
    <q-card class="copy-project-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="row items-center">
          <q-icon
            :name="icon || appIcon('copy')"
            size="sm"
            color="primary"
            class="q-mr-sm"
          />
          <span class="text-h6 text-weight-bold">
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
          :disabled="submitting"
        />
      </q-card-section>

      <q-card-section class="q-pa-md">
        <q-form @submit="submitCopy">
          <!-- Source Project -->
          <q-select
            v-model="copyModalData.sourceProject"
            :label="$gettext('Source Project')"
            :options="projectsOptions"
            option-value="id"
            option-label="name"
            filled
            emit-value
            map-options
            class="q-mb-md"
            :loading="loadingProjects"
            :disable="submitting"
            lazy-rules
            :rules="[(val) => !!val || $gettext('* Required')]"
            @update:model-value="onSourceProjectChanged"
          />

          <!-- Items List (Only visible when source project is selected and items are loaded) -->
          <template v-if="copyModalData.sourceProject">
            <div class="text-subtitle2 q-mb-xs">
              {{ itemsLabel }}
              <span
                v-if="items.length > 0"
                class="text-weight-bold text-primary q-ml-xs"
              >
                {{ itemsCountLabel }}
              </span>
              <span v-if="loadingItems" class="q-ml-sm">
                <q-spinner size="xs" />
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
              class="q-mb-md border-rounded q-pa-sm bg-grey-1 copy-items-list-container"
            >
              <div class="row items-center q-pb-xs border-bottom q-mb-xs">
                <q-checkbox
                  v-model="allItemsSelected"
                  :label="$gettext('Select All')"
                  :disable="submitting"
                  dense
                />
              </div>
              <div v-for="item in items" :key="item.id" class="q-py-xs">
                <q-checkbox
                  v-model="copyModalData.selectedItemIds"
                  :val="item.id"
                  :label="item.label"
                  :disable="submitting"
                  dense
                />
              </div>
            </div>
          </template>

          <!-- Destination Project -->
          <q-select
            v-model="copyModalData.destinationProject"
            :label="$gettext('Destination Project')"
            :options="destinationProjectsOptions"
            option-value="id"
            option-label="name"
            filled
            emit-value
            map-options
            class="q-mb-md"
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

          <div v-if="submitting" class="q-px-none q-pb-sm">
            <div class="row justify-between text-caption text-grey-7 q-mb-xs">
              <span>{{ $gettext('Copying...') }}</span>
              <span>{{ progressLabel }}</span>
            </div>
            <q-linear-progress
              :value="progressValue"
              color="primary"
              stripe
              animate
              class="rounded-borders"
            />
          </div>

          <q-card-actions align="right" class="q-px-none q-pt-md items-center">
            <q-btn
              type="submit"
              push
              round
              color="primary"
              size="lg"
              :icon="appIcon('save')"
              :loading="submitting"
              :disabled="!isCopyFormValid || submitting"
            >
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
  isDuplicateError: {
    type: Function,
    default: (error) => {
      if (error.response && error.response.status === 400) {
        const data = error.response.data
        const msg = JSON.stringify(data)
        return msg.includes('unique set') || msg.includes('already exists')
      }
      return false
    },
  },
  successMessage: {
    type: String,
    default: '',
  },
  errorMessage: {
    type: String,
    default: '',
  },
  alreadyExistedMessage: {
    type: String,
    default: '',
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
  let failureCount = 0
  const errors = []

  const itemsToCopy = items.value.filter((item) =>
    copyModalData.selectedItemIds.includes(item.id),
  )

  processedItemsCount.value = 0
  totalItemsToCopyCount.value = itemsToCopy.length

  for (const item of itemsToCopy) {
    processedItemsCount.value++
    try {
      await props.copyItem(item, copyModalData.destinationProject)
      successCount++
    } catch (error) {
      if (props.isDuplicateError(error)) {
        // Silent ignore for duplicate entries
        continue
      }
      failureCount++
      const errorMsg =
        error.response?.data?.non_field_errors?.[0] || error.message || ''
      errors.push(`${item.label}: ${errorMsg}`)
    }

    // Rate-limiting delay to avoid 429 errors
    await new Promise((resolve) => setTimeout(resolve, 150))
  }

  if (successCount > 0) {
    const defaultSuccess = $gettext('%{count} items copied successfully.', {
      count: successCount,
    })
    uiStore.notifySuccess(props.successMessage || defaultSuccess)
    emit('copied')
  } else if (failureCount === 0) {
    const defaultAlreadyExisted = $gettext(
      'All selected items already existed in the destination project.',
    )
    uiStore.notifySuccess(props.alreadyExistedMessage || defaultAlreadyExisted)
  }

  if (failureCount > 0) {
    const defaultFailure = $gettext(
      'Failed to copy %{count} items. Errors: %{errors}',
      {
        count: failureCount,
        errors: errors.join(', '),
      },
    )
    uiStore.notifyError(props.errorMessage || defaultFailure)
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
}

.copy-items-list-container {
  max-height: 200px;
  overflow-y: auto;
}
</style>
