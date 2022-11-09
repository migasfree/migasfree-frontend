<template>
  <div v-if="showPagination" class="row q-pa-md q-gutter-sm">
    <q-toolbar>
      <q-btn
        v-if="showAllOption"
        color="primary"
        icon="mdi-table-eye"
        @click.prevent.stop="customPerPageChange(total)"
        ><q-tooltip>{{ paginationOptions.allLabel }}</q-tooltip></q-btn
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

      <q-toolbar-title>
        <VgtPaginationPageInfo
          :total-records="total"
          :last-page="pagesCount"
          :current-page="currentPage"
          :current-per-page="currentPerPage"
          :of-text="paginationOptions.ofLabel"
          :page-text="paginationOptions.pageLabel"
          :mode="paginationOptions.mode"
          @page-changed="changePage"
        />
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
import { useUiStore } from 'stores/ui'
import { RESULTS_PER_PAGE } from 'config/app.conf'

import VgtPaginationPageInfo from 'vue-good-table-next/src/components/pagination/VgtPaginationPageInfo.vue'

export default {
  name: 'TablePagination',
  components: { VgtPaginationPageInfo },
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

    const currentPage = ref(1)
    const prevPage = ref(0)
    const currentPerPage = ref(RESULTS_PER_PAGE)

    const rowsPerPageOptions = computed(
      () => props.paginationOptions.perPageDropdown
    )
    const showPagination = computed(() => props.total > currentPerPage.value)
    const showAllOption = computed(() =>
      props.total ? props.total <= 200 : false
    )
    const pagesCount = computed(() => {
      const quotient = Math.floor(props.total / currentPerPage.value)
      const remainder = props.total % currentPerPage.value

      return remainder === 0 ? quotient : quotient + 1
    })
    const nextIsPossible = computed(() => currentPage.value < pagesCount.value)
    const prevIsPossible = computed(
      () => currentPage.value > 1 && currentPage.value <= pagesCount.value
    )
    const currentPageTable = computed(() => uiStore.getCurrentPageTable)
    const perPageLabel = computed(
      () =>
        `${props.paginationOptions.rowsPerPageLabel} (${currentPerPage.value})`
    )

    watch(
      currentPerPage,
      (newValue, oldValue) => {
        if (oldValue) props.perPageChanged(oldValue)
      },
      { immediate: true }
    )

    /*watch(() => props.total, (newValue, oldValue) => {
      if (props.rowsPerPageOptions.indexOf(currentPerPage.value) === -1) {
        currentPerPage.value = newValue;
      }
    })*/

    watch(currentPageTable, (val) => {
      currentPage.value = val
    })

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

    const nextPage = () => {
      if (nextIsPossible.value) {
        prevPage.value = currentPage.value
        ++currentPage.value
        customPageChange()
      }
    }

    const previousPage = () => {
      if (prevIsPossible.value) {
        prevPage.value = currentPage.value
        --currentPage.value
        customPageChange()
      }
    }

    const firstPage = () => {
      if (prevIsPossible.value) {
        currentPage.value = 1
        customPageChange()
      }
    }

    const lastPage = () => {
      if (nextIsPossible.value) {
        currentPage.value = pagesCount.value
        customPageChange()
      }
    }

    const changePage = (pageNumber, emit = true) => {
      if (
        pageNumber > 0 &&
        props.total > currentPerPage.value * (pageNumber - 1)
      ) {
        prevPage.value = currentPage.value
        currentPage.value = pageNumber
        if (emit) customPageChange()
      }
    }

    return {
      currentPage,
      prevPage,
      currentPerPage,
      rowsPerPageOptions,
      showPagination,
      showAllOption,
      pagesCount,
      nextIsPossible,
      prevIsPossible,
      perPageLabel,
      customPageChange,
      customPerPageChange,
      nextPage,
      previousPage,
      firstPage,
      lastPage,
      changePage,
    }
  },
}
</script>
