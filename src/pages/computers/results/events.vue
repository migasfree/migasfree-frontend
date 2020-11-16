<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <template v-if="computer.id">
      <div class="row">
        <div class="col-md">
          <h2 class="text-h3">
            Sucesos:
            <MigasLink
              model="computers"
              :pk="computer.id"
              :value="computer.__str__ || ''"
              :icon="elementIcon(computer.status)"
            />
          </h2>
        </div>
      </div>

      <div class="row">
        <h3 class="text-h5">
          <q-tooltip self="bottom middle"
            >Date of entry into the migasfree system</q-tooltip
          >
          <q-icon name="mdi-calendar-plus" size="md" />
          {{ showDate(computer.created_at) }}
        </h3>
      </div>

      <div class="row">
        <q-btn-group>
          <q-btn label="Sincronizaciones" no-caps />
          <q-btn label="Errores" no-caps />
          <q-btn label="Fallas" no-caps />
          <q-btn label="Registros de Estado" no-caps />
          <q-btn label="Migraciones" no-caps />
        </q-btn-group>
      </div>

      <div class="row">
        <HeatMap
          :data="{ data: [] }"
          :start="showDate(computer.created_at, 'YYYY-MM-DD')"
        />
      </div>
    </template>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import MigasLink from 'components/MigasLink'
import HeatMap from 'components/chart/HeatMap'
import { elementMixin } from 'mixins/element'
import { dateMixin } from 'mixins/date'

export default {
  components: { Breadcrumbs, MigasLink, HeatMap },
  mixins: [elementMixin, dateMixin],
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
          text: 'Id',
          to: { name: 'computer-detail', params: { id: 0 } }
        },
        {
          text: 'Sucesos'
        }
      ],
      computer: {}
    }
  },
  async mounted() {
    await this.$axios
      .get(`/api/v1/token/computers/${this.$route.params.id}/`)
      .then((response) => {
        console.log(response)
        this.computer = response.data
        this.breadcrumbs[4].text = this.computer.__str__
        this.breadcrumbs[4].to.params.id = this.computer.id
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error.response.data.detail)
      })
  }
}
</script>
