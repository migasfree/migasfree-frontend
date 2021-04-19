<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" />

    <div class="row q-pa-md q-gutter-sm justify-around">
      <div class="col-6 col-md col-sm col-xs">
        <q-card>
          <q-card-section>
            <div v-translate class="text-h5 q-mt-sm q-mb-xs">Source</div>

            <q-select
              v-model="source"
              outlined
              use-input
              map-options
              input-debounce="0"
              :label="$gettext('Computer')"
              :options="computers"
              @filter="filterComputers"
              @filter-abort="abortFilterComputers"
              @input="loadSoftware(source)"
            >
              <template #no-option>
                <q-item>
                  <q-item-section v-translate class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>

              <template #option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  {{ scope.opt.__str__ }}
                </q-item>
              </template>

              <template #selected-item="scope">
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
            </q-select>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6 col-md col-sm col-xs">
        <q-card>
          <q-card-section>
            <div v-translate class="text-h5 q-mt-sm q-mb-xs">Target</div>

            <q-select
              v-model="target"
              outlined
              use-input
              map-options
              input-debounce="0"
              :label="$gettext('Computer')"
              :options="computers"
              @filter="filterComputers"
              @filter-abort="abortFilterComputers"
              @input="loadSoftware(target)"
            >
              <template #no-option>
                <q-item>
                  <q-item-section v-translate class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>

              <template #option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  {{ scope.opt.__str__ }}
                </q-item>
              </template>

              <template #selected-item="scope">
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
            </q-select>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div v-if="isLoading && !isEnabled" class="row q-pa-md">
      <div class="col-12 text-center">
        <q-spinner-dots color="primary" size="3em" />
      </div>
    </div>

    <div v-if="isEnabled" class="row q-pa-md">
      <div class="col-12">
        <code-diff
          :old-string="source.inventory"
          :new-string="target.inventory"
          :context="10"
          output-format="side-by-side"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'
import CodeDiff from 'vue-code-diff'
import { elementMixin } from 'mixins/element'

export default {
  meta() {
    return {
      title: this.title
    }
  },
  components: {
    Breadcrumbs,
    Header,
    MigasLink,
    CodeDiff
  },
  mixins: [elementMixin],
  data() {
    return {
      title: this.$gettext('Software Compare'),
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: this.$gettext('Data'),
          icon: 'mdi-database-search'
        },
        {
          text: this.$gettext('Software Compare'),
          icon: 'mdi-file-compare'
        }
      ],
      computers: [],
      source: null,
      target: null
    }
  },
  computed: {
    isEnabled() {
      return (
        this.source !== null &&
        this.target !== null &&
        'inventory' in this.source &&
        'inventory' in this.target
      )
    },

    isLoading() {
      return this.source !== null && this.target !== null
    }
  },
  methods: {
    filterComputers(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3) {
        abort()
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.$axios
          .get('/api/v1/token/computers/', {
            params: { search: needle }
          })
          .then((response) => {
            this.computers = response.data.results
          })
        /* this.computers = stringOptions.filter(
          (v) => v.toLowerCase().indexOf(needle) > -1
        ) */
      })
    },

    abortFilterComputers() {
      // console.log('delayed filter aborted')
    },

    sortArray(array) {
      const originalCopy = array.slice()
      return originalCopy.sort()
    },

    async loadSoftware(obj) {
      if (obj !== null) {
        await this.$axios
          .get(`/api/v1/token/computers/${obj.id}/software/inventory/`)
          .then((response) => {
            const inventory = response.data.map((item) => item.name)

            this.$set(obj, 'inventory', this.sortArray(inventory).join('\n'))
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
      }
    }
  }
}
</script>
