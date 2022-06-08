<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Fault')">
      <template v-if="element.id" #append>: {{ element.__str__ }}</template>
    </Header>

    <q-card>
      <q-card-section>
        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md col-sm">
            <q-checkbox
              v-model="element.checked"
              left-label
              :label="$gettext('Checked?')"
            />
          </div>

          <div class="col-6 col-md col-sm">
            <MigasLink
              v-if="element.fault_definition"
              model="fault-definitions"
              :pk="element.fault_definition.id"
              :value="element.fault_definition.name"
              icon="mdi-alert-octagram-outline"
              :tooltip="$gettext('Fault Definition')"
            />
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md col-sm">
            <MigasLink
              v-if="element.computer"
              model="computers"
              :pk="element.computer.id"
              :value="element.computer.__str__ || ''"
              :icon="elementIcon(element.computer.status)"
              :tooltip="element.computer.summary"
            />
          </div>

          <div class="col-6 col-md col-sm">
            <MigasLink
              v-if="element.project"
              model="projects"
              :pk="element.project.id"
              :value="element.project.name"
              icon="mdi-sitemap"
              :tooltip="$gettext('Project')"
            />
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col">
            <q-icon
              name="mdi-calendar-plus"
              size="sm"
              class="vertical-middle"
            />
            <span class="vertical-middle">{{
              showDate(element.created_at)
            }}</span>
            <q-tooltip self="bottom middle"
              >{{ $gettext('Date') }} ({{
                diffForHumans(element.created_at)
              }})</q-tooltip
            >
          </div>
        </div>

        <div class="row q-pa-md">
          <div class="col">
            <q-list bordered>
              <q-toolbar>
                <q-toolbar-title
                  ><div v-translate class="text-body1">
                    Result
                  </div></q-toolbar-title
                >
                <q-btn
                  flat
                  icon="mdi-content-copy"
                  color="primary"
                  @click="copyInfo"
                />
              </q-toolbar>
              <q-item :inset-level="0.5">
                <pre class="overflow">{{ element.result }}</pre>
              </q-item>
            </q-list>
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="justify-around">
        <q-btn
          flat
          color="primary"
          icon="mdi-content-save-edit"
          :label="$gettext('Save and continue editing')"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="updateElement"
        />
        <q-btn
          color="primary"
          icon="mdi-content-save-move"
          :label="$gettext('Save')"
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
        :color="$q.dark.isActive ? 'white' : 'negative'"
        :class="{ 'reversed-delete': $q.dark.isActive }"
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
import { elementMixin } from 'mixins/element'
import { dateMixin } from 'mixins/date'
import { detailMixin } from 'mixins/detail'
import { copyToClipboard } from 'quasar'

export default {
  meta() {
    return {
      title: this.title,
    }
  },
  components: {
    Breadcrumbs,
    Header,
    RemoveDialog,
    MigasLink,
  },
  mixins: [elementMixin, dateMixin, detailMixin],
  data() {
    const route = 'faults-list'
    const title = this.$gettext('Fault')
    const element = { id: 0 }

    return {
      title,
      originalTitle: title,
      model: 'faults',
      listRoute: route,
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home',
        },
        {
          text: this.$gettext('Data'),
          icon: 'mdi-database-search',
        },
        {
          text: this.$gettext('Faults'),
          to: 'faults-dashboard',
          icon: 'mdi-bomb',
        },
      ],
      element,
      emptyElement: Object.assign({}, element),
      confirmRemove: false,
      isValid: true,
    }
  },
  computed: {
    elementText() {
      return this.element.id ? this.element.__str__ : ''
    },
  },
  methods: {
    elementData() {
      return {
        checked: this.element.checked,
      }
    },

    copyInfo() {
      copyToClipboard(this.element.result).then(() => {
        this.$store.dispatch(
          'ui/notifySuccess',
          this.$gettext('Text copied to clipboard')
        )
      })
    },
  },
}
</script>
