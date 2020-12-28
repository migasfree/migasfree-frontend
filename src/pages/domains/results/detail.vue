<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Domain')" :has-add-button="false">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="domains"
          :pk="element.id"
          :value="element.name"
          icon="mdi-earth"
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
              @input="
                (v) => {
                  element.name = v.toUpperCase()
                }
              "
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

      <q-card-section>
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">Attributes</div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
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

          <div class="col-6 col-md">
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

      <q-card-section>
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">Others</div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <q-select
              v-model="element.tags"
              outlined
              use-input
              map-options
              multiple
              input-debounce="0"
              :label="$gettext('Available Tags')"
              :options="tags"
              @filter="filterTags"
              @filter-abort="abortFilterTags"
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
                    model="tags"
                    :pk="scope.opt.id"
                    :value="attributeValue(scope.opt)"
                    icon="mdi-tag"
                  />
                </q-chip>
              </template>
            </q-select>
          </div>

          <div class="col-6 col-md">
            <q-select
              v-model="element.domain_admins"
              :options="userProfiles"
              :label="$gettext('Domain Admins')"
              outlined
              multiple
              option-value="id"
              option-label="name"
            >
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
                    :value="scope.opt.name"
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
    MigasLink
  },
  mixins: [detailMixin, elementMixin],
  data() {
    const route = 'domains-list'
    const title = this.$gettext('Domain')
    const element = {
      id: 0,
      included_attributes: [],
      excluded_attributes: [],
      tags: [],
      domain_admins: []
    }

    return {
      title,
      originalTitle: title,
      model: 'domains',
      listRoute: route,
      addRoute: 'domain-add',
      detailRoute: 'domain-detail',
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
          text: this.$gettext('Domains'),
          icon: 'mdi-earth',
          to: route
        }
      ],
      element,
      emptyElement: Object.assign({}, element),
      attributes: [],
      tags: [],
      userProfiles: [],
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
      await this.$axios
        .get('/api/v1/token/user-profiles/domain-admins/')
        .then((response) => {
          Object.entries(response.data).map(([index, item]) => {
            this.userProfiles.push({
              id: item.id,
              name: item.username
            })
          })
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    setRelated() {
      this.element.domain_admins = this.element.domain_admins.map(
        ({ id, username }) => ({ id, name: username })
      )
    },

    elementData() {
      return {
        name: this.element.name,
        comment: this.element.comment,
        included_attributes: this.element.included_attributes.map(
          (item) => item.id
        ),
        excluded_attributes: this.element.excluded_attributes.map(
          (item) => item.id
        ),
        tags: this.element.tags.map((item) => item.id),
        domain_admins: this.element.domain_admins.map((item) => item.id)
      }
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

    filterTags(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3) {
        abort()
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.$axios
          .get('/api/v1/token/tags/', { params: { search: needle } })
          .then((response) => {
            this.tags = response.data.results
          })
        /* this.tags = stringOptions.filter(
          (v) => v.toLowerCase().indexOf(needle) > -1
        ) */
      })
    },

    abortFilterTags() {
      // console.log('delayed filter aborted')
    }
  }
}
</script>
