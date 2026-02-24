<template>
  <div v-if="showPagination" class="pagination-container q-py-sm q-px-xl">
    <div class="row items-center justify-between no-wrap full-width">
      <!-- LEFT: Per Page & View All -->
      <div class="row items-center q-gutter-x-sm">
        <q-btn
          v-if="showAllOption"
          flat
          dense
          round
          icon="mdi-table-eye"
          color="primary"
          class="opacity-70 hover-opacity-100"
          @click.prevent.stop="customPerPageChange(total)"
        >
          <q-tooltip>{{ $gettext('View All') }}</q-tooltip>
        </q-btn>

        <!-- Per Page Dropdown -->
        <q-btn-dropdown
          v-if="perPageDropdownEnabled"
          flat
          dense
          no-caps
          class="per-page-dropdown opacity-80 hover-opacity-100 text-caption text-weight-medium"
          content-class="per-page-menu"
          :label="perPageLabel"
        >
          <q-list dense>
            <q-item
              v-for="(option, index) in rowsPerPageOptions"
              :key="index"
              v-close-popup
              clickable
              :active="currentPerPage === option"
              active-class="text-app-primary bg-app-soft"
              @click="customPerPageChange(option)"
            >
              <q-item-section>
                <q-item-label>{{ option }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>

      <q-space />

      <!-- CENTER: Records Info -->
      <div
        v-if="$q.screen.gt.xs"
        class="records-info text-caption text-weight-medium text-center"
      >
        <span class="text-app-primary font-semi-bold">
          {{ recordInfoNumbers }}
        </span>
        <span class="opacity-70 q-mx-xs">/</span>
        <span class="opacity-70">{{ total }}</span>
      </div>

      <q-space />

      <!-- RIGHT: Pagination -->
      <div class="pagination-wrapper">
        <q-pagination
          v-model="currentPage"
          input
          input-class="pagination-input-app text-weight-bold"
          color="primary"
          size="md"
          flat
          :max="pagesCount"
          :max-pages="5"
          boundary-links
          direction-links
          icon-first="mdi-page-first"
          icon-last="mdi-page-last"
          icon-prev="mdi-chevron-left"
          icon-next="mdi-chevron-right"
          class="app-pagination"
          @update:model-value="customPageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useGettext } from 'vue3-gettext'
import { useUiStore } from 'stores/ui'
import { RESULTS_PER_PAGE, MAX_RESULTS_PER_PAGE } from 'config/app.conf'

defineOptions({ name: 'TablePagination' })

const props = defineProps({
  total: { type: Number, required: true },
  pageChanged: { type: Function, required: true },
  perPageChanged: { type: Function, required: true },
  perPageDropdownEnabled: { type: Boolean, default: true },
  paginationOptions: { type: Object, required: true },
})

const { $gettext } = useGettext()
const uiStore = useUiStore()
const { currentPageTable } = storeToRefs(uiStore)

const currentPage = ref(1)
const currentPerPage = ref(RESULTS_PER_PAGE)

// --- Computed ---

const rowsPerPageOptions = computed(
  () => props.paginationOptions.perPageDropdown,
)

const showPagination = computed(() => props.total > currentPerPage.value)

const showAllOption = computed(
  () => props.total > 0 && props.total <= MAX_RESULTS_PER_PAGE,
)

const pagesCount = computed(() => Math.ceil(props.total / currentPerPage.value))

const perPageLabel = computed(
  () => `${$gettext('Results')}: ${currentPerPage.value}`,
)

const recordInfoNumbers = computed(() => {
  const start = (currentPage.value - 1) * currentPerPage.value + 1
  const end = Math.min(currentPage.value * currentPerPage.value, props.total)
  return `${start} - ${end}`
})

// --- Actions ---

const customPageChange = (page) => {
  props.pageChanged({ currentPage: page || currentPage.value })
  if (page) currentPage.value = page
}

const customPerPageChange = (perPage) => {
  props.perPageChanged({ currentPerPage: perPage })
  currentPerPage.value = perPage
  if (perPage === props.total) currentPage.value = 1
}

// --- Watchers ---

watch(
  currentPerPage,
  (_newVal, oldVal) => {
    if (oldVal) props.perPageChanged(oldVal)
  },
  { immediate: true },
)

watch(currentPageTable, (val) => {
  currentPage.value = val
})

defineExpose({
  showAllOption,
  pagesCount,
  recordInfoNumbers,
  perPageLabel,
  showPagination,
  customPageChange,
  customPerPageChange,
  currentPage,
  currentPerPage,
  rowsPerPageOptions,
})
</script>

<style scoped>
.text-app-primary {
  color: var(--brand-primary);
}

.bg-app-soft {
  background: rgba(var(--brand-primary-rgb), 0.1);
}

/* Deep Styling for Q-Pagination to match branding */
.app-pagination :deep(.q-btn) {
  font-weight: 500;
  opacity: 0.8;
}

.app-pagination :deep(.q-btn:hover) {
  opacity: 1;
  background: rgba(var(--brand-primary-rgb), 0.05);
}

.app-pagination :deep(.q-field__control) {
  min-height: 32px !important;
  height: 32px !important;
  background: var(--neutral-100) !important;
  border-radius: 6px !important;
  padding: 0 4px !important;
  overflow: hidden !important;
  border: none !important;
}

[data-theme='dark'] .app-pagination :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.05) !important;
}

.app-pagination :deep(.q-field__native),
.app-pagination :deep(.q-field__input),
.app-pagination :deep(input) {
  padding: 0 !important;
  min-height: 32px !important;
  height: 32px !important;
  line-height: 32px !important;
  text-align: center;
  color: var(--brand-primary) !important;
  font-weight: 700 !important;
  opacity: 1 !important;
  background: transparent !important;
  border: none !important;
}

.app-pagination :deep(input::placeholder) {
  opacity: 1 !important;
  color: var(--brand-primary) !important;
  font-weight: 700 !important;
}

[data-theme='dark'] .app-pagination :deep(input) {
  color: #fefce8 !important;
}

[data-theme='dark'] .app-pagination :deep(input::placeholder) {
  color: #fefce8 !important;
}

.app-pagination :deep(.q-field__control:before),
.app-pagination :deep(.q-field__control:after) {
  display: none !important;
}

.pagination-container {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<style>
/* Global overrides for the per page menu */
.per-page-menu {
  border-radius: 12px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid var(--border);
}
</style>
