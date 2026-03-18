<template>
  <q-page padding>
    <ItemDetail
      :key="$route.fullPath"
      :breadcrumbs="breadcrumbs"
      :original-title="title"
      :model="model"
      :routes="routes"
      :element="element"
      :element-data="elementData"
      :is-valid="isValid"
      :borderless="true"
      @load-related="loadRelated"
      @update-related="updateRelated"
      @reset-element="resetElement"
      @set-title="setTitle"
    >
      <template #actions>
        <q-btn
          v-if="element.source === 'I'"
          class="q-ma-sm"
          :aria-label="$gettext('Regenerate Metadata')"
          color="primary"
          :icon="appIcon('regenerate')"
          @click="regenerateMetadata(element.id)"
          ><q-tooltip>{{ $gettext('Regenerate Metadata') }}</q-tooltip></q-btn
        >
      </template>

      <template #fields>
        <div class="row q-pb-md q-col-gutter-md">
          <div class="col-6 col-md col-sm-12">
            <DeploymentInfo
              :element="element"
              :projects="projects"
              :domains="domains"
              @update-element="updateElement"
            />
          </div>

          <div class="col-6 col-md col-sm-12">
            <DeploymentAttributes
              :element="element"
              @update-element="updateElement"
            />
          </div>
        </div>

        <div class="row q-pb-md q-col-gutter-md">
          <div class="col-6 col-md col-sm-12">
            <DeploymentPackages
              :element="element"
              @update-element="updateElement"
            />
          </div>

          <div class="col-6 col-md col-sm-12">
            <DeploymentActions
              :element="element"
              @update-element="updateElement"
            />
          </div>
        </div>

        <div class="row q-pb-md q-col-gutter-md">
          <div class="col-12 col-md-12 col-sm-12">
            <DeploymentSchedule
              :element="element"
              :schedules="schedules"
              @update-element="updateElement"
              @update-schedule="updateSchedule"
            />
          </div>
        </div>
      </template>
    </ItemDetail>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import ItemDetail from 'components/ui/ItemDetail'

import DeploymentInfo from 'components/deployment/Info'
import DeploymentAttributes from 'components/deployment/Attributes'
import DeploymentPackages from 'components/deployment/Packages'
import DeploymentActions from 'components/deployment/Actions'
import DeploymentSchedule from 'components/deployment/Schedule'

import useDate from 'composables/date'
const { $gettext } = useGettext()
const { showDate } = useDate()
const route = useRoute()
const uiStore = useUiStore()

const title = ref($gettext('Deployment'))
const windowTitle = ref(title.value)
useMeta(() => ({ title: windowTitle.value }))

const routes = {
  list: 'deployments-list',
  add: 'deployment-add',
  detail: 'deployment-detail',
}
const model = 'deployments'

const element = reactive({
  id: 0,
  enabled: true,
  included_attributes: [],
  excluded_attributes: [],
  packages_to_install: null,
  packages_to_remove: null,
  default_preincluded_packages: null,
  default_included_packages: null,
  default_excluded_packages: null,
  auto_restart: false,
  expire: 1440,
  frozen: false,
  start_date: showDate(new Date(), 'YYYY-MM-DD'),
})

const breadcrumbs = ref([
  {
    text: $gettext('Dashboard'),
    icon: 'mdi-home',
    to: 'home',
  },
  {
    text: $gettext('Release'),
    icon: 'mdi-rocket-launch',
  },
  {
    text: $gettext('Deployments'),
    icon: 'mdi-rocket-launch',
    to: 'deployments-dashboard',
  },
])

const projects = ref([])
const domains = ref([])
const schedules = ref([])

const updateElement = (key, value) => {
  element[key] = value
}

const isValid = computed(() => {
  return (
    element.name !== undefined &&
    element.name.trim() !== '' &&
    element.project !== undefined &&
    element.start_date !== undefined
  )
})

const updateSchedule = async () => {
  if (!element.id) return

  try {
    const timelineReponse = await api.get(
      `/api/v1/token/stats/deployments/${element.id}/timeline/`,
    )

    element.timeline = timelineReponse.data

    if (!element.schedule) return

    const delaysResponse = await api.get(
      `/api/v1/token/stats/deployments/${element.id}/computers/delay/`,
    )

    const buildSeries = (data) => {
      const series = []
      Object.entries(data).forEach(([key, val]) => {
        series.push({
          type: 'line',
          smooth: true,
          name: key,
          data: val,
        })
      })
      return series
    }

    const series = buildSeries(delaysResponse.data.data)

    const today = showDate(new Date(), 'YYYY-MM-DD')
    const madeValue =
      element.timeline.computers.error + element.timeline.computers.ok

    series.push({
      type: 'line',
      name: $gettext('Made'),
      markPoint: {
        data: [
          {
            coord: [today, madeValue],
            label: { show: true },
            value: madeValue,
          },
        ],
      },
    })

    element.stats = {
      xData: delaysResponse.data.x_labels,
      series,
    }
  } catch (error) {
    uiStore.notifyError(error)
  }
}

const loadRelated = async () => {
  try {
    const [projectsResponse, domainsResponse, schedulesResponse] =
      await Promise.all([
        api.get('/api/v1/token/projects/'),
        api.get('/api/v1/token/domains/'),
        api.get('/api/v1/token/schedules/'),
      ])

    projects.value = projectsResponse.data.results

    domains.value = Object.values(domainsResponse.data.results).map((item) => ({
      id: item.id,
      name: item.name,
    }))

    schedules.value = Object.values(schedulesResponse.data.results).map(
      (item) => ({
        id: item.id,
        name: item.name,
      }),
    )

    if (route.query.project)
      element.project =
        projects.value.find(
          (item) => item.id === Number(route.query.project),
        ) || null

    if (route.query.domain)
      element.domain =
        domains.value.find((item) => item.id === Number(route.query.domain)) ||
        null

    if (route.query.schedule)
      element.schedule =
        schedules.value.find(
          (item) => item.id === Number(route.query.schedule),
        ) || null
  } catch (error) {
    uiStore.notifyError(error)
  }

  if (element.id) {
    element.packages_to_install = element.packages_to_install.join('\n')
    element.packages_to_remove = element.packages_to_remove.join('\n')
    element.default_preincluded_packages =
      element.default_preincluded_packages.join('\n')
    element.default_included_packages =
      element.default_included_packages.join('\n')
    element.default_excluded_packages =
      element.default_excluded_packages.join('\n')

    if (element.available_packages) {
      element.available_packages.sort((a, b) =>
        a.fullname > b.fullname ? 1 : b.fullname > a.fullname ? -1 : 0,
      )
    }
    if (element.available_package_sets) {
      element.available_package_sets.sort((a, b) =>
        a.name > b.name ? 1 : b.name > a.name ? -1 : 0,
      )
    }
  }

  updateSchedule()
}

const elementData = () => {
  const data = {
    enabled: element.enabled,
    name: element.name,
    project: element.project ? element.project.id : null,
    domain: element.domain ? element.domain.id : null,
    comment: element.comment,
    source: element.source,
    included_attributes: element.included_attributes.map((item) => item.id),
    excluded_attributes: element.excluded_attributes.map((item) => item.id),
    packages_to_install:
      element.packages_to_install !== null
        ? element.packages_to_install.split('\n')
        : [],
    packages_to_remove:
      element.packages_to_remove !== null
        ? element.packages_to_remove.split('\n')
        : [],
    default_preincluded_packages:
      element.default_preincluded_packages !== null
        ? element.default_preincluded_packages.split('\n')
        : [],
    default_included_packages:
      element.default_included_packages !== null
        ? element.default_included_packages.split('\n')
        : [],
    default_excluded_packages:
      element.default_excluded_packages !== null
        ? element.default_excluded_packages.split('\n')
        : [],
    start_date: showDate(element.start_date, 'YYYY-MM-DD'),
    schedule: element.schedule ? element.schedule.id : null,
    auto_restart: element.auto_restart,
  }

  if (element.source === 'I') {
    data.available_packages = element.available_packages
      ? element.available_packages.map((item) => item.id)
      : []
    data.available_package_sets = element.available_package_sets
      ? element.available_package_sets.map((item) => item.id)
      : []
  }

  if (element.source === 'E') {
    data.base_url = element.base_url
    data.suite = element.suite
    data.components = element.components
    data.options = element.options
    data.expire = element.expire
    data.frozen = element.frozen
  }

  return data
}

const updateRelated = async () => {
  await updateSchedule()
}

const resetElement = () => {
  Object.assign(element, {
    id: 0,
    name: undefined,
    enabled: true,
    project: null,
    domain: null,
    comment: '',
    source: undefined,
    included_attributes: [],
    excluded_attributes: [],
    packages_to_install: null,
    packages_to_remove: null,
    default_preincluded_packages: null,
    default_included_packages: null,
    default_excluded_packages: null,
    start_date: showDate(new Date(), 'YYYY-MM-DD'),
    schedule: null,
    auto_restart: false,
    available_packages: [],
    available_package_sets: [],
    base_url: undefined,
    suite: undefined,
    components: undefined,
    options: undefined,
    expire: undefined,
    frozen: false,
    timeline: { computers: {}, schedule: null },
  })
}

const setTitle = (value) => {
  windowTitle.value = value
}

const regenerateMetadata = async (id) => {
  try {
    const { data } = await api.get(
      `/api/v1/token/${model}/internal-sources/${id}/metadata/`,
    )
    uiStore.notifySuccess(data.detail)
  } catch (error) {
    uiStore.notifyError(error)
  }
}
</script>
