<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Group')" :has-add-button="false">
      <template v-if="element.id" #append>: {{ element.name }} </template>
    </Header>

    <q-card>
      <q-card-section>
        <div class="row q-pa-md q-gutter-md">
          <div class="col-12">
            <q-input
              v-model="element.name"
              :label="$gettext('Name')"
              outlined
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
            />
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-12">
            <q-select
              v-model="element.permissions"
              outlined
              use-input
              map-options
              multiple
              input-debounce="0"
              :label="$gettext('Permissions')"
              :options="permissions"
              @filter="filterPermissions"
              @filter-abort="abortFilterPermissions"
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
                  {{ scope.opt.name }}
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
import RemoveDialog from 'components/ui/RemoveDialog'
import { detailMixin } from 'mixins/detail'

export default {
  meta() {
    return {
      title: this.title
    }
  },
  components: {
    Breadcrumbs,
    Header,
    RemoveDialog
  },
  mixins: [detailMixin],
  data() {
    const route = 'groups-list'
    const title = this.$gettext('Group')
    const element = {
      id: 0,
      permissions: []
    }

    return {
      title,
      originalTitle: title,
      model: 'accounts/groups',
      listRoute: route,
      addRoute: 'group-add',
      detailRoute: 'group-detail',
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
          text: this.$gettext('Groups'),
          icon: 'mdi-account-group',
          to: route
        }
      ],
      element,
      emptyElement: Object.assign({}, element),
      permissions: [],
      confirmRemove: false
    }
  },
  computed: {
    isValid() {
      return this.element.name !== undefined && this.element.name !== ''
    }
  },
  methods: {
    elementData() {
      return {
        name: this.element.name,
        permissions: this.element.permissions.map((item) => item.id)
      }
    },

    filterPermissions(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3) {
        abort()
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.$axios
          .get('/api/v1/token/accounts/permissions', {
            params: { search: needle }
          })
          .then((response) => {
            this.permissions = response.data.results
          })
        /* this.permissions = stringOptions.filter(
          (v) => v.toLowerCase().indexOf(needle) > -1
        ) */
      })
    },

    abortFilterPermissions() {
      // console.log('delayed filter aborted')
    }
  }
}
</script>
