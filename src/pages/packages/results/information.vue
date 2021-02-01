<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Package Information')">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="packages"
          :pk="element.id"
          :value="element.fullname"
          icon="mdi-package-variant"
        />
      </template>
    </Header>

    <q-card>
      <q-card-section>
        <div class="row q-pa-md q-gutter-md">
          <div class="col-md">
            <div v-if="loading" class="text-center">
              <q-spinner-dots color="primary" size="3em" />
            </div>

            <pre>{{ information }}</pre>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'

export default {
  meta() {
    return {
      title: this.title
    }
  },
  components: {
    Breadcrumbs,
    Header,
    MigasLink
  },
  data() {
    const title = this.$gettext('Package Information')

    return {
      title,
      originalTitle: title,
      model: 'packages',
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
          text: this.$gettext('Packages'),
          icon: 'mdi-package-variant',
          to: 'packages-dashboard'
        },
        {
          text: this.$gettext('Results'),
          to: 'packages-list'
        },
        {
          text: 'Id',
          to: { name: 'package-detail', params: { id: 0 } }
        },
        {
          text: this.$gettext('Package Information')
        }
      ],
      element: { id: 0 },
      information: null,
      loading: false
    }
  },
  async mounted() {
    await this.$axios
      .get(`/api/v1/token/${this.model}/${this.$route.params.id}/`)
      .then((response) => {
        this.element = response.data
        this.breadcrumbs.find(
          (x) => x.text === 'Id'
        ).to.params.id = this.element.id
        this.breadcrumbs.find(
          (x) => x.text === 'Id'
        ).text = this.element.fullname
        this.title = `${this.title}: ${this.element.fullname}`
        this.loadInfo()
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })
  },
  methods: {
    async loadInfo() {
      this.loading = true
      await this.$axios
        .get(`/api/v1/token/${this.model}/${this.element.id}/info/`)
        .then((response) => {
          this.information = response.data.data
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
        .finally(() => (this.loading = false))
    }
  }
}
</script>
