<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Project')" :has-add-button="false">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="projects"
          :pk="element.id"
          :value="element.name"
          icon="mdi-sitemap"
        />
      </template>
    </Header>

    <q-card>
      <q-card-section>
        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <q-select
              v-model="element.platform"
              outlined
              :label="$gettext('Platform')"
              :options="platforms"
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

        <div class="row q-pa-md q-gutter-md">
          <div class="col-4 col-md">
            <q-checkbox
              v-model="element.auto_register_computers"
              left-label
              :label="$gettext('Auto register computers?')"
            />
          </div>

          <div class="col-4 col-md">
            <q-select
              v-model="element.pms"
              outlined
              :label="$gettext('Package Management System')"
              :options="pms"
              option-value="id"
              option-label="name"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
            />
          </div>

          <div class="col-4 col-md">
            <q-input
              v-model="element.architecture"
              outlined
              :label="$gettext('Architecture')"
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
    const route = 'projects-list'
    const title = this.$gettext('Project')
    const element = { id: 0, auto_register_computers: false }

    return {
      title,
      originalTitle: title,
      model: 'projects',
      listRoute: route,
      addRoute: 'project-add',
      detailRoute: 'project-detail',
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
          text: this.$gettext('Projects'),
          icon: 'mdi-sitemap',
          to: route
        }
      ],
      element,
      emptyElement: Object.assign({}, element),
      platforms: [],
      pms: [],
      confirmRemove: false
    }
  },
  computed: {
    isValid() {
      return (
        this.element.name !== undefined &&
        this.element.name !== '' &&
        this.element.platform !== undefined &&
        this.element.pms !== undefined &&
        this.element.architecture !== undefined
      )
    }
  },
  methods: {
    async loadRelated() {
      await this.$axios
        .get(`/api/v1/token/platforms/`)
        .then((response) => {
          this.platforms = response.data.results
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })

      await this.$axios
        .get(`/api/v1/public/pms/`)
        .then((response) => {
          Object.entries(response.data).map(([key, val]) => {
            this.pms.push({
              id: key,
              name: val
            })
          })
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    elementData() {
      return {
        name: this.element.name,
        architecture: this.element.architecture,
        platform: this.element.platform.id,
        auto_register_computers: this.element.auto_register_computers,
        pms: this.element.pms.id
      }
    },

    setRelated() {
      this.element.platform = this.platforms.find(
        (x) => x.id === this.element.platform
      )
      this.element.pms = this.pms.find((x) => x.id == this.element.pms)
    }
  }
}
</script>
