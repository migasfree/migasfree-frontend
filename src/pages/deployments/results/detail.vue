<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Deployment')">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="deployments"
          :pk="element.id"
          :value="element.name"
          icon="mdi-rocket-launch"
        />
      </template>
    </Header>

    <div class="row q-pa-md q-gutter-md">
      <div class="col-md">
        <q-card>
          <q-card-section>
            <div v-translate class="text-h5 q-mt-sm q-mb-xs">General</div>

            <div class="row q-pa-md q-gutter-md">
              <div class="col-6 col-md">
                <q-checkbox
                  v-model="element.enabled"
                  left-label
                  :label="$gettext('Enabled?')"
                />
              </div>
              <div class="col-6 col-md">
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
              <div class="col-6 col-md">
                <q-select
                  v-model="element.project"
                  outlined
                  :label="$gettext('Project')"
                  :options="projects"
                  option-value="id"
                  option-label="name"
                  lazy-rules
                  :rules="[(val) => !!val || $gettext('* Required')]"
                />
              </div>

              <div class="col-6 col-md">
                <q-select
                  v-model="element.domain"
                  outlined
                  :label="$gettext('Editable by Domain Administrators')"
                  :options="domains"
                  option-value="id"
                  option-label="name"
                />
              </div>
            </div>

            <div class="row q-pa-md q-gutter-md">
              <div class="col-12">
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

      <div class="col-md">
        <q-card>
          <q-card-section>
            <div v-translate class="text-h5 q-mt-sm q-mb-xs">
              To who (attributes)
            </div>

            <div class="row q-pa-md q-gutter-md">
              <div class="col-12">
                <q-select
                  v-model="element.included_attributes"
                  outlined
                  use-input
                  map-options
                  multiple
                  input-debounce="0"
                  :label="$gettext('Included Attributes')"
                  :options="attributes"
                  @filter="filterAttributes"
                  @filter-abort="abortFilterAttributes"
                >
                  <template #no-option>
                    <q-item>
                      <q-item-section v-translate class="text-grey">
                        No results
                      </q-item-section>
                    </q-item>
                  </template>

                  <template #option="scope">
                    <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                      {{ attributeValue(scope.opt) }}
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
                        model="attributes"
                        :pk="scope.opt.id"
                        :value="attributeValue(scope.opt)"
                      />
                    </q-chip>
                  </template>
                </q-select>
              </div>
            </div>

            <div class="row q-pa-md q-gutter-md">
              <div class="col-12">
                <q-select
                  v-model="element.excluded_attributes"
                  outlined
                  use-input
                  map-options
                  multiple
                  input-debounce="0"
                  :label="$gettext('Excluded Attributes')"
                  :options="attributes"
                  @filter="filterAttributes"
                  @filter-abort="abortFilterAttributes"
                >
                  <template #no-option>
                    <q-item>
                      <q-item-section v-translate class="text-grey">
                        No results
                      </q-item-section>
                    </q-item>
                  </template>

                  <template #option="scope">
                    <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                      {{ attributeValue(scope.opt) }}
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
                        model="attributes"
                        :pk="scope.opt.id"
                        :value="attributeValue(scope.opt)"
                      />
                    </q-chip>
                  </template>
                </q-select>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-pa-md q-gutter-md">
      <div class="col-md">
        <q-card>
          <q-card-section>
            <div v-translate class="text-h5 q-mt-sm q-mb-xs">
              What (packages)
            </div>

            <div v-if="element.id === 0" class="row q-pa-md q-gutter-md">
              <div class="col-md">
                <q-select
                  v-model="source"
                  outlined
                  :label="$gettext('Source')"
                  :options="sources"
                  option-value="id"
                  option-label="name"
                  @input="element.source = source.id"
                />
              </div>
            </div>

            <template v-if="element.source === 'I'">
              <div class="row q-pa-md q-gutter-md">
                <div class="col-md">
                  <q-select
                    v-model="element.available_packages"
                    outlined
                    use-input
                    map-options
                    multiple
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
                      <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
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
                          icon="mdi-package-variant"
                        />
                      </q-chip>
                    </template>
                  </q-select>
                </div>
              </div>

              <div class="row q-pa-md q-gutter-md">
                <div class="col-md">
                  <q-select
                    v-model="element.available_package_sets"
                    outlined
                    use-input
                    map-options
                    multiple
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
                      <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
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
                          icon="mdi-apps-box"
                        />
                      </q-chip>
                    </template>
                  </q-select>
                </div>
              </div>
            </template>

            <template v-if="element.source === 'E'">
              <div class="row q-pa-md q-gutter-md">
                <div class="col-md">
                  <q-input
                    v-model="element.base_url"
                    outlined
                    :label="$gettext('Base URL')"
                  />
                </div>
              </div>

              <div class="row q-pa-md q-gutter-md">
                <div class="col-md">
                  <q-input
                    v-model="element.suite"
                    outlined
                    :label="$gettext('Suite')"
                  />
                </div>
              </div>

              <div class="row q-pa-md q-gutter-md">
                <div class="col-md">
                  <q-input
                    v-model="element.components"
                    outlined
                    :label="$gettext('Components')"
                  />
                </div>
              </div>

              <div class="row q-pa-md q-gutter-md">
                <div class="col-md">
                  <q-input
                    v-model="element.options"
                    outlined
                    :label="$gettext('Options')"
                  />
                </div>
              </div>

              <div class="row q-pa-md q-gutter-md">
                <div class="col-md">
                  <q-input
                    v-model="element.expire"
                    outlined
                    type="number"
                    :label="$gettext('Expire (minutes)')"
                  />
                </div>

                <div class="col-md">
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

      <div class="col-md">
        <q-card>
          <q-card-section>
            <div v-translate class="text-h5 q-mt-sm q-mb-xs">Actions</div>

            <div class="row q-pa-md q-gutter-md">
              <div class="col-md">
                <q-input
                  v-model="element.packages_to_install"
                  outlined
                  type="textarea"
                  :label="$gettext('Packages to Install')"
                />
              </div>

              <div class="col-md">
                <q-input
                  v-model="element.packages_to_remove"
                  outlined
                  type="textarea"
                  :label="$gettext('Packages to Remove')"
                />
              </div>
            </div>

            <div class="row q-pa-md q-gutter-md">
              <div class="col-4 col-sm">
                <q-input
                  v-model="element.default_preincluded_packages"
                  outlined
                  type="textarea"
                  :label="$gettext('Default Preincluded Packages')"
                />
              </div>

              <div class="col-4 col-sm">
                <q-input
                  v-model="element.default_included_packages"
                  outlined
                  type="textarea"
                  :label="$gettext('Default Included Packages')"
                />
              </div>

              <div class="col-4 col-sm">
                <q-input
                  v-model="element.default_excluded_packages"
                  outlined
                  type="textarea"
                  :label="$gettext('Default Excluded Packages')"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-pa-md q-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div v-translate class="text-h5 q-mt-sm q-mb-xs">
              When (schedule)
            </div>

            <div class="row q-pa-md q-gutter-md">
              <div class="col-md">
                <q-datetime-picker
                  v-model="element.start_date"
                  :label="$gettext('Start Date')"
                  mode="date"
                  outlined
                  clearable
                  landscape
                  target="self"
                  :display-value="showDate(element.start_date, 'YYYY-MM-DD')"
                ></q-datetime-picker>
              </div>

              <div class="col-md">
                <q-select
                  v-model="element.schedule"
                  outlined
                  :label="$gettext('Schedule')"
                  :options="schedules"
                  option-value="id"
                  option-label="name"
                />
              </div>

              <div v-if="element.timeline" class="col-md">
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
              <div class="col-md">
                <StackedBarChart
                  :title="$gettext('Provided Computers / Delay')"
                  :end-point="
                    `/api/v1/token/stats/deployments/${element.id}/computers/delay/`
                  "
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-pa-md q-gutter-md">
      <div class="col-md">
        <q-btn
          flat
          color="primary"
          :label="$gettext('Save and add other')"
          icon="mdi-plus"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="updateElement('add')"
        />
      </div>
      <div class="col-md">
        <q-btn
          flat
          color="primary"
          :label="$gettext('Save and continue editing')"
          icon="mdi-content-save-edit"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="updateElement"
        />
      </div>
      <div class="col-md">
        <q-btn
          :label="$gettext('Save')"
          color="primary"
          icon="mdi-content-save-move"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="updateElement('return')"
        />
      </div>
    </div>

    <div v-if="$route.params.id && element.id" class="row q-pa-md">
      <q-btn
        flat
        icon="mdi-delete"
        color="negative"
        :label="$gettext('Delete')"
        @click="confirmRemove = true"
      />
    </div>

    <RemoveDialog
      v-model="confirmRemove"
      @confirmed="remove"
      @canceled="confirmRemove = !confirmRemove"
    />
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'
import RemoveDialog from 'components/ui/RemoveDialog'
import StackedBarChart from 'components/chart/StackedBar'
import Timeline from 'components/deployment/Timeline'
import { detailMixin } from 'mixins/detail'
import { elementMixin } from 'mixins/element'
import { dateMixin } from 'mixins/date'

export default {
  meta() {
    return {
      title: this.title
    }
  },
  components: {
    Breadcrumbs,
    Header,
    MigasLink,
    RemoveDialog,
    StackedBarChart,
    Timeline
  },
  mixins: [detailMixin, elementMixin, dateMixin],
  data() {
    const title = this.$gettext('Deployment')
    const element = {
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
      frozen: false
    }

    return {
      title,
      originalTitle: title,
      model: 'deployments',
      listRoute: 'deployments-list',
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: this.$gettext('Release'),
          icon: 'mdi-truck-delivery'
        },
        {
          text: this.$gettext('Deployments'),
          to: 'deployments-dashboard',
          icon: 'mdi-rocket-launch'
        }
      ],
      element,
      emptyElement: Object.assign({}, element),
      projects: [],
      domains: [],
      attributes: [],
      schedules: [],
      packages: [],
      packageSets: [],
      source: null,
      sources: [
        {
          id: 'I',
          name: this.$gettext('Internal')
        },
        {
          id: 'E',
          name: this.$gettext('External')
        }
      ],
      isValid: true,
      confirmRemove: false
    }
  },
  methods: {
    async loadRelated() {
      await this.$axios
        .get('/api/v1/token/projects/')
        .then((response) => {
          this.projects = response.data.results
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })

      await this.$axios
        .get('/api/v1/token/domains/')
        .then((response) => {
          Object.entries(response.data.results).map(([index, item]) => {
            this.domains.push({
              id: item.id,
              name: item.name
            })
          })
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })

      await this.$axios
        .get('/api/v1/token/schedules/')
        .then((response) => {
          Object.entries(response.data.results).map(([index, item]) => {
            this.schedules.push({
              id: item.id,
              name: item.name
            })
          })
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })

      if (this.element.id) {
        this.element.packages_to_install = this.element.packages_to_install.join(
          '\n'
        )
        this.element.packages_to_remove = this.element.packages_to_remove.join(
          '\n'
        )
        this.element.default_preincluded_packages = this.element.default_preincluded_packages.join(
          '\n'
        )
        this.element.default_included_packages = this.element.default_included_packages.join(
          '\n'
        )
        this.element.default_excluded_packages = this.element.default_excluded_packages.join(
          '\n'
        )
      }
      this.updateSchedule()
    },

    async updateSchedule() {
      if (this.element.id) {
        await this.$axios
          .get(`/api/v1/token/stats/deployments/${this.element.id}/timeline/`)
          .then((response) => {
            this.$set(this.element, 'timeline', response.data)
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
      }
    },

    elementData() {
      let data = {
        enabled: this.element.enabled,
        name: this.element.name,
        project: this.element.project ? this.element.project.id : null,
        domain: this.element.domain ? this.element.domain.id : null,
        comment: this.element.comment,
        source: this.element.source,
        included_attributes: this.element.included_attributes.map(
          (item) => item.id
        ),
        excluded_attributes: this.element.excluded_attributes.map(
          (item) => item.id
        ),
        packages_to_install:
          this.element.packages_to_install !== null
            ? this.element.packages_to_install.split('\n')
            : [],
        packages_to_remove:
          this.element.packages_to_remove !== null
            ? this.element.packages_to_remove.split('\n')
            : [],
        default_preincluded_packages:
          this.element.default_preincluded_packages !== null
            ? this.element.default_preincluded_packages.split('\n')
            : [],
        default_included_packages:
          this.element.default_included_packages !== null
            ? this.element.default_included_packages.split('\n')
            : [],
        default_excluded_packages:
          this.element.default_excluded_packages !== null
            ? this.element.default_excluded_packages.split('\n')
            : [],
        start_date: this.showDate(this.element.start_date, 'YYYY-MM-DD'),
        schedule: this.element.schedule ? this.element.schedule.id : null
      }

      if (this.element.source === 'I') {
        data.available_packages = this.element.available_packages
          ? this.element.available_packages.map((item) => item.id)
          : []
        data.available_package_sets = this.element.available_package_sets
          ? this.element.available_package_sets.map((item) => item.id)
          : []
      }

      if (this.element.source === 'E') {
        data.base_url = this.element.base_url
        data.suite = this.element.suite
        data.components = this.element.components
        data.options = this.element.options
        data.expire = this.element.expire
        data.frozen = this.element.frozen
      }

      return data
    },

    async updateRelated() {
      await this.updateSchedule()
    },

    filterAttributes(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3) {
        abort()
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.$axios
          .get('/api/v1/token/attributes/', { params: { search: needle } })
          .then((response) => {
            this.attributes = response.data.results
          })
        /* this.attributes = stringOptions.filter(
          (v) => v.toLowerCase().indexOf(needle) > -1
        ) */
      })
    },

    abortFilterAttributes() {
      // console.log('delayed filter aborted')
    },

    filterPackages(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3 || this.element.project === undefined) {
        abort()
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.$axios
          .get('/api/v1/token/packages/', {
            params: { search: needle, project__id: this.element.project.id }
          })
          .then((response) => {
            this.packages = response.data.results
          })
        /* this.packages = stringOptions.filter(
          (v) => v.toLowerCase().indexOf(needle) > -1
        ) */
      })
    },

    abortFilterPackages() {
      // console.log('delayed filter aborted')
    },

    filterPackageSets(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3 || this.element.project === undefined) {
        abort()
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.$axios
          .get('/api/v1/token/package-sets/', {
            params: { search: needle, project__id: this.element.project.id }
          })
          .then((response) => {
            this.packageSets = response.data.results
          })
        /* this.packageSets = stringOptions.filter(
          (v) => v.toLowerCase().indexOf(needle) > -1
        ) */
      })
    },

    abortFilterPackageSets() {
      // console.log('delayed filter aborted')
    }
  }
}
</script>
