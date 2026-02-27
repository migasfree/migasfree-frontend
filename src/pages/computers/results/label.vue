<template>
  <q-page padding class="label-page">
    <Breadcrumbs :items="breadcrumbs" />

    <Header
      :title="$gettext('Identification')"
      :icon="appIcon('identification')"
      :has-export-button="false"
    >
      <template #append>
        <MigasLink
          v-if="computer.id"
          model="computers"
          :pk="computer.id"
          :value="computer.__str__ || ''"
          :icon="elementIcon(computer.status)"
          variant="glass"
        />
      </template>

      <template #actions>
        <q-btn
          unelevated
          color="primary"
          icon="mdi-printer"
          :label="$gettext('Print Label')"
          class="text-weight-bold"
          @click="printLabel"
        />
      </template>
    </Header>

    <div class="row q-col-gutter-xl q-pt-lg justify-center">
      <!-- Label Preview Container -->
      <div class="col-12 col-sm-auto">
        <div class="label-container flex flex-center">
          <!-- The Actual Label (Optimized for Printing) -->
          <div id="printable-label" class="physical-label shadow-10">
            <div class="label-header row no-wrap items-center q-pa-md">
              <img
                alt="Migasfree logo"
                src="~assets/migasfree-logo.svg"
                class="q-mr-md label-logo"
              />
              <div class="column">
                <div
                  class="text-subtitle1 text-weight-bolder brand-text line-height-1"
                >
                  migasfree
                </div>
                <div
                  class="text-caption text-grey-7 uppercase letter-spacing-1 text-weight-bold"
                >
                  {{ $gettext('Identification') }}
                </div>
              </div>
            </div>

            <q-separator color="grey-3" />

            <div class="label-body q-pa-lg">
              <div class="data-group q-mb-md">
                <div
                  class="text-overline text-grey-6 line-height-1 items-center flex"
                >
                  {{ $gettext('ID') }}
                </div>
                <div
                  class="text-h5 text-weight-bolder tracking-tight break-all"
                >
                  {{ label.search }}
                </div>
              </div>

              <div class="data-group q-mb-lg">
                <div class="text-overline text-grey-6 line-height-1">UUID</div>
                <div
                  class="text-body2 text-weight-bold mono-font break-all opacity-80"
                >
                  {{ label.uuid }}
                </div>
              </div>

              <div class="data-group row no-wrap items-center">
                <q-icon
                  name="mdi-server-network"
                  size="xs"
                  color="grey-7"
                  class="q-mr-sm"
                />
                <div class="text-caption text-weight-medium text-grey-8">
                  {{ server }}
                </div>
              </div>
            </div>

            <div class="label-footer q-pa-sm bg-grey-1 text-center border-top">
              <div class="text-caption text-weight-medium text-grey-8">
                <span class="text-weight-bold">{{ label.helpdesk }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Hint -->
        <div class="text-center q-mt-lg opacity-60 flex flex-center">
          <q-icon name="mdi-information-outline" size="xs" class="q-mr-xs" />
          <span class="text-caption">
            {{ $gettext('Label size optimized for 80x50mm thermal printers.') }}
          </span>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'
import { appIcon, modelIcon, useElement } from 'composables/element'

defineOptions({ name: 'IdentificationLabel' })

const { $gettext } = useGettext()
const route = useRoute()
const uiStore = useUiStore()

const { elementIcon } = useElement()

const computer = reactive({})
const label = reactive({
  search: '',
  uuid: '',
  helpdesk: '',
})

const server = computed(() => uiStore.server)

const breadcrumbs = computed(() => [
  {
    text: $gettext('Dashboard'),
    icon: appIcon('home'),
    to: 'home',
  },
  {
    text: $gettext('Data'),
    icon: appIcon('data'),
  },
  {
    text: $gettext('Computers'),
    icon: modelIcon('computers'),
    to: 'computers-dashboard',
  },
  {
    text: $gettext('Results'),
    icon: appIcon('results'),
    to: 'computers-list',
  },
  {
    text: label.search || 'ID',
    to: { name: 'computer-detail', params: { id: route.params.id } },
  },
  {
    text: $gettext('Identification'),
    icon: appIcon('identification'),
  },
])

const getLabel = async () => {
  try {
    const { data } = await api.get(
      `/api/v1/token/computers/${route.params.id}/label`,
    )
    Object.assign(label, data)
  } catch (error) {
    uiStore.notifyError(error)
  }
}

const printLabel = () => {
  window.print()
}

const getComputer = async () => {
  try {
    const { data } = await api.get(
      `/api/v1/token/computers/${route.params.id}/`,
    )
    Object.assign(computer, data)
  } catch (error) {
    uiStore.notifyError(error)
  }
}

onMounted(() => {
  getLabel()
  getComputer()
})

useMeta(() => ({
  title: label.search
    ? `${$gettext('Identification')}: ${label.search}`
    : $gettext('Identification'),
}))
</script>

<style scoped>
.label-page {
  background: radial-gradient(
    circle at top right,
    rgba(var(--brand-primary-rgb), 0.05),
    transparent
  );
}

.physical-label {
  width: 320px;
  background: white;
  color: #1a1210;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
  font-family: var(--font-ui);
}

.label-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.brand-text {
  color: var(--brand-primary);
  letter-spacing: -1px;
}

.letter-spacing-1 {
  letter-spacing: 1.5px;
}

.line-height-1 {
  line-height: 1;
}

.tracking-tighter {
  letter-spacing: -2px;
}

.mono-font {
  font-family: var(--font-mono);
}

.break-all {
  word-break: break-all;
}

.border-top {
  border-top: 1px dashed #e0e0e0;
}

.uppercase {
  text-transform: uppercase;
}

/* Print Styles */
@media print {
  /* Configuración de página */
  @page {
    margin: 10mm;
    size: auto;
  }

  /* Forzar colores de fondo y eliminar elementos de la UI */
  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    background: white !important;
  }

  /* Ocultar TODO menos la etiqueta y su contenido */
  body > *:not(#q-app),
  .q-header,
  .q-footer,
  .q-drawer,
  .q-notifications,
  .page-header,
  .breadcrumbs-container,
  .q-btn,
  .opacity-60 {
    display: none !important;
  }

  /* Resetear contenedores de Quasar para que no ocupen espacio o bloqueen el renderizado */
  #q-app,
  .q-layout,
  .q-page-container,
  .q-page,
  .label-page,
  .row {
    display: block !important;
    padding: 0 !important;
    margin: 0 !important;
    background: none !important;
    box-shadow: none !important;
    border: none !important;
    min-height: 0 !important;
    height: auto !important;
    width: auto !important;
  }

  /* Estilo de la etiqueta en Impresión (Idéntico a la Web) */
  #printable-label {
    visibility: visible !important;
    position: relative !important;
    display: block !important;
    width: 320px !important;
    height: auto !important;
    margin: 20px auto !important;
    border: 1px solid #e0e0e0 !important;
    border-radius: 12px !important;
    background-color: #ffffff !important;
    box-shadow: none !important;
    overflow: hidden !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  #printable-label * {
    visibility: visible !important;
    color: #1a1210 !important;
    font-family: 'Dosis', sans-serif !important;
  }

  /* Forzar fondos semánticos */
  #printable-label .bg-grey-1 {
    background-color: #f5f5f5 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  #printable-label .text-primary {
    color: #431407 !important;
  }

  #printable-label .brand-text {
    color: #431407 !important;
  }

  /* Ajustar los grupos de datos para evitar desalineamiento */
  .label-body {
    padding: 24px !important;
  }

  .label-body .row {
    display: flex !important;
    flex-wrap: nowrap !important;
    align-items: baseline !important;
  }

  .tracking-tighter {
    letter-spacing: -1px !important;
  }

  .border-top {
    border-top: 1px dashed #e0e0e0 !important;
  }
}
</style>
