const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('pages/Dashboard'),
      },

      {
        path: '/platforms',
        redirect: { name: 'platforms-list' },
      },
      {
        path: '/platforms/results',
        name: 'platforms-list',
        component: () => import('pages/platforms/results/list'),
      },
      {
        path: '/platforms/add',
        name: 'platform-add',
        component: () => import('pages/platforms/results/detail'),
      },
      {
        path: '/platforms/results/:id',
        name: 'platform-detail',
        component: () => import('pages/platforms/results/detail'),
      },

      {
        path: '/projects',
        redirect: { name: 'projects-list' },
      },
      {
        path: '/projects/results',
        name: 'projects-list',
        component: () => import('pages/projects/results/list'),
      },
      {
        path: '/projects/add',
        name: 'project-add',
        component: () => import('pages/projects/results/detail'),
      },
      {
        path: '/projects/results/:id',
        name: 'project-detail',
        component: () => import('pages/projects/results/detail'),
      },

      {
        path: '/formulas',
        redirect: { name: 'formulas-list' },
      },
      {
        path: '/formulas/results',
        name: 'formulas-list',
        component: () => import('pages/formulas/results/list'),
      },
      {
        path: '/formulas/add',
        name: 'formula-add',
        component: () => import('pages/formulas/results/detail'),
      },
      {
        path: '/formulas/results/:id',
        name: 'formula-detail',
        component: () => import('pages/formulas/results/detail'),
      },

      {
        path: '/singularities',
        redirect: { name: 'singularities-list' },
      },
      {
        path: '/singularities/results',
        name: 'singularities-list',
        component: () => import('pages/singularities/results/list'),
      },
      {
        path: '/singularities/add',
        name: 'singularity-add',
        component: () => import('pages/singularities/results/detail'),
      },
      {
        path: '/singularities/results/:id',
        name: 'singularity-detail',
        component: () => import('pages/singularities/results/detail'),
      },

      {
        path: '/stamps',
        redirect: { name: 'stamps-list' },
      },
      {
        path: '/stamps/results',
        name: 'stamps-list',
        component: () => import('pages/stamps/results/list'),
      },
      {
        path: '/stamps/add',
        name: 'stamp-add',
        component: () => import('pages/stamps/results/detail'),
      },
      {
        path: '/stamps/results/:id',
        name: 'stamp-detail',
        component: () => import('pages/stamps/results/detail'),
      },

      {
        path: '/attribute-sets',
        redirect: { name: 'attribute-sets-list' },
      },
      {
        path: '/attribute-sets/results',
        name: 'attribute-sets-list',
        component: () => import('pages/attribute-sets/results/list'),
      },
      {
        path: '/attribute-sets/add',
        name: 'attribute-set-add',
        component: () => import('pages/attribute-sets/results/detail'),
      },
      {
        path: '/attribute-sets/results/:id',
        name: 'attribute-set-detail',
        component: () => import('pages/attribute-sets/results/detail'),
      },

      {
        path: '/fault-definitions',
        redirect: { name: 'fault-definitions-list' },
      },
      {
        path: '/fault-definitions/results',
        name: 'fault-definitions-list',
        component: () => import('pages/fault-definitions/results/list'),
      },
      {
        path: '/fault-definitions/add',
        name: 'fault-definition-add',
        component: () => import('pages/fault-definitions/results/detail'),
      },
      {
        path: '/fault-definitions/results/:id',
        name: 'fault-definition-detail',
        component: () => import('pages/fault-definitions/results/detail'),
      },

      {
        path: '/user-profiles',
        redirect: { name: 'user-profiles-list' },
      },
      {
        path: '/user-profiles/results',
        name: 'user-profiles-list',
        component: () => import('pages/user-profiles/results/list'),
      },
      {
        path: '/user-profiles/add',
        name: 'user-profile-add',
        component: () => import('pages/user-profiles/results/detail'),
      },
      {
        path: '/user-profiles/results/:id',
        name: 'user-profile-detail',
        component: () => import('pages/user-profiles/results/detail'),
      },
      {
        path: '/user-profiles/results/:id/change-password',
        name: 'user-profile-change-password',
        component: () => import('pages/user-profiles/results/changePassword'),
      },

      {
        path: '/groups',
        redirect: { name: 'groups-list' },
      },
      {
        path: '/groups/results',
        name: 'groups-list',
        component: () => import('pages/groups/results/list'),
      },
      {
        path: '/groups/add',
        name: 'group-add',
        component: () => import('pages/groups/results/detail'),
      },
      {
        path: '/groups/results/:id',
        name: 'group-detail',
        component: () => import('pages/groups/results/detail'),
      },

      {
        path: '/domains',
        redirect: { name: 'domains-list' },
      },
      {
        path: '/domains/results',
        name: 'domains-list',
        component: () => import('pages/domains/results/list'),
      },
      {
        path: '/domains/add',
        name: 'domain-add',
        component: () => import('pages/domains/results/detail'),
      },
      {
        path: '/domains/results/:id',
        name: 'domain-detail',
        component: () => import('pages/domains/results/detail'),
      },

      {
        path: '/scopes',
        redirect: { name: 'scopes-list' },
      },
      {
        path: '/scopes/results',
        name: 'scopes-list',
        component: () => import('pages/scopes/results/list'),
      },
      {
        path: '/scopes/add',
        name: 'scope-add',
        component: () => import('pages/scopes/results/detail'),
      },
      {
        path: '/scopes/results/:id',
        name: 'scope-detail',
        component: () => import('pages/scopes/results/detail'),
      },

      {
        path: '/manufacturers',
        redirect: { name: 'manufacturers-list' },
      },
      {
        path: '/manufacturers/results',
        name: 'manufacturers-list',
        component: () => import('pages/manufacturers/results/list'),
      },
      {
        path: '/manufacturers/add',
        name: 'manufacturer-add',
        component: () => import('pages/manufacturers/results/detail'),
      },
      {
        path: '/manufacturers/results/:id',
        name: 'manufacturer-detail',
        component: () => import('pages/manufacturers/results/detail'),
      },

      {
        path: '/models',
        name: 'models-dashboard',
        component: () => import('pages/models/index'),
      },
      {
        path: '/models/results',
        name: 'models-list',
        component: () => import('pages/models/results/list'),
      },
      {
        path: '/models/add',
        name: 'model-add',
        component: () => import('pages/models/results/detail'),
      },
      {
        path: '/models/results/:id',
        name: 'model-detail',
        component: () => import('pages/models/results/detail'),
      },

      {
        path: '/capabilities',
        redirect: { name: 'capabilities-list' },
      },
      {
        path: '/capabilities/results',
        name: 'capabilities-list',
        component: () => import('pages/capabilities/results/list'),
      },
      {
        path: '/capabilities/add',
        name: 'capability-add',
        component: () => import('pages/capabilities/results/detail'),
      },
      {
        path: '/capabilities/results/:id',
        name: 'capability-detail',
        component: () => import('pages/capabilities/results/detail'),
      },

      {
        path: '/devices',
        name: 'devices-dashboard',
        component: () => import('pages/devices/index'),
      },
      {
        path: '/devices/results',
        name: 'devices-list',
        component: () => import('pages/devices/results/list'),
      },
      {
        path: '/devices/add',
        name: 'device-add',
        component: () => import('pages/devices/results/detail'),
      },
      {
        path: '/devices/results/:id',
        name: 'device-detail',
        component: () => import('pages/devices/results/detail'),
      },
      {
        path: '/devices/replacement',
        name: 'devices-replacement',
        component: () => import('pages/devices/replacement'),
      },

      {
        path: '/connections',
        redirect: { name: 'connections-list' },
      },
      {
        path: '/connections/results',
        name: 'connections-list',
        component: () => import('pages/connections/results/list'),
      },
      {
        path: '/connections/add',
        name: 'connection-add',
        component: () => import('pages/connections/results/detail'),
      },
      {
        path: '/connections/results/:id',
        name: 'connection-detail',
        component: () => import('pages/connections/results/detail'),
      },

      {
        path: '/device-types',
        redirect: { name: 'device-types-list' },
      },
      {
        path: '/device-types/results',
        name: 'device-types-list',
        component: () => import('pages/device-types/results/list'),
      },
      {
        path: '/device-types/add',
        name: 'device-type-add',
        component: () => import('pages/device-types/results/detail'),
      },
      {
        path: '/device-types/results/:id',
        name: 'device-type-detail',
        component: () => import('pages/device-types/results/detail'),
      },

      {
        path: '/logical-devices',
        redirect: { name: 'logical-devices-list' },
      },
      {
        path: '/logical-devices/results',
        name: 'logical-devices-list',
        component: () => import('pages/logical-devices/results/list'),
      },
      {
        path: '/logical-devices/add',
        name: 'logical-device-add',
        component: () => import('pages/logical-devices/results/detail'),
      },
      {
        path: '/logical-devices/results/:id',
        name: 'logical-device-detail',
        component: () => import('pages/logical-devices/results/detail'),
      },

      {
        path: '/drivers',
        redirect: { name: 'drivers-list' },
      },
      {
        path: '/drivers/results',
        name: 'drivers-list',
        component: () => import('pages/drivers/results/list'),
      },
      {
        path: '/driver/add',
        name: 'driver-add',
        component: () => import('pages/drivers/results/detail'),
      },
      {
        path: '/drivers/results/:id',
        name: 'driver-detail',
        component: () => import('pages/drivers/results/detail'),
      },

      {
        path: '/deployments',
        name: 'deployments-dashboard',
        component: () => import('pages/deployments/index'),
      },
      {
        path: '/deployments/results',
        name: 'deployments-list',
        component: () => import('pages/deployments/results/list'),
      },
      {
        path: '/deployments/add',
        name: 'deployment-add',
        component: () => import('pages/deployments/results/detail'),
      },
      {
        path: '/deployments/results/:id',
        name: 'deployment-detail',
        component: () => import('pages/deployments/results/detail'),
      },

      {
        path: '/schedules',
        redirect: { name: 'schedules-list' },
      },
      {
        path: '/schedules/results',
        name: 'schedules-list',
        component: () => import('pages/schedules/results/list'),
      },
      {
        path: '/schedules/add',
        name: 'schedule-add',
        component: () => import('pages/schedules/results/detail'),
      },
      {
        path: '/schedules/results/:id',
        name: 'schedule-detail',
        component: () => import('pages/schedules/results/detail'),
      },

      {
        path: '/stores',
        name: 'stores-dashboard',
        component: () => import('pages/stores/index'),
      },
      {
        path: '/stores/results',
        name: 'stores-list',
        component: () => import('pages/stores/results/list'),
      },
      {
        path: '/stores/add',
        name: 'store-add',
        component: () => import('pages/stores/results/detail'),
      },
      {
        path: '/stores/results/:id',
        name: 'store-detail',
        component: () => import('pages/stores/results/detail'),
      },

      {
        path: '/packages',
        name: 'packages-dashboard',
        component: () => import('pages/packages/index'),
      },
      {
        path: '/packages/results',
        name: 'packages-list',
        component: () => import('pages/packages/results/list'),
      },
      {
        path: '/packages/add',
        name: 'package-add',
        component: () => import('pages/packages/results/detail'),
      },
      {
        path: '/packages/results/:id',
        name: 'package-detail',
        component: () => import('pages/packages/results/detail'),
      },
      {
        path: '/packages/results/:id/information',
        name: 'package-information',
        component: () => import('pages/packages/results/information'),
      },

      {
        path: '/package-sets',
        redirect: { name: 'package-sets-list' },
      },
      {
        path: '/package-sets/results',
        name: 'package-sets-list',
        component: () => import('pages/package-sets/results/list'),
      },
      {
        path: '/package-sets/add',
        name: 'package-set-add',
        component: () => import('pages/package-sets/results/detail'),
      },
      {
        path: '/package-sets/results/:id',
        name: 'package-set-detail',
        component: () => import('pages/package-sets/results/detail'),
      },

      {
        path: '/applications',
        name: 'apps-dashboard',
        component: () => import('pages/applications/index'),
      },
      {
        path: '/applications/results',
        name: 'apps-list',
        component: () => import('pages/applications/results/list'),
      },
      {
        path: '/applications/add',
        name: 'app-add',
        component: () => import('pages/applications/results/detail'),
      },
      {
        path: '/applications/results/:id',
        name: 'app-detail',
        component: () => import('pages/applications/results/detail'),
      },

      {
        path: '/categories',
        redirect: { name: 'categories-list' },
      },
      {
        path: '/categories/results',
        name: 'categories-list',
        component: () => import('pages/categories/results/list'),
      },
      {
        path: '/categories/add',
        name: 'category-add',
        component: () => import('pages/categories/results/detail'),
      },
      {
        path: '/categories/results/:id',
        name: 'category-detail',
        component: () => import('pages/categories/results/detail'),
      },

      {
        path: '/policies',
        redirect: { name: 'policies-list' },
      },
      {
        path: '/policies/results',
        name: 'policies-list',
        component: () => import('pages/policies/results/list'),
      },
      {
        path: '/policies/add',
        name: 'policy-add',
        component: () => import('pages/policies/results/detail'),
      },
      {
        path: '/policies/results/:id',
        name: 'policy-detail',
        component: () => import('pages/policies/results/detail'),
      },

      {
        path: '/computers',
        name: 'computers-dashboard',
        component: () => import('pages/computers/index'),
      },
      {
        path: '/computers/results',
        name: 'computers-list',
        component: () => import('pages/computers/results/list'),
      },
      {
        path: '/computers/results/:id',
        name: 'computer-detail',
        component: () => import('pages/computers/results/detail'),
      },
      {
        path: '/computers/results/:id/events',
        name: 'computer-events',
        component: () => import('pages/computers/results/events'),
      },
      {
        path: '/computers/results/:id/sync/simulation',
        name: 'computer-simulate',
        component: () => import('pages/computers/results/simulate'),
      },
      {
        path: '/computers/results/:id/hardware',
        name: 'computer-hardware',
        component: () => import('pages/computers/results/hardware'),
      },
      {
        path: '/computers/replacement',
        name: 'computers-replacement',
        component: () => import('pages/computers/replacement'),
      },
      {
        path: '/computers/software-compare',
        name: 'computers-software-compare',
        component: () => import('pages/computers/softwareCompare'),
      },
      {
        path: '/computers/results/:id/label',
        name: 'computer-label',
        component: () => import('pages/computers/results/label.vue'),
      },

      {
        path: '/packages-history',
        name: 'packages-history-dashboard',
        component: () => import('pages/packages-history/index'),
      },
      {
        path: '/packages-history/results',
        name: 'packages-history-list',
        component: () => import('pages/packages-history/results/list'),
      },

      {
        path: '/users',
        redirect: { name: 'users-list' },
      },
      {
        path: '/users/results',
        name: 'users-list',
        component: () => import('pages/users/results/list'),
      },
      {
        path: '/users/results/:id',
        name: 'user-detail',
        component: () => import('pages/users/results/detail'),
      },

      {
        path: '/features',
        name: 'attributes-dashboard',
        component: () => import('pages/attributes/index'),
      },
      {
        path: '/features',
        name: 'features-dashboard',
        component: () => import('pages/attributes/index'),
      },
      {
        path: '/features/results',
        name: 'attributes-list',
        component: () => import('pages/attributes/results/list'),
      },
      {
        path: '/features/results',
        name: 'features-list',
        component: () => import('pages/attributes/results/list'),
      },
      {
        path: '/features/results/:id',
        name: 'attribute-detail',
        component: () => import('pages/attributes/results/detail'),
      },
      {
        path: '/features/results/:id',
        name: 'feature-detail',
        component: () => import('pages/attributes/results/detail'),
      },

      {
        path: '/tags',
        name: 'tags-dashboard',
        component: () => import('pages/tags/index'),
      },
      {
        path: '/tags/results',
        name: 'tags-list',
        component: () => import('pages/tags/results/list'),
      },
      {
        path: '/tags/add',
        name: 'tag-add',
        component: () => import('pages/tags/results/detail'),
      },
      {
        path: '/tags/results/:id',
        name: 'tag-detail',
        component: () => import('pages/tags/results/detail'),
      },

      {
        path: '/syncs',
        name: 'syncs-dashboard',
        component: () => import('pages/syncs/index'),
      },
      {
        path: '/syncs',
        redirect: { name: 'syncs-list' },
      },
      {
        path: '/syncs/results',
        name: 'syncs-list',
        component: () => import('pages/syncs/results/list'),
      },

      {
        path: '/errors',
        name: 'errors-dashboard',
        component: () => import('pages/errors/index'),
      },
      {
        path: '/errors',
        redirect: { name: 'errors-list' },
      },
      {
        path: '/errors/results',
        name: 'errors-list',
        component: () => import('pages/errors/results/list'),
      },
      {
        path: '/errors/results/:id',
        name: 'error-detail',
        component: () => import('pages/errors/results/detail'),
      },

      {
        path: '/faults',
        name: 'faults-dashboard',
        component: () => import('pages/faults/index'),
      },
      {
        path: '/faults',
        redirect: { name: 'faults-list' },
      },
      {
        path: '/faults/results',
        name: 'faults-list',
        component: () => import('pages/faults/results/list'),
      },
      {
        path: '/faults/results/:id',
        name: 'fault-detail',
        component: () => import('pages/faults/results/detail'),
      },

      {
        path: '/status-logs',
        name: 'status-logs-dashboard',
        component: () => import('pages/status-logs/index'),
      },
      {
        path: '/status-logs',
        redirect: { name: 'status-logs-list' },
      },
      {
        path: '/status-logs/results',
        name: 'status-logs-list',
        component: () => import('pages/status-logs/results/list'),
      },

      {
        path: '/migrations',
        name: 'migrations-dashboard',
        component: () => import('pages/migrations/index'),
      },
      {
        path: '/migrations',
        redirect: { name: 'migrations-list' },
      },
      {
        path: '/migrations/results',
        name: 'migrations-list',
        component: () => import('pages/migrations/results/list'),
      },

      {
        path: '/messages',
        redirect: { name: 'messages-list' },
      },
      {
        path: '/messages/results',
        name: 'messages-list',
        component: () => import('pages/messages/results/list'),
      },

      {
        path: '/notifications',
        name: 'notifications-dashboard',
        component: () => import('pages/notifications/index'),
      },
      {
        path: '/notifications',
        redirect: { name: 'notifications-list' },
      },
      {
        path: '/notifications/results',
        name: 'notifications-list',
        component: () => import('pages/notifications/results/list'),
      },
    ],
    meta: { authRequired: true },
  },

  {
    path: '/login',
    component: () => import('layouts/Empty.vue'),
    children: [
      { path: '', name: 'login', component: () => import('pages/Login.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    name: 'not-found',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
