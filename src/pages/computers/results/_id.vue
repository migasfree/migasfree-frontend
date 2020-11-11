<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <template v-if="element.id">
      <div class="row">
        <div class="col-md">
          <h2 class="text-h3">
            Ordenador:
            <MigasLink
              model="computers"
              :pk="element.id"
              :value="element.__str__ || ''"
              :icon="elementIcon(element.status)"
            />
          </h2>
        </div>
      </div>

      <div class="row q-pa-md">
        <div class="col-md">
          <q-card>
            <q-card-section>
              <q-btn-group v-if="$store.getters['auth/user'].is_superuser">
                <q-input v-model="element.name" outlined label="Nombre" />
                <q-btn color="primary" icon="mdi-content-save" />
              </q-btn-group>
              <div v-else class="text-h5">{{ element.name }}</div>
            </q-card-section>

            <q-card-section>
              <div class="row q-pa-md">
                <q-tooltip>full qualified domain name</q-tooltip>
                <q-icon name="mdi-information" /> {{ element.fqdn }}
              </div>

              <div class="row q-pa-md">
                <div class="col-md">
                  <q-tooltip>project</q-tooltip>
                  <q-icon name="mdi-sitemap" />
                  <MigasLink
                    model="projects"
                    :pk="element.project.id"
                    :value="element.project.name"
                  />
                </div>
                <div class="col-md">
                  <q-tooltip>Date of entry into the migasfree system</q-tooltip>
                  <q-icon name="mdi-calendar-plus" />
                  {{ showDate(element.created_at) }}
                </div>
              </div>

              <div class="row q-pa-md">
                <div class="col-md">
                  <q-tooltip>ip address</q-tooltip>
                  <q-icon name="mdi-ip-network" /> {{ element.ip_address }}
                </div>
                <div class="col-md">
                  <q-tooltip>forwarded ip address</q-tooltip>
                  <q-icon name="mdi-ip" /> {{ element.forwarded_ip_address }}
                </div>
              </div>
            </q-card-section>

            <q-card-actions>
              <q-btn-group>
                <q-btn
                  icon="mdi-calendar-multiple"
                  label="Sucesos"
                  :to="{
                    name: 'computer-events',
                    params: { id: element.id }
                  }"
                />
                <q-btn
                  icon="mdi-head-sync-outline"
                  label="Simular sincronización"
                  :to="{
                    name: 'computer-simulate',
                    params: { id: element.id }
                  }"
                />
                <q-btn
                  icon="mdi-card-account-details-outline"
                  label="Identificación"
                  :to="{
                    name: 'computer-label',
                    params: { id: element.id }
                  }"
                />
              </q-btn-group>
            </q-card-actions>
          </q-card>
        </div>

        <div class="col-md">
          <q-card>
            <q-card-section>
              <div class="text-h5">Hardware</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>

    {{ element }}
  </q-page>
</template>

<script>
import { date } from 'quasar'
import Breadcrumbs from 'components/ui/Breadcrumbs'
import MigasLink from 'components/MigasLink'
import { elementMixin } from 'mixins/element'

export default {
  components: {
    Breadcrumbs,
    MigasLink
  },
  mixins: [elementMixin],
  data() {
    return {
      breadcrumbs: [
        {
          text: 'Dashboard',
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: 'Datos',
          icon: 'mdi-database-search'
        },
        {
          text: 'Ordenadores',
          to: 'computers-dashboard'
        },
        {
          text: 'Resultados',
          to: 'computers-list'
        },
        {
          text: 'Id'
        }
      ],
      element: {}
    }
  },
  async mounted() {
    await this.$axios
      .get(`/api/v1/token/computers/${this.$route.params.id}/`)
      .then((response) => {
        console.log(response)
        this.element = response.data
        this.breadcrumbs[4].text = this.element.__str__
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error.response.data.detail)
      })
  },
  methods: {
    showDate(isoString) {
      return date.formatDate(Date.parse(isoString), 'YYYY-MM-DD HH:mm:ss')
    }
  }
}
</script>
