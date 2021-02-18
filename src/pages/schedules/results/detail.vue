<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Schedule')">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="schedules"
          :pk="element.id"
          :value="element.name"
          icon="mdi-calendar-start"
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
            />
          </div>

          <div class="col-6 col-md">
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
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">Delays</div>

        <q-list v-if="delays.length > 0" class="q-pa-md" bordered separator>
          <q-item v-for="(delay, index) in delays" :key="index">
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
                    v-model="delay.delay"
                    outlined
                    type="number"
                    :label="$gettext('Delay')"
                    lazy-rules
                    :rules="[(val) => !!val || $gettext('* Required')]"
                  />
                </div>

                <div class="col-md">
                  <q-input
                    v-model="delay.duration"
                    outlined
                    type="number"
                    :label="$gettext('Duration')"
                    lazy-rules
                    :rules="[(val) => !!val || $gettext('* Required')]"
                  />
                </div>
              </div>

              <div class="row q-pa-md q-gutter-md">
                <div class="col-md">
                  <q-select
                    v-model="delay.attributes"
                    outlined
                    use-input
                    map-options
                    multiple
                    input-debounce="0"
                    :label="$gettext('Attributes')"
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
            </q-item-section>
          </q-item>
        </q-list>

        <div class="q-pa-md">
          <q-btn
            icon="mdi-plus"
            :label="$gettext('Add other Delay')"
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
    const route = 'schedules-list'
    const title = this.$gettext('Schedule')
    const element = { id: 0 }

    return {
      title,
      originalTitle: title,
      model: 'schedules',
      listRoute: route,
      addRoute: 'schedule-add',
      detailRoute: 'schedule-detail',
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
          text: this.$gettext('Schedules'),
          icon: 'mdi-calendar-start',
          to: route
        }
      ],
      element,
      emptyElement: Object.assign({}, element),
      delays: [],
      removedDelays: [],
      attributes: [],
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
          .get(`/api/v1/token/schedule-delays/?schedule__id=${this.element.id}`)
          .then((response) => {
            this.delays = response.data.results
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
      }
    },

    elementData() {
      return {
        name: this.element.name,
        description: this.element.description
      }
    },

    addInline() {
      this.delays.push({
        id: 0,
        delay: this.delays.length
          ? parseInt(this.delays[this.delays.length - 1].delay) + 1
          : 0,
        duration: 1,
        attributes: null
      })
    },

    removeInline(index) {
      const removedItem = this.delays.splice(index, 1)[0]
      if (removedItem.id > 0) {
        this.removedDelays.push(removedItem.id)
      }
    },

    async updateRelated() {
      this.delays.forEach((delay) => {
        if (delay.delay === undefined || delay.duration === undefined) {
          return
        }

        if (delay.id > 0) {
          this.$axios
            .patch(`/api/v1/token/schedule-delays/${delay.id}/`, {
              schedule: this.element.id,
              delay: delay.delay,
              duration: delay.duration,
              attributes: delay.attributes.map((item) => item.id)
            })
            .catch((error) => {
              this.$store.dispatch('ui/notifyError', error)
            })
        } else {
          this.$axios
            .post('/api/v1/token/schedule-delays/', {
              schedule: this.element.id,
              delay: delay.delay,
              duration: delay.duration,
              attributes: delay.attributes.map((item) => item.id)
            })
            .catch((error) => {
              this.$store.dispatch('ui/notifyError', error)
            })
        }
      })

      this.removedDelays.forEach((id) => {
        this.$axios
          .delete(`/api/v1/token/schedule-delays/${id}/`)
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
      })
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
