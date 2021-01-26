<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Store')" :has-add-button="false">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="stores"
          :pk="element.id"
          :value="element.name"
          icon="mdi-store-24-hour"
        />
      </template>
    </Header>

    <q-card>
      <q-card-section>
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
            <q-input
              v-model="element.name"
              outlined
              :label="$gettext('Name')"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
            />
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
  mixins: [detailMixin],
  data() {
    const title = this.$gettext('Store')
    const element = { id: 0 }

    return {
      title,
      originalTitle: title,
      model: 'stores',
      listRoute: 'stores-list',
      addRoute: 'store-add',
      detailRoute: 'store-detail',
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
          text: this.$gettext('Stores'),
          to: 'stores-dashboard',
          icon: 'mdi-store-24-hour'
        }
      ],
      element,
      emptyElement: Object.assign({}, element),
      projects: [],
      confirmRemove: false
    }
  },
  computed: {
    isValid() {
      return (
        this.element.name !== undefined &&
        this.element.name !== '' &&
        this.element.hasOwnProperty('project')
      )
    }
  },
  methods: {
    async loadRelated() {
      await this.$axios
        .get(`/api/v1/token/projects/`)
        .then((response) => {
          this.projects = response.data.results
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    elementData() {
      return {
        project: this.element.project.id,
        name: this.element.name
      }
    },

    setRelated() {
      if (typeof this.element.project === 'number')
        this.element.project = this.projects.find(
          (x) => x.id === this.element.project
        )
    }
  }
}
</script>
