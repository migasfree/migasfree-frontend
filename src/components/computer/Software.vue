<template>
  <q-card>
    <q-card-section>
      <div class="text-h5">Software</div>
    </q-card-section>

    <q-card-section>
      <q-list bordered>
        <q-expansion-item
          :content-inset-level="0.5"
          @show="loadSoftwareInventory"
        >
          <template v-slot:header>
            <q-item-section avatar>
              <q-icon name="mdi-package-variant" size="md" />
            </q-item-section>

            <q-item-section>
              Inventory
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

          <q-list class="overflow">
            <q-item v-if="loading.inventory">
              <q-spinner-dots color="primary" size="3em" />
            </q-item>
            <q-item v-for="item in softwareInventory" :key="item.id">
              <MigasLink model="packages" :pk="item.id" :value="item.name" />
            </q-item>
          </q-list>
        </q-expansion-item>

        <q-separator />

        <q-expansion-item
          :content-inset-level="0.5"
          @show="loadSoftwareHistory"
        >
          <template v-slot:header>
            <q-item-section avatar>
              <q-icon name="mdi-history" size="md" />
            </q-item-section>

            <q-item-section>
              History
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
            <q-item v-if="loading.history">
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
                  <p v-for="(item, index) in value" :key="index">
                    {{ item }}
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
    async loadSoftwareInventory() {
      if (this.softwareInventory.length === 0) {
        this.loading.inventory = true
        await this.$axios
          .get(this.inventoryUrl)
          .then((response) => {
            this.softwareInventory = response.data
            this.loading.inventory = false
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error.response.data.detail)
            this.loading.inventory = false
          })
      }
    },

    async loadSoftwareHistory() {
      if (Object.keys(this.softwareHistory).length === 0) {
        this.loading.history = true
        await this.$axios
          .get(this.historyUrl)
          .then((response) => {
            this.softwareHistory = response.data
            this.loading.history = false
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error.response.data.detail)
            this.loading.history = false
          })
      }
    }
  }
}
</script>
