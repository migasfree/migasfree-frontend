<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Error')" :has-add-button="false">
      <template v-if="element.id" #append>: {{ element.__str__ }}</template>
    </Header>

    <q-card>
      <q-card-section>
        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <q-checkbox
              v-model="element.checked"
              left-label
              :label="$gettext('Checked?')"
            />
          </div>

          <div class="col-6 col-md">
            <translate>Date</translate>: {{ showDate(element.created_at) }}
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <translate>Computer</translate>:
            <MigasLink
              v-if="element.computer"
              model="computers"
              :pk="element.computer.id"
              :value="element.computer.__str__ || ''"
              :icon="elementIcon(element.computer.status)"
              :tooltip="element.computer.summary"
            />
          </div>

          <div class="col-6 col-md">
            <translate>Project</translate>:
            <MigasLink
              v-if="element.project"
              model="projects"
              :pk="element.project.id"
              :value="element.project.name"
              icon="mdi-sitemap"
            />
          </div>
        </div>

        <div class="row q-pa-md">
          <div class="col-12">
            <q-list bordered>
              <q-toolbar>
                <q-toolbar-title
                  ><div v-translate class="text-body1">
                    Description
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
                <pre class="overflow">{{ element.description }}</pre>
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
import { elementMixin } from 'mixins/element'
import { dateMixin } from 'mixins/date'
import { detailMixin } from 'mixins/detail'
import { copyToClipboard } from 'quasar'

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
  mixins: [elementMixin, dateMixin, detailMixin],
  data() {
    const route = 'errors-list'
    const title = this.$gettext('Error')
    const element = { id: 0 }

    return {
      title,
      originalTitle: title,
      model: 'errors',
      listRoute: route,
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: this.$gettext('Data'),
          icon: 'mdi-database-search'
        },
        {
          text: this.$gettext('Errors'),
          to: 'errors-dashboard',
          icon: 'mdi-bug'
        }
      ],
      element,
      emptyElement: element,
      confirmRemove: false,
      isValid: true
    }
  },
  computed: {
    elementText() {
      return this.element.id ? this.element.__str__ : ''
    }
  },
  methods: {
    elementData() {
      return {
        checked: this.element.checked
      }
    },

    copyInfo() {
      copyToClipboard(this.element.description).then(() => {
        this.$store.dispatch(
          'ui/notifySuccess',
          this.$gettext('Text copied to clipboard')
        )
      })
    }
  }
}
</script>
