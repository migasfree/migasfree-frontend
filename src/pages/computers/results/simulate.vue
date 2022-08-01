<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <template v-if="computer.id">
      <Header :title="title" :is-export-btn="false">
        <template v-if="computer.id" #append
          >:
          <MigasLink
            model="computers"
            :pk="computer.id"
            :value="computer.__str__ || ''"
            :icon="elementIcon(computer.status)"
          />
        </template>
      </Header>

      <div class="row q-pa-md q-gutter-sm">
        <div class="col-md">
          <q-card>
            <q-card-section>
              <div v-translate class="text-h5">Input (from computer)</div>
            </q-card-section>

            <q-card-section>
              <p v-if="loading.input" class="items-center">
                <q-spinner-dots color="primary" size="3em" />
              </p>
              <template v-else>
                <p>
                  <q-icon
                    name="mdi-clock-outline"
                    size="sm"
                    class="vertical-middle"
                  />
                  <span class="vertical-middle">
                    {{ showDate(new Date(Date.now())) }}</span
                  >
                </p>

                <p>
                  <q-icon
                    name="mdi-card-account-details-outline"
                    size="sm"
                    class="vertical-middle"
                  />
                  <span class="vertical-middle"> {{ computer.uuid }}</span>
                </p>

                <p v-if="platform.id">
                  <MigasLink
                    model="platforms"
                    :pk="platform.id"
                    :value="platform.name"
                  />
                </p>

                <p>
                  <MigasLink
                    model="projects"
                    :pk="computer.project.id"
                    :value="computer.project.name"
                  />
                </p>

                <p>
                  <MigasLink
                    model="users"
                    :pk="computer.sync_user.id"
                    :value="computer.sync_user.__str__"
                  />
                </p>

                <OverflowList
                  model="attributes"
                  :label="$gettext('Attributes')"
                  :items="onlyAttributes"
                />

                <OverflowList
                  model="tags"
                  :label="$gettext('Tags')"
                  :items="onlyTags"
                />

                <OverflowList
                  model="attribute-sets"
                  :label="$gettext('Attribute Sets')"
                  :items="onlyAttributeSets"
                />

                <OverflowList
                  model="domains"
                  :label="$gettext('Domains')"
                  :items="onlyDomains"
                />
              </template>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-md">
          <q-card>
            <q-card-section>
              <div v-translate class="text-h5">Output (from server)</div>
            </q-card-section>

            <q-card-section>
              <p v-if="loading.output" class="justify-center">
                <q-spinner-dots color="primary" size="3em" />
              </p>
              <template v-else>
                <OverflowList
                  :label="$gettext('Fault Definitions')"
                  :items="simulation.fault_definitions"
                  model="fault-definitions"
                />

                <OverflowList
                  :label="$gettext('Deployments')"
                  :items="simulation.deployments"
                  model="deployments"
                />

                <q-list v-if="simulation.packages.install.length > 0" bordered>
                  <q-expansion-item default-opened :content-inset-level="0.5">
                    <template #header>
                      <q-item-section avatar>
                        <q-icon name="mdi-package-down" size="md" />
                      </q-item-section>

                      <q-item-section>
                        <translate>Packages to Install</translate>
                      </q-item-section>

                      <q-item-section side>
                        <q-btn
                          flat
                          icon="mdi-content-copy"
                          color="primary"
                          @click.stop="copyContent(simulation.packages.install)"
                        />
                      </q-item-section>
                    </template>

                    <q-list class="overflow">
                      <q-item
                        v-for="(item, index) in simulation.packages.install"
                        :key="index"
                      >
                        <q-item-section>
                          {{ item.package }}
                        </q-item-section>

                        <q-item-section avatar>
                          <MigasLink
                            model="deployments"
                            :pk="item.id"
                            :value="item.name"
                          />
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-expansion-item>
                </q-list>

                <q-list v-if="simulation.policies.install.length > 0" bordered>
                  <q-expansion-item default-opened :content-inset-level="0.5">
                    <template #header>
                      <q-item-section avatar>
                        <q-icon name="mdi-package-down" size="md" />
                      </q-item-section>

                      <q-item-section>
                        <translate>Packages to Install (by policies)</translate>
                      </q-item-section>

                      <q-item-section side>
                        <q-btn
                          flat
                          icon="mdi-content-copy"
                          color="primary"
                          @click.stop="copyContent(simulation.policies.install)"
                        />
                      </q-item-section>
                    </template>

                    <q-list class="overflow">
                      <q-item
                        v-for="(item, index) in simulation.policies.install"
                        :key="index"
                      >
                        <q-item-section>
                          {{ item.package }}
                        </q-item-section>

                        <q-item-section avatar>
                          <MigasLink
                            model="policies"
                            :pk="item.id"
                            :value="item.name"
                          />
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-expansion-item>
                </q-list>

                <q-list v-if="simulation.packages.remove.length > 0" bordered>
                  <q-expansion-item default-opened :content-inset-level="0.5">
                    <template #header>
                      <q-item-section avatar>
                        <q-icon name="mdi-package-up" size="md" />
                      </q-item-section>

                      <q-item-section>
                        <translate>Packages to Uninstall</translate>
                      </q-item-section>

                      <q-item-section side>
                        <q-btn
                          flat
                          icon="mdi-content-copy"
                          color="primary"
                          @click.stop="copyContent(simulation.packages.remove)"
                        />
                      </q-item-section>
                    </template>

                    <q-list class="overflow">
                      <q-item
                        v-for="(item, index) in simulation.packages.remove"
                        :key="index"
                      >
                        <q-item-section>
                          {{ item.package }}
                        </q-item-section>

                        <q-item-section avatar>
                          <MigasLink
                            model="deployments"
                            :pk="item.id"
                            :value="item.name"
                          />
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-expansion-item>
                </q-list>

                <q-list v-if="simulation.policies.remove.length > 0" bordered>
                  <q-expansion-item default-opened :content-inset-level="0.5">
                    <template #header>
                      <q-item-section avatar>
                        <q-icon name="mdi-package-up" size="md" />
                      </q-item-section>

                      <q-item-section>
                        <translate
                          >Packages to Uninstall (by policies)</translate
                        >
                      </q-item-section>

                      <q-item-section side>
                        <q-btn
                          flat
                          icon="mdi-content-copy"
                          color="primary"
                          @click.stop="copyContent(simulation.policies.remove)"
                        />
                      </q-item-section>
                    </template>

                    <q-list class="overflow">
                      <q-item
                        v-for="(item, index) in simulation.policies.remove"
                        :key="index"
                      >
                        <q-item-section>
                          {{ item.package }}
                        </q-item-section>

                        <q-item-section avatar>
                          <MigasLink
                            model="policies"
                            :pk="item.id"
                            :value="item.name"
                          />
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-expansion-item>
                </q-list>

                <OverflowList
                  model="devices/logical"
                  :label="$gettext('Devices')"
                  :items="simulation.logical_devices"
                />

                <p>
                  <translate>Capture Hardware</translate>:
                  <q-chip
                    :color="
                      simulation.capture_hardware ? 'positive' : 'negative'
                    "
                    text-color="white"
                    >{{
                      simulation.capture_hardware
                        ? $gettext('Yes')
                        : $gettext('No')
                    }}</q-chip
                  >
                </p>
              </template>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useMeta, copyToClipboard } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import OverflowList from 'components/ui/OverflowList'
import MigasLink from 'components/MigasLink'

import { modelIcon, useElement } from 'composables/element'
import useDate from 'composables/date'

export default {
  components: { Breadcrumbs, Header, OverflowList, MigasLink },
  setup() {
    const { $gettext } = useGettext()
    const route = useRoute()
    const { elementIcon, productIcon, attributeValue } = useElement()
    const { showDate } = useDate()
    const uiStore = useUiStore()

    const title = ref($gettext('Simulate Synchronization'))
    useMeta({ title: title.value })

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        to: 'home',
        icon: 'mdi-home',
      },
      {
        text: $gettext('Data'),
        icon: 'mdi-database-search',
      },
      {
        text: $gettext('Computers'),
        icon: modelIcon('computers'),
        to: 'computers-dashboard',
      },
      {
        text: $gettext('Results'),
        to: 'computers-list',
      },
      {
        text: 'Id',
        to: { name: 'computer-detail', params: { id: 0 } },
      },
      {
        text: title.value,
      },
    ])

    const computer = reactive({})
    const platform = reactive({})
    const onlyAttributes = ref([])
    const onlyAttributeSets = ref([])
    const onlyDomains = ref([])
    const onlyTags = ref([])
    const simulation = reactive({})
    const loading = reactive({
      input: false,
      output: false,
    })

    const loadProject = async () => {
      await api
        .get(`/api/v1/token/projects/${computer.project.id}/`)
        .then((response) => {
          Object.assign(platform, response.data.platform)
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    }

    const loadSyncInfo = async () => {
      loading.input = true
      await api
        .get(`/api/v1/token/computers/${computer.id}/sync/`)
        .then((response) => {
          Object.entries(response.data.sync_attributes).map(([key, val]) => {
            if (val.property_att.prefix === 'SET') {
              api
                .get(`/api/v1/token/attributes/${val.id}/badge/`)
                .then((response) => {
                  onlyAttributeSets.value.push({
                    id: response.data.pk,
                    icon: modelIcon('attribute-sets'),
                    value: attributeValue(val),
                    summary: response.data.summary,
                  })
                })
                .catch((error) => {
                  uiStore.notifyError(error)
                })
            } else if (val.property_att.prefix === 'DMN') {
              api
                .get(`/api/v1/token/attributes/${val.id}/badge/`)
                .then((response) => {
                  onlyDomains.value.push({
                    id: response.data.pk,
                    icon: modelIcon('domains'),
                    value: attributeValue(val),
                    summary: response.data.summary,
                  })
                })
                .catch((error) => {
                  uiStore.notifyError(error)
                })
            } else {
              onlyAttributes.value.push({
                id: val.id,
                value: attributeValue(val),
                icon:
                  val.property_att.sort === 'server'
                    ? modelIcon('tags')
                    : modelIcon('attributes'),
              })
            }
          })
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
        .finally(() => {
          loading.input = false
        })
    }

    const loadSimulation = async () => {
      loading.output = true
      await api
        .get(`/api/v1/token/computers/${computer.id}/sync/simulation/`)
        .then((response) => {
          Object.assign(simulation, response.data)
          if ('logical_devices' in simulation)
            Object.entries(simulation.logical_devices).map(([key, item]) => {
              item.icon = modelIcon('devices/logical')
            })

          if ('fault_definitions' in simulation)
            Object.entries(simulation.fault_definitions).map(([key, item]) => {
              item.icon = modelIcon('fault-definitions')
            })

          if ('deployments' in simulation)
            Object.entries(simulation.deployments).map(([key, item]) => {
              item.icon = modelIcon('deployments')
            })
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
        .finally(() => {
          loading.output = false
        })
    }

    const copyContent = (items) => {
      const content = items.map((item) => item.package)

      copyToClipboard(content.join('\n')).then(() => {
        uiStore.notifySuccess($gettext('Content copied to clipboard'))
      })
    }

    onMounted(async () => {
      await api
        .get(`/api/v1/token/computers/${route.params.id}/`)
        .then((response) => {
          Object.assign(computer, response.data)
          breadcrumbs.find((x) => x.text === 'Id').to.params.id = computer.id
          breadcrumbs.find((x) => x.text === 'Id').text = computer.__str__
          useMeta({ title: `${title.value}: ${computer.__str__}` })
          loadProject()
          loadSyncInfo()
          loadSimulation()

          Object.entries(response.data.tags).map(([key, val]) => {
            onlyTags.value.push({
              id: val.id,
              icon: modelIcon('tags'),
              value: attributeValue(val),
            })
          })
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    })

    return {
      title,
      breadcrumbs,
      computer,
      platform,
      onlyAttributes,
      onlyAttributeSets,
      onlyDomains,
      onlyTags,
      simulation,
      loading,
      copyContent,
      elementIcon,
      productIcon,
      attributeValue,
      showDate,
    }
  },
}
</script>
