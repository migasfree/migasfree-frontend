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

      <q-btn-group>
        <template v-if="prevIsPossible">
          <q-btn
            icon="mdi-page-first"
            color="primary"
            padding="sm"
            @click.prevent.stop="firstPage"
            ><q-tooltip>{{ $gettext('First') }}</q-tooltip></q-btn
          >

          <q-btn
            icon="mdi-page-previous"
            color="primary"
            padding="sm"
            @click.prevent.stop="previousPage"
            ><q-tooltip>{{ paginationOptions.prevLabel }}</q-tooltip></q-btn
          >
        </template>

        <template v-if="nextIsPossible">
          <q-btn
            icon="mdi-page-next"
            color="primary"
            padding="sm"
            @click.prevent.stop="nextPage"
            ><q-tooltip>{{ paginationOptions.nextLabel }}</q-tooltip></q-btn
          >

          <q-btn
            icon="mdi-page-last"
            color="primary"
            padding="sm"
            @click.prevent.stop="lastPage"
            ><q-tooltip>{{ $gettext('Last') }}</q-tooltip></q-btn
          >
        </template>
      </q-btn-group>
    </q-toolbar>
  </div>
</template>

<script>
import VgtPaginationPageInfo from 'vue-good-table/src/components/pagination/VgtPaginationPageInfo.vue'

export default {
  name: 'TablePagination',
  components: { VgtPaginationPageInfo },
  props: {
    total: {
      type: Number,
      required: true
    },
    pageChanged: {
      type: Function,
      required: true
    },
    perPageChanged: {
      type: Function,
      required: true
    },
    perPageDropdownEnabled: { type: Boolean, default: true },
    paginationOptions: { type: Object, required: true }
  },
  data() {
    return {
      currentPage: 1,
      prevPage: 0,
      currentPerPage: 10
    }
  },
  computed: {
    rowsPerPageOptions() {
      return this.paginationOptions.perPageDropdown
    },

    showPagination() {
      return this.total > this.currentPerPage
    },

    showAllOption() {
      // TODO create constant
      return this.total ? this.total <= 200 : false
    },

    pagesCount() {
      const quotient = Math.floor(this.total / this.currentPerPage)
      const remainder = this.total % this.currentPerPage

      return remainder === 0 ? quotient : quotient + 1
    },

    nextIsPossible() {
      return this.currentPage < this.pagesCount
    },

    prevIsPossible() {
      return this.currentPage > 1 && this.currentPage <= this.pagesCount
    },

    perPageLabel() {
      return `${this.paginationOptions.rowsPerPageLabel} (${this.currentPerPage})`
    }
  },
  watch: {
    currentPerPage: {
      handler(newValue, oldValue) {
        if (oldValue) this.perPageChanged(oldValue)
      },
      immediate: true
    },

    total: {
      handler(newValue, oldValue) {
        if (this.rowsPerPageOptions.indexOf(this.currentPerPage) === -1) {
          this.currentPerPage = newValue
        }
      }
    }
  },
  methods: {
    customPageChange(customCurrentPage) {
      this.pageChanged({
        currentPage: customCurrentPage ? customCurrentPage : this.currentPage
      })
    },

    customPerPageChange(customPerPage) {
      this.perPageChanged({ currentPerPage: customPerPage })
      this.currentPerPage = customPerPage
      if (customPerPage === this.total) this.currentPage = 1
    },

    nextPage() {
      if (this.nextIsPossible) {
        this.prevPage = this.currentPage
        ++this.currentPage
        this.customPageChange()
      }
    },

    previousPage() {
      if (this.prevIsPossible) {
        this.prevPage = this.currentPage
        --this.currentPage
        this.customPageChange()
      }
    },

    firstPage() {
      if (this.prevIsPossible) {
        this.currentPage = 1
        this.customPageChange()
      }
    },

    lastPage() {
      if (this.nextIsPossible) {
        this.currentPage = this.pagesCount
        this.customPageChange()
      }
    },

    changePage(pageNumber, emit = true) {
      if (
        pageNumber > 0 &&
        this.total > this.currentPerPage * (pageNumber - 1)
      ) {
        this.prevPage = this.currentPage
        this.currentPage = pageNumber
        if (emit) this.customPageChange()
      }
    }
  }
}
</script>
