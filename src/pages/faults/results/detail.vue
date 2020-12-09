<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <div class="row">
      <div class="col-md">
        <h2 class="text-h3">Fault: {{ element.__str__ }}</h2>
      </div>
    </div>

    <q-card>
      <q-card-section>
        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <q-checkbox
              v-model="element.checked"
              left-label
              label="¿Comprobado?"
            />
          </div>

          <div class="col-6 col-md">
            Definición de falla:
            <MigasLink
              v-if="element.fault_definition"
              model="fault-definitions"
              :pk="element.fault_definition.id"
              :value="element.fault_definition.name"
            />
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            Ordenador:
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
            Proyecto:
            <MigasLink
              v-if="element.project"
              model="projects"
              :pk="element.project.id"
              :value="element.project.name"
            />
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            Fecha: {{ showDate(element.created_at) }}
          </div>
        </div>

        <div class="row q-pa-md">
          <div class="col-12">
            <q-list bordered>
              <q-toolbar>
                <q-toolbar-title
                  ><div class="text-body1">Resultado</div></q-toolbar-title
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
          label="Grabar y seguir editando"
          icon="mdi-content-save-edit"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="updateElement"
        />
        <q-btn
          label="Grabar"
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
        label="Borrar"
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
import MigasLink from 'components/MigasLink'
import RemoveDialog from 'components/ui/RemoveDialog'
import { elementMixin } from 'mixins/element'
import { dateMixin } from 'mixins/date'
import { copyToClipboard } from 'quasar'

export default {
  meta() {
    return {
      title: this.title
    }
  },
  components: {
    Breadcrumbs,
    RemoveDialog,
    MigasLink
  },
  mixins: [elementMixin, dateMixin],
  data() {
    return {
      title: 'Falla',
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
          text: 'Fallas',
          to: 'faults-dashboard',
          icon: 'mdi-bomb'
        },
        {
          text: 'Resultados',
          to: 'faults-list'
        },
        {
          text: 'Id'
        }
      ],
      element: { id: 0 },
      loading: false,
      confirmRemove: false,
      isValid: true
    }
  },
  async mounted() {
    if (this.$route.params.id) {
      await this.$axios
        .get(`/api/v1/token/faults/${this.$route.params.id}/`)
        .then((response) => {
          this.element = response.data
          this.breadcrumbs[
            this.breadcrumbs.length - 1
          ].text = this.element.__str__
          this.title = `${this.title}: ${this.element.__str__}`
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
          .patch(`/api/v1/token/faults/${this.element.id}/`, {
            checked: this.element.checked
          })
          .then((response) => {
            this.$store.dispatch('ui/notifySuccess', 'Data has been changed!')
            if (action === 'return') {
              this.$router.push({ name: 'faults-list' })
            }
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
          .finally(() => (this.loading = false))
      }
    },

    async remove() {
      await this.$axios
        .delete(`/api/v1/token/faults/${this.element.id}/`)
        .then((response) => {
          this.$router.push({ name: 'faults-list' })
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    copyInfo() {
      copyToClipboard(this.element.result).then(() => {
        this.$store.dispatch('ui/notifySuccess', 'Text copied to clipboard')
      })
    }
  }
}
</script>
