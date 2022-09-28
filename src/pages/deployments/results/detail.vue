<template>
  <q-page padding>
    <ItemDetail
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
      <template #fields>
        <div class="row q-pa-md q-gutter-md">
          <div class="col-md col-sm">
            <q-card>
              <q-card-section>
                <div v-translate class="text-h5 q-mt-sm q-mb-xs">General</div>

                <div class="row q-pa-md q-gutter-md">
                  <div class="col-6 col-md col-sm">
                    <q-checkbox
                      v-model="element.enabled"
                      left-label
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

                <div class="row q-pa-md q-gutter-md">
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
                    </q-select>
                  </div>
                </div>

                <div class="row q-pa-md q-gutter-md">
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

          <div class="col-md col-sm">
            <q-card>
              <q-card-section>
                <div v-translate class="text-h5 q-mt-sm q-mb-xs">
                  To who (attributes)
                </div>

                <div class="row q-pa-md q-gutter-md">
                  <div class="col-12 col-md col-sm">
                    <SelectAttributes
                      v-model="element.included_attributes"
                      :label="$gettext('Included Attributes')"
                    />
                  </div>
                </div>

                <div class="row q-pa-md q-gutter-md">
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

        <div class="row q-pa-md q-gutter-md">
          <div class="col-md col-sm">
            <q-card>
              <q-card-section>
                <div v-translate class="text-h5 q-mt-sm q-mb-xs">
                  What (packages)
                </div>

                <div v-if="element.id === 0" class="row q-pa-md q-gutter-md">
                  <div class="col-12 col-md col-sm">
                    <q-select
                      v-model="source"
                      outlined
                      :label="$gettext('Source')"
                      :options="sources"
                      option-value="id"
                      option-label="name"
                      @update:model-value="element.source = source.id"
                    />
                  </div>
                </div>

                <template v-if="element.source === 'I'">
                  <div class="row q-pa-md q-gutter-md">
                    <div class="col-12 col-md col-sm">
                      <q-select
                        v-model="element.available_packages"
                        outlined
                        use-input
                        map-options
                        multiple
                        counter
                        clearable
                        input-debounce="0"
                        :label="$gettext('Available Packages')"
                        :options="packages"
                        @filter="filterPackages"
                        @filter-abort="abortFilterPackages"
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
                            {{ scope.opt.fullname }}
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
                              model="packages"
                              :pk="scope.opt.id"
                              :value="scope.opt.fullname"
                            />
                          </q-chip>
                        </template>
                      </q-select>
                    </div>
                  </div>

                  <div class="row q-pa-md q-gutter-md">
                    <div class="col-12 col-md col-sm">
                      <q-select
                        v-model="element.available_package_sets"
                        outlined
                        use-input
                        map-options
                        multiple
                        counter
                        clearable
                        input-debounce="0"
                        :label="$gettext('Available Package Sets')"
                        :options="packageSets"
                        @filter="filterPackageSets"
                        @filter-abort="abortFilterPackageSets"
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
                            {{ scope.opt.name }}
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
                              model="package-sets"
                              :pk="scope.opt.id"
                              :value="scope.opt.name"
                            />
                          </q-chip>
                        </template>
                      </q-select>
                    </div>
                  </div>
                </template>

                <template v-if="element.source === 'E'">
                  <div class="row q-pa-md q-gutter-md">
                    <div class="col-12 col-md col-sm">
                      <q-input
                        v-model="element.base_url"
                        outlined
                        :label="$gettext('Base URL')"
                      />
                    </div>
                  </div>

                  <div class="row q-pa-md q-gutter-md">
                    <div class="col-12 col-md col-sm">
                      <q-input
                        v-model="element.suite"
                        outlined
                        :label="$gettext('Suite')"
                      />
                    </div>
                  </div>

                  <div class="row q-pa-md q-gutter-md">
                    <div class="col-12 col-md col-sm">
                      <q-input
                        v-model="element.components"
                        outlined
                        :label="$gettext('Components')"
                      />
                    </div>
                  </div>

                  <div class="row q-pa-md q-gutter-md">
                    <div class="col-12 col-md col-sm">
                      <q-input
                        v-model="element.options"
                        outlined
                        :label="$gettext('Options')"
                      />
                    </div>
                  </div>

                  <div class="row q-pa-md q-gutter-md">
                    <div class="col-6 col-md col-sm">
                      <q-input
                        v-model="element.expire"
                        outlined
                        type="number"
                        :label="$gettext('Expire (minutes)')"
                      />
                    </div>

                    <div class="col-6 col-md col-sm">
                      <q-checkbox
                        v-model="element.frozen"
                        left-label
                        :label="$gettext('Frozen?')"
                      />
                    </div>
                  </div>
                </template>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-md col-sm">
            <q-card>
              <q-card-section>
                <div v-translate class="text-h5 q-mt-sm q-mb-xs">Actions</div>

                <div class="row q-pa-md q-gutter-md">
                  <div class="col-6 col-md col-sm">
                    <OrderTextArea
                      v-model="element.packages_to_install"
                      :label="$gettext('Packages to Install')"
                    />
                  </div>

                  <div class="col-6 col-md col-sm">
                    <OrderTextArea
                      v-model="element.packages_to_remove"
                      :label="$gettext('Packages to Remove')"
                    />
                  </div>
                </div>

                <div class="row q-pa-md q-gutter-md">
                  <div class="col">
                    <OrderTextArea
                      v-model="element.default_preincluded_packages"
                      :label="$gettext('Default Preincluded Packages')"
                    />
                  </div>
                </div>

                <div class="row q-pa-md q-gutter-md">
                  <div class="col">
                    <OrderTextArea
                      v-model="element.default_included_packages"
                      :label="$gettext('Default Included Packages')"
                    />
                  </div>
                </div>

                <div class="row q-pa-md q-gutter-md">
                  <div class="col">
                    <OrderTextArea
                      v-model="element.default_excluded_packages"
                      :label="$gettext('Default Excluded Packages')"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-12 col-md col-sm">
            <q-card>
              <q-card-section>
                <div v-translate class="text-h5 q-mt-sm q-mb-xs">
                  When (schedule)
                </div>

                <div class="row q-pa-md q-gutter-md">
                  <div class="col-md col-sm">
                    <q-input v-model="element.start_date" outlined clearable>
                      <template #append>
                        <q-icon name="mdi-calendar" class="cursor-pointer">
                          <q-popup-proxy
                            transition-show="scale"
                            transition-hide="scale"
                          >
                            <q-date
                              v-model="element.start_date"
                              :label="$gettext('Start Date')"
                              mode="date"
                              mask="YYYY-MM-DD"
                              outlined
                              landscape
                              today-btn
                              :locale="localeDate"
                            />
                          </q-popup-proxy>
                        </q-icon>
                      </template>

                      <q-tooltip v-if="element.start_date">{{
                        diffForHumans(element.start_date)
                      }}</q-tooltip>
                    </q-input>
                  </div>

                  <div class="col-md col-sm">
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
                    </q-select>
                  </div>

                  <div v-if="element.timeline" class="col-md col-sm">
                    <q-field outlined :label="$gettext('Timeline')" stack-label>
                      <template #control>
                        <Timeline :id="element.id" v-model="element.timeline" />
                      </template>
                    </q-field>
                  </div>
                </div>

                <div
                  v-if="element.id && element.schedule"
                  class="row q-pa-md q-gutter-md"
                >
                  <div
                    v-if="Object.keys(stats).length > 0"
                    class="col-12 col-md col-sm"
                  >
                    <StackedBarChart
                      :title="$gettext('Provided Computers / Delay')"
                      :initial-data="stats"
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
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import ItemDetail from 'components/ui/ItemDetail'
import MigasLink from 'components/MigasLink'
import StackedBarChart from 'components/chart/StackedBar'
import Timeline from 'components/deployment/Timeline'
import SelectAttributes from 'components/ui/SelectAttributes'
import OrderTextArea from 'components/ui/OrderTextArea'

import useDate from 'composables/date'
import { modelIcon } from 'composables/element'

export default {
  components: {
    ItemDetail,
    MigasLink,
    StackedBarChart,
    Timeline,
    SelectAttributes,
    OrderTextArea,
  },
  setup() {
    const { $gettext } = useGettext()
    const { showDate, diffForHumans, localeDate } = useDate()
    const uiStore = useUiStore()

    const title = ref($gettext('Deployment'))
    const windowTitle = ref(title.value)
    useMeta(() => {
      return {
        title: windowTitle.value,
      }
    })

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
      expire: 1440,
      frozen: false,
    })

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        to: 'home',
        icon: 'mdi-home',
      },
      {
        text: $gettext('Release'),
        icon: 'mdi-truck-delivery',
      },
      {
        text: $gettext('Deployments'),
        to: 'deployments-dashboard',
        icon: modelIcon(model),
      },
    ])

    const projects = ref([])
    const domains = ref([])
    const schedules = ref([])
    const packages = ref([])
    const packageSets = ref([])
    const source = ref(null)
    let stats = reactive({})

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
      if (element.id) {
        await api
          .get(`/api/v1/token/stats/deployments/${element.id}/timeline/`)
          .then((response) => {
            element.timeline = response.data
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })

        if (element.schedule) {
          await api
            .get(
              `/api/v1/token/stats/deployments/${element.id}/computers/delay/`
            )
            .then((response) => {
              const series = []

              Object.entries(response.data.data).map(([key, val]) => {
                series.push({
                  type: 'line',
                  smooth: true,
                  name: key,
                  data: val,
                })
              })

              const today = showDate(new Date(Date.now()), 'YYYY-MM-DD')
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

              stats = {
                xData: response.data.x_labels,
                series,
              }
            })
            .catch((error) => {
              uiStore.notifyError(error)
            })
        }
      }
    }

    const loadRelated = async () => {
      await api
        .get('/api/v1/token/projects/')
        .then((response) => {
          projects.value = response.data.results
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      await api
        .get('/api/v1/token/domains/')
        .then((response) => {
          Object.entries(response.data.results).map(([index, item]) => {
            domains.value.push({
              id: item.id,
              name: item.name,
            })
          })
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      await api
        .get('/api/v1/token/schedules/')
        .then((response) => {
          Object.entries(response.data.results).map(([index, item]) => {
            schedules.value.push({
              id: item.id,
              name: item.name,
            })
          })
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })

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
          a.fullname > b.fullname ? 1 : b.fullname > a.fullname ? -1 : 0
        )
        element.available_package_sets.sort((a, b) =>
          a.name > b.name ? 1 : b.name > a.name ? -1 : 0
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
      if (element.schedule === null) stats = {}
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
        packages_to_install: [],
        packages_to_remove: [],
        default_preincluded_packages: [],
        default_included_packages: [],
        default_excluded_packages: [],
        start_date: undefined,
        schedule: null,
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

    const filterPackages = async (val, update, abort) => {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3 || element.project === undefined) {
        abort()
        return
      }

      await api
        .get('/api/v1/token/packages/', {
          params: {
            search: val.toLowerCase(),
            project__id: element.project.id,
            store__isnull: false,
          },
        })
        .then((response) => {
          packages.value = response.data.results
        })

      update(() => {})
    }

    const abortFilterPackages = () => {
      // console.log('delayed filter aborted')
    }

    const filterPackageSets = async (val, update, abort) => {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3 || element.project === undefined) {
        abort()
        return
      }

      await api
        .get('/api/v1/token/package-sets/', {
          params: {
            search: val.toLowerCase(),
            project__id: element.project.id,
          },
        })
        .then((response) => {
          packageSets.value = response.data.results
        })

      update(() => {})
    }

    const abortFilterPackageSets = () => {
      // console.log('delayed filter aborted')
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
      packages,
      packageSets,
      source,
      stats,
      sources,
      showDate,
      diffForHumans,
      localeDate,
      isValid,
      loadRelated,
      elementData,
      updateRelated,
      updateStats,
      resetElement,
      setTitle,
      filterPackages,
      abortFilterPackages,
      filterPackageSets,
      abortFilterPackageSets,
    }
  },
}
</script>
