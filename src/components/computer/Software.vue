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
                <q-avatar color="info" text-color="black"
                  ><strong>{{ softwareInventory.length }}</strong></q-avatar
                >
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
                <q-avatar color="info" text-color="black"
                  ><strong>{{
                    Object.keys(softwareHistory).length
                  }}</strong></q-avatar
                >
                <translate
                  :translate-n="Object.keys(softwareHistory).length"
                  translate-plural="dates"
                  >date</translate
                >
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
            >
              <template #header>
                <q-item-section avatar>
                  <q-avatar icon="mdi-calendar-range" />
                </q-item-section>

                <q-item-section
                  >{{ key
                  }}<q-tooltip>{{
                    diffForHumans(key)
                  }}</q-tooltip></q-item-section
                >

                <q-item-section side>
                  <div class="row items-center">
                    <q-chip
                      v-if="value.filter((item) => item.mode === '+').length"
                      color="positive"
                      text-color="white"
                      ><strong>{{
                        value.filter((item) => item.mode === '+').length
                      }}</strong
                      ><q-tooltip
                        ><translate>Installed Packages</translate></q-tooltip
                      ></q-chip
                    >

                    <q-chip
                      v-if="value.filter((item) => item.mode === '-').length"
                      color="negative"
                      text-color="white"
                      ><strong>{{
                        value.filter((item) => item.mode === '-').length
                      }}</strong
                      ><q-tooltip
                        ><translate>Uninstalled Packages</translate></q-tooltip
                      ></q-chip
                    >
                  </div>
                </q-item-section>
              </template>
              <q-card>
                <q-card-section>
                  <q-list>
                    <q-virtual-scroll
                      class="overflow"
                      :items-size="value.length"
                      :items="value"
                    >
                      <template #default="{ item }">
                        <q-item>
                          <q-item-section avatar>
                            <q-avatar
                              size="md"
                              outline
                              :color="
                                item.mode === '+' ? 'positive' : 'negative'
                              "
                              text-color="white"
                              :icon="
                                item.mode === '+'
                                  ? 'mdi-plus-thick'
                                  : 'mdi-minus-thick'
                              "
                            />
                          </q-item-section>

                          <q-item-section side>
                            <MigasLink
                              model="packages"
                              :pk="item.id"
                              :value="item.name"
                            />
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-virtual-scroll>
                  </q-list>
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
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">Software Compare</div>
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
            <q-item v-bind="scope.itemProps">
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
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { copyToClipboard } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import MigasLink from 'components/MigasLink'

import { useElement } from 'composables/element'
import useDate from 'composables/date'

export default {
  name: 'ComputerSoftware',
  components: { MigasLink },
  props: {
    cid: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const { $gettext } = useGettext()
    const router = useRouter()
    const uiStore = useUiStore()
    const { elementIcon } = useElement()
    const { diffForHumans } = useDate()

    const loading = reactive({
      inventory: false,
      history: false,
    })
    const softwareInventory = ref([])
    const softwareHistory = reactive({})
    const showingCompare = ref(false)
    const computers = ref([])
    const target = ref(null)

    const isCompareEnabled = computed(() => {
      return target.value !== null
    })

    const sortArray = (array) => {
      const originalCopy = array.slice()
      return originalCopy.sort()
    }

    const loadSoftwareInventory = async () => {
      if (softwareInventory.value.length === 0) {
        loading.inventory = true
        await api
          .get(`/api/v1/token/computers/${props.cid}/software/inventory/`)
          .then((response) => {
            softwareInventory.value = response.data
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
          .finally(() => (loading.inventory = false))
      }
    }

    const loadSoftwareHistory = async () => {
      if (Object.keys(softwareHistory).length === 0) {
        loading.history = true
        await api
          .get(`/api/v1/token/computers/${props.cid}/software/history/`)
          .then((response) => {
            Object.assign(softwareHistory, response.data)
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
          .finally(() => (loading.history = false))
      }
    }

    const copyInventory = async () => {
      if (softwareInventory.value.length === 0) {
        await loadSoftwareInventory()
      }

      const inventory = softwareInventory.value.map((item) => item.name)

      copyToClipboard(sortArray(inventory).join('\n')).then(() => {
        uiStore.notifySuccess(
          $gettext('Software Inventory copied to clipboard')
        )
      })
    }

    const copyHistory = async () => {
      if (Object.keys(softwareHistory).length === 0) {
        await loadSoftwareHistory()
      }

      let history = []
      Object.entries(softwareHistory).map(([key, val]) => {
        history.push(key)
        sortArray(val).forEach((item) => {
          history.push(`${item.mode}${item.name}`)
        })
        history.push('')
      })

      copyToClipboard(history.join('\n')).then(() => {
        uiStore.notifySuccess($gettext('Software History copied to clipboard'))
      })
    }

    const compare = () => {
      router.push({
        name: 'computers-software-compare',
        params: { source: props.cid, target: target.value.id },
      })
    }

    const filterComputers = async (val, update, abort) => {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3) {
        abort()
        return
      }

      await api
        .get('/api/v1/token/computers/', {
          params: { search: val.toLowerCase() },
        })
        .then((response) => {
          computers.value = response.data.results
        })

      update(() => {})
    }

    const abortFilterComputers = () => {
      // console.log('delayed filter aborted')
    }

    return {
      loading,
      softwareInventory,
      softwareHistory,
      showingCompare,
      computers,
      target,
      isCompareEnabled,
      sortArray,
      loadSoftwareInventory,
      loadSoftwareHistory,
      copyInventory,
      copyHistory,
      compare,
      filterComputers,
      abortFilterComputers,
      elementIcon,
      diffForHumans,
    }
  },
}
</script>
