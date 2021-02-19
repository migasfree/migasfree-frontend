<template>
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
              <template v-slot="{ item }">
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
                        item.startsWith('+') ? 'text-light-green-8' : 'text-red'
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
  </q-card>
</template>

<script>
import MigasLink from 'components/MigasLink'
import { copyToClipboard } from 'quasar'

export default {
  name: 'ComputerSoftware',
  components: { MigasLink },
  props: {
    inventoryUrl: {
      type: String,
      required: true
    },
    historyUrl: {
      type: String,
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
      softwareHistory: {}
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
          .get(this.inventoryUrl)
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
          .get(this.historyUrl)
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
    }
  }
}
</script>
