<template>
  <q-list>
    <q-expansion-item
      v-for="(item, index) in items"
      :key="index"
      :icon="item.icon"
      :label="item.title"
    >
      <q-list v-for="(option, indx) in item.options" :key="indx">
        <q-item clickable :to="option.to">
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
            { title: 'Plataformas', to: '/platform' },
            { title: 'Proyectos', to: '/project', separatorAfter: true },
            { title: 'Fórmulas', to: '/formula' },
            { title: 'Categorías de etiquetas', to: '/stamp' },
            { title: 'Conjuntos de atributos', to: '/attribute-set' },
            {
              title: 'Definiciones de fallas',
              to: '/fault-definition',
              separatorAfter: true
            },
            { title: 'Perfiles de usuario/a', to: '/user-profile' },
            { title: 'Grupos', to: '/group' },
            { title: 'Dominios', to: '/domain' },
            { title: 'Ámbitos', to: '/scope' }
          ]
        },
        {
          icon: 'mdi-printer-eye',
          title: 'Dispositivos',
          options: [
            { title: 'Fabricantes', to: '/manufacturer' },
            { title: 'Modelos', to: '/model' },
            { title: 'Prestaciones', to: '/feature' },
            { title: 'Dispositivos', to: '/device', separatorAfter: true },
            { title: 'Reemplazo de Dispositivos', to: '/device/replacement' }
          ]
        },
        {
          icon: 'mdi-truck-delivery',
          title: 'Liberación',
          options: [
            { title: 'Despliegues', to: '/deployment' },
            { title: 'Calendarios', to: '/schedule', separatorAfter: true },
            { title: 'Almacenes', to: '/store' },
            { title: 'Información de Paquetes', to: '/package/info' },
            { title: 'Paquetes', to: '/package', separatorAfter: true },
            { title: 'Aplicaciones', to: '/application' },
            { title: 'Políticas', to: '/policy' }
          ]
        },
        {
          icon: 'mdi-database-search',
          title: 'Datos',
          options: [
            { title: 'Ordenadores', to: '/computer' },
            { title: 'Reemplazo de Ordenadores', to: '/computer/replacement' },
            { title: 'Usuarios/as', to: '/user', separatorAfter: true },
            { title: 'Atributos', to: '/attribute' },
            { title: 'Etiquetas', to: '/tag', separatorAfter: true },
            { title: 'Sincronizaciones', to: '/synchronization' },
            { title: 'Errores', to: '/error' },
            { title: 'Fallas', to: '/fault' },
            { title: 'Registros de Estados', to: '/status-log' },
            { title: 'Migraciones', to: '/migration', separatorAfter: true },
            { title: 'Notificaciones', to: '/notification' }
          ]
        }
      ]
    }
  }
}
</script>
