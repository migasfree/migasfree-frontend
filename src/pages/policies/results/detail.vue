<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Policy')">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="catalog/policies"
          :pk="element.id"
          :value="element.name"
          icon="mdi-shield-half-full"
        />
      </template>
    </Header>

    <q-card>
      <q-card-section>
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">General</div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-12">
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
            <q-checkbox
              v-model="element.enabled"
              left-label
              :label="$gettext('Enabled?')"
            />
            <p v-translate class="text-caption">
              If you uncheck this field, the policy is disabled for all
              computers.
            </p>
          </div>

          <div class="col-6 col-md">
            <q-checkbox
              v-model="element.exclusive"
              left-label
              :label="$gettext('Exclusive?')"
            />
            <p v-translate class="text-caption">
              If you check this field, it orders to uninstall the Applications
              assigned in the priorities that have not been met.
            </p>
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

      <q-card-section>
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">Application Area</div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <SelectAttributes
              v-model="element.included_attributes"
              :label="$gettext('Included Attributes')"
            />
          </div>

          <div class="col-6 col-md">
            <SelectAttributes
              v-model="element.excluded_attributes"
              :label="$gettext('Excluded Attributes')"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">Policy Groups</div>

        <q-list
          v-if="policyGroups.length > 0"
          class="q-pa-md"
          bordered
          separator
        >
          <q-item v-for="(line, index) in policyGroups" :key="index">
            <q-item-section side top>
              <q-btn
                flat
                dense
                round
                color="negative"
                icon="mdi-delete"
                @click="removeInline(index)"
                ><q-tooltip>{{ $gettext('Delete') }}</q-tooltip></q-btn
              >
            </q-item-section>

            <q-item-section>
              <div class="row q-pa-md q-gutter-md">
                <div class="col-md">
                  <q-input
                    v-model="line.priority"
                    outlined
                    type="number"
                    :label="$gettext('Priority')"
                    lazy-rules
                    :rules="[(val) => !!val || $gettext('* Required')]"
                  />
                </div>

                <div class="col-md">
                  <q-select
                    v-model="line.applications"
                    outlined
                    use-input
                    map-options
                    multiple
                    input-debounce="0"
                    :label="$gettext('Applications')"
                    :options="applications"
                    @filter="filterApplications"
                    @filter-abort="abortFilterApplications"
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
                          model="catalog/apps"
                          :pk="scope.opt.id"
                          :value="scope.opt.name"
                          icon="mdi-apps"
                        />
                      </q-chip>
                    </template>
                  </q-select>
                </div>
              </div>

              <div class="row q-pa-md q-gutter-md">
                <div class="col-md">
                  <SelectAttributes
                    v-model="line.included_attributes"
                    :label="$gettext('Included Attributes')"
                  />
                </div>

                <div class="col-md">
                  <SelectAttributes
                    v-model="line.excluded_attributes"
                    :label="$gettext('Excluded Attributes')"
                  />
                </div>
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <div class="q-pa-md">
          <q-btn
            icon="mdi-plus"
            :label="$gettext('Add other Policy Group')"
            @click="addInline"
          />
        </div>
      </q-card-section>

      <q-card-actions class="justify-around">
        <q-btn
          flat
          color="primary"
          :label="$gettext('Save and add other')"
          icon="mdi-plus"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="updateElement('add')"
        />
        <q-btn
          flat
          color="primary"
          :label="$gettext('Save and continue editing')"
          icon="mdi-content-save-edit"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="updateElement"
        />
        <q-btn
          :label="$gettext('Save')"
          color="primary"
          icon="mdi-content-save-move"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="updateElement('return')"
        />
      </q-card-actions>
    </q-card>

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
import SelectAttributes from 'components/ui/SelectAttributes'
import RemoveDialog from 'components/ui/RemoveDialog'
import { detailMixin } from 'mixins/detail'
import { elementMixin } from 'mixins/element'

export default {
  meta() {
    return {
      title: this.title
    }
  },
  components: {
    Breadcrumbs,
    Header,
    RemoveDialog,
    MigasLink,
    SelectAttributes
  },
  mixins: [detailMixin, elementMixin],
  data() {
    const route = 'policies-list'
    const title = this.$gettext('Policy')
    const element = {
      id: 0,
      enabled: false,
      exclusive: false,
      included_attributes: [],
      excluded_attributes: []
    }

    return {
      title,
      originalTitle: title,
      model: 'catalog/policies',
      listRoute: route,
      addRoute: 'policy-add',
      detailRoute: 'policy-detail',
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
          text: this.$gettext('Policies'),
          icon: 'mdi-shield-half-full',
          to: route
        }
      ],
      element,
      emptyElement: Object.assign({}, element),
      applications: [],
      policyGroups: [],
      removedPolicyGroups: [],
      confirmRemove: false
    }
  },
  computed: {
    isValid() {
      return this.element.name !== undefined && this.element.name !== ''
    }
  },
  methods: {
    async loadRelated() {
      if (this.element.id) {
        await this.$axios
          .get(
            `/api/v1/token/catalog/policy-groups/?policy__id=${this.element.id}`
          )
          .then((response) => {
            this.policyGroups = response.data.results
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
      }
    },

    elementData() {
      return {
        name: this.element.name,
        comment: this.element.comment,
        enabled: this.element.enabled,
        exclusive: this.element.exclusive,
        included_attributes: this.element.included_attributes.map(
          (item) => item.id
        ),
        excluded_attributes: this.element.excluded_attributes.map(
          (item) => item.id
        )
      }
    },

    async updateRelated() {
      this.policyGroups.forEach((line) => {
        if (line.priority === undefined) {
          return
        }

        if (line.id > 0) {
          this.$axios
            .patch(`/api/v1/token/catalog/policy-groups/${line.id}/`, {
              policy: this.element.id,
              priority: line.priority,
              included_attributes: line.included_attributes.map(
                (item) => item.id
              ),
              excluded_attributes: line.excluded_attributes.map(
                (item) => item.id
              ),
              applications: line.applications.map((item) => item.id)
            })
            .catch((error) => {
              this.$store.dispatch('ui/notifyError', error)
            })
        } else {
          this.$axios
            .post('/api/v1/token/catalog/policy-groups/', {
              policy: this.element.id,
              priority: line.priority,
              included_attributes: line.included_attributes.map(
                (item) => item.id
              ),
              excluded_attributes: line.excluded_attributes.map(
                (item) => item.id
              ),
              applications: line.applications.map((item) => item.id)
            })
            .catch((error) => {
              this.$store.dispatch('ui/notifyError', error)
            })
        }
      })

      this.removedPolicyGroups.forEach((id) => {
        this.$axios
          .delete(`/api/v1/token/catalog/policy-groups/${id}/`)
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
      })
    },

    addInline() {
      this.policyGroups.push({
        id: 0,
        priority: this.policyGroups.length
          ? parseInt(this.policyGroups[this.policyGroups.length - 1].priority) +
            1
          : 1,
        includes_attributes: [],
        excluded_attributes: [],
        applications: []
      })
    },

    removeInline(index) {
      const removedItem = this.policyGroups.splice(index, 1)[0]
      if (removedItem.id > 0) {
        this.removedPolicyGroups.push(removedItem.id)
      }
    },

    filterApplications(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3) {
        abort()
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.$axios
          .get('/api/v1/token/catalog/apps/', {
            params: { search: needle }
          })
          .then((response) => {
            this.applications = response.data.results
          })
        /* this.applications = stringOptions.filter(
          (v) => v.toLowerCase().indexOf(needle) > -1
        ) */
      })
    },

    abortFilterApplications() {
      // console.log('delayed filter aborted')
    }
  }
}
</script>
