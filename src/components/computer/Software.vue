<template>
  <div>
    <q-card>
      <q-card-section>
        <div v-translate class="text-h5">Software</div>
      </q-card-section>

      <q-card-section>
        <q-list bordered>
          <q-expansion-item
            :content-inset-level="0.5"
            @show="loadSoftwareInventory"
          >
            <template #header>
              <q-item-section avatar>
                <q-icon name="mdi-package-variant" size="md" />
              </q-item-section>

              <q-item-section>
                <translate>Inventory</translate>
              </q-item-section>

              <q-item-section v-if="softwareInventory.length > 0">
                <q-chip>
                  <q-avatar color="info" text-color="white">{{
                    softwareInventory.length
                  }}</q-avatar>
                  <translate>packages</translate>
                </q-chip>
              </q-item-section>

              <q-item-section side>
                <q-btn
                  flat
                  icon="mdi-content-copy"
                  color="primary"
                  @click.stop="copyInventory"
                />
              </q-item-section>
            </template>

            <q-list>
              <q-item v-if="loading.inventory" class="justify-center">
                <q-spinner-dots color="primary" size="3em" />
              </q-item>

              <q-virtual-scroll
                class="overflow"
                :items-size="softwareInventory.length"
                :items="softwareInventory"
              >
                <template #default="{ item }">
                  <q-item>
                    <MigasLink
                      model="packages"
                      :pk="item.id"
                      :value="item.name"
                      icon="mdi-package-variant"
                    />
                  </q-item>
                </template>
              </q-virtual-scroll>
            </q-list>
          </q-expansion-item>

          <q-separator />

          <q-expansion-item
            :content-inset-level="0.5"
            @show="loadSoftwareHistory"
          >
            <template #header>
              <q-item-section avatar>
                <q-icon name="mdi-history" size="md" />
              </q-item-section>

              <q-item-section>
                <translate>History</translate>
              </q-item-section>

              <q-item-section v-if="Object.keys(softwareHistory).length > 0">
                <q-chip>
                  <q-avatar color="info" text-color="white">{{
                    Object.keys(softwareHistory).length
                  }}</q-avatar>
                  <translate>dates</translate>
                </q-chip>
              </q-item-section>

              <q-item-section side>
                <q-btn
                  flat
                  icon="mdi-content-copy"
                  color="primary"
                  @click.stop="copyHistory"
                />
              </q-item-section>
            </template>

            <q-list class="overflow">
              <q-item v-if="loading.history" class="justify-center">
                <q-spinner-dots color="primary" size="3em" />
              </q-item>
              <q-expansion-item
                v-for="(value, key) in softwareHistory"
                :key="key"
                expand-separator
                :label="key"
                icon="mdi-calendar-range"
              >
                <q-card>
                  <q-card-section>
                    <p v-for="(item, index) in sortArray(value)" :key="index">
                      <span
                        :class="
                          item.startsWith('+')
                            ? 'text-light-green-8'
                            : 'text-red'
                        "
                        >{{ item }}</span
                      >
                    </p>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
          </q-expansion-item>
        </q-list>
      </q-card-section>

      <q-card-actions class="justify-around">
        <q-btn
          icon="mdi-file-compare"
          color="info"
          text-color="black"
          no-caps
          :label="`${$gettext('Compare')}...`"
          @click="showingCompare = true"
        />
      </q-card-actions>
    </q-card>

    <q-dialog v-model="showingCompare" persistent>
      <q-card>
        <q-card-section class="row">
          <div v-translate class="text-h5 q-mt-sm q-mb-xs">
            Software Compare
          </div>
        </q-card-section>

        <q-card-section class="row items-center">
          <q-select
            v-model="target"
            autofocus
            outlined
            use-input
            map-options
            input-debounce="0"
            :label="$gettext('Computer')"
            :options="computers"
            @filter="filterComputers"
            @filter-abort="abortFilterComputers"
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

        <q-card-actions align="right">
          <q-btn
            v-close-popup
            flat
            color="primary"
            :label="$gettext('Cancel')"
            @click="showingCompare = !showingCompare"
          />

          <q-btn
            v-close-popup
            icon="mdi-file-compare"
            color="primary"
            :disabled="!isCompareEnabled"
            :label="$gettext('Compare')"
            @click="compare"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import MigasLink from 'components/MigasLink'
import { elementMixin } from 'mixins/element'
import { copyToClipboard } from 'quasar'

export default {
  name: 'ComputerSoftware',
  components: { MigasLink },
  mixins: [elementMixin],
  props: {
    cid: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      loading: {
        inventory: false,
        history: false
      },
      softwareInventory: [],
      softwareHistory: {},
      showingCompare: false,
      computers: [],
      target: null
    }
  },
  computed: {
    isCompareEnabled() {
      return this.target !== null
    }
  },
  methods: {
    sortArray(array) {
      const originalCopy = array.slice()
      return originalCopy.sort()
    },

    async loadSoftwareInventory() {
      if (this.softwareInventory.length === 0) {
        this.loading.inventory = true
        await this.$axios
          .get(`/api/v1/token/computers/${this.cid}/software/inventory/`)
          .then((response) => {
            this.softwareInventory = response.data
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
          .finally(() => (this.loading.inventory = false))
      }
    },

    async loadSoftwareHistory() {
      if (Object.keys(this.softwareHistory).length === 0) {
        this.loading.history = true
        await this.$axios
          .get(`/api/v1/token/computers/${this.cid}/software/history/`)
          .then((response) => {
            this.softwareHistory = response.data
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
          .finally(() => (this.loading.history = false))
      }
    },

    async copyInventory() {
      if (this.softwareInventory.length === 0) {
        await this.loadSoftwareInventory()
      }

      const inventory = this.softwareInventory.map((item) => item.name)

      copyToClipboard(this.sortArray(inventory).join('\n')).then(() => {
        this.$store.dispatch(
          'ui/notifySuccess',
          this.$gettext('Software Inventory copied to clipboard')
        )
      })
    },

    async copyHistory() {
      if (Object.keys(this.softwareHistory).length === 0) {
        await this.loadSoftwareHistory()
      }

      let history = []
      Object.entries(this.softwareHistory).map(([key, val]) => {
        history.push(key)
        this.sortArray(val).forEach((item) => {
          history.push(item)
        })
        history.push('')
      })

      copyToClipboard(history.join('\n')).then(() => {
        this.$store.dispatch(
          'ui/notifySuccess',
          this.$gettext('Software History copied to clipboard')
        )
      })
    },

    async filterComputers(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3) {
        abort()
        return
      }

      await this.$axios
        .get('/api/v1/token/computers/', {
          params: { search: val.toLowerCase() }
        })
        .then((response) => {
          this.computers = response.data.results
        })

      update(() => {})
    },

    abortFilterComputers() {
      // console.log('delayed filter aborted')
    },

    compare() {
      this.$router.push({
        name: 'computers-software-compare',
        params: { source: this.cid, target: this.target.id }
      })
    }
  }
}
</script>
