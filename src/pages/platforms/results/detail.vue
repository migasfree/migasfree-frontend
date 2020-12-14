<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Platform')" :has-add-button="false">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="platforms"
          :pk="element.id"
          :value="element.name"
          icon="mdi-layers"
        />
      </template>
    </Header>

    <q-card>
      <q-card-section>
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
    return {
      title: this.$gettext('Platform'),
      model: 'platforms',
      listRoute: 'platforms-list',
      addRoute: 'platform-add',
      detailRoute: 'platform-detail',
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
          text: this.$gettext('Platforms'),
          icon: 'mdi-layers',
          to: this.listRoute
        }
      ],
      element: { id: 0 },
      stamps: [],
      loading: false,
      confirmRemove: false
    }
  },
  computed: {
    isValid() {
      return this.element.name !== undefined && this.element.name !== ''
    }
  },
  created() {
    if (this.$route.params.id) {
      this.breadcrumbs.push({
        text: this.$gettext('Results'),
        to: this.listRoute
      })
      this.breadcrumbs.push({
        text: 'Id'
      })
    } else {
      this.breadcrumbs.push({ text: this.$gettext('Add') })
    }
  },
  async mounted() {
    if (this.$route.params.id) {
      await this.$axios
        .get(`/api/v1/token/${this.model}/${this.$route.params.id}/`)
        .then((response) => {
          this.element = response.data
          this.breadcrumbs.find((x) => x.text === 'Id').text = this.element.name
          this.title = `${this.title}: ${this.element.name}`
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    }
  },
  methods: {
    async updateElement(action = null) {
      if (this.element.id) {
        this.loading = true
        await this.$axios
          .patch(`/api/v1/token/${this.model}/${this.element.id}/`, {
            name: this.element.name
          })
          .then((response) => {
            this.$store.dispatch(
              'ui/notifySuccess',
              this.$gettext('Data has been changed!')
            )
            if (action === 'return') {
              this.$router.push({ name: this.listRoute })
            } else if (action === 'add') {
              this.element = { id: 0 }
              if (this.breadcrumbs.length === 5) this.breadcrumbs.pop()
              this.breadcrumbs[3].text = this.$gettext('Add')
              this.$router.push({ name: this.addRoute })
              this.title = this.$gettext('Platform')
            }
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
          .finally(() => (this.loading = false))
      } else {
        this.loading = true
        await this.$axios
          .post(`/api/v1/token/${this.model}/`, {
            name: this.element.name
          })
          .then((response) => {
            this.element = response.data
            console.log('element new', this.element)
            this.$store.dispatch(
              'ui/notifySuccess',
              this.$gettext('Data has been added!')
            )

            if (action === 'return') {
              this.$router.push({ name: this.listRoute })
            } else if (action === 'add') {
              this.element = { id: 0 }
              this.$router.push({ name: this.addRoute })
            } else {
              if (this.breadcrumbs.length === 4) {
                this.breadcrumbs.pop()
                this.breadcrumbs.push({
                  text: this.$gettext('Results'),
                  to: this.listRoute
                })
                this.breadcrumbs.push({
                  text: this.element.name
                })
                this.title = `${this.$gettext('Platform')}: ${this.element.name}`
              }
              this.$router.push({
                name: this.detailRoute,
                params: { id: this.element.id }
              })
            }
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
          .finally(() => (this.loading = false))
      }
    }
  }
}
</script>
