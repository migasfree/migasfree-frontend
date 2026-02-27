<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <template v-if="computer.id">
      <Header
        :title="$gettext('Simulate Synchronization')"
        :icon="titleIcon"
        :has-export-button="false"
      >
        <template #append>
          <MigasLink
            model="computers"
            :pk="computer.id"
            :value="computer.__str__ || ''"
            :icon="elementIcon(computer.status)"
            variant="glass"
          />
        </template>
      </Header>

      <div class="row q-col-gutter-lg q-pt-md">
        <!-- Input Panel -->
        <div class="col-12 col-md-4">
          <q-card class="panel full-height">
            <q-card-section>
              <div class="text-h6 text-primary q-mb-lg flex items-center">
                <q-icon
                  name="mdi-laptop"
                  size="sm"
                  class="q-mr-sm opacity-70"
                />
                {{ $gettext('Input (from computer)') }}
              </div>

              <div v-if="loading.input" class="flex flex-center q-pa-xl">
                <q-spinner-dots color="primary" size="3em" />
              </div>

              <div v-else class="column gap-md">
                <!-- System Info Group -->
                <div class="data-panel solid-panel q-pa-md">
                  <div class="row items-center q-mb-sm">
                    <q-icon
                      name="mdi-clock-outline"
                      size="xs"
                      color="grey-7"
                      class="q-mr-xs"
                    />
                    <span class="text-caption text-grey-7">{{
                      showDate(new Date(Date.now()))
                    }}</span>
                  </div>

                  <div class="column gap-sm">
                    <div class="flex items-center no-wrap">
                      <q-icon
                        name="mdi-card-account-details-outline"
                        size="sm"
                        class="q-mr-sm text-primary opacity-80"
                      />
                      <div class="ellipsis">
                        <span class="text-weight-medium text-body2">{{
                          computer.uuid
                        }}</span>
                        <q-tooltip class="glass-tooltip">{{
                          $gettext('UUID')
                        }}</q-tooltip>
                      </div>
                    </div>

                    <div v-if="platform.id" class="flex items-center no-wrap">
                      <MigasLink
                        model="platforms"
                        :pk="platform.id"
                        :value="platform.name"
                        dense
                        :tooltip="$gettext('Platform')"
                      />
                    </div>

                    <div class="flex items-center no-wrap">
                      <MigasLink
                        model="projects"
                        :pk="computer.project.id"
                        :value="computer.project.name"
                        dense
                        :tooltip="$gettext('Project')"
                      />
                    </div>

                    <div class="flex items-center no-wrap">
                      <MigasLink
                        model="users"
                        :pk="computer.sync_user.id"
                        :value="computer.sync_user.__str__"
                        dense
                        :tooltip="$gettext('User')"
                      />
                    </div>
                  </div>
                </div>

                <!-- Attributes & Groups -->
                <div class="column gap-sm">
                  <OverflowList
                    v-if="onlyAttributes.length > 0"
                    model="attributes"
                    :label="$gettext('Attributes')"
                    :items="onlyAttributes"
                    class="bg-surface-soft q-pa-sm rounded-borders"
                  />

                  <OverflowList
                    v-if="onlyTags.length > 0"
                    model="tags"
                    :label="$gettext('Tags')"
                    :items="onlyTags"
                    class="bg-surface-soft q-pa-sm rounded-borders"
                  />

                  <OverflowList
                    v-if="onlyAttributeSets.length > 0"
                    model="attribute-sets"
                    :label="$gettext('Attribute Sets')"
                    :items="onlyAttributeSets"
                    class="bg-surface-soft q-pa-sm rounded-borders"
                  />

                  <OverflowList
                    v-if="onlyDomains.length > 0"
                    model="domains"
                    :label="$gettext('Domains')"
                    :items="onlyDomains"
                    class="bg-surface-soft q-pa-sm rounded-borders"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Output Panel -->
        <div class="col-12 col-md-8">
          <q-card class="panel full-height">
            <q-card-section>
              <div class="text-h6 text-primary q-mb-lg flex items-center">
                <q-icon
                  name="mdi-server-network"
                  size="sm"
                  class="q-mr-sm opacity-70"
                />
                {{ $gettext('Output (from server)') }}
              </div>

              <div v-if="loading.output" class="flex flex-center q-pa-xl">
                <q-spinner-dots color="primary" size="3em" />
              </div>

              <div v-else class="column gap-md">
                <!-- Summary Section -->
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6">
                    <OverflowList
                      model="fault-definitions"
                      :label="$gettext('Fault Definitions')"
                      :items="simulation.fault_definitions"
                      class="bg-surface-soft q-pa-sm rounded-borders full-height"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <OverflowList
                      model="deployments"
                      :label="$gettext('Deployments')"
                      :items="simulation.deployments"
                      class="bg-surface-soft q-pa-sm rounded-borders full-height"
                    />
                  </div>
                </div>

                <!-- Package Operations -->
                <div class="column gap-md">
                  <!-- Install Group -->
                  <div
                    v-if="
                      simulation.packages?.install?.length > 0 ||
                      simulation.policies?.install?.length > 0
                    "
                    class="data-panel solid-panel q-pa-none overflow-hidden"
                  >
                    <div
                      class="bg-info-surface q-pa-md flex items-center justify-between"
                    >
                      <div class="flex items-center gap-sm">
                        <q-icon :name="appIcon('install')" size="sm" />
                        <span class="text-subtitle2 text-weight-bold">{{
                          $gettext('Operations: Install')
                        }}</span>
                      </div>
                    </div>

                    <div class="q-pa-md column gap-md">
                      <!-- Direct Packages -->
                      <q-list
                        v-if="simulation.packages.install.length > 0"
                        dense
                        padding
                        class="rounded-borders no-border"
                      >
                        <q-item-label header class="text-weight-medium">{{
                          $gettext('Direct Packages')
                        }}</q-item-label>
                        <q-item
                          v-for="(item, index) in simulation.packages.install"
                          :key="`pkg-ins-${index}`"
                          class="q-py-xs"
                        >
                          <q-item-section avatar>
                            <q-icon
                              name="mdi-package-variant-closed"
                              color="grey-7"
                              size="xs"
                            />
                          </q-item-section>
                          <q-item-section>
                            <span class="text-body2 mono-font">{{
                              item.package
                            }}</span>
                          </q-item-section>
                          <q-item-section side>
                            <MigasLink
                              model="deployments"
                              :pk="item.id"
                              :value="item.name"
                              dense
                            />
                          </q-item-section>
                        </q-item>
                      </q-list>

                      <!-- Policy Packages -->
                      <q-list
                        v-if="simulation.policies.install.length > 0"
                        dense
                        padding
                        class="rounded-borders no-border border-top"
                      >
                        <q-item-label header class="text-weight-medium">{{
                          $gettext('From Policies')
                        }}</q-item-label>
                        <q-item
                          v-for="(item, index) in simulation.policies.install"
                          :key="`pol-ins-${index}`"
                          class="q-py-xs"
                        >
                          <q-item-section avatar>
                            <q-icon
                              name="mdi-package-variant"
                              color="grey-7"
                              size="xs"
                            />
                          </q-item-section>
                          <q-item-section>
                            <span class="text-body2 mono-font">{{
                              item.package
                            }}</span>
                          </q-item-section>
                          <q-item-section side>
                            <MigasLink
                              model="catalog/policies"
                              :pk="item.id"
                              :value="item.name"
                              dense
                            />
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </div>
                  </div>

                  <!-- Remove Group -->
                  <div
                    v-if="
                      simulation.packages?.remove?.length > 0 ||
                      simulation.policies?.remove?.length > 0
                    "
                    class="data-panel solid-panel q-pa-none overflow-hidden"
                  >
                    <div
                      class="bg-negative-surface q-pa-md flex items-center justify-between"
                    >
                      <div class="flex items-center gap-sm text-negative">
                        <q-icon :name="appIcon('uninstall')" size="sm" />
                        <span class="text-subtitle2 text-weight-bold">{{
                          $gettext('Operations: Uninstall')
                        }}</span>
                      </div>
                    </div>

                    <div class="q-pa-md column gap-md">
                      <q-list
                        v-if="simulation.packages.remove.length > 0"
                        dense
                        padding
                      >
                        <q-item
                          v-for="(item, index) in simulation.packages.remove"
                          :key="`pkg-rem-${index}`"
                          class="q-py-xs"
                        >
                          <q-item-section avatar>
                            <q-icon
                              name="mdi-package-variant-remove"
                              color="grey-7"
                              size="xs"
                            />
                          </q-item-section>
                          <q-item-section>
                            <span class="text-body2 mono-font">{{
                              item.package
                            }}</span>
                          </q-item-section>
                          <q-item-section side>
                            <MigasLink
                              model="deployments"
                              :pk="item.id"
                              :value="item.name"
                              dense
                            />
                          </q-item-section>
                        </q-item>
                      </q-list>

                      <q-list
                        v-if="simulation.policies.remove.length > 0"
                        dense
                        padding
                        class="border-top"
                      >
                        <q-item
                          v-for="(item, index) in simulation.policies.remove"
                          :key="`pol-rem-${index}`"
                          class="q-py-xs"
                        >
                          <q-item-section avatar>
                            <q-icon
                              name="mdi-package-variant-remove"
                              color="grey-7"
                              size="xs"
                            />
                          </q-item-section>
                          <q-item-section>
                            <span class="text-body2 mono-font">{{
                              item.package
                            }}</span>
                          </q-item-section>
                          <q-item-section side>
                            <MigasLink
                              model="catalog/policies"
                              :pk="item.id"
                              :value="item.name"
                              dense
                            />
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </div>
                  </div>
                </div>

                <!-- Footer Stats -->
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6">
                    <OverflowList
                      model="devices/logical"
                      :label="$gettext('Logical Devices')"
                      :items="simulation.logical_devices"
                      class="bg-surface-soft q-pa-sm rounded-borders"
                    />
                  </div>
                  <div class="col-12 col-sm-6 flex items-center">
                    <div
                      class="data-panel solid-panel q-pa-md full-width flex items-center justify-between"
                    >
                      <span class="text-weight-medium">{{
                        $gettext('Capture Hardware')
                      }}</span>
                      <q-chip
                        :color="
                          simulation.capture_hardware ? 'positive' : 'negative'
                        "
                        text-color="white"
                        size="md"
                        class="text-weight-bold"
                      >
                        {{
                          simulation.capture_hardware
                            ? $gettext('Yes')
                            : $gettext('No')
                        }}
                      </q-chip>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup>
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
import useDate from 'composables/date'

const { $gettext } = useGettext()
const route = useRoute()
const { elementIcon, attributeValue } = useElement()
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
          fetchBadge(val, 'domains').then((obj) => onlyDomains.value.push(obj)),
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
</script>

<style scoped>
.mono-font {
  font-family: var(--font-mono);
  font-size: 0.8rem;
}

.gap-sm {
  gap: 8px;
}
.gap-md {
  gap: 16px;
}

.border-top {
  border-top: 1px solid rgba(var(--brand-primary-rgb), 0.1);
}

.bg-surface-soft {
  background: rgba(var(--brand-primary-rgb), 0.03);
}

.bg-info-surface {
  background: var(--info-surface);
}

.bg-negative-surface {
  background: var(--critical-surface);
}
</style>
