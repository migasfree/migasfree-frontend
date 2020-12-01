<template>
  <q-list>
    <q-expansion-item
      v-for="(item, index) in items"
      :key="index"
      :icon="item.icon"
      :label="item.title"
    >
      <q-list v-for="option in item.options" :key="option.to">
        <q-item clickable :to="{ name: option.to }" :inset-level="1">
          <q-item-section v-if="option.icon">
            <q-icon :name="option.icon" size="sm" />
          </q-item-section>
          <q-item-section>{{ option.title }}</q-item-section>
        </q-item>
        <q-separator v-if="option.separatorAfter" />
      </q-list>
    </q-expansion-item>
  </q-list>
</template>

<script>
export default {
  name: 'AppMenu',
  data() {
    return {
      items: [
        {
          icon: 'mdi-cogs',
          title: 'Configuración',
          options: [
            {
              title: 'Plataformas',
              to: 'platforms-list',
              icon: 'mdi-layers'
            }
            /* {
              title: 'Proyectos',
              to: 'projects-dashboard',
              icon: 'mdi-sitemap',
              separatorAfter: true
            },
            { title: 'Fórmulas', to: 'formulas-dashboard', icon: 'mdi-function-variant' },
            { title: 'Categorías de etiquetas', to: 'stamps-dashboard', icon: 'mdi-stamper' },
            { title: 'Conjuntos de atributos', to: 'attribute-sets-dashboard', icon: 'mdi-set-none' },
            {
              title: 'Definiciones de fallas',
              to: 'fault-definitions-dashboard',
              icon: 'mdi-alert-octagram-outline',
              separatorAfter: true
            },
            { title: 'Perfiles de usuario/a', to: 'user-profiles-dashboard', icon: 'mdi-account-cog' },
            { title: 'Grupos', to: 'groups-dashboard', icon: 'mdi-account-group' },
            { title: 'Dominios', to: 'domains-dashboard', icon: 'mdi-earth' },
            { title: 'Ámbitos', to: 'scopes-dashboard', icon: 'mdi-eye-outline' } */
          ]
        },
        {
          icon: 'mdi-printer-eye',
          title: 'Dispositivos',
          options: [
            /* { title: 'Fabricantes', to: 'manufacturers-dashboard', icon: 'mdi-factory' },
            { title: 'Modelos', to: 'models-dashboard', icon: 'mdi-shape' },
            { title: 'Prestaciones', to: 'features-dashboard', icon: 'mdi-format-list-bulleted-type' },
            {
              title: 'Dispositivos',
              to: 'devices-dashboard',
              icon: 'mdi-printer',
              separatorAfter: true
            },
            { title: 'Reemplazo de Dispositivos', to: 'devices-replacement' } */
          ]
        },
        {
          icon: 'mdi-truck-delivery',
          title: 'Liberación',
          options: [
            /* { title: 'Despliegues', to: 'deployments-dashboard', icon: 'mdi-rocket-launch' },
            {
              title: 'Calendarios',
              to: 'schedules-dashboard',
              icon: 'mdi-calendar-start',
              separatorAfter: true
            },
            { title: 'Almacenes', to: 'stores-dashboard', icon: 'mdi-store-24-hour' },
            { title: 'Información de Paquetes', to: 'packages-info' },
            {
              title: 'Paquetes',
              to: 'packages-dashboard',
              icon: 'mdi-package-variant',
              separatorAfter: true
            },
            { title: 'Aplicaciones', to: 'applications-dashboard', icon: 'mdi-apps' },
            { title: 'Políticas', to: 'policies-dashboard', icon: 'mdi-shield-half-full' } */
          ]
        },
        {
          icon: 'mdi-database-search',
          title: 'Datos',
          options: [
            {
              title: 'Ordenadores',
              to: 'computers-dashboard',
              icon: 'mdi-desktop-classic'
            },
            /* { title: 'Reemplazo de Ordenadores', to: 'computers-replacement' },
            {
              title: 'Usuarios/as',
              to: 'users-dashboard',
              icon: 'mdi-account',
              separatorAfter: true
            }, */
            {
              title: 'Atributos',
              to: 'attributes-dashboard',
              icon: 'mdi-pound'
            },
            {
              title: 'Etiquetas',
              to: 'tags-dashboard',
              icon: 'mdi-tag',
              separatorAfter: true
            },
            {
              title: 'Sincronizaciones',
              to: 'syncs-dashboard',
              icon: 'mdi-sync'
            },
            { title: 'Errores', to: 'errors-dashboard', icon: 'mdi-bug' },
            { title: 'Fallas', to: 'faults-dashboard', icon: 'mdi-bomb' }
            /* { title: 'Registros de Estados', to: 'status-logs-dashboard', icon: 'mdi-flag-variant' },
            {
              title: 'Migraciones',
              to: 'migrations-dashboard',
              icon: 'mdi-map-marker-right',
              separatorAfter: true
            },
            { title: 'Mensajes', to: 'messages-dashboard', icon: 'mdi-message-text' },
            { title: 'Notificaciones', to: 'notifications-dashboard', icon: 'mdi-android-messages' } */
          ]
        }
      ]
    }
  }
}
</script>
