<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <template v-if="computer.id">
      <Header
        :title="$gettext('Simulate Synchronization')"
        :icon="titleIcon"
        :has-export-button="false"
      >
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
        <div class="col">
          <q-card>
            <q-card-section>
              <div class="text-h5 q-pb-md">
                {{ $gettext('Input (from computer)') }}
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
                    <q-tooltip>{{ $gettext('UUID') }}</q-tooltip>
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

        <div class="col">
          <q-card>
            <q-card-section>
              <div class="text-h5 q-pb-md">
                {{ $gettext('Output (from server)') }}
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
                          <q-icon :name="appIcon('install')" size="md" />
                        </q-item-section>

                        <q-item-section>
                          <q-chip>
                            <q-avatar color="info" text-color="black">{{
                              simulation.packages.install.length
                            }}</q-avatar>
                            {{ $gettext('Packages to Install') }}
                          </q-chip>
                        </q-item-section>

                        <q-item-section side>
                          <q-btn
                            flat
                            :icon="appIcon('copy')"
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
                          <q-icon :name="appIcon('install')" size="md" />
                        </q-item-section>

                        <q-item-section>
                          <q-chip>
                            <q-avatar color="info" text-color="black">{{
                              simulation.policies.install.length
                            }}</q-avatar>
                            {{ $gettext('Packages to Install (by policies)') }}
                          </q-chip>
                        </q-item-section>

                        <q-item-section side>
                          <q-btn
                            flat
                            :icon="appIcon('copy')"
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
                          <q-icon :name="appIcon('uninstall')" size="md" />
                        </q-item-section>

                        <q-item-section>
                          <q-chip>
                            <q-avatar color="info" text-color="black">{{
                              simulation.packages.remove.length
                            }}</q-avatar>
                            {{ $gettext('Packages to Uninstall') }}
                          </q-chip>
                        </q-item-section>

                        <q-item-section side>
                          <q-btn
                            flat
                            :icon="appIcon('copy')"
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
                          <q-icon :name="appIcon('uninstall')" size="md" />
                        </q-item-section>

                        <q-item-section>
                          <q-chip>
                            <q-avatar color="info" text-color="black">{{
                              simulation.policies.remove.length
                            }}</q-avatar>
                            {{
                              $gettext('Packages to Uninstall (by policies)')
                            }}
                          </q-chip>
                        </q-item-section>

                        <q-item-section side>
                          <q-btn
                            flat
                            :icon="appIcon('copy')"
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
                  <span class="vertical-middle"
                    >{{ $gettext('Capture Hardware') }}:</span
                  >
                  <q-chip
                    class="vertical-middle"
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
import { ref, reactive, computed, onMounted } from 'vue'
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

    const computer = reactive({})
    const titleIcon = appIcon('simulate')
    const title = computed(() =>
      computer?.__str__
        ? `${$gettext('Simulate Synchronization')}: ${computer.__str__}`
        : $gettext('Simulate Synchronization'),
    )
    useMeta(() => ({ title: title.value }))

    const breadcrumbs = ref([
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
        text: $gettext('Simulate Synchronization'),
        icon: titleIcon,
      },
    ])

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
      try {
        const { data } = await api.get(
          `/api/v1/token/projects/${computer.project.id}/`,
        )
        Object.assign(platform, data.platform)
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    const loadSyncInfo = async () => {
      loading.input = true
      try {
        const response = await api.get(
          `/api/v1/token/computers/${computer.id}/sync/`,
        )

        const fetchBadge = async (val, type) => {
          const { data } = await api.get(
            `/api/v1/token/attributes/${val.id}/badge/`,
          )

          return {
            id: data.pk,
            icon: modelIcon(type),
            value: attributeValue(val),
            summary: data.summary,
          }
        }

        const badgePromises = []
        for (const [, val] of Object.entries(response.data.sync_attributes)) {
          if (val.property_att.prefix === 'SET') {
            badgePromises.push(
              fetchBadge(val, 'attribute-sets').then((obj) =>
                onlyAttributeSets.value.push(obj),
              ),
            )
          } else if (val.property_att.prefix === 'DMN') {
            badgePromises.push(
              fetchBadge(val, 'domains').then((obj) =>
                onlyDomains.value.push(obj),
              ),
            )
          } else {
            onlyAttributes.value.push({
              id: val.id,
              value: attributeValue(val),
              model: val.property_att.sort === 'server' ? 'tags' : 'features',
              icon:
                val.property_att.sort === 'server'
                  ? modelIcon('tags')
                  : modelIcon('attributes'),
              summary: val.description,
            })
          }
        }

        await Promise.all(badgePromises)
      } catch (error) {
        uiStore.notifyError(error)
      } finally {
        loading.input = false
      }
    }

    const loadSimulation = async () => {
      loading.output = true
      try {
        const { data } = await api.get(
          `/api/v1/token/computers/${computer.id}/sync/simulation/`,
        )
        Object.assign(simulation, data)

        const sortByPackage = (arr) =>
          arr?.sort((a, b) => a.package.localeCompare(b.package))

        const assignIcon = (obj, iconName) =>
          Object.values(obj).forEach((item) => {
            item.icon = modelIcon(iconName)
          })

        ;['packages', 'policies'].forEach((section) => {
          if (simulation[section]) {
            ;['install', 'remove'].forEach((action) => {
              if (simulation[section][action]) {
                sortByPackage(simulation[section][action])
              }
            })
          }
        })

        const iconMap = {
          logical_devices: 'devices/logical',
          fault_definitions: 'fault-definitions',
          deployments: 'deployments',
        }
        Object.entries(iconMap).forEach(([key, iconName]) => {
          if (simulation[key]) assignIcon(simulation[key], iconName)
        })
      } catch (error) {
        uiStore.notifyError(error)
      } finally {
        loading.output = false
      }
    }

    const copyContent = (items) => {
      const content = items.map((item) => item.package)

      contentToClipboard(content.join('\n'))
    }

    onMounted(async () => {
      try {
        const { data } = await api.get(
          `/api/v1/token/computers/${route.params.id}/`,
        )

        Object.assign(computer, data)

        const breadcrumb = breadcrumbs.value.find((x) => x.text === 'Id')
        if (breadcrumb) {
          breadcrumb.to.params.id = computer.id
          breadcrumb.icon = elementIcon(computer.status)
          breadcrumb.text = computer.__str__
        }

        loadProject()
        loadSyncInfo()
        loadSimulation()

        Object.entries(data.tags).forEach(([, val]) => {
          onlyTags.value.push({
            id: val.id,
            icon: modelIcon('tags'),
            value: attributeValue(val),
          })
        })
      } catch (error) {
        uiStore.notifyError(error)
      }
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
