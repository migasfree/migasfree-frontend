<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Fault Definition')">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="fault-definitions"
          :pk="element.id"
          :value="element.name"
          icon="mdi-alert-octagram-outline"
        />
      </template>
    </Header>

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
          <div class="col-12">
            <q-input
              v-model="element.description"
              outlined
              type="textarea"
              :label="$gettext('Description')"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">Code</div>

        <div class="row q-pa-md q-gutter-md justify-between">
          <div class="col-md-3">
            <q-select
              v-model="element.language"
              outlined
              :label="$gettext('Language')"
              :options="languages"
              option-value="id"
              option-label="name"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
            />
          </div>

          <div class="col-md-8">
            <q-input
              v-model="element.code"
              outlined
              type="textarea"
              bottom-slots
              :label="$gettext('Code')"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">Attributes</div>

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
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">User Profiles</div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <q-select
              v-model="element.users"
              outlined
              use-input
              map-options
              multiple
              input-debounce="0"
              :label="$gettext('User Profiles')"
              :options="userProfiles"
              @filter="filterUserProfiles"
              @filter-abort="abortFilterUserProfiles"
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
                  {{ scope.opt.username }}
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
                    model="user-profiles"
                    :pk="scope.opt.id"
                    :value="scope.opt.username"
                    icon="mdi-account-cog"
                  />
                </q-chip>
              </template>
            </q-select>
          </div>
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
    const route = 'fault-definitions-list'
    const title = this.$gettext('Fault Definition')
    const element = {
      id: 0,
      enabled: false,
      included_attributes: [],
      excluded_attributes: [],
      users: []
    }

    return {
      title,
      originalTitle: title,
      model: 'fault-definitions',
      listRoute: route,
      addRoute: 'fault-definition-add',
      detailRoute: 'fault-definition-detail',
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: this.$gettext('Configuration'),
          icon: 'mdi-cogs'
        },
        {
          text: this.$gettext('Fault Definitions'),
          icon: 'mdi-alert-octagram-outline',
          to: route
        }
      ],
      element,
      emptyElement: Object.assign({}, element),
      languages: [],
      userProfiles: [],
      confirmRemove: false
    }
  },
  computed: {
    isValid() {
      return (
        this.element.name !== undefined &&
        this.element.name !== '' &&
        this.element.language !== undefined &&
        this.element.code !== undefined
      )
    }
  },
  methods: {
    async loadRelated() {
      await this.$axios
        .get('/api/v1/public/languages/')
        .then((response) => {
          Object.entries(response.data).map(([key, val]) => {
            this.languages.push({
              id: parseInt(key),
              name: val
            })
          })
          if (this.element.id && typeof this.element.language === 'number')
            this.element.language = this.languages.find(
              (x) => x.id === this.element.language
            )
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    elementData() {
      return {
        name: this.element.name,
        enabled: this.element.enabled,
        description: this.element.description,
        language: this.element.language.id,
        code: this.element.code,
        included_attributes: this.element.included_attributes.map(
          (item) => item.id
        ),
        excluded_attributes: this.element.excluded_attributes.map(
          (item) => item.id
        ),
        users: this.element.users.map((item) => item.id)
      }
    },

    filterUserProfiles(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      /* if (val.length < 3) {
        abort()
        return
      } */

      update(() => {
        const needle = val.toLowerCase()
        this.$axios
          .get('/api/v1/token/user-profiles/', { params: { search: needle } })
          .then((response) => {
            this.userProfiles = response.data.results
          })
        /* this.userProfiles = stringOptions.filter(
          (v) => v.toLowerCase().indexOf(needle) > -1
        ) */
      })
    },

    abortFilterUserProfiles() {
      // console.log('delayed filter aborted')
    }
  }
}
</script>
