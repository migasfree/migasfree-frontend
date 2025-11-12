<template>
  <div v-if="showPagination" class="row q-pa-md q-gutter-sm">
    <q-toolbar>
      <q-btn
        v-if="showAllOption"
        color="primary"
        icon="mdi-table-eye"
        @click.prevent.stop="customPerPageChange(total)"
        ><q-tooltip>{{ $gettext('View All') }}</q-tooltip></q-btn
      >

      <q-btn-dropdown v-if="perPageDropdownEnabled" :label="perPageLabel">
        <q-list>
          <q-item
            v-for="(option, index) in rowsPerPageOptions"
            :key="index"
            v-close-popup
            clickable
            @click="customPerPageChange(option)"
          >
            <q-item-section>
              <q-item-label>{{ option }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

      <q-space />

      <q-toolbar-title class="text-center">
        {{ recordInfo }}
      </q-toolbar-title>

      <q-space />

      <q-pagination
        v-model="currentPage"
        input
        input-class="text-primary q-toolbar__title"
        size="lg"
        direction-links
        boundary-links
        :max="pagesCount"
        icon-first="mdi-page-first"
        icon-last="mdi-page-last"
        @update:model-value="customPageChange(currentPage)"
      />
    </q-toolbar>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useGettext } from 'vue3-gettext'
import { useUiStore } from 'stores/ui'
import { RESULTS_PER_PAGE, MAX_RESULTS_PER_PAGE } from 'config/app.conf'

export default {
  name: 'TablePagination',
  props: {
    total: {
      type: Number,
      required: true,
    },
    pageChanged: {
      type: Function,
      required: true,
    },
    perPageChanged: {
      type: Function,
      required: true,
    },
    perPageDropdownEnabled: { type: Boolean, default: true },
    paginationOptions: { type: Object, required: true },
  },
  setup(props) {
    const uiStore = useUiStore()
    const { $gettext } = useGettext()

    const { currentPageTable } = storeToRefs(uiStore)

    const currentPage = ref(1)
    const currentPerPage = ref(RESULTS_PER_PAGE)

    const rowsPerPageOptions = computed(
      () => props.paginationOptions.perPageDropdown,
    )
    const showPagination = computed(() => props.total > currentPerPage.value)
    const showAllOption = computed(() =>
      props.total ? props.total <= MAX_RESULTS_PER_PAGE : false,
    )

    const pagesCount = computed(() => {
      const quotient = Math.floor(props.total / currentPerPage.value)

      return props.total % currentPerPage.value === 0 ? quotient : quotient + 1
    })

    const perPageLabel = computed(
      () => `${$gettext('Results per page')} (${currentPerPage.value})`,
    )

    const recordInfo = computed(() => {
      const start = (currentPage.value - 1) * currentPerPage.value + 1
      const end = Math.min(
        currentPage.value * currentPerPage.value,
        props.total,
      )

      return `${start} - ${end} / ${props.total}`
    })

    watch(
      currentPerPage,
      (_newValue, oldValue) => {
        if (oldValue) props.perPageChanged(oldValue)
      },
      { immediate: true },
    )

    watch(currentPageTable, (val) => (currentPage.value = val))

    const customPageChange = (customCurrentPage) => {
      props.pageChanged({
        currentPage: customCurrentPage ? customCurrentPage : currentPage.value,
      })
    }

    const customPerPageChange = (customPerPage) => {
      props.perPageChanged({ currentPerPage: customPerPage })
      currentPerPage.value = customPerPage
      if (customPerPage === props.total) currentPage.value = 1
    }

    return {
      currentPage,
      currentPerPage,
      rowsPerPageOptions,
      showPagination,
      showAllOption,
      pagesCount,
      recordInfo,
      perPageLabel,
      customPageChange,
      customPerPageChange,
    }
  },
}
</script>
