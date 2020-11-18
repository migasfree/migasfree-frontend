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
            /* { title: 'Plataformas', to: 'platforms-dashboard' },
            {
              title: 'Proyectos',
              to: 'projects-dashboard',
              separatorAfter: true
            },
            { title: 'Fórmulas', to: 'formulas-dashboard' },
            { title: 'Categorías de etiquetas', to: 'stamps-dashboard' },
            { title: 'Conjuntos de atributos', to: 'attribute-sets-dashboard' },
            {
              title: 'Definiciones de fallas',
              to: 'fault-definitions-dashboard',
              separatorAfter: true
            },
            { title: 'Perfiles de usuario/a', to: 'user-profiles-dashboard' },
            { title: 'Grupos', to: 'groups-dashboard' },
            { title: 'Dominios', to: 'domains-dashboard' },
            { title: 'Ámbitos', to: 'scopes-dashboard' } */
          ]
        },
        {
          icon: 'mdi-printer-eye',
          title: 'Dispositivos',
          options: [
            /* { title: 'Fabricantes', to: 'manufacturers-dashboard' },
            { title: 'Modelos', to: 'models-dashboard' },
            { title: 'Prestaciones', to: 'features-dashboard' },
            {
              title: 'Dispositivos',
              to: 'devices-dashboard',
              separatorAfter: true
            },
            { title: 'Reemplazo de Dispositivos', to: 'devices-replacement' } */
          ]
        },
        {
          icon: 'mdi-truck-delivery',
          title: 'Liberación',
          options: [
            /* { title: 'Despliegues', to: 'deployments-dashboard' },
            {
              title: 'Calendarios',
              to: 'schedules-dashboard',
              separatorAfter: true
            },
            { title: 'Almacenes', to: 'stores-dashboard' },
            { title: 'Información de Paquetes', to: 'packages-info' },
            {
              title: 'Paquetes',
              to: 'packages-dashboard',
              separatorAfter: true
            },
            { title: 'Aplicaciones', to: 'applications-dashboard' },
            { title: 'Políticas', to: 'policies-dashboard' } */
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
              separatorAfter: true
            }, */
            {
              title: 'Atributos',
              to: 'attributes-dashboard',
              icon: 'mdi-pound'
            }
            /* { title: 'Etiquetas', to: 'tags-dashboard', separatorAfter: true },
            { title: 'Sincronizaciones', to: 'synchronizations-dashboard', icon: 'mdi-sync' },
            { title: 'Errores', to: 'errors-dashboard', icon: 'mdi-bug' },
            { title: 'Fallas', to: 'faults-dashboard', icon: 'mdi-bomb' },
            { title: 'Registros de Estados', to: 'status-logs-dashboard', icon: 'mdi-flag-variant' },
            {
              title: 'Migraciones',
              to: 'migrations-dashboard',
              icon: 'mdi-map-marker-right',
              separatorAfter: true
            },
            { title: 'Notificaciones', to: 'notifications-dashboard' } */
          ]
        }
      ]
    }
  }
}
</script>
