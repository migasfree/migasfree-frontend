<template>
  <q-list class="menu-list">
    <template v-for="(item, index) in items" :key="index">
      <!-- Group Item (First Level) -->
      <q-expansion-item
        :icon="item.icon"
        :label="item.title"
        group="first-level"
        class="menu-group"
        header-class="text-weight-medium menu-group-header"
      >
        <template v-if="mini" #header>
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-tooltip
            anchor="center right"
            self="center left"
            :offset="[10, 10]"
          >
            {{ item.title }}
          </q-tooltip>
        </template>

        <q-list class="menu-sublist">
          <template v-for="option in item.options" :key="option.to">
            <q-separator v-if="option.separatorBefore" class="q-my-xs" />
            <q-item
              v-ripple
              clickable
              :to="{ name: option.to }"
              active-class="my-menu-link"
              class="q-pl-lg menu-subitem"
              :data-test="`menu-item-${option.to}`"
            >
              <q-item-section v-if="option.icon" avatar>
                <q-icon :name="option.icon" size="sm" color="inherit" />
              </q-item-section>
              <q-item-section>{{ option.title }}</q-item-section>

              <q-tooltip
                v-if="mini"
                anchor="center right"
                self="center left"
                :offset="[10, 10]"
              >
                {{ option.title }}
              </q-tooltip>
            </q-item>
            <q-separator v-if="option.separatorAfter" class="q-my-xs" />
          </template>
        </q-list>
      </q-expansion-item>
    </template>
  </q-list>
</template>

<script setup>
import { computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useAuthStore } from 'stores/auth'
import { appIcon, modelIcon } from 'composables/element'

defineProps({
  mini: {
    type: Boolean,
    default: false,
  },
})

const { $gettext } = useGettext()
const authStore = useAuthStore()

 
const items = computed(() => {
  let extraDevices = []

  if (authStore.user?.is_superuser) {
    extraDevices = [
      {
        title: $gettext('Connections'),
        to: 'connections-list',
        icon: modelIcon('devices/connections'),
        separatorBefore: true,
      },
      {
        title: $gettext('Device Types'),
        to: 'device-types-list',
        icon: modelIcon('devices/types'),
      },
      {
        title: $gettext('Logical Devices'),
        to: 'logical-devices-list',
        icon: modelIcon('devices/logical'),
      },
      {
        title: $gettext('Drivers'),
        to: 'drivers-list',
        icon: modelIcon('devices/drivers'),
      },
    ]
  }

  return [
    {
      icon: appIcon('configuration'),
      title: $gettext('Configuration'),
      options: [
        {
          title: $gettext('Platforms'),
          to: 'platforms-list',
          icon: modelIcon('platforms'),
        },
        {
          title: $gettext('Projects'),
          to: 'projects-list',
          icon: modelIcon('projects'),
          separatorAfter: true,
        },
        {
          title: $gettext('Formulas'),
          to: 'formulas-list',
          icon: modelIcon('formulas'),
        },
        {
          title: $gettext('Singularities'),
          to: 'singularities-list',
          icon: modelIcon('singularities'),
        },
        {
          title: $gettext('Stamps'),
          to: 'stamps-list',
          icon: modelIcon('stamps'),
        },
        {
          title: $gettext('Attribute Sets'),
          to: 'attribute-sets-list',
          icon: modelIcon('attribute-sets'),
        },
        {
          title: $gettext('Fault Definitions'),
          to: 'fault-definitions-list',
          icon: modelIcon('fault-definitions'),
          separatorAfter: true,
        },
        {
          title: $gettext('User Profiles'),
          to: 'user-profiles-list',
          icon: modelIcon('user-profiles'),
        },
        {
          title: $gettext('Groups'),
          to: 'groups-list',
          icon: modelIcon('accounts/groups'),
        },
        {
          title: $gettext('Domains'),
          to: 'domains-list',
          icon: modelIcon('domains'),
        },
        {
          title: $gettext('Scopes'),
          to: 'scopes-list',
          icon: modelIcon('scopes'),
        },
      ],
    },
    {
      icon: appIcon('devices'),
      title: $gettext('Devices'),
      options: [
        {
          title: $gettext('Manufacturers'),
          to: 'manufacturers-list',
          icon: modelIcon('devices/manufacturers'),
        },
        {
          title: $gettext('Models'),
          to: 'models-dashboard',
          icon: modelIcon('devices/models'),
        },
        {
          title: $gettext('Capabilities'),
          to: 'capabilities-list',
          icon: modelIcon('devices/capabilities'),
        },
        {
          title: $gettext('Devices'),
          to: 'devices-dashboard',
          icon: modelIcon('devices/devices'),
          separatorAfter: true,
        },
        {
          title: $gettext('Devices Replacement'),
          to: 'devices-replacement',
          icon: appIcon('replacement'),
        },
      ].concat(extraDevices),
    },
    {
      icon: appIcon('release'),
      title: $gettext('Release'),
      options: [
        {
          title: $gettext('Deployments'),
          to: 'deployments-dashboard',
          icon: modelIcon('deployments'),
        },
        {
          title: $gettext('Schedules'),
          to: 'schedules-list',
          icon: modelIcon('schedules'),
          separatorAfter: true,
        },
        {
          title: $gettext('Stores'),
          to: 'stores-dashboard',
          icon: modelIcon('stores'),
        },
        {
          title: $gettext('Packages'),
          to: 'packages-dashboard',
          icon: modelIcon('packages'),
        },
        {
          title: $gettext('Package Sets'),
          to: 'package-sets-list',
          icon: modelIcon('package-sets'),
          separatorAfter: true,
        },
        {
          title: $gettext('Applications'),
          to: 'apps-dashboard',
          icon: modelIcon('catalog/apps'),
        },
        {
          title: $gettext('Application Categories'),
          to: 'categories-list',
          icon: modelIcon('catalog/categories'),
        },
        {
          title: $gettext('Policies'),
          to: 'policies-list',
          icon: modelIcon('catalog/policies'),
        },
      ],
    },
    {
      icon: appIcon('data'),
      title: $gettext('Data'),
      options: [
        {
          title: $gettext('Computers'),
          to: 'computers-dashboard',
          icon: modelIcon('computers'),
        },
        {
          title: $gettext('Computers Replacement'),
          to: 'computers-replacement',
          icon: appIcon('replacement'),
        },
        {
          title: $gettext('Software Compare'),
          to: 'computers-software-compare',
          icon: appIcon('compare'),
        },
        {
          title: $gettext('Packages History'),
          to: 'packages-history-dashboard',
          icon: modelIcon('packages-history'),
        },
        {
          title: $gettext('Users'),
          to: 'users-list',
          icon: modelIcon('users'),
          separatorAfter: true,
        },
        {
          title: $gettext('Attributes'),
          to: 'attributes-dashboard',
          icon: modelIcon('attributes'),
        },
        {
          title: $gettext('Tags'),
          to: 'tags-dashboard',
          icon: modelIcon('tags'),
          separatorAfter: true,
        },
        {
          title: $gettext('Synchronizations'),
          to: 'syncs-dashboard',
          icon: modelIcon('syncs'),
        },
        {
          title: $gettext('Errors'),
          to: 'errors-dashboard',
          icon: modelIcon('errors'),
        },
        {
          title: $gettext('Faults'),
          to: 'faults-dashboard',
          icon: modelIcon('faults'),
        },
        {
          title: $gettext('Status Logs'),
          to: 'status-logs-dashboard',
          icon: modelIcon('status-logs'),
        },
        {
          title: $gettext('Migrations'),
          to: 'migrations-dashboard',
          icon: modelIcon('migrations'),
          separatorAfter: true,
        },
        {
          title: $gettext('Messages'),
          to: 'messages-list',
          icon: modelIcon('messages'),
        },
        {
          title: $gettext('Notifications'),
          to: 'notifications-dashboard',
          icon: modelIcon('notifications'),
        },
      ],
    },
  ]
})
</script>

<style scoped>
.my-menu-link {
  color: var(--brand-primary);
  background: rgba(81, 45, 10, 0.1);
  font-weight: 600;
}

[data-theme='dark'] .my-menu-link {
  color: var(--brand-primary);
  background: rgba(254, 252, 232, 0.15);
}

.menu-list {
  padding: 0;
}

.menu-group {
  margin: 0;
  border-bottom: 1px solid transparent;
}

:deep(.menu-group-header) {
  padding: 12px 16px;
  font-weight: 500;
  color: var(--text-main);
}

.menu-sublist {
  padding: 0;
  background: var(--bg-card-secondary, rgba(0, 0, 0, 0.02));
}

.menu-subitem {
  padding-top: 8px;
  padding-bottom: 8px;
  margin: 0;
  font-size: 0.9rem;
}
</style>
