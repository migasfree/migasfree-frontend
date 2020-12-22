<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Scope')" :has-add-button="false">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="scopes"
          :pk="element.id"
          :value="element.name"
          icon="mdi-eye-outline"
        />
      </template>
    </Header>

    <q-card>
      <q-card-section>
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">General</div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <q-input
              v-model="element.name"
              outlined
              :label="$gettext('Name')"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
              @input="
                (v) => {
                  element.name = v.toLowerCase()
                }
              "
            />
          </div>

          <div class="col-6 col-md">
            <q-select
              v-model="element.domain"
              :options="domains"
              :label="$gettext('Domain')"
              outlined
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
                    model="domains"
                    :pk="scope.opt.id"
                    :value="scope.opt.name"
                    icon="mdi-earth"
                  />
                </q-chip>
              </template>
            </q-select>
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
    const route = 'scopes-list'
    const title = this.$gettext('Scope')
    const element = {
      id: 0,
      domain: null,
      included_attributes: [],
      excluded_attributes: []
    }

    return {
      title,
      originalTitle: title,
      model: 'scopes',
      listRoute: route,
      addRoute: 'scope-add',
      detailRoute: 'scope-detail',
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
          text: this.$gettext('Scopes'),
          icon: 'mdi-eye-outline',
          to: route
        }
      ],
      element,
      emptyElement: Object.assign({}, element),
      attributes: [],
      domains: [],
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
        .get(`/api/v1/token/domains/`)
        .then((response) => {
          Object.entries(response.data.results).map(([index, item]) => {
            this.domains.push({
              id: item.id,
              name: item.name
            })
          })
          if (this.element.id)
            this.element.domain = this.domains.find(
              (x) => x.id === this.element.domain
            )
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    elementData() {
      return {
        user: this.$store.getters['auth/user'].pk,
        name: this.element.name,
        domain: this.element.domain ? this.element.domain.id : null,
        included_attributes: this.element.included_attributes.map(
          (item) => item.id
        ),
        excluded_attributes: this.element.excluded_attributes.map(
          (item) => item.id
        )
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
    }
  }
}
</script>