<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <template v-if="computer.id">
      <Header :title="title" :icon="titleIcon" :has-export-button="false">
        <template v-if="computer.id" #append
          ><span class="vertical-middle">: </span>
          <MigasLink
            model="computers"
            :pk="computer.id"
            :value="computer.__str__ || ''"
            :icon="elementIcon(computer.status)"
          />
        </template>
      </Header>

      <div class="row q-py-md q-gutter-md">
        <div class="col-md">
          <q-card>
            <q-card-section>
              <div v-translate class="text-h5 q-pb-md">
                Input (from computer)
              </div>

              <p v-if="loading.input" class="items-center">
                <q-spinner-dots color="primary" size="3em" />
              </p>
              <template v-else>
                <p>
                  <q-icon
                    name="mdi-clock-outline"
                    size="sm"
                    class="vertical-middle q-mr-xs"
                  />
                  <span class="vertical-middle">
                    {{ showDate(new Date(Date.now())) }}</span
                  >
                </p>

                <p>
                  <q-icon
                    name="mdi-card-account-details-outline"
                    size="sm"
                    class="vertical-middle q-mr-xs"
                  />
                  <span class="vertical-middle">
                    {{ computer.uuid }}
                    <q-tooltip><translate>UUID</translate></q-tooltip>
                  </span>
                </p>

                <p v-if="platform.id">
                  <MigasLink
                    model="platforms"
                    :pk="platform.id"
                    :value="platform.name"
                    :tooltip="$gettext('Platform')"
                  />
                </p>

                <p>
                  <MigasLink
                    model="projects"
                    :pk="computer.project.id"
                    :value="computer.project.name"
                    :tooltip="$gettext('Project')"
                  />
                </p>

                <p>
                  <MigasLink
                    model="users"
                    :pk="computer.sync_user.id"
                    :value="computer.sync_user.__str__"
                    :tooltip="$gettext('User')"
                  />
                </p>

                <div class="row q-pb-sm">
                  <OverflowList
                    model="attributes"
                    class="col"
                    :label="$gettext('Attributes')"
                    :items="onlyAttributes"
                  />
                </div>

                <div class="row q-pb-sm">
                  <OverflowList
                    model="tags"
                    class="col"
                    :label="$gettext('Tags')"
                    :items="onlyTags"
                  />
                </div>

                <div class="row q-pb-sm">
                  <OverflowList
                    model="attribute-sets"
                    class="col"
                    :label="$gettext('Attribute Sets')"
                    :items="onlyAttributeSets"
                  />
                </div>

                <div class="row q-pb-sm">
                  <OverflowList
                    model="domains"
                    class="col"
                    :label="$gettext('Domains')"
                    :items="onlyDomains"
                  />
                </div>
              </template>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-md">
          <q-card>
            <q-card-section>
              <div v-translate class="text-h5 q-pb-md">
                Output (from server)
              </div>

              <p v-if="loading.output" class="justify-center">
                <q-spinner-dots color="primary" size="3em" />
              </p>
              <template v-else>
                <div class="row q-pb-sm">
                  <OverflowList
                    class="col"
                    :label="$gettext('Fault Definitions')"
                    :items="simulation.fault_definitions"
                    model="fault-definitions"
                  />
                </div>

                <div class="row q-pb-sm">
                  <OverflowList
                    class="col"
                    :label="$gettext('Deployments')"
                    :items="simulation.deployments"
                    model="deployments"
                  />
                </div>

                <div class="row q-pb-sm">
                  <q-list
                    v-if="simulation.packages.install.length > 0"
                    bordered
                    class="col"
                  >
                    <q-expansion-item default-opened :content-inset-level="0.5">
                      <template #header>
                        <q-item-section avatar>
                          <q-icon name="mdi-package-down" size="md" />
                        </q-item-section>

                        <q-item-section>
                          <q-chip>
                            <q-avatar color="info" text-color="black">{{
                              simulation.packages.install.length
                            }}</q-avatar>
                            <translate>Packages to Install</translate>
                          </q-chip>
                        </q-item-section>

                        <q-item-section side>
                          <q-btn
                            flat
                            icon="mdi-content-copy"
                            color="primary"
                            @click.stop="
                              copyContent(simulation.packages.install)
                            "
                            ><q-tooltip>{{
                              $gettext('Copy')
                            }}</q-tooltip></q-btn
                          >
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
                </div>

                <div class="row q-pb-sm">
                  <q-list
                    v-if="simulation.policies.install.length > 0"
                    bordered
                    class="col"
                  >
                    <q-expansion-item default-opened :content-inset-level="0.5">
                      <template #header>
                        <q-item-section avatar>
                          <q-icon name="mdi-package-down" size="md" />
                        </q-item-section>

                        <q-item-section>
                          <q-chip>
                            <q-avatar color="info" text-color="black">{{
                              simulation.policies.install.length
                            }}</q-avatar>
                            <translate
                              >Packages to Install (by policies)</translate
                            >
                          </q-chip>
                        </q-item-section>

                        <q-item-section side>
                          <q-btn
                            flat
                            icon="mdi-content-copy"
                            color="primary"
                            @click.stop="
                              copyContent(simulation.policies.install)
                            "
                            ><q-tooltip>{{
                              $gettext('Copy')
                            }}</q-tooltip></q-btn
                          >
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
                              model="catalog/policies"
                              :pk="item.id"
                              :value="item.name"
                            />
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-expansion-item>
                  </q-list>
                </div>

                <div class="row q-pb-sm">
                  <q-list
                    v-if="simulation.packages.remove.length > 0"
                    bordered
                    class="col"
                  >
                    <q-expansion-item default-opened :content-inset-level="0.5">
                      <template #header>
                        <q-item-section avatar>
                          <q-icon name="mdi-package-up" size="md" />
                        </q-item-section>

                        <q-item-section>
                          <q-chip>
                            <q-avatar color="info" text-color="black">{{
                              simulation.packages.remove.length
                            }}</q-avatar>
                            <translate>Packages to Uninstall</translate>
                          </q-chip>
                        </q-item-section>

                        <q-item-section side>
                          <q-btn
                            flat
                            icon="mdi-content-copy"
                            color="primary"
                            @click.stop="
                              copyContent(simulation.packages.remove)
                            "
                            ><q-tooltip>{{
                              $gettext('Copy')
                            }}</q-tooltip></q-btn
                          >
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
                </div>

                <div class="row q-pb-sm">
                  <q-list
                    v-if="simulation.policies.remove.length > 0"
                    bordered
                    class="col"
                  >
                    <q-expansion-item default-opened :content-inset-level="0.5">
                      <template #header>
                        <q-item-section avatar>
                          <q-icon name="mdi-package-up" size="md" />
                        </q-item-section>

                        <q-item-section>
                          <q-chip>
                            <q-avatar color="info" text-color="black">{{
                              simulation.policies.remove.length
                            }}</q-avatar>
                            <translate
                              >Packages to Uninstall (by policies)</translate
                            >
                          </q-chip>
                        </q-item-section>

                        <q-item-section side>
                          <q-btn
                            flat
                            icon="mdi-content-copy"
                            color="primary"
                            @click.stop="
                              copyContent(simulation.policies.remove)
                            "
                            ><q-tooltip>{{
                              $gettext('Copy')
                            }}</q-tooltip></q-btn
                          >
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
                              model="catalog/policies"
                              :pk="item.id"
                              :value="item.name"
                            />
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-expansion-item>
                  </q-list>
                </div>

                <div class="row q-pb-sm">
                  <OverflowList
                    class="col"
                    model="devices/logical"
                    :label="$gettext('Devices')"
                    :items="simulation.logical_devices"
                  />
                </div>

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
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import OverflowList from 'components/ui/OverflowList'
import MigasLink from 'components/MigasLink'

import { appIcon, modelIcon, useElement } from 'composables/element'
import useCopyPaste from 'composables/copyPaste'
import useDate from 'composables/date'

export default {
  components: { Breadcrumbs, Header, OverflowList, MigasLink },
  setup() {
    const { $gettext } = useGettext()
    const route = useRoute()
    const { elementIcon, productIcon, attributeValue } = useElement()
    const { contentToClipboard } = useCopyPaste()
    const { showDate } = useDate()
    const uiStore = useUiStore()

    const titleIcon = appIcon('simulate')
    const title = $gettext('Simulate Synchronization')
    useMeta({ title })

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Data'),
        icon: appIcon('data'),
      },
      {
        text: $gettext('Computers'),
        icon: modelIcon('computers'),
        to: 'computers-dashboard',
      },
      {
        text: $gettext('Results'),
        icon: appIcon('results'),
        to: 'computers-list',
      },
      {
        text: 'Id',
        to: { name: 'computer-detail', params: { id: 0 } },
      },
      {
        text: title,
        icon: titleIcon,
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

          if ('packages' in simulation && 'install' in simulation.packages)
            simulation.packages.install.sort((a, b) =>
              a.package.localeCompare(b.package),
            )

          if ('packages' in simulation && 'remove' in simulation.packages)
            simulation.packages.remove.sort((a, b) =>
              a.package.localeCompare(b.package),
            )

          if ('policies' in simulation && 'install' in simulation.policies)
            simulation.policies.install.sort((a, b) =>
              a.package.localeCompare(b.package),
            )

          if ('policies' in simulation && 'remove' in simulation.policies)
            simulation.policies.remove.sort((a, b) =>
              a.package.localeCompare(b.package),
            )

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

      contentToClipboard(content.join('\n'))
    }

    onMounted(async () => {
      await api
        .get(`/api/v1/token/computers/${route.params.id}/`)
        .then((response) => {
          Object.assign(computer, response.data)
          breadcrumbs.find((x) => x.text === 'Id').to.params.id = computer.id
          breadcrumbs.find((x) => x.text === 'Id').icon = elementIcon(
            computer.status,
          )
          breadcrumbs.find((x) => x.text === 'Id').text = computer.__str__
          useMeta({ title: `${title}: ${computer.__str__}` })
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
      titleIcon,
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
