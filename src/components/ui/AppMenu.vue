<template>
  <q-list>
    <q-expansion-item
      v-for="(item, index) in items"
      :key="index"
      :icon="item.icon"
      :label="item.title"
    >
      <q-list v-for="option in item.options" :key="option.to">
        <q-separator v-if="option.separatorBefore" />
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
    let extraDevices = []

    if (this.$store.getters['auth/user'].is_superuser)
      extraDevices = [
        {
          title: this.$gettext('Connections'),
          to: 'connections-list',
          icon: 'mdi-connection',
          separatorBefore: true
        },
        {
          title: this.$gettext('Device Types'),
          to: 'device-types-list',
          icon: 'mdi-devices'
        },
        {
          title: this.$gettext('Logical Devices'),
          to: 'logical-devices-list',
          icon: 'mdi-printer-settings'
        }
      ]

    return {
      items: [
        {
          icon: 'mdi-cogs',
          title: this.$gettext('Configuration'),
          options: [
            {
              title: this.$gettext('Platforms'),
              to: 'platforms-list',
              icon: 'mdi-layers'
            },
            {
              title: this.$gettext('Projects'),
              to: 'projects-list',
              icon: 'mdi-sitemap',
              separatorAfter: true
            },
            {
              title: this.$gettext('Formulas'),
              to: 'formulas-list',
              icon: 'mdi-function-variant'
            },
            {
              title: this.$gettext('Stamps'),
              to: 'stamps-list',
              icon: 'mdi-stamper'
            },
            {
              title: this.$gettext('Attribute Sets'),
              to: 'attribute-sets-list',
              icon: 'mdi-set-none'
            },
            {
              title: this.$gettext('Fault Definitions'),
              to: 'fault-definitions-list',
              icon: 'mdi-alert-octagram-outline',
              separatorAfter: true
            },
            {
              title: this.$gettext('User Profiles'),
              to: 'user-profiles-list',
              icon: 'mdi-account-cog'
            },
            {
              title: this.$gettext('Groups'),
              to: 'groups-list',
              icon: 'mdi-account-group'
            },
            {
              title: this.$gettext('Domains'),
              to: 'domains-list',
              icon: 'mdi-earth'
            },
            {
              title: this.$gettext('Scopes'),
              to: 'scopes-list',
              icon: 'mdi-eye-outline'
            }
          ]
        },
        {
          icon: 'mdi-printer-eye',
          title: this.$gettext('Devices'),
          options: [
            {
              title: this.$gettext('Manufacturers'),
              to: 'manufacturers-list',
              icon: 'mdi-factory'
            },
            {
              title: this.$gettext('Models'),
              to: 'models-dashboard',
              icon: 'mdi-shape'
            },
            {
              title: this.$gettext('Capabilities'),
              to: 'capabilities-list',
              icon: 'mdi-format-list-bulleted-type'
            },
            {
              title: this.$gettext('Devices'),
              to: 'devices-dashboard',
              icon: 'mdi-printer',
              separatorAfter: true
            }
            // { title: this.$gettext('Device Replacement'), to: 'devices-replacement' }
          ].concat(extraDevices)
        },
        {
          icon: 'mdi-truck-delivery',
          title: this.$gettext('Release'),
          options: [
            // { title: this.$gettext('Deployments'), to: 'deployments-dashboard', icon: 'mdi-rocket-launch' },
            {
              title: this.$gettext('Schedules'),
              to: 'schedules-list',
              icon: 'mdi-calendar-start',
              separatorAfter: true
            },
            {
              title: this.$gettext('Stores'),
              to: 'stores-dashboard',
              icon: 'mdi-store-24-hour'
            },
            // { title: this.$gettext('Package Info'), to: 'packages-info' },
            {
              title: this.$gettext('Packages'),
              to: 'packages-dashboard',
              icon: 'mdi-package-variant',
              separatorAfter: true
            }
            /* { title: this.$gettext('Apps'), to: 'applications-dashboard', icon: 'mdi-apps' },
            { title: this.$gettext('Policies'), to: 'policies-dashboard', icon: 'mdi-shield-half-full' } */
          ]
        },
        {
          icon: 'mdi-database-search',
          title: this.$gettext('Data'),
          options: [
            {
              title: this.$gettext('Computers'),
              to: 'computers-dashboard',
              icon: 'mdi-desktop-classic'
            },
            {
              title: this.$gettext('Computers Replacement'),
              to: 'computers-replacement',
              icon: 'mdi-compare-horizontal'
            },
            {
              title: this.$gettext('Users'),
              to: 'users-list',
              icon: 'mdi-account',
              separatorAfter: true
            },
            {
              title: this.$gettext('Attributes'),
              to: 'attributes-dashboard',
              icon: 'mdi-pound'
            },
            {
              title: this.$gettext('Tags'),
              to: 'tags-dashboard',
              icon: 'mdi-tag',
              separatorAfter: true
            },
            {
              title: this.$gettext('Synchronizations'),
              to: 'syncs-dashboard',
              icon: 'mdi-sync'
            },
            {
              title: this.$gettext('Errors'),
              to: 'errors-dashboard',
              icon: 'mdi-bug'
            },
            {
              title: this.$gettext('Faults'),
              to: 'faults-dashboard',
              icon: 'mdi-bomb'
            },
            {
              title: this.$gettext('Status Logs'),
              to: 'status-logs-dashboard',
              icon: 'mdi-flag-variant'
            },
            {
              title: this.$gettext('Migrations'),
              to: 'migrations-dashboard',
              icon: 'mdi-map-marker-right',
              separatorAfter: true
            }
            /* { title: this.$gettext('Messages'), to: 'messages-dashboard', icon: 'mdi-message-text' },
            { title: this.$gettext('Notifications'), to: 'notifications-dashboard', icon: 'mdi-android-messages' } */
          ]
        }
      ]
    }
  }
}
</script>
