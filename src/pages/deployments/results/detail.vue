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
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h5 q-pb-sm">{{ $gettext('General') }}</div>

                <div class="row q-gutter-md">
                  <div class="col-6 col-md col-sm">
                    <q-checkbox
                      v-model="element.enabled"
                      left-label
                      autofocus
                      :label="$gettext('Enabled?')"
                    />
                  </div>
                  <div class="col-6 col-md col-sm">
                    <q-input
                      v-model="element.name"
                      outlined
                      :label="$gettext('Name')"
                      lazy-rules
                      :rules="[(val) => !!val || $gettext('* Required')]"
                    />
                  </div>
                </div>

                <div class="row q-gutter-sm">
                  <div class="col-6 col-md col-sm">
                    <q-select
                      v-model="element.project"
                      outlined
                      :label="$gettext('Project')"
                      :options="projects"
                      option-value="id"
                      option-label="name"
                      lazy-rules
                      :rules="[(val) => !!val || $gettext('* Required')]"
                    >
                      <template #prepend>
                        <q-icon :name="modelIcon('projects')" />
                      </template>

                      <template #selected-item="scope">
                        <q-btn
                          no-caps
                          flat
                          color="primary"
                          :to="{
                            name: 'project-detail',
                            params: { id: scope.opt.id },
                          }"
                          :label="scope.opt.name"
                        />
                      </template>

                      <template #append>
                        <q-btn
                          round
                          dense
                          color="secondary"
                          :icon="appIcon('add')"
                          @click="$router.push({ name: 'project-add' })"
                          ><q-tooltip>{{
                            $gettext('Add Project')
                          }}</q-tooltip></q-btn
                        >
                      </template>
                    </q-select>
                  </div>

                  <div class="col-6 col-md col-sm">
                    <q-select
                      v-model="element.domain"
                      outlined
                      clearable
                      :label="$gettext('Editable by Domain Administrators')"
                      :options="domains"
                      option-value="id"
                      option-label="name"
                    >
                      <template #prepend>
                        <q-icon :name="modelIcon('domains')" />
                      </template>

                      <template #selected-item="scope">
                        <q-btn
                          no-caps
                          flat
                          color="primary"
                          :to="{
                            name: 'domain-detail',
                            params: { id: scope.opt.id },
                          }"
                          :label="scope.opt.name"
                        />
                      </template>

                      <template #append>
                        <q-btn
                          round
                          dense
                          color="secondary"
                          :icon="appIcon('add')"
                          @click="$router.push({ name: 'domain-add' })"
                          ><q-tooltip>{{
                            $gettext('Add Domain')
                          }}</q-tooltip></q-btn
                        >
                      </template>
                    </q-select>
                  </div>
                </div>

                <div class="row q-gutter-sm">
                  <div class="col-12 col-md col-sm">
                    <q-input
                      v-model="element.comment"
                      outlined
                      type="textarea"
                      :label="$gettext('Comment')"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-6 col-md col-sm-12">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h5 q-pb-sm">
                  {{ $gettext('To who (attributes)') }}
                </div>

                <div class="row q-pb-md">
                  <div class="col-12 col-md col-sm">
                    <SelectAttributes
                      v-model="element.included_attributes"
                      :label="$gettext('Included Attributes')"
                    />
                  </div>
                </div>

                <div class="row">
                  <div class="col-12 col-md col-sm">
                    <SelectAttributes
                      v-model="element.excluded_attributes"
                      :label="$gettext('Excluded Attributes')"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div class="row q-pb-md q-col-gutter-md">
          <div class="col-6 col-md col-sm-12">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h5 q-pb-sm">
                  {{ $gettext('What (packages)') }}
                </div>

                <div v-if="element.id === 0" class="row">
                  <div class="col-12 col-md col-sm">
                    <q-select
                      v-model="source"
                      outlined
                      class="q-my-md"
                      :label="$gettext('Source')"
                      :options="sources"
                      option-value="id"
                      option-label="name"
                      @update:model-value="element.source = source.id"
                    />
                  </div>
                </div>

                <template v-if="element.source === 'I'">
                  <div class="row q-pb-md">
                    <div class="col-12 col-md col-sm">
                      <FilteredMultiSelect
                        v-model="element.available_packages"
                        clearable
                        :label="$gettext('Available Packages')"
                        :fetch-options="filterPackages"
                      >
                        <template #option="{ scope }">
                          <q-item v-bind="scope.itemProps">
                            {{ scope.opt.fullname }}
                          </q-item>
                        </template>

                        <template #selected-item="{ scope }">
                          <q-chip
                            removable
                            dense
                            :tabindex="scope.tabindex"
                            class="q-ma-md"
                            @remove="scope.removeAtIndex(scope.index)"
                          >
                            <MigasLink
                              model="packages"
                              :pk="scope.opt.id"
                              :value="scope.opt.fullname"
                            />
                          </q-chip>
                        </template>
                      </FilteredMultiSelect>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-12 col-md col-sm">
                      <FilteredMultiSelect
                        v-model="element.available_package_sets"
                        clearable
                        :label="$gettext('Available Package Sets')"
                        :fetch-options="filterPackageSets"
                      >
                        <template #option="{ scope }">
                          <q-item v-bind="scope.itemProps">
                            {{ scope.opt.name }}
                          </q-item>
                        </template>

                        <template #selected-item="{ scope }">
                          <q-chip
                            removable
                            dense
                            :tabindex="scope.tabindex"
                            class="q-ma-md"
                            @remove="scope.removeAtIndex(scope.index)"
                          >
                            <MigasLink
                              model="package-sets"
                              :pk="scope.opt.id"
                              :value="scope.opt.name"
                            />
                          </q-chip>
                        </template>
                      </FilteredMultiSelect>
                    </div>
                  </div>
                </template>

                <template v-if="element.source === 'E'">
                  <div class="row">
                    <div class="col-12 col-md col-sm">
                      <q-input
                        v-model="element.base_url"
                        outlined
                        class="q-my-md"
                        :label="$gettext('Base URL')"
                      />
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-12 col-md col-sm">
                      <q-input
                        v-model="element.suite"
                        class="q-my-md"
                        outlined
                        :label="$gettext('Suite')"
                      />
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-12 col-md col-sm">
                      <q-input
                        v-model="element.components"
                        class="q-my-md"
                        outlined
                        :label="$gettext('Components')"
                      />
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-12 col-md col-sm">
                      <q-input
                        v-model="element.options"
                        class="q-my-md"
                        outlined
                        :label="$gettext('Options')"
                      />
                    </div>
                  </div>

                  <div class="row q-col-gutter-sm">
                    <div class="col-6 col-md col-sm">
                      <q-input
                        v-model="element.expire"
                        outlined
                        class="q-my-md"
                        type="number"
                        :label="$gettext('Expire (minutes)')"
                      />
                    </div>

                    <div class="col-6 col-md col-sm">
                      <q-checkbox
                        v-model="element.frozen"
                        class="q-my-md"
                        left-label
                        :label="$gettext('Frozen?')"
                      />
                    </div>
                  </div>
                </template>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-6 col-md col-sm-12">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h5 q-pb-sm">{{ $gettext('Actions') }}</div>

                <div class="row q-pb-md q-col-gutter-sm">
                  <div class="col-6 col-md col-sm">
                    <OrderTextArea
                      v-model="element.packages_to_install"
                      :label="$gettext('Packages to Install')"
                    >
                      <template #prepend>
                        <q-icon :name="appIcon('install')" />
                      </template>
                    </OrderTextArea>
                  </div>

                  <div class="col-6 col-md col-sm">
                    <OrderTextArea
                      v-model="element.packages_to_remove"
                      :label="$gettext('Packages to Remove')"
                    >
                      <template #prepend>
                        <q-icon :name="appIcon('uninstall')" />
                      </template>
                    </OrderTextArea>
                  </div>
                </div>

                <div class="row q-pb-md">
                  <div class="col">
                    <OrderTextArea
                      v-model="element.default_preincluded_packages"
                      :label="$gettext('Default Preincluded Packages')"
                    >
                      <template #prepend>
                        <q-icon :name="appIcon('install')" />
                      </template>
                    </OrderTextArea>
                  </div>
                </div>

                <div class="row q-pb-md">
                  <div class="col">
                    <OrderTextArea
                      v-model="element.default_included_packages"
                      :label="$gettext('Default Included Packages')"
                    >
                      <template #prepend>
                        <q-icon :name="appIcon('install')" />
                      </template>
                    </OrderTextArea>
                  </div>
                </div>

                <div class="row">
                  <div class="col">
                    <OrderTextArea
                      v-model="element.default_excluded_packages"
                      :label="$gettext('Default Excluded Packages')"
                    >
                      <template #prepend>
                        <q-icon :name="appIcon('uninstall')" />
                      </template>
                    </OrderTextArea>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div class="row q-pb-md q-col-gutter-md">
          <div class="col-12 col-md-12 col-sm-12">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h5 q-pb-sm">
                  {{ $gettext('When (schedule)') }}
                </div>

                <div class="row q-col-gutter-sm">
                  <div
                    :class="
                      element.timeline
                        ? 'col-md-3 col-sm-3'
                        : 'col-md-4 col-sm-4 text-right'
                    "
                  >
                    <DayInput
                      v-model="element.start_date"
                      :readonly="false"
                      :label="$gettext('Start Date')"
                      :dense="false"
                    />
                  </div>

                  <div
                    :class="
                      element.timeline
                        ? 'col-md-3 col-sm-3'
                        : 'col-md-4 col-sm-4'
                    "
                  >
                    <q-select
                      v-model="element.schedule"
                      outlined
                      clearable
                      :label="$gettext('Schedule')"
                      :options="schedules"
                      option-value="id"
                      option-label="name"
                      @clear="updateStats"
                    >
                      <template #prepend>
                        <q-icon :name="modelIcon('schedules')" />
                      </template>

                      <template #selected-item="scope">
                        <q-btn
                          no-caps
                          flat
                          color="primary"
                          :to="{
                            name: 'schedule-detail',
                            params: { id: scope.opt.id },
                          }"
                          :label="scope.opt.name"
                        />
                      </template>

                      <template #append>
                        <q-btn
                          round
                          dense
                          color="secondary"
                          :icon="appIcon('add')"
                          @click="$router.push({ name: 'schedule-add' })"
                          ><q-tooltip>{{
                            $gettext('Add Schedule')
                          }}</q-tooltip></q-btn
                        >
                      </template>
                    </q-select>
                  </div>

                  <div
                    :class="
                      element.timeline
                        ? 'col-md-3 col-sm-3'
                        : 'col-md-4 col-sm-4 text-right'
                    "
                  >
                    <q-checkbox
                      v-model="element.auto_restart"
                      left-label
                      :label="$gettext('Auto Restart?')"
                    />
                  </div>

                  <div
                    v-if="element.id && element.timeline"
                    class="col-md-3 col-sm-3"
                  >
                    <q-field outlined :label="$gettext('Timeline')" stack-label>
                      <template #control>
                        <Timeline :id="element.id" v-model="element.timeline" />
                      </template>
                    </q-field>
                  </div>
                </div>

                <div v-if="element.id && element.schedule" class="row">
                  <div v-if="element.stats" class="col-12 col-md col-sm">
                    <StackedBarChart
                      :title="$gettext('Provided Computers / Delay')"
                      :initial-data="element.stats"
                      borderless
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </template>
    </ItemDetail>
  </q-page>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import FilteredMultiSelect from 'components/ui/FilteredMultiSelect'
import ItemDetail from 'components/ui/ItemDetail'
import MigasLink from 'components/MigasLink'
import StackedBarChart from 'components/chart/StackedBar'
import Timeline from 'components/deployment/Timeline'
import SelectAttributes from 'components/ui/SelectAttributes'
import OrderTextArea from 'components/ui/OrderTextArea'
import DayInput from 'components/ui/DayInput'

import useDate from 'composables/date'
import { appIcon, modelIcon } from 'composables/element'

export default {
  components: {
    FilteredMultiSelect,
    ItemDetail,
    MigasLink,
    StackedBarChart,
    Timeline,
    SelectAttributes,
    OrderTextArea,
    DayInput,
  },
  setup() {
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

    let element = reactive({
      id: 0,
      enabled: false,
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
    })

    const breadcrumbs = ref([
      {
        text: $gettext('Dashboard'),
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Release'),
        icon: appIcon('release'),
      },
      {
        text: $gettext('Deployments'),
        icon: modelIcon(model),
        to: 'deployments-dashboard',
      },
    ])

    const projects = ref([])
    const domains = ref([])
    const schedules = ref([])
    const source = ref(null)

    const sources = reactive([
      {
        id: 'I',
        name: $gettext('Internal'),
      },
      {
        id: 'E',
        name: $gettext('External'),
      },
    ])

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

        domains.value = Object.values(domainsResponse.data.results).map(
          (item) => ({
            id: item.id,
            name: item.name,
          }),
        )

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
            domains.value.find(
              (item) => item.id === Number(route.query.domain),
            ) || null

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

        element.available_packages.sort((a, b) =>
          a.fullname > b.fullname ? 1 : b.fullname > a.fullname ? -1 : 0,
        )
        element.available_package_sets.sort((a, b) =>
          a.name > b.name ? 1 : b.name > a.name ? -1 : 0,
        )
      }

      updateSchedule()
    }

    const elementData = () => {
      let data = {
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

    const updateStats = () => {
      if (element.schedule === null) element.stats = {}
    }

    const resetElement = () => {
      Object.assign(element, {
        id: 0,
        name: undefined,
        enabled: false,
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
        start_date: undefined,
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

    const filterPackages = async (val) => {
      if (!element.project) return

      const { data } = await api.get('/api/v1/token/packages/', {
        params: {
          search: val.toLowerCase(),
          project__id: element.project.id,
          store__isnull: false,
        },
      })

      return data.results
    }

    const filterPackageSets = async (val) => {
      if (!element.project) return

      const { data } = await api.get('/api/v1/token/package-sets/', {
        params: {
          search: val.toLowerCase(),
          project__id: element.project.id,
        },
      })

      return data.results
    }

    return {
      breadcrumbs,
      title,
      model,
      modelIcon,
      routes,
      element,
      projects,
      domains,
      schedules,
      source,
      sources,
      showDate,
      isValid,
      loadRelated,
      elementData,
      updateRelated,
      updateStats,
      resetElement,
      setTitle,
      regenerateMetadata,
      filterPackages,
      filterPackageSets,
      appIcon,
    }
  },
}
</script>
